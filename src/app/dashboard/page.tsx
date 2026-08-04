import { getSession } from '@/actions/auth'
import prisma from '@/lib/db'
import Link from 'next/link'
import { Plus, Book, Trash2, CalendarDays } from 'lucide-react'
import { createTuition, deleteTuition } from '@/actions/tuitions'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) return null

  const tuitions = await prisma.tuition.findMany({
    where: { userId: session.id },
    include: {
      _count: {
        select: { entries: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>My Tuitions</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Manage your classes and cycles.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {tuitions.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <Book size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't added any tuitions yet.</p>
          </div>
        ) : (
          tuitions.map((tuition) => {
            const count = tuition._count.entries
            const progress = (count / tuition.totalClasses) * 100

            return (
              <div key={tuition.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Link href={`/dashboard/tuition/${tuition.id}`} style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{tuition.studentName}</h3>
                    <p style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500 }}>{tuition.subject}</p>
                  </Link>
                  <form action={async () => {
                    'use server'
                    await deleteTuition(tuition.id)
                  }}>
                    <button type="submit" className="icon-btn-danger">
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>

                <Link href={`/dashboard/tuition/${tuition.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CalendarDays size={14} /> Progress</span>
                    <span style={{ fontWeight: 600, color: count >= tuition.totalClasses ? 'var(--success)' : 'var(--text-main)' }}>
                      {count} / {tuition.totalClasses} classes
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(progress, 100)}%`,
                      background: count >= tuition.totalClasses ? 'var(--success)' : 'var(--accent)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </Link>
              </div>
            )
          })
        )}
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Add New Tuition</h3>
        <form action={createTuition}>
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
          <button type="submit" className="btn-primary">
            <Plus size={18} /> Add Tuition
          </button>
        </form>
      </div>
    </div>
  )
}
