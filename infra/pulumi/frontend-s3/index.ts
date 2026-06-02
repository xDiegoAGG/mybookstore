import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


const projectName = "mybookstore";
const baseTags = { Project: projectName, ManagedBy: "pulumi" };

const config = new pulumi.Config();
const bucketName = config.get("bucketName") || "diegoaggbookstore-frontend";


const bucket = new aws.s3.BucketV2(bucketName, {
  bucket: bucketName,
  forceDestroy: true,
  tags: { ...baseTags, Name: bucketName },
});


const pab = new aws.s3.BucketPublicAccessBlock(`${bucketName}-pab`, {
  bucket: bucket.id,
  blockPublicAcls: false,
  blockPublicPolicy: false,
  ignorePublicAcls: false,
  restrictPublicBuckets: false,
});


const website = new aws.s3.BucketWebsiteConfigurationV2(`${bucketName}-website`, {
  bucket: bucket.id,
  indexDocument: { suffix: "index.html" },

  errorDocument: { key: "index.html" },
});


const bucketPolicy = new aws.s3.BucketPolicy(`${bucketName}-policy`, {
  bucket: bucket.id,
  policy: bucket.arn.apply((arn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `${arn}/*`,
        },
      ],
    })
  ),
}, { dependsOn: [pab] });


export const frontendBucketName = bucket.bucket;
export const frontendBucketArn = bucket.arn;
export const frontendWebsiteEndpoint = website.websiteEndpoint;
export const frontendWebsiteUrl = pulumi.interpolate`http://${website.websiteEndpoint}`;
