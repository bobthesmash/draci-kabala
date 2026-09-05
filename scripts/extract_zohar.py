import pypdf
import json
import os
import re

pdf_path = "eng_t_ml-sefer-zohar.pdf"
output_json = "src/data/zohar_lore.json"

print("Reading Zohar PDF...")
reader = pypdf.PdfReader(pdf_path)
total_pages = len(reader.pages)
print(f"Total pages: {total_pages}")

lore_data = {
    "title": "Sefer ha-Zohar - Kabbalistický Kompendium pro Pána Jeskyně",
    "cosmology": {
        "concept": "Po Ševirat ha-Kelim (Rozbití nádob) se božské jiskry (Nicanot) propadly do říše skořápek (Klipot / Sitra Achra). Úkolem Adepta je sestoupit těmito sférami temnoty a skrze Tikkun (nápravu) navrátit jiskry do světla Ein Sof.",
        "realms_of_light_sefirot": [
            {"id": "keter", "name": "Keter (Koruna)", "aspect": "Nejvyšší vůle, nepopsatelné světlo, počátek všech emanací"},
            {"id": "chochma", "name": "Chochma (Moudrost)", "aspect": "Prapůvodní myšlenka, blesk inspirace"},
            {"id": "bina", "name": "Bina (Porozumění)", "aspect": "Lůno forem, matka světů, hluboké vnímání"},
            {"id": "chesed", "name": "Chesed (Milosrdenství)", "aspect": "Bezmezná láska, proudící darování, bílé světlo"},
            {"id": "gevura", "name": "Gevura (Přísnost / Soud)", "aspect": "Oheň soudu, hranice, síla a bázeň"},
            {"id": "tiferet", "name": "Tiferet (Krása / Harmonie)", "aspect": "Srdce stromu, rovnováha mezi Chesed a Gevura, slunce"},
            {"id": "necach", "name": "Necach (Vítězství)", "aspect": "Vytrvalost, citový triumf, věčnost"},
            {"id": "hod", "name": "Hod (Nádhera / Sláva)", "aspect": "Racionální řád, intelekt, modlitba a proroctví"},
            {"id": "jesod", "name": "Jesod (Základ)", "aspect": "Kanál všech sil, astrální říše snů a forem"},
            {"id": "malkut", "name": "Malkut (Království)", "aspect": "Hmotný svět, Šechina (přítomnost Boží v exilu)"}
        ],
        "dungeon_spheres_klipot": [
            {"level": 1, "id": "nahemoth", "name": "Nahemoth (Šepotající kletby)", "counterpart": "Malkut", "ruler": "Naamah", "theme": "Hmotná hniloba, zamořené hrobky, noční přízraky, plíživý strach"},
            {"level": 2, "id": "gamaliel", "name": "Gamaliel (Zvrácení / Znečištění)", "counterpart": "Jesod", "ruler": "Lilith", "theme": "Klamné astrální iluze, zvrácené sny, noční můry, ztráta rozumu"},
            {"level": 3, "id": "samael", "name": "Samael (Jed Boží)", "counterpart": "Hod", "ruler": "Adrammelech", "theme": "Pokřivená logika, rouhání, falešné smlouvy, otravné plyny a jedy"},
            {"level": 4, "id": "aarab_zaraq", "name": "A'arab Zaraq (Krkavci smrti)", "counterpart": "Necach", "ruler": "Baal", "theme": "Divoká vášeň, krvežíznivost, hejna černých dravců, bitevní vřava"},
            {"level": 5, "id": "thagirion", "name": "Thagirion (Hádající se / Černé slunce)", "counterpart": "Tiferet", "ruler": "Belphegor", "theme": "Temné slunce, pýcha, rozpad harmonie, falešní mesiáši"},
            {"level": 6, "id": "golachab", "name": "Golachab (Spalovači)", "counterpart": "Gevura", "ruler": "Asmodeus", "theme": "Nekonečný žár a láva, hněv, tyranská síla, spalující oheň"},
            {"level": 7, "id": "gaagsheblah", "name": "Gha'agsheblah (Ničitelé)", "counterpart": "Chesed", "ruler": "Astaroth", "theme": "Falešné milosrdenství, dusivý přebytek, zrada pod rouškou přátelství"},
            {"level": 8, "id": "satariel", "name": "Satariel (Skrývající)", "counterpart": "Bina", "ruler": "Lucifuge Rofocale", "theme": "Kosmická temnota, labyrint zapomnění, ztráta paměti a víry"},
            {"level": 9, "id": "ghagiel", "name": "Ghagiel (Ztěžovatelé)", "counterpart": "Chochma", "ruler": "Beelzebub", "theme": "Chaos prázdnoty, popření moudrosti, rozpadání identity"},
            {"level": 10, "id": "thaumiel", "name": "Thaumiel (Dvojhlaví bohové)", "counterpart": "Keter", "ruler": "Satan / Moloch", "theme": "Nejvyšší dualita, popření Jednoty, trůn temnoty a prázdnoty"}
        ]
    },
    "beasts_and_entities": [
        {"name": "Šed (pl. Šedim)", "type": "Démon z meziprostoru", "desc": "Bytosti zrozené z hněvu a stínu, schopné brát podobu kouře a posednout živé tvory."},
        {"name": "Lilithina dcera (Lilin)", "type": "Noční přízrak", "desc": "Svůdné a kruté stíny Klipot, sající životní sílu a zraňující duši (Kavanu)."},
        {"name": "Golem z jílu Gevury", "type": "Magický strážce", "desc": "Kolos oživený svatým slovem Emet (Pravda) vyrytým na čele; smazáním prvního písmene se stane Met (Mrtvý)."},
        {"name": "Malach ha-Mavet (Anděl zkázy)", "type": "Vyslankyně soudu", "desc": "Okřídlený stín s mečem z černého plamene, zkoušející věrnost a odvahu Adepta."},
        {"name": "Dybbuk", "type": "Bludná duše", "desc": "Hříšný duch uvězněný mezi světy, toužící po těle a živé krvi."}
    ],
    "mystical_words_and_incantations": [
        {"formula": "Kadosh, Kadosh, Kadosh", "power": "Zapuzení temných stínů, obnovení ochranné aury."},
        {"formula": "Ana Bekoach", "power": "Theurgická modlitba 42 písmen, láme kletby a pouta Klipot."},
        {"formula": "Šma Jisrael", "power": "Sjednocení mysli, maximální obrana proti mentálnímu ovládnutí."},
        {"formula": "Tikkun ha-Nefesh", "power": "Léčení duše a navrácení ztracené Kavany (duševní energie)."}
    ],
    "zohar_quotes": []
}

sample_pages = [15, 25, 45, 80, 110, 150, 200, 250, 320, 400]
extracted_quotes = []

for p in sample_pages:
    if p < total_pages:
        txt = reader.pages[p].extract_text()
        clean_txt = re.sub(r'\s+', ' ', txt)
        sentences = re.split(r'\.\s+', clean_txt)
        for s in sentences:
            s_clean = s.strip()
            if any(term in s_clean.lower() for term in ['light', 'darkness', 'soul', 'sefira', 'rose', 'mercy', 'judgment', 'spark', 'vessel', 'creator']):
                if 40 < len(s_clean) < 220:
                    extracted_quotes.append(s_clean)
                    if len(extracted_quotes) >= 15:
                        break
        if len(extracted_quotes) >= 15:
            break

lore_data["zohar_quotes"] = extracted_quotes

os.makedirs("src/data", exist_ok=True)
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(lore_data, f, ensure_ascii=False, indent=2)

print(f"Saved lore bible to {output_json} successfully with {len(extracted_quotes)} authentic quotes.")
