import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Pastikan payload memiliki objek pesan dan teks
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text;

      // 1. Validasi: Hanya proses jika pesan datang dari Grup Privat kalian berdua
      if (chatId === process.env.PRIVATE_GROUP_ID) {
        
        // 2. Tembak pesan ke Telegram Public Channel
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: process.env.PUBLIC_CHANNEL_ID,
            text: text,
            // parse_mode: 'HTML' // Bisa diaktifkan kalau kamu suka format bold/italic
          }),
        });
      }
    }

    // Selalu kembalikan status 200 OK agar Telegram tidak mengirim ulang (retry) webhook
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}