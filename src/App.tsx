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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] p-4 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 flex h-40 w-40 items-center justify-center rounded-full overflow-hidden shadow-[0_0_80px_rgba(197,160,89,0.3)] transition-transform hover:scale-105 duration-500 border-4 border-[#C5A059]/20"
        >
          <img 
            src={appSettings?.logoUrl || "/src/assets/images/app_logo_coin_v3_1781318698537.jpg"} 
            alt="Khazain Al-Ard Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <h1 className="mb-2 text-5xl font-black tracking-tighter text-[#C5A059] uppercase italic">
          خزائن الأرض
        </h1>
        <p className="mb-10 max-w-sm text-gray-400 font-medium leading-relaxed text-lg">
          البوابة الرقمية لمجتمع المستثمرين السياديين. <br />
          تواصل، شارك، واستثمر في مستقبل واعد.
        </p>
        <button 
          onClick={login}
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-[#C5A059] px-12 py-5 font-black text-black transition-all hover:scale-105 hover:bg-white active:scale-95 shadow-[0_20px_40px_rgba(197,160,89,0.2)]"
        >
          <LogIn className="h-6 w-6" />
          <span className="text-xl">تسجيل الدخول للمجتمع</span>
        </button>
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

