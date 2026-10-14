import React, { useState } from "react";
import { Download, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import useCurriculum from "@/hooks/useCurriculum";
import { readStore } from "@/lib/store";
import { downloadText } from "@/lib/download";
import { MAP_SECTIONS } from "@/lib/lifeMap";
import { TEXT_SIZES, THEMES, useDisplay } from "@/lib/display";
import { useToast } from "@/components/ui/use-toast";
import MyGettingStarted from "@/components/gettingStarted/MyGettingStarted";

const STORE_PREFIX = "entrepalooza.v1.";
const CONTACT = "Start@buildotherwise.org";

const inputClass =
  "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const primaryButton =
  "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60";
const secondaryButton =
  "inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2.5 text-[15px] font-medium text-foreground transition hover:bg-secondary disabled:opacity-60";
const dangerButton =
  "inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2.5 text-[15px] font-medium text-destructive-foreground transition hover:opacity-90 disabled:opacity-60";

function Section({ title, children }) {
  return (
    <section className="workbook-section">
      <h2 className="text-[19px]">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function Choice({ name, options, value, onChange, legend }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-semibold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-full border px-4 py-2 text-[15px] transition ${
              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-foreground hover:bg-secondary"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Everything the workbook keeps on this device, as one readable text file. */
function buildExport(lessonsByCode) {
  const lines = [`# My Entrepalooza workbook`, `Downloaded ${new Date().toLocaleString()}`, ""];

  const journal = readStore("journal", []);
  lines.push(`## Journal (${journal.length} ${journal.length === 1 ? "entry" : "entries"})`, "");
  [...journal]
    .sort((a, b) => (a.created_date > b.created_date ? 1 : -1))
    .forEach((entry) => {
      const when = entry.created_date ? new Date(entry.created_date).toLocaleString() : "";
      const where = entry.lesson_title || entry.lesson_code || "";
      lines.push(`### ${when}${where ? ` · ${where}` : ""}`);
      if (entry.prompt) lines.push(`Prompt: ${entry.prompt}`);
      lines.push(entry.body || "", "");
    });

  const answers = readStore("answers", {});
  const answerKeys = Object.keys(answers).filter((key) => String(answers[key] || "").trim());
  lines.push(`## Workbook answers`, "");
  const byCode = {};
  answerKeys.forEach((key) => {
    const [code, index] = key.split("#");
    byCode[code] = byCode[code] || [];
    byCode[code].push({ index, value: answers[key] });
  });
  Object.keys(byCode)
    .sort()
    .forEach((code) => {
      const lesson = lessonsByCode[code];
      const prompts = lesson ? [...(lesson.try_prompts || []), ...(lesson.reflect_prompts || [])] : [];
      lines.push(`### ${lesson ? lesson.title : code}`);
      byCode[code].forEach(({ index, value }) => {
        const label = prompts[Number(index)] || index;
        lines.push(`- ${label}: ${value}`);
      });
      lines.push("");
    });

  const decisions = readStore("decisions", {});
  const decided = Object.entries(decisions).filter(([, value]) => value);
  if (decided.length) {
    lines.push(`## Next decisions`, "");
    decided.forEach(([code, value]) => lines.push(`- ${(lessonsByCode[code] || {}).title || code}: ${value}`));
    lines.push("");
  }

  const lifeMap = readStore("lifeMap", {});
  lines.push(`## Life Map`, "");
  MAP_SECTIONS.forEach((section) => {
    const items = lifeMap[section.key];
    const list = Array.isArray(items) ? items : items ? [items] : [];
    if (!list.length) return;
    lines.push(`### ${section.label}`);
    list.forEach((item) => lines.push(`- ${typeof item === "string" ? item : item.text || item.label || JSON.stringify(item)}`));
    lines.push("");
  });

  const notes = readStore("discoveryNotes", {});
  const noteEntries = Object.entries(notes).filter(([, value]) => String(value || "").trim());
  if (noteEntries.length) {
    lines.push(`## Discovery notes`, "");
    noteEntries.forEach(([section, value]) => lines.push(`- ${section}: ${value}`));
    lines.push("");
  }

  return lines.join("\n");
}

function clearDevice() {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(STORE_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    /* storage unavailable: nothing to clear */
  }
  window.dispatchEvent(new CustomEvent("entrepalooza:change", { detail: null }));
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { lessonsByCode } = useCurriculum();
  const [display, setDisplay] = useDisplay();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [alsoClear, setAlsoClear] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteSent, setDeleteSent] = useState(false);

  const changePassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "Use at least 8 characters for the new password." });
      return;
    }
    setSavingPassword(true);
    try {
      await base44.auth.changePassword({ userId: user?.id, currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast({ title: "Your password has been changed." });
    } catch (error) {
      toast({ title: "That didn't work. Check your current password and try again." });
    } finally {
      setSavingPassword(false);
    }
  };

  const download = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`entrepalooza-workbook-${stamp}.md`, buildExport(lessonsByCode || {}));
  };

  const requestDeletion = async () => {
    setDeleting(true);
    try {
      await base44.entities.Feedback.create({
        kind: "usability",
        message: `ACCOUNT DELETION REQUEST: please delete the account for ${user?.email || "this user"}${
          user?.id ? ` (user id ${user.id})` : ""
        }.`,
        email: user?.email || "",
        description: "Account deletion request",
      });
      setDeleteSent(true);
      if (alsoClear) clearDevice();
    } catch (error) {
      toast({ title: `That didn't send. Please email ${CONTACT} instead.` });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="space-y-6">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Settings</p>
        <h1 className="mt-2">Your account and this device</h1>
      </header>

      <MyGettingStarted />

      <Section title="Account">
        <dl className="grid gap-2 text-[16px] sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{user?.full_name || "Not set"}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user?.email || "Not set"}</dd>
        </dl>

        <form onSubmit={changePassword} className="max-w-sm space-y-3 border-t border-border pt-4">
          <h3 className="text-[16px]">Change password</h3>
          <label className="block text-[15px]">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={inputClass}
              required
            />
          </label>
          <label className="block text-[15px]">
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClass}
              required
            />
          </label>
          <button type="submit" disabled={savingPassword} className={primaryButton}>
            {savingPassword ? "Saving…" : "Change password"}
          </button>
        </form>

        <div className="border-t border-border pt-4">
          <button type="button" onClick={() => {
              logout(false);
              window.location.href = "/";
            }} className={secondaryButton}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
          <p className="mt-2 text-[14px] text-muted-faint">
            Logging out keeps your answers on this device. To remove them, use “Clear this device” below.
          </p>
        </div>
      </Section>

      <Section title="My data">
        <p className="text-[16px] leading-relaxed text-muted-foreground">
          Your journal, answers and maps are saved in this browser only. Download a copy before switching devices or
          clearing your browser.
        </p>
        <button type="button" onClick={download} className={primaryButton}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Download everything I’ve written
        </button>

        <div className="border-t border-border pt-4">
          <h3 className="text-[16px]">Clear this device</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            Removes your journal, answers and maps from this browser. Useful on a shared or public computer. This can’t be
            undone, so download a copy first if you want one.
          </p>
          {confirmClear ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={dangerButton}
                onClick={() => {
                  clearDevice();
                  setConfirmClear(false);
                  toast({ title: "This device has been cleared." });
                }}
              >
                Yes, clear this device
              </button>
              <button type="button" className={secondaryButton} onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className={`mt-3 ${secondaryButton}`} onClick={() => setConfirmClear(true)}>
              Clear this device
            </button>
          )}
        </div>
      </Section>

      <Section title="Display">
        <Choice
          name="text-size"
          legend="Text size"
          options={TEXT_SIZES}
          value={display?.textSize || "normal"}
          onChange={(textSize) => setDisplay((current) => ({ ...current, textSize }))}
        />
        <Choice
          name="theme"
          legend="Light or dark"
          options={THEMES}
          value={display?.theme || "light"}
          onChange={(theme) => setDisplay((current) => ({ ...current, theme }))}
        />
      </Section>

      <Section title="Delete my account">
        {deleteSent ? (
          <p className="text-[16px] leading-relaxed">
            Your request has been sent. Your account will be deleted, and you’ll get a confirmation at{" "}
            {user?.email || "your email"}. Questions: {CONTACT}.
          </p>
        ) : (
          <>
            <p className="text-[16px] leading-relaxed text-muted-foreground">
              This sends a request to delete your account. You don’t need to give a reason.
            </p>
            {confirmDelete ? (
              <div className="space-y-3">
                <label className="flex items-start gap-2 text-[15px]">
                  <input
                    type="checkbox"
                    checked={alsoClear}
                    onChange={(event) => setAlsoClear(event.target.checked)}
                    className="mt-1"
                  />
                  Also clear my answers from this device
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={deleting} className={dangerButton} onClick={requestDeletion}>
                    {deleting ? "Sending…" : "Yes, delete my account"}
                  </button>
                  <button type="button" className={secondaryButton} onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className={dangerButton} onClick={() => setConfirmDelete(true)}>
                Delete my account
              </button>
            )}
          </>
        )}
      </Section>
    </article>
  );
}
