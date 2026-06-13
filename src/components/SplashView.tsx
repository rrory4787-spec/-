import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SplashProps {
  onActivate: () => Promise<void>;
  logoUrl?: string;
}

export function SplashView({ onActivate, logoUrl }: SplashProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A059]/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="mb-8 flex justify-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            className="w-40 h-40 rounded-full border-4 border-[#C5A059]/30 overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.3)]"
          >
            <img 
              src={logoUrl || "/src/assets/images/app_logo_coin_v3_1781318698537.jpg"} 
              alt="Commemorative Coin" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter italic">خَزَائِنُ الْأَرْضِ</h1>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C5A059]" />
          <span className="text-[#C5A059] font-mono tracking-[0.3em] text-xs uppercase">Secret Community</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C5A059]" />
        </div>

        <p className="text-gray-400 mb-12 leading-relaxed font-medium">
          أنت الآن على أعتاب الدخول لمجتمع السيادة والتمكين. <br />
          يرجى تفعيل الاتصال المشفر للوصول للمنصة.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={onActivate}
            className="w-full bg-gradient-to-br from-[#C5A059] to-[#8E6D31] text-black h-16 rounded-2xl font-black text-xl gap-3 shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Zap className="h-6 w-6" />
            تفعيل الوصول للمجتمع
          </Button>

          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            <div className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Encrypted</div>
            <div className="flex items-center gap-1"><Lock className="h-3 w-3" /> Anonymous</div>
          </div>
        </div>
      </motion.div>

      {/* Corporate attribution footer */}
      <div className="absolute bottom-8 text-[10px] text-gray-600 font-mono uppercase tracking-widest italic opacity-50">
        Khazain Al-Ard Integration System v4.0
      </div>
    </div>
  );
}
