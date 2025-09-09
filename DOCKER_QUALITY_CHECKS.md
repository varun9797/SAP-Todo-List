# Docker Quality Checks Integration Guide

This guide explains how to integrate linting and testing into your Docker build pipeline for the SAP Todo List project.

## 🎯 Overview

The Docker build pipeline now includes comprehensive quality checks:
- **TypeScript Type Checking** - Ensures type safety
- **ESLint Code Quality** - Enforces coding standards  
- **Jest Unit Tests** - Validates functionality
- **Multi-stage Builds** - Optimized for production

## 📋 Prerequisites

Before running quality checks in Docker:

1. **Ensure all tests pass locally:**
   ```bash
   cd backend
   npm test
   npm run lint
   npm run type-check
   ```

2. **Verify Docker is installed:**
   ```bash
   docker --version
   docker compose --version
   ```

## 🏗️ Build Configurations

### 1. Production Build (`Dockerfile`)
**Best for**: Production deployments
```bash
cd backend
docker build -t todo-backend:prod .
```

**Features:**
- ✅ Full quality check pipeline
- ✅ TypeScript compilation
- ✅ Optimized production image
- ❌ Fails on any quality issue

### 2. Development Build (`Dockerfile.dev`)
**Best for**: Local development
```bash
cd backend  
docker build -f Dockerfile.dev -t todo-backend:dev .
```

**Features:**
- ⚠️ Quality checks as warnings
- 🔄 Supports hot reload
- 🛠️ Development-friendly
- ✅ Continues even with warnings

### 3. CI/CD Build (`Dockerfile.ci`)
**Best for**: Automated pipelines
```bash
cd backend
docker build -f Dockerfile.ci \
  --build-arg SKIP_TESTS=false \
  --build-arg SKIP_LINT=false \
  --build-arg FAIL_ON_WARNINGS=true \
  -t todo-backend:ci .
```

**Features:**
- 🔒 Strict quality enforcement
- ⚙️ Configurable via build args
- 📊 Test coverage reporting
- 🚨 Fail-fast behavior

## 🧪 Quality Check Stages

### Stage 1: TypeScript Type Checking
```dockerfile
RUN echo "🔍 Running TypeScript type checking..." && \
    npm run type-check
```
- **Purpose**: Validate TypeScript types
- **Command**: `npm run type-check`
- **Failure**: Stops build immediately

### Stage 2: ESLint Code Quality
```dockerfile
RUN echo "🧹 Running ESLint..." && \
    npm run lint
```
- **Purpose**: Enforce code quality standards
- **Command**: `npm run lint`
- **Failure**: Stops build if errors found

### Stage 3: Jest Unit Tests
```dockerfile
RUN echo "🧪 Running tests..." && \
    npm test
```
- **Purpose**: Validate application logic
- **Command**: `npm test` (production) or `npm run test:coverage` (CI)
- **Failure**: Stops build if tests fail

### Stage 4: Application Build
```dockerfile
RUN echo "🏗️ Building application..." && \
    npm run build
```
- **Purpose**: Compile TypeScript to JavaScript
- **Command**: `npm run build`
- **Requirement**: All quality checks must pass first

## 🎛️ Build Arguments (CI/CD)

Control quality check behavior with build arguments:

| Argument | Default | Description | Example |
|----------|---------|-------------|---------|
| `SKIP_TESTS` | `false` | Skip Jest unit tests | `--build-arg SKIP_TESTS=true` |
| `SKIP_LINT` | `false` | Skip ESLint checks | `--build-arg SKIP_LINT=true` |
| `SKIP_TYPE_CHECK` | `false` | Skip TypeScript validation | `--build-arg SKIP_TYPE_CHECK=true` |
| `FAIL_ON_WARNINGS` | `true` | Fail build on warnings | `--build-arg FAIL_ON_WARNINGS=false` |

### Example Usage:
```bash
# Skip tests but enforce linting and type checking
docker build -f backend/Dockerfile.ci \
  --build-arg SKIP_TESTS=true \
  --build-arg SKIP_LINT=false \
  --build-arg SKIP_TYPE_CHECK=false \
  -t todo-backend:no-tests .

# Development-style CI build (warnings only)
docker build -f backend/Dockerfile.ci \
  --build-arg FAIL_ON_WARNINGS=false \
  -t todo-backend:dev-ci .
```

