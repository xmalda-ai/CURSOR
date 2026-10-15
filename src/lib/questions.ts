export type Choice = { value: string; label: string };

export const satisfactionScale: Choice[] = [
  { value: "1", label: "Velmi nespokojeně" },
  { value: "2", label: "Nespokojeně" },
  { value: "3", label: "Průměrně" },
  { value: "4", label: "Spokojeně" },
  { value: "5", label: "Velmi spokojeně" },
];

export const staffScale: Choice[] = [
  { value: "1", label: "Velmi špatně" },
  { value: "2", label: "Špatně" },
  { value: "3", label: "Průměrně" },
  { value: "4", label: "Dobře" },
  { value: "5", label: "Výborně" },
];

export const sizeOptions: Choice[] = [
  { value: "ano", label: "Ano, velikost seděla" },
  { value: "jina", label: "Byla jen jiná velikost" },
  { value: "nebyla", label: "Moje velikost chyběla" },
];

export const qualityOptions: Choice[] = [
  { value: "vyborna", label: "Výborná" },
  { value: "dobra", label: "Dobrá" },
  { value: "prumerna", label: "Průměrná" },
  { value: "slaba", label: "Slabá" },
];

export const waitOptions: Choice[] = [
  { value: "do5", label: "Do 5 minut" },
  { value: "do15", label: "5 až 15 minut" },
  { value: "do30", label: "15 až 30 minut" },
  { value: "vic", label: "Déle než 30 minut" },
];

export const conditionOptions: Choice[] = [
  { value: "vporadku", label: "Čistý a nepoškozený" },
  { value: "drobnosti", label: "Drobné vady" },
  { value: "spatny", label: "Špinavý nebo poškozený" },
];

export const improvementOptions: Choice[] = [
  { value: "nic", label: "Nic, je to v pořádku" },
  { value: "velikosti", label: "Sklad velikostí" },
  { value: "cekani", label: "Čekací dobu" },
  { value: "sortiment", label: "Sortiment" },
  { value: "kvalita", label: "Kvalitu materiálu" },
  { value: "personal", label: "Přístup personálu" },
];

export function labelFor(options: Choice[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function improvementLabels(values: string[]): string {
  return values.map((value) => labelFor(improvementOptions, value)).join(", ");
}
