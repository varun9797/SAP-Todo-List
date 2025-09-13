import { TodoModel, SubtaskLinkedList, ITodo, ISubTask } from './todoModel';
import TodoLinkedListService from './todoLinkedListService';
import mongoose from 'mongoose';

// Test file to demonstrate cascade delete functionality
export class CascadeDeleteTests {

    static async runAllTests() {
        console.log('🧪 Starting Cascade Delete Tests...\n');

        try {
            await this.testBasicCascadeDelete();
            await this.testPreDeleteMiddleware();
            await this.testFindOneAndDeleteCascade();
            await this.testBulkCascadeDelete();
            await this.testLinkedListIntegrityAfterDelete();

            console.log('✅ All cascade delete tests passed!\n');
        } catch (error) {
            console.error('❌ Test failed:', error);
        }
    }

    // Test 1: Basic cascade delete using instance method
    static async testBasicCascadeDelete() {
        console.log('📋 Test 1: Basic Cascade Delete\n');

        // Create todo with subtasks
        const todo = await TodoLinkedListService.createTodoWithSubtasks(
            'Test Todo for Cascade Delete',
            'This todo will be deleted along with all subtasks',
            ['Subtask 1', 'Subtask 2', 'Subtask 3', 'Subtask 4']
        );

        console.log(`Created todo "${todo.title}" with ${todo.subtasks.length} subtasks`);
        console.log('Subtasks:', todo.subtasks.map(st => st.title));
        console.log('Linked list order:', TodoLinkedListService.getOrderedSubtasks(todo).map(st => st.title));

        // Verify todo exists
        const beforeDelete = await TodoModel.findOne({ id: todo.id });
        console.log(`\nBefore delete - Todo exists: ${beforeDelete !== null}`);
        console.log(`Before delete - Subtask count: ${beforeDelete?.subtasks.length || 0}`);

        // Perform cascade delete
        console.log('\n🗑️  Performing cascade delete...');
        const deleteResult = await TodoLinkedListService.deleteTodoWithSubtasks(todo.id);

        // Verify todo is deleted
        const afterDelete = await TodoModel.findOne({ id: todo.id });
        console.log(`\nAfter delete - Todo exists: ${afterDelete !== null}`);
        console.log(`Delete operation successful: ${deleteResult}`);

        console.log('✅ Test 1 completed\n');
    }

    // Test 2: Pre-delete middleware functionality
    static async testPreDeleteMiddleware() {
        console.log('📋 Test 2: Pre-Delete Middleware\n');

        const todo = new TodoModel({
            id: 'test-middleware-' + Date.now(),
            title: 'Middleware Test Todo',
            description: 'Testing pre-delete middleware',
            status: 'pending',
            subtasks: [
                {
                    id: 'sub1-' + Date.now(),
                    title: 'Middleware Subtask 1',
                    completed: false,
                    next: 'sub2-' + Date.now()
                } as ISubTask,
                {
                    id: 'sub2-' + Date.now(),
                    title: 'Middleware Subtask 2',
                    completed: true,
                    next: undefined
                } as ISubTask
            ],
            subtaskHead: 'sub1-' + Date.now()
        });

        await todo.save();
        console.log(`Created todo with ${todo.subtasks.length} subtasks for middleware test`);

        // Use the cascadeDelete instance method (triggers pre-delete middleware)
        console.log('\n🔧 Triggering pre-delete middleware...');
        await (todo as any).cascadeDelete();

        // Verify deletion
        const deletedTodo = await TodoModel.findOne({ id: todo.id });
        console.log(`Todo deleted via middleware: ${deletedTodo === null}`);

        console.log('✅ Test 2 completed\n');
    }

    // Test 3: findOneAndDelete cascade
    static async testFindOneAndDeleteCascade() {
        console.log('📋 Test 3: findOneAndDelete Cascade\n');

        const todo = await TodoLinkedListService.createTodoWithSubtasks(
            'FindOneAndDelete Test',
            'Testing findOneAndDelete cascade',
            ['Find Subtask 1', 'Find Subtask 2']
        );

        console.log(`Created todo "${todo.title}" with ${todo.subtasks.length} subtasks`);

        // Use findOneAndDelete (triggers pre-findOneAndDelete middleware)
        console.log('\n🔍 Using findOneAndDelete...');
        const deletedTodo = await TodoModel.findOneAndDelete({ id: todo.id });

        console.log(`findOneAndDelete returned: ${deletedTodo !== null}`);
        console.log(`Deleted todo had ${deletedTodo?.subtasks.length || 0} subtasks`);

        // Verify deletion
        const verifyDelete = await TodoModel.findOne({ id: todo.id });
        console.log(`Todo successfully deleted: ${verifyDelete === null}`);

        console.log('✅ Test 3 completed\n');
    }

