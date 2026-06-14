/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { PostCard } from './components/feed/PostCard';
import { SplashView } from './components/SplashView';
import { FeedView } from './components/FeedView';
import { PortalView } from './components/PortalView';
import { PartnersCouncilView } from './components/PartnersCouncilView';
import { AbsoluteSovereigntyVaultView } from './components/AbsoluteSovereigntyVaultView';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { AdminView } from './components/AdminView';
import { CoursesView } from './components/CoursesView';
import { EventsView } from './components/EventsView';
import { NotificationCenter } from './components/NotificationCenter';
import { Toaster, toast } from 'sonner';
import { MOCK_USER, MOCK_POSTS, MOCK_MEMBERS } from './lib/mock';
import { useAuth } from './contexts/AuthContext';
import { subscribeToPosts, createPost, likePost, deletePost, fetchFeed, fetchSettings, getOrCreateAppUser, toggleWatchPost } from './lib/db';
import { backupPostToGoogleDrive } from './lib/googleDrive';
import { Post, User } from './types';
import { 
  LayoutGrid,
  MessageSquare,
  LogIn,
  Users,
  User as UserIcon,
  Crown,
  ShieldAlert,
  Zap,
  Briefcase,
  GraduationCap,
  Calendar
} from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [appSettings, setAppSettings] = useState<{ logoUrl: string } | null>(() => {
    try {
      const savedLogo = localStorage.getItem('khazain_logo');
      return (savedLogo && typeof savedLogo === 'string' && savedLogo.length < 1500000) ? { logoUrl: savedLogo } : null;
    } catch {
      return null;
    }
  });
  const [currentView, setCurrentView] = useState<'feed' | 'portal' | 'partners' | 'sovereignty' | 'profile' | 'messages' | 'admin' | 'courses' | 'events'>('feed');

  // Direct login form states
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [showDirectLogin, setShowDirectLogin] = useState(false);
  const [directLoginError, setDirectLoginError] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  useEffect(() => {
    // Fetch global settings
    fetchSettings().then(data => {
      try {
        if (data && typeof data.logoUrl === 'string') {
          let localLogo: string | null = null;
          try {
            localLogo = localStorage.getItem('khazain_logo');
          } catch (err) {
            console.error("Failed to read from localStorage:", err);
          }

          const isDefaultServerLogo = !data.logoUrl.startsWith('data:image/');
          const isCustomLocalLogo = localLogo && typeof localLogo === 'string' && localLogo.startsWith('data:image/');
          
          // Only overwrite local custom logo if the server loaded a new custom logo.
          // This preserves custom logo if the server resets back to default.
          if (isCustomLocalLogo && isDefaultServerLogo) {
            // Keep local custom logo
            setAppSettings({ logoUrl: localLogo as string });
          } else {
            setAppSettings(data);
            if (data.logoUrl.length < 1500000) {
              try {
                localStorage.setItem('khazain_logo', data.logoUrl);
              } catch (err) {
                console.error("Failed to write to localStorage (possibly quota exceeded):", err);
              }
            } else {
              // Delete massive local storage copy to free up space
              try {
                localStorage.removeItem('khazain_logo');
              } catch (err) {
                console.error("Failed to clear local storage:", err);
              }
            }
          }
        } else {
          setAppSettings(data || { logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg" });
        }
      } catch (error) {
        console.error("Error processing fetched settings:", error);
        setAppSettings({ logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg" });
      }
    }).catch(err => {
      console.error("Failed to fetch settings:", err);
      setAppSettings({ logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg" });
    });

    // Check if firebase is configured
    import('@/firebase-applet-config.json').then(config => {
      if (config.apiKey !== 'placeholder') {
        setIsFirebaseReady(true);
      }
    });

    const unsubscribe = subscribeToPosts(setPosts);
    return () => unsubscribe();
  }, []);

  const { user, login, loginWithEmail, logout, activate, isLoading, googleAccessToken } = useAuth();
  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    if (user?.email) {
      getOrCreateAppUser(user.email, user.displayName || user.name || 'عميل جديد').then(data => {
        // Auto-grant admin role for specific email to ensure control
        if (user.email === 'admin@americanaash.com') {
          data.role = 'admin';
          data.Investment_Layer = 'Layer_700'; // Full access
        }
        // Preserve active status if already activated locally
        if (user.is_active || data.is_active) {
          data.is_active = true;
        }
        setActiveUser(data);
      });
    } else {
      setActiveUser(null);
    }
  }, [user]);

  const handleDirectLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      setDirectLoginError('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    setIsSubmitLoading(true);
    setDirectLoginError('');
    try {
      const email = authEmail.trim().toLowerCase();
      // Default name to email prefix if not specified
      const name = authName.trim() || email.split('@')[0] || 'عضو المجتمع';
      await loginWithEmail(email, name);
    } catch (err: any) {
      setDirectLoginError(err.message || 'حدث خطأ في عملية الدخول');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-t-2 border-[#C5A059] rounded-full"
        />
      </div>
    );
  }

  // Auth Protection
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 text-center overflow-y-auto">
        {/* Dynamic Background Banner */}
        <div className="absolute inset-x-0 top-0 h-[50%] w-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505]" />
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            className="w-full h-full bg-[#0A0A0A] flex items-center justify-center relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[150px] bg-gradient-to-r from-[#C5A059] via-emerald-500 via-blue-500 via-purple-500 to-[#C5A059] blur-[100px] opacity-20 rotate-[-5deg]" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg w-full py-6 sm:py-12 px-4"
        >
          <div className="mb-6 sm:mb-8 flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(197,160,89,0.15)] border-2 border-[#C5A059]/10 bg-[#111]"
            >
              <img 
                src={appSettings?.logoUrl || "/src/assets/images/app_logo_coin_v3_1781318698537.jpg"} 
                alt="Khazain Al-Ard Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
          
          <h1 className="mb-3 sm:mb-4 text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none font-aref">
            خزائن <span className="text-[#C5A059] bg-gradient-to-r from-[#C5A059] via-[#E2C799] to-[#C5A059] bg-clip-text text-transparent">الأرض</span>
          </h1>
          
          <p className="mb-6 sm:mb-10 max-w-sm mx-auto text-gray-500 font-medium leading-relaxed text-xs sm:text-sm md:text-base">
            البوابة الرقمية لمجتمع السيادة والتمكين. <br />
            تواصل، شارك، واستثمر في مستقبل واعد.
          </p>

          {!showDirectLogin ? (
            <div className="flex flex-col items-center gap-3 sm:gap-4 match-viewport w-full">
              <button 
                onClick={login}
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 sm:gap-4 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white px-6 sm:px-12 py-4 sm:py-5 font-black text-black transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)] text-sm sm:text-lg cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-[#C5A059]" />
                <span>تسجيل الدخول باستخدام Google</span>
              </button>

              <button
                onClick={() => setShowDirectLogin(true)}
                className="text-[#C5A059] hover:text-white transition-colors text-xs sm:text-sm font-bold underline cursor-pointer mt-2"
              >
                الدخول المباشر بالبريد الإلكتروني (بدون Google)
              </button>
            </div>
          ) : (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              onSubmit={handleDirectLoginSubmit}
              className="bg-[#111] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-[#C5A059]/10 text-right shadow-[0_30px_60px_rgba(0,0,0,0.5)] mx-auto w-full max-w-md"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#C5A059] border-b border-gray-800 pb-2">الدخول الفوري الذكي</h2>
              
              <div className="mb-4">
                <label className="block text-xs sm:text-sm text-gray-400 mb-1 font-bold">البريد الإلكتروني الخاص بك</label>
                <input 
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 sm:py-3 bg-[#080808] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#C5A059] text-left text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs sm:text-sm text-gray-400 mb-1 font-bold">الاسم الكامل (اختياري)</label>
                <input 
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="مثال: فاتن عليان"
                  className="w-full px-4 py-2.5 sm:py-3 bg-[#080808] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#C5A059] text-sm"
                />
              </div>

              {directLoginError && (
                <p className="text-red-500 text-xs sm:text-sm mb-4 bg-red-950/30 p-3 rounded-lg border border-red-500/20">{directLoginError}</p>
              )}

              <div className="flex gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="flex-1 bg-[#C5A059] hover:bg-[#D5B069] text-black font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                >
                  {isSubmitLoading ? 'جاري الدخول...' : 'الدخول للمجتمع'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDirectLogin(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all cursor-pointer text-sm"
                >
                  رجوع
                </button>
              </div>
            </motion.form>
          )}

          <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[9px] sm:text-[11px] text-gray-700 font-mono tracking-wider sm:tracking-[0.3em] uppercase italic">
            <span className="flex items-center gap-1.5 animate-pulse"><Zap className="h-3 w-3 text-[#C5A059]"/> Decentralized</span>
            <span className="w-1 h-1 bg-gray-800 rounded-full" />
            <span>Encrypted Ledger</span>
            <span className="w-1 h-1 bg-gray-800 rounded-full" />
            <span>v4.2.0</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-20 w-20 border-2 border-[#C5A059] rounded-full border-t-transparent animate-spin"
        />
      </div>
    );
  }

  // If user is logged in but NOT active, show Mandatory Splash View
  if (activeUser && isFirebaseReady && !activeUser.is_active) {
    return <SplashView onActivate={activate} logoUrl={appSettings?.logoUrl} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] text-white selection:bg-[#C5A059]/30">
      <Toaster position="top-right" theme="dark" richColors />
      <NotificationCenter userEmail={activeUser.email} />
      <Navbar 
        user={activeUser} 
        onLogout={logout} 
        onProfileClick={() => setCurrentView('profile')} 
        onAdminClick={() => setCurrentView('admin')}
        logoUrl={appSettings?.logoUrl}
      />
      
      <main className="flex flex-1 overflow-hidden">
        {/* Navigation Rail */}
        <nav className="hidden w-24 flex-col items-center border-r border-gray-800/50 bg-[#0D0D0D] py-10 lg:flex shrink-0">
          <div className="flex flex-col gap-8">
            <button 
              onClick={() => setCurrentView('feed')}
              className={`p-4 rounded-2xl transition-all duration-300 ${currentView === 'feed' ? 'bg-[#C5A059] text-black shadow-[0_0_30px_rgba(197,160,89,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutGrid className="h-7 w-7" />
            </button>
            <button 
              onClick={() => setCurrentView('portal')}
              className={`p-4 rounded-2xl transition-all duration-300 ${currentView === 'portal' ? 'bg-[#C5A059] text-black shadow-[0_0_30px_rgba(197,160,89,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <Zap className="h-7 w-7" />
            </button>
            <button 
              onClick={() => setCurrentView('partners')}
              className={`p-4 rounded-2xl transition-all duration-300 ${currentView === 'partners' ? 'bg-[#C5A059] text-black shadow-[0_0_30px_rgba(197,160,89,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <Briefcase className="h-7 w-7" />
            </button>
            <button 
              onClick={() => setCurrentView('messages')}
              className={`p-4 rounded-2xl transition-all duration-300 ${currentView === 'messages' ? 'bg-[#C5A059] text-black shadow-[0_0_30px_rgba(197,160,89,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <MessageSquare className="h-7 w-7" />
            </button>
            {activeUser.Investment_Layer === 'Layer_700' && (
              <button 
                onClick={() => setCurrentView('sovereignty')}
                className={`p-4 rounded-2xl transition-all duration-300 ${currentView === 'sovereignty' ? 'bg-purple-600 text-white shadow-[0_0_30px_rgba(147,51,234,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <ShieldAlert className="h-7 w-7" />
              </button>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-8">
            {activeUser.role === 'admin' && (
              <button 
                onClick={() => setCurrentView('admin')}
                className={`p-4 rounded-2xl transition-all duration-300 ${currentView === 'admin' ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                <Crown className="h-7 w-7" />
              </button>
            )}
            <button 
              onClick={() => setCurrentView('profile')}
              className={`p-4 rounded-2xl transition-all duration-300 ${currentView === 'profile' ? 'bg-[#C5A059] text-black shadow-[0_0_30px_rgba(197,160,89,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <UserIcon className="h-7 w-7" />
            </button>
          </div>
        </nav>

        {/* Dynamic Content View */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {currentView === 'feed' ? (
            <FeedView 
              user={activeUser}
              posts={posts}
              onPost={async (content, imageUrl, videoUrl) => {
                await createPost(activeUser as any, content, 'Modern', 'All', imageUrl, videoUrl);
                
                if (googleAccessToken) {
                  toast.loading('جاري نسخ المنشور احتياطياً إلى Google Drive...', { id: 'drive-backup' });
                  const backupRes = await backupPostToGoogleDrive(googleAccessToken, {
                    content,
                    category: 'Modern',
                    authorName: activeUser?.name || activeUser?.User_Name,
                    authorEmail: activeUser?.email,
                    imageUrl,
                    videoUrl
                  });
                  if (backupRes.success) {
                    toast.success('تم النسخ الاحتياطي ومزامنة المنشور إلى Google Drive بنجاح! ☁️', { id: 'drive-backup' });
                  } else {
                    toast.error('لم نتمكن من النسخ الاحتياطي في Google Drive. يرجى مراجعة الصلاحيات.', { id: 'drive-backup' });
                  }
                } else {
                  toast.success('تم النشر بنجاح على التطبيق! (للمزامنة مع Google Drive، يرجى تسجيل الدخول بحساب Google أولاً)');
                }
              }}
              onLike={async (postId) => {
                await likePost(postId, activeUser.email);
              }}
              onDelete={async (postId) => {
                await deletePost(postId, activeUser.email);
              }}
              onWatch={async (postId) => {
                const res = await toggleWatchPost(postId, activeUser.email);
                if (res.success) {
                  // Update local user state to reflect changes immediately
                  const newWatchedIds = res.isWatched 
                    ? [...(activeUser.watchedPostIds || []), postId]
                    : (activeUser.watchedPostIds || []).filter(id => id !== postId);
                  setActiveUser({ ...activeUser, watchedPostIds: newWatchedIds });
                }
              }}
            />
          ) : currentView === 'portal' ? (
            <PortalView user={activeUser} onBack={() => setCurrentView('feed')} onNavigate={setCurrentView as any} />
          ) : currentView === 'courses' ? (
            <CoursesView user={activeUser} onBack={() => setCurrentView('portal')} />
          ) : currentView === 'events' ? (
            <EventsView user={activeUser} onBack={() => setCurrentView('portal')} />
          ) : currentView === 'partners' ? (
            <PartnersCouncilView user={activeUser} onBack={() => setCurrentView('feed')} />
          ) : currentView === 'sovereignty' ? (
            <AbsoluteSovereigntyVaultView user={activeUser} onBack={() => setCurrentView('feed')} />
          ) : currentView === 'profile' ? (
            <ProfileView />
          ) : currentView === 'messages' ? (
            <MessagesView />
          ) : currentView === 'admin' ? (
            <AdminView user={activeUser} onSettingsUpdate={setAppSettings} />
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0A] p-6 lg:p-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-14"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-2 h-10 bg-[#C5A059] rounded-full shadow-[0_0_15px_rgba(197,160,89,0.5)]" />
                  <h2 className="text-2xl md:text-5xl font-black text-[#C5A059] italic tracking-tighter uppercase">نبض المجتمع السيادي</h2>
                </div>
                <p className="text-gray-400 max-w-2xl text-xs md:text-lg font-medium">أحدث التحليلات، التوصيات، والفرص الاستثمارية لشركاء خزائن الأرض.</p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onLike={() => likePost(post.id, activeUser.email)}
                      isWatched={activeUser.watchedPostIds?.includes(post.id)}
                      onWatch={async () => {
                        const res = await toggleWatchPost(post.id, activeUser.email);
                        if (res.success) {
                          const newWatchedIds = res.isWatched 
                            ? [...(activeUser.watchedPostIds || []), post.id]
                            : (activeUser.watchedPostIds || []).filter(id => id !== post.id);
                          setActiveUser({ ...activeUser, watchedPostIds: newWatchedIds });
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-32 text-center border-2 border-dashed border-gray-800/50 rounded-[3rem] bg-white/5">
                    <p className="text-gray-400 italic text-xl">لا توجد منشورات جديدة في تغذية المجتمع حالياً...</p>
                  </div>
                )}
              </div>
              
              <footer className="mt-20 py-10 border-t border-gray-800/50 text-center">
                <p className="text-gray-600 text-sm italic tracking-widest font-mono">مجتمع خزائن الأرض © 2026 - سيادة . تمكين . استدامة</p>
              </footer>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#121212]/95 backdrop-blur-md border-t border-gray-800 flex items-center justify-around px-4 lg:hidden z-40 pb-2">
        <button 
          onClick={() => setCurrentView('feed')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'feed' ? 'text-[#C5A059]' : 'text-gray-500'}`}
        >
          <LayoutGrid className="h-6 w-6" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button 
          onClick={() => setCurrentView('portal')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'portal' ? 'text-[#C5A059]' : 'text-gray-500'}`}
        >
          <Zap className="h-6 w-6" />
          <span className="text-[10px] font-bold">البوابة</span>
        </button>
        <button 
          onClick={() => setCurrentView('messages')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'messages' ? 'text-[#C5A059]' : 'text-gray-500'}`}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-[10px] font-bold">الديوان</span>
        </button>
        <button 
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'profile' ? 'text-[#C5A059]' : 'text-gray-500'}`}
        >
          <UserIcon className="h-6 w-6" />
          <span className="text-[10px] font-bold">حسابي</span>
        </button>
        {activeUser.role === 'admin' && (
          <button 
            onClick={() => setCurrentView('admin')}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === 'admin' ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Crown className="h-6 w-6" />
            <span className="text-[10px] font-bold">الأدمن</span>
          </button>
        )}
      </div>
    </div>
  );
}

