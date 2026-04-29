import Cookies from "js-cookie";
import api from "@/lib/api";
import { PaginationParams } from "./Employee";
import { AttendanceRecord } from "@/lib/types";

export interface AttendancePaginationResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  message?: string;
}

export const fetchEmployeesAttenedence = async (params: PaginationParams = {}): Promise<AttendancePaginationResponse | AttendanceRecord[]> => {
    const token = Cookies.get('token');
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get(`/hr/getAttendance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Check if response has pagination structure
    if (response.data?.pagination || response.data?.data) {
      return response.data as AttendancePaginationResponse;
    }
    
    // Fallback for legacy response structure
    return {
      success: true,
      data: response.data.attendance || response.data || [],
    } as AttendancePaginationResponse;
  };