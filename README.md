# UniApply - University Application Management System

A comprehensive web application for managing university applications, built with Vue.js 3, TypeScript, and AWS Serverless architecture.

## 🏗️ Project Architecture

This is a monorepo containing three main packages:

- **`frontend/`** - Vue.js 3 frontend application with TypeScript and Tailwind CSS
- **`backend/`** - AWS Lambda serverless backend with TypeScript
- **`packages/shared/`** - Shared TypeScript types and utilities

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- AWS CLI configured with appropriate permissions
- Domain name and AWS Route53 hosted zone
- AWS Certificate Manager certificates (us-east-1 for CloudFront, eu-central-1 for API Gateway)

### Initial Setup (One-time)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd UniApply.app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build shared package**

   ```bash
   npm run -w @uniapply/shared build
   ```

4. **Setup environment**

   ```bash
   # Copy environment files
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

5. **Configure AWS SSM Parameters**

   ```bash
   # Development Stage Parameters
   aws ssm put-parameter \
     --name "/uniapply/dev/appBaseUrl" \
     --type String \
     --value "https://dev.uniapply.app" \
     --region eu-central-1

   aws ssm put-parameter \
     --name "/uniapply/dev/ses/senderEmail" \
     --type String \
     --value "no-reply-dev@uniapply.app" \
     --region eu-central-1

   aws ssm put-parameter \
     --name "/uniapply/dev/api/domainName" \
     --type String \
     --value "api-dev.uniapply.app" \
     --region eu-central-1

   aws ssm put-parameter \
     --name "/uniapply/dev/route53/hostedZoneId" \
     --type String \
     --value "YOUR_HOSTED_ZONE_ID" \
     --region eu-central-1

   aws ssm put-parameter \
     --name "/uniapply/dev/acm/certArn" \
     --type String \
     --value "arn:aws:acm:eu-central-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERT_ID" \
     --region eu-central-1

   # Production Stage Parameters
   aws ssm put-parameter \
     --name "/uniapply/prod/appBaseUrl" \
     --type String \
     --value "https://uniapply.app" \
     --region eu-central-1

   aws ssm put-parameter \
     --name "/uniapply/prod/ses/senderEmail" \
     --type String \
     --value "no-reply@uniapply.app" \
     --region eu-central-1

   aws ssm put-parameter \
     --name "/uniapply/prod/api/domainName" \
     --type String \
     --value "api.uniapply.app" \
     --region eu-central-1

   aws ssm put-parameter \
     --name "/uniapply/prod/route53/hostedZoneId" \
     --type String \
     --value "YOUR_HOSTED_ZONE_ID" \
     --region eu-central-1

   aws ssm put-parameter \
     --name "/uniapply/prod/acm/certArn" \
     --type String \
     --value "arn:aws:acm:eu-central-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERT_ID" \
     --region eu-central-1
   ```

   **Note**: Replace `YOUR_HOSTED_ZONE_ID`, `YOUR_ACCOUNT_ID`, and `YOUR_CERT_ID` with your actual values.

6. **Initial Backend Deployment**

   ```bash
   cd backend
   npx serverless deploy --stage dev
   ```

7. **Initial Frontend Deployment**

   ```bash
   cd frontend
   npm run build
   cd ../backend
   aws s3 sync ../frontend/dist/ s3://uniapply-app-dev-webbucket --delete
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

8. **Start frontend development**
   ```bash
   cd frontend
   npm run dev
   ```

## 📁 Project Structure

```
UniApply.app/
├── frontend/                 # Vue.js 3 frontend application
│   ├── src/
│   │   ├── app/             # Core app configuration
│   │   ├── auth/            # Authentication components
│   │   ├── applications/    # Application management
│   │   ├── common/          # Shared UI components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── form-templates/  # Form template management
│   │   ├── settings/        # Settings and admin
│   │   └── users/           # User management
│   └── package.json
├── backend/                  # AWS Lambda serverless backend
│   ├── src/
│   │   ├── handler.ts       # Main Lambda handler
│   │   ├── routes/          # API route handlers
│   │   ├── utils/           # Utility functions
│   │   └── validation/      # Request validation
│   ├── serverless.yml       # Serverless configuration
│   └── package.json
└── packages/
    └── shared/              # Shared types and utilities
        ├── src/
        │   ├── schemas.ts   # Zod validation schemas
        │   └── index.ts     # Shared exports
        └── package.json
```

