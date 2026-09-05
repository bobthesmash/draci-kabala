import { NextRequest } from 'next/server';
import { buildGameMasterPrompt } from '@/lib/system_prompt';
import { PlayerCharacter, StoryMessage } from '@/lib/game_state';

interface ChatRequestBody {
  character: PlayerCharacter;
  messages: StoryMessage[];
  actionText: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { character, messages, actionText } = body;

    const apiKey = process.env.NVIDIA_API_KEY || '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';
    const primaryModel = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';
    const fallbackModel = 'meta/llama-3.2-11b-vision-instruct';

    const systemPrompt = buildGameMasterPrompt(character);

    // Sestavíme historii posledních 8 zpráv
    const recentMessages = messages.slice(-8).map(m => ({
      role: m.sender === 'gm' ? 'assistant' : 'user',
      content: m.text
    }));

    const conversation = [
      { role: 'system', content: systemPrompt },
      ...recentMessages
    ];

    if (actionText) {
      conversation.push({ role: 'user', content: actionText });
    }

    // Helper pro volání NVIDIA API s případným fallbackem
    const callNvidiaStream = async (modelName: string): Promise<Response> => {
      return await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: conversation,
          max_tokens: 2048,
          temperature: 0.6,
          top_p: 0.95,
          stream: true
        })
      });
    };

    let nvidiaRes = await callNvidiaStream(primaryModel);

    // Pokud primární model vrátí chybu (např. 503 Worker overload), přepneme na osvědčený fallback
    if (!nvidiaRes.ok && primaryModel !== fallbackModel) {
      console.warn(`Primary model ${primaryModel} returned ${nvidiaRes.status}, falling back to ${fallbackModel}`);
      nvidiaRes = await callNvidiaStream(fallbackModel);
    }

    if (!nvidiaRes.ok) {
      const errText = await nvidiaRes.text();
      return new Response(JSON.stringify({ error: `NVIDIA API error: ${errText}` }), {
        status: nvidiaRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vytvoříme transformační stream, který předává textové tokeny klientovi
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          if (trimmed === 'data: [DONE]') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            continue;
          }

          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          } catch {
            // Ignorovat neúplné json chunky
          }
        }
      }
    });

    return new Response(nvidiaRes.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('Server error in /api/chat:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
