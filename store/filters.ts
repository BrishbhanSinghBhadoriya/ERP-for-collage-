import { create } from 'zustand';

interface FiltersState {
  employeeFilters: {
    employee: string;
    search: string;
    department: string;
    status: string;
  };
  attendanceFilters: {
    employee: string;
    month: string;
    status: string;
  };
  leaveFilters: {
    status: string;
    type: string;
    employee: string;
    search: string;
  };
  setEmployeeFilters: (filters: Partial<FiltersState['employeeFilters']>) => void;
  setAttendanceFilters: (filters: Partial<FiltersState['attendanceFilters']>) => void;
  setLeaveFilters: (filters: Partial<FiltersState['leaveFilters']>) => void;
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  employeeFilters: {
    employee: '',
    search: '',
    department: '',
    status: '',
  },
  attendanceFilters: {
    employee: '',
    month: '',
    status: '',
  },
  leaveFilters: {
    status: '',
    type: '',
    employee: '',
    search: '',
  },
  setEmployeeFilters: (filters) =>
    set((state) => ({
      employeeFilters: { ...state.employeeFilters, ...filters },
    })),
  setAttendanceFilters: (filters) =>
    set((state) => ({
      attendanceFilters: { ...state.attendanceFilters, ...filters },
    })),
  setLeaveFilters: (filters) =>
    set((state) => ({
      leaveFilters: { ...state.leaveFilters, ...filters },
    })),
  resetFilters: () =>
    set({
      employeeFilters: { employee: '', search: '', department: '', status: '' },
      attendanceFilters: { employee: '', month: '', status: '' },
      leaveFilters: { status: '', type: '', employee: '', search: '' },
    }),
}));