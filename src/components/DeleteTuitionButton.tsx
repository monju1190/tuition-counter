'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteTuition } from '@/actions/tuitions'

export default function DeleteTuitionButton({ tuitionId }: { tuitionId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteTuition(tuitionId)
      setIsOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className="icon-btn-danger" 
        title="Delete this tuition"
      >
        <Trash2 size={18} />
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
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
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
                  maxWidth: '350px',
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.9)',
                  zIndex: 1001,
                  textAlign: 'center'
                }}
              >
                <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Delete Tuition</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Are you sure you want to delete this tuition? This will also remove all class entries and cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="btn-primary" 
                    style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete} 
                    className="btn-primary" 
                    style={{ background: 'var(--danger)' }}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
