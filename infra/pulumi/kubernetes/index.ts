import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as aws from "@pulumi/aws";

import { services } from "./services";
import { nginxConf } from "./nginx-conf";
import { readAwsProfile } from "./aws-creds";


const projectName = "mybookstore";
const namespaceName = "mybookstore";
const baseTags = { Project: projectName, ManagedBy: "pulumi" };

const config = new pulumi.Config();
const eksStackName = config.get("eksStackName") || "mybookstore-eks/dev";
const ecrStackName = config.get("ecrStackName") || "mybookstore-ecr/dev";
const dataStackName = config.get("dataStackName") || "mybookstore-data/dev";
const jwtSecret = config.requireSecret("jwtSecret");
const imageTag = config.get("imageTag") || "latest";

const eksStack = new pulumi.StackReference(eksStackName);
const ecrStack = new pulumi.StackReference(ecrStackName);
const dataStack = new pulumi.StackReference(dataStackName);

const kubeconfig = eksStack.getOutput("kubeconfig") as pulumi.Output<string>;
const ecrRegistry = ecrStack.getOutput("ecrRegistry") as pulumi.Output<string>;

const authDatabaseUrl = dataStack.getOutput("authDatabaseUrl") as pulumi.Output<string>;
const usersDatabaseUrl = dataStack.getOutput("usersDatabaseUrl") as pulumi.Output<string>;
const booksTableName = dataStack.getOutput("booksTableName") as pulumi.Output<string>;
const reviewsTableName = dataStack.getOutput("reviewsTableName") as pulumi.Output<string>;
const cartsTableName = dataStack.getOutput("cartsTableName") as pulumi.Output<string>;
const ordersTableName = dataStack.getOutput("ordersTableName") as pulumi.Output<string>;



const awsProvider = new aws.Provider("aws-provider", {});
const awsCreds = aws.getCallerIdentityOutput({}, { provider: awsProvider });




const k8sProvider = new k8s.Provider("eks-provider", {
  kubeconfig: kubeconfig,
});


const ns = new k8s.core.v1.Namespace(
  "ns",
  { metadata: { name: namespaceName } },
  { provider: k8sProvider }
);





const appConfig = new k8s.core.v1.ConfigMap(
  "app-config",
  {
    metadata: { name: "app-config", namespace: namespaceName },
    data: {
      AWS_REGION: "us-east-1",
      BOOKS_TABLE: booksTableName,
      REVIEWS_TABLE: reviewsTableName,
      CARTS_TABLE: cartsTableName,
      ORDERS_TABLE: ordersTableName,
      CATALOG_GRPC_URL: "catalog-service:50053",
      USERS_GRPC_URL: "users-service:50052",
      CART_GRPC_URL: "cart-service:50055",
    },
  },
  { provider: k8sProvider, dependsOn: [ns] }
);


const appSecrets = new k8s.core.v1.Secret(
  "app-secrets",
  {
    metadata: { name: "app-secrets", namespace: namespaceName },
    type: "Opaque",
    stringData: {
      JWT_SECRET: jwtSecret,
      AUTH_DATABASE_URL: authDatabaseUrl,
      USERS_DATABASE_URL: usersDatabaseUrl,
    },
  },
  { provider: k8sProvider, dependsOn: [ns] }
);





const awsProfileName = config.get("awsProfile") || "default";
const sharedAwsCreds = readAwsProfile(awsProfileName);


const awsCredsSecret = new k8s.core.v1.Secret(
  "aws-credentials",
  {
    metadata: { name: "aws-credentials", namespace: namespaceName },
    type: "Opaque",
    stringData: {
      AWS_ACCESS_KEY_ID: sharedAwsCreds.accessKeyId,
      AWS_SECRET_ACCESS_KEY: sharedAwsCreds.secretAccessKey,
      AWS_SESSION_TOKEN: sharedAwsCreds.sessionToken || "",
    },
  },
  { provider: k8sProvider, dependsOn: [ns] }
);


const nginxConfigMap = new k8s.core.v1.ConfigMap(
  "nginx-config",
  {
    metadata: { name: "nginx-config", namespace: namespaceName },
    data: { "nginx.conf": nginxConf },
  },
  { provider: k8sProvider, dependsOn: [ns] }
);


