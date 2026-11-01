import React, { useState } from "react";
import { Download, LogOut } from "lucide-react";
import { deleteAccountWorkbook, useSyncStatus } from "@/lib/accountSync";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import useCurriculum from "@/hooks/useCurriculum";
import { readStore } from "@/lib/store";
import { ANSWER_KEY, DECISION_KEY, readWorkbookValue } from "@/lib/workbook";
import { downloadText } from "@/lib/download";
import { MAP_SECTIONS } from "@/lib/lifeMap";
import { TEXT_SIZES, THEMES, useDisplay } from "@/lib/display";
import { useToast } from "@/components/ui/use-toast";
import MyGettingStarted from "@/components/gettingStarted/MyGettingStarted";
import { Link } from "react-router-dom";
import { deleteRecord, listMyRecords } from "@/lib/learnerRecords";
import { deleteAllThreads, discoveryExportLines, listMyThreads } from "@/lib/discoveryThreads";
import { deleteAllDiscoveryRecords, listDiscoveries, recordExportLines } from "@/lib/discoveries";

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

  const answers = readWorkbookValue(ANSWER_KEY, {});
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

  const decisions = readWorkbookValue(DECISION_KEY, {});
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

const SYNC_WORDS = {
  saved: "Everything is saved.",
  saving: "Saving…",
  loading: "Bringing your workbook in…",
  offline: "Can’t reach your account right now. Your work is kept on this device and will save when you’re back online.",
  error: "Some changes haven’t saved yet. They’re kept on this device and will try again.",
};

