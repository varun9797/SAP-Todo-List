# Shared Button Component

A reusable button component that provides consistent styling and behavior across the application.

## Features

- Multiple variants (primary, secondary, success, danger, warning, info, light, dark, outline variants)
- Three sizes (small, medium, large)
- Loading states with spinner
- Icon support (left or right positioning)
- Full width option
- Accessibility support
- Dark theme support
- Responsive design

## Usage

### Basic Usage

```html
<app-button (clicked)="onSubmit()">
  Submit
</app-button>
```

### With Variants and Sizes

```html
<!-- Primary button -->
<app-button variant="primary" size="lg" (clicked)="onSave()">
  Save Changes
</app-button>

<!-- Secondary small button -->
<app-button variant="secondary" size="sm" (clicked)="onCancel()">
  Cancel
</app-button>

<!-- Danger outline button -->
<app-button variant="outline-danger" (clicked)="onDelete()">
  Delete
</app-button>
```

### Loading States

```html
<app-button 
  variant="primary"
  [loading]="isSubmitting()"
  loadingText="Saving..."
  (clicked)="onSubmit()">
  Submit Form
</app-button>
```

### With Icons

```html
<app-button 
  variant="success"
  icon="icon-check"
  iconPosition="left"
  (clicked)="onApprove()">
  Approve
</app-button>
```

### Form Submission

```html
<app-button 
  type="submit"
  variant="primary"
  [disabled]="form.invalid"
  (clicked)="onSubmit()">
  Submit
</app-button>
```

### Full Width

```html
<app-button 
  variant="primary"
  [fullWidth]="true"
  (clicked)="onAction()">
  Full Width Button
</app-button>
```

## API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `ButtonVariant` | `'primary'` | Button color variant |
| `size` | `ButtonSize` | `'md'` | Button size |
| `type` | `ButtonType` | `'button'` | HTML button type |
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `loading` | `boolean` | `false` | Whether button is in loading state |
| `fullWidth` | `boolean` | `false` | Whether button takes full width |
| `icon` | `string \| null` | `null` | CSS class for icon |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |
| `loadingText` | `string` | `'Loading...'` | Text shown during loading |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `clicked` | `Event` | Emitted when button is clicked |

### Types

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';
```

## Styling

The component uses CSS custom properties and follows the application's design system. It includes:

- Hover and focus states
- Transition animations
- Dark theme support
- Responsive design
- Accessibility features

## Examples in Codebase

- **Todo Form**: Submit button with loading state
- **Notification Component**: Action buttons for confirmations
- **Todo Items**: Edit, delete, and save buttons
