Steps to deploy

## 1. Buy a domain

## 2. Create AWS Route53 host zone

## 3. Create certificates through AWS Certificate Manager

## 4. Setup AWS SES

## 5. Install AWS CLI and run aws configure to setup the cli

## 6. Create SSM parameters

Example:

### dev

aws ssm put-parameter --name "/uniapply/dev/appBaseUrl" --type String --value "http://localhost:5173"
aws ssm put-parameter --name "/uniapply/dev/ses/senderEmail" --type String --value "no-reply-dev@uniapply.app"
aws ssm put-parameter --name "/uniapply/dev/api/domainName" --type String --value "dev-api.uniapply.app"
aws ssm put-parameter --name "/uniapply/dev/route53/hostedZoneId" --type String --value "ZXXXXXXXXXXXX"
aws ssm put-parameter --name "/uniapply/dev/acm/certArn" --type String --value "arn:aws:acm:us-east-1:...:certificate/..."

### prod

aws ssm put-parameter --name "/uniapply/prod/appBaseUrl" --type String --value "https://uniapply.app"
aws ssm put-parameter --name "/uniapply/prod/ses/senderEmail" --type String --value "no-reply@uniapply.app"
aws ssm put-parameter --name "/uniapply/prod/api/domainName" --type String --value "api.uniapply.app"
aws ssm put-parameter --name "/uniapply/prod/route53/hostedZoneId" --type String --value "ZYYYYYYYYYYYY"
aws ssm put-parameter --name "/uniapply/prod/acm/certArn" --type String --value "arn:aws:acm:us-east-1:...:certificate/..."
