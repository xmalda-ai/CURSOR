# Dokumentace pro odstranění stavby — textová část

> Dle Přílohy č. 10 vyhlášky č. 131/2024 Sb.  
> Projekt: {{NAZEV_STAVBY}}  
> Datum: {{DATUM}} | Stupeň: DOS (odstranění) | Verze: {{VERZE}}

---

## A Průvodní list

### A.1 Identifikační údaje

#### A.1.1 Údaje o stavbě

| Položka | Údaj |
|---------|------|
| a) Název stavby | {{NAZEV_STAVBY}} |
| b) Místo — kraj | {{KRAJ}} |
| b) Katastrální území | {{KU}} |
| b) Parcelní čísla pozemků | {{PARCELY}} |
| b) Adresa / č.p. (u budov) | {{ADRESA_CP}} |
| b) Pozemky se zákonnou služebností | {{SLUZEBNOSTI}} / Neuplatní se. |
| b) Pozemky zařízení staveniště | {{PARCELY_ZS}} |

#### A.1.2 Údaje o zpracovateli dokumentace

| Položka | Údaj |
|---------|------|
| a) Zpracovatel (firma / IČO / sídlo) | {{ZPRACOVATEL}} |
| b) Hlavní projektant + č. autorizace + obor | {{HLAVNI_PROJEKTANT}} |
| c) Projektanti částí + autorizace | {{PROJEKTANTI_CASTI}} |
| d) Autorizovaný zeměměřický inženýr | {{AZI}} / Neuplatní se — {{DUVOD}}. |

### A.2 Seznam vstupních podkladů

1. {{PODKLAD_1}}
2. {{PODKLAD_2}}
3. [[DOPLNIT: katastrální mapa, pasport, průzkum azbestu, vyjádření IS, …]]

### A.3 Členění odstraňovaných staveb

Formát `X.X.X.X.X` + název (viz `references/prehled.md`).

| Kód SO | Název stavebního objektu / provozního souboru |
|--------|-----------------------------------------------|
| {{KOD_SO_1}} | {{NAZEV_SO_1}} |
| {{KOD_SO_2}} | {{NAZEV_SO_2}} |

### A.4 Atributy stavby (OP/BP dopravní a TI)

| Položka | Údaj |
|---------|------|
| a) Hloubka stavby | {{HLOUBKA}} m |
| b) Výška stavby | {{VYSKA}} m |
| c) Předpokládaná kapacita osob | {{KAPACITA_OSOB}} (při bourání typicky 0 / pracovníci) |
| d) Plánovaný začátek a konec realizace | {{TERMIN_OD}} – {{TERMIN_DO}} |

---

## B Souhrnná technická zpráva

### B.1 Celkový popis území a staveb

**a) Druh a účel užívání odstraňované stavby, charakteristika území a zastavěného stavebního pozemku**

{{B1_A}}

**b) Stávající parametry** (zastavěná plocha, obestavěný prostor, počet funkčních jednotek, …)

| Parametr | Hodnota |
|----------|---------|
| Zastavěná plocha | {{ZP}} m² |
| Obestavěný prostor | {{OP}} m³ |
| Počet funkčních jednotek | {{JEDNOTKY}} |
| Počet NP / PP | {{NP}} / {{PP}} |

**c) Stručný popis SO, IO, konstrukcí a technických/technologických zařízení**

{{B1_C}}

**d) Stávající ochranná a bezpečnostní pásma a ochrana území/stavby**

{{B1_D}}

**e) Ochrana staveb civilní ochrany**

{{B1_E}} / Neuplatní se — v území se nenacházejí stavby CO dotčené odstraněním.

**f) Záplavové / poddolované území apod.**

{{B1_F}}

**g) Výsledky stavebního průzkumu včetně azbestu a jiných nebezpečných látek**

{{B1_G}}  
Průzkum azbestu: {{AZBEST_VYSLEDEK}} (datum, zpracovatel).  
[[DOPLNIT: pokud průzkum chybí — nesmí se tvrdit nepřítomnost azbestu]]

**h) Vliv odstranění na okolí** (přístupnost, odtokové poměry, požární bezpečnost okolí)

{{B1_H}}

**i) Kontaminace prostoru látkami škodlivými pro ŽP**

{{B1_I}} / Neuplatní se — {{DUVOD}}.

**j) Požadavky na kácení dřevin**

{{B1_J}} / Neuplatní se — kácení se nepředpokládá.

**k) Seznam sousedních pozemků nezbytných k bouracím pracím**

| Parcela | KÚ | Účel využití při bourání |
|---------|----|--------------------------|
| {{SOUSED_1}} | {{KU}} | {{UCEL_1}} |

