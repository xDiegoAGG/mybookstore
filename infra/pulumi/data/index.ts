import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


const projectName = "mybookstore";
const baseTags = { Project: projectName, ManagedBy: "pulumi" };

const config = new pulumi.Config();
const networkStackName = config.get("networkStackName") || "mybookstore-network/dev";
const dbUser = config.get("dbMasterUsername") || "bookstore";
const dbPassword = config.requireSecret("dbMasterPassword");

const networkStack = new pulumi.StackReference(networkStackName);
const vpcId = networkStack.getOutput("vpcId") as pulumi.Output<string>;
const vpcCidr = networkStack.getOutput("vpcCidrBlock") as pulumi.Output<string>;
const privateSubnetIds = networkStack.getOutput("privateSubnetIds") as pulumi.Output<string[]>;


const sgRds = new aws.ec2.SecurityGroup(`${projectName}-sg-rds`, {
  name: `${projectName}-sgRDS`,
  description: "Allow PostgreSQL inbound from inside the VPC (EKS nodes)",
  vpcId: vpcId,
  ingress: [
    {
      description: "PostgreSQL from VPC CIDR",
      protocol: "tcp",
      fromPort: 5432,
      toPort: 5432,
      cidrBlocks: [vpcCidr],
    },
  ],
  egress: [
    {
      description: "All outbound",
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: { ...baseTags, Name: `${projectName}-sgRDS` },
});


const dbSubnetGroup = new aws.rds.SubnetGroup(`${projectName}-db-subnets`, {
  name: `${projectName}-db-subnets`,
  subnetIds: privateSubnetIds,
  description: "Private subnets for RDS instances",
  tags: { ...baseTags, Name: `${projectName}-db-subnets` },
});

function buildPostgres(instanceKey: string, dbName: string): aws.rds.Instance {
  return new aws.rds.Instance(`${projectName}-${instanceKey}`, {
    identifier: `${projectName}-${instanceKey}`,
    engine: "postgres",
    engineVersion: "16.14",
    instanceClass: "db.t3.micro",
    allocatedStorage: 20,
    storageType: "gp3",
    dbName: dbName,
    username: dbUser,
    password: dbPassword,
    dbSubnetGroupName: dbSubnetGroup.name,
    vpcSecurityGroupIds: [sgRds.id],
    multiAz: false,
    publiclyAccessible: false,
    skipFinalSnapshot: true,
    deletionProtection: false,
    storageEncrypted: true,
    applyImmediately: true,
    tags: { ...baseTags, Name: `${projectName}-${instanceKey}` },
  });
}

const authDb = buildPostgres("auth-db", "authdb");
const usersDb = buildPostgres("users-db", "usersdb");



function buildTable(name: string, extraConfig?: Partial<aws.dynamodb.TableArgs>): aws.dynamodb.Table {
  return new aws.dynamodb.Table(name, {
    name,
    billingMode: "PAY_PER_REQUEST",
    hashKey: "id",
    attributes: [{ name: "id", type: "S" }],
    tags: { ...baseTags, Name: name },
    ...extraConfig,
  });
}

const booksTable = buildTable("tb_books");
const reviewsTable = buildTable("tb_reviews");
const cartsTable = buildTable("tb_carts");
const ordersTable = buildTable("tb_orders");




const wishlistsTable = new aws.dynamodb.Table("tb_wishlists", {
  name: "tb_wishlists",
  billingMode: "PAY_PER_REQUEST",
  hashKey: "id",
  attributes: [
    { name: "id", type: "S" },
    { name: "userId", type: "S" },
  ],
  globalSecondaryIndexes: [
    {
      name: "byUserId",
      hashKey: "userId",
      projectionType: "ALL",
    },
  ],
  tags: { ...baseTags, Name: "tb_wishlists" },
});


export const sgRdsId = sgRds.id;
export const authDbEndpoint = authDb.endpoint;
export const authDbAddress = authDb.address;
export const authDbPort = authDb.port;
export const authDbName = authDb.dbName;
export const usersDbEndpoint = usersDb.endpoint;
export const usersDbAddress = usersDb.address;
export const usersDbPort = usersDb.port;
export const usersDbName = usersDb.dbName;
export const dbMasterUsername = dbUser;

export const authDatabaseUrl = pulumi
  .all([authDb.address, authDb.port, authDb.dbName, dbPassword])
  .apply(([host, port, name, pass]) => `postgres://${dbUser}:${pass}@${host}:${port}/${name}`);

export const usersDatabaseUrl = pulumi
  .all([usersDb.address, usersDb.port, usersDb.dbName, dbPassword])
  .apply(([host, port, name, pass]) => `postgres://${dbUser}:${pass}@${host}:${port}/${name}`);

export const booksTableName = booksTable.name;
export const reviewsTableName = reviewsTable.name;
export const cartsTableName = cartsTable.name;
export const ordersTableName = ordersTable.name;
export const wishlistsTableName = wishlistsTable.name;

export const booksTableArn = booksTable.arn;
export const reviewsTableArn = reviewsTable.arn;
export const cartsTableArn = cartsTable.arn;
export const ordersTableArn = ordersTable.arn;
export const wishlistsTableArn = wishlistsTable.arn;
