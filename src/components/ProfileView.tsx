import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Wallet, 
  Award, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  TrendingUp,
  History,
  CreditCard,
  Camera,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { updateUser } from '../lib/db';

export function ProfileView() {
  const { user, logout, updateUserData } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const updatedUser = await updateUser(user.User_Email || user.email, { photoUrl: base64String });
        updateUserData({ photoUrl: base64String });
      } catch (error) {
        console.error("Failed to update photo:", error);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col gap-8 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[#C5A059] rounded-full" />
          <h2 className="text-3xl font-bold text-white tracking-tighter">الحساب الشخصي والسيادة</h2>
        </div>
        <Button variant="outline" onClick={logout} className="border-red-500/20 text-red-500 hover:bg-red-500/10 gap-2">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 bg-[#111111] border-gray-800">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <img 
                src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.User_Name)}&background=C5A059&color=121212`} 
                alt={user.User_Name} 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#C5A059]/50"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-[#C5A059] rounded-lg text-black">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{user.User_Name}</h3>
            <p className="text-xs text-gray-500 mb-4">{user.User_Email}</p>
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] text-gray-500 hover:text-[#C5A059] mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                تغيير الصورة الشخصية
            </Button>
            <div className="grid grid-cols-1 w-full gap-2 mt-4">
              <div className="p-3 rounded-xl bg-black border border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase font-black">طبقة الاستثمار</p>
                <p className="text-[#C5A059] font-bold">{user.Investment_Layer}</p>
              </div>
              <div className="p-3 rounded-xl bg-black border border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase font-black">نقاط السيادة</p>
                <p className="text-white font-bold">{user.Sovereignty_Points}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet & Stats */}
        <Card className="md:col-span-2 bg-[#111111] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#C5A059]" />
              المحفظة المالية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-6 rounded-2xl border border-[#C5A059]/20 flex justify-between items-end relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-3xl" />
               <div>
                 <p className="text-xs text-gray-400 mb-2 font-black uppercase">رأس المال المستثمر</p>
                 <p className="text-4xl font-black text-white italic tracking-tighter">
                   {user.Capital_Amount?.toLocaleString()} <span className="text-lg text-[#C5A059] not-italic">د.ك</span>
                 </p>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-1.5 text-green-400 font-bold text-sm bg-green-500/10 px-3 py-1 rounded-full">
                   <TrendingUp className="h-3.5 w-3.5" />
                   +12.4%
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Button className="h-16 bg-[#C5A059] text-black font-black text-lg gap-3 rounded-xl hover:bg-[#C5A059]/90">
                 <CreditCard className="h-6 w-6" />
                 إيداع تمويل
               </Button>
               <Button variant="outline" className="h-16 border-gray-800 text-white hover:bg-white/5 font-bold gap-3 rounded-xl">
                 <History className="h-6 w-6" />
                 سجل العمليات
               </Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-400">تحليلات السيادة</h4>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">التقدم نحو الطبقة التالية</span>
                    <span className="text-[#C5A059]">65%</span>
                  </div>
                  <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-gray-900">
                    <div className="h-full bg-[#C5A059] w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings Placeholder */}
      <Card className="bg-[#111111] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            إعدادات الحساب والأمان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="ghost" className="justify-between text-gray-300 hover:bg-white/5 h-12 px-4 border border-gray-800">
              تغيير كلمة المرور المشفرة
              <span className="text-[10px] text-gray-600 font-mono">ENCRYPTED_AUTH</span>
            </Button>
            <Button variant="ghost" className="justify-between text-gray-300 hover:bg-white/5 h-12 px-4 border border-gray-800">
              توثيق الحساب بالهوية (KYC)
              <span className="text-[10px] text-red-500 font-mono">REQUIRED</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
