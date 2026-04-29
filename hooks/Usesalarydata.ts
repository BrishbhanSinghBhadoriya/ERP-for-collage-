// hooks/useSalaryData.ts
// Path: (your Next.js frontend)/hooks/useSalaryData.ts

import { useState, useEffect, useCallback } from "react";
import { SalaryResponse, ApiResponse } from "@/types/Hrms";


// NEXT_PUBLIC_API_URL=http://localhost:5001
const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/+$/, '');
const API_URL = `${NEXT_PUBLIC_API_URL}/`;

interface UseSalaryDataReturn {
  data: SalaryResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSalaryData(
  employeeId: string | null,
  month: number,
  year: number,
  token: string | null  // aapka JWT token
): UseSalaryDataReturn {
  const [data,    setData]    = useState<SalaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = employeeId && employeeId.trim().length > 0
        ? `${API_URL}api/salary/${employeeId}?month=${month}&year=${year}`
        : `${API_URL}api/salary/my?month=${month}&year=${year}`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json: ApiResponse<SalaryResponse> = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.message || "Error in Data Fetching");
      }
    } catch (err) {
      setError("Network error — Did not connect  the  Backend");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [employeeId, month, year, token]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ── Mark KRA (Manager ke liye) ──────────────────────────────────────────────
export async function markKRA(
  payload: { employeeId: string; date: string; rating: number; comment?: string },
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}kra/mark`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return { success: json.success, message: json.message || "" };
  } catch {
    return { success: false, message: "Network error" };
  }
}

// ── Mark Attendance (Manager ke liye) ───────────────────────────────────────
export async function markAttendance(
  payload: {
    employeeId: string;
    date: string;
    loginTime?: string;
    manualStatus?: string;
    note?: string;
  },
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}api/attendance/mark`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return { success: json.success, message: json.message || "" };
  } catch {
    return { success: false, message: "Network error" };
  }
}
