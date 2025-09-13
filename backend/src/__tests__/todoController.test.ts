import TodoController from '../v1/components/todo/todoController';
import { TodoModel } from '../v1/components/todo/todoModel';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, UpdateTodoRequest, CreateSubTaskRequest, UpdateSubTaskRequest } from '../types';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import { ResponseUtil } from '../utils/responseUtil';

// Mock the TodoModel
jest.mock('../v1/components/todo/todoModel');
const mockedTodoModel = TodoModel as jest.Mocked<typeof TodoModel>;

// Mock ResponseUtil
jest.mock('../utils/responseUtil');
const mockedResponseUtil = ResponseUtil as jest.Mocked<typeof ResponseUtil>;

// Mock console.error to suppress error logs during tests
jest.spyOn(console, 'error').mockImplementation(() => { });

describe('TodoController', () => {
    let req: any;
    let res: Partial<Response<ApiResponse>>;
    let mockResponse: Partial<Response<ApiResponse>>;
    let nextFunction: NextFunction;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        nextFunction = jest.fn();

        req = {};
        res = {
            status: mockStatus,
            json: mockJson
        };
        
        mockResponse = {
            status: mockStatus,
            json: mockJson
        };

        jest.clearAllMocks();
    });

    describe('getAllTodos', () => {
        it('should get all todos successfully', async () => {
            const mockTodos = [
                {
                    _id: 'mongo-id-1',
                    id: 'test-id-1',
                    title: 'Test Todo 1',
                    description: 'Description 1',
                    status: 'pending',
                    subtasks: []
                },
                {
                    _id: 'mongo-id-2',
                    id: 'test-id-2',
                    title: 'Test Todo 2',
                    description: 'Description 2',
                    status: 'completed',
                    subtasks: []
                }
            ];

            (TodoModel.find as jest.Mock).mockResolvedValue(mockTodos);

            const req = {} as Request;
            await TodoController.getAllTodos(req, mockResponse as Response);

            expect(TodoModel.find).toHaveBeenCalledWith({}, { _id: 0, __v: 0 });
            expect(ResponseUtil.success).toHaveBeenCalledWith(
                mockResponse,
                'Todos retrieved successfully',
                mockTodos
            );
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should handle errors when fetching todos', async () => {
            const error = new Error('Database error');
            mockedTodoModel.find.mockReturnValue({
                lean: jest.fn().mockRejectedValue(error)
            } as any);

            await TodoController.getAllTodos(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODOS_FETCH_FAILED
            });
        });
    });

    describe('getTodoById', () => {
        beforeEach(() => {
            req.params = { id: 'todo-1' };
        });

        it('should return todo by id successfully', async () => {
            const mockTodo = {
                id: 'todo-1',
                title: 'Test Todo',
                description: 'Test Description',
                status: 'pending',
                subtasks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockedTodoModel.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockTodo)
            } as any);

            await TodoController.getTodoById(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockTodo,
                message: undefined
            });
        });

        it('should return 404 when todo not found', async () => {
            mockedTodoModel.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            } as any);

            await TodoController.getTodoById(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_NOT_FOUND
            });
        });

        it('should handle errors when fetching todo by id', async () => {
            const error = new Error('Database error');
            mockedTodoModel.findOne.mockReturnValue({
                lean: jest.fn().mockRejectedValue(error)
            } as any);

            await TodoController.getTodoById(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_FETCH_FAILED
            });
        });
    });

    describe('createTodo', () => {
        beforeEach(() => {
            req.body = {
                title: 'New Todo',
                description: 'New Description',
                status: 'pending'
            };
        });

        it('should create todo successfully', async () => {
            const mockSavedTodo = {
                id: 'new-todo-id',
                title: 'New Todo',
                description: 'New Description',
                status: 'pending',
                subtasks: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                toObject: jest.fn().mockReturnValue({
                    id: 'new-todo-id',
                    title: 'New Todo',
                    description: 'New Description',
                    status: 'pending',
                    subtasks: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
            };

            mockedTodoModel.prototype.save = jest.fn().mockResolvedValue(mockSavedTodo);

            await TodoController.createTodo(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    title: 'New Todo',
                    description: 'New Description',
                    status: 'pending'
                }),
                message: SUCCESS_MESSAGES.TODO_CREATED
            });
        });

        it('should handle errors when creating todo', async () => {
            const error = new Error('Database error');
            mockedTodoModel.prototype.save = jest.fn().mockRejectedValue(error);

            await TodoController.createTodo(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_CREATE_FAILED
            });
        });

        it('should create todo with default values', async () => {
            req.body = { title: 'Todo with defaults' };

            const mockSavedTodo = {
                id: 'new-todo-id',
                title: 'Todo with defaults',
                description: '',
                status: 'pending',
                subtasks: [],
                toObject: jest.fn().mockReturnValue({
                    id: 'new-todo-id',
                    title: 'Todo with defaults',
                    description: '',
                    status: 'pending',
                    subtasks: []
                })
            };

            mockedTodoModel.prototype.save = jest.fn().mockResolvedValue(mockSavedTodo);

            await TodoController.createTodo(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        });
    });

    describe('updateTodo', () => {
        beforeEach(() => {
            req.params = { id: 'todo-1' };
            req.body = {
                title: 'Updated Todo',
                description: 'Updated Description'
            };
        });

        it('should update todo successfully', async () => {
            const mockUpdatedTodo = {
                id: 'todo-1',
                title: 'Updated Todo',
                description: 'Updated Description',
                status: 'pending',
                subtasks: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockedTodoModel.findOneAndUpdate.mockResolvedValue(mockUpdatedTodo);

            await TodoController.updateTodo(req as Request<{ id: string }, ApiResponse, UpdateTodoRequest>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedTodo,
                message: SUCCESS_MESSAGES.TODO_UPDATED
            });
        });

        it('should return 404 when todo to update not found', async () => {
            mockedTodoModel.findOneAndUpdate.mockResolvedValue(null);

            await TodoController.updateTodo(req as Request<{ id: string }, ApiResponse, UpdateTodoRequest>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_NOT_FOUND
            });
        });

        it('should handle errors when updating todo', async () => {
            const error = new Error('Database error');
            mockedTodoModel.findOneAndUpdate.mockRejectedValue(error);

            await TodoController.updateTodo(req as Request<{ id: string }, ApiResponse, UpdateTodoRequest>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_UPDATE_FAILED
            });
        });
    });

    describe('deleteTodo', () => {
        beforeEach(() => {
            req.params = { id: 'todo-1' };
        });

        it('should delete todo successfully', async () => {
            mockedTodoModel.deleteOne.mockResolvedValue({ deletedCount: 1 } as any);

            await TodoController.deleteTodo(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: undefined,
                message: SUCCESS_MESSAGES.TODO_DELETED
            });
        });

        it('should return 404 when todo to delete not found', async () => {
            mockedTodoModel.deleteOne.mockResolvedValue({ deletedCount: 0 } as any);

            await TodoController.deleteTodo(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_NOT_FOUND
            });
        });

        it('should handle errors when deleting todo', async () => {
            const error = new Error('Database error');
            mockedTodoModel.deleteOne.mockRejectedValue(error);

            await TodoController.deleteTodo(req as Request, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_DELETE_FAILED
            });
        });
    });

    describe('createSubTask', () => {
        beforeEach(() => {
            req.params = { todoId: 'todo-1' };
            req.body = { title: 'New Subtask' };
        });

        it('should create subtask successfully', async () => {
            const mockUpdatedTodo = {
                id: 'todo-1',
                title: 'Test Todo',
                subtasks: [
                    {
                        id: expect.any(String),
                        title: 'New Subtask',
                        completed: false
                    }
                ]
            };

            mockedTodoModel.findOneAndUpdate.mockResolvedValue(mockUpdatedTodo);

            await TodoController.createSubTask(req as Request<{ todoId: string }, ApiResponse, CreateSubTaskRequest>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    title: 'New Subtask',
                    completed: false
                }),
                message: SUCCESS_MESSAGES.SUBTASK_CREATED
            });
        });

        it('should return 404 when parent todo not found', async () => {
            mockedTodoModel.findOneAndUpdate.mockResolvedValue(null);

            await TodoController.createSubTask(req as Request<{ todoId: string }, ApiResponse, CreateSubTaskRequest>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_NOT_FOUND
            });
        });
    });

    describe('updateSubTask', () => {
        beforeEach(() => {
            req.params = { todoId: 'todo-1', subtaskId: 'subtask-1' };
            req.body = { title: 'Updated Subtask', completed: true };
        });

        it('should update subtask successfully', async () => {
            const mockUpdatedTodo = {
                subtasks: [
                    {
                        id: 'subtask-1',
                        title: 'Updated Subtask',
                        completed: true
                    }
                ]
            };

            mockedTodoModel.findOneAndUpdate.mockResolvedValue(mockUpdatedTodo);

            await TodoController.updateSubTask(req as Request<{ todoId: string; subtaskId: string }, ApiResponse, UpdateSubTaskRequest>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    id: 'subtask-1',
                    title: 'Updated Subtask',
                    completed: true
                }),
                message: SUCCESS_MESSAGES.SUBTASK_UPDATED
            });
        });

        it('should return 404 when todo or subtask not found', async () => {
            mockedTodoModel.findOneAndUpdate.mockResolvedValue(null);

            await TodoController.updateSubTask(req as Request<{ todoId: string; subtaskId: string }, ApiResponse, UpdateSubTaskRequest>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_OR_SUBTASK_NOT_FOUND
            });
        });
    });

    describe('deleteSubTask', () => {
        beforeEach(() => {
            req.params = { todoId: 'todo-1', subtaskId: 'subtask-1' };
        });

        it('should delete subtask successfully', async () => {
            mockedTodoModel.updateOne.mockResolvedValue({
                matchedCount: 1,
                modifiedCount: 1
            } as any);

            await TodoController.deleteSubTask(req as Request<{ todoId: string; subtaskId: string }>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: undefined,
                message: SUCCESS_MESSAGES.SUBTASK_DELETED
            });
        });

        it('should return 404 when parent todo not found', async () => {
            mockedTodoModel.updateOne.mockResolvedValue({
                matchedCount: 0,
                modifiedCount: 0
            } as any);

            await TodoController.deleteSubTask(req as Request<{ todoId: string; subtaskId: string }>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.TODO_NOT_FOUND
            });
        });

        it('should return 404 when subtask not found', async () => {
            mockedTodoModel.updateOne.mockResolvedValue({
                matchedCount: 1,
                modifiedCount: 0
            } as any);

            await TodoController.deleteSubTask(req as Request<{ todoId: string; subtaskId: string }>, res as Response<ApiResponse>);

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                error: ERROR_MESSAGES.SUBTASK_NOT_FOUND
            });
        });
    });
});
