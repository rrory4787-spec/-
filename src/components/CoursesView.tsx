import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  PlayCircle, 
  Clock, 
  ChevronRight, 
  Lock,
  Search,
  Layout,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Course, User } from '../types';
import { fetchCourses } from '../lib/db';

interface CoursesViewProps {
  user: User;
  onBack: () => void;
}

export function CoursesView({ user, onBack }: CoursesViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses().then(data => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title.includes(searchTerm) || c.description.includes(searchTerm)
  );

  return (
    <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col gap-8 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-500 rounded-full" />
          <h2 className="text-3xl font-bold text-white tracking-tighter">أكاديمية الحيتان</h2>
        </div>
        <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:text-white gap-2">
          <ChevronRight className="h-4 w-4" />
          بوابة العبور
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input 
          type="text"
          placeholder="ابحث عن دورة تدريبية..."
          className="w-full bg-[#111] border border-gray-800 rounded-xl py-4 pr-12 pl-4 text-white outline-none focus:border-blue-500/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-bold">جاري تحميل الدورات السيادية...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const isLocked = course.allowedLayer !== 'All' && user.Investment_Layer !== course.allowedLayer && user.role !== 'admin';
            
            return (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={!isLocked ? { y: -5 } : {}}
              >
                <Card className={`bg-[#111111] border-gray-800 h-full overflow-hidden flex flex-col ${isLocked ? 'opacity-60 grayscale' : 'hover:border-blue-500/30 transition-all'}`}>
                  <div className="aspect-video w-full bg-gray-900 relative">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-800" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                        <Lock className="h-10 w-10 text-[#C5A059]" />
                        <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest bg-black px-3 py-1 rounded-full border border-[#C5A059]/30">
                          {course.allowedLayer} Only
                        </span>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{course.title}</CardTitle>
                    <p className="text-xs text-gray-500 line-clamp-2">{course.description}</p>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Layout className="h-3 w-3" />
                        {course.lessonsCount} درس
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        محتوى مسجل
                      </div>
                    </div>
                    <Button 
                      disabled={isLocked}
                      className={`w-full font-bold gap-2 ${isLocked ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      {isLocked ? 'محتوى مغلق' : 'ابدأ التعلم الآن'}
                      {!isLocked && <PlayCircle className="h-4 w-4" />}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#111] border border-gray-800 rounded-3xl border-dashed">
          <BookOpen className="h-16 w-16 text-gray-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">لا توجد دورات حالياً</h3>
          <p className="text-xs text-gray-500">سيتم إضافة محتوى تعليمي قريباً.</p>
        </div>
      )}
    </div>
  );
}
