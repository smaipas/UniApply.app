# UniApply Frontend - Vue.js 3 Application

The frontend for the UniApply application, built with Vue.js 3, TypeScript, Tailwind CSS, and Vite.

## 🏗️ Architecture

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

- **Component-based architecture** - Reusable UI components
- **Type safety** - Full TypeScript integration
- **Responsive design** - Mobile-first approach
- **Accessibility** - WCAG compliant components
- **Performance** - Optimized bundle size and loading

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
cd frontend
npm install
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

## 📁 Project Structure

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

## 🧩 Components

### UI Components (`src/common/components/`)

#### Form Components

- `UiInput` - Text input with validation
- `UiSelect` - Dropdown select with custom styling
- `UiDateInput` - Date picker with calendar icon
- `UiCheckbox` - Checkbox input
- `UiTextarea` - Multi-line text input
- `UiCountrySelect` - Country selection dropdown

#### Layout Components

- `AppLayout` - Main application layout
- `AppSidebar` - Navigation sidebar
- `AppTopbar` - Top navigation bar
- `UiModal` - Modal dialog component
- `UiDrawer` - Slide-out drawer

#### Data Display

- `UiTable` - Data table with sorting and pagination
- `UiCard` - Content card container
- `UiChip` - Tag/badge component
- `UiAlert` - Alert/notification component
- `UiToast` - Toast notification system

#### Interactive Components

- `UiButton` - Button component with variants
- `UiDropdown` - Dropdown menu
- `UiTooltip` - Tooltip component
- `UiLoadingOverlay` - Loading state overlay

### Page Components

#### Authentication

- `LoginPage` - User login
- `SignUpPage` - User registration
- `ForgotPasswordPage` - Password reset
- `ProfilePage` - User profile management

#### Applications

- `ApplicationsPage` - Application list and management
- `ApplicationFormPage` - Application creation and editing

#### Dashboard

- `DashboardPage` - Main dashboard with widgets
- `DashboardStat` - Statistics display
- `DashboardRecentApps` - Recent applications widget
- `DashboardApprovals` - Pending approvals widget

#### Administration

- `UsersPage` - User management
- `UserGroupsPage` - Role management
- `LogsPage` - Audit log viewer
- `FormTemplatesPage` - Form template management

## 🎨 Styling

### Tailwind CSS

- **Utility-first approach** - Rapid UI development
- **Custom design system** - Consistent colors and spacing
- **Responsive design** - Mobile-first breakpoints
- **Dark mode support** - Automatic theme switching

### Custom Components

- **Consistent theming** - Primary color integration
- **Accessibility** - WCAG compliant components
- **Performance** - Optimized CSS output
- **Maintainability** - Reusable component patterns

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=https://api.uniapply.app
VITE_APP_NAME=UniApply

# Authentication
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_REGION=us-east-1

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

### Vite Configuration

- **Fast HMR** - Hot module replacement
- **TypeScript support** - Full type checking
- **Asset optimization** - Image and font optimization
- **Build optimization** - Tree shaking and code splitting

## 🛠️ Development

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

## 🔐 Authentication

### AWS Cognito Integration

- **JWT tokens** - Secure authentication
- **Role-based access** - Permission management
- **Password policies** - Security requirements
- **Multi-factor auth** - Enhanced security

### Route Guards

- **Authentication guards** - Protected routes
- **Role-based guards** - Permission-based access
- **Redirect handling** - Seamless navigation

## 📱 Responsive Design

### Breakpoints

- **Mobile** - 320px and up
- **Tablet** - 768px and up
- **Desktop** - 1024px and up
- **Large Desktop** - 1280px and up

### Mobile-First Approach

- **Touch-friendly** - Large touch targets
- **Performance** - Optimized for mobile networks
- **Accessibility** - Screen reader support

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build

# Preview build
npm run preview

# Analyze bundle
npm run analyze
```

### Deployment Options

- **Static hosting** - Netlify, Vercel, AWS S3
- **CDN integration** - CloudFront, Cloudflare
- **Environment-specific** - Dev, staging, production

## 🔧 Troubleshooting

### Common Issues

1. **Build errors** - Check TypeScript compilation
2. **Styling issues** - Verify Tailwind classes
3. **API errors** - Check network requests
4. **Authentication** - Verify Cognito configuration

### Debug Tools

- **Vue DevTools** - Component inspection
- **Browser DevTools** - Network and console
- **Vite HMR** - Hot module replacement
- **TypeScript** - Type checking

## 📚 Related Documentation

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
