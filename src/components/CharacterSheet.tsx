import React from 'react';
import { PlayerCharacter } from '@/lib/game_state';
import { ARCHETYPES } from '@/data/classes';
import { Shield, Sparkles, Heart, Zap, Backpack, Flame, BookOpen } from 'lucide-react';

interface CharacterSheetProps {
  character: PlayerCharacter;
  onUseAbility?: (abilityName: string, cost: number) => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onUseAbility }) => {
  const currentArchetype = ARCHETYPES.find(a => a.id === character.archetypeId) || ARCHETYPES[0];
  const hpPercent = Math.max(0, Math.min(100, Math.round((character.hp / character.maxHp) * 100)));
  const kavanaPercent = Math.max(0, Math.min(100, Math.round((character.kavana / character.maxKavana) * 100)));

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 md:p-5 shadow-2xl backdrop-blur flex flex-col gap-4 text-zinc-200">
      {/* Záhlaví postavy */}
      <div className="border-b border-zinc-800 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-amber-300 font-serif tracking-wide">{character.name}</h2>
            <p className="text-xs text-amber-500/90 font-medium tracking-wide">{character.archetypeTitle}</p>
          </div>
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/50">
            {character.sefiraAffinity}
          </span>
        </div>
      </div>

      {/* Životy a Kavana */}
      <div className="flex flex-col gap-2.5">
        {/* HP */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5 text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-500/20" /> Životy (HP)
            </span>
            <span className="text-zinc-400">{character.hp} / {character.maxHp}</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-500 ${
                hpPercent > 50 ? 'bg-gradient-to-r from-rose-700 to-rose-500' :
                hpPercent > 25 ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
                'bg-gradient-to-r from-red-800 to-red-600 animate-pulse'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Kavana / Mana */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Zap className="w-3.5 h-3.5 fill-indigo-500/20" /> Kavana (Duševní síla)
            </span>
            <span className="text-zinc-400">{character.kavana} / {character.maxKavana}</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-700 to-violet-500 transition-all duration-500"
              style={{ width: `${kavanaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Božské Jiskry (Nicanot) */}
      <div className="bg-zinc-950/70 border border-amber-950/60 rounded-lg p-2.5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Jiskry Světla (Tikkun)
          </span>
          <span className="text-amber-300 font-mono font-bold text-xs">{character.sparks} / 10</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded-sm transition-all duration-300 ${
                i < character.sparks
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'bg-zinc-800 border border-zinc-700/50'
              }`}
              title={`Sféra ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Atributy DrD */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2 flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-zinc-500" /> Vlastnosti (Bonus k 2k6)
        </h3>
        <div className="grid grid-cols-5 gap-1.5 text-center">
          {[
            { label: 'SIL', name: 'Síla', val: character.stats.sil },
            { label: 'OBR', name: 'Obratnost', val: character.stats.obr },
            { label: 'ODL', name: 'Odolnost', val: character.stats.odl },
            { label: 'INT', name: 'Intel.', val: character.stats.int },
            { label: 'VUL', name: 'Vůle', val: character.stats.vul }
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-950/80 border border-zinc-800 rounded p-1.5">
              <div className="text-[10px] text-zinc-400 font-medium">{stat.label}</div>
              <div className={`text-sm font-bold font-mono ${
                stat.val > 0 ? 'text-emerald-400' : stat.val < 0 ? 'text-rose-400' : 'text-zinc-300'
              }`}>
                {stat.val > 0 ? `+${stat.val}` : stat.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zvláštní dovednost */}
      {currentArchetype.signatureAbility && (
        <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-lg p-2.5 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-indigo-300 flex items-center gap-1">
              <Flame className="w-3 h-3 text-indigo-400" />
              {currentArchetype.signatureAbility.name}
            </span>
            <span className="text-[10px] text-indigo-400 font-medium">
              Stojí {currentArchetype.signatureAbility.kavanaCost} Kavany
            </span>
          </div>
          <p className="text-zinc-400 text-[11px] mb-2 leading-relaxed">
            {currentArchetype.signatureAbility.description}
          </p>
          {onUseAbility && (
            <button
              onClick={() => onUseAbility(currentArchetype.signatureAbility.name, currentArchetype.signatureAbility.kavanaCost)}
              disabled={character.kavana < currentArchetype.signatureAbility.kavanaCost}
              className="w-full py-1 px-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium text-[11px] transition shadow"
            >
              Použít schopnost
            </button>
          )}
        </div>
      )}

      {/* Inventář */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-2 flex items-center gap-1.5">
          <Backpack className="w-3 h-3 text-zinc-500" /> Inventář ({character.inventory.length})
        </h3>
        <ul className="flex flex-col gap-1 text-xs text-zinc-300 max-h-36 overflow-y-auto pr-1">
          {character.inventory.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800/60">
              <span className="text-amber-500/70 text-[10px]">◆</span>
              <span className="truncate">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
