'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { login } from '@/actions/auth'
import { BookOpen, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            width: '64px', height: '64px', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--accent)'
          }}
        >
          <BookOpen size={32} />
        </motion.div>
        
        <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Tuition Tracker</h1>
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>Welcome back. Please sign in.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Username</label>
            <input 
              type="text" 
              name="username"
              className="input-field" 
              placeholder="e.g., Fatema"
              required 
            />
          </div>
          
          <div className="form-group" style={{ textAlign: 'left', position: 'relative' }}>
            <label className="form-label">Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              className="input-field" 
              placeholder="••••••••"
              style={{ paddingRight: '2.5rem' }}
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '36px', 
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'left' }}
            >
              {error}
            </motion.p>
          )}
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </main>
  )
}
