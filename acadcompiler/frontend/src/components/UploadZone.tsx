import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { IconUpload, IconSpinner } from './icons'

interface Props { onFile: (f: File) => void; disabled?: boolean; loading?: boolean; multiple?: boolean; onFiles?: (f: File[]) => void }

export function UploadZone({ onFile, disabled, loading, multiple, onFiles }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (multiple && onFiles) onFiles(files)
    else if (files[0]) onFile(files[0])
  }, [onFile, onFiles, multiple])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, disabled: disabled || loading,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/pdf': ['.pdf'] },
    multiple: !!multiple,
  })

  return (
    <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`} style={{ opacity: disabled || loading ? 0.6 : 1 }}>
      <input {...getInputProps()}/>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {loading
          ? <IconSpinner size={28}/>
          : <span style={{ color: isDragActive ? 'var(--c-primary)' : 'var(--c-text-muted)' }}><IconUpload size={28}/></span>
        }
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text-2)' }}>
            {loading ? 'Uploading…' : isDragActive ? 'Drop to upload' : `Drop ${multiple ? 'files' : 'a'} .docx or .pdf here`}
          </div>
          {!loading && <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 3 }}>or click to browse &middot; Max 20 MB{multiple ? ' per file' : ''}</div>}
        </div>
      </div>
    </div>
  )
}
