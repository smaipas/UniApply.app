# UniApply Backend - AWS Lambda Serverless API

The backend for the UniApply application, built with AWS Lambda, TypeScript, and the Serverless Framework.

## Architecture

### Serverless Stack

- **AWS Lambda** - Serverless compute
- **API Gateway** - REST API endpoints
- **DynamoDB** - NoSQL database
- **Cognito** - User authentication
- **SES** - Email notifications
- **Route53** - DNS management
- **CloudWatch** - Logging and monitoring
- **S3** - File storage
- **CloudFront** - Content delivery network

### Database Tables

- `APPLICATIONS_TABLE` - Application data
- `USERS_TABLE` - User profiles and roles
- `ROLES_TABLE` - Role definitions and permissions
- `FORMS_TABLE` - Form templates
- `AUDIT_TABLE` - Audit logs
- `RATE_LIMIT_TABLE` - Rate limiting
- `TOKEN_BLACKLIST_TABLE` - JWT token blacklist
- `SECURITY_EVENTS_TABLE` - Security monitoring

## Deployment Guide

### Prerequisites

1. **AWS CLI Configuration**

   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, Region (eu-central-1), and output format (json)
   ```

2. **Node.js 20+**

   ```bash
   node --version  # Should be 20.x or higher
   ```

3. **Serverless Framework**

   ```bash
   npm install -g serverless
   serverless --version  # Should be 4.x or higher
   ```

4. **AWS Permissions**
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

### Initial Setup

1. **Clone and Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**

   ```bash
   # Copy environment template
   cp env.example .env

   # Edit .env with your configuration
   # Key variables:
   # - SES_SENDER_EMAIL: Email for notifications
   # - FRONTEND_URL: Your frontend URL
   # - APP_NAME: Application name
   ```

### Deployment Steps

#### 1. First-Time Deployment

```bash
# Deploy to development stage
npx serverless deploy --stage dev

# Wait for deployment to complete (5-10 minutes)
# Note: This will create all AWS resources including Cognito User Pool
```

#### 2. Post-Deployment Configuration

After successful deployment, you'll need to configure the frontend with the generated Cognito credentials:

```bash
# Get the Cognito User Pool ID and Client ID
aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPoolId` || OutputKey==`CognitoUserPoolClientId`]' \
  --output table
```

#### 3. Verify Deployment

```bash
# Check API health
curl https://api-dev.uniapply.app/health

# Check CloudFormation stack
aws cloudformation describe-stacks --stack-name uniapply-app-dev --query 'Stacks[0].StackStatus'
```

### Production Deployment

```bash
# Deploy to production
npx serverless deploy --stage prod

# Update production frontend environment variables
# Use the production Cognito credentials
```

### Troubleshooting Deployment Issues

#### Debug Commands

```bash
# View deployment logs
npx serverless logs -f api --stage dev --tail

# Check function configuration
aws lambda get-function-configuration --function-name uniapply-app-dev-api

# Test API endpoints
curl -X GET https://api-dev.uniapply.app/applications \
  -H "Authorization: Bearer <your-jwt-token>"

# Check DynamoDB tables
aws dynamodb list-tables

# Check Cognito user pools
aws cognito-idp list-user-pools --max-results 60
```

### Development Workflow

```bash
# Make code changes
# ...

# Deploy changes
npx serverless deploy --stage dev

# View logs
npx serverless logs -f api --stage dev --tail

# Test changes
curl -X GET https://api-dev.uniapply.app/applications
```

### Cleanup

```bash
# Remove development deployment
npx serverless remove --stage dev

# Remove production deployment
npx serverless remove --stage prod
```

## Project Structure

```
backend/
├── src/
│   ├── handler.ts           # Main Lambda handler
│   ├── routes/              # API route handlers
│   │   ├── applications.ts  # Application endpoints
│   │   ├── formTemplates.ts # Form template endpoints
│   │   ├── roles.ts         # Role management
│   │   └── users.ts         # User management
│   ├── utils/               # Utility functions
│   │   ├── auth.ts          # Authentication helpers
│   │   ├── db.ts            # Database operations
│   │   ├── ses.ts           # Email service
│   │   ├── jwtSecurity.ts   # JWT validation
│   │   ├── rateLimit.ts     # Rate limiting
│   │   └── audit.ts         # Audit logging
│   └── validation/          # Request validation
│       ├── http.ts          # HTTP validation
│       └── query.ts         # Query parameter validation
├── scripts/                 # Deployment and maintenance scripts
│   ├── empty-s3-bucket.js   # Clean S3 bucket
│   ├── cleanup-dynamodb.js  # Clean DynamoDB tables
│   └── get-new-cognito-config.js # Get Cognito config
├── serverless.yml           # Serverless configuration
├── package.json
└── tsconfig.json
```

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/forgot-password` - Password reset
- `POST /auth/reset-password` - Password reset confirmation

### Applications

- `GET /applications` - List applications (supports status filter)
- `POST /applications` - Create application
- `GET /applications/{id}` - Get application details
- `PUT /applications/{id}` - Update application
- `DELETE /applications/{id}` - Delete application
- `POST /applications/{id}/submit` - Submit application
- `POST /applications/{id}/status` - Update application status

### Form Templates

- `GET /form-templates` - List form templates
- `POST /form-templates` - Create form template
- `GET /form-templates/{id}` - Get template details
- `PUT /form-templates/{id}` - Update template
- `DELETE /form-templates/{id}` - Delete template

### Users

- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `GET /users/search` - Search users

### Roles

- `GET /roles` - List roles
- `POST /roles` - Create role
- `GET /roles/{id}` - Get role details
- `PUT /roles/{id}` - Update role
- `DELETE /roles/{id}` - Delete role

### Audit Logs

- `GET /audit-logs` - Get audit logs

### File Upload

- `POST /files/presign` - Get presigned URL for file upload

## Configuration

### Environment Variables

```bash
# Email Configuration
SES_SENDER_EMAIL=no-reply@uniapply.app

# Local development url
LOCAL_DEV_URL=http://localhost:5173
```

## Related Documentation

- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Cognito Documentation](https://docs.aws.amazon.com/cognito/)
