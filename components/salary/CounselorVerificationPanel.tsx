
"use client";

import React, { useState, useEffect, CSSProperties } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Submissions {
  _id: string;
  employeeName: string;
  calls: number;
  talktime: number; // minutes
  sales: number;
  date: string;
  status: "pending" | "verified" | "rejected";
}

const CounselorVerificationPanel: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submissions[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/kra/counselor/pending");
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleVerify = async (id: string, action: "verify" | "reject") => {
    try {
      const res = await api.post(`/kra/counselor/${action}`, { id });
      if (res.data.success) {
        toast.success(`Submission ${action === "verify" ? "Verified" : "Rejected"}`);
        fetchSubmissions();
      } else {
        toast.error(res.data.message || "Action failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while verifying");
    }
  };

  const formatTalktime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div style={s.wrap}>
      <h3 style={s.title}>✅ Verify Counselor Daily Reports</h3>
      <p style={s.subtitle}>Review metrics and verify for attendance marking</p>

      {loading ? (
        <div style={s.loading}>Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div style={s.empty}>No pending submissions for today.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Counselor</TableHead>
              <TableHead>Calls</TableHead>
              <TableHead>Talktime</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Goal Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => {
              const isMet = sub.calls >= 250 || sub.talktime >= 150 || sub.sales >= 1;
              return (
                <TableRow key={sub._id}>
                  <TableCell>{sub.employeeName}</TableCell>
                  <TableCell>{sub.calls}</TableCell>
                  <TableCell>{formatTalktime(sub.talktime)}</TableCell>
                  <TableCell>{sub.sales}</TableCell>
                  <TableCell>
                    <Badge variant={isMet ? "default" : "destructive"}>
                      {isMet ? "Met" : "Not Met (Half Day)"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button size="sm" onClick={() => handleVerify(sub._id, "verify")}>Verify</Button>
                      <Button size="sm" variant="outline" onClick={() => handleVerify(sub._id, "reject")}>Reject</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

const s: Record<string, CSSProperties> = {
  wrap: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)" },
  title: { fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6b7280", marginBottom: 20 },
  loading: { textAlign: "center", padding: 40, color: "#9ca3af" },
  empty: { textAlign: "center", padding: 40, color: "#9ca3af", background: "#f9fafb", borderRadius: 8 },
};

export default CounselorVerificationPanel;
