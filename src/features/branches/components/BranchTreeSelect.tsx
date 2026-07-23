import { useEffect, useMemo, useRef, useState } from 'react'
import type { BranchTreeItem } from '@/features/branches/types'
import styles from './BranchTreeSelect.module.css'

type BranchTreeSelectProps = {
  tree: BranchTreeItem[]
  value: number[]
  onChange: (ids: number[]) => void
  isLoading?: boolean
}

// All ids in a node's subtree, including the node itself.
function collectSubtreeIds(node: BranchTreeItem): number[] {
  return [node.id, ...(node.children ?? []).flatMap(collectSubtreeIds)]
}

// Ids of every node that has children (used to expand the whole tree at once).
function collectParentIds(items: BranchTreeItem[]): number[] {
  return items.flatMap((item) =>
    item.children?.length ? [item.id, ...collectParentIds(item.children)] : [],
  )
}

// Ids of every parent that has a selected descendant (or is itself selected) — so a
// pre-selected branch buried under collapsed parents is revealed automatically.
function collectParentsWithSelection(items: BranchTreeItem[], selected: Set<number>): number[] {
  const result: number[] = []

  function walk(node: BranchTreeItem): boolean {
    let subtreeHasSelection = selected.has(node.id)

    for (const child of node.children ?? []) {
      if (walk(child)) {
        subtreeHasSelection = true
      }
    }

    if (subtreeHasSelection && node.children?.length) {
      result.push(node.id)
    }

    return subtreeHasSelection
  }

  items.forEach(walk)
  return result
}

type NodeState = 'checked' | 'indeterminate' | 'unchecked'

function getNodeState(node: BranchTreeItem, selected: Set<number>): NodeState {
  const ids = collectSubtreeIds(node)
  const selectedCount = ids.filter((id) => selected.has(id)).length

  if (selectedCount === 0) {
    return 'unchecked'
  }
  return selectedCount === ids.length ? 'checked' : 'indeterminate'
}

type TreeNodeProps = {
  node: BranchTreeItem
  depth: number
  selected: Set<number>
  expanded: Set<number>
  onToggleSelect: (node: BranchTreeItem, checked: boolean) => void
  onToggleExpand: (id: number) => void
}

function TreeNode({ node, depth, selected, expanded, onToggleSelect, onToggleExpand }: TreeNodeProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = expanded.has(node.id)
  const state = getNodeState(node, selected)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = state === 'indeterminate'
    }
  }, [state])

  return (
    <li className={styles.node}>
      <div className={styles.row} style={{ paddingLeft: `${depth * 20}px` }}>
        {hasChildren ? (
          <button
            type="button"
            className={styles.toggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            onClick={() => onToggleExpand(node.id)}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className={styles.toggleSpacer} />
        )}

        <label className={styles.label}>
          <input
            ref={inputRef}
            type="checkbox"
            className={styles.checkbox}
            checked={state === 'checked'}
            onChange={(event) => onToggleSelect(node, event.target.checked)}
          />
          <span>{node.name}</span>
        </label>
      </div>

      {hasChildren && isExpanded ? (
        <ul className={styles.children}>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              expanded={expanded}
              onToggleSelect={onToggleSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function BranchTreeSelect({ tree, value, onChange, isLoading }: BranchTreeSelectProps) {
  const selected = useMemo(() => new Set(value), [value])
  const parentIds = useMemo(() => collectParentIds(tree), [tree])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  // Auto-expand parents of any selected branch (e.g. edit mode with pre-selected branches).
  // When nothing is selected, keep the tree collapsed — only expand when branch_ids are present.
  useEffect(() => {
    if (tree.length === 0) {
      return
    }

    if (value.length === 0) {
      setExpanded(new Set())
      return
    }

    const toExpand = collectParentsWithSelection(tree, new Set(value))
    setExpanded((current) => {
      const next = new Set(current)
      toExpand.forEach((id) => next.add(id))
      return next
    })
  }, [tree, value])

  function handleToggleSelect(node: BranchTreeItem, checked: boolean) {
    const subtreeIds = collectSubtreeIds(node)
    const next = new Set(selected)

    if (checked) {
      subtreeIds.forEach((id) => next.add(id))
    } else {
      subtreeIds.forEach((id) => next.delete(id))
    }

    onChange(Array.from(next))
  }

  function handleToggleExpand(id: number) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function expandAll() {
    setExpanded(new Set(parentIds))
  }

  function collapseAll() {
    setExpanded(new Set())
  }

  if (isLoading) {
    return <p className={styles.status}>Loading branches...</p>
  }

  if (tree.length === 0) {
    return <p className={styles.status}>No branches available.</p>
  }

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <button type="button" className={styles.actionButton} onClick={expandAll}>
          Expand all
        </button>
        <button type="button" className={styles.actionButton} onClick={collapseAll}>
          Collapse all
        </button>
      </div>

      <ul className={styles.tree}>
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selected={selected}
            expanded={expanded}
            onToggleSelect={handleToggleSelect}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </ul>
    </div>
  )
}