**l) Zohlednění podmínek závazných stanovisek DO**

{{B1_L}}

**m) Základní předpoklady odstranění** (etapy, čas, způsob, vazby, využitelné materiály)

| Etapa | Popis | Termín | Způsob |
|-------|-------|--------|--------|
| 1 | {{ETAPA_1}} | {{T1}} | {{ZPUSOB_1}} |
| 2 | {{ETAPA_2}} | {{T2}} | {{ZPUSOB_2}} |

Odhad využitelných materiálů: {{MATERIALY}}.

**n) Seznam výsledků zeměměřických činností**

{{B1_N}} / Neuplatní se — dle projektu výsledků zeměměřických činností nevznikají.

### B.2 Připojení na technickou infrastrukturu

Napojovací místa, rozměry, kapacity, délky, **způsob odpojení**:

| Médium | Napojení / trasa | Způsob odpojení | Správce |
|--------|------------------|-----------------|---------|
| Elektro | {{EL}} | {{EL_ODPOJ}} | {{EL_SPR}} |
| Voda | {{VODA}} | {{VODA_ODPOJ}} | {{VODA_SPR}} |
| Kanalizace | {{KANAL}} | {{KANAL_ODPOJ}} | {{KANAL_SPR}} |
| Plyn | {{PLYN}} | {{PLYN_ODPOJ}} | {{PLYN_SPR}} |
| Elektronické komunikace | {{EK}} | {{EK_ODPOJ}} | {{EK_SPR}} |

### B.3 Úpravy terénu a řešení vegetace po odstranění stavby

{{B3}}

### B.4 Zásady organizace bouracích prací

**a) Potřeby a spotřeby médií a jejich zajištění** — {{B4_A}}

**b) Odvodnění staveniště** — {{B4_B}}

**c) Napojení staveniště na dopravní a TI** — {{B4_C}}

**d) Vliv na okolní stavby a pozemky, ochrana okolí** — {{B4_D}}

**e) Maximální zábory** — {{B4_E}}

**f) Obchozí trasy pro osoby s omezenou schopností pohybu nebo orientace** — {{B4_F}}

**g) Odpady a emise** (množství, druhy, kategorie; azbest a nebezpečný odpad; přeprava; opětovné využití / recyklace; selektivní třídění; ochrana proti kontaminaci)

{{B4_G}}

**h) Ochrana ŽP a veřejného zdraví při odstraňování** — {{B4_H}}

**i) BOZP na staveništi** (§ 14 a 15 z. 309/2006 Sb.); při azbestu opatření dle zvláštních předpisů

{{B4_I}}

**j) Úpravy pro bezbariérové užívání staveb dotčených odstraněním** — {{B4_J}}

**k) Zásady pro dopravně inženýrská opatření** — {{B4_K}}

---

## C Situační výkresy *(seznam — není textová náplň)*

| Výkres | Obsah dle vyhlášky | Soubor |
|--------|--------------------|--------|
| C.1 Situace širších vztahů | max. 1:500 (památky 1:200); napojení DI/TI; OP/BP; hranice pozemků | {{C1}} |
| C.2 Katastrální situace | odstraňované objekty na KM; vlivy bourání | {{C2}} |

---

## D Dokumentace objektů a technických a technologických zařízení

> Zpracovat **po objektech**. Pro každý SO vyplň blok níže.

### D — objekt {{KOD_SO_1}} {{NAZEV_SO_1}}

#### a) Technická zpráva

- Technologický postup bouracích prací: {{D_POSTUP}}
- Odstranění technických/technologických zařízení: {{D_TZB}}
- Zvláštní / neobvyklé konstrukce a detaily: {{D_SPECIAL}}
- Posloupnost etap bourání: {{D_ETAPY}}

#### b) Výkresová část *(odkaz)*

{{D_VYKRESY}} — stávající stav + vazby na sousedy; schematické výkresy postupu, pokud nestačí TZ.

#### c) Statické posouzení

{{D_STATIKA}} — stabilita v etapách; dočasné podpěry.

---

## Dokladová část *(checklist)*

- [ ] 1. Závazná stanoviska, stanoviska, rozhodnutí, vyjádření DO
- [ ] 2.1 Vyjádření vlastníků veřejné DI/TI k odpojení
- [ ] 2.2 Vyjádření vlastníka k pracím v OP/BP
- [ ] 3. Projekt báňského projektanta (je-li vyžadován)
- [ ] 4. Ostatní stanoviska, posudky, studie, jednání
- [ ] 5. Průzkumy (stavební, azbest, kontaminace, …)
- [ ] 6. Projekt výsledků zeměměřických činností (AZI)
- [ ] 7. Soubor výsledků zeměměřických činností (AZI)
