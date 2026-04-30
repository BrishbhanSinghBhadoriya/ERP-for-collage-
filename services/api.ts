import api from '@/lib/api';

// Auth APIs
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Dashboard APIs
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getTrends: () => api.get('/dashboard/trends'),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
  getRecentAdmissions: () => api.get('/dashboard/recent-admissions'),
  getStudentDashboard: (studentId: string) => api.get(`/dashboard/student/${studentId}`),
};

// Student APIs
export const studentApi = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

// Faculty APIs
export const facultyApi = {
  getAll: (params?: any) => api.get('/faculty', { params }),
  getById: (id: string) => api.get(`/faculty/${id}`),
  create: (data: any) => api.post('/faculty', data),
  update: (id: string, data: any) => api.put(`/faculty/${id}`, data),
  delete: (id: string) => api.delete(`/faculty/${id}`),
};

// Attendance APIs
export const attendanceApi = {
  // Student attendance (subject-wise, date-wise)
  getAttendance: (params?: any) => api.get('/attendance/student/class', { params }),
  markAttendance: (data: any) => api.post('/attendance/student', data),
  getStudentAttendance: (studentId: string) => api.get(`/attendance/student/student/${studentId}`),
  getReport: (studentId: string) => api.get(`/attendance/student/report/${studentId}`),
};

// Course APIs
export const courseApi = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  getDepartments: () => api.get('/courses/departments'),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

// Academic (Subjects/Faculty) APIs
export const academicsApi = {
  getSubjectsByCourse: (courseId: string) => api.get(`/subjects/course/${courseId}`),
  getAllSubjects: () => api.get('/subjects'),
  getCourseStats: () => api.get('/courses/stats'),
};

// Fee APIs
export const feeApi = {
  getFees: (params?: any) => api.get('/fees', { params }),
  getTransactions: () => api.get('/fees/transactions'),
  getStats: () => api.get('/fees/stats'),
  createFeeRecord: (data: any) => api.post('/fees', data),
  updateFee: (id: string, data: any) => api.put(`/fees/${id}`, data),
  deleteFee: (id: string) => api.delete(`/fees/${id}`),
  collectFee: (data: any) => api.post('/fees/collect', data),
  getStudentFees: (studentId: string) => api.get(`/fees/student/${studentId}`),
  getReport: (params?: any) => api.get('/fees/report', { params }),
};

// Library APIs
export const libraryApi = {
  getBooks: (params?: any) => api.get('/library/books', { params }),
  getStats: () => api.get('/library/stats'),
  addBook: (data: any) => api.post('/library/books', data),
  updateBook: (id: string, data: any) => api.put(`/library/books/${id}`, data),
  deleteBook: (id: string) => api.delete(`/library/books/${id}`),
  issueBook: (data: any) => api.post('/library/issue', data),
  returnBook: (data: any) => api.post('/library/return', data),
  getIssuedBooks: (params?: any) => api.get('/library/issued', { params }),
  getCourseWiseBooks: (courseId: string) => api.get(`/library/books/course/${courseId}`),
};

// Holiday APIs
export const holidayApi = {
  getAll: () => api.get('/holidays'),
  create: (data: any) => api.post('/holidays', data),
  update: (id: string, data: any) => api.put(`/holidays/${id}`, data),
  delete: (id: string) => api.delete(`/holidays/${id}`),
};

// Exam APIs
export const examApi = {
  getDateSheet: (params?: any) => api.get('/exams/date-sheet', { params }),
  getStats: () => api.get('/exams/stats'),
  getUpcoming: () => api.get('/exams/upcoming'),
  create: (data: any) => api.post('/exams', data),
  update: (id: string, data: any) => api.put(`/exams/${id}`, data),
  delete: (id: string) => api.delete(`/exams/${id}`),
};

// Announcement APIs
export const announcementApi = {
  getAll: (params?: any) => api.get('/announcements', { params }),
  getById: (id: string) => api.get(`/announcements/${id}`),
  create: (data: any) => api.post('/announcements', data),
  update: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

// Extra-curricular APIs
export const activityApi = {
  getAll: (params?: any) => api.get('/activities', { params }),
  getStats: () => api.get('/activities/stats'),
  getLeaderboard: () => api.get('/activities/leaderboard'),
  create: (data: any) => api.post('/activities', data),
  update: (id: string, data: any) => api.put(`/activities/${id}`, data),
  delete: (id: string) => api.delete(`/activities/${id}`),
  trackParticipation: (data: any) => api.post('/activities/participation', data),
  getStudentParticipation: (studentId: string) => api.get(`/activities/student/${studentId}`),
};
