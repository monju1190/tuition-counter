import { getSession } from '@/actions/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Calendar, RotateCcw, Trash2 } from 'lucide-react'
import { addClassEntry, resetTuitionCycle, deleteClassEntry } from '@/actions/tuitions'
import { format } from 'date-fns'
import ClassEntryActions from '@/components/ClassEntryActions'
import LocalTime from '@/components/LocalTime'

export const dynamic = 'force-dynamic'

export default async function TuitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const session = await getSession()
  if (!session) return redirect('/')

  const tuition = await prisma.tuition.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!tuition || tuition.userId !== session.id) {
    return redirect('/dashboard')
  }

  const count = tuition.entries.length
  const isComplete = count >= tuition.totalClasses
  const progress = (count / tuition.totalClasses) * 100

  return (
    <div>
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        {isComplete && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--success)', color: 'white', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Cycle Complete! You've reached {tuition.totalClasses} classes.
          </div>
        )}
        
        <h1 className="page-title" style={{ fontSize: '1.8rem', marginTop: isComplete ? '1.5rem' : '0' }}>{tuition.studentName}</h1>
        <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>{tuition.subject}</p>
        
        <div style={{ 
          margin: '3rem auto',
          width: '180px', height: '180px', 
          borderRadius: '50%',
          background: isComplete ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          border: `4px solid ${isComplete ? 'var(--success)' : 'var(--accent)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 40px ${isComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
        }}>
          <span style={{ fontSize: '3.5rem', fontWeight: 700, color: isComplete ? 'var(--success)' : 'var(--text-main)', lineHeight: 1 }}>{count}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>/ {tuition.totalClasses}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isComplete ? (
            <form action={async () => {
              'use server'
              // add class for today
              await addClassEntry(tuition.id, new Date().toISOString())
            }}>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                <CheckCircle2 size={20} /> Add Class Today
              </button>
            </form>
          ) : (
            <form action={async () => {
              'use server'
              await resetTuitionCycle(tuition.id)
            }}>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.1rem', background: 'var(--success)' }}>
                <RotateCcw size={20} /> Start New Cycle
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} /> Class History
        </h3>
        {tuition.entries.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No classes recorded for this cycle yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {tuition.entries.map((entry, idx) => (
              <div key={entry.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '1rem', 
                background: 'rgba(0,0,0,0.02)', 
                borderRadius: '8px' 
              }}>
                <div style={{ 
                  background: 'rgba(0,0,0,0.05)', 
                  width: '32px', height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 600
                }}>
                  {tuition.entries.length - idx}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>
                    <LocalTime date={entry.date} formatStr="EEEE" />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <LocalTime date={entry.date} formatStr="dd MMM yyyy, h:mm a" />
                  </div>
                </div>
                <ClassEntryActions entry={entry} tuitionId={tuition.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