for (const svc of services) {
  const envVars: k8s.types.input.core.v1.EnvVar[] = [
    { name: "HTTP_PORT", value: String(svc.httpPort) },
    { name: "NODE_ENV", value: "production" },
  ];

  if (svc.grpcPort) {
    envVars.push({ name: "GRPC_PORT", value: String(svc.grpcPort) });
  }

  for (const key of svc.configMapKeys) {
    envVars.push({
      name: key,
      valueFrom: { configMapKeyRef: { name: "app-config", key } },
    });
  }

  for (const sk of svc.secretKeysFromAppSecrets) {
    envVars.push({
      name: sk.envVar,
      valueFrom: { secretKeyRef: { name: "app-secrets", key: sk.secretKey } },
    });
  }

  if (svc.needsAws) {
    for (const k of ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN"]) {
      envVars.push({
        name: k,
        valueFrom: { secretKeyRef: { name: "aws-credentials", key: k } },
      });
    }
  }

  const containerPorts: k8s.types.input.core.v1.ContainerPort[] = [
    { name: "http", containerPort: svc.httpPort },
  ];
  if (svc.grpcPort) {
    containerPorts.push({ name: "grpc", containerPort: svc.grpcPort });
  }

  const imageName = pulumi.interpolate`${ecrRegistry}/${projectName}/${svc.name}:${imageTag}`;

  new k8s.apps.v1.Deployment(
    `${svc.name}-deploy`,
    {
      metadata: { name: svc.name, namespace: namespaceName },
      spec: {
        replicas: 2,
        selector: { matchLabels: { app: svc.name } },
        template: {
          metadata: { labels: { app: svc.name } },
          spec: {
            containers: [
              {
                name: svc.name,
                image: imageName,
                ports: containerPorts,
                env: envVars,
                readinessProbe: {
                  httpGet: { path: "/health", port: svc.httpPort },
                  initialDelaySeconds: 5,
                  periodSeconds: 10,
                },
                resources: {
                  requests: { cpu: "100m", memory: "128Mi" },
                  limits: { cpu: "500m", memory: "256Mi" },
                },
              },
            ],
          },
        },
      },
    },
    { provider: k8sProvider, dependsOn: [ns, appConfig, appSecrets, awsCredsSecret] }
  );

  const svcPorts: k8s.types.input.core.v1.ServicePort[] = [
    { name: "http", port: svc.httpPort, targetPort: svc.httpPort },
  ];
  if (svc.grpcPort) {
    svcPorts.push({ name: "grpc", port: svc.grpcPort, targetPort: svc.grpcPort });
  }

  new k8s.core.v1.Service(
    `${svc.name}-svc`,
    {
      metadata: { name: svc.name, namespace: namespaceName },
      spec: {
        type: "ClusterIP",
        selector: { app: svc.name },
        ports: svcPorts,
      },
    },
    { provider: k8sProvider, dependsOn: [ns] }
  );
}


new k8s.apps.v1.Deployment(
  "nginx-deploy",
  {
    metadata: { name: "nginx", namespace: namespaceName },
    spec: {
      replicas: 1,
      selector: { matchLabels: { app: "nginx" } },
      template: {
        metadata: { labels: { app: "nginx" } },
        spec: {
          containers: [
            {
              name: "nginx",
              image: "nginx:1.27-alpine",
              ports: [{ containerPort: 80 }],
              volumeMounts: [
                {
                  name: "config",
                  mountPath: "/etc/nginx/nginx.conf",
                  subPath: "nginx.conf",
                },
              ],
              resources: {
                requests: { cpu: "50m", memory: "64Mi" },
                limits: { cpu: "200m", memory: "128Mi" },
              },
            },
          ],
          volumes: [{ name: "config", configMap: { name: "nginx-config" } }],
        },
      },
    },
  },
  { provider: k8sProvider, dependsOn: [ns, nginxConfigMap] }
);





const nginxService = new k8s.core.v1.Service(
  "nginx-svc",
  {
    metadata: {
      name: "nginx",
      namespace: namespaceName,
      annotations: {
        "service.beta.kubernetes.io/aws-load-balancer-type": "nlb",
        "service.beta.kubernetes.io/aws-load-balancer-scheme": "internal",
        "service.beta.kubernetes.io/aws-load-balancer-nlb-target-type": "instance",
      },
    },
    spec: {
      type: "LoadBalancer",
      selector: { app: "nginx" },
      ports: [{ name: "http", port: 80, targetPort: 80 }],
    },
  },
  { provider: k8sProvider, dependsOn: [ns] }
);



export const namespace = ns.metadata.name;

export const nlbHostname = nginxService.status.apply(
  (s) => s?.loadBalancer?.ingress?.[0]?.hostname ?? ""
);


export const nlbName = nginxService.status.apply((s) => {
  const hostname = s?.loadBalancer?.ingress?.[0]?.hostname ?? "";
  const namePart = hostname.split("-")[0] || "";
  return namePart;
});
