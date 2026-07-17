"use client"

import React, { useState, useRef, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Cloud, Folder, Video, Image as ImageIcon, MoreVertical, UploadCloud, CheckCircle2, X, AlertCircle, File, Shirt } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// TYPES
interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  iconLink: string
  thumbnailLink?: string
}

export default function AssetsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [videos, setVideos] = useState<DriveFile[]>([])
  const [photos, setPhotos] = useState<DriveFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchDriveFiles() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/drive')
        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.error || 'Falha ao buscar arquivos do Drive')
        }
        
        setVideos(data.videos)
        setPhotos(data.photos)
        setIsConnected(true)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDriveFiles()
  }, [])

  const handleSendToKanban = (assetName: string) => {
    setOpenDropdownId(null)
    setToastMessage(`Arquivo "${assetName}" enviado para a fila de produção (TikTok)`)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const renderIcon = (mimeType: string, iconLink?: string) => {
    if (mimeType.includes('folder')) return <Folder className="text-indigo-400" size={32} />
    if (mimeType.includes('video')) return <Video className="text-pink-400" size={32} />
    if (mimeType.includes('image')) return <ImageIcon className="text-emerald-400" size={32} />
    
    return iconLink ? (
      <img src={iconLink} alt="icon" className="w-8 h-8 opacity-80" />
    ) : (
      <File className="text-gray-400" size={32} />
    )
  }

  const renderAssetGrid = (assets: DriveFile[], emptyMessage: string) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {/* SKELETON LOADER */}
      {isLoading && Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card p-4 rounded-xl flex flex-col animate-pulse">
          <div className="h-32 bg-white/10 rounded-lg mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/5 rounded w-1/2 mt-2"></div>
          <div className="w-full h-8 bg-white/5 rounded-md mt-4"></div>
        </div>
      ))}

      {/* REAL FILES */}
      {!isLoading && assets.map((asset) => (
        <div key={asset.id} className="glass-card rounded-xl group hover:-translate-y-1 transition-all flex flex-col overflow-hidden">
          {/* Visual Header / Cover */}
          <div className="h-32 bg-black/40 relative flex items-center justify-center overflow-hidden border-b border-white/5">
            {asset.thumbnailLink ? (
              <img src={asset.thumbnailLink} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              renderIcon(asset.mimeType, asset.iconLink)
            )}
            
            {/* DROPDOWN MENU SIMULATION */}
            <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenDropdownId(openDropdownId === asset.id ? null : asset.id)
                }}
                className="p-1.5 text-gray-300 hover:text-white bg-black/50 hover:bg-black/80 rounded-md transition-colors backdrop-blur-sm"
              >
                <MoreVertical size={16} />
              </button>
              
              {openDropdownId === asset.id && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 top-8 z-50 min-w-[12rem] overflow-hidden rounded-md border border-white/10 bg-[#1e1e2d] p-1 text-white shadow-xl animate-in fade-in-0 zoom-in-95"
                >
                  <button 
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded-sm outline-none"
                    onClick={() => {
                      setOpenDropdownId(null)
                      window.open(asset.webViewLink, '_blank')
                    }}
                  >
                    Visualizar no Drive
                  </button>
                  <button 
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded-sm outline-none"
                    onClick={() => setOpenDropdownId(null)}
                  >
                    Mover para Projeto
                  </button>
                  <div className="h-px bg-white/10 my-1 mx-1" />
                  <button 
                    className="w-full text-left px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-sm outline-none"
                    onClick={() => setOpenDropdownId(null)}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 flex flex-col flex-1">
            <h4 className="text-white font-medium text-sm line-clamp-2 leading-tight mb-1 group-hover:text-indigo-300 transition-colors" title={asset.name}>
              {asset.name}
            </h4>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span className="truncate">{asset.mimeType.split('/').pop()}</span>
            </div>

            {/* SEND TO KANBAN BUTTON */}
            <button 
              onClick={() => handleSendToKanban(asset.name)}
              className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white font-medium py-2 rounded-md transition-colors"
            >
              Enviar para TikTok
            </button>
          </div>
        </div>
      ))}

      {!isLoading && !error && assets.length === 0 && (
        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-xl">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      )}
    </div>
  )

  return (
    <AppLayout>
      <div className="flex flex-col h-full relative">
        
        {/* TOAST */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1e1e2d] border border-white/10 text-white px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="text-green-400" size={20} />
            <p className="text-sm font-medium">{toastMessage}</p>
            <button onClick={() => setToastMessage(null)} className="ml-4 text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Central de Mídias & Drive</h1>
            <p className="text-gray-400 mt-1">Gerencie as fotos das roupas e os vídeos animados.</p>
          </div>
          
          <button 
            disabled
            className={`px-4 py-2.5 rounded-md flex items-center gap-2 font-medium transition-colors shadow-lg ${
              isConnected 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-indigo-600/50 text-white shadow-indigo-500/20 cursor-not-allowed opacity-50'
            }`}
          >
            <Cloud size={18} />
            {isConnected ? 'Pastas Conectadas' : 'Conectando ao Drive...'}
          </button>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-red-400 font-medium">Erro de Integração</h4>
              <p className="text-red-400/80 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* TABS VIEW */}
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="bg-white/5 border border-white/5 mb-6">
            <TabsTrigger value="photos" className="gap-2">
              <Shirt size={16} /> Estoque (Fotos de Roupas)
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video size={16} /> Vídeos Animados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-4">
            {/* DROPZONE */}
            <div className="w-full bg-black/20 border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer mb-8 group">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} className="text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Arraste fotos de roupas aqui</h3>
              <p className="text-gray-400 text-xs">As fotos serão salvas diretamente na pasta Roupas do Drive.</p>
            </div>
            {renderAssetGrid(photos, "Nenhuma foto de roupa encontrada na pasta.")}
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
             {/* DROPZONE */}
             <div className="w-full bg-black/20 border-2 border-dashed border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer mb-8 group">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} className="text-pink-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Arraste vídeos finalizados aqui</h3>
              <p className="text-gray-400 text-xs">Os vídeos irão direto para o acervo de postagem.</p>
            </div>
            {renderAssetGrid(videos, "Nenhum vídeo encontrado na pasta.")}
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  )
}
