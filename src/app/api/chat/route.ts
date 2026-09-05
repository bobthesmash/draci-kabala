import { NextRequest, NextResponse } from 'next/server';
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
    const model = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'NVIDIA_API_KEY není nastaven v environment proměnných.' },
        { status: 500 }
      );
    }

    const systemPrompt = buildGameMasterPrompt(character);

    // Sestavíme historii zpráv (posledních 8 zpráv pro optimální kontext)
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

    // Volání NVIDIA NIM API
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: conversation,
        max_tokens: 2048,
        temperature: 0.6,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `Chyba při komunikaci s NVIDIA API (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || 'Pán Jeskyně se na chvíli odmlčel v hluboké meditaci...';

    // Extrakce JSON bloku kabala_json
    let cleanNarration = rawContent;
    let kabalaData: any = null;

    const jsonMatch = rawContent.match(/```(?:kabala_json|json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        kabalaData = JSON.parse(jsonMatch[1]);
        cleanNarration = rawContent.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.warn('Nepodařilo se naparsovat kabala_json block:', e);
      }
    }

    // Fallback pokud model nevrátil choices
    if (!kabalaData) {
      kabalaData = {
        stat_updates: { hp_delta: 0, kavana_delta: 0, sparks_delta: 0 },
        check_required: null,
        choices: [
          'Opatrně prozkoumat okolní stíny a zdi',
          'Vzývat ochranné jméno Boží a zapálit svíci',
          'Pokročit hlouběji do chodby s mečem v pohotovosti'
        ]
      };
    }

    return NextResponse.json({
      narration: cleanNarration,
      kabalaData
    });
  } catch (error: any) {
    console.error('Server error in /api/chat:', error);
    return NextResponse.json(
      { error: error?.message || 'Nastala neočekávaná chyba serveru.' },
      { status: 500 }
    );
  }
}
