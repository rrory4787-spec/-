import { User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MemberListProps {
  members: User[];
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="w-full space-y-6">
      <div className="border-gray-800 bg-[#0F0F0F] p-6 shrink-0 rounded-2xl border">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
          الأعضاء المتصلون
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        </h3>
        <div className="space-y-4">
          {members.slice(0, 5).map((member) => (
            <div key={member.id} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={member.photoUrl} alt={member.name} />
                    <AvatarFallback className="bg-[#1A1A1A] text-[#C5A059] text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0F0F0F] group-hover:scale-110 transition-transform"></div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-300 group-hover:text-[#C5A059] transition-colors">{member.name}</p>
                <p className="text-[9px] text-gray-600 uppercase tracking-tighter">{member.role === 'admin' ? 'مسؤول' : 'استثمار وتطوير'}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-600 hover:text-[#C5A059] opacity-0 group-hover:opacity-100 transition-all">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="link" className="h-auto w-full p-0 text-[10px] text-gray-500 hover:text-[#C5A059] hover:no-underline font-italic">
            + استكشاف جميع الأعضاء (400)
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-gradient-to-br from-[#1A1A1A] to-[#121212] rounded-2xl border border-gray-800 shadow-xl">
        <h4 className="text-xs font-bold text-[#C5A059] mb-2 uppercase tracking-widest">حدث قادم</h4>
        <p className="text-xs text-white font-semibold">الاجتماع السنوي الأول - خزائن الأرض</p>
        <p className="text-[10px] text-gray-500 mt-1">الخميس القادم • الساعة ٨ مساءً</p>
        <button className="w-full mt-4 py-2 bg-transparent border border-gray-700 text-gray-400 rounded-lg text-[10px] hover:border-[#C5A059] hover:text-[#C5A059] transition-all italic hover:bg-[#C5A059]/5">
          تأكيد حضور الجلسة
        </button>
      </div>
    </div>
  );
}
