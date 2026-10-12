---
name: textova-cast-pd-131
description: >-
  Tvoří textovou část projektové dokumentace dle vyhlášky č. 131/2024 Sb.
  (průvodní list, souhrnná technická zpráva, technické zprávy objektů).
  Použij při: textová část, STZ, průvodní list, DPS/DSP, demolice, odstranění
  stavby, pasport, rámcové povolení, změna využití území, dokumentace staveb,
  příloha 1–11 nebo 13 vyhlášky 131.
---

# Textová část PD dle vyhlášky 131/2024 Sb.

Skill drží **povinnou osnovu** textových částí dokumentace staveb podle vyhlášky
č. 131/2024 Sb., o dokumentaci staveb. Výkresové části (C, výkresy v D) se
popisují jen odkazem; skill generuje **text**.

## Kdy použít

- uživatel chce šablonu / vyplněnou textovou část PD
- demolice / odstranění stavby (Příloha č. 10)
- povolení stavby, DPS, rámcové povolení, změna využití území, pasport
- kontrola, že text pokrývá všechny body vyhlášky

## Mapování typu dokumentace → příloha

Nejdřív zjisti typ dokumentace. Pokud není jasný, zeptej se jednou otázkou.

| Typ | § vyhlášky | Příloha | Reference | Šablona |
|-----|------------|---------|-----------|---------|
| Povolení stavby (obecná) | § 3 odst. 1 | č. 1 | `references/priloha-01.md` | `assets/templates/01-povoleni-stavby.md` |
| Povolení vodního díla | § 3 odst. 2 | č. 2 | `references/priloha-02.md` | `assets/templates/02-vodni-dilo.md` |
| Povolení sítí TI | § 3 odst. 3 | č. 3 | `references/priloha-03.md` | `assets/templates/03-site-ti.md` |
| Dopravní infrastruktura (povolení) | § 3 odst. 4 | **jiný PP** | — | neřeší tato vyhláška |
| Soubor staveb | § 4 | č. 4 | `references/priloha-04.md` | `assets/templates/04-soubor-staveb.md` |
| Rámcové povolení | § 5 odst. 1 | č. 5 | `references/priloha-05.md` | `assets/templates/05-ramcove-povoleni.md` |
| Rámcové – obrana/bezpečnost mimo areál | § 5 odst. 2 | č. 6 | `references/priloha-06.md` | `assets/templates/06-ramcove-obrana.md` |
| Změna využití území | § 6 | č. 7 | `references/priloha-07.md` | `assets/templates/07-zmena-vyuziti-uzemi.md` |
| Provádění stavby (DPS) | § 7 odst. 1 | č. 8 | `references/priloha-08.md` | `assets/templates/08-dps.md` |
| DPS RD / rekreace | § 7 odst. 2 | č. 9 | `references/priloha-09.md` | `assets/templates/09-dps-rd.md` |
| DPS dopravní infrastruktury | § 7 odst. 3 | **jiný PP** | — | neřeší tato vyhláška |
| **Odstranění stavby (demolice)** | § 8 | **č. 10** | `references/priloha-10.md` | `assets/templates/10-odstraneni-stavby.md` |
| Pasport stavby | § 9 | č. 11 | `references/priloha-11.md` | `assets/templates/11-pasport.md` |
| Doplnění DUR o ASR + SKR | § 11 | č. 13 | `references/priloha-13.md` | `assets/templates/13-doplneni-dur.md` |

Přehled a číslování objektů: `references/prehled.md`.

## Pracovní postup

1. **Urči přílohu** podle tabulky výše.
2. **Načti** odpovídající `references/priloha-XX.md` (autoritativní osnova) a
   `assets/templates/XX-….md` (vyplnitelná šablona).
3. **Seber vstupy** od uživatele / z podkladů (KN, průzkumy, IFC, starší PD,
   vyjádření DOSS). Chybějící povinné údaje označ `[[DOPLNIT: …]]`, nevymýšlej.
4. **Vygeneruj text** v pořadí částí vyhlášky:
   - **A** Průvodní list (vždy text)
   - **B** Souhrnná technická zpráva (vždy text; u DPS často revize z DSP)
   - **D.\*.\*.1 / D technická zpráva** (text objektů; u P10 vždy TZ bouracích prací)
   - **Dokladová část** – jen seznam / checklist, ne falšuj vydaná stanoviska
5. **Každý podbod a)–n) (nebo číslovaný)** musí mít odpověď, nebo výslovně
   `Neuplatní se.` + krátké odůvodnění (např. „stavba není v záplavovém území“).
6. **Azbest a nebezpečné látky** u odstranění stavby (P10) i u vlivů na ŽP
   (P1 B.7) nikdy nevynechávej – pokud průzkum chybí, uveď `[[DOPLNIT: průzkum azbestu]]`.
7. **Výstup** ulož jako Markdown (nebo DOCX přes export), název např.
   `TZ-B_odstraneni_<nazev>.md`. Zachovej číslování A/B/D dle vyhlášky.

## Pravidla psaní

- Úřední, věcný český styl; žádné marketingové fráze.
- Nepřeskakuj body osnovy a neměň písmena/čísla bodů.
- U souboru staveb (P4) části A–C pro celek, část D po objektech.
- U DPS (P8/P9) u B uveď, co je převzato z dokumentace pro povolení a co je revidováno.
- Placeholdery: `{{VELKYMI}}` pro identifikaci, `[[DOPLNIT: důvod]]` pro chybějící fakta.
- Neuváděj nepravdivá závazná stanoviska ani fiktivní čísla autorizací.

## Kontrola před odevzdáním

- [ ] Správná příloha (§ / typ dokumentace)
- [ ] A.1 kompletní (stavba + zpracovatel; u pasportu i vlastník)
- [ ] A.2 vstupní podklady vyjmenovány
- [ ] B pokrývá všechny podbody příslušné přílohy
- [ ] D – technická zpráva pro každý odstraňovaný / řešený objekt (kde příloha vyžaduje)
- [ ] Dokladová část jako checklist skutečných podkladů
- [ ] Azbest / nebezpečné látky / odpady řešeny tam, kde to příloha ukládá
- [ ] Body „neuplatní se“ mají odůvodnění

## Poznámky k rozsahu skillu

- Příloha č. 12 (stavební deník) není textová část PD — nepoužívej tento skill.
- Dopravní infrastruktura mimo věcnou působnost vyhlášky 131 u některých stupňů
  → odkaž na prováděcí předpis MD, negeneruj falešnou osnovu 131.
