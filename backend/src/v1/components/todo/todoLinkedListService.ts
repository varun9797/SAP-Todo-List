// Example usage of the linked list subtask functionality

import { TodoModel, SubtaskLinkedList, ITodo, ISubTask } from './todoModel';
import { v4 as uuidv4 } from 'uuid';

export class TodoLinkedListService {

    // Create a new todo with linked list subtasks
    static async createTodoWithSubtasks(
        title: string,
        description: string,
        subtaskTitles: string[]
    ): Promise<ITodo> {
        const todo = new TodoModel({
            id: uuidv4(),
            title,
            description,
            status: 'pending',
            subtasks: [],
            subtaskHead: null
        });

        // Add subtasks using linked list methods
        for (const subtaskTitle of subtaskTitles) {
            const subtask: ISubTask = {
                id: uuidv4(),
                title: subtaskTitle,
                completed: false,
                next: undefined
            } as ISubTask;

            // Use the instance method to add subtask
            (todo as any).addSubtaskToEnd(subtask);
        }

        return await todo.save();
    }

    // Get subtasks in linked list order
    static getOrderedSubtasks(todo: ITodo): ISubTask[] {
        return (todo as any).getSubtasksInOrder();
    }

    // Add a subtask at specific position
    static async addSubtaskAtPosition(
        todoId: string,
        subtaskTitle: string,
        position: number
    ): Promise<ITodo | null> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return null;

        const newSubtask: ISubTask = {
            id: uuidv4(),
            title: subtaskTitle,
            completed: false,
            next: undefined
        } as ISubTask;

