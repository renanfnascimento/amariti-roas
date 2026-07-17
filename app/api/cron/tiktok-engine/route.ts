import { NextResponse } from 'next/server';

// Rota de Cron Vercel - Chamada automaticamente todo dia
export async function GET(request: Request) {
  try {
    // 1. Simulação: Buscar todas as fotos da rota /api/drive
    // Na Vercel, faremos um fetch absoluto usando process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const driveRes = await fetch(`${baseUrl}/api/drive`);
    
    if (!driveRes.ok) {
      throw new Error('Falha ao conectar com o Drive Interno');
    }

    const { photos } = await driveRes.json();

    if (!photos || photos.length === 0) {
      return NextResponse.json({ message: 'Nenhuma foto encontrada no estoque.' }, { status: 404 });
    }

    // 2. Selecionar uma foto aleatória do estoque
    const randomIndex = Math.floor(Math.random() * photos.length);
    const selectedPhoto = photos[randomIndex];

    // 3. Simulação: Chamada para IA de Animação (Runway, Luma, Kling, etc)
    // const animationRes = await fetch('https://api.ia-de-video.com/animate', { ... })
    const aiSimulatedResponse = {
      status: 'success',
      generatedVideoUrl: 'https://exemplo.com/video-animado.mp4',
      script: 'Descubra a nova tendência que chegou na loja! Essa peça exclusiva é perfeita para o seu dia a dia.'
    };

    // 4. Inserir no Supabase (Kanban - Coluna: Captação/Gravação)
    // await supabase.from('projetos').insert({
    //   titulo: `TikTok Automático: ${selectedPhoto.name}`,
    //   plataforma_foco: 'TikTok Shop',
    //   status: 'Ideação & Roteiro',
    //   asset_original: selectedPhoto.webViewLink,
    //   script_gerado: aiSimulatedResponse.script
    // })

    return NextResponse.json({
      message: 'Motor TikTok executado com sucesso!',
      action: 'Projeto gerado e inserido no Kanban',
      photo_selected: selectedPhoto.name,
      folder: selectedPhoto.folderPath
    });

  } catch (error: any) {
    console.error('Erro no Motor Automático do TikTok:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
