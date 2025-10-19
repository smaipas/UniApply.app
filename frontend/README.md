# UniApply Frontend - Vue.js 3 Application

The frontend for the UniApply application, built with Vue.js 3, TypeScript, Tailwind CSS, and Vite.

## Architecture

### Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management

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

### Environment-Specific Deployment

#### Development Environment

```bash
# API Configuration
VITE_API_BASE=https://api-dev.uniapply.app
VITE_APP_NAME=UniApply

# Authentication (from backend deployment)
VITE_COGNITO_REGION=eu-central-1
VITE_COGNITO_USER_POOL_ID=eu-central-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Production Environment

```bash
# Use production environment variables
VITE_API_BASE=https://api.uniapply.app
VITE_COGNITO_USER_POOL_ID=eu-central-1_yyyyyyyyy
VITE_COGNITO_CLIENT_ID=yyyyyyyyyyyyyyyyyyyyyyyyyy
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
aws s3 sync dist s3://uniapply-app-dev-webbucket --delete

# get the of cloudfront distribution
aws cloudfront list-distributions --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, 'uniapply-app-dev-webbucket')].Id" --output text

# after retrieving the id, replace the below <id> placeholder with the output of the above command
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

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

### State Management

- **Pinia** - Modern state management
- **Stores** - Modular state organization
- **Persistence** - Local storage integration

## Authentication

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
