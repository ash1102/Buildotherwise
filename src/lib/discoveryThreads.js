import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { OWN_QUESTION_LABEL, TEXT_MAX, TITLE_MAX } from "@/lib/discoveryThreadData";
import { deleteAllPaged } from "@/lib/deletionSteps";
import { withMigrationLock } from "@/lib/discoveryMigration";

/**
 * The original storage for discoveries saved from Discovery on the dashboard. New saves go to the
 * Discovery Record (DiscoveryRecord); these rows are read until they are moved, and never deleted by the move.
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
export function deleteAllThreads() {
  return withMigrationLock(() => deleteAllPaged(listMyThreads, deleteThread, "Discoveries"));
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

