import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const projectName = "mybookstore";
const baseTags = { Project: projectName, ManagedBy: "pulumi" };

const config = new pulumi.Config();
const networkStackName = config.get("networkStackName") || "mybookstore-network/dev";
const eksStackName = config.get("eksStackName") || "mybookstore-eks/dev";
const k8sStackName = config.get("k8sStackName") || "mybookstore-k8s-apps/dev";
const lambdasStackName = config.get("lambdasStackName") || "mybookstore-lambdas/dev";
const stageName = config.get("stageName") || "$default";

const networkStack = new pulumi.StackReference(networkStackName);
const eksStack = new pulumi.StackReference(eksStackName);
const k8sStack = new pulumi.StackReference(k8sStackName);
const lambdasStack = new pulumi.StackReference(lambdasStackName);

const vpcId = networkStack.getOutput("vpcId") as pulumi.Output<string>;
const privateSubnetIds = networkStack.getOutput("privateSubnetIds") as pulumi.Output<string[]>;
const eksClusterSgId = eksStack.getOutput("eksClusterSgId") as pulumi.Output<string>;
const nlbHostname = k8sStack.getOutput("nlbHostname") as pulumi.Output<string>;
const nlbName = k8sStack.getOutput("nlbName") as pulumi.Output<string>;

const nlbLookup = aws.lb.getLoadBalancerOutput({ name: nlbName });
const nlbListener = aws.lb.getListenerOutput({
  loadBalancerArn: nlbLookup.arn,
  port: 80,
});

const searchBooksInvokeArn = lambdasStack.getOutput("searchBooksInvokeArn") as pulumi.Output<string>;
const wishlistInvokeArn = lambdasStack.getOutput("wishlistInvokeArn") as pulumi.Output<string>;
const searchBooksFunctionName = lambdasStack.getOutput("searchBooksFunctionName") as pulumi.Output<string>;
const wishlistFunctionName = lambdasStack.getOutput("wishlistFunctionName") as pulumi.Output<string>;

const vpcLinkSg = new aws.ec2.SecurityGroup(`${projectName}-vpclink-sg`, {
  name: `${projectName}-vpclink-sg`,
  description: "SG para el VPC Link del API Gateway (acceso al NLB del NGINX)",
  vpcId: vpcId,
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
  tags: { ...baseTags, Name: `${projectName}-vpclink-sg` },
});


new aws.ec2.SecurityGroupRule(`${projectName}-eks-from-vpclink`, {
  type: "ingress",
  securityGroupId: eksClusterSgId,
  sourceSecurityGroupId: vpcLinkSg.id,
  protocol: "tcp",
  fromPort: 0,
  toPort: 65535,
  description: "Permitir trafico desde el VPC Link de API Gateway hacia los nodos EKS (NLB target)",
});


const vpcLink = new aws.apigatewayv2.VpcLink(`${projectName}-vpc-link`, {
  name: `${projectName}-vpc-link`,
  subnetIds: privateSubnetIds,
  securityGroupIds: [vpcLinkSg.id],
  tags: { ...baseTags, Name: `${projectName}-vpc-link` },
});



const api = new aws.apigatewayv2.Api(`${projectName}-http-api`, {
  name: `${projectName}-http-api`,
  protocolType: "HTTP",
  description: "Punto de entrada unico de MyBookStore. Rutea a Lambdas y al cluster EKS via VPC Link.",
  corsConfiguration: {
    allowOrigins: ["*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Authorization", "Content-Type"],
    maxAge: 86400,
  },
  tags: { ...baseTags, Name: `${projectName}-http-api` },
});




const searchIntegration = new aws.apigatewayv2.Integration(`${projectName}-int-search`, {
  apiId: api.id,
  integrationType: "AWS_PROXY",
  integrationUri: searchBooksInvokeArn,
  integrationMethod: "POST",
  payloadFormatVersion: "2.0",
});

const wishlistIntegration = new aws.apigatewayv2.Integration(`${projectName}-int-wishlist`, {
  apiId: api.id,
  integrationType: "AWS_PROXY",
  integrationUri: wishlistInvokeArn,
  integrationMethod: "POST",
  payloadFormatVersion: "2.0",
});


new aws.lambda.Permission(`${projectName}-perm-search`, {
  action: "lambda:InvokeFunction",
  function: searchBooksFunctionName,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
});

new aws.lambda.Permission(`${projectName}-perm-wishlist`, {
  action: "lambda:InvokeFunction",
  function: wishlistFunctionName,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
});




const nlbIntegration = new aws.apigatewayv2.Integration(`${projectName}-int-nlb`, {
  apiId: api.id,
  integrationType: "HTTP_PROXY",
  integrationMethod: "ANY",
  connectionType: "VPC_LINK",
  connectionId: vpcLink.id,



  integrationUri: nlbListener.arn,

  payloadFormatVersion: "1.0",
});





new aws.apigatewayv2.Route(`${projectName}-route-search`, {
  apiId: api.id,
  routeKey: "GET /api/search",
  target: pulumi.interpolate`integrations/${searchIntegration.id}`,
});

new aws.apigatewayv2.Route(`${projectName}-route-wishlist-get`, {
  apiId: api.id,
  routeKey: "GET /api/wishlist",
  target: pulumi.interpolate`integrations/${wishlistIntegration.id}`,
});

new aws.apigatewayv2.Route(`${projectName}-route-wishlist-post`, {
  apiId: api.id,
  routeKey: "POST /api/wishlist",
  target: pulumi.interpolate`integrations/${wishlistIntegration.id}`,
});

new aws.apigatewayv2.Route(`${projectName}-route-wishlist-delete`, {
  apiId: api.id,
  routeKey: "DELETE /api/wishlist/{bookId}",
  target: pulumi.interpolate`integrations/${wishlistIntegration.id}`,
});


const eksPaths = ["auth", "users", "books", "reviews", "cart", "orders"];

for (const p of eksPaths) {

  new aws.apigatewayv2.Route(`${projectName}-route-${p}`, {
    apiId: api.id,
    routeKey: `ANY /api/${p}/{proxy+}`,
    target: pulumi.interpolate`integrations/${nlbIntegration.id}`,
  });


  new aws.apigatewayv2.Route(`${projectName}-route-${p}-root`, {
    apiId: api.id,
    routeKey: `ANY /api/${p}`,
    target: pulumi.interpolate`integrations/${nlbIntegration.id}`,
  });
}



const stage = new aws.apigatewayv2.Stage(`${projectName}-stage`, {
  apiId: api.id,
  name: stageName,
  autoDeploy: true,
  tags: { ...baseTags, Name: `${projectName}-stage` },
});


export const apiId = api.id;
export const apiEndpoint = api.apiEndpoint;
export const apiInvokeUrl = stageName === "$default" ? api.apiEndpoint : pulumi.interpolate`${api.apiEndpoint}/${stageName}`;
export const vpcLinkId = vpcLink.id;
export const vpcLinkSecurityGroupId = vpcLinkSg.id;
