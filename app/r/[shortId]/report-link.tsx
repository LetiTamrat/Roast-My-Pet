"use client";

import { toast } from "sonner";

export function ReportLink({ shortId }: { shortId: string }) {
  const onReport = () => {
    const reason = prompt("Why are you reporting this roast?");
    if (!reason) return;
    fetch(`/api/roast/${shortId}/flag`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    })
      .then((r) => {
        if (r.ok) toast.success("Thanks — we'll review it.");
        else toast.error("Could not submit your report.");
      })
      .catch(() => toast.error("Could not submit your report."));
  };
  return (
    <button onClick={onReport} className="underline hover:text-destructive">
      Report this roast
    </button>
  );
}
