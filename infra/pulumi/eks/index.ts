import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


const projectName = "mybookstore";
const baseTags = { Project: projectName, ManagedBy: "pulumi" };

const config = new pulumi.Config();
const clusterName = config.get("clusterName") || "mybookstore";
const networkStackName = config.get("networkStackName") || "mybookstore-network/dev";
const nodeInstanceType = config.get("nodeInstanceType") || "t3.medium";
const desiredNodes = config.getNumber("desiredNodes") ?? 2;
const minNodes = config.getNumber("minNodes") ?? 1;
const maxNodes = config.getNumber("maxNodes") ?? 3;
const labRoleName = config.get("labRoleName") || "LabRole";

const networkStack = new pulumi.StackReference(networkStackName);
const vpcId = networkStack.getOutput("vpcId") as pulumi.Output<string>;
const publicSubnetIds = networkStack.getOutput("publicSubnetIds") as pulumi.Output<string[]>;
const privateSubnetIds = networkStack.getOutput("privateSubnetIds") as pulumi.Output<string[]>;


const labRole = aws.iam.getRoleOutput({ name: labRoleName });



const clusterSg = new aws.ec2.SecurityGroup(`${projectName}-eks-cluster-sg`, {
  name: `${projectName}-eks-cluster-sg`,
  description: "EKS cluster security group (control plane)",
  vpcId: vpcId,
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
  tags: { ...baseTags, Name: `${projectName}-eks-cluster-sg` },
});


const allSubnetIds = pulumi
  .all([publicSubnetIds, privateSubnetIds])
  .apply(([pub, priv]) => [...pub, ...priv]);

const cluster = new aws.eks.Cluster(clusterName, {
  name: clusterName,
  version: "1.30",
  roleArn: labRole.arn,
  vpcConfig: {
    subnetIds: allSubnetIds,
    securityGroupIds: [clusterSg.id],
    endpointPublicAccess: true,
    endpointPrivateAccess: true,
  },
  tags: { ...baseTags, Name: clusterName },
});



const nodeGroup = new aws.eks.NodeGroup(`${projectName}-nodegroup`, {
  clusterName: cluster.name,
  nodeGroupName: `${projectName}-nodegroup`,
  nodeRoleArn: labRole.arn,
  subnetIds: privateSubnetIds,
  instanceTypes: [nodeInstanceType],
  amiType: "AL2_x86_64",
  capacityType: "ON_DEMAND",
  diskSize: 30,
  scalingConfig: {
    desiredSize: desiredNodes,
    minSize: minNodes,
    maxSize: maxNodes,
  },
  updateConfig: { maxUnavailable: 1 },
  tags: { ...baseTags, Name: `${projectName}-nodegroup` },
});


export const eksClusterName = cluster.name;
export const eksClusterArn = cluster.arn;
export const eksClusterEndpoint = cluster.endpoint;
export const eksClusterCaData = cluster.certificateAuthority.apply((c) => c.data);
export const eksClusterSgId = cluster.vpcConfig.clusterSecurityGroupId;
export const eksClusterVersion = cluster.version;
export const eksNodeGroupArn = nodeGroup.arn;
export const eksOidcIssuer = cluster.identities.apply((i) => i[0]?.oidcs?.[0]?.issuer);

export const kubeconfig = pulumi
  .all([cluster.endpoint, cluster.certificateAuthority, cluster.name])
  .apply(([endpoint, ca, name]) => {
    return JSON.stringify({
      apiVersion: "v1",
      kind: "Config",
      clusters: [{
        name: "kubernetes",
        cluster: {
          server: endpoint,
          "certificate-authority-data": ca.data,
        },
      }],
      contexts: [{
        name: "aws",
        context: { cluster: "kubernetes", user: "aws" },
      }],
      "current-context": "aws",
      users: [{
        name: "aws",
        user: {
          exec: {
            apiVersion: "client.authentication.k8s.io/v1beta1",
            command: "aws",
            args: ["eks", "get-token", "--cluster-name", name],
          },
        },
      }],
    });
  });
