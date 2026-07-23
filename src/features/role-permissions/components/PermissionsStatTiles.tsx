import { Card } from '@/components/shared/Card'
import styles from './PermissionsStatTiles.module.css'

type PermissionsStatTilesProps = {
  totalMenus: number
  permissionsGranted: number
  currentRole: string
}

export function PermissionsStatTiles({ totalMenus, permissionsGranted, currentRole }: PermissionsStatTilesProps) {
  const tiles = [
    { label: 'Total Menus', value: totalMenus },
    { label: 'Permissions Granted', value: permissionsGranted },
    { label: 'Current Role', value: currentRole || '—' },
  ]

  return (
    <div className={styles.grid}>
      {tiles.map((tile) => (
        <Card key={tile.label} className={styles.tile}>
          <p className={styles.label}>{tile.label}</p>
          <p className={styles.value}>{tile.value}</p>
        </Card>
      ))}
    </div>
  )
}
