import React, { useEffect, useRef, useState } from 'react';
import { StoryMessage } from '@/lib/game_state';
import { Sparkles, Dices, User, ScrollText, AlertTriangle, Volume2, Square } from 'lucide-react';
import { speechService } from '@/lib/speech';

interface StoryFeedProps {
  messages: StoryMessage[];
  isThinking: boolean;
}

export const StoryFeed: React.FC<StoryFeedProps> = ({ messages, isThinking }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      speechService.stop();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      speechService.speak(
        text,
        () => setSpeakingMsgId(null),
        () => setSpeakingMsgId(null)
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.map((msg) => {
        if (msg.sender === 'gm') {
          const isThisSpeaking = speakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className="bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-4 md:p-5 shadow-lg relative group transition hover:border-zinc-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-serif font-bold tracking-wide">
                  <ScrollText className="w-4 h-4 text-amber-400" />
                  <span>Pán Jeskyně</span>
                </div>
                {/* Tlačítko pro poslech zprávy */}
                <button
                  onClick={() => handleToggleSpeak(msg.id, msg.text)}
                  className={`p-1 rounded-md transition text-xs flex items-center gap-1 ${
                    isThisSpeaking
                      ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                      : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'
                  }`}
                  title={isThisSpeaking ? 'Zastavit čtení' : 'Přečíst nahlas'}
                >
                  {isThisSpeaking ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[10px]">Čte...</span>
                    </>
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="text-sm md:text-base text-zinc-300 font-serif leading-relaxed whitespace-pre-line selection:bg-amber-900 selection:text-amber-100">
                {msg.text}
              </div>

              {msg.checkRequired && (
                <div className="mt-3.5 bg-amber-950/40 border border-amber-800/60 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">
                      Vyhlášena Past na {msg.checkRequired.stat} (Nebezpečnost: {msg.checkRequired.target}):
                    </span>
                    <p className="text-zinc-400 mt-0.5">{msg.checkRequired.description}</p>
                  </div>
                </div>
              )}
            </div>
          );
        }

        if (msg.sender === 'player') {
          return (
            <div key={msg.id} className="flex justify-end">
              <div className="bg-gradient-to-r from-amber-700/80 to-amber-600/80 border border-amber-500/40 text-white rounded-xl py-2.5 px-4 max-w-[85%] md:max-w-[75%] shadow-md">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-semibold mb-1">
                  <User className="w-3 h-3" /> Hráč
                </div>
                <div className="text-sm leading-relaxed">{msg.text}</div>
              </div>
            </div>
          );
        }

        if (msg.sender === 'dice') {
          const roll = msg.rollResult;
          const isSuccess = roll?.isSuccess;
          const isCritical = roll?.isCritical;

          return (
            <div key={msg.id} className="flex justify-center">
              <div className={`px-4 py-2.5 rounded-lg border text-xs md:text-sm font-mono shadow-md flex items-center gap-2.5 ${
                isSuccess
                  ? isCritical
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-emerald-950/50 border-emerald-700 text-emerald-200'
                  : isCritical
                  ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-red-950/50 border-red-800 text-red-200'
              }`}>
                <Dices className="w-4 h-4 shrink-0" />
                <span>{msg.text}</span>
              </div>
            </div>
          );
        }

        return (
          <div key={msg.id} className="text-center text-xs text-zinc-500 italic my-2">
            {msg.text}
          </div>
        );
      })}

      {isThinking && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-3 text-zinc-400 text-sm">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="italic font-serif">Pán Jeskyně zvažuje tvůj osud v plamenech Gevury...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
