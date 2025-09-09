import { Router } from 'express';
import todoController from './todoController';
import {
  validateCreateTodo,
  validateUpdateTodo,
  validateTodoId,
  validateCreateSubTask,
  validateUpdateSubTask,
  validateSubTaskIds
} from './todoValidator';

const router = Router();

// Todo routes with validation
router.get('/', todoController.getAllTodos.bind(todoController));
// router.get('/:id', validateTodoId, todoController.getTodoById.bind(todoController));
router.post('/', validateCreateTodo, todoController.createTodo.bind(todoController));
router.put('/:id', validateUpdateTodo, todoController.updateTodo.bind(todoController));
router.delete('/:id', validateTodoId, todoController.deleteTodo.bind(todoController));

// Subtask routes with validation
router.post('/:todoId/subtasks', validateCreateSubTask, todoController.createSubTask.bind(todoController));
router.put('/:todoId/subtasks/:subtaskId', validateUpdateSubTask, todoController.updateSubTask.bind(todoController));
router.delete('/:todoId/subtasks/:subtaskId', validateSubTaskIds, todoController.deleteSubTask.bind(todoController));

export default router;
