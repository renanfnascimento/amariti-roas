import { NextResponse } from 'next/server';

// Rota de Cron Vercel - Chamada automaticamente todo dia (ex: 4:00 AM)
export async function GET(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const driveRes = await fetch(`${baseUrl}/api/drive`);
    
    if (!driveRes.ok) {
      throw new Error('Falha ao conectar com o Drive Interno');
    }

    const { photos } = await driveRes.json();

    if (!photos || photos.length < 48) {
      // Idealmente precisamos de 48 fotos para 12 vídeos (4 backups por vídeo)
      return NextResponse.json({ 
        message: `Estoque baixo. Foram encontradas apenas ${photos?.length || 0} fotos. Precisamos de pelo menos 48 para fechar as quotas.` 
      }, { status: 400 });
    }

    // 1. Ordenar por data de alteração (Mais recentes primeiro)
    // O /api/drive já faz o orderBy: 'modifiedTime desc' na API do Google, 
    // então a array `photos` já vem perfeitamente ordenada dos mais novos pros mais velhos.

    // 2. Pegar as 48 fotos mais recentes e separar em 12 blocos de 4 fotos
    const dailyQuotaSlots = [];
    let photoIndex = 0;

    for (let i = 1; i <= 12; i++) {
      const slotPhotos = [
        photos[photoIndex],
        photos[photoIndex + 1],
        photos[photoIndex + 2],
        photos[photoIndex + 3]
      ];
      
      // A categoria predominante (pegamos da primeira foto) para gerar o prompt
      const category = slotPhotos[0].folderPath || 'roupa';

      dailyQuotaSlots.push({
        id: `video-${i}`,
        title: `Vídeo ${String(i).padStart(2, '0')}`,
        platform: i <= 4 ? 'TikTok Shop' : i <= 8 ? 'Instagram' : 'Facebook',
        status: 'Gerando no Veo3',
        category,
        photos: slotPhotos.map(p => p.thumbnailLink || p.iconLink),
        prompt: `Crie um video usando a imagem da modelo da foto dizendo olha essa ${category} linda etc etc. lembrando que o veo3 gera videos de 10s`
      });

      photoIndex += 4;
    }

    // 3. Salvar no Banco de Dados (Mock)
    // Aqui nós inseriríamos no Supabase a quota do dia.
    // await supabase.from('daily_quotas').insert({ date: 'hoje', slots: dailyQuotaSlots })

    return NextResponse.json({
      message: 'Motor TikTok executado com sucesso às 4:00 AM!',
      action: '12 vídeos separados com 4 backups cada e prompts prontos.',
      quota_generated: dailyQuotaSlots
    });

  } catch (error: any) {
    console.error('Erro no Motor Automático do TikTok:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