function SyncLine() {
  const status = useSyncStatus();
  const words = SYNC_WORDS[status];
  return words ? <span className="text-foreground">{words}</span> : null;
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
  const [clearing, setClearing] = useState(false);
  const [confirmRecords, setConfirmRecords] = useState(false);
  const [deletingRecords, setDeletingRecords] = useState(false);
  const [confirmDiscoveries, setConfirmDiscoveries] = useState(false);
  const [deletingDiscoveries, setDeletingDiscoveries] = useState(false);
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

  const download = async () => {
    const stamp = new Date().toISOString().slice(0, 10);
    let text = buildExport(lessonsByCode || {});
    try {
      const threads = (await listMyThreads()) || [];
      text = `${text}\n${discoveryExportLines(threads).join("\n")}`;
      text = `${text}\n${recordExportLines(listDiscoveries()).join("\n")}`;
    } catch {
      toast({ title: "Your workbook downloaded, but My Discoveries couldn’t be added. Try again in a moment." });
    }
    downloadText(`entrepalooza-workbook-${stamp}.md`, text);
  };

  const deleteAllDiscoveries = async () => {
    setDeletingDiscoveries(true);
    try {
      const threadCount = await deleteAllThreads();
      const recordCount = await deleteAllDiscoveryRecords();
      const count = threadCount + recordCount;
      setConfirmDiscoveries(false);
      toast({ title: count ? "Your discoveries were deleted from your account." : "You have no saved discoveries." });
    } catch {
      toast({ title: `Some discoveries didn't delete. Try again, or email ${CONTACT}.` });
    } finally {
      setDeletingDiscoveries(false);
    }
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
      if (alsoClear) {
        try {
          await deleteAccountWorkbook();
          await deleteAllThreads();
          await deleteAllDiscoveryRecords();
        } catch {
          /* the account deletion request still covers it */
        }
        clearDevice();
      }
    } catch (error) {
      toast({ title: `That didn't send. Please email ${CONTACT} instead.` });
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllRecords = async () => {
    setDeletingRecords(true);
    try {
      const rows = await listMyRecords();
      for (const row of rows || []) {
        await deleteRecord(row.id);
      }
      setConfirmRecords(false);
      toast({ title: rows && rows.length ? "Your records were deleted from your account." : "You have no saved records." });
    } catch {
      toast({ title: `Some records didn't delete. Try again, or email ${CONTACT}.` });
    } finally {
      setDeletingRecords(false);
    }
  };

  return (
    <article className="space-y-6">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Settings</p>
        <h1 className="mt-2">Your account and your data</h1>
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
          <button type="button" onClick={async () => {
              await logout(false);
              window.location.href = "/";
            }} className={secondaryButton}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
          <p className="mt-2 text-[14px] text-muted-faint">
            Logging out saves your work to your account and takes your copy off this device, so the next person on a shared computer won’t see it.
          </p>
        </div>
      </Section>

      <Section title="My data">
        <p className="text-[16px] leading-relaxed text-muted-foreground">
          Your journal, answers and maps are saved to your Entrepalooza account. <SyncLine />
        </p>
        <p className="text-[16px] leading-relaxed text-muted-foreground">
          <Link to="/my-records" className="font-medium text-accent-ink underline underline-offset-2">
            My Records
          </Link>{" "}
          and{" "}
          <Link to="/record" className="font-medium text-accent-ink underline underline-offset-2">
            Discovery Record
          </Link>{" "}
          are saved to your account too, only when you press Save. Everything is kept in the app’s database, hosted by Base44. Other participants can’t open it. Build Otherwise runs this app, so our team can see what’s stored on it. Your entries stay private unless you choose to share them.
        </p>
        <button type="button" onClick={download} className={primaryButton}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Download my workbook, reflections and discoveries
        </button>

        <div className="border-t border-border pt-4">
          <h3 className="text-[16px]">Delete my workbook and discoveries</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            Removes your journal, step answers, decisions and maps, plus your discoveries and Discovery Record, from your account and from this device. This can’t be
            undone, so download a copy first if you want one. My Records are not deleted; use the button below for those.
          </p>
          {confirmClear ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={dangerButton}
                disabled={clearing}
                onClick={async () => {
                  setClearing(true);
                  try {
                    await deleteAccountWorkbook();
                    await deleteAllThreads();
                    await deleteAllDiscoveryRecords();
                    clearDevice();
                    toast({ title: "Your workbook and discoveries were deleted from your account." });
                  } catch {
                    toast({ title: `Some of it didn't delete. Try again, or email ${CONTACT}.` });
                  } finally {
                    setClearing(false);
                    setConfirmClear(false);
                  }
                }}
              >
                {clearing ? "Deleting…" : "Yes, delete my workbook and discoveries"}
              </button>
              <button type="button" className={secondaryButton} onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className={`mt-3 ${secondaryButton}`} onClick={() => setConfirmClear(true)}>
              Delete my workbook and discoveries
          )}
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-[16px]">Delete all My Records from my account</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            Removes every record on your My Records page from the database. Your workbook and journal stay. You
            can also delete records one at a time on the My Records page.
          </p>
          {confirmRecords ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={dangerButton} disabled={deletingRecords} onClick={deleteAllRecords}>
                {deletingRecords ? "Deleting…" : "Yes, delete all my records"}
              </button>
              <button type="button" className={secondaryButton} onClick={() => setConfirmRecords(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className={`mt-3 ${secondaryButton}`} onClick={() => setConfirmRecords(true)}>
              Delete all My Records
            </button>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-[16px]">Delete all My Discoveries from my account</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            Removes every discovery on your My Discoveries page from the database. Your workbook, journal and records
            stay. You can also delete discoveries one at a time on the My Discoveries page.
          </p>
          {confirmDiscoveries ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={dangerButton} disabled={deletingDiscoveries} onClick={deleteAllDiscoveries}>
                {deletingDiscoveries ? "Deleting…" : "Yes, delete all my discoveries"}
              </button>
              <button type="button" className={secondaryButton} onClick={() => setConfirmDiscoveries(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className={`mt-3 ${secondaryButton}`} onClick={() => setConfirmDiscoveries(true)}>
              Delete all My Discoveries
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
                  Also delete my workbook, journal and discoveries from my account now
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
