function TaskForm({ formData, onFormChange, onAddTask }) {
  return (
    <div
      style={{
        marginTop: '20px',
        marginBottom: '20px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}
    >
      <h3 style={{ marginTop: '2px' }}>Create New Task</h3>

      {/* Title */}
      <div style={{ marginBottom: '10px', marginRight: '20px' }}>
        <input
          type="text"
          placeholder="Task title *"
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddTask()}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: '10px', marginRight: '20px' }}>
        <textarea
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '8px', resize: 'vertical' }}
        />
      </div>

      {/* Priority */}
      <div style={{ marginBottom: '10px', marginRight: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Priority:
        </label>
        <select
          value={formData.priority}
          onChange={(e) => onFormChange('priority', e.target.value)}
          style={{ width: '25%', padding: '8px' }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Due Date */}
      <div style={{ marginBottom: '10px', marginRight: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Due Date:
        </label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => onFormChange('due_date', e.target.value)}
          style={{ width: '30%', padding: '8px' }}
        />
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '10px', marginRight: '20px' }}>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={formData.tags}
          onChange={(e) => onFormChange('tags', e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
        <small style={{ color: '#666' }}>Example: work, urgent, frontend</small>
      </div>

      <button onClick={onAddTask} style={{ padding: '10px 20px' }}>
        Add Task
      </button>
    </div>
  );
}
export default TaskForm;
