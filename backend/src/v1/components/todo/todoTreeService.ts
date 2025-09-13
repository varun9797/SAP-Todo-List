import { TodoModel, SubTaskModel, ITodo, ISubTask } from './todoModel';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export class TodoTreeService {

    // Get todo with full tree structure
    static async getTodoWithTree(todoId: string): Promise<any> {
        const todo = await TodoModel.findOne({ id: todoId })
            .populate('directSubtasks')
            .exec();

        if (!todo) return null;

        // Build the complete tree structure
        const tree = await this.buildSubtaskTree(todo);
        return tree;
    }

    // Build hierarchical tree from flat subtask data
    static async buildSubtaskTree(todo: ITodo): Promise<any> {
        // Get all subtasks for this todo
        const allSubtasks = await SubTaskModel.find({
            path: { $regex: `^${todo.id}/` }
        }).sort({ level: 1, position: 1 });

        // Convert to tree structure
        const todoWithTree = {
            ...todo.toObject(),
            subtasks: this.buildTreeStructure(allSubtasks, todo.id, 0)
        };

        return todoWithTree;
    }

    // Recursively build tree structure
    private static buildTreeStructure(allSubtasks: ISubTask[], parentPath: string, level: number): any[] {
        const children = allSubtasks.filter(subtask =>
            subtask.level === level &&
            subtask.path.startsWith(`${parentPath}/`) &&
            subtask.path.split('/').length === parentPath.split('/').length + 1
        );

        return children.map(child => ({
            ...child.toObject(),
            children: this.buildTreeStructure(allSubtasks, child.path, level + 1)
        }));
    }

    // Add subtask to a parent (Todo or SubTask)
    static async addSubtask(
        parentId: string,
        parentType: 'Todo' | 'SubTask',
        subtaskTitle: string
    ): Promise<ISubTask | null> {
        let parentDoc;
        let parentPath: string;
        let level: number;

        if (parentType === 'Todo') {
            parentDoc = await TodoModel.findOne({ id: parentId });
            if (!parentDoc) return null;
            parentPath = parentId;
            level = 0;
        } else {
            parentDoc = await SubTaskModel.findOne({ id: parentId });
            if (!parentDoc) return null;
            parentPath = parentDoc.path;
            level = parentDoc.level + 1;
        }

        // Get current position (count of siblings)
        const siblingCount = await SubTaskModel.countDocuments({
            parentId: parentDoc._id,
            parentType,
            level
        });

        const subtaskId = uuidv4();
        const subtask = new SubTaskModel({
            id: subtaskId,
            title: subtaskTitle,
            completed: false,
            parentId: parentDoc._id,
            parentType,
            position: siblingCount,
            level,
            path: `${parentPath}/${subtaskId}`
        });

        return await subtask.save();
    }

    // Move subtask within tree (change parent or position)
    static async moveSubtask(
        subtaskId: string,
        newParentId: string,
        newParentType: 'Todo' | 'SubTask',
        newPosition: number
    ): Promise<boolean> {
        const subtask = await SubTaskModel.findOne({ id: subtaskId });
        if (!subtask) return false;

        let newParentDoc;
        let newParentPath: string;
        let newLevel: number;

        if (newParentType === 'Todo') {
            newParentDoc = await TodoModel.findOne({ id: newParentId });
            if (!newParentDoc) return false;
            newParentPath = newParentId;
            newLevel = 0;
        } else {
            newParentDoc = await SubTaskModel.findOne({ id: newParentId });
            if (!newParentDoc) return false;
            newParentPath = newParentDoc.path;
            newLevel = newParentDoc.level + 1;
        }

        const oldPath = subtask.path;
        const newPath = `${newParentPath}/${subtask.id}`;

        // Update the subtask
        subtask.parentId = newParentDoc._id as mongoose.Types.ObjectId;
        subtask.parentType = newParentType;
        subtask.position = newPosition;
        subtask.level = newLevel;
        subtask.path = newPath;
        await subtask.save();

        // Update all descendants' paths and levels
        const descendants = await SubTaskModel.find({
            path: { $regex: `^${oldPath}/` }
        });

        const bulkOps = descendants.map(desc => ({
            updateOne: {
                filter: { _id: desc._id },
                update: {
                    path: desc.path.replace(oldPath, newPath),
                    level: desc.level - subtask.level + newLevel
                }
            }
        }));

        if (bulkOps.length > 0) {
            await SubTaskModel.bulkWrite(bulkOps);
        }

        return true;
    }

    // Get subtask with its subtree
    static async getSubtaskTree(subtaskId: string): Promise<any> {
        const subtask = await SubTaskModel.findOne({ id: subtaskId });
        if (!subtask) return null;

        // Get all descendants
        const descendants = await SubTaskModel.find({
            path: { $regex: `^${subtask.path}/` }
        }).sort({ level: 1, position: 1 });

        return {
            ...subtask.toObject(),
            children: this.buildTreeStructure(descendants, subtask.path, subtask.level + 1)
        };
    }

    // Delete subtask and its entire subtree
    static async deleteSubtask(subtaskId: string): Promise<boolean> {
        const subtask = await SubTaskModel.findOne({ id: subtaskId });
        if (!subtask) return false;

        // This will trigger cascade delete middleware
        await subtask.deleteOne();
        return true;
    }

    // Get tree statistics
    static async getTreeStats(todoId: string): Promise<any> {
        const todo = await TodoModel.findOne({ id: todoId });
        if (!todo) return null;

        const stats = await SubTaskModel.aggregate([
            { $match: { path: { $regex: `^${todoId}/` } } },
            {
                $group: {
                    _id: '$level',
                    count: { $sum: 1 },
                    completed: { $sum: { $cond: ['$completed', 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalSubtasks = await SubTaskModel.countDocuments({
            path: { $regex: `^${todoId}/` }
        });

        const completedSubtasks = await SubTaskModel.countDocuments({
            path: { $regex: `^${todoId}/` },
            completed: true
        });

        return {
            todoId,
            totalSubtasks,
            completedSubtasks,
            completionRate: totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0,
            levelStats: stats,
            maxDepth: stats.length > 0 ? Math.max(...stats.map(s => s._id)) + 1 : 0
        };
    }

    // Example: Create a complex todo tree
    static async createExampleTree(): Promise<string> {
        console.log('🌳 Creating example todo tree...\n');

        // Create main todo
        const todo = await TodoModel.create({
            id: uuidv4(),
            title: 'Build Mobile App',
            description: 'Complete mobile app development project',
            status: 'in-progress'
        });

        console.log(`Created todo: ${todo.title}`);

        // Level 1: Main phases
        const planning = await this.addSubtask(todo.id, 'Todo', 'Planning Phase');
        const development = await this.addSubtask(todo.id, 'Todo', 'Development Phase');
        const testing = await this.addSubtask(todo.id, 'Todo', 'Testing Phase');

        console.log('Added main phases');

        // Level 2: Planning subtasks
        if (planning) {
            await this.addSubtask(planning.id, 'SubTask', 'Market Research');
            await this.addSubtask(planning.id, 'SubTask', 'UI/UX Design');
            const techPlanning = await this.addSubtask(planning.id, 'SubTask', 'Technical Planning');

            // Level 3: Technical planning details
            if (techPlanning) {
                await this.addSubtask(techPlanning.id, 'SubTask', 'Choose Framework');
                await this.addSubtask(techPlanning.id, 'SubTask', 'Database Design');
                await this.addSubtask(techPlanning.id, 'SubTask', 'API Planning');
            }
        }

        // Level 2: Development subtasks
        if (development) {
            const frontend = await this.addSubtask(development.id, 'SubTask', 'Frontend Development');
            const backend = await this.addSubtask(development.id, 'SubTask', 'Backend Development');

            // Level 3: Frontend details
            if (frontend) {
                await this.addSubtask(frontend.id, 'SubTask', 'Setup React Native');
                await this.addSubtask(frontend.id, 'SubTask', 'Create Components');
                await this.addSubtask(frontend.id, 'SubTask', 'Implement Navigation');
            }

            // Level 3: Backend details
            if (backend) {
                await this.addSubtask(backend.id, 'SubTask', 'Setup Node.js Server');
                await this.addSubtask(backend.id, 'SubTask', 'Create APIs');
                await this.addSubtask(backend.id, 'SubTask', 'Database Integration');
            }
        }

        // Level 2: Testing subtasks
        if (testing) {
            await this.addSubtask(testing.id, 'SubTask', 'Unit Testing');
            await this.addSubtask(testing.id, 'SubTask', 'Integration Testing');
            await this.addSubtask(testing.id, 'SubTask', 'User Acceptance Testing');
        }

        console.log('\n📊 Tree created! Getting stats...');
        const stats = await this.getTreeStats(todo.id);
        console.log('Tree Statistics:', stats);

        console.log('\n🌲 Full tree structure:');
        const fullTree = await this.getTodoWithTree(todo.id);
        console.log(JSON.stringify(fullTree, null, 2));

        return todo.id;
    }

    // Helper: Print tree in a readable format
    static printTree(node: any, indent: string = ''): void {
        console.log(`${indent}${node.completed ? '✅' : '⏳'} ${node.title}`);

        if (node.children && node.children.length > 0) {
            node.children.forEach((child: any) => {
                this.printTree(child, indent + '  ');
            });
        }
    }
}

export default TodoTreeService;
