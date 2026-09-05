/**
 * Dračí Doupě (DrD / DrD+) Core Engine
 * 
 * Implementace hodu 2k6 s otevřeným koncem (přehozem):
 * - Hází se 2k6 (dvě šestistěnné kostky).
 * - Pokud padne součet 11 nebo 12: hod je otevřený nahoru! Hází se další 2k6 a přičítá se (a může se znova přehodit při 11/12).
 * - Pokud padne součet 2 nebo 3: hod je otevřený dolů! Hází se další 2k6 a odečítá se (a může se znova odečíst při 2/3).
 * - Výsledný hod = součet všech hodů.
 * 
 * Vyhodnocení pasti:
 * Celkový výsledek = Hod + Bonus vlastnosti
 * Rozdíl = Celkový výsledek - Nebezpečnost pasti
 * - Rozdíl >= 0: ÚSPĚCH (při Rozdílu >= 5: KRITICKÝ ÚSPĚCH)
 * - Rozdíl < 0: NEÚSPĚCH (při Rozdílu <= -5: KRITICKÝ NEÚSPĚCH)
 */

export interface DiceRollStep {
  die1: number;
  die2: number;
  sum: number;
  type: 'initial' | 'explode_up' | 'explode_down';
}

export interface RollResult {
  rolls: DiceRollStep[];
  baseRollTotal: number;
  statName: string;
  statBonus: number;
  total: number;
  target?: number;
  isSuccess?: boolean;
  isCritical?: boolean;
  description?: string;
}

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Provede klasický DrD hod 2k6 s přehozem
 */
export function roll2k6WithExplode(
  statName: string = 'Hod',
  statBonus: number = 0,
  target?: number,
  description?: string
): RollResult {
  const steps: DiceRollStep[] = [];
  
  // 1. První hod
  let d1 = rollD6();
  let d2 = rollD6();
  let firstSum = d1 + d2;
  steps.push({ die1: d1, die2: d2, sum: firstSum, type: 'initial' });
  
  let currentTotal = firstSum;
  
  // 2. Přehoz nahoru (při 11 nebo 12)
  while (d1 + d2 >= 11) {
    d1 = rollD6();
    d2 = rollD6();
    const nextSum = d1 + d2;
    steps.push({ die1: d1, die2: d2, sum: nextSum, type: 'explode_up' });
    currentTotal += nextSum;
  }
  
  // 3. Přehoz dolů (při 2 nebo 3)
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

  return {
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
}

/**
 * Textový souhrn hodu pro vložení do kontextu PJ
 */
export function formatRollForGM(result: RollResult): string {
  const rollDetails = result.rolls.map((r, i) => {
    if (i === 0) return `[${r.die1}+${r.die2}=${r.sum}]`;
    if (r.type === 'explode_up') return `+(Přehoz: [${r.die1}+${r.die2}=${r.sum}])`;
    return `-(Přehoz dolů: [${r.die1}+${r.die2}=${r.sum}])`;
  }).join(' ');

  const sign = result.statBonus >= 0 ? `+${result.statBonus}` : `${result.statBonus}`;
  let summary = `🎲 HOD KOSTKOU (2k6): ${rollDetails} ${sign} (${result.statName}) = ${result.total}`;

  if (result.target !== undefined) {
    const outcome = result.isSuccess
      ? (result.isCritical ? '🌟 KRITICKÝ ÚSPĚCH' : '✅ ÚSPĚCH')
      : (result.isCritical ? '💀 KRITICKÝ NEÚSPĚCH' : '❌ NEÚSPĚCH');
    summary += ` proti Pasti ${result.target} -> ${outcome}!`;
  }

  return summary;
}