## 🚀 Deployment Guide

### Deployment Process

#### 1. Backend Deployment

```bash
cd backend
npx serverless deploy --stage dev    # Deploy to dev
# OR
npx serverless deploy --stage prod   # Deploy to production
```

#### 2. Frontend Deployment

```bash
# Build the frontend
cd frontend
npm run build

# Upload to S3 (use the correct bucket name)
cd ../backend
aws s3 sync ../frontend/dist/ s3://uniapply-app-{stage}-webbucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### 3. Get CloudFront Distribution ID

```bash
# List distributions and find the one for your domain
aws cloudfront list-distributions --query "DistributionList.Items[?contains(Aliases.Items, 'dev.uniapply.app')].[Id,DomainName]" --output table
```

### Important Notes

- **Fixed S3 Bucket Names**: The application now uses fixed bucket names:
  - Dev: `uniapply-app-dev-webbucket`
  - Prod: `uniapply-app-prod-webbucket`
- **No More Multiple Buckets**: Each deployment will update the same bucket instead of creating new ones
- **CloudFront Invalidation**: Always invalidate CloudFront after uploading new files

### Troubleshooting

#### CORS Issues

If you encounter CORS errors:

1. Check that the correct bucket is being used
2. Verify CloudFront is pointing to the right bucket
3. Ensure the frontend is using the correct API URL

#### Cache Issues

If files aren't updating:

1. Force CloudFront invalidation: `aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"`
2. Check browser cache (Ctrl+Shift+Delete)
3. Verify files were uploaded to the correct S3 bucket

#### Deployment Issues

**S3 Bucket Not Empty Error**

```bash
# If you get "bucket not empty" error during removal
cd backend
node scripts/empty-s3-bucket.js
```

**DynamoDB Tables Retained**

```bash
# If tables are retained due to DeletionPolicy
cd backend
node scripts/cleanup-dynamodb.js
```

**Get Cognito Configuration After Deployment**

```bash
# Get the deployed Cognito User Pool ID and Client ID
cd backend
node scripts/get-new-cognito-config.js
```

#### Authentication Issues

**Check Cognito User Pools**

```bash
# List all user pools
aws cognito-idp list-user-pools --max-results 60

# Describe specific user pool
aws cognito-idp describe-user-pool --user-pool-id <pool-id>

# List user pool clients
aws cognito-idp list-user-pool-clients --user-pool-id <pool-id>
```

**Check Cognito Users**

```bash
# List users in a pool
aws cognito-idp list-users --user-pool-id <pool-id>

# Get specific user details
aws cognito-idp admin-get-user --user-pool-id <pool-id> --username <username>
```

**Test JWT Token**

```bash
# Test API with JWT token
curl -X GET "https://api-dev.uniapply.app/applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
```

**Check User Permissions**

```bash
# Check user's role and permissions in DynamoDB
aws dynamodb get-item \
  --table-name uniapply-app-users-dev \
  --key '{"id": {"S": "USER_ID"}}'

# Check user's role details
aws dynamodb get-item \
  --table-name uniapply-app-roles-dev \
  --key '{"id": {"S": "ROLE_ID"}}'
```

#### API Debugging

**Check Lambda Logs**

```bash
# View recent logs
npx serverless logs -f handler --stage dev

# Tail logs in real-time
npx serverless logs -f handler --stage dev --tail
```

**Test API Endpoints**

```bash
# Test applications endpoint
curl -X GET "https://api-dev.uniapply.app/applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test user profile endpoint
curl -X GET "https://api-dev.uniapply.app/users/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test with specific status
curl -X GET "https://api-dev.uniapply.app/applications?status=DRAFT" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Development

### Shared Package

When changing schemas or shared types:

```bash
npm run -w @uniapply/shared build
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test:unit    # Run unit tests
```

### Backend Development

```bash
cd backend
npx serverless deploy --stage dev    # Deploy to dev
npx serverless deploy --stage prod   # Deploy to production
npx serverless logs -f handler       # View logs
```

### Useful AWS CLI Commands

**Check CloudFormation Stack**

```bash
# List stacks
aws cloudformation list-stacks --query "StackSummaries[?contains(StackName, 'uniapply')]"

