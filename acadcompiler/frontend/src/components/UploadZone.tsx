import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  onFile: (file: File) => void
  disabled?: boolean
}

export function UploadZone({ onFile, disabled }: Props) {
  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) onFile(files[0])
    },
    [onFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="text-4xl mb-3">📄</div>
      <p className="text-gray-700 font-medium">
        {isDragActive ? 'Drop your paper here' : 'Drop a .docx or .pdf, or click to browse'}
      </p>
      <p className="text-gray-400 text-sm mt-1">Max 20 MB</p>
    </div>
  )
}
