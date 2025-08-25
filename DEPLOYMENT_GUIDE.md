# UniApply - Complete Deployment Guide

This guide provides step-by-step instructions for deploying the UniApply application to AWS, including both backend and frontend components.

## Architecture Overview

The UniApply application consists of:

- **Backend**: AWS Lambda serverless API with DynamoDB, Cognito, and API Gateway
- **Frontend**: Vue.js 3 application hosted on S3 with CloudFront CDN
- **Infrastructure**: Managed by Serverless Framework and CloudFormation

## Prerequisites

### Required Tools

1. **Node.js 20+**

   ```bash
   node --version  # Should be 20.x or higher
   npm --version   # Should be 8.x or higher
   ```

2. **AWS CLI**

   ```bash
   aws --version   # Should be 2.x or higher
   ```

3. **Serverless Framework**
   ```bash
   npm install -g serverless # Or use npx serverless without having to install it first
   serverless --version  # Should be 4.x or higher
   ```

### AWS Configuration

1. **Configure AWS CLI**

   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, Region (eu-central-1), and output format (json)
   ```

2. **Verify AWS Permissions**
   Ensure your AWS user/role has permissions for:
   - CloudFormation
   - Lambda
   - API Gateway
   - DynamoDB
   - Cognito
   - S3
   - CloudFront
   - Route53
   - SES
   - CloudWatch
   - IAM

## Deployment Process

### Step 1: Backend Deployment

The backend must be deployed first as it creates the infrastructure needed for the frontend.

#### 1.1 Prepare Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your configuration
# Key variables:
# - SES_SENDER_EMAIL: Email for notifications
# - FRONTEND_URL: Your frontend URL
# - APP_NAME: Application name
```

#### 1.2 Deploy Backend

```bash
# Deploy to development stage
npx serverless deploy --stage dev

# Wait for deployment to complete (5-10 minutes)
# This will create all AWS resources including Cognito User Pool
```

#### 1.3 Get Cognito Configuration

After successful deployment, get the Cognito credentials for frontend configuration:

```bash
aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPoolId` || OutputKey==`CognitoUserPoolClientId`]' \
  --output table
```

#### 1.4 Verify Backend Deployment

```bash
# Check API health
curl https://api-dev.uniapply.app/health

# Check CloudFormation stack status
aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].StackStatus' \
  --output text
```

### Step 2: Frontend Deployment

#### 2.1 Prepare Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file with Cognito configuration from backend
VITE_API_BASE=https://api-dev.uniapply.app
VITE_COGNITO_REGION=eu-central-1
VITE_COGNITO_USER_POOL_ID=<User Pool ID from backend>
VITE_COGNITO_CLIENT_ID=<Client ID from backend>
```

#### 2.2 Build Frontend

```bash
# Build for production
npm run build

# Verify the build
npm run preview
```

#### 2.3 Deploy to AWS

```bash
# Navigate to backend directory (where AWS resources are defined)
cd ../backend

# Get S3 bucket name and CloudFront distribution ID - the following example gets the dev values
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebBucketName`].OutputValue' \
  --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebDistributionId`].OutputValue' \
  --output text)

# Sync built files to S3
aws s3 sync ../frontend/dist s3://$S3_BUCKET --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# Get the CloudFront URL
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebDistributionDomain`].OutputValue' \
  --output text)

echo "Frontend deployed successfully!"
echo "URL: https://$CLOUDFRONT_URL"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. JWT Token Issues

- Ensure frontend and backend use the same Cognito configuration
- Check that the User Pool ID and Client ID match
- Verify the JWT token is not expired

#### 2. Build Errors

```bash
# Check TypeScript errors
npm run type-check

# Fix linting issues
npm run lint --fix

# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. CloudFront Not Updating

```bash
# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id <distribution-id> \
  --id <invalidation-id>

# Create new invalidation
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

### Debug Commands

```bash
# Check deployment status
npx serverless info --stage dev

# View function configuration
aws lambda get-function-configuration --function-name uniapply-app-dev-api

# Test API endpoints
curl -X GET https://api-dev.uniapply.app/applications \
  -H "Authorization: Bearer <your-jwt-token>"

# Check DynamoDB tables
aws dynamodb list-tables

# Check Cognito user pools
aws cognito-idp list-user-pools --max-results 60

# View CloudWatch logs
npx serverless logs -f api --stage dev --tail
```

## Production Deployment

### Backend Production

```bash
cd backend
npx serverless deploy --stage prod
```

### Frontend Production

```bash
# Update frontend .env with production values
VITE_API_BASE=https://api.uniapply.app
VITE_COGNITO_USER_POOL_ID=<production-pool-id>
VITE_COGNITO_CLIENT_ID=<production-client-id>

# Build and deploy
cd frontend
npm run build
cd ../backend
aws s3 sync ../frontend/dist s3://<production-bucket> --delete
aws cloudfront create-invalidation --distribution-id <production-distribution-id> --paths "/*"
```

## 🧹 Cleanup

### Remove Development Environment

```bash
cd backend
npx serverless remove --stage dev
```

### Remove Production Environment

```bash
cd backend
npx serverless remove --stage prod
```

## Monitoring

### CloudWatch Logs

```bash
# View Lambda function logs
npx serverless logs -f api --stage dev --tail

# View specific function logs
npx serverless logs -f api --stage dev --startTime 1h
```

### CloudWatch Metrics

Monitor these key metrics:

- API Gateway request count
- Lambda function duration
- DynamoDB read/write capacity
- Error rates and latency

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different values for dev/staging/production
   - Rotate Cognito credentials regularly

2. **Content Security Policy**
   - Configure CSP headers in CloudFront
   - Restrict script sources to trusted domains
   - Enable HTTPS only

3. **CORS Configuration**
   - Restrict allowed origins to your domains
   - Configure proper CORS headers in API Gateway

4. **IAM Permissions**
   - Follow principle of least privilege
   - Regularly review and update permissions
   - Use IAM roles instead of access keys where possible

## Additional Resources

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Frontend README](./frontend/README.md) - Detailed frontend documentation
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)

## Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review CloudWatch logs for error details
3. Verify AWS permissions and configuration
4. Ensure all prerequisites are met
5. Check that environment variables are correctly set

For additional help, refer to the individual README files in the `backend/` and `frontend/` directories.
