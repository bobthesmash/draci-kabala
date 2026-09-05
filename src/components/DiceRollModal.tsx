import React, { useState, useEffect } from 'react';
import { RollResult, rollD6 } from '@/lib/drd_engine';
import { Dices, Check, X, Flame, Skull } from 'lucide-react';

interface DiceRollModalProps {
  isOpen: boolean;
  statName: string;
  statBonus: number;
  target?: number;
  description?: string;
  onComplete: (result: RollResult) => void;
  onClose: () => void;
}

export const DiceRollModal: React.FC<DiceRollModalProps> = ({
  isOpen,
  statName,
  statBonus,
  target,
  description,
  onComplete,
  onClose
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  const [animD1, setAnimD1] = useState(1);
  const [animD2, setAnimD2] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      handleRoll();
    }
  }, [isOpen]);

  const handleRoll = () => {
    setIsRolling(true);

    // Animace rotace kostek
    let interval = setInterval(() => {
      setAnimD1(rollD6());
      setAnimD2(rollD6());
    }, 80);

    setTimeout(() => {
      clearInterval(interval);

      // Skutečný výpočet DrD 2k6 s přehozem
      const steps: any[] = [];
      let d1 = rollD6();
      let d2 = rollD6();
      let firstSum = d1 + d2;
      steps.push({ die1: d1, die2: d2, sum: firstSum, type: 'initial' });
      let currentTotal = firstSum;

      // Přehoz nahoru (11/12)
      while (d1 + d2 >= 11) {
        d1 = rollD6();
        d2 = rollD6();
        const nextSum = d1 + d2;
        steps.push({ die1: d1, die2: d2, sum: nextSum, type: 'explode_up' });
        currentTotal += nextSum;
      }

      // Přehoz dolů (2/3)
      while (steps.length === 1 && (steps[0].sum === 2 || steps[0].sum === 3)) {
        d1 = rollD6();
        d2 = rollD6();
        const nextSum = d1 + d2;
        steps.push({ die1: d1, die2: d2, sum: nextSum, type: 'explode_down' });
        currentTotal -= nextSum;
        if (nextSum !== 2 && nextSum !== 3) break;
      }

      const finalTotal = currentTotal + statBonus;
      let isSuccess: boolean | undefined = undefined;
      let isCritical: boolean | undefined = undefined;

      if (target !== undefined) {
        const diff = finalTotal - target;
        isSuccess = diff >= 0;
        isCritical = Math.abs(diff) >= 5;
      }

      const rollResult: RollResult = {
        rolls: steps,
        baseRollTotal: currentTotal,
        statName,
        statBonus,
        total: finalTotal,
        target,
        isSuccess,
        isCritical,
        description
      };

      setResult(rollResult);
      setIsRolling(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-amber-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center gap-5 text-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Záhlaví pasti */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-1">
            Hod podle pravidel Dračího Doupěte (2k6 +/-)
          </div>
          <h3 className="text-lg font-bold text-amber-200 font-serif">
            Past na {statName} {statBonus >= 0 ? `(+${statBonus})` : `(${statBonus})`}
          </h3>
          {description && (
            <p className="text-xs text-zinc-400 mt-1 max-w-xs">{description}</p>
          )}
          {target !== undefined && (
            <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300">
              Nebezpečnost pasti: <strong className="text-amber-400">{target}</strong>
            </div>
          )}
        </div>

        {/* Vizuální kostky */}
        <div className="flex items-center gap-4 my-2">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 text-zinc-950 flex items-center justify-center text-3xl font-bold font-mono shadow-xl transition-transform ${isRolling ? 'rotate-12 scale-110' : ''}`}>
            {isRolling ? animD1 : result?.rolls[0]?.die1 || 1}
          </div>
          <span className="text-2xl font-bold text-amber-500">+</span>
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 text-zinc-950 flex items-center justify-center text-3xl font-bold font-mono shadow-xl transition-transform ${isRolling ? '-rotate-12 scale-110' : ''}`}>
            {isRolling ? animD2 : result?.rolls[0]?.die2 || 1}
          </div>
        </div>

        {/* Výsledek hodu a kroky */}
        {result && !isRolling && (
          <div className="w-full flex flex-col gap-3">
            {/* Explode / Přehoz upozornění */}
            {result.rolls.length > 1 && (
              <div className="bg-amber-950/60 border border-amber-600/70 rounded-lg p-2.5 text-xs text-amber-200 flex flex-col gap-1">
                {result.rolls.slice(1).map((r, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-semibold">
                    {r.type === 'explode_up' ? (
                      <>
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>Přehoz nahoru! Další hod: [{r.die1} + {r.die2} = +{r.sum}]</span>
                      </>
                    ) : (
                      <>
                        <Skull className="w-4 h-4 text-rose-400" />
                        <span>Přehoz dolů! Další hod: [{r.die1} + {r.die2} = -{r.sum}]</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Matematické vyčíslení */}
            <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 text-center font-mono text-xs">
              <span className="text-zinc-400">Hod: {result.baseRollTotal}</span>
              <span className="text-amber-400 font-bold mx-1.5">{result.statBonus >= 0 ? `+ ${result.statBonus}` : `- ${Math.abs(result.statBonus)}`} ({statName})</span>
              <span className="text-zinc-400">=</span>
              <span className="text-lg font-bold text-amber-300 ml-2">{result.total}</span>
            </div>

            {/* Výsledek proti pasti */}
            {result.target !== undefined && (
              <div className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider ${
                result.isSuccess
                  ? result.isCritical
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-emerald-950/60 border-emerald-600 text-emerald-400'
                  : result.isCritical
                  ? 'bg-rose-950/90 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                  : 'bg-rose-950/60 border-rose-600 text-rose-400'
              }`}>
                {result.isSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{result.isCritical ? 'Hvězdný Kritický Úspěch!' : 'Úspěch v Pasti!'}</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    <span>{result.isCritical ? 'Katastrofální Neúspěch!' : 'Neúspěch v Pasti'}</span>
                  </>
                )}
              </div>
            )}

            {/* Tlačítko pro potvrzení a odeslání výsledku PJ */}
            <button
              onClick={() => {
                onComplete(result);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 mt-1"
            >
              Předat výsledek Pánu Jeskyně
            </button>
          </div>
        )}

        {isRolling && (
          <div className="text-xs text-amber-400/90 font-serif italic animate-pulse">
            Kostky osudu se točí na kamenné desce...
          </div>
        )}
      </div>
    </div>
  );
};
