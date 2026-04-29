import { Employee, AttendanceRecord, Holiday, LeaveRequest, User, Department, Designation, LeaveBalance } from './types';

export const mockUsers: Partial<User>[] = [
  {
    id: '1',
    username: 'john.doe',
    email: 'john.doe@company.com',
    role: 'employee',
    employeeId: '1',
    name: 'John Doe',
    avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    username: 'sarah.manager',
    email: 'sarah.manager@company.com',
    role: 'manager',
    employeeId: '2',
    name: 'Sarah Johnson',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    username: 'mike.hr',
    email: 'mike.hr@company.com',
    role: 'hr',
    employeeId: '3',
    name: 'Mike Wilson',
    avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    username: 'admin',
    email: 'admin@company.com',
    role: 'admin',
    employeeId: '4',
    name: 'Alice Admin',
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'mock-hr-saurabh',
    username: 'hrsaurabh@gmail.com',
    email: 'hrsaurabh@gmail.com',
    role: 'hr',
    employeeId: 'HR001',
    name: 'Saurabh HR',
    avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const mockEmployees: Partial<Employee>[] = [
  {
    id: 'mock-hr-saurabh',
    empCode: 'HR001',
    name: 'Saurabh HR',
    email: 'hrsaurabh@gmail.com',
    phone: '9876543210',
    department: 'Human Resources',
    designation: 'HR Manager',
    status: 'active',
    joinedOn: '2024-01-01',
    avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
    dateOfBirth: '1995-01-01',
    address: 'Noida, India',
    salary: 50000
  },
  {
    id: '1',
    empCode: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1-555-0123',
    department: 'Engineering',
    designation: 'Senior Developer',
    managerId: '2',
    managerName: 'Sarah Johnson',
    status: 'active',
    joinedOn: '2023-01-15',
    avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    dateOfBirth: '1990-05-20',
    address: '123 Main St, Springfield, IL',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1-555-0124',
      relationship: 'Spouse'
    },
    salary: 75000
  },
  {
    id: '2',
    empCode: 'EMP002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0125',
    department: 'Engineering',
    designation: 'Engineering Manager',
    status: 'active',
    joinedOn: '2022-03-10',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    dateOfBirth: '1985-12-15',
    address: '456 Oak Ave, Springfield, IL',
    emergencyContact: {
      name: 'Robert Johnson',
      phone: '+1-555-0126',
      relationship: 'Brother'
    },
    salary: 95000
  },
  {
    id: '3',
    empCode: 'EMP003',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    phone: '+1-555-0127',
    department: 'Human Resources',
    designation: 'HR Manager',
    status: 'active',
    joinedOn: '2021-07-20',
    avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
    dateOfBirth: '1988-08-10',
    address: '789 Pine St, Springfield, IL',
    emergencyContact: {
      name: 'Lisa Wilson',
      phone: '+1-555-0128',
      relationship: 'Wife'
    },
    salary: 80000
  },
  {
    id: '4',
    empCode: 'EMP004',
    name: 'Alice Admin',
    email: 'alice.admin@company.com',
    phone: '+1-555-0129',
    department: 'Administration',
    designation: 'System Administrator',
    status: 'active',
    joinedOn: '2020-11-05',
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    dateOfBirth: '1987-03-25',
    address: '321 Elm St, Springfield, IL',
    emergencyContact: {
      name: 'David Admin',
      phone: '+1-555-0130',
      relationship: 'Husband'
    },
    salary: 70000
  },
  {
    id: '5',
    empCode: 'EMP005',
    name: 'Emily Chen',
    email: 'emily.chen@company.com',
    phone: '+1-555-0131',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    managerId: '3',
    managerName: 'Mike Wilson',
    status: 'active',
    joinedOn: '2023-06-01',
    avatarUrl: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
    dateOfBirth: '1992-11-08',
    address: '654 Maple Dr, Springfield, IL',
    emergencyContact: {
      name: 'Tom Chen',
      phone: '+1-555-0132',
      relationship: 'Father'
    },
    salary: 55000
  }
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'IT', code: 'IT', managerId: '2', employeeCount: 15 },
  { id: '2', name: 'HR', code: 'HR', managerId: '3', employeeCount: 3 },
  { id: '3', name: 'Marketing', code: 'MKT', managerId: '3', employeeCount: 5 },

  { id: '5', name: 'Sales', code: 'SALES', employeeCount: 4 },
  { id: '6', name: 'Other', code: 'OTHER', managerId: '4', employeeCount: 2 }
];

