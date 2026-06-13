import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Users,
  ChevronRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Event, User } from '../types';
import { fetchEvents, toggleAttendance } from '../lib/db';

interface EventsViewProps {
  user: User;
  onBack: () => void;
}

export function EventsView({ user, onBack }: EventsViewProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await fetchEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleAttend = async (eventId: string) => {
    setUpdatingId(eventId);
    try {
      await toggleAttendance(eventId, user.email);
      await loadEvents();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col gap-8 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-3xl font-bold text-white tracking-tighter">الأجندة والفعاليات</h2>
        </div>
        <Button variant="ghost" onClick={onBack} className="text-gray-500 hover:text-white gap-2">
          <ChevronRight className="h-4 w-4" />
          بوابة العبور
        </Button>
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-white font-bold mb-1">تعليمات الحضور السيادي</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            يرجى تأكيد حضورك للفعاليات قبل موعدها بـ 24 ساعة لضمان ترتيبات الخصوصية والسيادة. جميع المواقع سرية ويتم الكشف عنها للأعضاء المؤكد حضورهم فقط.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-bold">جاري مراجعة الأجندة...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-6">
          {events.map((event) => {
            const isAttending = event.attendees?.includes(user.email);
            const canView = event.allowedLayer === 'All' || user.Investment_Layer === event.allowedLayer || user.role === 'admin';

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className={`bg-[#111111] border-gray-800 transition-all overflow-hidden ${!canView ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 bg-white/5 md:w-32 flex flex-col items-center justify-center border-b md:border-b-0 md:border-l border-gray-800">
                        <span className="text-2xl font-black text-white">{new Date(event.date).getDate()}</span>
                        <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">
                          {new Date(event.date).toLocaleDateString('ar-EG', { month: 'short' })}
                        </span>
                      </div>
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 uppercase">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {event.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {event.location || 'يحدد لاحقاً'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> {event.attendees?.length || 0} حاضرين
                              </span>
                            </div>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20">
                            {event.allowedLayer} Layer
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">
                          {event.description}
                        </p>
                        <div className="pt-4 flex justify-end">
                          <Button 
                            onClick={() => handleAttend(event.id)}
                            disabled={updatingId === event.id}
                            className={`px-8 font-black rounded-xl transition-all ${
                              isAttending 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                : 'bg-[#1A1A1A] hover:bg-[#252525] text-white border border-gray-800'
                            }`}
                          >
                            {updatingId === event.id ? (
                              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : isAttending ? (
                              <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> مؤكد الحضور
                              </span>
                            ) : (
                              'تأكيد الحضور السيادي'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#111] border border-gray-800 rounded-3xl border-dashed">
          <Calendar className="h-16 w-16 text-gray-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">لا يوجد فعاليات حالياً</h3>
          <p className="text-xs text-gray-500">سيتم الإعلان عن الفعاليات القادمة قريباً.</p>
        </div>
      )}
    </div>
  );
}
