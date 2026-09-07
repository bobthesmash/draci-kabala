import { NextRequest } from 'next/server';

function splitTextIntoChunks(text: string, maxLen = 180): string[] {
  const clean = text
    .replace(/```[\s\S]*?```/g, '') // Odstranit kódové bloky
    .replace(/[*_#`~[\]()]/g, '')
    .replace(/>/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/kabala_json/g, '')
    .trim();

  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  const sentences = clean.split(/(?<=[.!?,;])\s+/);
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length <= maxLen) {
        current = s;
      } else {
        // Velmi dlouhý úsek bez interpunkce - rozdělíme po slovech
        const words = s.split(' ');
        current = '';
        for (const w of words) {
          if ((current + ' ' + w).trim().length <= maxLen) {
            current = (current + ' ' + w).trim();
          } else {
            if (current) chunks.push(current);
            current = w;
          }
        }
      }
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || '';

  if (!text.trim()) {
    return new Response('Missing text', { status: 400 });
  }

  const chunks = splitTextIntoChunks(text);
  if (chunks.length === 0) {
    return new Response('Empty text', { status: 400 });
  }

  try {
    const audioBuffers: Uint8Array[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=cs&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      if (!res.ok) {
        throw new Error(`TTS fetch error: ${res.status}`);
      }

      const buf = await res.arrayBuffer();
      audioBuffers.push(new Uint8Array(buf));
    }

    // Spojení všech MP3 bufferů do jednoho plynulého audio souboru
    const totalLength = audioBuffers.reduce((acc, b) => acc + b.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const b of audioBuffers) {
      combined.set(b, offset);
      offset += b.length;
    }

    return new Response(combined, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    });
  } catch (err: any) {
    console.error('Chyba při syntéze českého hlasu:', err);
    return new Response('TTS error', { status: 500 });
  }
}
