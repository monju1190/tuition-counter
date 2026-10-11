'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw, X, CheckCircle, Calendar, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { resetTuitionCycle } from '@/actions/tuitions'

interface CompleteCycleModalProps {
  tuitionId: string
  currentCount: number
  totalClasses: number
  defaultCycleName: string
  isComplete: boolean
}

export default function CompleteCycleModal({
  tuitionId,
  currentCount,
  totalClasses,
  defaultCycleName,
  isComplete
}: CompleteCycleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cycleName, setCycleName] = useState(defaultCycleName)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resetTuitionCycle(tuitionId, cycleName)
      setIsOpen(false)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to complete cycle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCycleName(defaultCycleName)
          setIsOpen(true)
        }}
        className={isComplete ? "btn-primary" : "btn-secondary"}
        style={{
          width: 'auto',
          padding: isComplete ? '1rem 2rem' : '0.6rem 1.2rem',
          fontSize: isComplete ? '1.05rem' : '0.9rem',
          background: isComplete ? 'var(--success)' : 'rgba(255, 255, 255, 0.4)',
          color: isComplete ? '#ffffff' : 'var(--text-main)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: isComplete ? '0 4px 14px 0 rgba(16, 185, 129, 0.3)' : undefined
        }}
      >
        <RotateCcw size={isComplete ? 20 : 16} />
        {isComplete ? 'Complete Month & Start New Cycle' : 'End Month / Start New Cycle'}
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem'
            }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
                onClick={() => !loading && setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card"
                style={{
                  width: '100%',
                  maxWidth: '430px',
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'none',
                  WebkitBackdropFilter: 'none',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  zIndex: 1001
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', color: 'var(--text-muted)' }}
                  disabled={loading}
                >
                  <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Sparkles size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Save to History</h3>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                  All <strong>{currentCount}</strong> classes from this cycle will be safely archived into history, and your counter will reset for the new month.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={15} /> Month or Cycle Name
                    </label>
                    <input
                      type="text"
                      name="cycleName"
                      className="input-field"
                      value={cycleName}
                      onChange={(e) => setCycleName(e.target.value)}
                      placeholder="e.g. October 2026 or Cycle 1"
                      required
                    />
                  </div>

                  <div style={{
                    background: 'rgba(0, 0, 0, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recorded Classes</span>
                    <span style={{ fontWeight: 600, color: currentCount >= totalClasses ? 'var(--success)' : 'var(--text-main)' }}>
                      {currentCount} / {totalClasses} classes
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary"
                      disabled={loading}
                      style={{ padding: '0.7rem 1.2rem', fontSize: '0.95rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                      style={{
                        width: 'auto',
                        padding: '0.7rem 1.4rem',
                        fontSize: '0.95rem',
                        background: 'var(--success)'
                      }}
                    >
                      {loading ? 'Saving...' : 'Save & Start New Cycle'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
