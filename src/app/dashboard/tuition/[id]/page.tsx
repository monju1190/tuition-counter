import { getSession } from '@/actions/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Calendar, History, Sparkles } from 'lucide-react'
import { addClassEntry } from '@/actions/tuitions'
import { formatInTimeZone } from 'date-fns-tz'
import ClassEntryActions from '@/components/ClassEntryActions'
import CompleteCycleModal from '@/components/CompleteCycleModal'
import PastCyclesList from '@/components/PastCyclesList'

export const dynamic = 'force-dynamic'

export default async function TuitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const session = await getSession()
  if (!session) return redirect('/')

  const tuition = await prisma.tuition.findUnique({
    where: { id },
    include: {
      entries: {
        where: { cycleId: null },
        orderBy: { date: 'desc' }
      },
      cycles: {
        orderBy: { cycleNumber: 'desc' },
        include: {
          entries: {
            orderBy: { date: 'asc' }
          }
        }
      }
    }
  })

  if (!tuition || tuition.userId !== session.id) {
    return redirect('/dashboard')
  }

  const count = tuition.entries.length
  const isComplete = count >= tuition.totalClasses
  const currentCycleNumber = tuition.cycles.length + 1
  const defaultCycleName = `${formatInTimeZone(new Date(), 'Asia/Dhaka', 'MMMM yyyy')} (Cycle ${currentCycleNumber})`

  return (
    <div>
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Main Active Cycle Card */}
      <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        {isComplete && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: 'var(--success)', color: 'white',
            padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
          }}>
            <Sparkles size={16} /> Month Complete! Reached {tuition.totalClasses} classes.
          </div>
        )}
        
        <div style={{ marginTop: isComplete ? '1rem' : '0' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: 'rgba(79, 70, 229, 0.08)',
            color: 'var(--accent)',
            marginBottom: '0.5rem'
          }}>
            Active Month • Cycle #{currentCycleNumber}
          </span>
          <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>{tuition.studentName}</h1>
          <p className="page-subtitle" style={{ fontSize: '1.05rem', margin: '0 auto 1.5rem' }}>{tuition.subject}</p>
        </div>
        
        {/* Progress Counter Circle */}
        <div style={{ 
          margin: '1.5rem auto 2.5rem',
          width: '180px', height: '180px', 
          borderRadius: '50%',
          background: isComplete ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          border: `4px solid ${isComplete ? 'var(--success)' : 'var(--accent)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 35px ${isComplete ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.2)'}`,
          transition: 'all 0.3s ease'
        }}>
          <span style={{ fontSize: '3.5rem', fontWeight: 700, color: isComplete ? 'var(--success)' : 'var(--text-main)', lineHeight: 1 }}>
            {count}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.4rem' }}>
            / {tuition.totalClasses}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isComplete ? (
            <>
              <form action={async () => {
                'use server'
                await addClassEntry(tuition.id, new Date().toISOString())
              }}>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
                  <CheckCircle2 size={18} /> Add Class Today
                </button>
              </form>

              {count > 0 && (
                <CompleteCycleModal
                  tuitionId={tuition.id}
                  currentCount={count}
                  totalClasses={tuition.totalClasses}
                  defaultCycleName={defaultCycleName}
                  isComplete={false}
                />
              )}
            </>
          ) : (
            <CompleteCycleModal
              tuitionId={tuition.id}
              currentCount={count}
              totalClasses={tuition.totalClasses}
              defaultCycleName={defaultCycleName}
              isComplete={true}
            />
          )}
        </div>
      </div>

      {/* Current Month / Cycle Class Log */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
            <Calendar size={18} style={{ color: 'var(--accent)' }} /> Current Cycle Classes
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {count} recorded in this cycle
          </span>
        </div>

        {tuition.entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <p>No classes recorded for this cycle yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Tap "Add Class Today" above to log a class.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tuition.entries.map((entry, idx) => (
              <div key={entry.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.9rem 1rem', 
                background: 'rgba(255, 255, 255, 0.35)', 
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}>
                <div style={{ 
                  background: 'rgba(79, 70, 229, 0.1)', 
                  color: 'var(--accent)',
                  width: '32px', height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 600,
                  flexShrink: 0
                }}>
                  {tuition.entries.length - idx}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {formatInTimeZone(new Date(entry.date), 'Asia/Dhaka', "EEEE")}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {formatInTimeZone(new Date(entry.date), 'Asia/Dhaka', "dd MMM yyyy, h:mm a")}
                  </div>
                </div>
                <ClassEntryActions 
                  entryId={entry.id} 
                  tuitionId={tuition.id} 
                  initialDateStr={formatInTimeZone(new Date(entry.date), 'Asia/Dhaka', "yyyy-MM-dd'T'HH:mm")} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Completed Months / History Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
            <History size={18} style={{ color: 'var(--success)' }} /> Completed Months History
          </h3>
          {tuition.cycles.length > 0 && (
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--success)'
            }}>
              {tuition.cycles.length} {tuition.cycles.length === 1 ? 'Month Archived' : 'Months Archived'}
            </span>
          )}
        </div>

        <PastCyclesList cycles={tuition.cycles} tuitionId={tuition.id} />
      </div>
    </div>
  )
}
