"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnnounce } from "./A11yProvider";

const STORAGE_KEY = "ss-a11y";
const SPEEDS = [0.75, 1, 1.25, 1.5];
const TEXT_SIZES = [100, 112, 125, 150];
const SPEECH_LANG = "ta-IN"; // தமிழ் குரல் மொழி

/* ---------- Turn the visible page content into clean speakable text ---------- */
function collectText(root) {
  const lines = [];
  let buf = "";
  const flush = () => {
    const t = buf.replace(/\s+/g, " ").trim();
    if (t) lines.push(/[.!?:;]$/.test(t) ? t : t + ".");
    buf = "";
  };
  const walk = (node) => {
    if (node.nodeType === 3) {
      buf += node.nodeValue;
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node;
    if (
      el.getAttribute("aria-hidden") === "true" ||
      el.hidden ||
      el.id === "a11y-toolbar" ||
      /^(SCRIPT|STYLE|NOSCRIPT|SVG|IFRAME|SELECT|INPUT|TEXTAREA)$/i.test(el.tagName)
    )
      return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    if (el.tagName === "IMG") {
      const alt = el.getAttribute("alt");
      if (alt) buf += ` ${alt} `;
      return;
    }
    const block = !cs.display.startsWith("inline");
    if (block) flush();
    el.childNodes.forEach(walk);
    if (block) flush();
  };
  walk(root);
  return lines;
}

/* Browsers cut long utterances off after ~15s, so speak in short chunks */
function toChunks(lines, max = 200) {
  const chunks = [];
  let cur = "";
  const push = () => {
    if (cur) chunks.push(cur);
    cur = "";
  };
  for (const line of lines) {
    if (line.length > max) {
      push();
      line.split(" ").forEach((w) => {
        if ((cur + " " + w).length > max) push();
        cur += (cur ? " " : "") + w;
      });
      push();
    } else if ((cur + " " + line).length > max) {
      push();
      cur = line;
    } else {
      cur += (cur ? " " : "") + line;
    }
  }
  push();
  return chunks;
}

/* Pick an installed Tamil voice if the browser has one */
function pickTamilVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return (
    voices.find((v) => v.lang?.toLowerCase() === SPEECH_LANG.toLowerCase()) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith("ta")) ||
    null
  );
}

