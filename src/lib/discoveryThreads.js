import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { OWN_QUESTION_LABEL, TEXT_MAX, TITLE_MAX } from "@/lib/discoveryThreadData";

/**
 * My Discoveries: threads a participant chose to keep from Discovery on the dashboard.
 * Stored in the DiscoveryThread entity, one row per discovery, readable and writable only by the
 * account that created it. Nothing here is written unless a participant presses Save, and nothing
 * is copied into the Journal, Life Map, My Records or the workbook.
 */

const entity = () => base44.entities.DiscoveryThread;

export { OWN_QUESTION_LABEL, TEXT_MAX, TITLE_MAX };
export { discoveryExportLines, fallbackTitle, pathLabel, threadFromDiscovery } from "@/lib/discoveryThreadData";

export function listMyThreads() {
  return entity().list("-updated_date", 200);
}

export function createThread(data) {
  return entity().create(data);
}

export function updateThread(id, data) {
  return entity().update(id, data);
}

export function deleteThread(id) {
  return entity().delete(id);
}

/** Deletes every thread on this account. Reads again after each batch, so accounts over 200 rows are cleared too. */
export async function deleteAllThreads() {
  let total = 0;
  let previous = "";
  for (;;) {
    const rows = (await listMyThreads()) || [];
    if (!rows.length) return total;
    const batch = rows.map((row) => row.id).join(",");
    if (batch === previous) {
      throw new Error("Threads keep coming back after delete, so deletion stopped. Some entries may remain.");
    }
    previous = batch;
    for (const row of rows) {
      await deleteThread(row.id);
      total += 1;
    }
  }
}

/** Loads the signed-in participant's saved discoveries. */
export function useDiscoveryThreads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setThreads((await listMyThreads()) || []);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { threads, setThreads, loading, error, refresh };
}

