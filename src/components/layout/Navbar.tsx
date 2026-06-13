import { User } from '../../types';
import { LogOut, Search, Bell, User as UserIcon, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onProfileClick: () => void;
  onAdminClick: () => void;
  logoUrl?: string;
}

export function Navbar({ user, onLogout, onProfileClick, onAdminClick, logoUrl }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#121212] backdrop-blur supports-[backdrop-filter]:bg-[#121212]/95 h-16">
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
            <img 
              src={logoUrl || "/src/assets/images/app_logo_coin_v3_1781318698537.jpg"} 
              alt="Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-black text-[#C5A059] hidden sm:block font-aref bg-gradient-to-r from-[#C5A059] via-[#E2C799] to-[#C5A059] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(197,160,89,0.3)] tracking-wider">خزائن الأرض</h1>
        </div>

        <div className="flex-1 max-w-md px-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="البحث في المجتمع..." 
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-[#C5A059] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="p-2 rounded-full bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-[#252525]">
            <Bell className="h-5 w-5" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-9 h-9 rounded-full bg-gray-700 border border-gray-600 overflow-hidden cursor-pointer outline-none">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user.photoUrl} alt={user.name} />
                  <AvatarFallback className="bg-[#C5A059] text-[#121212] font-bold">
                    {(user.name || user.User_Name || 'U').charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#1A1A1A] border-gray-800 text-white" align="end" forceMount>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || user.User_Name || 'عضو'}</p>
                      <p className="text-xs leading-none text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem 
                  className="focus:bg-[#C5A059]/10 focus:text-[#C5A059]"
                  onClick={onProfileClick}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                
                {user.role === 'admin' && (
                  <DropdownMenuItem 
                    className="focus:bg-red-500/10 focus:text-red-500"
                    onClick={onAdminClick}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    <span>مركز التحكم</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem 
                  className="text-red-400 focus:bg-red-400/10 focus:text-red-400"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="bg-[#C5A059] text-[#121212] hover:bg-[#C5A059]/90 font-bold">
              تسجيل الدخول
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
