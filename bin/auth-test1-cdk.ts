#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuthTestCdkStack } from "../lib/auth-test1-cdk-stack";
import gitBranch from "git-branch";
import { CDKContext } from "../layer/types";

const app = new cdk.App();

const createAuthTestStack = async () => {
  try {
    const app = new cdk.App();
    const context = await getContext(app);
    const tags: any = {
      Environment: context.environment,
    };
    const stackName = `${context.appName}Stack-${context.environment}`;
    const stackProps: cdk.StackProps = {
      env: { region: context.region, account: context.accountNumber },
      stackName: stackName,
      description: "Stack deployment",
      tags,
    };
    new AuthTestCdkStack(app, stackName, context, stackProps);
  } catch (error) {
    console.log(error);
  }
};

// get content based on git branch and call create stack fucntion
export const getContext = async (app: cdk.App): Promise<CDKContext> => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentBranch = await gitBranch();
      const environment = app.node
        .tryGetContext("environments")
        .find((e: any) => e.branchName === currentBranch);
      const globals = app.node.tryGetContext("globals");
      return resolve({ ...globals, ...environment });
    } catch (error) {
      console.log(error);
      return reject();
    }
  });
};

createAuthTestStack();
