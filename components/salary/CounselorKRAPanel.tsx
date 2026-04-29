
"use client";

import React, { useState, CSSProperties } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Props {
  token: string;
}

const CounselorKRAPanel: React.FC<Props> = ({ token }) => {
  const [calls, setCalls] = useState<number>(0);
  const [talktime, setTalktime] = useState<string>("00:00"); // HH:mm
  const [sales, setSales] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (calls < 0 || sales < 0) {
      toast.error("Please enter valid numbers");
      return;
    }

    setSubmitting(true);
    try {
      // Logic check (Frontend side just for info, backend will handle final attendance)
      const [hours, minutes] = talktime.split(":").map(Number);
      const totalMinutes = (hours || 0) * 60 + (minutes || 0);
      
      const isMet = calls >= 250 || totalMinutes >= 150 || sales >= 1;
      
      const response = await api.post("/kra/counselor/submit", {
        calls,
        talktime: totalMinutes,
        sales,
        date: new Date().toISOString().split("T")[0],
      });

      if (response.data.success) {
        toast.success(isMet ? "KRA Submitted! Goal Met." : "KRA Submitted. Note: Goals not met (Half Day might apply).");
        // Reset or show status
      } else {
        toast.error(response.data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while submitting KRA");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.wrap}>
      <h3 style={s.title}>📞 Counselor Daily KRA</h3>
      <p style={s.subtitle}>Submit your daily metrics for attendance verification</p>

      <div style={s.grid}>
        <div style={s.field}>
          <label style={s.label}>Total Calls</label>
          <input
            type="number"
            value={calls}
            onChange={(e) => setCalls(Number(e.target.value))}
            style={s.input}
            placeholder="e.g. 250"
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Talktime (HH:mm)</label>
          <input
            type="text"
            value={talktime}
            onChange={(e) => setTalktime(e.target.value)}
            style={s.input}
            placeholder="02:30"
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Total Sales</label>
          <input
            type="number"
            value={sales}
            onChange={(e) => setSales(Number(e.target.value))}
            style={s.input}
            placeholder="e.g. 1"
          />
        </div>
      </div>

      <div style={s.infoBox}>
        <strong>Goals:</strong> 250 Calls OR 02:30 Hr Talktime OR 1 Sale.
        <br />
        <span style={{ fontSize: 11, color: "#6b7280" }}>If goals are not met, Half Day will be marked.</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ ...s.btn, background: submitting ? "#9ca3af" : "#1e3a5f" }}
      >
        {submitting ? "Submitting..." : "Submit Daily Report"}
      </button>
    </div>
  );
};

const s: Record<string, CSSProperties> = {
  wrap: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)" },
  title: { fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6b7280", marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase" },
  input: { border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 14 },
  infoBox: { background: "#f3f4f6", padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 20, borderLeft: "4px solid #1e3a5f" },
  btn: { width: "100%", padding: "12px", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" },
};

export default CounselorKRAPanel;
