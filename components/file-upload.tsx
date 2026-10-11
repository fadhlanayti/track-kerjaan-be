'use client'
import { useState, useRef } from 'react'
import { Paperclip, Loader2 } from 'lucide-react'

interface Props {
  onUpload: (urls: string[]) => void
}

export function FileUpload({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const fileList = Array.from(files)
    const uploadedUrls: string[] = []

    try {
      for (const file of fileList) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) uploadedUrls.push(data.url)
      }

      if (uploadedUrls.length > 0) {
        onUpload(uploadedUrls)
      }
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,.pdf,.zip"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="p-2 rounded-full transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        title="Attach file"
      >
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
      </button>
    </>
  )
}