export default function ReadAloud() {
  const announce = useAnnounce();
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState("idle"); // idle | playing | paused
  const [rate, setRate] = useState(1);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [noMotion, setNoMotion] = useState(false);

  const chunksRef = useRef([]);
  const idxRef = useRef(0);
  const tokenRef = useRef(0);
  const fabRef = useRef(null);
  const firstBtnRef = useRef(null);

  /* Load saved preferences */
  useEffect(() => {
    setSupported("speechSynthesis" in window);
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (SPEEDS.includes(s.rate)) setRate(s.rate);
      if (Number.isInteger(s.sizeIdx) && TEXT_SIZES[s.sizeIdx]) setSizeIdx(s.sizeIdx);
      if (typeof s.noMotion === "boolean") setNoMotion(s.noMotion);
    } catch {}
    return () => window.speechSynthesis?.cancel();
  }, []);

  /* Apply + save preferences */
  useEffect(() => {
    document.documentElement.style.fontSize = `${TEXT_SIZES[sizeIdx]}%`;
    document.documentElement.dataset.motion = noMotion ? "off" : "";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate, sizeIdx, noMotion }));
    } catch {}
  }, [rate, sizeIdx, noMotion]);

  /* ---------- Speech engine ---------- */
  const speakFrom = useCallback(
    (i, r) => {
      const synth = window.speechSynthesis;
      const token = ++tokenRef.current; // makes events from cancelled speech harmless
      synth.cancel();
      const voice = pickTamilVoice();
      const next = (n) => {
        if (token !== tokenRef.current) return;
        idxRef.current = n;
        if (n >= chunksRef.current.length) {
          setState("idle");
          announce("படித்து முடிந்தது.");
          return;
        }
        const u = new SpeechSynthesisUtterance(chunksRef.current[n]);
        u.rate = r;
        u.lang = SPEECH_LANG;
        if (voice) u.voice = voice;
        u.onend = () => next(n + 1);
        u.onerror = () => token === tokenRef.current && setState("idle");
        synth.speak(u);
      };
      setState("playing");
      next(i);
    },
    [announce]
  );

  const stop = useCallback(() => {
    tokenRef.current++;
    window.speechSynthesis?.cancel();
    setState("idle");
  }, []);

  const readPage = useCallback(() => {
    const root = document.getElementById("main-content") || document.body;
    const title = document.title ? [document.title + "."] : [];
    chunksRef.current = toChunks([...title, ...collectText(root)]);
    if (!chunksRef.current.length) return announce("இந்தப் பக்கத்தில் படிக்க உரை எதுவும் இல்லை.");
    speakFrom(0, rate);
  }, [rate, speakFrom, announce]);

  const readSelection = () => {
    const text = window.getSelection()?.toString().trim();
    if (!text)
      return announce(
        "முதலில் பக்கத்தில் உரையைத் தேர்ந்தெடுக்கவும், பிறகு “தேர்ந்தெடுத்ததைப் படி” என்பதைத் தேர்வு செய்யவும்."
      );
    chunksRef.current = toChunks([text]);
    speakFrom(0, rate);
  };

  const togglePause = () => {
    const synth = window.speechSynthesis;
    if (state === "playing") {
      synth.pause();
      setState("paused");
    } else if (state === "paused") {
      synth.resume();
      setState("playing");
    }
  };

  const changeRate = (r) => {
    setRate(r);
    if (state !== "idle") speakFrom(idxRef.current, r); // புதிய வேகத்தில் தொடரும்
  };

  /* Keyboard: Alt+R reads/stops the page, Escape stops speech or closes the panel */
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && e.code === "KeyR" && supported) {
        e.preventDefault();
        state === "idle" ? readPage() : stop();
      } else if (e.key === "Escape") {
        if (state !== "idle") stop();
        else if (open) {
          setOpen(false);
          fabRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, open, supported, readPage, stop]);

  useEffect(() => {
    if (open) firstBtnRef.current?.focus();
  }, [open]);

  const btn =
    "rounded-full border-2 border-[#1a1408] px-4 py-2 text-sm font-extrabold transition hover:bg-[#c9a227] active:scale-95 disabled:opacity-40";

  return (
    <div id="a11y-toolbar" className="fixed bottom-20 left-4 z-50 md:bottom-4 print:hidden">
      {open && (
        <section
          id="a11y-panel"
          aria-labelledby="a11y-title"
          className="gc-rise mb-3 w-[min(92vw,320px)] rounded-3xl border-2 border-[#1a1408] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(138,100,16,0.6)]"
        >
          <h2 id="a11y-title" className="text-lg font-extrabold">
            அணுகல் வசதிகள்
          </h2>

          {supported ? (
            <div className="mt-4">
              <p className="text-xs font-extrabold tracking-widest text-[#8A6A00]">உரக்கப் படி</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  ref={firstBtnRef}
                  type="button"
                  onClick={() => (state === "idle" ? readPage() : stop())}
                  className={`${btn} ${state !== "idle" ? "bg-[#1a1408] text-white hover:text-[#1a1408]" : "bg-[#c9a227]"}`}
                >
                  {state === "idle" ? "இந்தப் பக்கத்தைப் படி" : "நிறுத்து"}
                </button>
                <button type="button" onClick={togglePause} disabled={state === "idle"} className={btn}>
                  {state === "paused" ? "தொடர்" : "இடைநிறுத்து"}
                </button>
                <button type="button" onClick={readSelection} className={btn}>
                  தேர்ந்தெடுத்ததைப் படி
                </button>
              </div>

              <label htmlFor="a11y-rate" className="mt-4 block text-sm font-bold">
                வேகம்
              </label>
              <select
                id="a11y-rate"
                value={rate}
                onChange={(e) => changeRate(Number(e.target.value))}
                className="mt-1 w-full rounded-full border-2 border-[#1a1408] bg-white px-4 py-2 text-sm font-bold"
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s}x
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs font-semibold text-[#6B5A1E]">
                குறுக்குவழி: தொடங்க அல்லது நிறுத்த Alt + R. Escape விசையும் நிறுத்தும்.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold">
              இந்த உலாவியில் உரக்கப் படிக்கும் வசதி ஆதரிக்கப்படவில்லை.
            </p>
          )}

          <div className="leaf-divider my-4" aria-hidden="true" />

          <p className="text-xs font-extrabold tracking-widest text-[#8A6A00]">காட்சி</p>
          <div className="mt-2 flex items-center gap-2" role="group" aria-label="எழுத்து அளவு">
            <button
              type="button"
              className={btn}
              disabled={sizeIdx === 0}
              onClick={() => {
                setSizeIdx(sizeIdx - 1);
                announce(`எழுத்து அளவு ${TEXT_SIZES[sizeIdx - 1]} சதவீதம்`);
              }}
              aria-label="எழுத்து அளவைக் குறை"
            >
              A−
            </button>
            <button
              type="button"
              className={btn}
              disabled={sizeIdx === TEXT_SIZES.length - 1}
              onClick={() => {
                setSizeIdx(sizeIdx + 1);
                announce(`எழுத்து அளவு ${TEXT_SIZES[sizeIdx + 1]} சதவீதம்`);
              }}
              aria-label="எழுத்து அளவை அதிகரி"
            >
              A+
            </button>
            <span className="text-sm font-bold" aria-hidden="true">
              {TEXT_SIZES[sizeIdx]}%
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={noMotion}
            onClick={() => {
              setNoMotion(!noMotion);
              announce(!noMotion ? "அசைவூட்டங்கள் அணைக்கப்பட்டன" : "அசைவூட்டங்கள் இயக்கப்பட்டன");
            }}
            className={`${btn} mt-3 w-full text-left ${noMotion ? "bg-[#c9a227]" : ""}`}
          >
            அசைவூட்டங்கள்: {noMotion ? "அணைப்பு" : "இயக்கம்"}
          </button>
        </section>
      )}

      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="அணுகல் கருவிகள்"
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#1a1408] bg-[#c9a227] text-xl font-extrabold shadow-lg transition hover:-translate-y-0.5 active:scale-95"
      >
        <span aria-hidden="true">{state === "playing" ? "◉" : "Aa"}</span>
      </button>
    </div>
  );
}