import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  MessagesSquare, 
  BellRing, 
  ChevronLeft,
  PieChart,
  Lock,
  MessageCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User } from '../types';

interface PartnersCouncilViewProps {
  user: User;
  onBack: () => void;
}

export function PartnersCouncilView({ user, onBack }: PartnersCouncilViewProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Restricted check: Partners Council is only for Layer_700
  const isRestricted = user.Investment_Layer !== 'Layer_700';

  if (isRestricted) {
    return (
      <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col items-center justify-center text-center gap-6">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
          <Lock className="h-12 w-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">منطقة محظورة</h2>
          <p className="text-gray-500 max-w-sm">
            مجلس الشركاء مخصص حصرياً لأعضاء طبقة السيادة الكاملة (Layer 700). يرجى تقديم طلب ترقية من بوابة التمكين للوصول.
          </p>
        </div>
        <Button onClick={onBack} className="bg-gray-800 hover:bg-gray-700 text-white">
          العودة للموجز
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col gap-8 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[#C5A059] rounded-full" />
          <h2 className="text-3xl font-bold text-white tracking-tighter">مجلس الشركاء</h2>
        </div>
        <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:text-white gap-2">
          <ChevronLeft className="h-4 w-4" />
          العودة للموجز
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Managed Portfolio Report */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-[#111111] border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-all cursor-pointer overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-xl bg-[#C5A059]/10 text-[#C5A059] group-hover:scale-110 transition-transform">
                <Briefcase className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">تقرير المحفظة المدارة</CardTitle>
                <p className="text-xs text-gray-500">بيانات الحساب ومراقبة الأرباح الشهرية</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#1A1A1A] border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">رأس المال المضمون:</span>
                    <span className="text-white font-bold">{user.Capital_Amount?.toLocaleString()} د.ك</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">حالة المحفظة:</span>
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      مؤمن بالكامل
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-gray-800 gap-2"
                  onClick={() => setActiveDialog('portfolio')}
                >
                  <PieChart className="h-4 w-4" />
                  فتح التقرير التفصيلي
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Elite Discussion Diwan */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-[#111111] border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <MessagesSquare className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">ديوان نقاش النخبة</CardTitle>
                <p className="text-xs text-gray-500">تواصل مباشر وحصري مع الخبير المالي</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center mb-4">
                <p className="text-sm text-blue-400">الخبير متصل الآن وجاهز للاستشارة</p>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                onClick={() => setActiveDialog('chat')}
              >
                <MessageCircle className="h-4 w-4" />
                دخول الديوان الخاص
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Decisive Signals */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }} className="md:col-span-2">
          <Card className="bg-gradient-to-r from-[#111111] to-[#1A1A1A] border-yellow-500/20 hover:border-yellow-500/50 transition-all cursor-pointer overflow-hidden group">
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500 animate-pulse">
                  <BellRing className="h-10 w-10" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">إشارات الحسم</CardTitle>
                  <p className="text-gray-400 mt-1">تنبيهات فورية لتحركات السوق الكبرى وفرص الاقتناص</p>
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-black px-12 h-16 rounded-xl animate-bounce shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                onClick={() => setActiveDialog('signal')}
              >
                تفعيل إشعارات الحسم
              </Button>
            </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111111] border border-gray-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background accent */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-[80px]" />

              {activeDialog === 'portfolio' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[#C5A059]">
                    <PieChart className="h-8 w-8" />
                    <h3 className="text-2xl font-bold text-white">تحليل المحفظة الاستراتيجية</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#1A1A1A] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">النمو التراكمي</p>
                      <p className="text-3xl font-bold text-green-400">+28.4%</p>
                    </div>
                    <div className="p-4 bg-[#1A1A1A] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">توزيع الأرباح القادم</p>
                      <p className="text-3xl font-bold text-[#C5A059]">820 د.ك</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400 font-bold mb-2">تتبع الربح الشهري:</p>
                    {[
                      { month: 'مايو 2026', profit: '+4.2%', amount: '580 د.ك' },
                      { month: 'أبريل 2026', profit: '+5.1%', amount: '690 د.ك' },
                      { month: 'مارس 2026', profit: '+3.8%', amount: '520 د.ك' },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-lg text-sm">
                        <span className="text-gray-300">{row.month}</span>
                        <div className="flex gap-4">
                          <span className="text-green-400">{row.profit}</span>
                          <span className="text-white font-mono">{row.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white mt-4" onClick={() => setActiveDialog(null)}> إغلاق التقرير </Button>
                </div>
              )}

              {activeDialog === 'chat' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-blue-400">
                    <MessagesSquare className="h-8 w-8" />
                    <h3 className="text-2xl font-bold text-white">ديوان نقاش النخبة</h3>
                  </div>
                  <div className="h-[300px] bg-[#0A0A0A] rounded-xl border border-gray-800 p-4 space-y-4 overflow-y-auto">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-[10px] text-gray-500 mr-2">الخبير المالي (12:45 PM)</span>
                      <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm text-gray-200">
                        أهلاً بكم يا شركاء النجاح. السوق اليوم يشهد تحولات مثيرة في قطاع التكنولوجيا السيادية، أنصح بمراقبة الإشارات القادمة.
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-[10px] text-gray-500 ml-2">أنت (الآن)</span>
                      <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none max-w-[80%] text-sm text-white">
                        شكراً لك.. هل تنصح بزيادة التمويل في المحفظة المدارة لهذا الشهر؟
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="اكتب استشارتك هنا..." 
                      className="flex-1 bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 text-sm focus:border-blue-500 outline-none"
                    />
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">إرسال</Button>
                  </div>
                </div>
              )}

              {activeDialog === 'signal' && (
                <div className="text-center space-y-8">
                  <div className="relative inline-block">
                    <BellRing className="h-24 w-24 text-yellow-500 animate-pulse" />
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-yellow-500 rounded-full blur-2xl -z-10"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-white italic">تم تفعيل الرادار</h3>
                    <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                      لقد نجحت في تفعيل "إشارات الحسم". من الآن فصاعداً، ستصلك تنبيهات مباشرة على جهازك قبل أي تحرك كبير للسوق بـ 15 دقيقة على الأقل.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-center justify-center gap-3 text-yellow-500 font-bold">
                      <TrendingUp className="h-5 w-5" />
                      <span>نسبة دقة الإشارات الحالية: 94.2%</span>
                    </div>
                  </div>
                  <Button className="w-full bg-yellow-500 text-black font-black h-14 text-lg" onClick={() => setActiveDialog(null)}>
                    مستعد للاقتناص
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
