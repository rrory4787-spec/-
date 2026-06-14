import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Wallet, 
  Award, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  TrendingUp,
  History,
  CreditCard,
  Camera,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  ArrowLeftRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { 
  updateUser, 
  fetchSettings, 
  fetchTransactions, 
  createTransaction, 
  p2pTransfer, 
  getOrCreateAppUser 
} from '../lib/db';

export function ProfileView() {
  const { user, logout, updateUserData } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wallet and Transactions State
  const [walletSettings, setWalletSettings] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'transfer' | 'ledger' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState<'Zain Cash' | 'CliQ'>('Zain Cash');
  const [senderDetails, setSenderDetails] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'Zain Cash' | 'CliQ'>('Zain Cash');
  const [targetDetails, setTargetDetails] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');

  const [p2pEmail, setP2pEmail] = useState('');
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pNotes, setP2pNotes] = useState('');

  // Selected receipt image to zoom
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const refreshWalletData = async () => {
    if (!user) return;
    try {
      setLoadingTxs(true);
      const [settingsData, txsData] = await Promise.all([
        fetchSettings(),
        fetchTransactions(user.User_Email || user.email)
      ]);
      setWalletSettings(settingsData);
      setTransactions(txsData);
    } catch (e) {
      console.error("Error refreshing wallet data:", e);
    } finally {
      setLoadingTxs(false);
    }
  };

  useEffect(() => {
    refreshWalletData();
  }, [user]);

  if (!user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateUser(user.User_Email || user.email, { photoUrl: base64String });
        updateUserData({ photoUrl: base64String });
      } catch (error) {
        console.error("Failed to update photo:", error);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReceiptPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      setModalError("يرجى إدخال مبلغ صحيح أكبر من الصفر");
      return;
    }
    if (!senderDetails) {
      setModalError("يرجى إدخال اسم أو رقم الهاتف المحوّل منه");
      return;
    }
    if (!refNumber) {
      setModalError("يرجى إدخال رقم العملية / المرجع لإثبات الحوالة يدوياً");
      return;
    }

    setModalLoading(true);
    setModalError(null);
    try {
      await createTransaction({
        userEmail: user.User_Email || user.email,
        userName: user.User_Name || user.name,
        type: 'deposit',
        amount: Number(depositAmount),
        method: depositMethod,
        referenceNumber: refNumber,
        senderDetails: senderDetails,
        receiptImg: receiptBase64 || undefined,
        notes: "إيداع يدوي بانتظار المراجعة والاعتماد"
      });

      setModalSuccess("تم إرسال طلب الإيداع بنجاح! سيقوم مدراء مجتمع خزائن الأرض بتأكيد الإيداع في رصيدك فور مراجعة الحوالة المالية.");
      setDepositAmount('');
      setSenderDetails('');
      setRefNumber('');
      setReceiptBase64(null);
      
      // Reload Wallet settings & transactions
      refreshWalletData();
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ أثناء إرسال طلب التمويل");
    } finally {
      setModalLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = Number(withdrawAmount);
    if (!withdrawAmount || cleanAmount <= 0) {
      setModalError("يرجى تحديد مبلغ سحب صحيح");
      return;
    }
    if (cleanAmount > (user.Capital_Amount || 0)) {
      setModalError("رصيدك الحالي غير كافٍ لإتمام طلب السحب هذا");
      return;
    }
    if (!targetDetails) {
      setModalError("يرجى إدخال تفاصيل المحفظة المستهدفة (اسمك ورقم هاتفك أو ألياس كليك الخاص بك)");
      return;
    }

    setModalLoading(true);
    setModalError(null);
    try {
      await createTransaction({
        userEmail: user.User_Email || user.email,
        userName: user.User_Name || user.name,
        type: 'withdrawal',
        amount: cleanAmount,
        method: withdrawMethod,
        targetDetails: targetDetails,
        notes: withdrawNotes || "سحب مالي يدوي"
      });

      setModalSuccess("تم تقديم طلب السحب وحجز الرصيد بنجاح! سيتم تحويل القيمة إلى حسابك يدوياً قريباً من قبل إدارة المجتمع.");
      setWithdrawAmount('');
      setTargetDetails('');
      setWithdrawNotes('');

      // Refresh User capital amount in both Context and State
      const updatedUser = await getOrCreateAppUser(user.User_Email || user.email, user.User_Name);
      updateUserData({ Capital_Amount: updatedUser.Capital_Amount });
      
      refreshWalletData();
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ أثناء معالجة طلب السحب");
    } finally {
      setModalLoading(false);
    }
  };

  const handleP2pSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = Number(p2pAmount);
    if (!p2pEmail) {
      setModalError("يرجى إدخال البريد الإلكتروني للطرف المستلم");
      return;
    }
    if (!p2pAmount || cleanAmount <= 0) {
      setModalError("يرجى كتابة مبلغ التحويل بشكل صحيح");
      return;
    }
    if (cleanAmount > (user.Capital_Amount || 0)) {
      setModalError("رصيد محفظتك الحالي أقل من قيمة التحويل المطلوبة");
      return;
    }

    setModalLoading(true);
    setModalError(null);
    try {
      await p2pTransfer(
        user.User_Email || user.email,
        p2pEmail.trim().toLowerCase(),
        cleanAmount,
        p2pNotes
      );

      setModalSuccess(`تم تحويل ${cleanAmount} ${walletSettings?.currencySymbol || 'د.أ'} بنجاح وفوراً إلى الحساب المالي المربوط بالبريد: ${p2pEmail}`);
      setP2pEmail('');
      setP2pAmount('');
      setP2pNotes('');

      // Refresh states
      const updatedUser = await getOrCreateAppUser(user.User_Email || user.email, user.User_Name);
      updateUserData({ Capital_Amount: updatedUser.Capital_Amount });
      
      refreshWalletData();
    } catch (err: any) {
      setModalError(err.message || "فشلت عملية التحويل، يرجى التأكد من أن حساب البريد المدخل مسجل في مجتمع خزائن الأرض ورصيدك كافٍ.");
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = (type: 'deposit' | 'withdraw' | 'transfer' |'ledger') => {
    setModalError(null);
    setModalSuccess(null);
    setActiveModal(type);
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] p-4 pb-28 md:p-6 md:pb-12 flex flex-col gap-8 overflow-y-auto max-w-4xl mx-auto w-full custom-scrollbar">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-[#C5A059] rounded-full" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tighter italic">الحساب الشخصي والسيادة المالية</h2>
        </div>
        <Button variant="outline" onClick={logout} className="border-red-500/20 text-red-500 hover:bg-red-500/10 gap-1 sm:gap-2 text-xs sm:text-sm">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 bg-[#111111] border-gray-800">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <img 
                src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.User_Name)}&background=C5A059&color=121212`} 
                alt={user.User_Name} 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#C5A059]/50 shadow-lg"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-[#C5A059] rounded-lg text-black">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{user.User_Name || user.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{user.User_Email || user.email}</p>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] text-gray-500 hover:text-[#C5A059] mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              تغيير الصورة الشخصية
            </Button>
            
            <div className="grid grid-cols-1 w-full gap-2 mt-4">
              <div className="p-3 rounded-xl bg-black border border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase font-bold">طبقة الاستثمار</p>
                <p className="text-[#C5A059] font-black">{user.Investment_Layer}</p>
              </div>
              <div className="p-3 rounded-xl bg-black border border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase font-bold">نقاط السيادة</p>
                <p className="text-white font-black">{user.Sovereignty_Points}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Details & P2P / manual deposit actions */}
        <Card className="md:col-span-2 bg-[#111111] border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#C5A059]" />
              المحفظة الاستثمارية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-6 rounded-2xl border border-[#C5A059]/20 flex justify-between items-end relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-3xl" />
               <div>
                 <p className="text-xs text-gray-400 mb-2 font-black uppercase">إجمالي رأس المال المتوفر</p>
                 <p className="text-2xl md:text-4xl font-black text-white italic tracking-tighter">
                   {(user.Capital_Amount || 0).toLocaleString()} <span className="text-lg text-[#C5A059] not-italic font-bold">{walletSettings?.currencySymbol || "د.أ"}</span>
                 </p>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-1.5 text-green-400 font-bold text-sm bg-green-500/10 px-3 py-1 rounded-full">
                   <TrendingUp className="h-3.5 w-3.5" />
                   +12.4%
                 </div>
               </div>
            </div>

            {/* Quick Actions Grid for deposits, withdrawals, transfers, and records */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               <Button 
                 onClick={() => openModal('deposit')}
                 className="h-16 bg-[#C5A059] text-black font-black text-xs sm:text-sm gap-2 rounded-xl hover:bg-[#C5A059]/90 flex-col py-2"
               >
                 <CreditCard className="h-5 w-5" />
                 إيداع تمويل
               </Button>
               <Button 
                 onClick={() => openModal('withdraw')}
                 variant="outline" 
                 className="h-16 border-gray-800 text-white hover:bg-white/5 font-bold text-xs sm:text-sm gap-2 rounded-xl flex-col py-2"
               >
                 <ArrowDownLeft className="h-5 w-5 text-red-500" />
                 طلب سحب
               </Button>
               <Button 
                 onClick={() => openModal('transfer')}
                 variant="outline" 
                 className="h-16 border-gray-800 text-white hover:bg-white/5 font-bold text-xs sm:text-sm gap-2 rounded-xl flex-col py-2"
               >
                 <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                 تحويل داخلي
               </Button>
               <Button 
                 onClick={() => openModal('ledger')}
                 variant="outline" 
                 className="h-16 border-gray-800 text-white hover:bg-white/5 font-bold text-xs sm:text-sm gap-2 rounded-xl flex-col py-2"
               >
                 <History className="h-5 w-5 text-emerald-500" />
                 سجل العمليات
               </Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-400">تحليلات السيادة</h4>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">التقدم نحو الطبقة التالية</span>
                    <span className="text-[#C5A059]">65%</span>
                  </div>
                  <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-gray-900">
                    <div className="h-full bg-[#C5A059] w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings Placeholder */}
      <Card className="bg-[#111111] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            إرشاد استخدام حساب المحفظة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-gray-400 leading-relaxed">
          <p>
            تعتمد محفظتك حالياً على نظام <strong className="text-white">التحويلات اليدوية والسيادية الحقيقية</strong> عبر محفظة 
            <strong className="text-white"> زين كاش (Zain Cash) </strong> ونظام <strong className="text-white"> كليك (CliQ) </strong> في الأردن. 
          </p>
          <p>
            بمجرد قيامك بالتحويل اليدوي من حسابك الشخصي إلى حساب الإدارة، يرجى ملء "نموذج الإيداع" بوضوح وإرفاق رقم المرجع 
            وصورة من إيصال الدفع. بمجرد تأكيد مدير النظام للحوالة في لوحة التحكم، سيتم تفعيل المبلغ في حسابك الاستثماري فورياً.
          </p>
        </CardContent>
      </Card>

      {/* Modals Container */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-all overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-gray-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-8"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-black/40">
                <div className="flex items-center gap-3">
                  <Coins className="h-6 w-6 text-[#C5A059]" />
                  <h3 className="text-lg font-black text-white">
                    {activeModal === 'deposit' && 'إيداع تمويل للمحفظة'}
                    {activeModal === 'withdraw' && 'تقديم طلب سحب مالي'}
                    {activeModal === 'transfer' && 'تحويل داخلي فوري'}
                    {activeModal === 'ledger' && 'سجل العمليات والتدقيق المالي'}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {modalError && (
                  <div className="mb-4 flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold font-sans">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{modalError}</p>
                  </div>
                )}

                {modalSuccess && (
                  <div className="mb-4 flex items-start gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{modalSuccess}</p>
                  </div>
                )}

                {/* DEPOSIT FORM */}
                {activeModal === 'deposit' && !modalSuccess && (
                  <form onSubmit={handleDepositSubmit} className="space-y-6">
                    {/* Instructions Box */}
                    <div className="p-4 rounded-2xl bg-black border border-gray-800 space-y-3">
                      <div className="flex items-center gap-1 text-[#C5A059] font-black text-xs">
                        <Info className="h-4 w-4" />
                        بيانات تحويل الإدارة للربط اليدوي والشخصي:
                      </div>
                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex justify-between border-b border-gray-900 pb-1.5">
                          <span className="text-gray-500">اسم المستفيد المستهدف:</span>
                          <span className="font-bold text-white">{walletSettings?.clioName || "الخزائن الأرض للتمويل الذاتي"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-900 pb-1.5">
                          <span className="text-gray-500">رقم زين كاش (Zain Cash):</span>
                          <span className="font-bold font-mono text-[#C5A059] text-sm">{walletSettings?.clioPhone || "0790000000"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ألياس كليك (CliQ Alias Check):</span>
                          <span className="font-bold font-mono text-emerald-500">{walletSettings?.clioAlias || "khazain.earth"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Method selector */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDepositMethod('Zain Cash')}
                          className={`h-11 rounded-xl text-xs font-bold transition-all border ${depositMethod === 'Zain Cash' ? 'bg-[#C5A059] text-black border-[#C5A059]' : 'bg-black border-gray-800 text-gray-400 hover:text-white'}`}
                        >
                          زين كاش (Zain Cash)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositMethod('CliQ')}
                          className={`h-11 rounded-xl text-xs font-bold transition-all border ${depositMethod === 'CliQ' ? 'bg-[#C5A059] text-black border-[#C5A059]' : 'bg-black border-gray-800 text-gray-400 hover:text-white'}`}
                        >
                          كليك الأردن (CliQ Jordan)
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">قيمة التمويل د.أ (رأس المال المحوّل)</label>
                        <input
                          type="number"
                          required
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          placeholder="مثال: 50"
                          className="w-full h-11 bg-black border border-gray-800 rounded-xl px-3 text-white text-sm outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">رقم الهاتف المحوّل منه أو الاسم الرباعي للحوالة</label>
                        <input
                          type="text"
                          required
                          value={senderDetails}
                          onChange={e => setSenderDetails(e.target.value)}
                          placeholder="مثال: 0791234567 لزين كاش أو الاسم المسجل بكليك"
                          className="w-full h-11 bg-black border border-gray-800 rounded-xl px-3 text-white text-sm outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">رقم المرجع / الحوالة (TxID)</label>
                        <input
                          type="text"
                          required
                          value={refNumber}
                          onChange={e => setRefNumber(e.target.value)}
                          placeholder="اكتب رقم المرجع المطبوع على الإيصال الرقمي"
                          className="w-full h-11 bg-black border border-gray-800 rounded-xl px-3 text-white text-sm outline-none focus:border-[#C5A059] font-mono"
                        />
                      </div>

                      {/* Receipt Uploader */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">تحميل لقطة شاشة من إشعار التحويل (اختياري)</label>
                        <div className="border border-dashed border-gray-800 hover:border-gray-700 bg-black/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer relative transition-all min-h-[90px]">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleReceiptPhotoUpload} 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {receiptBase64 ? (
                            <div className="flex items-center gap-3">
                              <img src={receiptBase64} className="w-12 h-12 object-cover rounded-lg border border-gray-800" />
                              <div className="text-right">
                                <p className="text-xs font-bold text-green-500">تم اختيار إيصال التحويل</p>
                                <button type="button" onClick={() => setReceiptBase64(null)} className="text-[10px] text-red-500 mt-1 hover:underline">حذف واختيار آخر</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-gray-500" />
                              <span className="text-xs text-gray-500">اسحب أو انقر لرفع صورة إشعار التحويل المالي</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full h-12 bg-[#C5A059] hover:bg-[#C5A059]/90 text-black font-black text-sm rounded-xl gap-2 mt-4"
                    >
                      {modalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تقديم إشعار الإيداع للتأكيد'}
                    </Button>
                  </form>
                )}

                {/* WITHDRAWAL FORM */}
                {activeModal === 'withdraw' && !modalSuccess && (
                  <form onSubmit={handleWithdrawSubmit} className="space-y-6">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-gray-400 leading-relaxed">
                      يرجى الانتباه: عند تقديم طلب السحب، سيتم حجز ومقاصة المبلغ من محفظتك فورياً لضمان معالجته من قبل المشرفين وتحويله لزين كاش أو كليك الخاص بك يدوياً.
                    </div>

                    <div className="space-y-4">
                      {/* Method selector */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('Zain Cash')}
                          className={`h-11 rounded-xl text-xs font-bold transition-all border ${withdrawMethod === 'Zain Cash' ? 'bg-[#C5A059] text-black border-[#C5A059]' : 'bg-black border-gray-800 text-gray-400 hover:text-white'}`}
                        >
                          زين كاش (Zain Cash)
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('CliQ')}
                          className={`h-11 rounded-xl text-xs font-bold transition-all border ${withdrawMethod === 'CliQ' ? 'bg-[#C5A059] text-black border-[#C5A059]' : 'bg-black border-gray-800 text-gray-400 hover:text-white'}`}
                        >
                          كليك الأردن (CliQ Jordan)
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">القيمة د.أ (الحد الأقصى {user.Capital_Amount?.toLocaleString()})</label>
                        <input
                          type="number"
                          required
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          placeholder="اكتب القيمة المراد سحبها"
                          className="w-full h-11 bg-black border border-gray-800 rounded-xl px-3 text-white text-sm outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">تفاصيل حساب الاستلام الشخصي الخاص بك</label>
                        <textarea
                          required
                          value={targetDetails}
                          onChange={e => setTargetDetails(e.target.value)}
                          placeholder="مثال: رقم محفظة زين كاش أو الاسم الكامل وألياس كليك"
                          rows={2}
                          className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-sm outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">ملاحظات إضافية (اختياري)</label>
                        <input
                          type="text"
                          value={withdrawNotes}
                          onChange={e => setWithdrawNotes(e.target.value)}
                          placeholder="أي علامة أو توصية"
                          className="w-full h-11 bg-black border border-gray-800 rounded-xl px-3 text-white text-sm outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full h-12 bg-[#C5A059] hover:bg-[#C5A059]/90 text-black font-black text-sm rounded-xl gap-2 mt-4"
                    >
                      {modalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تقديم طلب السحب المالي'}
                    </Button>
                  </form>
                )}

                {/* P2P INTERNAL TRANSFER */}
                {activeModal === 'transfer' && !modalSuccess && (
                  <form onSubmit={handleP2pSubmit} className="space-y-6">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-gray-400 leading-relaxed">
                      ميزة <strong className="text-white">التحويل الفوري المشترك</strong> تمكنك من تحويل الأموال مباشرة وبشكل لحظي من رصيد محفظتك إلى أي مشترك آخر في مجتمع خزائن الأرض بمجرد إدخال بريده الإلكتروني المسجل!
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">البريد الإلكتروني للطرف المستلم (يجب أن يكون مسجلاً)</label>
                        <input
                          type="email"
                          required
                          value={p2pEmail}
                          onChange={e => setP2pEmail(e.target.value)}
                          placeholder="مثال: recipient@gmail.com"
                          className="w-full h-11 bg-black border border-gray-800 rounded-xl px-3 text-white text-sm outline-none focus:border-[#C5A059] text-left"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">المبلغ د.أ (الحد الأقصى {user.Capital_Amount?.toLocaleString()})</label>
                        <input
                          type="number"
                          required
                          value={p2pAmount}
                          onChange={e => setP2pAmount(e.target.value)}
                          placeholder="قيمة المبلغ المراد تحويله فورا"
                          className="w-full h-11 bg-black border border-gray-800 rounded-xl px-3 text-white text-sm outline-none focus:border-[#C5A059]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400">سبب التحويل أو ملاحظة (تظهر للمستلم)</label>
                        <input
                          type="text"
                          value={p2pNotes}
                          onChange={e => setP2pNotes(e.target.value)}
                          placeholder="مثال: سداد قيمة مشاركة فرصة"
                          className="w-full h-11 bg-black border border-gray-800 rounded-xl px-3 text-white text-sm outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl gap-2 mt-4"
                    >
                      {modalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'إتمام التحويل الفوري الآمن'}
                    </Button>
                  </form>
                )}

                {/* TRANSACTION LEDGER */}
                {activeModal === 'ledger' && (
                  <div className="space-y-4">
                    {loadingTxs ? (
                      <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#C5A059]" />
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center p-8 border border-gray-800 rounded-2xl bg-black">
                        <p className="text-xs text-gray-500">لا يوجد عمليات مسجلة في محفظتك حتى الآن.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((tx: any) => (
                          <div 
                            key={tx.id} 
                            className="p-4 rounded-xl border border-gray-800 bg-black/40 flex items-center justify-between gap-4 font-sans"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-lg text-white ${
                                tx.type === 'deposit' ? 'bg-green-600/10 text-green-500' :
                                tx.type === 'withdrawal' ? 'bg-red-600/10 text-red-500' :
                                tx.type === 'transfer_out' ? 'bg-blue-600/10 text-blue-400' :
                                'bg-emerald-600/10 text-emerald-400'
                              }`}>
                                {tx.type === 'deposit' && <ArrowDownLeft className="h-4.5 w-4.5" />}
                                {tx.type === 'withdrawal' && <ArrowUpRight className="h-4.5 w-4.5" />}
                                {tx.type === 'transfer_out' && <ArrowLeftRight className="h-4.5 w-4.5" />}
                                {tx.type === 'transfer_in' && <ArrowLeftRight className="h-4.5 w-4.5" />}
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                                  <span>
                                    {tx.type === 'deposit' && 'إيداع تمويل'}
                                    {tx.type === 'withdrawal' && 'عملية سحب'}
                                    {tx.type === 'transfer_out' && `رسال لـ (${tx.recipientName || tx.recipientEmail})`}
                                    {tx.type === 'transfer_in' && `استلام من (${tx.senderName || tx.senderEmail})`}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">({tx.method})</span>
                                </div>
                                <div className="text-[10px] text-gray-500 flex flex-col gap-0.5 font-mono">
                                  {tx.createdAt && <span>{new Date(tx.createdAt).toLocaleString('ar-EG')}</span>}
                                  {tx.referenceNumber && <span className="text-yellow-600">رقم المرجع: {tx.referenceNumber}</span>}
                                  {tx.rejectReason && <span className="text-red-500">سبب الرفض: {tx.rejectReason}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              <div className={`text-sm font-black ${
                                tx.type === 'deposit' || tx.type === 'transfer_in' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {tx.type === 'deposit' || tx.type === 'transfer_in' ? '+' : '-'}{tx.amount} {walletSettings?.currencySymbol || "د.أ"}
                              </div>
                              
                              {/* Status Badge */}
                              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                tx.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                tx.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                              }`}>
                                {tx.status === 'approved' && 'مقبول تم التفعيل'}
                                {tx.status === 'rejected' && 'مرفوض'}
                                {tx.status === 'pending' && 'قيد الانتظار'}
                              </div>

                              {tx.receiptImg && (
                                <button 
                                  onClick={() => setPreviewImg(tx.receiptImg)}
                                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-1 shrink-0"
                                >
                                  <FileText className="h-3 w-3" /> عرض الإيصال
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zooms image overlay if they click view Receipt */}
      <AnimatePresence>
        {previewImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
            <div className="relative w-full max-w-lg">
              <button 
                onClick={() => setPreviewImg(null)}
                className="absolute -top-10 left-0 text-white flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-lg"
              >
                <X className="h-4 w-4" /> إغلاق
              </button>
              <img src={previewImg} alt="Receipt Preview" className="w-full max-h-[80vh] object-contain rounded-xl border border-gray-800" />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
