export interface Employee {
  username: string,
  password: string,
  _id: string;
  employeeId: string;
  id: string;
  managerId?: string;
  managerName?: string;
  dateOfBirth?: string;
  reportingTo?: string;
  empCode: string;
  name: string;
  fatherName: string,
  bloodGroup: string,
  email: string;
  phone: string;
  role: string;
  department: string;
  joiningDate: Date,
  designation: string;
  status: 'active' | 'inactive' | 'terminated';
  joinedOn: string;
  profilePicture?: string;
  dob?: string;
  avatarUrl?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;

  };
  isActive: boolean;
  salary?: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  _id?: string;
  studentId: string;
  studentName: string;
  date: string;
  subject: string;
  lectureId?: string;
  status: 'present' | 'absent' | 'leave' | 'late';
  markedBy: string; // Professor/Asst Prof ID
  remarks?: string;
}

export interface EmployeeAttendanceRecord {
  id: string;
  _id?: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'late' | 'half-day';
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  remarks?: string;
}

export interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  courseId?: string;
  quantity: number;
  available: number;
  location?: string;
}

export interface LibraryRecord {
  id: string;
  _id?: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue';
  fine?: number;
}

export interface FeeRecord {
  id: string;
  _id?: string;
  studentId: string;
  studentName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'partially_paid';
  transactions: FeeTransaction[];
}

export interface FeeTransaction {
  id: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receiptNumber: string;
}

export interface Activity {
  id: string;
  _id?: string;
  name: string;
  description: string;
  date: string;
  type: 'sports' | 'cultural' | 'academic' | 'other';
  organizer: string;
}

export interface ActivityParticipation {
  id: string;
  _id?: string;
  activityId: string;
  activityName: string;
  studentId: string;
  studentName: string;
  role?: string; // participant, winner, runner-up, etc.
  remarks?: string;
}

export interface Course {
  id: string;
  _id?: string;
  code: string;
  name: string;
  department: string;
  duration: string;
  credits: number;
  semester: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  region: string;
  type: 'national' | 'regional' | 'optional';
  description?: string;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'casual' | 'sick' | 'earned' | 'fop' | 'lop' | 'short_leave';
  startDate: string;
  endDate: string;
  totalDays: number;
  days: number;
  reason: string;
  remarks?: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  appliedOn: string;
  approvedOn?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export type UserRole =
  | "admin"
  | "hr"
  | "hod"
  | "professor"
  | "assistant_professor"
  | "assistant professor"
  | "staff"
  | "student"
  | "manager"
  | "employee"
  | "faculty"
  | "registrar"
  | "bursar"
  | "warden";

export interface User {
  id: string;
  _id?: string;
  studentProfile?: string;
  facultyProfile?: string;

  // Authentication & Basic Info
  username: string;
  password?: string; // usually not exposed in frontend but exists in backend
  role: UserRole;

  // Status Flags
  isAdmin: boolean;
  isManager?: boolean;
  isHR?: boolean;
  isHOD?: boolean;
  isWarden?: boolean;
  isProfessor?: boolean;
  isAssistantProfessor?: boolean;
  isStaff?: boolean;
  isStudent?: boolean;
  isEmployee?: boolean;
  isFaculty?: boolean;
  isActive: boolean;

  // Personal Information
  name: string;
  fatherName?: string;
  bloodGroup?: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  permanentAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | string;
  dob?: string;
  gender?: "male" | "female" | "other";
  maritalStatus?: string;
  // Profile & Visuals
  profilePicture?: string;
  loginImage?: string;
  avatarUrl?: string;
  professionalEmailId?: string;
  emergencyContactNo: string;

  // Employment Information
  employeeId: string;
  joiningDate: string;
  experience?: {
    company: string;
    designation: string;
    startDate?: string | null;
    endDate?: string | null;
    description?: string;
  }[];

  education?: {
    degree: string;
    institution?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }[];

  // Bank Information
  bankDetails?: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountType: "savings" | "current";
    bankIFSC: string;
    bankAccountHolderName: string;
    bankMICR: string;
  }[];

  // Work Details
  department: string;
  designation: string;
  jobType?: "FULL TIME" | "INTERN" | "FREELANCE";
  workMode?: string;
  lastLogin?: string;

  reportingTo?: string;

  // Documents
  documents?: {
    adharImage?: string;
    adharNumber?: string;
    panImage?: string;
    panNumber?: string;
    experienceLetterImage?: string;
    MarksheetImage_10?: string;
    MarksheetImage_12?: string;
    MarksheetImage_Graduation?: string;
    MarksheetImage_PostGraduationImage?: string;
  };

  // Optional extra fields
  salary?: number;
  skills?: string[];

  kraLimits?: {
    calls: number;
    talktime: number;
    sales: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  employeeCount: number;
}

export interface Designation {
  id: string;
  title: string;
  department: string;
  level: number;
}
export interface LeaveBalance {
  employeeId: string;
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  earned: { total: number; used: number; remaining: number };
  short_leave: { total: number; used: number; remaining: number };
  lop: { total: number; used: number; remaining: number };
  fop: { total: number; used: number; remaining: number };
}
export interface getEmployeeName {
  _id: string;
  name: string;
}