## 🚀 Testing the Pipeline

### Comprehensive Test Script
```bash
# Run all quality check tests
chmod +x test-docker-build.sh
./test-docker-build.sh
```

This script tests:
1. Production build with quality checks
2. Development build with warnings
3. CI/CD build with strict enforcement
4. Custom build argument configurations
5. Container runtime functionality
6. Image size analysis

### Manual Testing
```bash
# Test individual builds
cd backend

# Test production quality pipeline
docker build -t test-prod .

# Test development pipeline  
docker build -f Dockerfile.dev -t test-dev .

# Test CI/CD pipeline
docker build -f Dockerfile.ci -t test-ci .
```

## 📊 Quality Metrics

### Build Times
- **Development**: ~30-60 seconds (with warnings)
- **Production**: ~60-120 seconds (with quality checks)
- **CI/CD**: ~60-120 seconds (configurable strictness)

### Image Sizes
- **Development**: ~270MB (includes dev dependencies)
- **Production**: ~172MB (optimized runtime)
- **CI/CD**: ~172MB (same as production)

### Test Coverage
When using CI/CD build with coverage:
```bash
docker build -f backend/Dockerfile.ci -t todo-backend:coverage .
# Includes test coverage reports in build output
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Type Check Failures
```bash
# See type errors locally
cd backend
npm run type-check

# Fix TypeScript configuration
vim tsconfig.json
```

#### 2. Lint Failures
```bash
# Check linting errors
cd backend
npm run lint

# Auto-fix issues
npm run lint:fix
```

#### 3. Test Failures
```bash
# Run tests locally
cd backend
npm test

# Run specific test file
npm test -- todoController.test.ts

# Run with coverage
npm run test:coverage
```

#### 4. Build Context Issues
```bash
# Check .dockerignore
cat backend/.dockerignore

# Clean Docker cache
docker builder prune -a
```

## 🎯 Best Practices

### 1. Local Development
- Use `Dockerfile.dev` for development builds
- Run quality checks locally before building
- Fix issues locally rather than in Docker

### 2. CI/CD Integration
- Use `Dockerfile.ci` for automated builds
- Configure quality gates based on branch/environment
- Cache npm dependencies for faster builds

### 3. Production Deployment
- Always use production `Dockerfile`
- Ensure all quality checks pass
- Monitor build metrics and times

### 4. Quality Standards
```bash
# Recommended package.json scripts
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "validate": "npm run type-check && npm run lint && npm test"
  }
}
```

## 📈 Integration Examples

### GitHub Actions
```yaml
name: Build with Quality Checks
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build with quality checks
        run: |
          cd backend
          docker build -f Dockerfile.ci \
            --build-arg FAIL_ON_WARNINGS=true \
            -t todo-backend:${{ github.sha }} .
      
      - name: Run smoke tests
        run: |
          docker run --rm -d --name test-backend todo-backend:${{ github.sha }}
          sleep 10
          docker logs test-backend
          docker stop test-backend
```

### GitLab CI
```yaml
build:
  stage: build
  script:
    - cd backend
    - docker build -f Dockerfile.ci -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_BRANCH == "develop"
```

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build with Quality Checks') {
            steps {
                dir('backend') {
                    script {
                        def image = docker.build("todo-backend:${env.BUILD_NUMBER}", "-f Dockerfile.ci .")
                        
                        // Test the built image
                        image.inside {
                            sh 'echo "Build successful with quality checks!"'
                        }
                    }
                }
            }
        }
    }
}
```

## 🔗 Related Scripts

### Package.json Scripts (Backend)
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js", 
    "dev": "nodemon src/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm test"
  }
}
```

### Docker Compose Integration
```yaml
# docker-compose.yml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile  # Uses quality checks
    # ... rest of configuration
```

```yaml
# docker-compose.dev.yml  
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev  # Uses warning-only quality checks
    # ... rest of configuration
```

This integration ensures that every Docker build includes comprehensive quality validation, maintaining high code standards across all environments.
