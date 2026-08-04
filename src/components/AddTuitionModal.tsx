'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createTuition } from '@/actions/tuitions'

export default function AddTuitionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createTuition(formData)
      setIsOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
        style={{ width: 'auto', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
      >
        <Plus size={16} /> Add Tuition
      </button>

      <AnimatePresence>
        {isOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '400px', position: 'relative', background: 'rgba(255,255,255,0.6)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Add New Tuition</h3>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Student Name / Batch</label>
                  <input type="text" name="studentName" className="input-field" placeholder="e.g. Class 10 Math Batch" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <input type="text" name="subject" className="input-field" placeholder="e.g. Higher Math" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Classes per Month/Cycle</label>
                  <input type="number" name="totalClasses" className="input-field" defaultValue={12} min={1} max={30} required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : <><Plus size={18} /> Add Tuition</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
