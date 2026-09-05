# 🐉 Dračí Kabala: Pád do Klipot

> **Vypravěčské RPG** spojující ikonická pravidla **českého Dračího doupěte** s hlubokou esoterickou mystikou **Knihy Zohar (Sefer ha-Zohar)**. Běží na AI enginu s modelem `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` (NVIDIA NIM) a je plně optimalizováno pro bezplatný hosting na **Vercel Free Tier**.

---

## 🌟 Klíčové vlastnosti

1. **Hybridní RPG Engine (Zero Hallucination)**:
   - Deterministický kód řídí životy (HP), duševní sílu (Kavanu), inventář a hod kostkou.
   - AI Pán Jeskyně se plně soustředí na temný, pohlcující narativ, aramejská zaklínadla a reakce na akce hráče.
2. **Pravidla Dračího doupěte (DrD / DrD+)**:
   - **Hod 2k6 s otevřeným koncem (přehozem)**:
     - Při součtu $11$ nebo $12$ na kostkách nastává přehoz nahoru (+ další hod 2k6).
     - Při součtu $2$ nebo $3$ nastává pád do zákysového hodu (- další hod 2k6).
   - **Systém pastí**: PJ vyhlašuje pasti na vlastnosti (SIL, OBR, ODL, INT, VUL) s konkrétní nebezpečností.
   - Vizuální animace točení kostek s vyhodnocením úspěchu či kritického selhání.
3. **Kosmologie Knihy Zohar**:
   - Svět po *Ševirat ha-Kelim* (Rozbití nádob).
   - Průchod **10 sférami skořápek temnoty (Klipot)**: od *Nahemoth* (hmotná hniloba), přes *Gamaliel*, *Samael*, *Golachab* až po *Thaumiel*.
   - Cílem je osvobodit 10 Božských jisker (*Nicanot*) a provést *Tikkun Olam* (nápravu světa).
4. **Hratelnost pro maximální zábavu (UX)**:
   - **Kontextová tlačítka**: V každém tahu PJ navrhne 3 konkrétní volby, na které stačí kliknout.
   - **Volný text**: Kdykoliv můžeš napsat jakoukoliv vlastní originální akci.
   - **Autosave do LocalStorage**: Hru lze kdykoliv zavřít a pokračovat přesně tam, kde jsi skončil.

---

## 🚀 Jak spustit lokálně

1. **Nainstalujte závislosti**:
   ```bash
   npm install
   ```

2. **Ověřte proměnné prostředí** (soubor `.env.local` je již vytvořen):
   ```env
   NVIDIA_API_KEY=nvapi-...
   NVIDIA_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
   ```

3. **Spusťte vývojový server**:
   ```bash
   npm run dev
   ```
   Otevřete v prohlížeči [http://localhost:3000](http://localhost:3000).

---

## ☁️ Jak nasadit na Vercel Free Tier (1-Click)

1. **Nahrajte projekt na GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Draci Kabala RPG"
   # Vytvořte repo na svém GitHubu a pushněte:
   git remote add origin https://github.com/VASE_JMENO/draci-kabala.git
   git push -u origin main
   ```

2. **Připojte k Vercelu**:
   - Jděte na [vercel.com](https://vercel.com) a klikněte na **Add New Project** -> Importujte vaše GitHub repo.
   - V sekci **Environment Variables** přidejte:
     - `NVIDIA_API_KEY`: váš klíč `nvapi-...`
     - `NVIDIA_MODEL`: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
   - Klikněte na **Deploy**! Během 60 sekund je hra online na vaší `.vercel.app` doméně.

---

## 🧙‍♂️ Povolání Adepta

- **Theurg ze Sféry Gevury**: Mistr 72 jmen Božích a astrálních sfér. Vysoká Inteligence a Vůle.
- **Kněz Světla Tiferet**: Strážce harmonie, léčení a ochranných žalmů.
- **Alchymista – Tvůrce Golemů**: Práce s živly, kyselinami a oživovacím slovem *Emet*.
- **Chasidský Hraničář**: Stopař stínů zvyklý na pustiny Klipot s posvátným lukem.
- **Bojovník s Cejchem Soudu**: Válečník s obouručním mečem a těžkou zbrojí čelící démonům v první linii.
