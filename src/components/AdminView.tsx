import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Upload, 
  Image as ImageIcon,
  Save,
  Loader2,
  CheckCircle2,
  Plus,
  Video,
  FileText,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchSettings, updateSettings, createPost, fetchFeed } from '../lib/db';
import { Post, User } from '../types';

interface AdminViewProps {
  user: User;
  onSettingsUpdate: (settings: { logoUrl: string }) => void;
}

export function AdminView({ user, onSettingsUpdate }: AdminViewProps) {
  const [settings, setSettings] = useState<{ logoUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newLogo, setNewLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audit Log State
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  // New Post State
  const [showAddPost, setShowAddPost] = useState(false);
  const [postDraft, setPostDraft] = useState<Partial<Post>>({
    title: '',
    content: '',
    category: 'Modern',
    year: '2026'
  });
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchSettings(),
      fetchFeed(true)
    ]).then(([settingsData, postsData]) => {
      setSettings(settingsData);
      setAllPosts(postsData);
      setLoading(false);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    if (!newLogo) return;
    setSavingSettings(true);
    try {
      await updateSettings({ logoUrl: newLogo });
      setSettings({ logoUrl: newLogo });
      onSettingsUpdate({ logoUrl: newLogo });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddPost = async () => {
    if (!postDraft.title || !postDraft.content || !user) return;
    setPostLoading(true);
    try {
      // The content can combine title and content if desired, or we just pass content
      const fullContent = `${postDraft.title}\n\n${postDraft.content}`;
      await createPost(user as any, fullContent, postDraft.category, 'All', postDraft.imageUrl || postDraft.mediaUrl, postDraft.videoUrl);
      setShowAddPost(false);
      setPostDraft({ title: '', content: '', category: 'Modern', year: '2026', imageUrl: '', videoUrl: '', mediaUrl: '' });
      // Refresh feed in log
      const postsData = await fetchFeed(true);
      setAllPosts(postsData);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setPostLoading(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#0A0A0A]">
      <Loader2 className="h-8 w-8 animate-spin text-[#C5A059]" />
    </div>
  );

  return (
    <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col gap-8 overflow-y-auto max-w-5xl mx-auto w-full custom-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-red-600 rounded-full" />
          <h2 className="text-3xl font-bold text-white tracking-tighter italic">مركز التحكم والسيادة السيبرانية</h2>
        </div>
        <Button 
          onClick={() => setShowAddPost(!showAddPost)}
          className="bg-[#C5A059] text-black hover:bg-[#B48F48] h-12 px-6 rounded-xl font-bold gap-2"
        >
          {showAddPost ? <Settings className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {showAddPost ? 'إدارة الهوية' : 'إضافة فرصة للحائط'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {!showAddPost ? (
          <Card className="bg-[#111111] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#C5A059]" />
                هوية التطبيق (Logo)
              </CardTitle>
              <CardDescription className="text-gray-500 text-right">
                تغيير الشعار الرئيسي لمجتمع خزائن الأرض. سيتم تحديثه فوراً في واجهات المجتمع.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-8 border border-gray-800 p-6 rounded-3xl bg-black/40">
                <div className="space-y-2 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-black">الشعار الحالي</p>
                  <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-gray-800 bg-black p-3 shadow-2xl">
                    <img src={settings?.logoUrl} alt="Current Logo" className="w-full h-full object-contain" />
                  </div>
                </div>

                {newLogo && (
                  <div className="space-y-2 text-center animate-in fade-in slide-in-from-left-4">
                    <p className="text-[10px] text-green-500 uppercase font-black">المعاينة الجديدة</p>
                    <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-green-500/50 bg-black p-3 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <img src={newLogo} alt="New Logo Preview" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col gap-4 w-full">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/5 border border-gray-800 hover:bg-white/10 text-white h-14 rounded-2xl gap-3 text-lg"
                  >
                    <Upload className="h-6 w-6 text-[#C5A059]" />
                    رفع شعار جديد
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  
                  {newLogo && (
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="bg-[#C5A059] text-black h-14 rounded-2xl font-black gap-3 text-lg shadow-xl shadow-[#C5A059]/20"
                    >
                      {savingSettings ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                      اعتماد الشعار الجديد
                    </Button>
                  )}

                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-3 text-green-500 font-bold bg-green-500/10 p-4 rounded-2xl border border-green-500/20"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      تم تحديث الهوية البصرية بنجاح
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="bg-[#111111] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">إضافة منشور سيادي جديد</CardTitle>
                <CardDescription className="text-gray-500 text-right">بث فرصة أو توصية جديدة لأعضاء مجتمع خزائن الأرض.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">عنوان المنشور</label>
                    <Input 
                      value={postDraft.title}
                      onChange={e => setPostDraft({...postDraft, title: e.target.value})}
                      placeholder="مثال: فرصة استثمارية عقارية"
                      className="bg-black border-gray-800 text-white h-12 rounded-xl focus:ring-[#C5A059]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">التصنيف</label>
                    <select 
                      value={postDraft.category}
                      onChange={e => setPostDraft({...postDraft, category: e.target.value as any})}
                      className="w-full bg-black border border-gray-800 text-white h-12 rounded-xl px-4 focus:ring-[#C5A059] outline-none"
                    >
                      <option value="Modern">السيادة</option>
                      <option value="Classic">التمكين</option>
                      <option value="Industrial">نبض السوق</option>
                      <option value="Neo-Classic">توصية خاصة</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400">المحتوى والتفاصيل</label>
                  <Textarea 
                    value={postDraft.content}
                    onChange={e => setPostDraft({...postDraft, content: e.target.value})}
                    placeholder="اكتب تفاصيل الفرصة أو التحليل..."
                    className="bg-black border-gray-800 text-white min-h-[120px] rounded-xl focus:ring-[#C5A059]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> صورة المنشور
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        value={postDraft.imageUrl || postDraft.mediaUrl || ''}
                        onChange={e => setPostDraft({...postDraft, imageUrl: e.target.value, mediaUrl: e.target.value})}
                        placeholder="رابط الصورة أو ارفع ملفاً..."
                        className="bg-black border-gray-800 text-white h-12 rounded-xl flex-1"
                      />
                      <Button 
                        variant="outline" 
                        className="h-12 border-gray-800 hover:bg-white/5"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => setPostDraft({...postDraft, imageUrl: reader.result as string});
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {postDraft.imageUrl && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-800">
                        <img src={postDraft.imageUrl} className="w-full h-full object-cover" />
                        <button onClick={() => setPostDraft({...postDraft, imageUrl: ''})} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X className="h-3 w-3"/></button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                      <Video className="h-4 w-4" /> فيديو المنشور
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        value={postDraft.videoUrl || ''}
                        onChange={e => setPostDraft({...postDraft, videoUrl: e.target.value})}
                        placeholder="رابط الفيديو أو ارفع ملفاً..."
                        className="bg-black border-gray-800 text-white h-12 rounded-xl flex-1"
                      />
                      <Button 
                        variant="outline" 
                        className="h-12 border-gray-800 hover:bg-white/5"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'video/*';
                          input.onchange = (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => setPostDraft({...postDraft, videoUrl: reader.result as string});
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {postDraft.videoUrl && (
                      <div className="text-[10px] text-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> تم اختيار فيديو</div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleAddPost}
                  disabled={postLoading || !postDraft.title}
                  className="w-full bg-[#C5A059] text-black h-14 rounded-2xl font-black text-lg gap-3"
                >
                  {postLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
                  نشر المنشور في الحائط السيادي
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            سجل المراجعة والسيادة (Audit Log)
          </h3>
          <Card className="bg-[#111] border-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-white/5 text-gray-500 uppercase text-[10px] font-black">
                    <tr>
                      <th className="p-4">الناشر</th>
                      <th className="p-4">المحتوى</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {allPosts.map(post => (
                      <tr key={post.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">{post.authorName}</td>
                        <td className="p-4 text-gray-400 max-w-xs truncate">{post.content}</td>
                        <td className="p-4">
                          {post.isDeleted ? (
                            <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">محذوف من المستخدم</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold">نشط</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 text-[10px]">{new Date(post.createdAt || '').toLocaleString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 pb-12">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            أدوات سريعة
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => {
                setShowAddPost(true);
                setPostDraft(prev => ({...prev, category: 'Modern', title: 'تقرير جديد'}));
              }}
              className="flex flex-col items-center justify-center p-6 bg-[#111] border border-gray-800 rounded-3xl hover:bg-white/5 transition-all gap-2 group text-white"
            >
              <FileText className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">التقارير</span>
            </button>
            <button 
              onClick={() => {
                setShowAddPost(true);
                setPostDraft(prev => ({...prev, category: 'Industrial', title: 'صورة جديدة'}));
              }}
              className="flex flex-col items-center justify-center p-6 bg-[#111] border border-gray-800 rounded-3xl hover:bg-white/5 transition-all gap-2 group text-white"
            >
              <Plus className="h-8 w-8 text-[#C5A059] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">صورة جديدة</span>
            </button>
            <button 
              onClick={() => {
                setShowAddPost(true);
                setPostDraft(prev => ({...prev, category: 'Neo-Classic', title: 'فيديو جديد'}));
              }}
              className="flex flex-col items-center justify-center p-6 bg-[#111] border border-gray-800 rounded-3xl hover:bg-white/5 transition-all gap-2 group text-white"
            >
              <Video className="h-8 w-8 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">فيديو جديد</span>
            </button>
            <button 
              onClick={() => {
                // Find all h3 elements and find the one containing "سجل"
                const headings = Array.from(document.querySelectorAll('h3'));
                const auditHeading = headings.find(h => h.textContent?.includes('سجل'));
                if (auditHeading) {
                  auditHeading.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex flex-col items-center justify-center p-6 bg-[#111] border border-gray-800 rounded-3xl hover:bg-red-500/10 transition-all gap-2 group text-white"
            >
              <Trash2 className="h-8 w-8 text-gray-600 group-hover:text-red-500 transition-colors" />
              <span className="text-xs font-bold">الأرشيف</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