# Describe stack
aws cloudformation describe-stacks --stack-name uniapply-app-dev

# Get stack resources
aws cloudformation list-stack-resources --stack-name uniapply-app-dev
```

**Check S3 Buckets**

```bash
# List buckets
aws s3 ls

# List objects in bucket
aws s3 ls s3://uniapply-app-dev-webbucket

# Check bucket policy
aws s3api get-bucket-policy --bucket uniapply-app-dev-webbucket
```

**Check DynamoDB Tables**

```bash
# List tables
aws dynamodb list-tables

# Scan table (be careful with large tables)
aws dynamodb scan --table-name uniapply-app-users-dev --limit 10

# Query table
aws dynamodb query \
  --table-name uniapply-app-applications-dev \
  --key-condition-expression "id = :id" \
  --expression-attribute-values '{":id": {"S": "APPLICATION_ID"}}'
```

**Check CloudFront**

```bash
# List distributions
aws cloudfront list-distributions

# Get distribution details
aws cloudfront get-distribution --id <distribution-id>

# List invalidations
aws cloudfront list-invalidations --distribution-id <distribution-id>
```

**Check API Gateway**

```bash
# List APIs
aws apigatewayv2 get-apis

# Get API details
aws apigatewayv2 get-api --api-id <api-id>

# List routes
aws apigatewayv2 get-routes --api-id <api-id>
```

## 🔧 Configuration

### AWS Setup

1. **Route53 Hosted Zone**
   - Create hosted zone for your domain
   - Note the hosted zone ID

2. **SSL Certificate**
   - Request certificate in AWS Certificate Manager
   - Validate via DNS
   - Note the certificate ARN

3. **SES Configuration**
   - Verify sender email addresses
   - Configure sending limits

4. **SSM Parameters**

   ```bash
   # Development
   aws ssm put-parameter --name "/uniapply/dev/appBaseUrl" --type String --value "http://localhost:5173"
   aws ssm put-parameter --name "/uniapply/dev/ses/senderEmail" --type String --value "no-reply-dev@uniapply.app"
   aws ssm put-parameter --name "/uniapply/dev/api/domainName" --type String --value "dev-api.uniapply.app"
   aws ssm put-parameter --name "/uniapply/dev/route53/hostedZoneId" --type String --value "ZXXXXXXXXXXXX"
   aws ssm put-parameter --name "/uniapply/dev/acm/certArn" --type String --value "arn:aws:acm:us-east-1:...:certificate/..."

   # Production
   aws ssm put-parameter --name "/uniapply/prod/appBaseUrl" --type String --value "https://uniapply.app"
   aws ssm put-parameter --name "/uniapply/prod/ses/senderEmail" --type String --value "no-reply@uniapply.app"
   aws ssm put-parameter --name "/uniapply/prod/api/domainName" --type String --value "api.uniapply.app"
   aws ssm put-parameter --name "/uniapply/prod/route53/hostedZoneId" --type String --value "ZYYYYYYYYYYYY"
   aws ssm put-parameter --name "/uniapply/prod/acm/certArn" --type String --value "arn:aws:acm:us-east-1:...:certificate/..."
   ```

## 🎯 Features

### Core Functionality

- **User Management** - Role-based access control
- **Application Forms** - Dynamic form templates
- **Approval Workflows** - Multi-step approval processes
- **Email Notifications** - Automated email alerts
- **Audit Logging** - Complete activity tracking
- **Dashboard** - Real-time statistics and insights

### Technical Features

- **TypeScript** - Full type safety
- **Vue.js 3** - Modern reactive framework
- **Tailwind CSS** - Utility-first styling
- **AWS Lambda** - Serverless backend
- **DynamoDB** - NoSQL database
- **Cognito** - User authentication
- **SES** - Email service

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [Shared Package Documentation](./packages/shared/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
