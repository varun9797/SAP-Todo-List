# Todo List Frontend

A modern Angular 20 application for todo and subtask management with a clean, responsive interface and centralized state management.

## 🚀 Features

- ✅ **Complete Todo Management**: Create, read, update, and delete todos
- 📝 **Subtask Support**: Add and manage subtasks for each todo
- 🎯 **Smart Filtering**: Filter todos by status (All, Pending, Completed)
- 🔄 **Real-time Updates**: Responsive UI with immediate feedback
- 🏪 **Centralized State**: Signal-based state management with TodoStore
- 🧪 **Comprehensive Testing**: 99%+ test coverage with Jasmine/Karma
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- 🎨 **Modern UI**: Clean, accessible interface with consistent styling
- 🔔 **Smart Notifications**: Success/error feedback with confirmation dialogs
- ⚡ **Performance Optimized**: Standalone components and efficient change detection

## 🏗️ Architecture

This Angular application follows modern best practices with a feature-based architecture:

```
frontend/src/app/
├── features/
│   └── todo/                    # Todo feature module
│       ├── components/
│       │   ├── todo-container/  # Main container component
│       │   ├── todo-form/       # Todo creation form
│       │   ├── todo-filter/     # Status filter component
│       │   └── todo-list/       # Todo list and items
│       │       ├── todo-item/   # Individual todo component
│       │       └── subtask/     # Subtask component
│       ├── services/
│       │   └── todo.service.ts  # HTTP API service
│       ├── store/
│       │   └── todo.store.ts    # Centralized state management
│       ├── models/              # TypeScript type definitions
│       └── constants/           # Application constants
├── shared/
│   ├── components/
│   │   ├── button/              # Reusable button component
│   │   └── notification/        # Notification system
│   └── services/
│       └── notification.service.ts # Global notification service
├── app.config.ts               # Application configuration
├── app.routes.ts              # Routing configuration
└── app.ts                     # Root application component
```

## 🛠️ Technology Stack

- **Angular 20**: Latest Angular with standalone components
- **TypeScript 5.9**: Full type safety and modern JavaScript features
- **RxJS 7.8**: Reactive programming for HTTP and state management
- **Angular Signals**: Modern state management with computed properties
- **SCSS**: Enhanced styling with variables and mixins
- **Angular Forms**: Reactive forms with validation
- **Jasmine/Karma**: Unit testing framework
- **ESLint**: Code quality and consistency

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Angular CLI** (v20 or higher)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Development Server

```bash
# Start development server
npm start
# or
ng serve

# Application will be available at http://localhost:4200
```

### 3. Backend Connection

Make sure the backend API is running on `http://localhost:3000`. The frontend is configured to connect to this endpoint by default.

## 🧪 Testing

### Running Tests

```bash
# Run unit tests
npm test
# or
ng test

# Run tests with code coverage
ng test --code-coverage

# Run tests in headless mode (for CI/CD)
ng test --watch=false --browsers=ChromeHeadless
```

### Test Coverage

The application maintains 99%+ test coverage across:

- ✅ **Components**: All UI components with user interaction testing
- ✅ **Services**: HTTP services and state management
- ✅ **Store**: Complete state management testing
- ✅ **Forms**: Validation and submission logic
- ✅ **Integration**: Component interaction testing

### Test Structure

```
*.spec.ts files are co-located with their source files:
- component.spec.ts: Component testing
- service.spec.ts: Service testing  
- store.spec.ts: State management testing
```

## 📦 Building

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## 🎨 Styling

### Design System

The application uses a consistent design system with:

- **Colors**: Primary, secondary, success, danger color palette
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized margins and padding
- **Components**: Reusable UI components with variants

### SCSS Structure

```scss
// Global styles in src/styles.scss
// Component-specific styles co-located with components
// Shared styling utilities and variables
```

### Responsive Design