export const mockDesignations: Designation[] = [
  { id: '1', title: 'Junior Developer', department: 'Engineering', level: 1 },
  { id: '2', title: 'Senior Developer', department: 'Engineering', level: 2 },
  { id: '3', title: 'Engineering Manager', department: 'Engineering', level: 3 },
  { id: '4', title: 'HR Specialist', department: 'Human Resources', level: 1 },
  { id: '5', title: 'HR Manager', department: 'Human Resources', level: 2 },
  { id: '6', title: 'Marketing Specialist', department: 'Marketing', level: 1 },
  { id: '7', title: 'Marketing Manager', department: 'Marketing', level: 2 }
];

export const mockHolidays: Holiday[] = [
  {
    id: '1',
    name: 'New Year\'s Day',
    date: '2024-01-01',
    region: 'National',
    type: 'national',
    description: 'Public holiday for New Year'
  },
  {
    id: '2',
    name: 'Independence Day',
    date: '2024-07-04',
    region: 'National',
    type: 'national',
    description: 'Independence Day celebration'
  },
  {
    id: '3',
    name: 'Labor Day',
    date: '2024-09-02',
    region: 'National',
    type: 'national',
    description: 'Labor Day holiday'
  },
  {
    id: '4',
    name: 'Christmas Day',
    date: '2024-12-25',
    region: 'National',
    type: 'national',
    description: 'Christmas celebration'
  },
  {
    id: '5',
    name: 'Regional Festival',
    date: '2024-03-15',
    region: 'West',
    type: 'optional',
    description: 'Optional regional festival'
  }
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    date: '2024-01-15',
    checkIn: '09:00',
    checkOut: '18:00',
    hoursWorked: 8,
    status: 'present'
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'John Doe',
    date: '2024-01-16',
    checkIn: '09:15',
    checkOut: '17:45',
    hoursWorked: 7.5,
    status: 'present'
  },
  {
    id: '3',
    employeeId: '1',
    employeeName: 'John Doe',
    date: '2024-01-17',
    status: 'leave'
  },
  {
    id: '4',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    date: '2024-01-15',
    checkIn: '08:45',
    checkOut: '18:15',
    hoursWorked: 8.5,
    status: 'present'
  }
];


export const mockLeaveBalances: LeaveBalance[] = [
  {
    employeeId: '1',
    casual: { total: 12, used: 2, remaining: 10 },
    sick: { total: 7, used: 0, remaining: 7 },
    earned: { total: 18, used: 5, remaining: 13 },
    short_leave: { total: 4, used: 1, remaining: 3 },
    lop: { total: 0, used: 0, remaining: 0 },
    fop: { total: 0, used: 0, remaining: 0 }
  },
  {
    employeeId: '2',
    casual: { total: 15, used: 3, remaining: 12 },
    sick: { total: 10, used: 1, remaining: 9 },
    earned: { total: 21, used: 8, remaining: 13 },
    short_leave: { total: 4, used: 0, remaining: 4 },
    lop: { total: 0, used: 0, remaining: 0 },
    fop: { total: 12, used: 2, remaining: 10 }
  },
  {
    employeeId: '5',
    casual: { total: 12, used: 1, remaining: 11 },
    sick: { total: 7, used: 3, remaining: 4 },
    earned: { total: 15, used: 2, remaining: 13 },
    short_leave: { total: 4, used: 2, remaining: 2 },
    lop: { total: 0, used: 0, remaining: 0 },
    fop: { total: 0, used: 0, remaining: 0 }
  }
];

// Helper functions


export const getEmployeesByDepartment = (department: string): Partial<Employee>[] => {
  return mockEmployees.filter(emp => emp.department === department);
};

export const getAttendanceByEmployee = (employeeId: string, month?: string): AttendanceRecord[] => {
  return mockAttendance.filter(record => {
    if (record.employeeId !== employeeId) return false;
    if (month) {
      const recordMonth = record.date.substring(0, 7);
      return recordMonth === month;
    }
    return true;
  });
};



export const getLeaveBalance = (employeeId: string): LeaveBalance | undefined => {
  return mockLeaveBalances.find(balance => balance.employeeId === employeeId);
};

