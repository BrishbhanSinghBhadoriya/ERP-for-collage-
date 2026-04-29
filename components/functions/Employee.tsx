import { Employee, getEmployeeName } from "@/lib/types";
import Cookies from "js-cookie";
import api from "@/lib/api";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  department?: string;
  status?: string;
}

export interface PaginationResponse {
  success: boolean;
  data: Employee[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEmployees: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  message: string;
}
export const getEmployees = async (): Promise<getEmployeeName[]> => {
  const token = Cookies.get('token');
  const response = await api.get('/hr/getEmployees', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.employees;
}

export const fetchEmployees = async (params: PaginationParams = {}): Promise<PaginationResponse> => {
  const token = Cookies.get('token');
  const queryParams = new URLSearchParams();

  // Add pagination parameters
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.department) queryParams.append('department', params.department);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);

  const response = await api.get(`/users/getEmployeesbypagination?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log('Allemployeedata:', response.data);
  console.log('Query Params:', queryParams.toString());

  return response.data as PaginationResponse;
};

// Legacy function for backward compatibility
export const fetchAllEmployees = async (params: PaginationParams = {}): Promise<Employee[]> => {
  const response = await fetchEmployees({ ...params, page: 1, limit: params.limit ?? 1000 });
  return response.data;
};

export const deleteEmployee = async (userId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  const token = Cookies.get('token');
  const response = await api.delete(`/hr/deleteEmployee/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const importEmployees = async (file: File): Promise<any> => {
  const token = Cookies.get('token');
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/users/import-employees', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getEmployeeById = async (id: string): Promise<any | null> => {
  try {
    const response = await api.get(`/hr/getEmployee/${id}`);
    console.log('Employee data:', response.data);
    const employee = response.data.employee
    if (employee && (employee._id || employee.id)) {
      return employee;
    }
    return null;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};