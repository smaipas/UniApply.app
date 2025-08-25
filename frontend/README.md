# UniApply Frontend - Vue.js 3 Application

The frontend for the UniApply application, built with Vue.js 3, TypeScript, Tailwind CSS, and Vite.

## Architecture

### Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **Vuelidate** - Form validation

### Key Features

- **Modular architecture** - Each feature is consider as module and is self contained in a folder
- **Type safety** - TypeScript integration
- **Responsive design** - Mobile-first approach
- **Accessibility** - WCAG compliant components
- **Performance** - Optimized bundle size and loading

## Deployment Guide

### Prerequisites

1. **Node.js 20+**

   ```bash
   node --version  # Should be 20.x or higher
   ```

2. **AWS CLI Configuration**

   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, Region (eu-central-1), and output format (json)
   ```

3. **Backend Deployment**
   - Ensure the backend is deployed first (see backend README)
   - Note the Cognito User Pool ID and Client ID from backend deployment

### Initial Setup

1. **Clone and Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create .env file with your configuration
   # You'll get these values from the backend deployment
   VITE_API_BASE=https://api-dev.uniapply.app
   VITE_COGNITO_REGION=eu-central-1
   VITE_COGNITO_USER_POOL_ID=<from backend deployment>
   VITE_COGNITO_CLIENT_ID=<from backend deployment>
   ```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests
npm run test:unit

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Production Deployment

#### 1. Build the Application

```bash
# Build for production
npm run build

# Verify the build
npm run preview
```

#### 2. Deploy to AWS S3 and CloudFront

The backend deployment creates an S3 bucket and CloudFront distribution for hosting the frontend. Deploy using:

```bash
# Navigate to backend directory (where AWS resources are defined)
cd ../backend

# Sync built files to S3 bucket
aws s3 sync ../frontend/dist s3://uniapply-app-dev-webbucket --delete

# Invalidate CloudFront cache to serve new files
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

#### 3. Get CloudFront Distribution ID

```bash
# Get the CloudFront distribution ID
aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebDistributionId`].OutputValue' \
  --output text
```

#### 4. Complete Deployment Script

```bash
#!/bin/bash
# deploy-frontend.sh

# Build the frontend
cd frontend
npm run build

# Get S3 bucket name and CloudFront distribution ID
cd ../backend
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebBucketName`].OutputValue' \
  --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebDistributionId`].OutputValue' \
  --output text)

# Sync to S3
aws s3 sync ../frontend/dist s3://$S3_BUCKET --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "Frontend deployed successfully!"
echo "URL: https://$(aws cloudformation describe-stacks \
  --stack-name uniapply-app-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebDistributionDomain`].OutputValue' \
  --output text)"
```

### Environment-Specific Deployment

#### Development Environment

```bash
# Use development environment variables
VITE_API_BASE=https://api-dev.uniapply.app
VITE_COGNITO_USER_POOL_ID=eu-central-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Deploy to development
./deploy-frontend.sh
```

#### Production Environment

```bash
# Use production environment variables
VITE_API_BASE=https://api.uniapply.app
VITE_COGNITO_USER_POOL_ID=eu-central-1_yyyyyyyyy
VITE_COGNITO_CLIENT_ID=yyyyyyyyyyyyyyyyyyyyyyyyyy

# Deploy to production
./deploy-frontend.sh
```

### Troubleshooting Deployment Issues

#### Common Issues and Solutions

1. **Build Errors**

   ```bash
   # Check TypeScript errors
   npm run type-check

   # Fix linting issues
   npm run lint --fix

   # Clean and reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **S3 Sync Errors**

   ```bash
   # Check S3 bucket permissions
   aws s3 ls s3://uniapply-app-dev-webbucket

   # Verify bucket exists
   aws s3api head-bucket --bucket uniapply-app-dev-webbucket
   ```

3. **CloudFront Not Updating**

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

4. **CORS Issues**
   - Ensure backend CORS configuration includes your frontend domain
   - Check API Gateway CORS settings
   - Verify CloudFront CORS headers

5. **Authentication Issues**

   ```bash
   # Verify Cognito configuration
   aws cognito-idp describe-user-pool --user-pool-id <pool-id>
   aws cognito-idp list-user-pool-clients --user-pool-id <pool-id>

   # Check environment variables match backend
   echo $VITE_COGNITO_USER_POOL_ID
   echo $VITE_COGNITO_CLIENT_ID
   ```

#### Debug Commands

