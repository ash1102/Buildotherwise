import { base44 } from "@/api/base44Client";
import { progressStorageKey, setProgressUserId } from "./progressScope";
import { postAuthDestination, pathRequiresGettingStarted } from "./postAuthPath";
import { readStore } from "./store";
import { ANSWER_KEY, STATE_KEY } from "./workbook";
import { startAccountSync } from "./accountSync";

/** After email login or sign-up. Provider login lands on returnTo, and the gate there uses the same account key. */
export async function destinationAfterAuth(user, returnTo) {
  const dest = returnTo || "/";
  let person = user || null;
  if (person?.role !== "admin" && !person?.id) {
    try {
      person = await base44.auth.me();
    } catch {
      person = user || null;
    }
  }
  if (person?.role === "admin") return dest;
  if (!pathRequiresGettingStarted(dest)) return dest;

  setProgressUserId(person?.id || null);
  if (person?.id) {
    try {
      await startAccountSync(person.id);
    } catch {
      /* the device copy is used when the account can't be reached */
    }
  }

  let lessons = [];
  try {
    const rows = await base44.entities.Lesson.list("module_order", 200);
    lessons = Array.isArray(rows) ? rows : [];
  } catch {
    lessons = [];
  }

  const answers = person?.id ? readStore(progressStorageKey(ANSWER_KEY), {}) : {};
  const states = person?.id ? readStore(progressStorageKey(STATE_KEY), {}) : {};
  return postAuthDestination({ user: person, returnTo: dest, lessons, answers, states });
}
