import { AppLayout } from '@/components/layout/AppLayout'
import { CloudUpload } from 'lucide-react'

export default function AssetsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <CloudUpload size={64} className="text-indigo-500/50 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Drive & Assets</h1>
        <p className="text-gray-400">Esta funcionalidade estará disponível em breve.</p>
      </div>
    </AppLayout>
  )
}
