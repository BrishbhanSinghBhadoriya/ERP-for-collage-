// types/hrms.ts
// Path: (your Next.js frontend)/types/hrms.ts

export type AttendanceStatus =
  | "present" | "absent" | "half-day" | "late" | "holiday" | "weekend";

export type KRARatingCategory = "Excellent" | "Good" | "Average" | "Poor";

export interface IAttendance {
  _id: string;
  employeeId: string;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  status: AttendanceStatus;
  lateMinutes: number;
  markedBy: "system" | "manager" | "self";
  note: string;
}

export interface IKRA {
  _id: string;
  employeeId: string;
  managerId: string | { _id: string; name: string };
  month: number;
  year: number;
  dailyRatings: { date: string; rating: number; comment: string }[];
  monthlyAverage: number;
  ratingCategory: KRARatingCategory;
  bonusPercentage: number;
}

export interface SalaryBreakdown {
  basicSalary: number;
  earnedSalary: number;
  lateDeduction: number;
  kraAmount: number;
  grossSalary: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  lateDays: number;
  totalWorkingDays: number;
  effectiveDays: number;
  perDaySalary: number;
  pf: number;
  esic: number;
  tds: number;
  totalDeductions: number;
  netSalary: number;
}

export interface KRASummary {
  average: number;
  category: KRARatingCategory;
  bonus: number;
}

export interface SalaryResponse {
  employee: {
    _id: string;
    name: string;
    designation: string;
    department: string;
    employeeId: string;
    email: string;
  };
  month: number;
  year: number;
  kra: KRASummary | null;
  salary: SalaryBreakdown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}