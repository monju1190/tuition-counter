'use client'

import { useState } from 'react'
import { Trash2, Edit2, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteClassEntry, updateClassEntry } from '@/actions/tuitions'
import { format } from 'date-fns'

export default function ClassEntryActions({ entry, tuitionId }: { entry: any, tuitionId: string }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // format for datetime-local input: YYYY-MM-DDTHH:mm
  const defaultDateStr = format(new Date(entry.date), "yyyy-MM-dd'T'HH:mm")

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteClassEntry(entry.id, tuitionId)
      setIsDeleteOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const newDateStr = formData.get('date') as string
    
    try {
      await updateClassEntry(entry.id, tuitionId, new Date(newDateStr).toISOString())
      setIsEditOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        type="button" 
        onClick={() => setIsEditOpen(true)}
        className="icon-btn" 
        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }} 
        title="Edit this class"
      >
        <Edit2 size={16} />
      </button>

      <button 
        type="button" 
        onClick={() => setIsDeleteOpen(true)}
        className="icon-btn-danger" 
        style={{ padding: '0.5rem' }} 
        title="Remove this class"
      >
        <Trash2 size={16} />
      </button>

      <AnimatePresence>
        {isDeleteOpen && (
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
              onClick={() => !loading && setIsDeleteOpen(false)}
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
              <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Delete Class</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Are you sure you want to delete this class? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => setIsDeleteOpen(false)} 
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

        {isEditOpen && (
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
              onClick={() => !loading && setIsEditOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '400px',
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.9)',
                zIndex: 1001
              }}
            >
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Edit Class Date & Time</h3>
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <label className="form-label">Date and Time</label>
                  <input 
                    type="datetime-local" 
                    name="date" 
                    className="input-field" 
                    defaultValue={defaultDateStr} 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
