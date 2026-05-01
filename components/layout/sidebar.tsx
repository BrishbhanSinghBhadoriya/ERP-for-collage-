"use client";

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge as UiBadge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  CalendarDays,
  FileText,
  User,
  Settings,
  LayoutDashboard,
  Building,
  Shield,
  Briefcase,
  Hash,
  Bell,
  Key,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CreditCard,
  Library,
  Bus,
  Home,
} from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const navigation = [
  { group: 'Main', items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff', 'student'] },
    { name: 'Profile', href: '/profile', icon: User, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff', 'student'] },
  ]},
  { group: 'Academic', items: [
    { name: 'Students', href: '/students', icon: GraduationCap, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff'] },
    { name: 'Academics', href: '/academics', icon: BookOpen, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff', 'student'] },
    { name: 'Attendance', href: '/attendance', icon: Calendar, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'student'] },
    { name: 'Examinations', href: '/exams', icon: ClipboardList, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'student'] },
    { name: 'Fees', href: '/fees', icon: CreditCard, roles: ['admin', 'hr', 'staff', 'student'] },
    { name: 'Library', href: '/library', icon: Library, roles: ['admin', 'hr', 'staff', 'student', 'professor', 'assistant_professor'] },
    { name: 'Activities', href: '/extra-curricular', icon: Hash, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff', 'student'] },
    { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff'] },
  ]},
  { group: 'HR & Staff', items: [
    { name: 'Employees', href: '/employees', icon: Users, roles: ['admin', 'hr', 'hod'] },
    { name: 'Holidays', href: '/holidays', icon: CalendarDays, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff', 'student'] },
    { name: 'Leaves', href: '/leaves', icon: FileText, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff'] },
    { name: 'Hostel Leave', href: '/hostel-leave', icon: Home, roles: ['admin', 'hr', 'hod', 'student', 'warden'] },
    { name: 'Salary Manager', href: '/salary-manager', icon: Briefcase, roles: ['admin', 'hr'] },
  ]},
  { group: 'System', items: [
    { name: 'Announcements', href: '/announcements', icon: Bell, roles: ['admin', 'hr', 'hod', 'professor', 'assistant_professor', 'staff', 'student'] },

    { name: "Reset Password", href: '/reset-emp-password', icon: Key, roles: ['admin', 'hr'] }
  ]}
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const userRole = user?.role || 'student';

  return (
    <div className={cn(
      'flex flex-col h-screen transition-all duration-500 bg-slate-950 text-slate-300 border-r border-slate-800/50 shadow-2xl relative z-50',
      collapsed ? 'w-20' : 'w-72'
    )}>
      {/* Brand Logo Section */}
      <div className="p-8">
        <div className={cn("flex items-center transition-all duration-500", collapsed ? "justify-center" : "gap-4")}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 p-2 overflow-hidden shadow-inner">
              <img 
                src="/gcrg.jpeg" 
                alt="Logo" 
                className="w-full h-full object-cover rounded-lg" 
              />
            </div>
          </div>
          
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white leading-none">COLLEGE <span className="text-blue-500">ERP</span></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Management Suite</span>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-slate-800/50 mx-6 w-auto mb-4" />

      {/* User Status Card */}
      {!collapsed && (
        <div className="px-6 mb-6">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate">{user?.name || 'User'}</span>
                <UiBadge className={cn(
                  'w-fit px-1.5 py-0 text-[9px] font-black uppercase tracking-tighter mt-0.5',
                  userRole === 'admin' && 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  userRole === 'hr' && 'bg-pink-500/10 text-pink-400 border-pink-500/20',
                  userRole === 'hod' && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                  userRole === 'professor' && 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                  userRole === 'assistant_professor' && 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                  userRole === 'student' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  userRole === 'staff' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  userRole === 'warden' && 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                )}>
                  {userRole}
                </UiBadge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-4 pb-8">
        <div className="space-y-8">
          {navigation.map((group) => {
            const visibleItems = group.items.filter(item => item.roles.includes(userRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-2">
                {!collapsed && (
                  <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                    {group.group}
                  </h3>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative',
                          isActive
                            ? 'bg-blue-600 text-white shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)]'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/80',
                          collapsed && 'justify-center'
                        )}
                      >
                        <Icon className={cn(
                          'h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'
                        )} />
                        {!collapsed && <span>{item.name}</span>}
                        {isActive && !collapsed && (
                          <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-8">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600/10 to-teal-500/10 border border-slate-800/50 p-4">
            <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">
              v2.0.4 - Premium ERP
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
