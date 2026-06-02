import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


const projectName = "mybookstore";
const baseTags = { Project: projectName, ManagedBy: "pulumi" };

const vpcCidr = "172.16.0.0/16";

const azA = "us-east-1a";
const azB = "us-east-1b";

const publicCidr1 = "172.16.1.0/24";
const privateCidr1 = "172.16.2.0/24";
const publicCidr2 = "172.16.3.0/24";
const privateCidr2 = "172.16.4.0/24";


const vpc = new aws.ec2.Vpc(`${projectName}-vpc`, {
  cidrBlock: vpcCidr,
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: { ...baseTags, Name: `${projectName}-vpc` },
});


const igw = new aws.ec2.InternetGateway(`${projectName}-igw`, {
  vpcId: vpc.id,
  tags: { ...baseTags, Name: `${projectName}-igw` },
});


const publicSubnet1 = new aws.ec2.Subnet(`${projectName}-subnet-public1`, {
  vpcId: vpc.id,
  cidrBlock: publicCidr1,
  availabilityZone: azA,
  mapPublicIpOnLaunch: true,
  tags: {
    ...baseTags,
    Name: `${projectName}-subnet-public1-${azA}`,
    "kubernetes.io/role/elb": "1",
  },
});

const publicSubnet2 = new aws.ec2.Subnet(`${projectName}-subnet-public2`, {
  vpcId: vpc.id,
  cidrBlock: publicCidr2,
  availabilityZone: azB,
  mapPublicIpOnLaunch: true,
  tags: {
    ...baseTags,
    Name: `${projectName}-subnet-public2-${azB}`,
    "kubernetes.io/role/elb": "1",
  },
});

const privateSubnet1 = new aws.ec2.Subnet(`${projectName}-subnet-private1`, {
  vpcId: vpc.id,
  cidrBlock: privateCidr1,
  availabilityZone: azA,
  tags: {
    ...baseTags,
    Name: `${projectName}-subnet-private1-${azA}`,
    "kubernetes.io/role/internal-elb": "1",
  },
});

const privateSubnet2 = new aws.ec2.Subnet(`${projectName}-subnet-private2`, {
  vpcId: vpc.id,
  cidrBlock: privateCidr2,
  availabilityZone: azB,
  tags: {
    ...baseTags,
    Name: `${projectName}-subnet-private2-${azB}`,
    "kubernetes.io/role/internal-elb": "1",
  },
});

const natEip = new aws.ec2.Eip(`${projectName}-nat-eip`, {
  domain: "vpc",
  tags: { ...baseTags, Name: `${projectName}-nat-eip` },
}, { dependsOn: [igw] });

const natGateway = new aws.ec2.NatGateway(`${projectName}-nat`, {
  allocationId: natEip.id,
  subnetId: publicSubnet1.id,
  tags: { ...baseTags, Name: `${projectName}-nat` },
}, { dependsOn: [igw] });


const publicRouteTable = new aws.ec2.RouteTable(`${projectName}-rt-public`, {
  vpcId: vpc.id,
  routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: igw.id }],
  tags: { ...baseTags, Name: `${projectName}-rt-public` },
});

new aws.ec2.RouteTableAssociation(`${projectName}-rta-public1`, {
  subnetId: publicSubnet1.id,
  routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${projectName}-rta-public2`, {
  subnetId: publicSubnet2.id,
  routeTableId: publicRouteTable.id,
});


const privateRouteTable = new aws.ec2.RouteTable(`${projectName}-rt-private`, {
  vpcId: vpc.id,
  routes: [{ cidrBlock: "0.0.0.0/0", natGatewayId: natGateway.id }],
  tags: { ...baseTags, Name: `${projectName}-rt-private` },
});

new aws.ec2.RouteTableAssociation(`${projectName}-rta-private1`, {
  subnetId: privateSubnet1.id,
  routeTableId: privateRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${projectName}-rta-private2`, {
  subnetId: privateSubnet2.id,
  routeTableId: privateRouteTable.id,
});


export const vpcId = vpc.id;
export const vpcCidrBlock = vpc.cidrBlock;
export const publicSubnetIds = [publicSubnet1.id, publicSubnet2.id];
export const privateSubnetIds = [privateSubnet1.id, privateSubnet2.id];
export const availabilityZones = [azA, azB];
export const internetGatewayId = igw.id;
export const natGatewayId = natGateway.id;