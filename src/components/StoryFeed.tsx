import React, { useEffect, useRef, useState } from 'react';
import { StoryMessage } from '@/lib/game_state';
import { Sparkles, Dices, User, ScrollText, AlertTriangle, Volume2, Square, Eye, EyeOff } from 'lucide-react';
import { speechService } from '@/lib/speech';

interface StoryFeedProps {
  messages: StoryMessage[];
  isThinking: boolean;
  isSpeechEnabled: boolean;
  onSelectChoice?: (choice: string) => void;
  onTriggerDiceRoll?: () => void;
}

const SceneImage: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="mb-4 rounded-xl overflow-hidden border border-amber-900/60 relative aspect-video bg-zinc-950 shadow-xl">
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 bg-zinc-950 z-10">
          <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
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
  isLatest: boolean;
  isThinking: boolean;
  speakingMsgId: string | null;
  onToggleSpeak: (id: string, text: string) => void;
  onSelectChoice?: (choice: string) => void;
  onTriggerDiceRoll?: () => void;
}> = ({
  msg,
  isSpeechEnabled,
  isLatest,
  isThinking,
  speakingMsgId,
  onToggleSpeak,
  onSelectChoice,
  onTriggerDiceRoll
}) => {
  const [showTranscript, setShowTranscript] = useState(!isSpeechEnabled);
  const isThisSpeaking = speakingMsgId === msg.id;

  useEffect(() => {
    setShowTranscript(!isSpeechEnabled);
  }, [isSpeechEnabled]);

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-4 md:p-5 shadow-lg relative group transition hover:border-zinc-700">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-serif font-bold tracking-wide">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <span>Pán Jeskyně</span>
          {isSpeechEnabled && (
            <span className="text-[10px] text-amber-400/90 font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
              Zvukový režim (Text skryt)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Volitelný přepis při zapnutém zvuku */}
          {isSpeechEnabled && (
            <button
              onClick={() => setShowTranscript(prev => !prev)}
              className="text-[11px] text-zinc-400 hover:text-amber-300 transition flex items-center gap-1 font-serif px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/60"
              title={showTranscript ? 'Skrýt text vyprávění' : 'Zobrazit text vyprávění'}
            >
              {showTranscript ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  <span>Skrýt text</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  <span>Zobrazit text</span>
                </>
              )}
            </button>
          )}

          {/* Tlačítko přehrát / zastavit */}
          <button
            onClick={() => onToggleSpeak(msg.id, msg.text)}
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
      </div>

      {/* Vizuální scenerie tahu */}
      {msg.imageUrl && (
        <SceneImage imageUrl={msg.imageUrl} />
      )}

      {/* Vizuální indikace promluvy při skrytém textu */}
      {isSpeechEnabled && !showTranscript && (
        <div className="flex items-center gap-2.5 text-xs text-amber-300/80 my-2 py-1.5 px-3 rounded-lg bg-amber-950/30 border border-amber-900/40">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
            <span className="w-1 h-4 bg-amber-400 rounded-full animate-pulse delay-100" />
            <span className="w-1 h-2.5 bg-amber-400 rounded-full animate-pulse delay-200" />
          </div>
          <span className="italic font-serif">Pán Jeskyně promlouvá z temnoty sféry...</span>
        </div>
      )}

      {/* Text vyprávění: Zobrazuje se buď když je zvuk vypnutý, nebo pokud si ho hráč ručně rozklikne */}
      {(!isSpeechEnabled || showTranscript) && (
        <div className="text-sm md:text-base text-zinc-300 font-serif leading-relaxed whitespace-pre-line selection:bg-amber-900 selection:text-amber-100">
          {msg.text}
        </div>
      )}

      {/* Past (pokud je vyhlášena) zůstává vždy viditelná pro jasnou informovanost hráče */}
      {msg.checkRequired && (
        <div className="mt-3.5 bg-gradient-to-r from-amber-950/60 via-red-950/40 to-amber-950/60 border border-amber-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">
                Vyhlášena Past na {msg.checkRequired.stat} (Nebezpečnost: {msg.checkRequired.target}):
              </span>
              <p className="text-zinc-300 mt-0.5">{msg.checkRequired.description}</p>
            </div>
          </div>
          {isLatest && onTriggerDiceRoll && (
            <button
              onClick={onTriggerDiceRoll}
              disabled={isThinking}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-[0_0_12px_rgba(245,158,11,0.4)] shrink-0 flex items-center justify-center gap-1.5"
            >
              <Dices className="w-4 h-4" />
              Hodit kostkami
            </button>
          )}
        </div>
      )}

      {/* Možnosti reakce hráče */}
      {msg.choices && msg.choices.length > 0 && !msg.checkRequired && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80">
          <div className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Možnosti reakce hráče:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {msg.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => isLatest && !isThinking && onSelectChoice && onSelectChoice(choice)}
                disabled={!isLatest || isThinking}
                className={`text-left rounded-lg p-2.5 text-xs transition flex items-start gap-2 border ${
                  isLatest && !isThinking
                    ? 'bg-zinc-800/90 hover:bg-zinc-700/90 border-zinc-700/80 hover:border-amber-500/70 text-zinc-200 cursor-pointer shadow-sm hover:shadow-md'
                    : 'bg-zinc-900/40 border-zinc-800/50 text-zinc-500 cursor-default'
                }`}
              >
                <span className="text-amber-500/90 font-bold shrink-0">{idx + 1}.</span>
                <span className="leading-snug">{choice}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const StoryFeed: React.FC<StoryFeedProps> = ({
  messages,
  isThinking,
  isSpeechEnabled,
  onSelectChoice,
  onTriggerDiceRoll
}) => {
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

  // Nalezení indexu poslední zprávy Pána Jeskyně
  const lastGmIndex = messages.map(m => m.sender).lastIndexOf('gm');

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.map((msg, idx) => {
        if (msg.sender === 'gm') {
          return (
            <GmMessageCard
              key={msg.id}
              msg={msg}
              isSpeechEnabled={isSpeechEnabled}
              isLatest={idx === lastGmIndex}
              isThinking={isThinking}
              speakingMsgId={speakingMsgId}
              onToggleSpeak={handleToggleSpeak}
              onSelectChoice={onSelectChoice}
              onTriggerDiceRoll={onTriggerDiceRoll}
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
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-3 text-zinc-400 text-sm">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="italic font-serif">Pán Jeskyně zvažuje tvůj osud v plamenech Gevury...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
