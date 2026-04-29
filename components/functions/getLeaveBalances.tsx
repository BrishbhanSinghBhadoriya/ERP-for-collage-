import api from "@/lib/api";
import Cookies from "js-cookie";
import { toast } from "sonner";

type BalanceWindow = {
  start: string;
  end: string;
};

type BalanceBucket = {
  casual: number;
  sick: number;
  earned: number;
};

export type UserBalance = {
  user: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
  window: BalanceWindow;
  accrual: BalanceBucket;
  used: BalanceBucket;
  remaining: BalanceBucket;
};

export const getAllLeaveBalances = async (): Promise<UserBalance[]> => {
  try {
    const token = Cookies.get("token");
    const res = await api.get("/leaves/balance", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = res?.data;
    if (Array.isArray(data)) return data as UserBalance[];
    // some backends may wrap in {balances: []}
    if (Array.isArray(data?.balances)) return data.balances as UserBalance[];
    return [];
  } catch (error) {
    toast.error("Failed to fetch leave balances");
    return [];
  }
};

export const getMyLeaveBalance = async (): Promise<UserBalance | null> => {
  try {
    const token = Cookies.get("token");
    const res = await api.get("/leaves/balance/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = res?.data;
    // support both plain object and wrapped payloads
    if (data?.user && data?.remaining) return data as UserBalance;
    if (data?.balance) return data.balance as UserBalance;
    return null;
  } catch (error) {
    toast.error("Failed to fetch your leave balance");
    return null;
  }
};


