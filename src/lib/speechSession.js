/**
 * A field owns its session. Each word is delivered once.
 *
 * Phone browsers behave differently from desktop ones, so this handles three known problems:
 * - Android Chrome can repeat earlier words inside each new final result ("I went I went to").
 *   Only the words not yet delivered are handed over.
 * - iPhone Safari often never marks words final before the session ends, so tapping Stop lost
 *   them. Whatever was still showing as a preview is delivered when the session ends.
 * - Restarting the microphone automatically, outside a tap, fails on phones. On phones each tap
 *   is one listening session; tap Dictate again to add more. Desktop keeps listening through pauses.
 */

export function isTouchDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

const words = (text) => String(text || "").trim().split(/\s+/).filter(Boolean);
const norm = (word) => word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");

/** Final results joined into one transcript, collapsing results that repeat everything before them. */
export function mergeFinals(finals) {
  let merged = [];
  finals.forEach((text) => {
    const next = words(text);
    if (!next.length) return;
    const repeatsAll = merged.length > 0 && merged.length <= next.length && merged.every((word, i) => norm(word) === norm(next[i]));
    merged = repeatsAll ? next : merged.concat(next);
  });
  return merged;
}

/** The words in `all` that come after what was already delivered. */
export function newWords(all, delivered) {
  let shared = 0;
  while (shared < delivered.length && shared < all.length && norm(all[shared]) === norm(delivered[shared])) shared += 1;
  // If the browser rewrote earlier words, never repeat them: only add what is past the delivered length.
  return all.slice(Math.max(shared, shared === delivered.length ? shared : delivered.length));
}

export function createSpeechSession({
  Recognition,
  onText,
  onState,
  onError,
  language = "en-US",
  schedule = setTimeout,
  cancel = clearTimeout,
  mobile = isTouchDevice(),
  inFrame = typeof window !== "undefined" && window.self !== window.top,
}) {
  let wanted = false;
  let active = null;
  let timer = null;
  let emptyRuns = 0;
  const clearTimer = () => { if (timer !== null) cancel(timer); timer = null; };

  const stop = (flush = true) => {
    wanted = false;
    clearTimer();
    if (active) {
      const current = active;
      if (!flush) { active = null; current.onresult = null; current.onend = null; current.onerror = null; }
      try { flush ? current.stop() : current.abort(); } catch { /* Already ended. */ }
    }
    onState(false, "");
  };

  const begin = () => {
    if (!wanted) return;
    const recognition = new Recognition();
    active = recognition;
    let delivered = [];
    let pending = "";
    let received = false;
    const deliver = (all) => {
      const fresh = newWords(all, delivered);
      if (!fresh.length) return;
      delivered = delivered.concat(fresh);
      received = true;
      emptyRuns = 0;
      onText(fresh.join(" "));
    };

    recognition.continuous = !mobile;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.onstart = () => { if (wanted) onState(true, ""); };
    recognition.onresult = (event) => {
      if (active !== recognition) return;
      const finals = [];
      let interim = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = String(result[0]?.transcript || "").trim();
        if (!text) continue;
        if (result.isFinal) finals.push(text);
        else interim += (interim ? " " : "") + text;
      }
      const merged = mergeFinals(finals);
      deliver(merged);
      // What is still a preview, minus anything already delivered.
      pending = interim ? newWords(merged.concat(words(interim)), delivered).join(" ") : "";
      if (wanted || mobile) onState(true, pending);
    };
    recognition.onerror = (event) => {
      if (active !== recognition) return;
      if (event.error === "no-speech" || event.error === "aborted") return; // A pause or a Stop tap, not a failure.
      wanted = false;
      clearTimer();
      onState(false, "");
      const blocked = inFrame
        ? "The microphone is blocked inside this preview window. Open the live workbook in its own tab, or use your keyboard’s microphone."
        : "Microphone access is blocked. Allow it for this site in your browser settings, or use your keyboard’s microphone.";
      const messages = {
        "not-allowed": blocked,
        "service-not-allowed": inFrame ? blocked : "This browser has blocked speech recognition. Try your keyboard’s microphone.",
        "audio-capture": "No microphone is available. Check your microphone connection or use your keyboard.",
        network: "The browser’s speech service could not connect. Your text is still here; try again or use your keyboard’s microphone.",
      };
      onError(messages[event.error] || "Dictation was interrupted. Your text is still here; tap Dictate to resume.");
    };
    recognition.onend = () => {
      if (active !== recognition) return;
      active = null;
      // iPhone Safari: words still in preview when the session ends are kept, not lost.
      if (pending) { deliver(delivered.concat(words(pending))); pending = ""; }
      if (!wanted || mobile) { wanted = false; onState(false, ""); return; }
      emptyRuns = received ? 0 : emptyRuns + 1;
      if (emptyRuns >= 4) {
        wanted = false;
        onState(false, "");
        onError("No speech was received. Tap Dictate to resume, or use your keyboard’s microphone.");
        return;
      }
      onState(true, "");
      timer = schedule(() => { timer = null; begin(); }, 300);
    };
    try { recognition.start(); }
    catch { wanted = false; active = null; onState(false, ""); onError("Dictation could not start. Try again or use your keyboard’s microphone."); }
  };

  return {
    start() { if (wanted) return; wanted = true; emptyRuns = 0; onState(true, ""); begin(); },
    stop,
    dispose() { stop(false); },
  };
}
