import { Request, Response } from 'express';
import { TodoModel } from './todoModel';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, CreateTodoRequest, UpdateTodoRequest, CreateSubTaskRequest, UpdateSubTaskRequest } from '../../../types';
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  LOG_MESSAGES,
  DEFAULT_VALUES,
  QUERY_OPTIONS,
  DB_FIELDS
} from '../../../constants';
import { ResponseUtil, LoggerUtil } from '../../../utils/responseUtil';

class TodoController {
  // Helper method to map MongoDB document to Todo object
  private mapToTodo(mongoTodo: any) {
    return {
      id: mongoTodo.id,
      title: mongoTodo.title,
      description: mongoTodo.description,
      status: mongoTodo.status,
      createdAt: mongoTodo.createdAt,
      updatedAt: mongoTodo.updatedAt,
      subtasks: mongoTodo.subtasks.map((subtask: any) => ({
        id: subtask.id,
        title: subtask.title,
        completed: subtask.completed,
        createdAt: subtask.createdAt,
        updatedAt: subtask.updatedAt
      }))
    };
  }

  // Todo CRUD operations
  async getAllTodos(req: Request, res: Response<ApiResponse>) {
    try {
      const todos = await TodoModel.find().lean();
      return ResponseUtil.success(res, todos.map(this.mapToTodo));
    } catch (error) {
      LoggerUtil.error(LOG_MESSAGES.TODO_FETCH_ERROR, error);
      return ResponseUtil.internalServerError(res, ERROR_MESSAGES.TODOS_FETCH_FAILED);
    }
  }

