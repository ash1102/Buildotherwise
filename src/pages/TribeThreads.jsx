import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import useCurriculum from "@/hooks/useCurriculum";
import { groupBy, loadTribeReplies, loadTribeThreads, moduleTitle, subscribeTribeReplies } from "@/lib/library";
import ThreadCard from "@/components/tribe/ThreadCard";

export default function TribeThreads() {
  const [searchParams] = useSearchParams();
  const linkedLesson = searchParams.get("lesson");
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

  useEffect(() => {
    if (busy || !linkedLesson) return;
    const target = document.getElementById("lesson-thread");
    if (target) target.scrollIntoView({ block: "start" });
  }, [busy, linkedLesson]);

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-5">
        <p className="workbook-label">Peer conversation</p>
        <h1 className="mt-2">Tribe Threads</h1>
        <p className="mt-3 max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground">
          A thread is one peer practice from the curriculum, opened up for the group. Each one shows the practice, the
          prompt, and what others noticed. Answer in your own words, or just read. Taking part is optional, and a short
          reply counts as much as a long one.
        </p>
        <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-muted-faint">
          Everyone in your group can read replies, and they are posted with your name. Your Conversation Journal is
          separate and stays private. Nothing from it is posted here. A reply only exists if you write one on this page.
        </p>
        <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
          Before replying to someone, you may want to read{" "}
          <Link to="/lesson/O.3" className="font-medium text-accent-ink underline underline-offset-2">
            How we give feedback
          </Link>
          . It’s optional.
        </p>
      </header>

      {busy ? (
        <p className="py-8 text-[16px] text-muted-faint">Opening the threads…</p>
      ) : threads.length === 0 ? (
        <p className="rounded-xl border border-dashed border-input bg-card p-5 text-[16px] leading-relaxed text-muted-foreground">
          No threads yet. When the peer practices are published, each one appears here with its prompt and the group's
          replies.
        </p>
      ) : (
        <div className="space-y-10">
          {openOrders.map((order) => (
            <section key={order}>
              <h2 className="text-[20px]">{moduleTitle(modules, order)}</h2>
              <div className="mt-3 space-y-5">
                {openThreads
                  .filter((thread) => thread.module_order === order)
                  .map((thread) => (
                    <div key={thread.id} id={thread.lesson_code === linkedLesson ? "lesson-thread" : undefined} className="scroll-mt-28">
                      <ThreadCard
                        thread={thread}
                        moduleLabel={thread.lesson_code ? `${thread.lesson_code}, peer practice` : "Peer practice"}
                        replies={repliesByThread.get(thread.id) || []}
                        user={user}
                        onChanged={refreshReplies}
                      />
                    </div>
                  ))}
              </div>
            </section>
          ))}

          {laterThreads.length ? (
            <section>
              <h2 className="text-[20px]">Not open yet</h2>
              <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-muted-foreground">
                The part of the program that brings the group together is still being written. These threads will open
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