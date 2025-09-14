// Import all source files to ensure they appear in coverage
// This forces coverage reporting for all files, not just tested ones

// Main app files
import '../src/app/app';
import '../src/app/app.config';
import '../src/app/app.routes';

// Services  
import '../src/app/features/todo/services/todo.service';
import '../src/app/shared/services/notification.service';

// Stores
import '../src/app/features/todo/store/todo.store';

// Components
import '../src/app/features/todo/components/todo-container/todo-container.component';
import '../src/app/features/todo/components/todo-form/todo-form.component';
import '../src/app/features/todo/components/todo-list/todo-list.component';
import '../src/app/features/todo/components/todo-list/todo-item/todo-item.component';
import '../src/app/features/todo/components/todo-list/subtask/subtask.component';
import '../src/app/features/todo/components/todo-filter/todo-filter.component';
import '../src/app/shared/components/button/button.component';
import '../src/app/shared/components/notification/notification.component';

// Constants and types (these don't have executable code but good to include)
import '../src/app/features/todo/constants/todo.constants';

// This ensures all imported files are included in coverage
export {};
