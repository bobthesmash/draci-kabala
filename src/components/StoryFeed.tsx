import React, { useEffect, useRef, useState } from 'react';
import { StoryMessage } from '@/lib/game_state';
import { Dices, User, ScrollText } from 'lucide-react';
import { DreidelSpinner } from '@/components/DreidelSpinner';

interface StoryFeedProps {
  messages: StoryMessage[];
  isThinking: boolean;
  isSpeechEnabled: boolean;
}

const SceneImage: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="mb-4 rounded-xl overflow-hidden border border-amber-900/60 relative aspect-video bg-zinc-950 shadow-xl">
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500 bg-zinc-950 z-10">
          <DreidelSpinner size="md" />
          <span className="text-xs font-serif italic text-amber-300/90 tracking-wide">
            Vyvolávám vizi sféry...
          </span>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-zinc-500 p-4 text-center bg-zinc-950">
          <span className="text-amber-500/80 text-sm mb-1">✧</span>
          <span className="font-serif italic text-zinc-400">Vize sféry se na okamžik rozplynula v astrální mlze.</span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="Kabalistická vize sféry"
          className={`w-full h-full object-cover transition-all duration-700 ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

const GmMessageCard: React.FC<{
  msg: StoryMessage;
  isSpeechEnabled: boolean;
}> = ({ msg, isSpeechEnabled }) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-4 md:p-5 shadow-lg relative group transition hover:border-zinc-700">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-serif font-bold tracking-wide mb-2.5">
        <ScrollText className="w-4 h-4 text-amber-400" />
        <span>Pán Jeskyně</span>
      </div>

      {/* Vizuální scenerie tahu */}
      {msg.imageUrl && (
        <SceneImage imageUrl={msg.imageUrl} />
      )}

      {/* Text vyprávění: Zobrazuje se pouze při vypnutém zvuku */}
      {!isSpeechEnabled && (
        <div className="text-sm md:text-base text-zinc-300 font-serif leading-relaxed whitespace-pre-line selection:bg-amber-900 selection:text-amber-100">
          {msg.text}
        </div>
      )}
    </div>
  );
};

export const StoryFeed: React.FC<StoryFeedProps> = ({
  messages,
  isThinking,
  isSpeechEnabled
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.map((msg) => {
        if (msg.sender === 'gm') {
          return (
            <GmMessageCard
              key={msg.id}
              msg={msg}
              isSpeechEnabled={isSpeechEnabled}
            />
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
        <div className="bg-zinc-900/80 border border-amber-900/50 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 text-zinc-300 text-sm shadow-xl">
          <DreidelSpinner size="sm" />
          <span className="italic font-serif text-amber-200/90">
            Pán Jeskyně zvažuje tvůj osud v plamenech Gevury...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
