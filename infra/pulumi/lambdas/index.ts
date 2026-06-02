import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


const projectName = "mybookstore";
const baseTags = { Project: projectName, ManagedBy: "pulumi" };

const config = new pulumi.Config();
const dataStackName = config.get("dataStackName") || "mybookstore-data/dev";
const jwtSecret = config.requireSecret("jwtSecret");
const labRoleName = config.get("labRoleName") || "LabRole";

const dataStack = new pulumi.StackReference(dataStackName);
const booksTableName = dataStack.getOutput("booksTableName") as pulumi.Output<string>;
const wishlistsTableName = dataStack.getOutput("wishlistsTableName") as pulumi.Output<string>;


const labRole = aws.iam.getRoleOutput({ name: labRoleName });


const lambdasSourceRoot = path.resolve(__dirname, "..", "..", "..", "lambdas");




function makeLambdaArchive(folderName: string): pulumi.asset.AssetArchive {
  return new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive(path.join(lambdasSourceRoot, folderName)),
  });
}



const searchBooksLambda = new aws.lambda.Function(`${projectName}-search-books`, {
  name: `${projectName}-search-books`,
  runtime: "nodejs20.x",
  role: labRole.arn,
  handler: "index.handler",
  code: makeLambdaArchive("search-books"),
  timeout: 15,
  memorySize: 256,
  environment: {
    variables: {
      BOOKS_TABLE: booksTableName,
    },
  },
  tags: { ...baseTags, Name: `${projectName}-search-books` },
});


const wishlistLambda = new aws.lambda.Function(`${projectName}-wishlist`, {
  name: `${projectName}-wishlist`,
  runtime: "nodejs20.x",
  role: labRole.arn,
  handler: "index.handler",
  code: makeLambdaArchive("wishlist"),
  timeout: 15,
  memorySize: 256,
  environment: {
    variables: {
      WISHLISTS_TABLE: wishlistsTableName,
      WISHLISTS_GSI: "byUserId",
      JWT_SECRET: jwtSecret,
    },
  },
  tags: { ...baseTags, Name: `${projectName}-wishlist` },
});


export const searchBooksFunctionName = searchBooksLambda.name;
export const searchBooksFunctionArn = searchBooksLambda.arn;
export const searchBooksInvokeArn = searchBooksLambda.invokeArn;

export const wishlistFunctionName = wishlistLambda.name;
export const wishlistFunctionArn = wishlistLambda.arn;
export const wishlistInvokeArn = wishlistLambda.invokeArn;
