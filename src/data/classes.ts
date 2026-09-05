export interface CharacterStats {
  sil: number; // Síla (boj zblízka, páčení, fyzická zátěž)
  obr: number; // Obratnost (uhýbání, střelba, tichý pohyb, jemná theurgie)
  odl: number; // Odolnost (výdrž, odolávání jedům a ranám)
  int: number; // Inteligence (luštění aramejských textů, znalost Zoharu)
  vul: number; // Vůle / Kavana (duševní soustředění, kouzla, odolávání hrůze)
}

export interface CharacterArchetype {
  id: string;
  name: string;
  title: string;
  description: string;
  sefiraAffinity: string;
  maxHp: number;
  maxKavana: number;
  stats: CharacterStats;
  startingEquipment: string[];
  signatureAbility: {
    name: string;
    description: string;
    kavanaCost: number;
  };
}

export const ARCHETYPES: CharacterArchetype[] = [
  {
    id: 'theurgist',
    name: 'Theurg ze Sféry Gevury',
    title: 'Pán Astrálních sfér a magických formulí',
    description: 'Bádatel v tajích 72 jmen Božích. Vládne astrálním sférám a umí spoutat démony slovem moci.',
    sefiraAffinity: 'Gevura (Přísnost)',
    maxHp: 18,
    maxKavana: 28,
    stats: { sil: -1, obr: +1, odl: 0, int: +3, vul: +3 },
    startingEquipment: [
      'Stříbrné theurgické rydlo',
      'Svitek se 42-písmenným jménem',
      'Pergameny a posvěcený inkoust',
      'Lehká lněná kutna se sigilii'
    ],
    signatureAbility: {
      name: 'Formule Ana Bekoach',
      description: 'Vytvoří štít z posvátných písmen, který odrazí temný útok nebo zlomí kletbu.',
      kavanaCost: 5
    }
  },
  {
    id: 'priest',
    name: 'Kněz Světla Tiferet',
    title: 'Strážce Zákona a Srdce Stromu',
    description: 'Naplněný harmonií a soucitem. Dokáže léčit tělo i duši a zahánět temnotu samotnou svou přítomností.',
    sefiraAffinity: 'Tiferet (Krása & Harmonie)',
    maxHp: 22,
    maxKavana: 24,
    stats: { sil: 0, obr: 0, odl: +2, int: +1, vul: +3 },
    startingEquipment: [
      'Posvěcený sedmiramenný symbol',
      'Léčivý balzám z nardu a myrhy',
      'Kovová hůl s vyrytým veršem ze Zoharu',
      'Modlitební plášť (Talit) protkaný stříbrem'
    ],
    signatureAbility: {
      name: 'Tikkun ha-Nefesh (Léčení Duše)',
      description: 'Obnoví zraněnému tělu životy a zaplaší bludné stíny z mysli.',
      kavanaCost: 4
    }
  },
  {
    id: 'alchemist',
    name: 'Alchymista – Tvůrce Golemů',
    title: 'Znalec prvků a oživovatel hmoty',
    description: 'Pracuje s esencemi živlů, prachem a posvátným slovem Emet. Vyrábí výbušné oleje a chrání se oživenou hlínou.',
    sefiraAffinity: 'Jesod (Základ)',
    maxHp: 20,
    maxKavana: 20,
    stats: { sil: 0, obr: +3, odl: +1, int: +2, vul: 0 },
    startingEquipment: [
      'Brašna s alchymistickými flakóny',
      'Hliněná pečeť Emet (oživovací amulet)',
      'Dýka z meteorického železa',
      'Kožená zástěra chránící před kyselinou'
    ],
    signatureAbility: {
      name: 'Záře tekutého ohně',
      description: 'Vrhne zápalnou baňku s fosforeskujícím olejem, která spálí stíny a odhalí skryté stezky.',
      kavanaCost: 3
    }
  },
  {
    id: 'ranger',
    name: 'Chasidský Hraničář',
    title: 'Stopař Stínů v pustinách Klipot',
    description: 'Tichý lovec zvyklý na nástrahy vnějších sfér. Dokáže stopovat démony podle zápachu síry a střílet s posvěceným zrakem.',
    sefiraAffinity: 'Necach (Vítězství & Vytrvalost)',
    maxHp: 24,
    maxKavana: 16,
    stats: { sil: +1, obr: +3, odl: +2, int: 0, vul: 0 },
    startingEquipment: [
      'Tisový reflexní luk a 20 šípů',
      'Lovecký tesák s runou bdělosti',
      'Pochodeň z vonného cedru',
      'Plášť z vlčí kůže'
    ],
    signatureAbility: {
      name: 'Střela Vítězství',
      description: 'Vystřelí šíp vedený neomylným instinktem Necach skrze překážky přímo do slabiny nepřítele.',
      kavanaCost: 3
    }
  },
  {
    id: 'warrior',
    name: 'Bojovník s Cejchem Soudu',
    title: 'Obrněný Štít proti Hordám Sitra Achra',
    description: 'Válečník, jehož meč nese vyrytá jména archandělů. Čelí nebezpečí tváří v tvář v první linii.',
    sefiraAffinity: 'Gevura (Soud & Síla)',
    maxHp: 30,
    maxKavana: 12,
    stats: { sil: +3, obr: +1, odl: +3, int: -1, vul: 0 },
    startingEquipment: [
      'Ocelový obouruční meč s aramejským nápisem',
      'Těžká kroužková zbroj',
      'Štít s reliéfem ohnivého lva',
      'Láhvička silného jalovcového destilátu'
    ],
    signatureAbility: {
      name: 'Úder Spravedlivého Hněvu',
      description: 'Mocné seknutí mečem posílené vahou a hněvem Gevury, které dokáže rozseknout i démonické brnění.',
      kavanaCost: 2
    }
  }
];
