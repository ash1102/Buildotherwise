import React, { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import useCurriculum from "@/hooks/useCurriculum";
import { groupBy, loadTribeReplies, loadTribeThreads, moduleTitle, subscribeTribeReplies } from "@/lib/library";
import ThreadCard from "@/components/tribe/ThreadCard";
import DashedMotif from "@/components/workbook/DashedMotif";

export default function TribeThreads() {
  const { modules, loading: curriculumLoading } = useCurriculum();
  const [threads, setThreads] = useState([]);
  const [replies, setReplies] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshReplies = useCallback(() => {
    loadTribeReplies().then(setReplies);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([loadTribeThreads(), loadTribeReplies()])
      .then(([threadRows, replyRows]) => {
        if (!active) return;
        setThreads(threadRows);
        setReplies(replyRows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const unsubscribe = subscribeTribeReplies(() => {
      if (active) refreshReplies();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [refreshReplies]);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (!authed) {
        setUser(null);
        return;
      }
      base44.auth
        .me()
        .then(setUser)
        .catch(() => setUser(null));
    });
  }, []);

  const repliesByThread = useMemo(() => groupBy(replies, "thread_id"), [replies]);
  const openThreads = threads.filter((thread) => thread.status !== "coming_later");
  const laterThreads = threads.filter((thread) => thread.status === "coming_later");
  const openOrders = [...new Set(openThreads.map((thread) => thread.module_order))].sort((a, b) => a - b);
  const busy = loading || curriculumLoading;

  return (
    <div className="space-y-12">
      <header className="border-b border-natural pb-7">
        <div className="flex items-start gap-4">
          <DashedMotif size="lg" />
          <div>
            <p className="workbook-label">Tribe Threads</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">The cohort's own conversation</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              A thread is one peer practice from the curriculum, opened up for the group. Answer in your own words, or
              read what others noticed — taking part is always optional, and passing counts as a full answer.
            </p>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-faint">
              Replies are posted with your name and are visible to everyone using this workbook. Your Conversation
              Journal is separate and stays private: nothing from it is ever posted here, and a reply only exists if you
              write one here yourself.
            </p>
          </div>
        </div>
      </header>

      {busy ? (
        <p className="py-8 text-[14px] text-ink-faint">Opening the threads…</p>
      ) : threads.length === 0 ? (
        <p className="rounded-lg border border-dashed border-natural-deep bg-white/60 p-6 text-[14px] leading-relaxed text-ink-soft">
          No threads yet. When the peer practices are published, each one appears here with its prompt and the cohort's
          replies.
        </p>
      ) : (
        <div className="space-y-10">
          {openOrders.map((order) => (
            <section key={order}>
              <h2 className="font-heading text-xl">{moduleTitle(modules, order)}</h2>
              <div className="mt-3 space-y-5">
                {openThreads
                  .filter((thread) => thread.module_order === order)
                  .map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      moduleLabel={thread.lesson_code ? `${thread.lesson_code} — peer practice` : "Peer practice"}
                      replies={repliesByThread.get(thread.id) || []}
                      user={user}
                      onChanged={refreshReplies}
                    />
                  ))}
              </div>
            </section>
          ))}

          {laterThreads.length ? (
            <section>
              <h2 className="font-heading text-xl">Not open yet</h2>
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
                The part of the program that brings the cohort together is still being written. These threads will open
                when those steps are published.
              </p>
              <div className="mt-3 space-y-5">
                {laterThreads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    moduleLabel={moduleTitle(modules, thread.module_order)}
                    replies={repliesByThread.get(thread.id) || []}
                    user={user}
                    onChanged={refreshReplies}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}