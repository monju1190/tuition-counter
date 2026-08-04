import { getSession, logout } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <>
      <header style={{ 
        background: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--accent)',
              width: '36px', height: '36px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <span>{session.username}'s Dashboard</span>
          </div>
          
          <form action={logout}>
            <button type="submit" className="btn-ghost" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.9rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}>
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="container animate-in">
        {children}
      </main>
    </>
  )
}
