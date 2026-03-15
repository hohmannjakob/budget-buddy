import BottomNav from '@/components/layout/BottomNav'
import FloatingActionButton from '@/components/layout/FloatingActionButton'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
      <FloatingActionButton />
    </div>
  )
}
