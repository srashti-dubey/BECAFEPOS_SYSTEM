import type { MenuPermissionAction } from '@/auth/types'
import { Checkbox } from '@/components/shared/Checkbox'
import type { PermissionMatrixRow } from '@/features/role-permissions/types'
import { PERMISSION_ACTIONS, allFlagsTrue, applyFlagChange, toggleAllRows, toggleRow } from './permissionsMatrixLogic'
import styles from './PermissionsMatrixTable.module.css'

const ACTION_LABELS: Record<MenuPermissionAction, string> = {
  view: 'View',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
  status: 'Status',
  approval: 'Approval',
}

type PermissionsMatrixTableProps = {
  rows: PermissionMatrixRow[]
  onChange: (menuId: number, flags: PermissionMatrixRow['flags']) => void
  onChangeAll: (updates: Record<number, PermissionMatrixRow['flags']>) => void
  disabled?: boolean
}

export function PermissionsMatrixTable({ rows, onChange, onChangeAll, disabled = false }: PermissionsMatrixTableProps) {
  const allSelected = rows.length > 0 && rows.every((row) => allFlagsTrue(row.flags))

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <Checkbox
                checked={allSelected}
                onChange={(event) => onChangeAll(toggleAllRows(rows, event.target.checked))}
                disabled={disabled || rows.length === 0}
                aria-label="Select all permissions"
              />
            </th>
            <th>Menu / Module</th>
            {PERMISSION_ACTIONS.map((action) => (
              <th key={action}>{ACTION_LABELS[action]}</th>
            ))}
            {/* <th>Select All</th> */}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowSelected = allFlagsTrue(row.flags)
            return (
              <tr key={row.menu_id}>
                <td>
                  <Checkbox
                    checked={rowSelected}
                    onChange={(event) => onChange(row.menu_id, toggleRow(event.target.checked))}
                    disabled={disabled}
                    aria-label={`Select all for ${row.menu_name}`}
                  />
                </td>
                <td>
                  <div className={styles.menuCell}>
                    <span className={styles.menuName}>{row.menu_name}</span>
                    <span className={styles.menuRoute}>{row.menu_route}</span>
                  </div>
                </td>
                {PERMISSION_ACTIONS.map((action) => (
                  <td key={action}>
                    <Checkbox
                      checked={row.flags[action]}
                      // disabled={disabled || (action !== 'view' && !row.flags.view)}
                      onChange={(event) => onChange(row.menu_id, applyFlagChange(row.flags, action, event.target.checked))}
                      aria-label={`${ACTION_LABELS[action]} for ${row.menu_name}`}
                    />
                  </td>
                ))}
                {/* <td>
                  <button
                    type="button"
                    className={styles.selectAllLink}
                    disabled={disabled}
                    onClick={() => onChange(row.menu_id, toggleRow(!rowSelected))}
                  >
                    Select All
                  </button>
                </td> */}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
