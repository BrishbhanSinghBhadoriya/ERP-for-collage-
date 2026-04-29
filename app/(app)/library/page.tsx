"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  Library, 
  Plus, 
  Search, 
  BookOpen, 
  UserCheck, 
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { libraryApi, courseApi } from '@/services/api';
import { useFetch } from '@/hooks/use-fetch';
import dayjs from 'dayjs';
import { cn, extractList, extractData } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/auth/role-guard';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { studentApi } from '@/services/api';

export default function LibraryPage() {
  const { user } = useAuth();
  const isAdminOrStaffOrHR = user?.role === 'admin' || user?.role === 'hod' || user?.role === 'staff' || user?.role === 'hr';

  const [activeTab, setActiveTab] = useState<'books' | 'issued'>('books');
  const { data: booksData, loading: booksLoading, execute: refetchBooks } = useFetch<any[]>(libraryApi.getBooks);
  const { data: issuedBooksData, loading: issuedLoading, execute: refetchIssued } = useFetch<any[]>(libraryApi.getIssuedBooks, { immediate: false });

  const books = useMemo(() => extractList<Record<string, any>>(booksData), [booksData]);
  const issuedBooks = useMemo(() => extractList<Record<string, any>>(issuedBooksData), [issuedBooksData]);

  useEffect(() => {
    if (activeTab === 'issued') {
      refetchIssued();
    }
  }, [activeTab, refetchIssued]);
  const { data: coursesData } = useFetch<any[]>(courseApi.getAll);
  const courses = useMemo(() => extractList<Record<string, any>>(coursesData), [coursesData]);
  const { data: statsData } = useFetch<any>(libraryApi.getStats);
  const stats = useMemo(() => extractData<Record<string, any>>(statsData), [statsData]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Issue Book dialog state
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueBookId, setIssueBookId] = useState<string>('');
  const [issueStudentId, setIssueStudentId] = useState<string>('');
  const { data: issueStudentsData, loading: issueStudentsLoading, execute: refreshIssueStudents } = useFetch<any[]>(
    studentApi.getAll,
    { immediate: false }
  );
  const issueStudents = useMemo(() => extractList<Record<string, any>>(issueStudentsData), [issueStudentsData]);

  // Add Book dialog state (HR/Admin/Staff)
  const [addBookDialogOpen, setAddBookDialogOpen] = useState(false);
  const [addBookForm, setAddBookForm] = useState<{
    title: string;
    author: string;
    isbn: string;
    category: string;
    totalCopies: number;
    courseId: string;
    location: string;
  }>({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1,
    courseId: '',
    location: '',
  });

  useEffect(() => {
    if (!addBookDialogOpen) return;
    if (addBookForm.courseId) return;
    const first = (courses || [])[0];
    if (first) {
      setAddBookForm((prev) => ({
        ...prev,
        courseId: String(first.id || first._id),
      }));
    }
  }, [addBookDialogOpen, courses, addBookForm.courseId]);

  const filteredBooks = useMemo(() => {
    if (!books.length) return [];
    if (selectedCourse === 'all') return books;
    return books.filter((book: any) => {
      const courseId = book?.course?._id || book?.course?.id || book?.courseId;
      return String(courseId) === String(selectedCourse);
    });
  }, [books, selectedCourse]);

  const libraryStats = useMemo(() => [
    { label: "TOTAL BOOKS", value: stats?.totalBooks || books?.length || 0, trend: "All inventory", color: "text-amber-500", bg: "bg-amber-500/10", icon: BookOpen },
    { label: "ISSUED BOOKS", value: stats?.issuedBooks || 0, trend: "Currently issued", color: "text-rose-500", bg: "bg-rose-500/10", icon: UserCheck },
    { label: "AVAILABLE", value: stats?.availableBooks || 0, trend: "In stock", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
    { label: "NEW ARRIVALS", value: 0, trend: "N/A", color: "text-blue-500", bg: "bg-blue-500/10", icon: Plus },
  ], [stats, books]);

  useEffect(() => {
    if (!issueDialogOpen) return;
    // Fetch a larger list so HR can pick the right student.
    refreshIssueStudents({ page: 1, limit: 50 });
  }, [issueDialogOpen, refreshIssueStudents]);

  useEffect(() => {
    if (!issueDialogOpen) return;
    if (issueStudentId) return;
    const first = issueStudents?.[0];
    if (first) setIssueStudentId(String(first._id));
  }, [issueDialogOpen, issueStudents, issueStudentId]);

  const confirmIssueBook = async () => {
    try {
      if (!issueBookId || !issueStudentId) {
        toast.error('Please select student');
        return;
      }

      await libraryApi.issueBook({
        bookId: issueBookId,
        studentId: issueStudentId,
        dueDate: dayjs().add(14, 'day').toISOString(),
      });

      toast.success('Book issued successfully');
      setIssueDialogOpen(false);
      setIssueBookId('');
      refetchBooks();
      refetchIssued();
    } catch (error) {
      toast.error('Failed to issue book');
    }
  };

  const openIssueDialog = (bookId: string) => {
    setIssueBookId(bookId);
    setIssueDialogOpen(true);
  };

  const returnBook = async (bookId: string, studentId: string) => {
    try {
      await libraryApi.returnBook({ bookId, studentId });
      toast.success('Book returned successfully');
      refetchBooks();
      refetchIssued();
    } catch (error) {
      toast.error('Failed to return book');
    }
  };

  const confirmAddBook = async () => {
    try {
      const total = Number(addBookForm.totalCopies);
      if (!addBookForm.title || !addBookForm.author || !addBookForm.isbn || !addBookForm.category) {
        toast.error('Please fill all required fields');
        return;
      }
      if (!addBookForm.courseId) {
        toast.error('Please select course');
        return;
      }
      if (!Number.isFinite(total) || total <= 0) {
        toast.error('Total copies must be greater than 0');
        return;
      }

      await libraryApi.addBook({
        title: addBookForm.title,
        author: addBookForm.author,
        isbn: addBookForm.isbn,
        category: addBookForm.category,
        totalCopies: total,
        availableCopies: total,
        course: addBookForm.courseId,
        location: addBookForm.location || undefined,
      });

      toast.success('Book added successfully');
      setAddBookDialogOpen(false);
      setAddBookForm({
        title: '',
        author: '',
        isbn: '',
        category: '',
        totalCopies: 1,
        courseId: addBookForm.courseId,
        location: '',
      });

      refetchBooks();
      refetchIssued();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add book');
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await libraryApi.deleteBook(id);
      toast.success('Book deleted successfully');
      refetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'hod', 'professor', 'assistant_professor', 'staff', 'student', 'hr']}>
      <div className="space-y-8 pb-10 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
            <Library className="h-10 w-10 text-amber-500" />
            Library Nexus
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Knowledge Repository & Resource Management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-border">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('books')}
              className={cn(
                "rounded-xl px-6 font-black text-xs uppercase tracking-widest h-10 transition-all",
                activeTab === 'books' ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              )}
            >
              Books
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('issued')}
              className={cn(
                "rounded-xl px-6 font-black text-xs uppercase tracking-widest h-10 transition-all",
                activeTab === 'issued' ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              )}
            >
              Issued
            </Button>
          </div>
          {isAdminOrStaffOrHR && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
              onClick={() => setAddBookDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Book
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {libraryStats.map((stat, i) => (
          <Card key={i} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</h3>
              <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
              <div className="flex items-center gap-2">
                <stat.icon className={cn("h-3 w-3", stat.color)} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-border bg-slate-900/30 px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div>
                <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Book Inventory</CardTitle>
                <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage library resources</CardDescription>
              </div>
              
              <div className="w-64">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="bg-slate-950 border-border rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400">
                    <SelectValue placeholder="FILTER BY COURSE" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-border">
                    <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest">ALL COURSES</SelectItem>
                    {courses?.map((course: any) => (
                      <SelectItem key={course.id || course._id} value={String(course.id || course._id)} className="font-bold text-[10px] uppercase tracking-widest">
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="SEARCH CATALOGUE..." 
                className="pl-12 pr-6 py-3 bg-slate-950 border border-border rounded-2xl text-xs font-black text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-600 w-80 shadow-inner transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            <DataTable<Record<string, any>>
              data={activeTab === 'books' ? filteredBooks : (issuedBooks || [])}
              isLoading={activeTab === 'books' ? booksLoading : issuedLoading}
            columns={activeTab === 'books' ? [
              { 
                key: 'title', 
                label: 'BOOK TITLE', 
                render: (v, row) => (
                  <div className="flex flex-col">
                    <span className="font-black text-white tracking-tight uppercase">{v}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{row.author}</span>
                  </div>
                ) 
              },
              { key: 'isbn', label: 'ISBN/UID', render: (v) => <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{v}</span> },
              { 
                key: 'course', 
                label: 'COURSE', 
                render: (v) => (
                  <Badge variant="outline" className="rounded-lg border-border text-[10px] font-black uppercase">
                    {v?.name || v?.code || 'N/A'}
                  </Badge>
                )
              },
              { 
                label: 'AVAILABILITY', 
                key: 'availableCopies',
                render: (v) => (
                  <Badge className={cn(
                    "rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border",
                    Number(v) > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}>
                    {Number(v) > 0 ? 'Available' : 'Not Available'}
                  </Badge>
                ) 
              },
              {
                key: 'actions',
                label: 'OPERATIONS',
                render: (_, row) => (
                  <div className="flex items-center gap-2">
                    {Number(row.availableCopies) > 0 ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openIssueDialog(row._id)}
                        className="h-8 rounded-lg border-border hover:bg-amber-500/10 hover:text-amber-500 font-black text-[10px] uppercase tracking-widest"
                      >
                        Issue Book
                      </Button>
                    ) : (
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">No Copies</span>
                    )}
                    
                    {isAdminOrStaffOrHR && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteBook(row._id)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              }
            ] : [
              { 
                key: 'bookTitle', 
                label: 'BOOK TITLE', 
                render: (v, row) => (
                  <div className="flex flex-col">
                    <span className="font-black text-white tracking-tight uppercase">{v}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{row.author}</span>
                  </div>
                ) 
              },
              { 
                key: 'studentId', 
                label: 'STUDENT', 
                render: (_v, row) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-200 uppercase tracking-widest">{row.student?.name || 'N/A'}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{row.studentId || ''}</span>
                  </div>
                ) 
              },
              { 
                key: 'issueDate', 
                label: 'ISSUE DATE', 
                render: (v) => <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{v ? dayjs(v).format('DD MMM YYYY') : '-'}</span> 
              },
              {
                key: 'actions',
                label: 'OPERATIONS',
                render: (_, row) => (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => returnBook(row.bookId, row.studentId)}
                      className="h-8 rounded-lg border-border hover:bg-blue-500/10 hover:text-blue-500 font-black text-[10px] uppercase tracking-widest"
                    >
                      Return Book
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </CardContent>
      </Card>
      </div>

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="max-w-xl bg-card border-border shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-slate-900/20">
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              Issue Book
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              Select student and confirm issue
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Select Student
              </p>

              <Select value={issueStudentId} onValueChange={setIssueStudentId}>
                <SelectTrigger className="bg-slate-950 border-border rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400">
                  <SelectValue placeholder="CHOOSE STUDENT" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-border">
                  {issueStudentsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : issueStudents?.length ? (
                    issueStudents.map((s: any) => (
                      <SelectItem key={s._id} value={String(s._id)} className="font-bold text-[10px] uppercase tracking-widest">
                        {s.user?.name || s.name || s.user?.email || 'Student'} ({s.rollNo || s.rollNumber})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No students found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
              <Button
                variant="outline"
                className="rounded-2xl border-border hover:bg-slate-900 font-black uppercase text-[10px] tracking-[0.2em] h-11 px-6"
                onClick={() => setIssueDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
                onClick={confirmIssueBook}
              >
                Confirm Issue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addBookDialogOpen} onOpenChange={setAddBookDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-slate-900/20">
            <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
              Add Book
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
              HR can insert new books into inventory
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Course</Label>
                <Select
                  value={addBookForm.courseId}
                  onValueChange={(v) => setAddBookForm((p) => ({ ...p, courseId: v }))}
                >
                  <SelectTrigger className="bg-slate-950 border-border rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 h-11">
                    <SelectValue placeholder="SELECT COURSE" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-border">
                    {courses?.map((course: any) => (
                      <SelectItem key={course.id || course._id} value={String(course.id || course._id)} className="font-bold text-[10px] uppercase tracking-widest">
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</Label>
                <Input
                  value={addBookForm.category}
                  onChange={(e) => setAddBookForm((p) => ({ ...p, category: e.target.value }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                  placeholder="e.g., Math, Science"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Title</Label>
                <Input
                  value={addBookForm.title}
                  onChange={(e) => setAddBookForm((p) => ({ ...p, title: e.target.value }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                  placeholder="Book title"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Author</Label>
                <Input
                  value={addBookForm.author}
                  onChange={(e) => setAddBookForm((p) => ({ ...p, author: e.target.value }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                  placeholder="Author name"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">ISBN/UID</Label>
                <Input
                  value={addBookForm.isbn}
                  onChange={(e) => setAddBookForm((p) => ({ ...p, isbn: e.target.value }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                  placeholder="ISBN"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Copies</Label>
                <Input
                  type="number"
                  value={addBookForm.totalCopies}
                  onChange={(e) => setAddBookForm((p) => ({ ...p, totalCopies: Number(e.target.value) }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                  placeholder="1"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Location (optional)</Label>
                <Input
                  value={addBookForm.location}
                  onChange={(e) => setAddBookForm((p) => ({ ...p, location: e.target.value }))}
                  className="bg-slate-950 border-border text-white h-11 rounded-xl"
                  placeholder="Shelf / Rack"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
              <Button
                variant="outline"
                className="rounded-2xl border-border hover:bg-slate-900 font-black uppercase text-[10px] tracking-[0.2em] h-11 px-6"
                onClick={() => setAddBookDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-8 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
                onClick={confirmAddBook}
              >
                Add Book
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
