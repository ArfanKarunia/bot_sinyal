import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.message) {
      const chatId = body.message.chat.id.toString();

      // Validasi dari Grup Privat
      if (chatId === process.env.PRIVATE_GROUP_ID) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const publicChannelId = process.env.PUBLIC_CHANNEL_ID; // Sesuai nama variabel barumu di Vercel
        
        let endpoint = '';
        let payload: any = {
          chat_id: publicChannelId,
        };

        // 1. Cek apakah pesan berupa Gambar (Photo)
        if (body.message.photo) {
          endpoint = 'sendPhoto';
          // Ambil resolusi gambar terbesar (selalu berada di index terakhir array)
          payload.photo = body.message.photo[body.message.photo.length - 1].file_id;
          // Ambil caption (teks) jika ada
          payload.caption = body.message.caption || '';
        } 
        // 2. Cek apakah pesan berupa GIF / Dokumen
        else if (body.message.animation || body.message.document) {
           endpoint = 'sendDocument';
           const doc = body.message.animation || body.message.document;
           payload.document = doc.file_id;
           payload.caption = body.message.caption || '';
        }
        // 3. Cek apakah pesan berupa Teks biasa
        else if (body.message.text) {
          endpoint = 'sendMessage';
          payload.text = body.message.text;
        }

        // Eksekusi pengiriman ke Channel Publik
        if (endpoint) {
          await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}