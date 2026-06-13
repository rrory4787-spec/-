import React, { useState } from 'react';
import { User } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Video, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreatePostProps {
  user: User;
  onPost: (content: string, category?: string, layer?: string) => Promise<void>;
}

export function CreatePost({ user, onPost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('نبض السوق');
  const [layer, setLayer] = useState('All');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;
    
    setLoading(true);
    try {
      // In a real app, we would upload previewUrl or selectedFile here
      await onPost(content, category, layer);
      setContent('');
      clearFile();
      setIsExpanded(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 bg-[#121212] border border-gray-800 rounded-2xl p-4 shadow-xl">
      <CardContent className="p-0">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 shrink-0 border border-gray-600 overflow-hidden">
            <Avatar className="h-full w-full">
              <AvatarImage src={user.photoUrl} />
              <AvatarFallback className="bg-[#1A1A1A] text-[#C5A059]">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          
                    <div className="flex-1">
                      <Textarea
                        placeholder="ماذا يدور في ذهنك اليوم؟"
                        className="min-h-[40px] w-full bg-[#1A1A1A] border-none rounded-xl px-4 py-2 text-sm text-gray-200 focus:ring-1 focus:ring-[#C5A059] focus-visible:ring-[#C5A059] placeholder:text-gray-500"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                      />
                      
                      {previewUrl && (
                        <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-800">
                          <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                          <button 
                            onClick={clearFile}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
            
                    <AnimatePresence>
                      {(isExpanded || content.length > 0) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-gray-800"
                        >
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-gray-500 font-bold uppercase">التصنيف</label>
                              <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg py-1.5 px-3 text-xs text-gray-300 focus:border-[#C5A059] outline-none"
                              >
                                <option value="نبض السوق">نبض السوق</option>
                                <option value="جدار القبيلة">جدار القبيلة</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-gray-500 font-bold uppercase">وصول الطبقة</label>
                              <select 
                                value={layer} 
                                onChange={(e) => setLayer(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg py-1.5 px-3 text-xs text-gray-300 focus:border-[#C5A059] outline-none"
                              >
                                <option value="All">الجميع</option>
                                <option value="Layer_500">طبقة 500</option>
                                <option value="Layer_700">طبقة 700</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <label className="flex items-center gap-2 text-xs text-gray-400 px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                                <Image className="h-4 w-4" />
                                إضافة صورة
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                              </label>
                              <label className="flex items-center gap-2 text-xs text-gray-400 px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                                <Video className="h-4 w-4" />
                                فيديو
                                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                              </label>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-500 hover:text-white"
                                onClick={() => setIsExpanded(false)}
                              >
                                إلغاء
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-[#C5A059] text-[#121212] font-bold text-xs px-6 py-2 rounded-lg hover:bg-[#C5A059]/90 disabled:opacity-50"
                                disabled={!content.trim() || loading}
                                onClick={handleSubmit}
                              >
                                {loading ? 'جاري النشر...' : 'نشر'}
                                <Send className="h-4 w-4 mr-2" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
  );
}
