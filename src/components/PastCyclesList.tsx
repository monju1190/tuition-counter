'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Calendar, Trash2, CheckCircle2, History, Clock } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { deleteTuitionCycle } from '@/actions/tuitions'

interface CycleEntry {
  id: string
  date: string | Date
}

interface PastCycle {
  id: string
  cycleNumber: number
  name: string | null
  totalClasses: number
  completedAt: string | Date
  entries: CycleEntry[]
}

interface PastCyclesListProps {
  cycles: PastCycle[]
  tuitionId: string
}

export default function PastCyclesList({ cycles, tuitionId }: PastCyclesListProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [deleteCycleId, setDeleteCycleId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleDelete = async () => {
    if (!deleteCycleId) return
    setLoading(true)
    try {
      await deleteTuitionCycle(deleteCycleId, tuitionId)
      setDeleteCycleId(null)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to delete cycle')
    } finally {
      setLoading(false)
    }
  }

  if (cycles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        background: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '12px',
        border: '1px dashed var(--border-color)'
      }}>
        <History size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem', opacity: 0.7 }} />
        <p style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.25rem' }}>No past months in history yet</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          When you complete a month and click "Start New Cycle", the classes will be safely saved here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {cycles.map((cycle) => {
        const isExpanded = !!expandedIds[cycle.id]
        const hasEntries = cycle.entries.length > 0
        const firstEntry = hasEntries ? cycle.entries[0] : null
        const lastEntry = hasEntries ? cycle.entries[cycle.entries.length - 1] : null

        const dateRangeStr = (firstEntry && lastEntry)
          ? `${formatInTimeZone(new Date(firstEntry.date), 'Asia/Dhaka', 'dd MMM')} – ${formatInTimeZone(new Date(lastEntry.date), 'Asia/Dhaka', 'dd MMM yyyy')}`
          : formatInTimeZone(new Date(cycle.completedAt), 'Asia/Dhaka', 'dd MMM yyyy')

        const isFullyCompleted = cycle.entries.length >= cycle.totalClasses

        return (
          <div
            key={cycle.id}
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Header row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div
                onClick={() => toggleExpand(cycle.id)}
                style={{ cursor: 'pointer', flex: 1, minWidth: '200px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {cycle.name || `Cycle ${cycle.cycleNumber}`}
                  </h4>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '20px',
                    background: isFullyCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(79, 70, 229, 0.1)',
                    color: isFullyCompleted ? 'var(--success)' : 'var(--accent)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {isFullyCompleted && <CheckCircle2 size={12} />}
                    {cycle.entries.length} / {cycle.totalClasses} classes
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} /> {dateRangeStr}
                  </span>
                  <span>•</span>
                  <span>Completed: {formatInTimeZone(new Date(cycle.completedAt), 'Asia/Dhaka', 'dd MMM yyyy')}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => toggleExpand(cycle.id)}
                  className="btn-ghost"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px'
                  }}
                  title={isExpanded ? 'Hide class breakdown' : 'Show all classes'}
                >
                  {isExpanded ? (
                    <>Hide <ChevronUp size={16} /></>
                  ) : (
                    <>Details <ChevronDown size={16} /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteCycleId(cycle.id)}
                  className="icon-btn-danger"
                  style={{ padding: '0.45rem', borderRadius: '8px' }}
                  title="Delete from history"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Expandable Class Entries */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    marginTop: '1.2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <p style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.75rem'
                    }}>
                      Archived Classes ({cycle.entries.length})
                    </p>

                    {cycle.entries.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No individual classes were logged in this cycle.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {cycle.entries.map((entry, idx) => (
                          <div
                            key={entry.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.8rem',
                              padding: '0.65rem 0.9rem',
                              background: 'rgba(255, 255, 255, 0.4)',
                              borderRadius: '8px',
                              fontSize: '0.88rem'
                            }}
                          >
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'rgba(0, 0, 0, 0.06)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-muted)'
                            }}>
                              {idx + 1}
                            </span>

                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                                {formatInTimeZone(new Date(entry.date), 'Asia/Dhaka', 'EEEE')}
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Clock size={12} />
                                {formatInTimeZone(new Date(entry.date), 'Asia/Dhaka', 'dd MMM yyyy, h:mm a')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Delete Confirmation Modal */}
      {deleteCycleId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            onClick={() => !loading && setDeleteCycleId(null)}
          />
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '360px',
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.92)',
              zIndex: 1001,
              textAlign: 'center'
            }}
          >
            <h3 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Delete from History?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.4 }}>
              Are you sure you want to delete this completed month? All classes archived in this month will be removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteCycleId(null)}
                className="btn-secondary"
                disabled={loading}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn-primary"
                disabled={loading}
                style={{ background: 'var(--danger)', width: 'auto', padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
