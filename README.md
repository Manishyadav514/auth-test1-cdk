# Overview
This repo consists code for AWS CDK project. It creates two different cloudformation template based on the branch it is working. Production branch is considered as master and development branch is staging. In order to deploy these two templates, you need to be in that specific branch. 

## progress
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## NPM Install
1. git-branch
To get the diffrenet branch we are in and based on the branch we can import different stack.


