import mongoose, { Schema, Document } from 'mongoose';

export interface ISubTask extends Document {
  id: string;
  title: string;
  completed: boolean;
}

export interface ITodo extends Document {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  subtasks: ISubTask[];
}

const SubTaskSchema = new Schema<ISubTask>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const TodoSchema = new Schema<ITodo>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  subtasks: [SubTaskSchema],
}, { timestamps: true });

export const TodoModel = mongoose.model<ITodo>('Todo', TodoSchema);
