import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ReviewHeader from "@/components/review/ReviewHeader";
import ReviewPackageCard from "@/components/review/ReviewPackageCard";

export default function ContentReview() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return undefined;
    let active = true;
    Promise.all([
      base44.entities.LessonReviewPackage.list({ sort: "module_order", limit: 100 }),
      base44.entities.Module.list({ sort: "order", limit: 30 }),
    ])
      .then(([page, moduleList]) => {
        if (!active) return;
        setPackages(page.items || []);
        setModules(moduleList.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const grouped = useMemo(() => {
    const orders = [...new Set(packages.map((item) => item.module_order))].sort((a, b) => a - b);
    return orders.map((order) => ({ order, items: packages.filter((item) => item.module_order === order) }));
  }, [packages]);

  const titleFor = (order) => modules.find((module) => module.order === order)?.title || `Module ${order}`;

  const save = async (id, data) => {
    setSavingId(id);
    try {
      await base44.entities.LessonReviewPackage.update(id, data);
      setPackages((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
    } finally {
      setSavingId(null);
    }
  };

  if (!user) return <p className="py-10 text-[14px] text-ink-faint">Opening…</p>;

  if (!isAdmin) {
    return (
      <p className="rounded-lg border border-dashed border-natural-deep bg-white/70 p-6 text-[14px] leading-relaxed text-ink-soft">
        This page is for the program team. The packages hold unapproved drafts, so they are kept out of the participant
        workbook.
      </p>
    );
  }

  if (loading) return <p className="py-10 text-[14px] text-ink-faint">Gathering the review packages…</p>;

  return (
    <div className="space-y-10">
      <ReviewHeader
        packageCount={packages.length}
        undecidedCount={packages.filter((item) => !item.approval_decision).length}
      />
      {grouped.map((group) => (
        <section key={group.order} className="space-y-5">
          <h2 className="font-heading text-2xl">{titleFor(group.order)}</h2>
          {group.items.map((pkg) => (
            <ReviewPackageCard
              key={pkg.id}
              pkg={pkg}
              moduleTitle={titleFor(group.order)}
              onSave={save}
              saving={savingId === pkg.id}
            />
          ))}
        </section>
      ))}
    </div>
  );
}