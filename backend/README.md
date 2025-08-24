# UniApply Backend - AWS Lambda Serverless API

The backend for the UniApply application, built with AWS Lambda, TypeScript, and the Serverless Framework.

## 🏗️ Architecture

### Serverless Stack

- **AWS Lambda** - Serverless compute
- **API Gateway** - REST API endpoints
- **DynamoDB** - NoSQL database
- **Cognito** - User authentication
- **SES** - Email notifications
- **Route53** - DNS management
- **CloudWatch** - Logging and monitoring

### Database Tables

- `APPLICATIONS_TABLE` - Application data
- `USERS_TABLE` - User profiles and roles
- `ROLES_TABLE` - Role definitions and permissions
- `FORMS_TABLE` - Form templates
- `AUDIT_TABLE` - Audit logs

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- AWS CLI configured
- Serverless Framework installed globally

### Installation

```bash
cd backend
npm install
```

### Development

```bash
# Deploy to development
npx serverless deploy --stage dev

# Deploy to production
npx serverless deploy --stage prod

# View logs
npx serverless logs -f handler

# Remove deployment
npx serverless remove --stage dev
```

## 📁 Project Structure

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
│   │   └── audit.ts         # Audit logging
│   └── validation/          # Request validation
│       ├── http.ts          # HTTP validation
│       └── query.ts         # Query parameter validation
├── serverless.yml           # Serverless configuration
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/forgot-password` - Password reset
- `POST /auth/reset-password` - Password reset confirmation

### Applications

- `GET /applications` - List applications
- `POST /applications` - Create application
- `GET /applications/{id}` - Get application details
- `PUT /applications/{id}` - Update application
- `DELETE /applications/{id}` - Delete application
- `POST /applications/{id}/submit` - Submit application
- `POST /applications/{id}/approve` - Approve application
- `POST /applications/{id}/reject` - Reject application

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

### Search

- `GET /search` - Global search across all resources

## 🔧 Configuration

### Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Database Tables
APPLICATIONS_TABLE=uniapply-applications-dev
USERS_TABLE=uniapply-users-dev
ROLES_TABLE=uniapply-roles-dev
FORMS_TABLE=uniapply-forms-dev
AUDIT_TABLE=uniapply-audit-dev

# Email Configuration
SES_SENDER_EMAIL=no-reply@uniapply.app
FRONTEND_URL=http://localhost:5173
```

### AWS SSM Parameters

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

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Run TypeScript compilation
npm run build

# Run linting
npm run lint

# Deploy to development
npx serverless deploy --stage dev
```

### Testing

```bash
# Test email notifications
node test-notification.js
```

### Monitoring

```bash
# View CloudWatch logs
npx serverless logs -f handler --stage dev

# View specific function logs
npx serverless logs -f handler --stage dev --tail
```

## 🔐 Security

### Authentication

- JWT tokens via AWS Cognito
- Role-based access control (RBAC)
- API key validation for internal services

### Authorization

- User permissions based on roles
- Resource-level access control
- Audit logging for all operations

### Data Protection

- All data encrypted at rest
- HTTPS for all API communications
- Input validation and sanitization

## 📊 Monitoring

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

## 🚀 Deployment

### Development

```bash
npx serverless deploy --stage dev
```

### Production

```bash
npx serverless deploy --stage prod
```

### Rollback

```bash
npx serverless rollback --stage prod
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors** - Check API Gateway CORS configuration
2. **Permission Denied** - Verify IAM roles and policies
3. **Database Connection** - Check DynamoDB table permissions
4. **Email Not Sent** - Verify SES configuration and limits

### Debug Commands

```bash
# Check deployment status
npx serverless info --stage dev

# View function configuration
npx serverless print --stage dev

# Test API endpoints
curl -X GET https://dev-api.uniapply.app/health
```

## 📚 Related Documentation

- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
