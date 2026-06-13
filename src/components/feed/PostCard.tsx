import { Post } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
  isLiked?: boolean;
  isWatched?: boolean;
  onLike?: () => void | Promise<void>;
  onComment?: () => void | Promise<void>;
  onWatch?: () => void | Promise<void>;
}

export function PostCard({ post, isLiked, isWatched, onLike, onComment, onWatch }: PostCardProps) {
  return (
    <Card className="mb-4 overflow-hidden border-gray-800 bg-[#121212] rounded-2xl text-white shadow-lg transition-all hover:border-[#C5A059]/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-full bg-[#1A1A1A] border border-gray-700 flex items-center justify-center text-[#C5A059] font-bold overflow-hidden transition-transform hover:scale-105">
            <Avatar className="h-full w-full">
              <AvatarImage src={post.authorPhotoUrl} alt={post.authorName} />
              <AvatarFallback className="bg-[#1A1A1A] text-[#C5A059]">
                {post.authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">{post.authorName}</h4>
              <span className="px-2 py-0.5 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[9px] font-bold border border-[#C5A059]/20">
                {post.Post_Category || 'نبض السوق'}
              </span>
              {post.Allowed_Layer && post.Allowed_Layer !== 'All' && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20">
                  {post.Allowed_Layer}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500">
              {typeof post.createdAt === 'number' 
                ? formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ar })
                : new Date(post.createdAt).toLocaleDateString('ar-EG')} • {post.authorId === 'current-user' ? 'مسؤول' : 'عضو'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-white">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="px-6 pb-4 pt-0">
        <p className="text-sm leading-relaxed text-gray-300 mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
        
        {post.imageUrl && (
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-800 shadow-inner">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105" 
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {post.videoUrl && (
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-800 shadow-inner bg-black">
            <video 
              src={post.videoUrl} 
              controls 
              className="w-full max-h-[500px]" 
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-6 px-6 py-4 border-t border-gray-800">
        <button 
          className={`flex items-center gap-2 text-xs transition-colors ${isLiked ? 'text-[#C5A059]' : 'text-gray-500 hover:text-[#C5A059]'}`}
          onClick={onLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>إعجاب ({post.likesCount})</span>
        </button>
        
        <button 
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#C5A059] transition-colors"
          onClick={onComment}
        >
          <MessageCircle className="h-4 w-4" />
          <span>تعليق ({post.commentsCount})</span>
        </button>

        <button 
          className={`flex items-center gap-2 text-xs transition-colors ${isWatched ? 'text-[#C5A059]' : 'text-gray-500 hover:text-[#C5A059]'}`}
          onClick={onWatch}
          title={isWatched ? 'إلغاء المتابعة' : 'متابعة المنشور'}
        >
          {isWatched ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{isWatched ? 'متابع' : 'متابعة'}</span>
        </button>
        
        <button 
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#C5A059] transition-colors"
          onClick={() => {
            const waNumber = '962782566058';
            const waText = `📝 *تحقق من هذا المنشور في مجتمع خزائن الأرض:*\n\n${post.content}\n\n📎 رابط التطبيق: ${window.location.origin}`;
            window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`, '_blank');
          }}
        >
          <Share2 className="h-4 w-4" />
          <span>مشاركة واتساب</span>
        </button>
      </CardFooter>
    </Card>
  );
}
