import React, { useState } from 'react';
import { ARCHETYPES, CharacterArchetype } from '@/data/classes';
import { PlayerCharacter } from '@/lib/game_state';
import { Sparkles, Shield, Heart, Zap, Check } from 'lucide-react';

interface CharacterCreationModalProps {
  isOpen: boolean;
  onSelectCharacter: (char: PlayerCharacter) => void;
}

export const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({
  isOpen,
  onSelectCharacter
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState<CharacterArchetype>(ARCHETYPES[0]);
  const [characterName, setCharacterName] = useState('Moše ze Safedu');

  if (!isOpen) return null;

  const handleStart = () => {
    const newChar: PlayerCharacter = {
      name: characterName.trim() || 'Neznámý Adept',
      archetypeId: selectedArchetype.id,
      archetypeTitle: selectedArchetype.title,
      sefiraAffinity: selectedArchetype.sefiraAffinity,
      hp: selectedArchetype.maxHp,
      maxHp: selectedArchetype.maxHp,
      kavana: selectedArchetype.maxKavana,
      maxKavana: selectedArchetype.maxKavana,
      sparks: 0,
      stats: { ...selectedArchetype.stats },
      inventory: [...selectedArchetype.startingEquipment],
      currentSphereLevel: 1
    };
    onSelectCharacter(newChar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-amber-800/80 rounded-2xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-6 text-zinc-200 my-8">
        
        {/* Titulek */}
        <div className="text-center border-b border-zinc-800 pb-4">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
            Vstup do Říše Klipot podle Knihy Zohar
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-amber-300 font-serif mt-1">
            Zvol svého Adepta
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-lg mx-auto">
            Nádoby světla byly rozbity. Vyber si své povolání a vydej se do nejtemnějších sfér zachránit božské jiskry a provést Tikkun Olam.
          </p>
        </div>

        {/* Jméno postavy */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Jméno postavy:
          </label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            placeholder="např. Moše ze Safedu, Baruch, Jehuda..."
          />
        </div>

        {/* Výběr archetypu */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Povolání v Dračím Doupěti:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {ARCHETYPES.map((arch) => {
              const isSelected = selectedArchetype.id === arch.id;
              return (
                <div
                  key={arch.id}
                  onClick={() => setSelectedArchetype(arch)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-amber-300 font-serif">{arch.name}</h4>
                      <div className="text-[11px] text-amber-500/80 font-medium">{arch.title}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  </div>

                  <p className="text-[11px] text-zinc-400 my-2 line-clamp-2">{arch.description}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-zinc-800/80">
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3 h-3" /> {arch.maxHp} HP
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Zap className="w-3 h-3" /> {arch.maxKavana} Kavana
                    </span>
                    <span className="text-zinc-500">{arch.sefiraAffinity.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detaily zvoleného archetypu */}
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span>Základní vlastnosti (DrD):</span>
            <span className="text-amber-400">Spřízněná Sefira: {selectedArchetype.sefiraAffinity}</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { label: 'SIL', val: selectedArchetype.stats.sil },
              { label: 'OBR', val: selectedArchetype.stats.obr },
              { label: 'ODL', val: selectedArchetype.stats.odl },
              { label: 'INT', val: selectedArchetype.stats.int },
              { label: 'VUL', val: selectedArchetype.stats.vul }
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded py-1">
                <div className="text-[10px] text-zinc-400">{s.label}</div>
                <div className={`text-sm font-bold font-mono ${s.val > 0 ? 'text-emerald-400' : s.val < 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                  {s.val > 0 ? `+${s.val}` : s.val}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-zinc-400 pt-1 border-t border-zinc-800">
            <span className="font-bold text-zinc-300">Počáteční výbava: </span>
            {selectedArchetype.startingEquipment.join(', ')}
          </div>
        </div>

        {/* Tlačítko startu */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Vstoupit do první sféry (Nahemoth)
        </button>
      </div>
    </div>
  );
};
