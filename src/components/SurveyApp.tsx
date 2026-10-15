"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  conditionOptions,
  improvementOptions,
  qualityOptions,
  satisfactionScale,
  sizeOptions,
  staffScale,
  waitOptions,
  type Choice,
} from "@/lib/questions";

type Phase = "boot" | "welcome" | "form" | "thanks" | "already" | "error";

type SingleField = "sizeFit" | "quality" | "waitTime" | "condition";

type Step =
  | {
      kind: "scale";
      title: string;
      low: string;
      high: string;
      options: Choice[];
      field: "satisfaction" | "staff";
    }
  | { kind: "single"; title: string; options: Choice[]; field: SingleField }
  | { kind: "close"; title: string };

const STEPS: Step[] = [
  {
    kind: "scale",
    field: "satisfaction",
    title: "Jak jste spokojeni s výdejem pracovních oděvů?",
    low: "Velmi nespokojeně",
    high: "Velmi spokojeně",
    options: satisfactionScale,
  },
  {
    kind: "single",
    field: "sizeFit",
    title: "Dostali jste oděv ve své velikosti?",
    options: sizeOptions,
  },
  {
    kind: "single",
    field: "quality",
    title: "Jaká je kvalita oděvu?",
    options: qualityOptions,
  },
  {
    kind: "single",
    field: "waitTime",
    title: "Jak dlouho jste čekali na výdej?",
    options: waitOptions,
  },
  {
    kind: "scale",
    field: "staff",
    title: "Jak hodnotíte personál výdejny?",
    low: "Velmi špatně",
    high: "Výborně",
    options: staffScale,
  },
  {
    kind: "single",
    field: "condition",
    title: "V jakém stavu byl vydaný oděv?",
    options: conditionOptions,
  },
  {
    kind: "close",
    title: "Co bychom měli zlepšit?",
  },
];

type Draft = {
  satisfaction?: string;
  staff?: string;
  sizeFit?: string;
  quality?: string;
  waitTime?: string;
  condition?: string;
  improvements: string[];
  comment: string;
};

const emptyDraft: Draft = { improvements: [], comment: "" };

function recallToken(): string | null {
  try {
    return localStorage.getItem("odev_tid");
  } catch {
    return null;
  }
}

function rememberToken(token: string) {
  try {
    localStorage.setItem("odev_tid", token);
  } catch {
    /* Soukromý režim prohlížeče token neudrží. Zůstane aspoň cookie. */
  }
}

