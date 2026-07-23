---
to: "<%= isDynamicForm ? '' : `src/features/${folder}/components/columns.module.css` %>"
---
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.rejectButton {
  background: var(--bg);
  border-color: var(--danger);
  color: var(--danger);
}

.rejectButton:not(:disabled):hover {
  background: var(--danger-bg);
  border-color: var(--danger-hover);
  color: var(--danger-hover);
}