  async getTodoById(req: Request, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const todo = await TodoModel.findOne({ [DB_FIELDS.ID]: id }).lean();

      if (!todo) {
        return ResponseUtil.notFound(res, ERROR_MESSAGES.TODO_NOT_FOUND);
      }

      return ResponseUtil.success(res, this.mapToTodo(todo));
    } catch (error) {
      LoggerUtil.error(LOG_MESSAGES.TODO_GET_ERROR, error);
      return ResponseUtil.internalServerError(res, ERROR_MESSAGES.TODO_FETCH_FAILED);
    }
  }

  async createTodo(req: Request<{}, ApiResponse, CreateTodoRequest>, res: Response<ApiResponse>) {
    try {
      const { title, description, status } = req.body;

      const newTodo = new TodoModel({
        [DB_FIELDS.ID]: uuidv4(),
        [DB_FIELDS.TITLE]: title.trim(),
        [DB_FIELDS.DESCRIPTION]: description || DEFAULT_VALUES.EMPTY_DESCRIPTION,
        [DB_FIELDS.STATUS]: status || DEFAULT_VALUES.TODO_STATUS,
        [DB_FIELDS.SUBTASKS]: []
      });

      const savedTodo = await newTodo.save();
      return ResponseUtil.created(res, this.mapToTodo(savedTodo.toObject()), SUCCESS_MESSAGES.TODO_CREATED);
    } catch (error) {
      LoggerUtil.error(LOG_MESSAGES.TODO_CREATE_ERROR, error);
      return ResponseUtil.internalServerError(res, ERROR_MESSAGES.TODO_CREATE_FAILED);
    }
  }

  async updateTodo(req: Request<{ id: string }, ApiResponse, UpdateTodoRequest>, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;

      const updatedTodo = await TodoModel.findOneAndUpdate(
        { [DB_FIELDS.ID]: id },
        req.body,
        QUERY_OPTIONS.NEW_AND_LEAN
      );

      if (!updatedTodo) {
        return ResponseUtil.notFound(res, ERROR_MESSAGES.TODO_NOT_FOUND);
      }

      return ResponseUtil.success(res, this.mapToTodo(updatedTodo), SUCCESS_MESSAGES.TODO_UPDATED);
    } catch (error) {
      LoggerUtil.error(LOG_MESSAGES.TODO_UPDATE_ERROR, error);
      return ResponseUtil.internalServerError(res, ERROR_MESSAGES.TODO_UPDATE_FAILED);
    }
  }

  async deleteTodo(req: Request, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const result = await TodoModel.deleteOne({ [DB_FIELDS.ID]: id });

      if (result.deletedCount === 0) {
        return ResponseUtil.notFound(res, ERROR_MESSAGES.TODO_NOT_FOUND);
      }

      return ResponseUtil.success(res, undefined, SUCCESS_MESSAGES.TODO_DELETED);
    } catch (error) {
      LoggerUtil.error(LOG_MESSAGES.TODO_DELETE_ERROR, error);
      return ResponseUtil.internalServerError(res, ERROR_MESSAGES.TODO_DELETE_FAILED);
    }
  }

  // Subtask operations
  async createSubTask(req: Request<{ todoId: string }, ApiResponse, CreateSubTaskRequest>, res: Response<ApiResponse>) {
    try {
      const { todoId } = req.params;
      const { title } = req.body;

      const newSubTask = {
        [DB_FIELDS.ID]: uuidv4(),
        [DB_FIELDS.TITLE]: title.trim(),
        completed: DEFAULT_VALUES.SUBTASK_COMPLETED
      };

      const updatedTodo = await TodoModel.findOneAndUpdate(
        { [DB_FIELDS.ID]: todoId },
        {
          $push: { subtasks: newSubTask },
          updatedAt: new Date()
        },
        QUERY_OPTIONS.NEW_AND_LEAN
      );

      if (!updatedTodo) {
        return ResponseUtil.notFound(res, ERROR_MESSAGES.TODO_NOT_FOUND);
      }

      return ResponseUtil.created(res, newSubTask, SUCCESS_MESSAGES.SUBTASK_CREATED);
    } catch (error) {
      LoggerUtil.error(LOG_MESSAGES.SUBTASK_CREATE_ERROR, error);
      return ResponseUtil.internalServerError(res, ERROR_MESSAGES.SUBTASK_CREATE_FAILED);
    }
  }

  async updateSubTask(req: Request<{ todoId: string; subtaskId: string }, ApiResponse, UpdateSubTaskRequest>, res: Response<ApiResponse>) {
    try {
      const { todoId, subtaskId } = req.params;
      const updates = req.body;

      const updateFields: any = {};
      if (updates.title !== undefined) updateFields[DB_FIELDS.SUBTASK_TITLE] = updates.title.trim();
      if (updates.completed !== undefined) updateFields[DB_FIELDS.SUBTASK_COMPLETED] = updates.completed;

      const updatedTodo = await TodoModel.findOneAndUpdate(
        { [DB_FIELDS.ID]: todoId, [DB_FIELDS.SUBTASK_ID]: subtaskId },
        { $set: updateFields },
        QUERY_OPTIONS.NEW_AND_LEAN
      );

      if (!updatedTodo) {
        return ResponseUtil.notFound(res, ERROR_MESSAGES.TODO_OR_SUBTASK_NOT_FOUND);
      }

      const updatedSubtask = updatedTodo.subtasks.find((subtask: any) => subtask.id === subtaskId);
      return ResponseUtil.success(res, updatedSubtask, SUCCESS_MESSAGES.SUBTASK_UPDATED);
    } catch (error) {
      LoggerUtil.error(LOG_MESSAGES.SUBTASK_UPDATE_ERROR, error);
      return ResponseUtil.internalServerError(res, ERROR_MESSAGES.SUBTASK_UPDATE_FAILED);
    }
  }

  async deleteSubTask(req: Request<{ todoId: string; subtaskId: string }>, res: Response<ApiResponse>) {
    try {
      const { todoId, subtaskId } = req.params;

      const result = await TodoModel.updateOne(
        { [DB_FIELDS.ID]: todoId },
        {
          $pull: { subtasks: { id: subtaskId } }
        }
      );

      if (result.matchedCount === 0) {
        return ResponseUtil.notFound(res, ERROR_MESSAGES.TODO_NOT_FOUND);
      }

      if (result.modifiedCount === 0) {
        return ResponseUtil.notFound(res, ERROR_MESSAGES.SUBTASK_NOT_FOUND);
      }

      return ResponseUtil.success(res, undefined, SUCCESS_MESSAGES.SUBTASK_DELETED);
    } catch (error) {
      LoggerUtil.error(LOG_MESSAGES.SUBTASK_DELETE_ERROR, error);
      return ResponseUtil.internalServerError(res, ERROR_MESSAGES.SUBTASK_DELETE_FAILED);
    }
  }


}

export default new TodoController();