- **Mobile-first**: Designed for mobile devices first
- **Breakpoints**: Responsive design for tablet and desktop
- **Touch-friendly**: Appropriate touch targets for mobile

## 🔄 State Management

### TodoStore (Signal-based)

The application uses Angular Signals for modern, reactive state management:

```typescript
// Centralized state with signals
readonly todos = signal<Todo[]>([]);
readonly loading = signal(false);
readonly filter = signal<FilterStatus>('all');

// Computed derived state
readonly filteredTodos = computed(() => {...});
readonly todoCounts = computed(() => {...});
```

### Key Benefits

- ✅ **Fine-grained reactivity**: Only affected components re-render
- ✅ **Type safety**: Full TypeScript support
- ✅ **Predictable updates**: Clear state mutation patterns
- ✅ **Easy testing**: Injectable service with clear API

## 🔔 Notification System

### Features

- **Success/Error Messages**: Automatic feedback for user actions
- **Confirmation Dialogs**: For destructive actions (delete, etc.)
- **Auto-dismiss**: Notifications automatically hide after timeout
- **Promise-based**: Easy integration with async operations

### Usage

```typescript
// Show success notification
this.notificationService.showSuccess('Todo created successfully!');

// Show confirmation dialog
const confirmed = await this.notificationService.showConfirmation(
  'Are you sure you want to delete this todo?'
);
```

## 🧩 Component Architecture

### Standalone Components

All components are standalone (no NgModules required):

```typescript
@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-item.component.html'
})
```

### Component Communication

- **Input/Output**: Parent-child communication
- **Services**: Cross-component communication via TodoStore
- **Signals**: Reactive state sharing

## 🔧 Configuration

### Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Angular Configuration

Key configurations in `angular.json`:
- Build optimization for production
- SCSS preprocessing
- Asset management
- Development server proxy (if needed)

## 📝 Code Style

### ESLint Configuration

The project uses ESLint with Angular-specific rules:

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
ng lint --fix
```

### Prettier Configuration

Consistent code formatting with Prettier:
- 100 character line length
- Single quotes preferred
- Special HTML formatting for Angular templates

## 🔍 Debugging

### Development Tools

- **Angular DevTools**: Browser extension for component inspection
- **RxJS DevTools**: For debugging reactive streams
- **TypeScript strict mode**: Catch errors at compile time

### Common Issues

1. **API Connection**: Verify backend is running on port 3000
2. **CORS Issues**: Backend should be configured to accept frontend origin
3. **Build Errors**: Run `npm install` to ensure dependencies are current

## 🚀 Deployment

### Build for Production

```bash
ng build --configuration production
```

### Deployment Options

1. **Static Hosting**: Deploy `dist/` folder to any static hosting service
2. **CDN**: Use with content delivery networks
3. **Docker**: Containerized deployment (see Dockerfile)
4. **Cloud Platforms**: Deploy to AWS, Azure, Netlify, Vercel, etc.

### Environment Variables

For production deployment, update:
- API endpoint URLs
- Environment-specific configurations
- Build optimization settings

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Write tests for new functionality
3. Implement the feature
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Commit with descriptive messages
7. Create pull request

### Code Standards

- Follow Angular style guide
- Maintain test coverage above 95%
- Use TypeScript strict mode
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex logic

## 📊 Performance

### Optimization Features

- **OnPush Change Detection**: Optimized component updates
- **Lazy Loading**: Route-based code splitting (when applicable)
- **Standalone Components**: Reduced bundle size
- **Tree Shaking**: Dead code elimination in production builds
- **Signal-based State**: Efficient reactivity

### Bundle Analysis

```bash
# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 4200 in use**: Change port with `ng serve --port 4201`
2. **Module not found**: Run `npm install` to install dependencies
3. **API errors**: Verify backend is running and accessible
4. **Test failures**: Clear browser cache and restart test runner

### Support

For issues or questions:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure backend API is running
4. Check network connectivity

---

**Built with ❤️ using Angular 20 and modern web technologies**