    // Test 4: Bulk cascade delete
    static async testBulkCascadeDelete() {
        console.log('📋 Test 4: Bulk Cascade Delete\n');

        // Create multiple todos with varying subtask counts
        const todos = await Promise.all([
            TodoLinkedListService.createTodoWithSubtasks('Bulk 1', 'First bulk todo', ['Sub1A', 'Sub1B']),
            TodoLinkedListService.createTodoWithSubtasks('Bulk 2', 'Second bulk todo', ['Sub2A']),
            TodoLinkedListService.createTodoWithSubtasks('Bulk 3', 'Third bulk todo', ['Sub3A', 'Sub3B', 'Sub3C']),
            TodoLinkedListService.createTodoWithSubtasks('Bulk 4', 'Fourth bulk todo', []) // No subtasks
        ]);

        const todoIds = todos.map(t => t.id);
        const totalSubtasks = todos.reduce((sum, t) => sum + t.subtasks.length, 0);

        console.log(`Created ${todos.length} todos with total ${totalSubtasks} subtasks`);
        todos.forEach((t, i) => {
            console.log(`  ${i + 1}. "${t.title}" - ${t.subtasks.length} subtasks`);
        });

        // Perform bulk delete
        console.log('\n🗂️  Performing bulk cascade delete...');
        const bulkResult = await TodoLinkedListService.bulkDeleteTodos(todoIds);

        console.log(`Bulk delete result:`, bulkResult);
        console.log(`Successfully deleted: ${bulkResult.deletedCount}/${todos.length} todos`);

        if (bulkResult.errors.length > 0) {
            console.log('Errors:', bulkResult.errors);
        }

        // Verify all are deleted
        const remainingTodos = await TodoModel.find({ id: { $in: todoIds } });
        console.log(`Remaining todos after bulk delete: ${remainingTodos.length}`);

        console.log('✅ Test 4 completed\n');
    }

    // Test 5: Linked list integrity after partial deletes
    static async testLinkedListIntegrityAfterDelete() {
        console.log('📋 Test 5: Linked List Integrity After Subtask Delete\n');

        const todo = await TodoLinkedListService.createTodoWithSubtasks(
            'Integrity Test Todo',
            'Testing linked list integrity after subtask deletion',
            ['Task A', 'Task B', 'Task C', 'Task D', 'Task E']
        );

        console.log(`Created todo with ${todo.subtasks.length} subtasks`);
        console.log('Initial order:', TodoLinkedListService.getOrderedSubtasks(todo).map(st => st.title));

        // Remove middle subtask
        const middleSubtaskId = todo.subtasks[2].id; // Task C
        console.log(`\nRemoving middle subtask: "${todo.subtasks[2].title}"`);

        const updatedTodo = await TodoLinkedListService.removeSubtask(todo.id, middleSubtaskId);

        if (updatedTodo) {
            console.log('After subtask removal:');
            console.log('Remaining subtasks:', updatedTodo.subtasks.map(st => st.title));
            console.log('Linked list order:', TodoLinkedListService.getOrderedSubtasks(updatedTodo).map(st => st.title));

            // Validate linked list integrity
            const isValid = SubtaskLinkedList.validateLinkedList(updatedTodo);
            console.log(`Linked list integrity: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

            const stats = TodoLinkedListService.getLinkedListStats(updatedTodo);
            console.log('Stats:', stats);

            // Now delete the entire todo
            console.log('\n🗑️  Deleting entire todo with remaining subtasks...');
            await TodoLinkedListService.deleteTodoWithSubtasks(updatedTodo.id);

            const finalCheck = await TodoModel.findOne({ id: updatedTodo.id });
            console.log(`Todo completely deleted: ${finalCheck === null}`);
        }

        console.log('✅ Test 5 completed\n');
    }

    // Utility method to clean up any test data
    static async cleanup() {
        console.log('🧹 Cleaning up test data...');

        // Remove any test todos that might be left over
        const testTodos = await TodoModel.find({
            title: { $regex: /Test|Bulk|Integrity|Middleware|FindOneAndDelete/i }
        });

        if (testTodos.length > 0) {
            console.log(`Found ${testTodos.length} test todos to clean up`);

            for (const todo of testTodos) {
                await (todo as any).cascadeDelete();
            }

            console.log('Test data cleanup completed');
        } else {
            console.log('No test data found to clean up');
        }
    }
}

// Export for use in test runners
export default CascadeDeleteTests;
