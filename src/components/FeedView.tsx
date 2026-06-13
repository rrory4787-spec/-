import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Video, 
  Send, 
  Smile,
  Zap,
  Globe,
  Trash2,
  MoreVertical,
  X,
  Plus,
  Loader2,
  Eye
} from 'lucide-react';
import { PostCard } from './feed/PostCard';
import { Post, User } from '../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface FeedViewProps {
  user: User;
  posts: Post[];
  onPost: (content: string, imageUrl?: string, videoUrl?: string) => Promise<void>;
  onLike: (postId: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onWatch: (postId: string) => Promise<void>;
}

export function FeedView({ user, posts, onPost, onLike, onDelete, onWatch }: FeedViewProps) {
  const [newPostContent, setNewPostContent] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'watched'>('all');
  const [isPosting, setIsPosting] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 40 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. الحد الأقصى هو 40 ميجابايت.');
        return;
      }
      setIsReadingFile(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedVideo(null); // Clear video if image selected
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setIsReadingFile(false);
        alert('فشل في قراءة الملف.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 45 * 1024 * 1024) {
        alert('حجم الفيديو كبير جداً. الحد الأقصى هو 45 ميجابايت.');
        return;
      }
      setIsReadingFile(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedVideo(reader.result as string);
        setSelectedImage(null); // Clear image if video selected
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setIsReadingFile(false);
        alert('فشل في قراءة الفيديو.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() && !selectedImage && !selectedVideo) return;
    setIsPosting(true);
    try {
      await onPost(newPostContent, selectedImage || undefined, selectedVideo || undefined);
      setNewPostContent('');
      setSelectedImage(null);
      setSelectedVideo(null);
      // Play a subtle sound effect if possible
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {});
      } catch (e) {}
    } catch (error) {
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0A] p-4 lg:p-12 max-w-4xl mx-auto w-full">
      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={imageInputRef} 
        onChange={handleImageSelect} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        onChange={handleVideoSelect} 
        accept="video/*" 
        className="hidden" 
      />

      {/* Sleek Welcome Banner inspired by the image */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 lg:h-80 w-full rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-white/5"
      >
        <div className="absolute inset-0 bg-[#050505]" />
        {/* The sleek gradient bar from the image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[100px] bg-gradient-to-r from-[#C5A059] via-emerald-500 via-blue-500 via-purple-500 to-[#C5A059] blur-[100px] opacity-20 rotate-[-5deg]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] via-emerald-500 via-blue-500 via-purple-500 to-transparent opacity-30 rotate-[-5deg]" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-[#050505] via-transparent to-transparent">
          <motion.h3 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none mb-3"
          >
            حقّق <span className="text-[#C5A059]">أفكارك</span> الثورية
          </motion.h3>
          <p className="text-gray-400 font-medium text-sm lg:text-lg tracking-widest uppercase">The fastest path to sovereignty</p>
        </div>
      </motion.div>

      {/* Page Header (Optional, kept for structure but styled smaller) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-[#C5A059] rounded-full" />
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">حائط السيادة</h2>
        </div>
        <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase flex items-center gap-2">
          <Globe className="h-3 w-3" /> LIVE NETWORK
        </div>
      </motion.div>

      {/* Facebook-style Compose Box */}
      <Card className="bg-[#111111] border-gray-800 rounded-3xl mb-12 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <Avatar className="h-12 w-12 border-2 border-[#C5A059]/30">
              <AvatarImage src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.User_Name || 'U')}&background=C5A059&color=121212`} />
              <AvatarFallback>{(user.name || user.User_Name || 'ع').substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`بماذا تفكر يا ${user.name || 'شريكنا السيادي'}؟`}
                className="w-full bg-transparent border-none focus-visible:ring-0 text-lg resize-none min-h-[100px] text-white placeholder:text-gray-600 p-0"
              />
            </div>
          </div>

          <AnimatePresence>
            {isReadingFile && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-10 bg-black/20 rounded-2xl mb-4 border border-dashed border-gray-800"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-bold">جارٍ جلب الملف من جهازك...</p>
                </div>
              </motion.div>
            )}

            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mt-4 mb-4 rounded-2xl overflow-hidden border border-gray-800"
              >
                <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[400px] object-cover" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full backdrop-blur-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}

            {selectedVideo && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mt-4 mb-4 rounded-2xl overflow-hidden border border-gray-800 bg-black"
              >
                <video src={selectedVideo} controls className="w-full h-auto max-h-[400px]" />
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full backdrop-blur-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="h-[1px] bg-gray-800/50 w-full mb-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              <Button 
                variant="ghost" 
                onClick={() => imageInputRef.current?.click()}
                className="text-gray-400 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-xl gap-2 font-bold px-3 transition-colors"
                title="إضافة صورة"
              >
                <ImageIcon className="h-5 w-5 text-green-500" />
                <span className="hidden sm:inline">صور</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => videoInputRef.current?.click()}
                className="text-gray-400 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-xl gap-2 font-bold px-3 transition-colors"
                title="إضافة فيديو"
              >
                <Video className="h-5 w-5 text-red-500" />
                <span className="hidden sm:inline">فيديو</span>
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-xl gap-2 font-bold px-3 transition-colors">
                <Smile className="h-5 w-5 text-yellow-500" />
                <span className="hidden sm:inline">شعور</span>
              </Button>
            </div>
            
            <Button 
              onClick={handlePostSubmit}
              disabled={(!newPostContent.trim() && !selectedImage && !selectedVideo) || isPosting || isReadingFile}
              className="bg-[#C5A059] hover:bg-[#B48F48] text-black font-black px-8 h-12 rounded-2xl gap-2 shadow-[0_10px_20px_rgba(197,160,89,0.2)] disabled:opacity-50 transition-all hover:scale-105"
            >
              {isPosting ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Send className="h-4 w-4" />}
              {isPosting ? 'جارٍ النشر...' : 'نشر الآن'}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Feed Filters */}
      <div className="flex items-center gap-4 mb-8 bg-[#111] p-1.5 rounded-2xl w-fit border border-gray-800">
        <button 
          onClick={() => setFilterType('all')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'all' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          كل المشاركات
        </button>
        <button 
          onClick={() => setFilterType('watched')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'watched' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          <Eye className="h-4 w-4" />
          المحتوى المتابع
        </button>
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col gap-8">
        {(() => {
          const filteredPosts = filterType === 'all' 
            ? posts 
            : posts.filter(p => user.watchedPostIds?.includes(p.id));

          if (filteredPosts.length > 0) {
            return filteredPosts.map((post) => (
              <div key={post.id} className="relative group">
                <PostCard 
                  post={post} 
                  isWatched={user.watchedPostIds?.includes(post.id)}
                  onLike={() => onLike(post.id)} 
                  onWatch={() => onWatch(post.id)}
                />
                
                {/* Post Actions (Delete) */}
                {(user.role === 'admin' || post.authorEmail === user.email) && (
                  <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-colors outline-none">
                        <MoreVertical className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#1A1A1A] border-gray-800 text-white">
                        <DropdownMenuItem 
                          onClick={() => onDelete(post.id)}
                          className="text-red-500 focus:bg-red-500/10 focus:text-red-500 gap-2 cursor-pointer font-bold"
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف المنشور
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ));
          } else {
            return (
              <div className="py-32 text-center border-2 border-dashed border-gray-800/50 rounded-[3rem] bg-white/5">
                <p className="text-gray-400 italic text-xl">
                  {filterType === 'watched' 
                    ? 'لم تقم بمتابعة أي منشورات بعد...' 
                    : 'لا توجد منشورات جديدة في تغذية المجتمع حالياً...'}
                </p>
              </div>
            );
          }
        })()}
      </div>

      <footer className="mt-20 py-10 border-t border-gray-800/50 text-center">
        <p className="text-gray-600 text-sm italic tracking-widest font-mono">مجتمع خزائن الأرض © 2026 - سيادة . تمكين . استدامة</p>
      </footer>
    </div>
  );
}

// Helper Card component if not imported
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>;
}
