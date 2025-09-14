// This file imports all source files to ensure they are included in coverage
// even if they don't have direct tests

// Import all components
import './app/app';
import './app/app.config';
import './app/app.routes';

// Import all services
import './app/features/todo/services/todo.service';
import './app/shared/services/notification.service';

// Import all stores
import './app/features/todo/store/todo.store';

// Import all components
import './app/features/todo/components/todo-container/todo-container.component';
import './app/features/todo/components/todo-form/todo-form.component';
import './app/features/todo/components/todo-list/todo-list.component';
import './app/features/todo/components/todo-list/todo-item/todo-item.component';
import './app/features/todo/components/todo-list/subtask/subtask.component';
import './app/features/todo/components/todo-filter/todo-filter.component';
import './app/shared/components/button/button.component';
import './app/shared/components/notification/notification.component';

// Import all constants and types
import './app/features/todo/constants/todo.constants';
import './app/features/todo/models/todo.types';
import './app/features/todo/models/raw-api.types';

// Dummy test to satisfy Jasmine
describe('Coverage Import Test', () => {
    it('should import all source files for coverage', () => {
        expect(true).toBe(true);
    });
});
