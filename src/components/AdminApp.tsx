"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Submission, Summary } from "@/lib/aggregate";
import { formatCzechNumber, formatPrague, formatShare } from "@/lib/format";
import {
  conditionOptions,
  improvementLabels,
  labelFor,
  qualityOptions,
  sizeOptions,
  waitOptions,
} from "@/lib/questions";
import { periodLabel, type Period } from "@/lib/period";
import CountUp from "@/components/CountUp";
import SpotlightCard from "@/components/SpotlightCard";
import { Bars } from "@/components/Bars";

type Results = {
  period: Period;
  generatedAt: string;
  summary: Summary;
  recent: Submission[];
};

const periodOptions: { id: Period; label: string }[] = [
  { id: "vse", label: "Vše" },
  { id: "dnes", label: "Dnes" },
  { id: "7", label: "7 dní" },
  { id: "30", label: "30 dní" },
];

export function AdminApp() {
  const [session, setSession] = useState<"loading" | "in" | "out">("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState<Period>("vse");
  const [results, setResults] = useState<Results | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    document.title = "Výsledky výdeje oděvů";
    fetch("/api/admin/stav", { cache: "no-store" })
      .then((response) => setSession(response.ok ? "in" : "out"))
      .catch(() => setSession("out"));
  }, []);

  useEffect(() => {
    if (session !== "in") return;
    let cancelled = false;

    const load = async () => {
      const response = await fetch(`/api/admin/vysledky?obdobi=${period}`, { cache: "no-store" });
      if (response.status === 401) {
        setSession("out");
        return;
      }
      if (!response.ok) throw new Error("vysledky");
      const data = (await response.json()) as Results;
      if (!cancelled) {
        setResults(data);
        setLoadError("");
      }
    };

    load().catch(() => {
      if (!cancelled) setLoadError("Výsledky se teď nepodařilo načíst.");
    });

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load().catch(() => {
          if (!cancelled) setLoadError("Spojení na chvíli vypadlo. Poslední data zůstávají na obrazovce.");
        });
      }
    }, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session, period]);

  const loginForm = useRef<HTMLFormElement>(null);

  useGSAP(() => {
    if (!loginError || !loginForm.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    gsap.fromTo(loginForm.current, { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
  }, [loginError]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/prihlaseni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setLoginError(data?.error || "Přihlášení se nepodařilo.");
        return;
      }
      setPassword("");
      setSession("in");
    } catch {
      setLoginError("Spojení se nepodařilo.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/odhlaseni", { method: "POST" });
    setResults(null);
    setSession("out");
  }

  if (session === "loading") {
    return (
      <main className="admin narrow">
        <p className="status">Načítám přehled…</p>
      </main>
    );
  }

  if (session === "out") {
    return (
      <main className="admin narrow">
        <p className="kicker">Výdej oděvů</p>
        <h1 className="serif">Přehled pro zřizovatele</h1>
        <p className="lead">Heslo otevře výsledky, export a QR kód k vyvěšení u výdeje.</p>
        <form className="login" onSubmit={onLogin} ref={loginForm}>
          <label htmlFor="heslo">Heslo</label>
          <input
            id="heslo"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {loginError ? (
            <p className="form-error" role="alert">
              {loginError}
            </p>
          ) : null}
          <button className="primary" type="submit" disabled={busy}>
            {busy ? "Ověřuji…" : "Vstoupit"}
          </button>
        </form>
      </main>
    );
  }

  const summary = results?.summary;
  const exportQuery = `obdobi=${period}`;

  return (
    <main className="admin">
      <header className="admin-bar no-print">
        <div>
          <p className="kicker">Výdej oděvů</p>
          <h1 className="serif">Výsledky dotazníku</h1>
        </div>
        <button className="ghost" type="button" onClick={logout}>
          Odhlásit
        </button>
      </header>

      <section className="poster" id="plakat">
        <div>
          <p className="kicker">QR kód k vyvěšení</p>
          <h2 className="serif">Ohodnoťte výdej pracovních oděvů</h2>
          <p className="lead">Naskenujte kód telefonem. Dotazník zabere asi minutu a jde vyplnit jen jednou.</p>
          <p className="hint">
            Zámek drží prohlížeč v telefonu. Když někdo smaže data tohoto webu, může odpovědět znovu.
          </p>
          <p className="print-only hint">Naskenujte a odpovězte hned u výdejního okénka.</p>
        </div>
        <div className="qr-box">
          {/* QR se načítá až po přihlášení, cookie jde s požadavkem na obrázek. */}
          <img src="/api/admin/qr" alt="QR kód, který otevře dotazník" width={240} height={240} />
          <a className="text-link no-print" href="/api/admin/qr?stahnout=1">
            Stáhnout PNG
          </a>
          <button className="ghost no-print" type="button" onClick={() => window.print()}>
            Vytisknout plakát
          </button>
        </div>
      </section>

      <div className="toolbar no-print">
        <div className="segments" role="group" aria-label="Období">
          {periodOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={option.id === period ? "segment on" : "segment"}
              onClick={() => setPeriod(option.id)}
              aria-pressed={option.id === period}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="exports">
          <a className="primary slim" href={`/api/admin/export?typ=xlsx&${exportQuery}`}>
            Stáhnout Excel
          </a>
          <a className="ghost" href={`/api/admin/export?typ=csv&${exportQuery}`}>
            CSV
          </a>
          <a className="ghost" href={`/api/admin/export?typ=pdf&${exportQuery}`}>
            PDF
          </a>
        </div>
      </div>

      <p className="live no-print">
        <span className="dot" aria-hidden="true" />
        {results
          ? `${periodLabel(period)} · obnoveno ${formatPrague(results.generatedAt)}`
          : "Načítám odpovědi…"}
      </p>
      {loadError ? (
        <p className="form-error no-print" role="status">
          {loadError}
        </p>
      ) : null}

      {summary ? (
        <>
          <section className="kpi-grid no-print">
            <SpotlightCard className="kpi" theme="light" spotlightColor="#c4491d" intensity={0.4} softness={0.75}>
              <p className="kpi-label">Odpovědi</p>
              <CountUp className="kpi-value" to={summary.total} duration={1.1} trigger="load" />
            </SpotlightCard>
            <SpotlightCard className="kpi" theme="light" spotlightColor="#1e332b" intensity={0.35} softness={0.75}>
              <p className="kpi-label">Spokojenost</p>
              {summary.satisfactionAvg === null ? (
                <p className="kpi-value">—</p>
              ) : (
                <CountUp
                  className="kpi-value"
                  to={summary.satisfactionAvg}
                  decimals={1}
                  duration={1.1}
                  trigger="load"
                  suffix=" z 5"
                />
              )}
            </SpotlightCard>
            <SpotlightCard className="kpi" theme="light" spotlightColor="#c4491d" intensity={0.32} softness={0.8}>
              <p className="kpi-label">Správná velikost</p>
              {summary.sizeOkShare === null ? (
                <p className="kpi-value">—</p>
              ) : (
                <CountUp
                  className="kpi-value"
                  to={Math.round(summary.sizeOkShare * 100)}
                  duration={1.1}
                  trigger="load"
                  suffix=" %"
                />
              )}
            </SpotlightCard>
            <SpotlightCard className="kpi" theme="light" spotlightColor="#1e332b" intensity={0.32} softness={0.8}>
              <p className="kpi-label">Výdej do 5 minut</p>
              {summary.quickWaitShare === null ? (
                <p className="kpi-value">—</p>
              ) : (
                <CountUp
                  className="kpi-value"
                  to={Math.round(summary.quickWaitShare * 100)}
                  duration={1.1}
                  trigger="load"
                  suffix=" %"
                />
              )}
            </SpotlightCard>
          </section>

          {summary.total === 0 ? (
            <section className="panel no-print empty">
              <h2>Zatím tu není žádná odpověď</h2>
              <p>Vyvěste QR kód u výdejního okénka. Nové odpovědi se tu objeví samy.</p>
            </section>
          ) : (
            <div className="panels no-print">
              <Bars title="Celková spokojenost" buckets={summary.satisfaction} />
              <Bars title="Velikost" buckets={summary.size} />
              <Bars title="Kvalita oděvu" buckets={summary.quality} />
              <Bars title="Čekání" buckets={summary.wait} />
              <Bars title="Personál" buckets={summary.staff} />
              <Bars title="Stav oděvu" buckets={summary.condition} />
              <Bars title="Co zlepšit" buckets={summary.improvements} />
              <section className="panel wide">
                <h2>Poslední odpovědi</h2>
                <p className="hint">
                  Průměr personálu{" "}
                  {summary.staffAvg === null ? "zatím není" : `${formatCzechNumber(summary.staffAvg, 1)} z 5`}. Podíl
                  správné velikosti {summary.sizeOkShare === null ? "—" : formatShare(summary.sizeOkShare)}.
                </p>
                <div className="table-wrap" data-lenis-prevent>
                  <table>
                    <thead>
                      <tr>
                        <th>Čas</th>
                        <th>Spokojenost</th>
                        <th>Velikost</th>
                        <th>Kvalita</th>
                        <th>Čekání</th>
                        <th>Personál</th>
                        <th>Stav</th>
                        <th>Komentář</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.recent.map((row) => (
                        <tr key={row.id}>
                          <td>{formatPrague(row.createdAt)}</td>
                          <td>{row.satisfaction}</td>
                          <td>{labelFor(sizeOptions, row.sizeFit)}</td>
                          <td>{labelFor(qualityOptions, row.quality)}</td>
                          <td>{labelFor(waitOptions, row.waitTime)}</td>
                          <td>{row.staff}</td>
                          <td>{labelFor(conditionOptions, row.condition)}</td>
                          <td>{[row.comment, improvementLabels(row.improvements)].filter(Boolean).join(" · ") || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              {summary.comments.length > 0 ? (
                <section className="panel wide">
                  <h2>Komentáře</h2>
                  <ul className="comments">
                    {summary.comments.map((comment) => (
                      <li key={`${comment.createdAt}-${comment.text}`}>
                        <time>{formatPrague(comment.createdAt)}</time>
                        <p>{comment.text}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}
