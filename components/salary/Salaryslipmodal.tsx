// components/salary/SalarySlipModal.tsx
// Path: (your Next.js frontend)/components/salary/SalarySlipModal.tsx

"use client";

import React, { CSSProperties } from "react";
import { SalaryResponse, SalaryBreakdown, KRASummary } from "@/types/Hrms";

const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

interface Props {
  data:    SalaryResponse;
  month:   number;
  year:    number;
  onClose: () => void;
}

const SalarySlipModal: React.FC<Props> = ({ data, month, year, onClose }) => {
  const { employee, salary, kra } = data;

  const downloadPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(buildPrintHTML({ employee, salary, kra, month, year }));
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            Salary Slip — {MONTHS[month]} {year}
          </h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Company Badge */}
          <div style={s.slipTop}>
            <div>
              <div style={s.coName}>HRMS Portal</div>
              <div style={{ fontSize: 12, opacity: .75, marginTop: 4 }}>
                Salary Slip — {MONTHS[month]} {year}
              </div>
            </div>
            <div style={s.monthBadge}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{MONTHS[month].slice(0, 3)}</div>
              <div style={{ fontSize: 12, opacity: .8 }}>{year}</div>
            </div>
          </div>

          {/* Employee Row */}
          <div style={s.empBox}>
            <div style={s.avatar}>{employee.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{employee.name}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                {employee.designation} &nbsp;|&nbsp; {employee.department}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                EMP ID: {employee.employeeId}&nbsp;&nbsp;
                KRA: <strong>{kra?.category ?? "N/A"}</strong>
              </div>
            </div>
          </div>

          {/* Attendance Grid */}
          <div style={s.attGrid}>
            {([
              ["Working", salary.totalWorkingDays],
              ["Present", salary.presentDays],
              ["Half Day", salary.halfDays],
              ["Absent", salary.absentDays],
              ["Late", salary.lateDays],
              ["Effective", salary.effectiveDays],
            ] as [string, number][]).map(([l, v]) => (
              <div key={l} style={s.attItem}>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{l}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#1e3a5f" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
            <thead>
              <tr style={{ background: "#1e3a5f", color: "#fff" }}>
                {["Earnings", "Amount", "Deductions", "Amount"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TR e1="Basic Salary"  v1={salary.basicSalary}   e2="PF (12%)"   v2={salary.pf} />
              <TR e1="Earned Salary" v1={salary.earnedSalary}  e2="TDS (10%)"  v2={salary.tds} />
              <TR
                e1={kra ? `KRA ${salary.kraAmount >= 0 ? "Bonus" : "Penalty"}` : "—"}
                v1={kra ? salary.kraAmount : null}
                e2={salary.esic > 0 ? "ESIC (0.75%)" : "—"}
                v2={salary.esic || null}
              />
              {salary.lateDeduction > 0 && (
                <TR e1="Late Deduction" v1={-salary.lateDeduction} e2="" v2={null} />
              )}
            </tbody>
          </table>

          {/* Net */}
          <div style={s.netBox}>
            <div>
              <div style={{ fontSize: 12, opacity: .8 }}>Total Deductions</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>₹{(salary.totalDeductions ?? 0).toLocaleString("en-IN")}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, opacity: .8 }}>Net Salary (Take Home)</div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>₹{(salary.netSalary ?? 0).toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>

        {/* Download */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f3f4f6" }}>
          <button style={s.dlBtn} onClick={downloadPDF}>⬇️ &nbsp;Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default SalarySlipModal;

// ── Inner Table Row ───────────────────────────────────────────────────────────
const TR: React.FC<{ e1: string; v1: number | null; e2: string; v2: number | null }> = ({ e1, v1, e2, v2 }) => (
  <tr>
    <td style={s.td}>{e1}</td>
    <td style={{ ...s.td, color: (v1 ?? 0) < 0 ? "#ef4444" : "#15803d", fontWeight: 600 }}>
      {v1 != null && v1 !== 0 ? `₹${(Math.abs(v1 ?? 0)).toLocaleString("en-IN")}` : "—"}
    </td>
    <td style={s.td}>{e2}</td>
    <td style={{ ...s.td, color: "#ef4444", fontWeight: 600 }}>
      {v2 ? `₹${(v2 ?? 0).toLocaleString("en-IN")}` : "—"}
    </td>
  </tr>
);

// ── Print HTML ────────────────────────────────────────────────────────────────
function buildPrintHTML({ employee, salary, kra, month, year }: {
  employee: SalaryResponse["employee"];
  salary:   SalaryBreakdown;
  kra:      KRASummary | null;
  month:    number;
  year:     number;
}): string {
  const mn = MONTHS[month];
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Salary Slip ${mn} ${year}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:#f5f7fa}
  .page{max-width:700px;margin:30px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)}
  .hdr{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:28px 32px;display:flex;justify-content:space-between;align-items:center}
  .co{font-size:22px;font-weight:800;letter-spacing:1px}.sub{font-size:13px;opacity:.75;margin-top:4px}
  .badge{background:rgba(255,255,255,.15);border-radius:10px;padding:10px 16px;text-align:center}
  .body{padding:28px 32px}
  .emp{display:flex;gap:16px;background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:20px}
  .av{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#1e3a5f);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0}
  .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:20px}
  .gi{background:#f8fafc;border-radius:8px;padding:10px;text-align:center}
  .gl{font-size:10px;color:#9ca3af;text-transform:uppercase}.gv{font-size:18px;font-weight:800;color:#1e3a5f;margin-top:4px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#1e3a5f;color:#fff;padding:10px 14px;text-align:left;font-size:12px;text-transform:uppercase}
  td{padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:13px}
  .net{background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;border-radius:10px;padding:18px 24px;display:flex;justify-content:space-between;align-items:center}
  .footer{text-align:center;padding:14px;font-size:11px;color:#9ca3af;border-top:1px solid #f1f5f9}
  @media print{body{background:#fff}.page{box-shadow:none;margin:0;border-radius:0}}
</style></head><body><div class="page">
  <div class="hdr">
    <div><div class="co">HRMS Portal</div><div class="sub">Salary Slip — ${mn} ${year}</div></div>
    <div class="badge"><div style="font-size:18px;font-weight:800">${mn.slice(0,3)}</div><div style="font-size:12px;opacity:.8">${year}</div></div>
  </div>
  <div class="body">
    <div class="emp">
      <div class="av">${employee.name.slice(0,2).toUpperCase()}</div>
      <div>
        <div style="font-weight:700;font-size:16px">${employee.name}</div>
        <div style="font-size:13px;color:#6b7280;margin-top:3px">${employee.designation} | ${employee.department}</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:2px">EMP ID: ${employee.employeeId} &nbsp;|&nbsp; KRA: <strong>${kra?.category ?? "N/A"}</strong>${kra ? ` (${kra.average}/5 • ${kra.bonus > 0 ? "+" : ""}${kra.bonus}%)` : ""}</div>
      </div>
    </div>
    <div class="grid">
      <div class="gi"><div class="gl">Working</div><div class="gv">${salary.totalWorkingDays}</div></div>
      <div class="gi"><div class="gl">Present</div><div class="gv">${salary.presentDays}</div></div>
      <div class="gi"><div class="gl">Half Day</div><div class="gv">${salary.halfDays}</div></div>
      <div class="gi"><div class="gl">Absent</div><div class="gv">${salary.absentDays}</div></div>
      <div class="gi"><div class="gl">Late</div><div class="gv">${salary.lateDays}</div></div>
      <div class="gi"><div class="gl">Effective</div><div class="gv">${salary.effectiveDays}</div></div>
    </div>
    <table>
      <thead><tr><th>Earnings</th><th>Amount</th><th>Deductions</th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Basic Salary</td><td style="color:#15803d;font-weight:600">₹${(salary.basicSalary ?? 0).toLocaleString("en-IN")}</td><td>PF (12%)</td><td style="color:#ef4444">₹${(salary.pf ?? 0).toLocaleString("en-IN")}</td></tr>
        <tr><td>Earned Salary</td><td style="color:#15803d;font-weight:600">₹${(salary.earnedSalary ?? 0).toLocaleString("en-IN")}</td><td>TDS (10%)</td><td style="color:#ef4444">₹${(salary.tds ?? 0).toLocaleString("en-IN")}</td></tr>
        ${salary.kraAmount ? `<tr><td>KRA ${salary.kraAmount >= 0 ? "Bonus" : "Penalty"}</td><td style="color:${salary.kraAmount >= 0 ? "#15803d" : "#ef4444"};font-weight:600">${salary.kraAmount >= 0 ? "+" : ""}₹${(Math.abs(salary.kraAmount ?? 0)).toLocaleString("en-IN")}</td><td>—</td><td>—</td></tr>` : ""}
        ${salary.lateDeduction ? `<tr><td>Late Deduction</td><td style="color:#ef4444">-₹${(salary.lateDeduction ?? 0).toLocaleString("en-IN")}</td><td>—</td><td>—</td></tr>` : ""}
      </tbody>
    </table>
    <div class="net">
      <div><div style="font-size:13px;opacity:.8">Gross Salary</div><div style="font-size:17px;font-weight:700">₹${(salary.grossSalary ?? 0).toLocaleString("en-IN")}</div></div>
      <div style="text-align:right"><div style="font-size:13px;opacity:.8">Net Salary (Take Home)</div><div style="font-size:26px;font-weight:900">₹${(salary.netSalary ?? 0).toLocaleString("en-IN")}</div></div>
    </div>
  </div>
  <div class="footer">Generated on ${new Date().toLocaleDateString("en-IN")} — Computer generated salary slip</div>
</div></body></html>`;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal:      { background: "#fff", borderRadius: 14, maxWidth: 660, width: "100%", maxHeight: "92vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.25)" },
  modalHeader:{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6" },
  closeBtn:   { border: "none", background: "#f3f4f6", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 14, color: "#6b7280" },
  slipTop:    { background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff", borderRadius: 10, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  coName:     { fontSize: 19, fontWeight: 800, letterSpacing: 1 },
  monthBadge: { background: "rgba(255,255,255,.15)", borderRadius: 8, padding: "8px 14px", textAlign: "center" },
  empBox:     { display: "flex", gap: 14, background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 16 },
  avatar:     { width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1e3a5f)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 },
  attGrid:    { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 16 },
  attItem:    { background: "#f8fafc", borderRadius: 8, padding: "10px 6px", textAlign: "center" },
  th:         { padding: "10px 12px", textAlign: "left", fontSize: 11, textTransform: "uppercase" },
  td:         { padding: "9px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13 },
  netBox:     { background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff", borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  dlBtn:      { width: "100%", padding: 13, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
};