"use client";

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import axios, { AxiosError } from 'axios';
import Cookies from "js-cookie";


interface TopbarProps {
  onToggleSidebar?: () => void;
  title?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Topbar({ onToggleSidebar, title, breadcrumbs, actions }: TopbarProps) {
  const { user, logout } = useAuth();

  const  handleLogout = async () => {
    console.log('Topbar: handleLogout called');
   const result:any= await logout();
   console.log('Topbar: logout result:', result);
   if (result) {
     
       console.log('Topbar: User logged out successfully');
     }
   
  };

  

  return (
    <header className="border-b bg-gradient-to-r from-background via-secondary to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex items-center gap-4">
          {breadcrumbs || (title && <h1 className="font-semibold text-lg">{title}</h1>)}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64 rounded-xl"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border border-border/50 shadow-sm overflow-hidden">
                  {user?.loginImage ? (
                    <AvatarImage src={user.loginImage} alt="Login Verification Photo" className="object-cover" />
                  ) : (
                    <AvatarImage src={user?.profilePicture || ''} alt={user?.name} className="object-cover" />
                  )}
                  <AvatarFallback>
                    {user?.name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {actions}
        </div>
      </div>
    </header>
  );
}