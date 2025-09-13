# Todo Tree Structure with Mongoose

You're absolutely right! A todo with subtasks is actually a **tree structure** where subtasks can have their own subtasks (nested indefinitely). Here's the proper implementation:

## 🌳 **Tree Structure Design**

### **Node Structure**
Each subtask is a node in the tree with:
- `parentId` - Reference to parent (Todo or SubTask)
- `parentType` - Type of parent ('Todo' or 'SubTask')
- `level` - Depth in tree (0 = direct child of todo)
- `position` - Order among siblings
- `path` - Full path from root (e.g., "todo1/sub1/sub2")

### **Path-Based Hierarchy**
```
Todo: "Build Mobile App"
├── Planning Phase (path: "todo1/plan1")
│   ├── Market Research (path: "todo1/plan1/research1")
│   ├── UI/UX Design (path: "todo1/plan1/design1")
│   └── Technical Planning (path: "todo1/plan1/tech1")
│       ├── Choose Framework (path: "todo1/plan1/tech1/framework1")
│       ├── Database Design (path: "todo1/plan1/tech1/db1")
│       └── API Planning (path: "todo1/plan1/tech1/api1")
├── Development Phase (path: "todo1/dev1")
│   ├── Frontend (path: "todo1/dev1/frontend1")
│   │   ├── Setup React Native (path: "todo1/dev1/frontend1/setup1")
│   │   ├── Create Components (path: "todo1/dev1/frontend1/components1")
│   │   └── Navigation (path: "todo1/dev1/frontend1/nav1")
│   └── Backend (path: "todo1/dev1/backend1")
│       ├── Setup Node.js (path: "todo1/dev1/backend1/node1")
│       ├── Create APIs (path: "todo1/dev1/backend1/api1")
│       └── Database Integration (path: "todo1/dev1/backend1/db1")
└── Testing Phase (path: "todo1/test1")
    ├── Unit Testing (path: "todo1/test1/unit1")
    ├── Integration Testing (path: "todo1/test1/integration1")
    └── User Acceptance Testing (path: "todo1/test1/uat1")
```

## 🚀 **Key Features**

### **1. Infinite Nesting**
```javascript
// Add subtask to todo
await TodoTreeService.addSubtask('todo1', 'Todo', 'Main Task');

// Add subtask to subtask
await TodoTreeService.addSubtask('subtask1', 'SubTask', 'Sub-subtask');

// Add subtask to sub-subtask (infinite depth!)
await TodoTreeService.addSubtask('subsubtask1', 'SubTask', 'Deep nested task');
```

### **2. Path-Based Queries**
```javascript
// Get entire subtree efficiently
const allDescendants = await SubTaskModel.find({
  path: { $regex: `^${parentPath}/` }
});

// Delete entire subtree in one operation
await SubTaskModel.deleteMany({
  path: { $regex: `^${parentPath}/` }
});
```

### **3. Tree Operations**
```javascript
// Move subtask (with entire subtree) to new parent
await TodoTreeService.moveSubtask(
  'subtask1', 
  'newparent1', 
  'SubTask', 
  0 // new position
);

// Get tree statistics
const stats = await TodoTreeService.getTreeStats('todo1');
// Returns: totalSubtasks, completionRate, maxDepth, levelStats
```

### **4. Cascade Delete Tree**
```javascript
// Delete any node - entire subtree gets deleted automatically
await TodoTreeService.deleteSubtask('subtask1');
// Deletes the subtask + all its children + grandchildren, etc.

// Delete todo - entire tree gets deleted
await TodoModel.deleteOne({ id: 'todo1' });
// Deletes todo + all subtasks at all levels
```

## 🎯 **Benefits of Tree Structure**

### **1. Natural Hierarchy**
- Represents real-world task breakdown
- Unlimited nesting depth
- Clear parent-child relationships

### **2. Efficient Operations**
- **Path-based queries**: Find all descendants with regex
- **Cascade operations**: Delete/move entire subtrees
- **Level-based sorting**: Maintain hierarchical order

### **3. Rich Analytics**
```javascript
const stats = {
  todoId: 'todo1',
  totalSubtasks: 15,
  completedSubtasks: 8,
  completionRate: 53.33,
  maxDepth: 3,
  levelStats: [
    { _id: 0, count: 3, completed: 1 },  // Level 0: 3 tasks, 1 completed
    { _id: 1, count: 8, completed: 4 },  // Level 1: 8 tasks, 4 completed  
    { _id: 2, count: 4, completed: 3 }   // Level 2: 4 tasks, 3 completed
  ]
}
```

### **4. Flexible Restructuring**
- Move entire subtrees between parents
- Maintain path consistency automatically
- Update all descendant levels/paths in bulk

## 💻 **Usage Examples**

### **Create Tree Structure**
```javascript
// Create todo
const todo = await TodoModel.create({
  title: 'Build Website',
  status: 'pending'
});

// Add main phases
const design = await TodoTreeService.addSubtask(todo.id, 'Todo', 'Design Phase');
const dev = await TodoTreeService.addSubtask(todo.id, 'Todo', 'Development Phase');

// Add design subtasks
const wireframe = await TodoTreeService.addSubtask(design.id, 'SubTask', 'Create Wireframes');
const mockup = await TodoTreeService.addSubtask(design.id, 'SubTask', 'Design Mockups');

// Add detailed wireframe tasks
await TodoTreeService.addSubtask(wireframe.id, 'SubTask', 'Homepage Wireframe');
await TodoTreeService.addSubtask(wireframe.id, 'SubTask', 'Dashboard Wireframe');
```

### **Query Tree**
```javascript
// Get complete tree structure
const tree = await TodoTreeService.getTodoWithTree('todo1');

// Get just one subtree
const subtree = await TodoTreeService.getSubtaskTree('subtask1');

// Get tree statistics
const stats = await TodoTreeService.getTreeStats('todo1');
```

### **Move Operations**
```javascript
// Move a subtask (and its entire subtree) to different parent
await TodoTreeService.moveSubtask(
  'wireframe-subtask', 
  'development-phase', 
  'SubTask', 
  0
);
```

This tree structure properly represents the hierarchical nature of complex tasks and provides efficient operations for managing nested todo items!

## 🗂️ **MongoDB Advantages**

- **Regex path queries** for efficient subtree operations
- **Virtual populate** for automatic tree building
- **Atomic updates** for maintaining consistency
- **Index on path** for fast hierarchy queries

This is the proper way to model hierarchical todo structures in MongoDB!
