import styles from './Spinner.module.css'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  return <span className={[styles.spinner, styles[size]].join(' ')} role="status" aria-label="Loading" />
}
