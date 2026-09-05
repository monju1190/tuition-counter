'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { KeyRound, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { changePassword } from '@/actions/auth'

export default function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await changePassword(formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        setSuccess('Password updated successfully!')
        setTimeout(() => {
          setIsOpen(false)
          setSuccess('')
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-ghost"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          fontSize: '0.9rem',
          padding: '0.4rem 0.8rem',
          borderRadius: '8px',
          transition: 'all 0.2s'
        }}
      >
        <KeyRound size={16} />
        Change Password
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
                onClick={() => setIsOpen(false)}
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
                  background: 'rgba(255, 255, 255, 0.85)', 
                  backdropFilter: 'none',
                  WebkitBackdropFilter: 'none',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', 
                  zIndex: 1001 
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>

                <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Change Password</h3>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" name="currentPassword" className="input-field" placeholder="Enter current password" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" name="newPassword" className="input-field" placeholder="Enter new password" required />
                  </div>
                  
                  {error && (
                    <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div style={{ color: 'green', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {success}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : <><KeyRound size={18} /> Update Password</>}
                  </button>
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