export function SurveyApp() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const token = recallToken();
    const headers: HeadersInit = token ? { "x-odev-tid": token } : {};
    fetch("/api/anketa", { headers, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("stav");
        const data = (await response.json()) as { stav: string; token?: string };
        if (data.token) rememberToken(data.token);
        setPhase(data.stav === "hotovo" ? "already" : "welcome");
      })
      .catch(() => setPhase("error"));
  }, []);

  useGSAP(
    () => {
      if (!root.current || phase === "boot") return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(
        root.current,
        { autoAlpha: reduce ? 1 : 0, y: reduce ? 0 : 18 },
        { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.42, ease: "power3.out" },
      );
    },
    { dependencies: [phase, step], scope: root },
  );

  useEffect(() => {
    if (phase === "form" || phase === "welcome" || phase === "thanks" || phase === "already") {
      heading.current?.focus();
    }
  }, [phase, step]);

  function clearAdvance() {
    if (timer.current) window.clearTimeout(timer.current);
  }

  function goNext() {
    clearAdvance();
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    clearAdvance();
    setFormError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  function choose(field: "satisfaction" | "staff" | SingleField, value: string, auto: boolean) {
    setDraft((current) => ({ ...current, [field]: value }));
    if (!auto) return;
    clearAdvance();
    const from = stepRef.current;
    timer.current = window.setTimeout(() => {
      setStep((current) => (current === from ? Math.min(current + 1, STEPS.length - 1) : current));
    }, 320);
  }

  function toggleImprovement(value: string) {
    setDraft((current) => {
      const has = current.improvements.includes(value);
      if (value === "nic") return { ...current, improvements: has ? [] : ["nic"] };
      const next = has
        ? current.improvements.filter((item) => item !== value)
        : [...current.improvements.filter((item) => item !== "nic"), value];
      return { ...current, improvements: next };
    });
  }

  async function submit() {
    if (sending) return;
    setSending(true);
    setFormError("");
    const token = recallToken();
    try {
      const response = await fetch("/api/anketa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-odev-tid": token } : {}),
        },
        body: JSON.stringify({
          satisfaction: Number(draft.satisfaction),
          staff: Number(draft.staff),
          sizeFit: draft.sizeFit,
          quality: draft.quality,
          waitTime: draft.waitTime,
          condition: draft.condition,
          improvements: draft.improvements,
          comment: draft.comment,
          website: honeypot.current?.value ?? "",
        }),
      });
      if (response.status === 409) {
        setPhase("already");
        return;
      }
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setFormError(data?.error || "Odpověď se nepodařilo uložit. Zkuste to znovu.");
        return;
      }
      setPhase("thanks");
    } catch {
      setFormError("Spojení se nepodařilo. Zkuste odeslání znovu.");
    } finally {
      setSending(false);
    }
  }

  const current = STEPS[step];
  const progress = phase === "thanks" || phase === "already" ? 1 : phase === "form" ? (step + 1) / STEPS.length : 0;
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!bar.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(bar.current, {
        scaleX: progress,
        transformOrigin: "left center",
        duration: reduce ? 0 : 0.45,
        ease: "power2.out",
      });
    },
    { dependencies: [progress] },
  );

  return (
    <div className="survey">
      <header className="survey-top">
        <p className="kicker">Výdej oděvů</p>
        <div className="progress" aria-hidden="true">
          <div className="progress-fill" ref={bar} />
        </div>
        {phase === "form" ? (
          <p className="step-count">
            Otázka {step + 1} z {STEPS.length}
          </p>
        ) : (
          <p className="step-count">Anonymní dotazník</p>
        )}
      </header>

      <main className={phase === "form" ? "survey-main" : "survey-main center"} ref={root}>
        {phase === "boot" ? <p className="status">Načítám dotazník…</p> : null}

        {phase === "error" ? (
          <>
            <h1 className="serif" ref={heading} tabIndex={-1}>
              Dotazník teď nejde otevřít
            </h1>
            <p className="lead">Zkuste stránku obnovit. Když to nepůjde, ozvěte se u výdejního okénka.</p>
          </>
        ) : null}

        {phase === "welcome" ? (
          <>
            <h1 className="serif" ref={heading} tabIndex={-1}>
              Jak proběhl výdej pracovních oděvů?
            </h1>
            <p className="lead">
              Sedm krátkých otázek, asi minuta. Odpověď je anonymní a z tohoto telefonu půjde odeslat jen jednou.
            </p>
            <button className="primary" type="button" onClick={() => setPhase("form")}>
              Začít
            </button>
          </>
        ) : null}

        {phase === "already" ? (
          <>
            <p className="mark" aria-hidden="true">
              ✓
            </p>
            <h1 className="serif" ref={heading} tabIndex={-1}>
              Už máme vaši odpověď
            </h1>
            <p className="lead">Děkujeme. Z tohoto telefonu už dotazník znovu neodešlete.</p>
          </>
        ) : null}

        {phase === "thanks" ? (
          <>
            <p className="mark thanks-mark" aria-hidden="true">
              ✓
            </p>
            <h1 className="serif" ref={heading} tabIndex={-1}>
              Děkujeme
            </h1>
            <p className="lead">Odpověď je uložená. Můžete telefon schovat a jít dál.</p>
          </>
        ) : null}

        {phase === "form" && current ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (current.kind === "close") submit();
              else goNext();
            }}
          >
            <h1 className="serif" ref={heading} tabIndex={-1}>
              {current.title}
            </h1>
            <p className="sr-only" aria-live="polite">
              Otázka {step + 1} z {STEPS.length}
            </p>

            {current.kind === "scale" ? (
              <>
                <div className="scale" role="radiogroup" aria-label={current.title}>
                  {current.options.map((option) => (
                    <label className="choice scale-choice" key={option.value}>
                      <input
                        type="radio"
                        name={current.field}
                        value={option.value}
                        checked={draft[current.field] === option.value}
                        onChange={() => choose(current.field, option.value, true)}
                      />
                      <span>{option.value}</span>
                    </label>
                  ))}
                </div>
                <div className="scale-ends">
                  <span>{current.low}</span>
                  <span>{current.high}</span>
                </div>
              </>
            ) : null}

            {current.kind === "single" ? (
              <div className="stack" role="radiogroup" aria-label={current.title}>
                {current.options.map((option) => (
                  <label className="choice" key={option.value}>
                    <input
                      type="radio"
                      name={current.field}
                      value={option.value}
                      checked={draft[current.field] === option.value}
                      onChange={() => choose(current.field, option.value, true)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            ) : null}

            {current.kind === "close" ? (
              <>
                <p className="hint">Můžete vybrat víc možností. Když je vše v pořádku, stačí odeslat.</p>
                <div className="stack">
                  {improvementOptions.map((option) => (
                    <label className="choice" key={option.value}>
                      <input
                        type="checkbox"
                        name="improvements"
                        value={option.value}
                        checked={draft.improvements.includes(option.value)}
                        onChange={() => toggleImprovement(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                <label className="comment-label" htmlFor="komentar">
                  Chcete něco doplnit?
                </label>
                <textarea
                  id="komentar"
                  maxLength={400}
                  value={draft.comment}
                  placeholder="Nepovinné"
                  onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, comment: event.target.value }))}
                />
                <p className="hint count">
                  {draft.comment.length}/400
                </p>
              </>
            ) : null}

            <div className="hp" aria-hidden="true">
              <label>
                Web
                <input ref={honeypot} tabIndex={-1} autoComplete="off" name="website" />
              </label>
            </div>

            {formError ? (
              <p className="form-error" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="actions">
              {step > 0 ? (
                <button className="ghost" type="button" onClick={goBack}>
                  Zpět
                </button>
              ) : (
                <span />
              )}
              {current.kind === "close" ? (
                <button className="primary" type="submit" disabled={sending}>
                  {sending ? "Odesílám…" : "Odeslat"}
                </button>
              ) : (
                <button className="primary" type="submit" disabled={!draft[current.field]}>
                  Pokračovat
                </button>
              )}
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}
