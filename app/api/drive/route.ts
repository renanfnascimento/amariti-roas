import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const VIDEOS_FOLDER_ID = '1J-blceVqi8m1gUmex-Y7WZN4HtYikqf4';
const PHOTOS_FOLDER_ID = '1sKOHgN8EUR0WQNUqUsXad-4jdPC5_8Iu';

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Credenciais do Google Drive pendentes na Vercel.' },
        { status: 401 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 1. Otimização extrema: Buscar todas as pastas de uma vez (evita N+1 requests)
    const foldersRes = await drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, parents)',
      pageSize: 1000,
    });
    
    const folderMap = new Map();
    (foldersRes.data.files || []).forEach(f => {
      folderMap.set(f.id, { name: f.name, parent: f.parents?.[0] });
    });

    // Função para construir o caminho "calça > vermelha" subindo a árvore
    const getFolderPath = (parentId: string, rootId: string) => {
      const path = [];
      let currentId = parentId;
      
      // Sobe a árvore até encontrar a raiz (ex: pasta de Roupas) ou bater no teto
      while (currentId && currentId !== rootId) {
        const folder = folderMap.get(currentId);
        if (folder) {
          path.unshift(folder.name);
          currentId = folder.parent;
        } else {
          break; // Pasta não encontrada ou sem acesso
        }
      }
      return path.length > 0 ? path.join(' / ') : 'Raiz';
    };

    // 2. Buscar todos os arquivos (Vídeos e Imagens) que a conta tem acesso
    const filesRes = await drive.files.list({
      q: `(mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, iconLink, thumbnailLink, parents)',
      orderBy: 'modifiedTime desc',
      pageSize: 1000, // Ajustar se tiver mais de 1000 arquivos
    });

    const allFiles = filesRes.data.files || [];

    const videos = [];
    const photos = [];

    // 3. Separar e etiquetar cada arquivo
    allFiles.forEach(file => {
      const parentId = file.parents?.[0];
      if (!parentId) return;

      // Verifica se o arquivo pertence à árvore de Vídeos
      let isVideoTree = false;
      let isPhotoTree = false;
      let curr = parentId;
      
      while (curr) {
        if (curr === VIDEOS_FOLDER_ID) { isVideoTree = true; break; }
        if (curr === PHOTOS_FOLDER_ID) { isPhotoTree = true; break; }
        curr = folderMap.get(curr)?.parent;
      }

      if (isVideoTree && file.mimeType?.includes('video')) {
        videos.push({
          ...file,
          folderPath: getFolderPath(parentId, VIDEOS_FOLDER_ID)
        });
      } else if (isPhotoTree && file.mimeType?.includes('image')) {
        photos.push({
          ...file,
          folderPath: getFolderPath(parentId, PHOTOS_FOLDER_ID)
        });
      }
    });

    return NextResponse.json({ videos, photos });
  } catch (error: any) {
    console.error('Error fetching from Google Drive:', error);
    return NextResponse.json(
      { error: 'Erro ao se comunicar com o Google Drive.' },
      { status: 500 }
    );
  }
}
