import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from 'react'
import styles from './FileDropzone.module.css'

type FileDropzoneProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  invalid?: boolean
  placeholder?: string
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const FileDropzone = forwardRef<HTMLInputElement, FileDropzoneProps>(
  (
    {
      invalid = false,
      placeholder = 'Drag & drop a file here, or click to browse',
      className,
      disabled,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const generatedId = useId()
    const inputId = id ?? generatedId
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [dragging, setDragging] = useState(false)

    useEffect(() => {
      if (!file || !file.type.startsWith('image/')) {
        setPreviewUrl(null)
        return
      }
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }, [file])

    function applyFiles(files: FileList | null, event?: ChangeEvent<HTMLInputElement>) {
      const next = files?.[0] ?? null
      setFile(next)
      if (event) {
        onChange?.(event)
        return
      }
      const el = inputRef.current
      if (!el) return
      onChange?.({
        target: el,
        currentTarget: el,
        type: 'change',
      } as ChangeEvent<HTMLInputElement>)
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      applyFiles(event.target.files, event)
    }

    function handleClear(event: React.MouseEvent) {
      event.preventDefault()
      event.stopPropagation()
      if (disabled) return
      const el = inputRef.current
      if (!el) return
      el.value = ''
      setFile(null)
      onChange?.({
        target: el,
        currentTarget: el,
        type: 'change',
      } as ChangeEvent<HTMLInputElement>)
    }

    function handleDrop(event: DragEvent<HTMLLabelElement>) {
      event.preventDefault()
      setDragging(false)
      if (disabled) return
      const el = inputRef.current
      if (!el || !event.dataTransfer.files?.length) return

      const dt = new DataTransfer()
      dt.items.add(event.dataTransfer.files[0])
      el.files = dt.files
      applyFiles(el.files)
    }

    return (
      <label
        htmlFor={inputId}
        className={[
          styles.dropzone,
          dragging ? styles.dragging : '',
          invalid ? styles.invalid : '',
          disabled ? styles.disabled : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragging(false)
        }}
        onDrop={handleDrop}
      >
        <input
          ref={mergeRefs(inputRef, ref)}
          id={inputId}
          type="file"
          className={styles.input}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          {...props}
          onChange={handleChange}
        />

        {file ? (
          <div className={styles.preview}>
            {previewUrl ? <img src={previewUrl} alt="" className={styles.thumbnail} /> : null}
            <div className={styles.fileMeta}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatBytes(file.size)}</span>
            </div>
            <button type="button" className={styles.clear} aria-label="Remove file" disabled={disabled} onClick={handleClear}>
              ×
            </button>
          </div>
        ) : (
          <div className={styles.prompt}>
            <span className={styles.promptStrong}>{placeholder}</span>
          </div>
        )}
      </label>
    )
  },
)

FileDropzone.displayName = 'FileDropzone'
