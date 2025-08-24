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
- AWS CLI configured
- Domain name and AWS Route53 hosted zone
- AWS Certificate Manager certificate

### Installation

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

5. **Deploy backend**

   ```bash
   cd backend
   npx serverless deploy --stage dev
   ```

6. **Start frontend**
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
