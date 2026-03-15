import BottomNav from '@/components/layout/BottomNav'
import FloatingActionButton from '@/components/layout/FloatingActionButton'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ height: '100dvh', overflow: 'hidden' }}>
      <main style={{ height: '100%', overflow: 'hidden' }}>
        {children}
      </main>
      <BottomNav />
      <FloatingActionButton />
    </div>
  )
}
