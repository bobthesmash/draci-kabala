import React from 'react';
import zoharLore from '@/data/zohar_lore.json';
import { Compass, CheckCircle2 } from 'lucide-react';

interface SefirotMapProps {
  currentSphereLevel: number;
}

export const SefirotMap: React.FC<SefirotMapProps> = ({ currentSphereLevel }) => {
  const spheres = zoharLore.cosmology.dungeon_spheres_klipot;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-xl backdrop-blur text-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
        <h3 className="text-xs uppercase tracking-wider text-amber-400/90 font-bold flex items-center gap-1.5 font-serif">
          <Compass className="w-3.5 h-3.5 text-amber-400" /> Sféry Klipot (Strom Stínů)
        </h3>
        <span className="text-[11px] text-zinc-400 font-mono">
          Úroveň {currentSphereLevel} / 10
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
        {spheres.map((sphere) => {
          const isCurrent = sphere.level === currentSphereLevel;
          const isCleared = sphere.level < currentSphereLevel;

          return (
            <div
              key={sphere.id}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                isCurrent
                  ? 'bg-amber-950/70 border border-amber-500/70 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : isCleared
                  ? 'bg-zinc-950/60 border border-emerald-900/40 text-zinc-400'
                  : 'bg-zinc-950/30 border border-zinc-900/80 text-zinc-600 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-4 text-[10px] font-mono font-bold ${
                  isCurrent ? 'text-amber-400' : isCleared ? 'text-emerald-500' : 'text-zinc-600'
                }`}>
                  {sphere.level}.
                </span>
                <div>
                  <span className={`font-semibold ${isCurrent ? 'text-amber-300' : isCleared ? 'text-zinc-300 line-through opacity-70' : 'text-zinc-500'}`}>
                    {sphere.name}
                  </span>
                  <div className="text-[10px] text-zinc-500 font-normal truncate max-w-[160px]">
                    {sphere.theme}
                  </div>
                </div>
              </div>

              {isCleared ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase tracking-tighter shrink-0 animate-pulse">
                  Zde
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
