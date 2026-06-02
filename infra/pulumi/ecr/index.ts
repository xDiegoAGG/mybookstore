import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


const projectName = "mybookstore";
const baseTags = { Project: projectName, ManagedBy: "pulumi" };


const serviceNames = [
  "auth-service",
  "users-service",
  "catalog-service",
  "reviews-service",
  "cart-service",
  "orders-service",
];


const lifecyclePolicy = JSON.stringify({
  rules: [
    {
      rulePriority: 1,
      description: "Keep last 10 images",
      selection: {
        tagStatus: "any",
        countType: "imageCountMoreThan",
        countNumber: 10,
      },
      action: { type: "expire" },
    },
  ],
});


const repos: Record<string, aws.ecr.Repository> = {};

for (const svc of serviceNames) {
  const repoName = `${projectName}/${svc}`;
  const repo = new aws.ecr.Repository(repoName, {
    name: repoName,
    imageTagMutability: "MUTABLE",
    forceDelete: true,
    imageScanningConfiguration: { scanOnPush: true },
    tags: { ...baseTags, Name: repoName, Service: svc },
  });

  new aws.ecr.LifecyclePolicy(`${repoName}-lifecycle`, {
    repository: repo.name,
    policy: lifecyclePolicy,
  });

  repos[svc] = repo;
}


export const repositoryUrls: Record<string, pulumi.Output<string>> = {};
for (const [svc, repo] of Object.entries(repos)) {
  repositoryUrls[svc] = repo.repositoryUrl;
}

export const authServiceRepoUrl = repos["auth-service"].repositoryUrl;
export const usersServiceRepoUrl = repos["users-service"].repositoryUrl;
export const catalogServiceRepoUrl = repos["catalog-service"].repositoryUrl;
export const reviewsServiceRepoUrl = repos["reviews-service"].repositoryUrl;
export const cartServiceRepoUrl = repos["cart-service"].repositoryUrl;
export const ordersServiceRepoUrl = repos["orders-service"].repositoryUrl;

const accountId = aws.getCallerIdentityOutput().accountId;
const region = aws.getRegionOutput().name;
export const ecrRegistry = pulumi.interpolate`${accountId}.dkr.ecr.${region}.amazonaws.com`;
