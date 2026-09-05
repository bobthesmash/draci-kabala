'use client';

import React, { useState, useEffect } from 'react';
import { CharacterSheet } from '@/components/CharacterSheet';
import { SefirotMap } from '@/components/SefirotMap';
import { StoryFeed } from '@/components/StoryFeed';
import { ActionControls } from '@/components/ActionControls';
import { DiceRollModal } from '@/components/DiceRollModal';
import { CharacterCreationModal } from '@/components/CharacterCreationModal';
import {
  PlayerCharacter,
  StoryMessage,
  TrapCheck,
  INITIAL_CHARACTER,
  loadGameState,
  saveGameState,
  clearSavedGame
} from '@/lib/game_state';
import { RollResult, formatRollForGM } from '@/lib/drd_engine';
import { Sparkles, Dices, RotateCcw, BookOpen, Skull } from 'lucide-react';

export default function Home() {
  const [character, setCharacter] = useState<PlayerCharacter>(INITIAL_CHARACTER);
  const [messages, setMessages] = useState<StoryMessage[]>([]);
  const [pendingCheck, setPendingCheck] = useState<TrapCheck | undefined>(undefined);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isCreationOpen, setIsCreationOpen] = useState<boolean>(false);
  const [showRulesInfo, setShowRulesInfo] = useState<boolean>(false);

  // Stav pro DiceRollModal
  const [diceModal, setDiceModal] = useState<{
    isOpen: boolean;
    statName: string;
    statBonus: number;
    target?: number;
    description?: string;
  }>({
    isOpen: false,
    statName: 'OBR',
    statBonus: 0
  });

  // Načtení uloženého stavu při startu
  useEffect(() => {
    const saved = loadGameState();
    if (saved && saved.gameStarted && saved.character) {
      setCharacter(saved.character);
      setMessages(saved.messages || []);
      setPendingCheck(saved.pendingCheck);
      setCurrentChoices(saved.currentChoices || []);
    } else {
      setIsCreationOpen(true);
    }
  }, []);

  // Automatické ukládání při změnách
  useEffect(() => {
    if (messages.length > 0) {
      saveGameState({
        character,
        messages,
        pendingCheck,
        currentChoices,
        isThinking: false,
        gameStarted: true
      });
    }
  }, [character, messages, pendingCheck, currentChoices]);

  // Spuštění úvodního vyprávění
  const triggerOpeningNarration = async (newChar: PlayerCharacter) => {
    setIsThinking(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: newChar,
          messages: [],
          actionText: 'Hra začíná. Hráč vstupuje do první sféry Klipot: Nahemoth (Šepotající kletby). Přivítej ho v roli Pána Jeskyně, popiš ponuré okolí rozbitých nádob a nabídni první zkoušku.'
        })
      });

      const data = await res.json();
      if (data.narration) {
        const welcomeMsg: StoryMessage = {
          id: 'msg-' + Date.now(),
          sender: 'gm',
          text: data.narration,
          timestamp: Date.now(),
          checkRequired: data.kabalaData?.check_required || undefined,
          choices: data.kabalaData?.choices || []
        };
        setMessages([welcomeMsg]);
        setPendingCheck(data.kabalaData?.check_required || undefined);
        setCurrentChoices(data.kabalaData?.choices || []);
      }
    } catch (e) {
      console.error('Chyba při startu hry:', e);
    } finally {
      setIsThinking(false);
    }
  };

  // Výběr nové postavy
  const handleSelectCharacter = (newChar: PlayerCharacter) => {
    setCharacter(newChar);
    setIsCreationOpen(false);
    setMessages([]);
    setPendingCheck(undefined);
    setCurrentChoices([]);
    triggerOpeningNarration(newChar);
  };

  // Odeslání hráčské akce Pánu Jeskyně
  const handleSendAction = async (actionText: string) => {
    if (isThinking) return;

    // Hráčská zpráva do feedu
    const playerMsg: StoryMessage = {
      id: 'msg-' + Date.now(),
      sender: 'player',
      text: actionText,
      timestamp: Date.now()
    };

    const newMessages = [...messages, playerMsg];
    setMessages(newMessages);
    setIsThinking(true);
    setPendingCheck(undefined);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character,
          messages: newMessages,
          actionText
        })
      });

      const data = await res.json();
      if (data.narration) {
        const kd = data.kabalaData;

        // Aplikujeme případné změny atributů
        if (kd?.stat_updates) {
          setCharacter(prev => {
            let nextHp = prev.hp + (kd.stat_updates.hp_delta || 0);
            nextHp = Math.max(0, Math.min(prev.maxHp, nextHp));

            let nextKavana = prev.kavana + (kd.stat_updates.kavana_delta || 0);
            nextKavana = Math.max(0, Math.min(prev.maxKavana, nextKavana));

            let nextSparks = prev.sparks + (kd.stat_updates.sparks_delta || 0);
            nextSparks = Math.max(0, Math.min(10, nextSparks));

            let nextInv = [...prev.inventory];
            if (kd.stat_updates.add_item) {
              nextInv.push(kd.stat_updates.add_item);
            }
            if (kd.stat_updates.remove_item) {
              nextInv = nextInv.filter(item => item !== kd.stat_updates.remove_item);
            }

            let nextSphere = prev.currentSphereLevel;
            if (kd.stat_updates.sphere_level && kd.stat_updates.sphere_level > prev.currentSphereLevel) {
              nextSphere = kd.stat_updates.sphere_level;
            }

            return {
              ...prev,
              hp: nextHp,
              kavana: nextKavana,
              sparks: nextSparks,
              inventory: nextInv,
              currentSphereLevel: nextSphere
            };
          });
        }

        const gmMsg: StoryMessage = {
          id: 'msg-' + Date.now(),
          sender: 'gm',
          text: data.narration,
          timestamp: Date.now(),
          checkRequired: kd?.check_required || undefined,
          choices: kd?.choices || []
        };

        setMessages(prev => [...prev, gmMsg]);
        setPendingCheck(kd?.check_required || undefined);
        setCurrentChoices(kd?.choices || []);
      }
    } catch (err) {
      console.error('Chyba při odesílání akce:', err);
    } finally {
      setIsThinking(false);
    }
  };

  // Dokončení hodu kostkou
  const handleRollComplete = (result: RollResult) => {
    const rollSummary = formatRollForGM(result);

    const diceMsg: StoryMessage = {
      id: 'msg-' + Date.now(),
      sender: 'dice',
      text: rollSummary,
      rollResult: result,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, diceMsg]);

    // Odeslat výsledek hodu přímo Pánu Jeskyně jako tah
    handleSendAction(rollSummary);
  };

  // Spuštění hodu na past vyhlášenou PJ
  const handleTriggerPendingCheck = () => {
    if (!pendingCheck) return;
    const statKey = pendingCheck.stat.toLowerCase() as keyof typeof character.stats;
    const bonus = character.stats[statKey] || 0;

    setDiceModal({
      isOpen: true,
      statName: pendingCheck.stat,
      statBonus: bonus,
      target: pendingCheck.target,
      description: pendingCheck.description
    });
  };

  // Volný hod 2k6 kdykoliv
  const handleFreeRoll = () => {
    setDiceModal({
      isOpen: true,
      statName: 'Vlastnost (Volný hod)',
      statBonus: 0,
      target: undefined,
      description: 'Dobrovolný hod 2k6 s přehozem na zkoušku štěstěny'
    });
  };

  // Použití zvláštní dovednosti
  const handleUseAbility = (abilityName: string, cost: number) => {
    if (character.kavana < cost) return;
    setCharacter(prev => ({ ...prev, kavana: prev.kavana - cost }));
    handleSendAction(`[Aktivuji schopnost: ${abilityName} (Spotřebováno ${cost} Kavany)]`);
  };

  // Reset hry
  const handleResetGame = () => {
    if (window.confirm('Opravdu chceš začít novou hru? Současný postup v Klipot bude smazán.')) {
      clearSavedGame();
      setIsCreationOpen(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Záhlaví hry */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-amber-200 font-serif font-bold text-lg shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            ד
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-amber-300 font-serif tracking-wider flex items-center gap-2">
              DRAČÍ KABALA
              <span className="text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                DrD + Zohar
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-serif">Sestup do sfér Klipot za záchranu božských jisker</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Volný hod kostkou */}
          <button
            onClick={handleFreeRoll}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-amber-300 font-medium transition flex items-center gap-1.5 shadow"
            title="Hodit 2k6 s přehozem"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Hod 2k6</span>
          </button>

          {/* O pravidlech */}
          <button
            onClick={() => setShowRulesInfo(!showRulesInfo)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-amber-300 transition text-xs"
            title="Pravidla & Nápověda"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={handleResetGame}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 border border-zinc-700 hover:border-red-800 text-zinc-400 hover:text-red-300 transition text-xs"
            title="Nová hra (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Rychlý panel nápovědy k pravidlům */}
      {showRulesInfo && (
        <div className="bg-zinc-900/95 border-b border-amber-900/50 p-4 text-xs text-zinc-300 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span className="font-bold text-amber-400">Pravidla Dračího doupěte: </span>
            Hází se dvěma kostkami (2k6) s přehozem (na 11/12 se přičítá další hod, na 2/3 se odečítá). K hodu se přičítá bonus vlastnosti (SIL, OBR, ODL, INT, VUL) a porovnává se s Nebezpečností Pasti.
          </div>
          <div>
            <span className="font-bold text-amber-400">Svět Knihy Zohar: </span>
            Sestupuješ 10 sférami skořápek temnoty (Klipot). V každé sféře musíš překonat strážce či hádanku, abys osvobodil Jiskru světla (Nicanot) a provedl Tikkun.
          </div>
          <button
            onClick={() => setShowRulesInfo(false)}
            className="self-start text-amber-400 underline hover:text-amber-300 text-[11px]"
          >
            Zavřít
          </button>
        </div>
      )}

      {/* Hlavní herní plocha */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto p-2 sm:p-4 gap-4">
        {/* Levý panel: Postava a Mapa */}
        <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
          <CharacterSheet
            character={character}
            onUseAbility={handleUseAbility}
          />
          <SefirotMap
            currentSphereLevel={character.currentSphereLevel}
          />
        </aside>

        {/* Pravý panel: Příběhový chat a ovládání */}
        <section className="flex-1 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl flex flex-col overflow-hidden shadow-2xl backdrop-blur min-h-[500px]">
          <StoryFeed
            messages={messages}
            isThinking={isThinking}
          />
          <ActionControls
            choices={currentChoices}
            pendingCheck={pendingCheck}
            onSelectChoice={handleSendAction}
            onSubmitCustomAction={handleSendAction}
            onTriggerDiceRoll={handleTriggerPendingCheck}
            disabled={isThinking}
          />
        </section>
      </main>

      {/* Modální okna */}
      <CharacterCreationModal
        isOpen={isCreationOpen}
        onSelectCharacter={handleSelectCharacter}
      />

      <DiceRollModal
        isOpen={diceModal.isOpen}
        statName={diceModal.statName}
        statBonus={diceModal.statBonus}
        target={diceModal.target}
        description={diceModal.description}
        onComplete={handleRollComplete}
        onClose={() => setDiceModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
