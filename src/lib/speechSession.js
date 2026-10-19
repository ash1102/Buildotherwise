/** A field owns its session. Final phrases are delivered once; pauses can restart listening. */
export function createSpeechSession({ Recognition, onText, onState, onError, language = "en-US", schedule = setTimeout, cancel = clearTimeout }) {
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
    const delivered = new Set();
    let received = false;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.onstart = () => { if (wanted) onState(true, ""); };
    recognition.onresult = (event) => {
      if (active !== recognition) return;
      let preview = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const words = String(result[0]?.transcript || "").trim();
        if (result.isFinal && !delivered.has(index)) {
          delivered.add(index);
          if (words) { received = true; emptyRuns = 0; onText(words); }
        } else if (!result.isFinal && words) preview += (preview ? " " : "") + words;
      }
      if (wanted) onState(true, preview);
    };
    recognition.onerror = (event) => {
      if (active !== recognition) return;
      if (event.error === "no-speech") return; // A pause can end a browser session.
      wanted = false;
      clearTimer();
      onState(false, "");
      const messages = {
        "not-allowed": "Microphone access is blocked. Allow it in your browser, or use your keyboard’s microphone.",
        "service-not-allowed": "This browser has blocked speech recognition. Try your keyboard’s microphone.",
        "audio-capture": "No microphone is available. Check your microphone connection or use your keyboard.",
        network: "The browser’s speech service could not connect. Your text is still here; try again or use your keyboard’s microphone."
      };
      onError(messages[event.error] || "Dictation was interrupted. Your text is still here; tap Dictate to resume.");
    };
    recognition.onend = () => {
      if (active !== recognition) return;
      active = null;
      if (!wanted) { onState(false, ""); return; }
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
    dispose() { stop(false); }
  };
}
