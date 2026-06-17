import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Toaster } from '@/components/ui/Toaster'
import { ConnectionGate } from '@/components/admin/ConnectionGate'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionGate>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar />
          <main className="p-lg">{children}</main>
        </div>
        <Toaster />
      </div>
    </ConnectionGate>
  )
}
