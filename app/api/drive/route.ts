import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const FOLDER_ID = '1J-blceVqi8m1gUmex-Y7WZN4HtYikqf4';

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

    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, iconLink, thumbnailLink)',
      orderBy: 'modifiedTime desc',
    });

    const files = response.data.files || [];

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Error fetching from Google Drive:', error);
    return NextResponse.json(
      { error: 'Erro ao se comunicar com o Google Drive.' },
      { status: 500 }
    );
  }
}
