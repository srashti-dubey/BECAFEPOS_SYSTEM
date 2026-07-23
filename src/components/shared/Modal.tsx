import { createPortal } from 'react-dom'
import type { MouseEvent, ReactNode } from 'react'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import styles from './Modal.module.css'

type ModalProps = {
  open: boolean
  title?: string
  children: ReactNode
  onClose?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, title, children, onClose, size = 'md' }: ModalProps) {
  const containerRef = useFocusTrap<HTMLDivElement>(open)
  useLockBodyScroll(open)
  useEscapeKey(open, () => onClose?.())

  if (!open) {
    return null
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  return createPortal(
    <div className={styles.overlay} onMouseDown={handleOverlayClick}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={[styles.panel, styles[size]].join(' ')}
      >
        <div className={styles.headerRow}>
          {title ? <h2 className={styles.title}>{title}</h2> : <span />}
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
