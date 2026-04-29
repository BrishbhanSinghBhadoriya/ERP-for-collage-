
export const collegeMockData = {
  stats: {
    totalStudents: 1250,
    totalFaculty: 85,
    totalCourses: 12,
    activeClasses: 42,
    todayAttendance: 92, // percentage
    pendingFees: "₹4.5L",
    libraryBooks: 5000,
    newAdmissions: 25
  },
  recentAdmissions: [
    { id: '1', name: 'Rahul Sharma', course: 'B.Tech CSE', date: '2024-04-20', status: 'Confirmed' },
    { id: '2', name: 'Priya Patel', course: 'BBA', date: '2024-04-21', status: 'Pending' },
    { id: '3', name: 'Amit Kumar', course: 'B.Com', date: '2024-04-22', status: 'Confirmed' },
    { id: '4', name: 'Sana Khan', course: 'MBA', date: '2024-04-23', status: 'Confirmed' },
  ],
  upcomingExams: [
    { id: '1', subject: 'Mathematics III', date: '2024-05-10', time: '10:00 AM' },
    { id: '2', subject: 'Data Structures', date: '2024-05-12', time: '02:00 PM' },
    { id: '3', subject: 'Operating Systems', date: '2024-05-15', time: '10:00 AM' },
  ],
  feeCollection: [
    { month: 'Jan', amount: 450000 },
    { month: 'Feb', amount: 520000 },
    { month: 'Mar', amount: 480000 },
    { month: 'Apr', amount: 610000 },
  ],
  attendanceTrends: [
    { day: 'Mon', attendance: 92 },
    { day: 'Tue', attendance: 88 },
    { day: 'Wed', attendance: 95 },
    { day: 'Thu', attendance: 91 },
    { day: 'Fri', attendance: 85 },
  ],
  admissionTrends: [
    { year: '2020', students: 850 },
    { year: '2021', students: 920 },
    { year: '2022', students: 1050 },
    { year: '2023', students: 1180 },
    { year: '2024', students: 1250 },
  ],
  examDateSheet: [
    { id: '1', subject: 'Mathematics III', code: 'MTH301', date: '2024-05-10', time: '10:00 AM - 01:00 PM', room: 'LH-101', type: 'Final' },
    { id: '2', subject: 'Data Structures', code: 'CSE201', date: '2024-05-12', time: '02:00 PM - 05:00 PM', room: 'Lab-2', type: 'Final' },
    { id: '3', subject: 'Operating Systems', code: 'CSE302', date: '2024-05-15', time: '10:00 AM - 01:00 PM', room: 'LH-203', type: 'Final' },
    { id: '4', subject: 'Database Management', code: 'CSE204', date: '2024-05-18', time: '10:00 AM - 01:00 PM', room: 'Lab-1', type: 'Final' },
    { id: '5', subject: 'Software Engineering', code: 'CSE401', date: '2024-05-20', time: '02:00 PM - 05:00 PM', room: 'LH-105', type: 'Final' },
  ]
};