```bash
# Check build output
ls -la dist/

# Verify environment variables
grep VITE_ .env

# Test API connectivity
curl https://api-dev.uniapply.app/health

# Check CloudFront distribution
aws cloudfront get-distribution --id <distribution-id>
```

### Development Workflow

```bash
# 1. Make code changes
# ...

# 2. Test locally
npm run dev

# 3. Build and test
npm run build
npm run preview

# 4. Deploy
cd ../backend
aws s3 sync ../frontend/dist s3://uniapply-app-dev-webbucket --delete
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"

# 5. Verify deployment
# Visit your CloudFront URL
```

### Performance Optimization

#### Build Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
# Use WebP format and appropriate sizes

# Enable compression
# CloudFront automatically compresses responses
```

#### Caching Strategy

- **Static assets**: Long-term caching (1 year)
- **HTML files**: Short-term caching (1 hour)
- **API responses**: No caching (Cache-Control: no-cache)

### Security Considerations

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

## Project Structure

```
frontend/
├── src/
│   ├── app/                  # Core app configuration
│   │   ├── axios.ts         # HTTP client configuration
│   │   ├── main.ts          # App entry point
│   │   ├── route-guards.ts  # Route protection
│   │   └── router.ts        # Vue Router configuration
│   ├── auth/                # Authentication
│   │   ├── components/      # Auth UI components
│   │   ├── pages/          # Auth pages
│   │   ├── routes/         # Auth routes
│   │   ├── services/       # Auth services
│   │   └── store/          # Auth state management
│   ├── applications/        # Application management
│   │   ├── pages/          # Application pages
│   │   └── routes/         # Application routes
│   ├── common/             # Shared components and utilities
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable UI components
│   │   ├── store/          # Global state management
│   │   └── utils/          # Utility functions
│   ├── dashboard/          # Dashboard functionality
│   │   ├── components/     # Dashboard widgets
│   │   ├── pages/          # Dashboard pages
│   │   ├── routes/         # Dashboard routes
│   │   └── store/          # Dashboard state
│   ├── form-templates/     # Form template management
│   │   ├── pages/          # Template pages
│   │   └── routes/         # Template routes
│   ├── settings/           # Settings and admin
│   │   ├── pages/          # Settings pages
│   │   └── routes/         # Settings routes
│   ├── users/              # User management
│   │   ├── pages/          # User pages
│   │   └── routes/         # User routes
│   ├── App.vue             # Root component
│   └── styles.css          # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## Styling

### Tailwind CSS

- **Utility-first approach** - Rapid UI development
- **Custom design system** - Consistent colors and spacing
- **Responsive design** - Mobile-first breakpoints

### Custom Components

- **Consistent theming** - Primary color integration
- **Accessibility** - WCAG compliant components
- **Performance** - Optimized CSS output
- **Maintainability** - Reusable component patterns

## Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_BASE=https://api-dev.uniapply.app
VITE_APP_NAME=UniApply

# Authentication (from backend deployment)
VITE_COGNITO_REGION=eu-central-1
VITE_COGNITO_USER_POOL_ID=eu-central-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

### Vite Configuration

- **Fast HMR** - Hot module replacement
- **TypeScript support** - Full type checking
- **Asset optimization** - Image and font optimization
- **Build optimization** - Tree shaking and code splitting

## Development

### Code Style

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Strict type checking
- **Vue 3 Composition API** - Modern Vue patterns

### Testing

- **Vitest** - Unit testing framework
- **Vue Test Utils** - Component testing
- **Coverage reporting** - Test coverage metrics

### State Management

- **Pinia** - Modern state management
- **Stores** - Modular state organization
- **Persistence** - Local storage integration
- **DevTools** - Vue DevTools integration

## Authentication

### AWS Cognito Integration

- **JWT tokens** - Secure authentication
- **Role-based access** - Permission management
- **Password policies** - Security requirements
- **Multi-factor auth** - Enhanced security

### Route Guards

- **Authentication guards** - Protected routes
- **Role-based guards** - Permission-based access
- **Redirect handling** - Seamless navigation

## Responsive Design

### Breakpoints

- **Mobile** - 320px and up
- **Tablet** - 768px and up
- **Desktop** - 1024px and up
- **Large Desktop** - 1280px and up

### Mobile-First Approach

- **Touch-friendly** - Large touch targets
- **Performance** - Optimized for mobile networks
- **Accessibility** - Screen reader support

## Related Documentation

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
