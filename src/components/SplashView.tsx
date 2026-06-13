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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] p-6 text-center overflow-hidden">
      {/* Background Hero Banner inspired by the image */}
      <div className="absolute inset-x-0 top-0 h-[400px] w-full overflow-hidden opacity-50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="w-full h-full bg-[#0A0A0A] flex items-center justify-center relative"
        >
          {/* The sleek gradient bar from the image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[120px] bg-gradient-to-r from-[#C5A059] via-[#34A853] via-[#4285F4] to-[#C5A059] blur-[80px] opacity-20 rotate-[-5deg]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] via-emerald-500 via-blue-500 to-transparent opacity-40 rotate-[-5deg]" />
          
          <h2 className="text-8xl md:text-[10rem] font-black text-white/5 absolute select-none tracking-tighter uppercase italic pointer-events-none">
            REVOLUTION
          </h2>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="mb-10 flex justify-center">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-32 h-32 rounded-3xl border-2 border-[#C5A059]/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(197,160,89,0.2)] bg-[#111]"
          >
            <img 
              src={logoUrl || "/src/assets/images/app_logo_coin_v3_1781318698537.jpg"} 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter italic uppercase leading-none">
          حوّل <span className="text-[#C5A059]">أفكارك الجريئة</span> <br />
          إلى واقع سيادي
        </h1>
        
        <p className="text-gray-400 mb-12 text-xl font-medium tracking-wide max-w-lg mx-auto leading-relaxed">
          الأداة الأسرع لتحويل الرؤى الاستثمارية إلى تمكين حقيقي. <br />
          انضم إلينا في مجتمع "خزائن الأرض".
        </p>

        <div className="flex flex-col gap-6 max-w-md mx-auto">
          <Button 
            onClick={onActivate}
            className="w-full bg-white text-black h-20 rounded-3xl font-black text-2xl gap-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-[1.03] active:scale-[0.97] transition-all group"
          >
            <Zap className="h-7 w-7 text-[#C5A059] fill-[#C5A059]" />
            تفعيل الوصول الآن
            <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>

          <footer className="flex items-center justify-center gap-6 text-[10px] text-gray-600 font-mono tracking-[0.3em] uppercase">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> 
              Sovereign Secure
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <Lock className="h-3 w-3 text-blue-500" /> 
              Prompt to Asset
            </div>
          </footer>
        </div>
      </motion.div>

      {/* Version badge like the image's small text */}
      <div className="absolute bottom-12 text-[10px] text-gray-700 font-mono uppercase tracking-[0.5em] italic">
        KHAZAIN AL-ARD SYTEMS • v4.2.0 • AI STUDIO INTEGRATED
      </div>
    </div>
  );
}
