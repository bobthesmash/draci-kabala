import React, { useState } from 'react';
import { TrapCheck } from '@/lib/game_state';
import { Send, Dices, CornerDownLeft } from 'lucide-react';

interface ActionControlsProps {
  choices: string[];
  pendingCheck?: TrapCheck;
  onSelectChoice: (choice: string) => void;
  onSubmitCustomAction: (actionText: string) => void;
  onTriggerDiceRoll: () => void;
  disabled: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  choices,
  pendingCheck,
  onSelectChoice,
  onSubmitCustomAction,
  onTriggerDiceRoll,
  disabled
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSubmitCustomAction(inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-zinc-950/95 border-t border-zinc-800/80 p-4 md:p-5 flex flex-col gap-3">
      {/* 1. Pokud je aktivní Past, ukážeme hlavní výzvu k hodu */}
      {pendingCheck && (
        <div className="bg-gradient-to-r from-amber-950/80 via-red-950/80 to-amber-950/80 border border-amber-500/80 rounded-xl p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5 text-amber-200 text-xs md:text-sm">
            <Dices className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Vyžadován hod 2k6 na Past: </span>
              <span>{pendingCheck.description} ({pendingCheck.stat} ~ Nebezpečnost {pendingCheck.target})</span>
            </div>
          </div>
          <button
            onClick={onTriggerDiceRoll}
            disabled={disabled}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0 flex items-center justify-center gap-1.5"
          >
            <Dices className="w-4 h-4" />
            Hodit kostkami!
          </button>
        </div>
      )}

      {/* 2. Rychlé kontextové volby (pokud není past nebo i jako možnosti postupu) */}
      {choices && choices.length > 0 && !pendingCheck && (
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>Navržené akce:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => onSelectChoice(choice)}
                disabled={disabled}
                className="text-left bg-zinc-900/90 hover:bg-zinc-800 disabled:opacity-40 border border-zinc-800 hover:border-amber-600/60 rounded-lg p-2.5 text-xs text-zinc-300 transition duration-150 flex items-start gap-2 group"
              >
                <span className="text-amber-500/80 group-hover:text-amber-400 font-bold shrink-0">
                  {idx + 1}.
                </span>
                <span className="leading-snug">{choice}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Vlastní textový vstup pro jakoukoliv kreativní akci */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            disabled
              ? 'Pán Jeskyně přemýšlí...'
              : pendingCheck
              ? 'Nebo popiš, jak se pokusíš pasti vyhnout...'
              : 'Napiš vlastní akci (např. Vytasím meč a prozkoumám runy na stěně...)'
          }
          disabled={disabled}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !inputText.trim()}
          className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-medium text-sm transition flex items-center gap-1.5 shadow"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Odeslat</span>
        </button>
      </form>
    </div>
  );
};
