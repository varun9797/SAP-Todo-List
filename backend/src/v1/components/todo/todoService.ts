import { TodoModel, SubTaskModel, ITodo, ISubTask } from './todoModel';
import { v4 as uuidv4 } from 'uuid';

export class TodoService {

    // Get all todos with populated subtasks
    static async getAllTodos(): Promise<ITodo[]> {
        return await TodoModel.find()
            .populate('subtasks') // Automatically populates subtasks in order
            .exec();
    }

    // Get single todo with subtasks
    static async getTodoById(todoId: string): Promise<ITodo | null> {
        return await TodoModel.findOne({ id: todoId })
            .populate('subtasks')
            .exec();
    }

    // Create new todo
    static async createTodo(title: string, description: string = ''): Promise<ITodo> {
        const todo = new TodoModel({
            id: uuidv4(),
            title,
            description,
            status: 'pending'
        });

        return await todo.save();
    }

    // Add subtask to todo
    static async addSubtask(todoId: string, subtaskTitle: string): Promise<ISubTask | null> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return null;

        // Get current subtask count for positioning
        const currentSubtasks = await SubTaskModel.find({ todoId: todo._id });
        const newPosition = currentSubtasks.length;

        const subtask = new SubTaskModel({
            id: uuidv4(),
            title: subtaskTitle,
            completed: false,
            todoId: todo._id,
            position: newPosition
        });

        return await subtask.save();
    }

    // Update subtask
    static async updateSubtask(
        todoId: string,
        subtaskId: string,
        updates: Partial<{ title: string; completed: boolean }>
    ): Promise<ISubTask | null> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return null;

        return await SubTaskModel.findOneAndUpdate(
            { id: subtaskId, todoId: todo._id },
            updates,
            { new: true }
        );
    }

    // Delete subtask
    static async deleteSubtask(todoId: string, subtaskId: string): Promise<boolean> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return false;

        const result = await SubTaskModel.deleteOne({
            id: subtaskId,
            todoId: todo._id
        });

        return result.deletedCount > 0;
    }

    // Reorder subtasks (simple position-based)
    static async reorderSubtasks(
        todoId: string,
        subtaskPositions: { subtaskId: string; position: number }[]
    ): Promise<boolean> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return false;

        // Update positions in bulk
        const bulkOps = subtaskPositions.map(({ subtaskId, position }) => ({
            updateOne: {
                filter: { id: subtaskId, todoId: todo._id },
                update: { position }
            }
        }));

        const result = await SubTaskModel.bulkWrite(bulkOps);
        return result.modifiedCount > 0;
    }

    // Move subtask to new position
    static async moveSubtask(
        todoId: string,
        subtaskId: string,
        newPosition: number
    ): Promise<ITodo | null> {
        const todo = await TodoModel.findOne({ id: todoId }).populate('subtasks');
        if (!todo || !todo.subtasks) return null;

        // Update the moved subtask's position
        await SubTaskModel.updateOne(
            { id: subtaskId, todoId: todo._id },
            { position: newPosition }
        );

        // Adjust other subtasks' positions
        const subtasks = todo.subtasks as ISubTask[];
        const movedSubtask = subtasks.find(st => st.id === subtaskId);

        if (movedSubtask) {
            const otherSubtasks = subtasks.filter(st => st.id !== subtaskId);

            // Reposition other subtasks
            const bulkOps = otherSubtasks.map((subtask, index) => {
                const adjustedPosition = index >= newPosition ? index + 1 : index;
                return {
                    updateOne: {
                        filter: { id: subtask.id },
                        update: { position: adjustedPosition }
                    }
                };
            });

            if (bulkOps.length > 0) {
                await SubTaskModel.bulkWrite(bulkOps);
            }
        }

        // Return updated todo with subtasks
        return await this.getTodoById(todoId);
    }

    // Update todo
    static async updateTodo(
        todoId: string,
        updates: Partial<{ title: string; description: string; status: string }>
    ): Promise<ITodo | null> {
        return await TodoModel.findOneAndUpdate(
            { id: todoId },
            updates,
            { new: true }
        ).populate('subtasks');
    }

    // Delete todo (cascade delete handled by middleware)
    static async deleteTodo(todoId: string): Promise<boolean> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return false;

        await todo.deleteOne(); // This triggers cascade delete middleware
        return true;
    }

    // Get todos with subtask count
    static async getTodosWithSubtaskCount(): Promise<any[]> {
        return await TodoModel.aggregate([
            {
                $lookup: {
                    from: 'subtasks',
                    localField: '_id',
                    foreignField: 'todoId',
                    as: 'subtasks'
                }
            },
            {
                $addFields: {
                    subtaskCount: { $size: '$subtasks' },
                    completedSubtasks: {
                        $size: {
                            $filter: {
                                input: '$subtasks',
                                cond: { $eq: ['$$this.completed', true] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    id: 1,
                    title: 1,
                    description: 1,
                    status: 1,
                    subtaskCount: 1,
                    completedSubtasks: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
    }

    // Simple example usage
    static async example() {
        console.log('🚀 Simple Todo with Populate Example\n');

        // Create a todo
        const todo = await this.createTodo('Learn Mongoose Populate', 'Master populate functionality');
        console.log('Created todo:', todo.title);

        // Add some subtasks
        await this.addSubtask(todo.id, 'Read documentation');
        await this.addSubtask(todo.id, 'Try basic populate');
        await this.addSubtask(todo.id, 'Try virtual populate');

        // Get todo with populated subtasks
        const populatedTodo = await this.getTodoById(todo.id);
        console.log('\nTodo with subtasks:');
        console.log('Title:', populatedTodo?.title);
        console.log('Subtasks:', populatedTodo?.subtasks?.map(st => `- ${st.title} (${st.completed ? '✅' : '⏳'})`));

        // Move a subtask
        await this.moveSubtask(todo.id, populatedTodo?.subtasks?.[0].id || '', 2);
        console.log('\nAfter moving first subtask to position 2:');

        const reorderedTodo = await this.getTodoById(todo.id);
        console.log('Subtasks:', reorderedTodo?.subtasks?.map(st => `- ${st.title}`));

        // Delete todo (cascades to subtasks)
        await this.deleteTodo(todo.id);
        console.log('\n🗑️ Todo and all subtasks deleted automatically!');
    }
}

export default TodoService;
