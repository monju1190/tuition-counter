'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Upload, Sparkles, FileText, Image as ImageIcon,
  Copy, Check, Loader2, Trash2, BookOpen, HelpCircle, StickyNote, AlignLeft, ChevronDown
} from 'lucide-react'

const OUTPUT_TYPES = [
  { value: 'mcq', label: 'MCQ Questions', icon: HelpCircle, description: 'Multiple choice questions with answers' },
  { value: 'notes', label: 'Study Notes', icon: StickyNote, description: 'Structured notes with key points' },
  { value: 'flashcards', label: 'Flashcards', icon: BookOpen, description: 'Front/back flashcard pairs' },
  { value: 'summary', label: 'Summary', icon: AlignLeft, description: 'Comprehensive content summary' },
]

const QUICK_INSTRUCTIONS = [
  'Make 10 MCQ questions from this',
  'Summarize the key concepts',
  'Create flashcards for revision',
  'Write structured study notes',
  'List the most important points',
  'Explain each topic simply',
]

export default function StudyAIPage() {
  const [file, setFile] = useState<File | null>(null)
  const [instruction, setInstruction] = useState('')
  const [outputType, setOutputType] = useState('mcq')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (f: File | null) => {
    if (!f) return
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (f.size > maxSize) {
      setError('File too large. Maximum size is 10MB.')
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileChange(dropped)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instruction.trim()) {
      setError('Please enter an instruction.')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    const formData = new FormData()
    if (file) formData.append('file', file)
    formData.append('instruction', instruction)
    formData.append('outputType', outputType)

    try {
      const res = await fetch('/api/study-ai', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setResult(data.result)
      }
    } catch (err: any) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getFileIcon = () => {
    if (!file) return null
    if (file.type.startsWith('image/')) return <ImageIcon size={20} style={{ color: 'var(--accent)' }} />
    return <FileText size={20} style={{ color: 'var(--accent)' }} />
  }

  const formatResult = (text: string) => {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size:1.1rem;font-weight:700;margin:1.2rem 0 0.5rem;color:var(--text-main)">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size:0.95rem;font-weight:600;margin:1rem 0 0.4rem;color:var(--accent)">$1</h3>')
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:0.75rem 0"/>')
      .replace(/^- (.*$)/gm, '<li style="margin:0.25rem 0 0.25rem 1.2rem;color:var(--text-main)">$1</li>')
      .replace(/^✅ (.*$)/gm, '<div style="color:var(--success);font-weight:600;margin-top:0.4rem">✅ $1</div>')
      .replace(/^🃏 (.*$)/gm, '<div style="font-size:0.85rem;font-weight:700;color:var(--accent);margin-bottom:0.25rem">🃏 $1</div>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div>
      <Link
        href="/dashboard"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.15))',
            width: '42px', height: '42px',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)'
          }}>
            <Sparkles size={22} />
          </div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>AI Study Tool</h1>
        </div>
        <p className="page-subtitle" style={{ margin: 0, fontSize: '0.9rem' }}>
          Upload a file or type a topic — AI will generate questions, notes, or flashcards for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* File Upload Area */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📎 Upload File (Optional)
          </label>

          {file ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.9rem 1rem',
                background: 'rgba(79, 70, 229, 0.06)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: '10px',
              }}
            >
              {getFileIcon()}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                style={{ color: 'var(--danger)', padding: '0.25rem', borderRadius: '6px', transition: 'background 0.2s' }}
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: '12px',
                padding: '2rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Upload size={28} style={{ color: dragOver ? 'var(--accent)' : 'var(--text-muted)', margin: '0 auto 0.6rem', display: 'block' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                Drop your file here or <span style={{ color: 'var(--accent)' }}>browse</span>
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                PDF, images (JPG, PNG), or text files — max 10MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.md"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
          />
        </div>

        {/* Output Type Selector */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📚 What to Generate
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {OUTPUT_TYPES.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setOutputType(value)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: '0.25rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: outputType === value ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)',
                  background: outputType === value ? 'rgba(79, 70, 229, 0.08)' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon size={15} style={{ color: outputType === value ? 'var(--accent)' : 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: outputType === value ? 'var(--accent)' : 'var(--text-main)' }}>
                    {label}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instruction */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ✍️ Your Instruction
          </label>

          {/* Quick picks */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {QUICK_INSTRUCTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setInstruction(q)}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: instruction === q ? 'rgba(79,70,229,0.1)' : 'rgba(255,255,255,0.5)',
                  color: instruction === q ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontWeight: instruction === q ? 600 : 400,
                }}
              >
                {q}
              </button>
            ))}
          </div>

          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Make 10 MCQ questions from this chapter, or explain the key formulas simply..."
            rows={3}
            className="input-field"
            style={{ resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
            required
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '0.9rem 1rem',
              color: 'var(--danger)',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ gap: '0.5rem', fontSize: '1rem', padding: '0.9rem' }}
        >
          {loading ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
          ) : (
            <><Sparkles size={18} /> Generate with AI</>
          )}
        </button>
      </form>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card"
            style={{ marginTop: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>AI Result</h3>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.82rem', fontWeight: 600,
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: copied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.6)',
                  color: copied ? 'var(--success)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                padding: '1.25rem',
                lineHeight: 1.75,
                fontSize: '0.92rem',
                color: 'var(--text-main)',
                border: '1px solid rgba(0,0,0,0.06)',
                overflowX: 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: formatResult(result) }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
