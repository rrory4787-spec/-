/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
import { NotificationCenter } from './components/NotificationCenter';
import { Toaster } from 'sonner';
import { MOCK_USER, MOCK_POSTS, MOCK_MEMBERS } from './lib/mock';
import { useAuth } from './contexts/AuthContext';
import { subscribeToPosts, createPost, likePost, deletePost, fetchFeed, fetchSettings, getOrCreateAppUser } from './lib/db';
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
  Briefcase
} from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [appSettings, setAppSettings] = useState<{ logoUrl: string } | null>(null);
  const [currentView, setCurrentView] = useState<'feed' | 'portal' | 'partners' | 'sovereignty' | 'profile' | 'messages' | 'admin'>('feed');

  useEffect(() => {
    // Fetch global settings
    fetchSettings().then(setAppSettings);

    // Check if firebase is configured
    import('@/firebase-applet-config.json').then(config => {
      if (config.apiKey !== 'placeholder') {
        setIsFirebaseReady(true);
      }
    });

    const unsubscribe = subscribeToPosts(setPosts);
    return () => unsubscribe();
  }, []);

  const { user, login, logout, activate, isLoading } = useAuth();
  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    if (user?.email) {
      getOrCreateAppUser(user.email, user.displayName || 'عميل جديد').then(data => {
        // Auto-grant admin role for specific email to ensure control
        if (user.email === 'admin@americanaash.com') {
          data.role = 'admin';
          data.Investment_Layer = 'Layer_700'; // Full access
        }
        setActiveUser(data);
      });
    } else {
      setActiveUser(null);
    }
  }, [user]);

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 text-center overflow-hidden">
        {/* Dynamic Background Banner */}
        <div className="absolute inset-x-0 top-0 h-[50%] w-full overflow-hidden opacity-30">
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
          className="relative z-10 max-w-2xl w-full"
        >
          <div className="mb-12 flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-40 w-40 items-center justify-center rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(197,160,89,0.15)] border-2 border-[#C5A059]/10 bg-[#111]"
            >
              <img 
                src={appSettings?.logoUrl || "/src/assets/images/app_logo_coin_v3_1781318698537.jpg"} 
                alt="Khazain Al-Ard Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
          
          <h1 className="mb-6 text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none">
            خزائن <span className="text-[#C5A059]">الأرض</span>
          </h1>
          
          <p className="mb-14 max-w-md mx-auto text-gray-500 font-medium leading-relaxed text-xl">
            البوابة الرقمية لمجتمع السيادة والتمكين. <br />
            تواصل، شارك، واستثمر في مستقبل واعد.
          </p>

          <button 
            onClick={login}
            className="group relative inline-flex items-center gap-6 overflow-hidden rounded-[2rem] bg-white px-16 py-7 font-black text-black transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(255,255,255,0.05)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <LogIn className="h-7 w-7 text-[#C5A059]" />
            <span className="text-2xl">تسجيل الدخول للمجتمع</span>
          </button>

          <div className="mt-16 flex items-center justify-center gap-8 text-[11px] text-gray-700 font-mono tracking-[0.3em] uppercase italic">
            <span className="flex items-center gap-2 animate-pulse"><Zap className="h-3 w-3 text-[#C5A059]"/> Decentralized</span>
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
                // Refresh is handled by subscription
              }}
              onLike={async (postId) => {
                await likePost(postId, activeUser.email);
              }}
              onDelete={async (postId) => {
                await deletePost(postId, activeUser.email);
              }}
            />
          ) : currentView === 'portal' ? (
            <PortalView user={activeUser} onBack={() => setCurrentView('feed')} />
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
                  <h2 className="text-5xl font-black text-[#C5A059] italic tracking-tighter uppercase">نبض المجتمع السيادي</h2>
                </div>
                <p className="text-gray-400 max-w-2xl text-lg font-medium">أحدث التحليلات، التوصيات، والفرص الاستثمارية لشركاء خزائن الأرض.</p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} onLike={() => likePost(post.id, activeUser.email)} />
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

