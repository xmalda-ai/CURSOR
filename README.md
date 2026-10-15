# Dotazník k výdeji pracovních oděvů

Krátký anonymní dotazník pro lidi, kteří si u výdeje vyzvednou pracovní oděv. Otevře se z QR kódu v telefonu. Zřizovatel vidí průběžné výsledky a stáhne je do Excelu, CSV nebo PDF.

Aplikace běží jako běžný web mimo vnitřní síť fabriky. Nasazení je připravené na [Render](https://render.com) s PostgreSQL, takže odpovědi nezůstávají na serveru ve fabrice.

## Co umí

- Sedm otázek na mobilu, většina je na jedno klepnutí.
- Z jednoho telefonu jde dotazník odeslat jen jednou. Zámek drží cookie a záloha v prohlížeči. Když někdo smaže data webu, může odpovědět znovu.
- Přehled na adrese `/admin` se sám obnovuje.
- Export odpovědí: Excel (`.xlsx`, listy Odpovědi a Souhrn), CSV se středníkem a UTF-8 pro český Excel, PDF se souhrnem a komentáři.
- QR kód ke stažení a k tisku.

## Lokální spuštění

Potřebujete Node.js 22 a PostgreSQL.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

V `.env.local` nastavte `DATABASE_URL`, `ADMIN_PASSWORD` a `SESSION_SECRET`. Dotazník je na `/`, přehled na `/admin`.

Testy:

```bash
DATABASE_URL=postgres://odevy:odevy@127.0.0.1:5432/odevy npm test
```

## Nasazení na Render

Po sloučení do větve `main` otevřete:

https://dashboard.render.com/blueprint/new?repo=https://github.com/xmalda-ai/CURSOR

Render vytvoří web a databázi ve Frankfurtu. Doplňte heslo `ADMIN_PASSWORD`. `DATABASE_URL` a `SESSION_SECRET` se doplní samy. Web poslouchá na `0.0.0.0` a portu z proměnné `PORT`. Kontrola zdraví je `/api/health`.

Bezplatný web usíná po 15 minutách a první naskenování QR pak chvíli trvá. Bezplatná databáze po 30 dnech skončí a odpovědi zmizí. Pro výdejnu přepněte web na plán starter a databázi na plán, který neexpiruje.

Veřejný odkaz na dotazník nikam neindexujeme. Heslo do přehledu nikam nedávejte na plakát.
