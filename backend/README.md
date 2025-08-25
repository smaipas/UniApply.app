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

# Or use the provided script
node scripts/get-new-cognito-config.js
```

#### 3. Frontend Environment Variables

Update your frontend `.env` file with the values from step 2:

```env
VITE_API_BASE=https://api-dev.uniapply.app
VITE_COGNITO_REGION=eu-central-1
VITE_COGNITO_USER_POOL_ID=<User Pool ID from step 2>
VITE_COGNITO_CLIENT_ID=<Client ID from step 2>
```

#### 4. Verify Deployment

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

#### Common Issues and Solutions

1. **S3 Bucket Not Empty Error**

   ```bash
   # If you get "bucket not empty" error during removal
   node scripts/empty-s3-bucket.js
   npx serverless remove --stage dev
   ```

2. **DynamoDB Tables Retained**

   ```bash
   # If tables are retained due to DeletionPolicy
   node scripts/cleanup-dynamodb.js
   ```

3. **Duplicate Cognito User Pools**

   ```bash
   # List all user pools
   aws cognito-idp list-user-pools --max-results 60

   # Delete duplicate pools (keep the one used by Lambda)
   aws cognito-idp delete-user-pool --user-pool-id <pool-id>
   ```

4. **JWT Token Issues**
   - Ensure frontend and backend use the same Cognito configuration
   - Check that the User Pool ID and Client ID match
   - Verify the JWT token is not expired

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
# AWS Configuration
REGION=eu-central-1
STAGE=dev

# Database Tables
USERS_TABLE=uniapply-app-users-dev
FORMS_TABLE=uniapply-app-forms-dev
APPLICATIONS_TABLE=uniapply-app-applications-dev
ROLES_TABLE=uniapply-app-roles-dev
AUDIT_TABLE=uniapply-app-audit-dev
RATE_LIMIT_TABLE=uniapply-app-rate-limits-dev
TOKEN_BLACKLIST_TABLE=uniapply-app-token-blacklist-dev
SECURITY_EVENTS_TABLE=uniapply-app-security-events-dev

# Cognito Configuration
USER_POOL_ID=eu-central-1_xxxxxxxxx
USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration
SES_SENDER_EMAIL=no-reply@uniapply.app
FRONTEND_URL=http://localhost:5173
APP_NAME=UniApply

# Storage
WEB_BUCKET=uniapply-app-dev-webbucket
UPLOADS_BUCKET=uniapply-app-dev-uploads
```

## Security

### Authentication

- JWT tokens via AWS Cognito
- Role-based access control (RBAC)
- Token blacklisting for logout
- Rate limiting on API endpoints

### Authorization

- User permissions based on roles
- Resource-level access control
- Audit logging for all operations
- Input validation and sanitization

### Data Protection

- All data encrypted at rest
- HTTPS for all API communications
- CORS configuration for frontend
- Security headers and CSP

## Monitoring

### CloudWatch Metrics

- API Gateway request count
- Lambda function duration
- DynamoDB read/write capacity
- Error rates and latency

### Logging

- Structured JSON logging
- Request/response logging
- Error tracking and alerting
- Performance monitoring

## Troubleshooting

### Common Issues

1. **CORS Errors** - Check API Gateway CORS configuration
2. **Permission Denied** - Verify IAM roles and policies
3. **Database Connection** - Check DynamoDB table permissions
4. **Email Not Sent** - Verify SES configuration and limits
5. **JWT Validation Fails** - Check Cognito configuration
6. **403 Forbidden** - Verify user permissions and role assignments

### Debug Commands

```bash
# Check deployment status
npx serverless info --stage dev

# View function configuration
npx serverless print --stage dev

# Test API endpoints
curl -X GET https://api-dev.uniapply.app/health

# Check user permissions
curl -X GET https://api-dev.uniapply.app/debug/fix-user-role \
  -H "Authorization: Bearer <jwt-token>"
```

## Related Documentation

- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Cognito Documentation](https://docs.aws.amazon.com/cognito/)