        (todo as any).addSubtaskAtPosition(newSubtask, position);
        return await todo.save();
    }

    // Move a subtask to a new position
    static async moveSubtask(
        todoId: string,
        subtaskId: string,
        newPosition: number
    ): Promise<ITodo | null> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return null;

        (todo as any).moveSubtask(subtaskId, newPosition);
        return await todo.save();
    }

    // Remove a subtask
    static async removeSubtask(
        todoId: string,
        subtaskId: string
    ): Promise<ITodo | null> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return null;

        (todo as any).removeSubtask(subtaskId);
        return await todo.save();
    }

    // Cascade delete: Delete todo and all its subtasks
    static async deleteTodoWithSubtasks(todoId: string): Promise<boolean> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return false;

        console.log(`Initiating cascade delete for todo: ${todo.title}`);
        console.log(`This will delete ${todo.subtasks.length} subtasks`);

        // Use the cascade delete method
        await (todo as any).cascadeDelete();

        console.log(`Successfully deleted todo ${todoId} and all its subtasks`);
        return true;
    }

    // Alternative: Delete by query (also triggers cascade)
    static async deleteTodoById(todoId: string): Promise<boolean> {
        const result = await TodoModel.findOneAndDelete({ id: todoId });
        return result !== null;
    }

    // Bulk delete with cascade (for multiple todos)
    static async bulkDeleteTodos(todoIds: string[]): Promise<{ deletedCount: number, errors: string[] }> {
        const errors: string[] = [];
        let deletedCount = 0;

        for (const todoId of todoIds) {
            try {
                const success = await this.deleteTodoWithSubtasks(todoId);
                if (success) {
                    deletedCount++;
                } else {
                    errors.push(`Todo ${todoId} not found`);
                }
            } catch (error) {
                errors.push(`Failed to delete todo ${todoId}: ${error}`);
            }
        }

        return { deletedCount, errors };
    }

    // Validate linked list integrity
    static validateTodoLinkedList(todo: ITodo): boolean {
        return SubtaskLinkedList.validateLinkedList(todo);
    }

    // Repair broken linked list
    static async repairTodoLinkedList(todoId: string): Promise<ITodo | null> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return null;

        SubtaskLinkedList.repairLinkedList(todo);
        return await todo.save();
    }

    // Get linked list statistics
    static getLinkedListStats(todo: ITodo) {
        const orderedSubtasks = this.getOrderedSubtasks(todo);
        const arrayLength = todo.subtasks.length;
        const linkedListLength = SubtaskLinkedList.getLength(todo);

        return {
            arrayLength,
            linkedListLength,
            isValid: SubtaskLinkedList.validateLinkedList(todo),
            hasOrphanedSubtasks: arrayLength !== linkedListLength,
            orderedSubtasks
        };
    }

    // Example of complex operations including cascade delete
    static async demonstrateLinkedListOperations() {
        console.log('Creating todo with linked list subtasks...');

        // Create todo with subtasks
        const todo = await this.createTodoWithSubtasks(
            'Learn Data Structures',
            'Master linked lists with MongoDB',
            ['Read about linked lists', 'Implement basic operations', 'Practice with examples']
        );

        console.log('Initial todo:', JSON.stringify(todo, null, 2));
        console.log('Ordered subtasks:', this.getOrderedSubtasks(todo));

        // Add a subtask at the beginning
        await this.addSubtaskAtPosition(todo.id, 'Setup development environment', 0);

        // Move a subtask
        await this.moveSubtask(todo.id, todo.subtasks[1].id, 3);

        // Get final state
        const updatedTodo = await TodoModel.findOne({ id: todo.id });
        if (updatedTodo) {
            console.log('Final ordered subtasks:', this.getOrderedSubtasks(updatedTodo));
            console.log('Stats:', this.getLinkedListStats(updatedTodo));

            // Demonstrate cascade delete
            console.log('\n--- Demonstrating Cascade Delete ---');
            console.log(`Todo "${updatedTodo.title}" has ${updatedTodo.subtasks.length} subtasks`);
            console.log('Subtasks that will be deleted:', updatedTodo.subtasks.map(st => st.title));

            // Perform cascade delete
            const deleteSuccess = await this.deleteTodoWithSubtasks(todo.id);
            console.log('Cascade delete successful:', deleteSuccess);

            // Verify deletion
            const deletedTodo = await TodoModel.findOne({ id: todo.id });
            console.log('Todo exists after deletion:', deletedTodo !== null);
        }
    }

    // Demonstrate different delete methods
    static async demonstrateCascadeDeleteMethods() {
        console.log('\n=== Cascade Delete Methods Demo ===\n');

        // Method 1: Using instance cascadeDelete method
        console.log('1. Creating todo for instance method delete...');
        const todo1 = await this.createTodoWithSubtasks(
            'Project Alpha',
            'Test cascade delete with instance method',
            ['Task 1', 'Task 2', 'Task 3']
        );

        const foundTodo1 = await TodoModel.findOne({ id: todo1.id });
        if (foundTodo1) {
            console.log(`Todo1 has ${foundTodo1.subtasks.length} subtasks`);
            await (foundTodo1 as any).cascadeDelete();
            console.log('Todo1 deleted using instance method\n');
        }

        // Method 2: Using findOneAndDelete
        console.log('2. Creating todo for findOneAndDelete...');
        const todo2 = await this.createTodoWithSubtasks(
            'Project Beta',
            'Test cascade delete with findOneAndDelete',
            ['Subtask A', 'Subtask B']
        );

        console.log(`Todo2 has ${todo2.subtasks.length} subtasks`);
        await this.deleteTodoById(todo2.id);
        console.log('Todo2 deleted using findOneAndDelete\n');

        // Method 3: Bulk delete
        console.log('3. Creating multiple todos for bulk delete...');
        const todos = await Promise.all([
            this.createTodoWithSubtasks('Bulk Todo 1', 'First bulk todo', ['Sub1', 'Sub2']),
            this.createTodoWithSubtasks('Bulk Todo 2', 'Second bulk todo', ['SubA']),
            this.createTodoWithSubtasks('Bulk Todo 3', 'Third bulk todo', ['SubX', 'SubY', 'SubZ'])
        ]);

        const todoIds = todos.map(t => t.id);
        console.log(`Created ${todos.length} todos for bulk delete`);

        const bulkResult = await this.bulkDeleteTodos(todoIds);
        console.log('Bulk delete result:', bulkResult);
    }
}

// Export for use in controllers
export default TodoLinkedListService;
