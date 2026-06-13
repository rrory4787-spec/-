import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vault, 
  ShieldAlert, 
  PhoneCall, 
  ChevronLeft,
  Activity,
  UserCheck,
  Lock,
  Wifi,
  Radio,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User } from '../types';

interface AbsoluteSovereigntyVaultViewProps {
  user: User;
  onBack: () => void;
}

export function AbsoluteSovereigntyVaultView({ user, onBack }: AbsoluteSovereigntyVaultViewProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Absolute restricted check: Hidden view for Layer_700 only
  const isAuthorized = user.Investment_Layer === 'Layer_700';

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-center p-6">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="space-y-6"
        >
          <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/50">
            <Lock className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-widest uppercase">Unauthorized Access</h2>
          <p className="text-gray-500 max-w-sm font-mono text-xs">
            Access to Absolute Sovereignty Vaults is restricted to Tier 1 Sovereign Partners only. 
            Unauthorized attempts are logged.
          </p>
          <Button onClick={onBack} variant="outline" className="border-gray-800 text-gray-400 hover:text-white">
            Return to Surface
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#050505] p-6 flex flex-col gap-8 overflow-y-auto max-w-5xl mx-auto w-full relative">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent_0%,rgba(197,160,89,0.1)_50%,transparent_100%)] bg-[length:100%_4px]" />

      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-10 bg-[#C5A059] rounded-full shadow-[0_0_20px_rgba(197,160,89,0.5)]" />
            <motion.div 
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -right-2 top-0 w-1 h-3 bg-red-500 rounded-full" 
            />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">خزائن السيادة المطلقة</h2>
            <div className="flex items-center gap-2 text-[10px] text-[#C5A059] font-mono mt-1">
              <Wifi className="h-3 w-3 animate-pulse" />
              <span>ENCRYPTED_CONNECTION: ACTIVE_700</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:text-white gap-2 font-mono text-xs border border-gray-900">
          <ChevronLeft className="h-4 w-4" />
          EXIT_SECURE_VAULT
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Sovereign Vault - Live Dashboard */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
          <Card className="bg-[#0A0A0A] border-[#C5A059]/30 hover:border-[#C5A059] transition-all cursor-pointer h-full group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20">
               <Activity className="h-24 w-24 text-[#C5A059]" />
             </div>
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-[#C5A059]/10 text-[#C5A059] mb-4">
                <Vault className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white">الخزنة السيادية</CardTitle>
              <p className="text-xs text-gray-500">متابعة دقيقة لنمو رأس المال الضخم والأرباح المركبة</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-[#111111] p-4 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-black mb-1">صافي القيمة الحالية</p>
                  <p className="text-3xl font-black text-white italic tracking-tighter">842,560.00 د.ك</p>
                </div>
                <Button 
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2 h-12"
                  onClick={() => setActiveDialog('vault')}
                >
                  فتح لوحة التحكم الحية
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ops Room - Chat with Experts */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
          <Card className="bg-[#0A0A0A] border-blue-500/30 hover:border-blue-500 transition-all cursor-pointer h-full group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10">
               <Radio className="h-24 w-24 text-blue-500" />
             </div>
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400 mb-4">
                <Cpu className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white">غرفة عمليات صناع السوق</CardTitle>
              <p className="text-xs text-gray-500">بوابة تواصل مشفرة مباشرة مع طلعت وفاتن</p>
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-4 mb-4 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-blue-900 flex items-center justify-center text-xs font-bold text-white">T</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-purple-900 flex items-center justify-center text-xs font-bold text-white">F</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-green-900 border-dashed animate-pulse text-[8px] text-green-400 flex items-center justify-center">LIVE</div>
              </div>
              <Button 
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 h-12 gap-2"
                onClick={() => setActiveDialog('ops')}
              >
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                دخول غرفة العمليات
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Encrypted Hotline - Direct Line */}
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
          <Card className="bg-gradient-to-br from-[#0A0A0A] to-[#120505] border-red-500/30 hover:border-red-500 transition-all cursor-pointer h-full group relative overflow-hidden">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-red-500/10 text-red-500 mb-4 animate-bounce">
                <PhoneCall className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white">الخط الساخن المشفر</CardTitle>
              <p className="text-xs text-gray-500">اتصال صوتي فوري ومباشر بالخبير لاتخاذ القرارات الحاسمة</p>
            </CardHeader>
            <CardContent>
               <div className="p-6 rounded-2xl border-2 border-dashed border-red-500/20 text-center space-y-4">
                 <p className="text-[10px] text-red-400 font-mono">USE ONLY FOR CRITICAL EMERGENCIES</p>
                 <Button 
                   className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-16 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                   onClick={() => setActiveDialog('hotline')}
                 >
                   إجراء اتصال سيادي
                 </Button>
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialog Overlay */}
      <AnimatePresence>
        {activeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setActiveDialog(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[#0D0D0D] border border-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,1)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {activeDialog === 'vault' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white">الخزنة السيادية الحية</h3>
                      <p className="text-[#C5A059] font-mono text-[10px]">REAL_TIME_DATA_FLOW: ENCRYPTED</p>
                    </div>
                    <Vault className="h-12 w-12 text-[#C5A059]" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-black border border-gray-800 rounded-2xl">
                      <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">الأرباح التراكمية</p>
                      <p className="text-2xl font-bold text-green-500 font-mono">+185,420 د.ك</p>
                    </div>
                    <div className="p-5 bg-black border border-gray-800 rounded-2xl">
                      <p className="text-gray-500 text-[10px] uppercase font-bold mb-2">معدل الفائدة المركبة</p>
                      <p className="text-2xl font-bold text-blue-500 font-mono">18.5% سنوي</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-600 font-mono">LIVE_TRANSACTION_LOG</p>
                    <div className="bg-black/50 rounded-xl p-4 h-32 border border-gray-900 font-mono text-[10px] text-green-500 overflow-y-auto space-y-1">
                       <p>[{new Date().toLocaleTimeString()}] INCOMING_YIELD_ALLOCATION: +450.00 KWD</p>
                       <p>[{new Date().toLocaleTimeString()}] COMPOUND_REINVESTMENT_TRIGGERED: SUCCESS</p>
                       <p>[{new Date().toLocaleTimeString()}] EQUITY_ADJUSTMENT_EXECUTED: +0.02%</p>
                       <p>[{new Date().toLocaleTimeString()}] SECURITY_HEARTBEAT: OK</p>
                    </div>
                  </div>

                  <Button className="w-full bg-[#1A1A1A] text-gray-400 hover:text-white" onClick={() => setActiveDialog(null)}> إغلاق اللوحة </Button>
                </div>
              )}

              {activeDialog === 'ops' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-blue-400">
                    <Cpu className="h-10 w-10" />
                    <div>
                      <h3 className="text-2xl font-bold text-white">غرفة العمليات المشفرة</h3>
                      <p className="text-[10px] text-blue-500/80 font-mono">DIRECT_CHANNEL: MARKET_MAKERS</p>
                    </div>
                  </div>
                  <div className="h-[300px] bg-black rounded-2xl border border-gray-800 p-6 flex flex-col justify-end space-y-4">
                    <div className="space-y-4 overflow-y-auto pr-2">
                       <div className="bg-gray-900/50 p-4 rounded-2xl rounded-bl-none text-sm border border-gray-800">
                          <p className="text-blue-400 font-bold mb-1 text-[10px]">TALAAT [MARKET_MAKER_1]</p>
                          <p className="text-gray-300">نحن الآن بصدد الدخول في صفقة استحواذ كبرى، سيتم توزيع العوائد بشكل استثنائي هذا الربع.</p>
                       </div>
                       <div className="bg-gray-900/50 p-4 rounded-2xl rounded-bl-none text-sm border border-gray-800">
                          <p className="text-purple-400 font-bold mb-1 text-[10px]">FATEN [STRATEGY_LEAD]</p>
                          <p className="text-gray-300">تم تأمين المسارات لسيولة "خزائن السيادة المطلقة"، شريكنا العزيز أنت في أمان تام.</p>
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 bg-black border border-gray-800 rounded-xl px-4 text-white text-sm focus:border-blue-500 outline-none h-12" placeholder="أرسل رسالة مشفرة..." />
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 font-bold">إرسال</Button>
                  </div>
                </div>
              )}

              {activeDialog === 'hotline' && (
                <div className="text-center space-y-8 py-8">
                  <div className="relative inline-block">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-32 h-32 bg-red-600/20 rounded-full flex items-center justify-center border-4 border-red-600 relative z-10"
                    >
                      <PhoneCall className="h-16 w-16 text-red-600" />
                    </motion.div>
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-20 -z-10 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-white">جاري تشفير الخط...</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                      سيتم توصيلك بالخبير المالي في مكالمة صوتية مشفرة خلال أقل من 10 ثوانٍ.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                     <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
                     <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce delay-100" />
                     <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce delay-200" />
                  </div>
                  <Button className="bg-white/5 border border-white/10 text-gray-500 hover:text-white" onClick={() => setActiveDialog(null)}> إلغاء المحاولة </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
