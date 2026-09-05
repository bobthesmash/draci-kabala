import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get('prompt') || 'epic fantasy mystical dark temple, glowing golden runes, vivid lighting, 8k';
  const seed = searchParams.get('seed') || `${Date.now()}`;

  // Vytvoříme živý a kontrastní prompt, aby ilustrace nebyly příliš tmavé
  const vividPrompt = `epic fantasy painting, luminous glowing sacred amber light, mystical golden radiance, vivid high contrast, cinematic atmosphere: ${prompt}`;
  const encodedPrompt = encodeURIComponent(vividPrompt);

  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=960&height=540&nologo=true&seed=${seed}&model=flux`;

  try {
    const res = await fetch(pollinationsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      // 15 sekund timeout
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      // Fallback na standardní turbo model
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true&seed=${seed}`;
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const imageBuffer = await fallbackRes.arrayBuffer();
        return new Response(imageBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400, immutable'
          }
        });
      }
      throw new Error(`Pollinations error: ${res.status}`);
    }

    const imageBuffer = await res.arrayBuffer();
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    });
  } catch (error: any) {
    console.error('Chyba při generování obrázku:', error);
    // Přesměrovat přímo na pollinations jako záloha
    return Response.redirect(pollinationsUrl, 302);
  }
}
