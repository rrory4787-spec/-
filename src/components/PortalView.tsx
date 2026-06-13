import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  TrendingUp, 
  Sparkles, 
  ArrowUpCircle,
  ChevronLeft,
  DollarSign,
  Award,
  Zap,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User } from '../types';

interface PortalViewProps {
  user: User;
  onBack: () => void;
  onNavigate: (view: 'courses' | 'events') => void;
}

export function PortalView({ user, onBack, onNavigate }: PortalViewProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const affirmations = [
    "المال يتدفق إليّ من مصادر متعددة ومستمرة.",
    "أنا سيد قراراتي المالية وعقلي مبرمج للثراء.",
    "كل استثمار أقوم به يعود عليّ بأضعاف مضاعفة.",
    "أنا أستحق الحرية السيادية والتمكين الرقمي.",
    "اليوم هو فرصة جديدة لخلق ثروة تدوم للأجيال."
  ];

  const [randomAffirmation, setRandomAffirmation] = useState(affirmations[0]);

  const showAffirmation = () => {
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setRandomAffirmation(random);
    setActiveDialog('affirmation');
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col gap-8 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[#C5A059] rounded-full" />
          <h2 className="text-3xl font-bold text-white tracking-tighter">بوابة العبور والتمكين</h2>
        </div>
        <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:text-white gap-2">
          <ChevronLeft className="h-4 w-4" />
          العودة للموجز
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Whales Academy */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card 
            className="bg-[#111111] border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden group h-full"
            onClick={() => onNavigate('courses')}
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">أكاديمية الحيتان</CardTitle>
                <p className="text-xs text-gray-500">الدورات التدريبية المتقدمة لسيادة المال</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-lg bg-[#1A1A1A] border border-gray-800 text-sm text-gray-400">
                  <span className="text-[#C5A059] font-bold">جديد:</span> دورة "التصفير الفكري" متاحة الآن.
                </div>
                <Button className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-gray-800">
                  دخول الأكاديمية
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Agenda & Events */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card 
            className="bg-[#111111] border-gray-800 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden group h-full"
            onClick={() => onNavigate('events')}
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">الأجندة والفعاليات</CardTitle>
                <p className="text-xs text-gray-500">جدول الأعمال وتأكيد حالة الحضور</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-lg bg-[#1A1A1A] border border-gray-800 text-sm text-gray-400">
                  <span className="text-emerald-500 font-bold">تنبيه:</span> لا تنسى تأكيد حضورك للاجتماع القادم.
                </div>
                <Button className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-gray-800">
                  عرض الجدول
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rapid Growth Fund */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-[#111111] border-gray-800 hover:border-green-500/50 transition-all cursor-pointer overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">صندوق النمو السريع</CardTitle>
                <p className="text-xs text-gray-500">أداء التمويل الأصغر والعوائد الشهرية</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">العائد المتوقع</p>
                    <p className="text-lg font-bold text-green-400">+12.5%</p>
                  </div>
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">حالة الصندوق</p>
                    <p className="text-lg font-bold text-blue-400">نشط</p>
                  </div>
                </div>
                <Button className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white border border-gray-800" onClick={() => setActiveDialog('fund')}>
                  عرض تفاصيل الأداء
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sovereign Affirmations */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-[#111111] border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden group h-full" onClick={showAffirmation}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">التوكيدات السيادية</CardTitle>
                <p className="text-xs text-gray-500">برمجة يومية لعقلية الوفرة والنجاح</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 text-center italic text-gray-300">
                "اضغط هنا لاستلام توكيدك المالي لهذا اليوم"
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upgrade Sovereignty */}
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="bg-[#111111] border-gray-800 hover:border-[#C5A059]/50 transition-all cursor-pointer overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-xl bg-[#C5A059]/10 text-[#C5A059] group-hover:scale-110 transition-transform">
                <ArrowUpCircle className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">ترقية السيادة</CardTitle>
                <p className="text-xs text-gray-500">ارتقِ بمستوى استثمارك وصلاحياتك</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-xs text-gray-400">مستواك الحالي: <span className="text-blue-400 font-bold">{user.Investment_Layer}</span></p>
                <Button className="w-full bg-[#C5A059] hover:bg-[#C5A059]/90 text-[#121212] font-bold" onClick={() => setActiveDialog('upgrade')}>
                  طلب ترقية الطبقة
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {activeDialog === 'affirmation' && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <Sparkles className="h-16 w-16 text-purple-400 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">توكيد السيادة اليومي</h3>
                  <p className="text-xl text-[#C5A059] italic leading-relaxed font-light">
                    "{randomAffirmation}"
                  </p>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white w-full" onClick={() => setActiveDialog(null)}>
                    آمنت وحققت
                  </Button>
                </div>
              )}

              {activeDialog === 'fund' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Zap className="h-6 w-6 text-yellow-500" />
                    تقرير صندوق النمو
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-[#111111] rounded-lg border border-gray-800">
                      <span className="text-gray-400">إجمالي الأصول المدارة:</span>
                      <span className="font-bold text-[#C5A059]">12,450 د.ك</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#111111] rounded-lg border border-gray-800">
                      <span className="text-gray-400">ربحك الشهري الأخير:</span>
                      <span className="font-bold text-green-400">+145 د.ك</span>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-blue-400 leading-relaxed">
                        سيتم توزيع العوائد القادمة في تاريخ 1 يوليو 2026. يرجى التأكد من بقاء رصيدك فوق الحد الأدنى.
                      </p>
                    </div>
                  </div>
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white" onClick={() => setActiveDialog(null)}>
                    إغلاق
                  </Button>
                </div>
              )}

              {activeDialog === 'upgrade' && (
                <div className="space-y-6 text-center">
                  <Award className="h-16 w-16 text-[#C5A059] mx-auto" />
                  <h3 className="text-2xl font-bold text-white">طلب ترقية الطبقة</h3>
                  <p className="text-gray-400">ليتم نقلك إلى الطبقة التالية، يجب استيفاء الشروط التالية:</p>
                  <div className="text-right dir-rtl space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span>تخطي 500 نقطة سيادة (محقق)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                      <span>رأس مال مستثمر أكثر من 50,000 د.ك</span>
                    </div>
                  </div>
                  <Button className="w-full bg-[#C5A059] text-black font-bold" onClick={() => setActiveDialog(null)}>
                    إرسال طلب للمراجعة
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
