import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState('my-tracker');
  const [lang, setLang] = useState('bn');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('UKF-001');
  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [aidRequests, setAidRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  // User Payment Submit state
  const [trxInput, setTrxInput] = useState('');
  const [activePaymentId, setActivePaymentId] = useState(null);

  // Admin Edit Inline Row States
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editStatus, setEditStatus] = useState('Paid');
  const [editTrxId, setEditTrxId] = useState('');
  const [editDate, setEditDate] = useState('');

  // Forms States
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Aid Request Form
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [aidReason, setAidReason] = useState('');
  const [aidAmount, setAidAmount] = useState('');

  useEffect(() => {
    fetchMembers();
    fetchAllPayments();
    fetchExpenses();
    fetchNotices();
    fetchEvents();
    fetchAidRequests();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchPayments(selectedMember);
    }
  }, [selectedMember]);

  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*').order('member_id', { ascending: true });
    setMembers(data || []);
  };

  const fetchAllPayments = async () => {
    const { data } = await supabase.from('payments').select('*');
    setAllPayments(data || []);
  };

  const fetchPayments = async (memberId) => {
    setLoading(true);
    const { data } = await supabase.from('payments').select('*').eq('member_id', memberId).order('id', { ascending: true });
    setPayments(data || []);
    setLoading(false);
  };

  const fetchExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*').order('id', { ascending: false });
    setExpenses(data || []);
  };

  const fetchNotices = async () => {
    const { data } = await supabase.from('notices').select('*').order('id', { ascending: false });
    setNotices(data || []);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('id', { ascending: false });
    setEvents(data || []);
  };

  const fetchAidRequests = async () => {
    const { data } = await supabase.from('aid_requests').select('*').order('id', { ascending: false });
    setAidRequests(data || []);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === 'ukf2026') {
      setIsAdminLoggedIn(true);
      alert(lang === 'bn' ? 'অ্যাডমিন প্যানেলে সফলভাবে প্রবেশ করেছেন!' : 'Successfully logged in to Admin Panel!');
    } else {
      alert(lang === 'bn' ? 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন (ukf2026)' : 'Wrong password! Enter correct password (ukf2026)');
    }
  };

  const handlePay = async (paymentId) => {
    if (!trxInput) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) দিন!' : 'Please enter Transaction ID!');
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const { error } = await supabase
      .from('payments')
      .update({ status: 'Paid', trx_id: trxInput, payment_date: currentDate })
      .eq('id', paymentId);

    if (!error) {
      alert(lang === 'bn' ? 'পেমেন্ট জমা হয়েছে! অনুমোদনের জন্য অপেক্ষা করুন।' : 'Payment submitted successfully!');
      setTrxInput('');
      setActivePaymentId(null);
      fetchPayments(selectedMember);
      fetchAllPayments();
    }
  };

  const sendWhatsAppAlert = (member, payment) => {
    if (!member.phone || member.phone === 'N/A' || member.phone.includes('X')) {
      alert(lang === 'bn' ? 'সদস্যের সঠিক মোবাইল নম্বর নেই!' : 'No valid mobile number for this member!');
      return;
    }

    let cleanPhone = member.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '88' + cleanPhone;
    }

    const message = `ধন্যবাদ ${member.name}! আপনার ${payment.month}-এর অনুদান ৳${payment.amount} (TrxID: ${payment.trx_id || 'N/A'}) উম্মাহ কল্যাণ ফাউন্ডেশনে সফলভাবে গৃহীত হয়েছে।`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleSubmitAidRequest = async (e) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !aidAmount) {
      alert('সব তথ্য পূরণ করুন!');
      return;
    }

    const { error } = await supabase.from('aid_requests').insert([
      { applicant_name: applicantName, phone: applicantPhone, reason: aidReason, amount_needed: parseFloat(aidAmount) }
    ]);

    if (!error) {
      alert(lang === 'bn' ? 'আপনার আবেদন সফলভাবে জমা হয়েছে।' : 'Application submitted successfully!');
      setApplicantName('');
      setApplicantPhone('');
      setAidReason('');
      setAidAmount('');
      fetchAidRequests();
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) return;

    const { error } = await supabase.from('events').insert([
      { title: eventTitle, event_date: eventDate, location: eventLocation }
    ]);

    if (!error) {
      alert('ইভেন্ট সফলভাবে যুক্ত হয়েছে!');
      setEventTitle('');
      setEventDate('');
      setEventLocation('');
      fetchEvents();
    }
  };

  const startAdminEdit = (payment) => {
    if (!isAdminLoggedIn) {
      alert(lang === 'bn' ? 'আগে অ্যাডমিন প্যানেল থেকে লগইন করুন!' : 'Please login from Admin Panel first!');
      setActiveTab('admin');
      return;
    }
    setEditingPaymentId(payment.id);
    setEditStatus(payment.status);
    setEditTrxId(payment.trx_id || '');
    setEditDate(payment.payment_date === '-' ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : payment.payment_date);
  };

  const saveAdminEdit = async (paymentId) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: editStatus, trx_id: editTrxId, payment_date: editStatus === 'Paid' ? editDate : '-' })
      .eq('id', paymentId);

    if (!error) {
      alert('পেমেন্ট আপডেট হয়েছে!');
      setEditingPaymentId(null);
      fetchPayments(selectedMember);
      fetchAllPayments();
    }
  };

  const downloadReceipt = (p) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${currentMemberObj.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; background-color: #f8fafc; }
            .receipt-box { max-width: 550px; margin: auto; padding: 35px; border: 2px solid #059669; border-radius: 16px; bg: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            h2 { color: #047857; text-align: center; margin-bottom: 4px; font-size: 24px; }
            p.sub { text-align: center; font-size: 13px; color: #64748b; margin-top: 0; }
            .details { margin-top: 25px; width: 100%; border-collapse: collapse; }
            .details td { padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .footer { margin-top: 35px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <h2>উম্মাহ কল্যাণ ফাউন্ডেশন (UKF)</h2>
            <p class="sub">অফিসিয়াল অফলাইন পেমেন্ট রসিদ</p>
            <hr style="border: 0; border-top: 1.5px dashed #059669; margin: 20px 0;">
            <table class="details">
              <tr><td><strong>সদস্য নাম:</strong></td><td>${currentMemberObj.name}</td></tr>
              <tr><td><strong>মেম্বার আইডি:</strong></td><td>${currentMemberObj.member_id}</td></tr>
              <tr><td><strong>মাস:</strong></td><td>${p.month}</td></tr>
              <tr><td><strong>পরিমাণ:</strong></td><td style="color: #059669; font-weight: bold;">৳${p.amount}</td></tr>
              <tr><td><strong>স্ট্যাটাস:</strong></td><td style="color: green; font-weight: bold;">Paid (${p.status})</td></tr>
              <tr><td><strong>পেমেন্ট তারিখ:</strong></td><td>${p.payment_date || '-'}</td></tr>
              <tr><td><strong>TrxID:</strong></td><td><code>${p.trx_id || '-'}</code></td></tr>
            </table>
            <div class="footer">
              <p>Developed with ❤️ by Md. Jannatun Naem Refat</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const currentMemberObj = members.find((m) => m.member_id === selectedMember) || {
    name: 'Md. Jannatun Naem Refat',
    member_id: 'UKF-001',
    join_date: 'June 2026',
    phone: '017XXXXXXXX',
    job: 'Student',
    blood_group: 'B+',
    avatar_url: ''
  };

  const totalPersonalPaid = payments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPersonalPending = payments.filter((p) => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const grandTotalFund = allPayments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentBalance = grandTotalFund - totalExpenses;

  const searchResults = searchQuery
    ? allPayments.filter((p) => p.trx_id && p.trx_id.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        {/* Header Hero Banner */}
        <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl px-6 py-6 border-b border-emerald-700/50">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-700/40 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-200 mb-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {lang === 'bn' ? 'যাত্রার সূচনা: জুন ২০২৬ | মাসিক অনুদান: ৳১০০' : 'Started: June 2026 | Monthly Fee: ৳100'}
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                {lang === 'bn' ? 'উম্মাহ কল্যাণ ফাউন্ডেশন' : 'Ummah Kalyan Foundation'}
              </h1>
              <p className="text-xs lg:text-sm text-emerald-100/80 mt-1 max-w-xl">
                {lang === 'bn' ? 'স্বচ্ছতা ও মানবতার সেবায় নিয়োজিত একটি ডিজিটাল ফান্ড ম্যানেজমেন্ট প্ল্যাটফর্ম।' : 'A transparent digital fund management platform dedicated to humanity.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-600/40 transition shadow-inner"
              >
                {lang === 'bn' ? 'English 🌐' : 'বাংলা 🌐'}
              </button>

              <div className="flex flex-wrap justify-center bg-emerald-950/80 p-1.5 rounded-2xl gap-1 text-xs sm:text-sm font-semibold border border-emerald-700/40 shadow-2xl backdrop-blur-md">
                <button onClick={() => setActiveTab('my-tracker')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'my-tracker' ? 'bg-white text-emerald-900 font-extrabold shadow-md' : 'text-emerald-100 hover:text-white'}`}>
                  {lang === 'bn' ? 'মেম্বার ট্র্যাকার' : 'Tracker'}
                </button>
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'overview' ? 'bg-white text-emerald-900 font-extrabold shadow-md' : 'text-emerald-100 hover:text-white'}`}>
                  {lang === 'bn' ? 'সার্বিক ফান্ড' : 'Overview'}
                </button>
                <button onClick={() => setActiveTab('events')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'events' ? 'bg-white text-emerald-900 font-extrabold shadow-md' : 'text-emerald-100 hover:text-white'}`}>
                  {lang === 'bn' ? 'ইভেন্ট' : 'Events'}
                </button>
                <button onClick={() => setActiveTab('aid-form')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'aid-form' ? 'bg-white text-emerald-900 font-extrabold shadow-md' : 'text-emerald-100 hover:text-white'}`}>
                  {lang === 'bn' ? 'সাহায্য' : 'Aid'}
                </button>
                <button onClick={() => setActiveTab('notices')} className={`px-4 py-2 rounded-xl transition relative ${activeTab === 'notices' ? 'bg-white text-emerald-900 font-extrabold shadow-md' : 'text-emerald-100 hover:text-white'}`}>
                  {lang === 'bn' ? 'নোটিশ' : 'Notices'}
                  {notices.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-bounce">{notices.length}</span>}
                </button>
                <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'admin' ? 'bg-white text-emerald-900 font-extrabold shadow-md' : 'text-emerald-100 hover:text-white'}`}>
                  ⚙️ {lang === 'bn' ? 'অ্যাডমিন' : 'Admin'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Global TrxID Search Ribbon */}
        <div className="bg-emerald-950 text-white px-6 py-2.5 border-b border-emerald-800 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-emerald-300 font-medium flex items-center gap-1.5">
              <span>🔍</span> {lang === 'bn' ? 'অনলাইন ট্রানজ্যাকশন সার্চ:' : 'Quick TrxID Lookup:'}
            </span>
            <div className="w-full sm:w-auto relative">
              <input
                type="text"
                placeholder="e.g. BKASH123456"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-1.5 text-xs rounded-lg border border-emerald-700 bg-emerald-900/90 text-white placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono shadow-sm"
              />
            </div>
          </div>
          {searchQuery && (
            <div className="mt-3 bg-white text-slate-800 max-w-2xl mx-auto rounded-xl p-4 shadow-2xl border border-slate-200">
              <p className="font-bold border-b pb-2 mb-2 text-emerald-800 flex justify-between items-center text-xs">
                <span>Search Results for "{searchQuery}"</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">Found {searchResults.length}</span>
              </p>
              {searchResults.length === 0 ? (
                <p className="text-slate-400 text-xs py-2 text-center">No transaction match found.</p>
              ) : (
                searchResults.map((r) => (
                  <div key={r.id} className="flex justify-between items-center border-b border-slate-100 py-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700">Member: {r.member_id}</span>
                      <span className="text-slate-400 ml-2">({r.month})</span>
                    </div>
                    <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">৳{r.amount} - {r.status}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: Member Tracker */}
          {activeTab === 'my-tracker' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Member List */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 lg:col-span-1 h-fit">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    {lang === 'bn' ? `সদস্য তালিকা (${members.length})` : `Members (${members.length})`}
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {members.map((m) => (
                    <button
                      key={m.member_id}
                      onClick={() => setSelectedMember(m.member_id)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-3 ${
                        selectedMember === m.member_id
                          ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-md scale-[1.01]'
                          : 'bg-slate-50 text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-900 border border-slate-100'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${selectedMember === m.member_id ? 'bg-emerald-900 border-emerald-400 text-white' : 'bg-emerald-100 border-emerald-200 text-emerald-800'}`}>
                        {m.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="font-bold truncate">{m.name}</p>
                        <p className={`text-[10px] font-mono ${selectedMember === m.member_id ? 'text-emerald-200' : 'text-slate-400'}`}>{m.member_id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Selected Member Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-600/20 border-2 border-white">
                    {currentMemberObj.name ? currentMemberObj.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-800">{currentMemberObj.name}</h2>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md w-fit mx-auto md:mx-0">{currentMemberObj.member_id}</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3 text-xs font-medium text-slate-600">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">📱 {currentMemberObj.phone || 'N/A'}</span>
                      <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">💼 {currentMemberObj.job || 'N/A'}</span>
                      <span className="bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-lg border border-rose-200">🩸 {currentMemberObj.blood_group || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Payment Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xl">💳</div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট পরিশোধিত' : 'Total Paid'}</p>
                      <p className="text-xl font-black text-emerald-600">৳{totalPersonalPaid}</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3.5 bg-rose-100 text-rose-700 rounded-xl font-bold text-xl">⚠️</div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট বকেয়া' : 'Total Due'}</p>
                      <p className="text-xl font-black text-rose-600">৳{totalPersonalPending}</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3.5 bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xl">📅</div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'যুক্ত হয়েছেন' : 'Joined'}</p>
                      <p className="text-base font-bold text-slate-800">{currentMemberObj.join_date}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Tracker Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-800 text-base">{lang === 'bn' ? 'মাসিক অনুদান ইতিহাস' : 'Monthly Payment History'}</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">{currentMemberObj.name}</span>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center text-slate-400 font-medium">Loading ledger records...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                            <th className="py-3.5 px-6">{lang === 'bn' ? 'মাস' : 'Month'}</th>
                            <th className="py-3.5 px-6">{lang === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                            <th className="py-3.5 px-6">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                            <th className="py-3.5 px-6">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                            <th className="py-3.5 px-6">TrxID</th>
                            <th className="py-3.5 px-6 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                          {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-4 px-6 font-bold text-slate-800">{p.month}</td>
                              <td className="py-4 px-6 font-extrabold text-slate-700">৳{p.amount}</td>

                              {editingPaymentId === p.id ? (
                                <>
                                  <td className="py-4 px-6">
                                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="border text-xs p-1.5 rounded-lg font-semibold">
                                      <option value="Paid">Paid</option>
                                      <option value="Pending">Pending</option>
                                    </select>
                                  </td>
                                  <td className="py-4 px-6"><input type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="border text-xs p-1.5 w-28 rounded-lg" /></td>
                                  <td className="py-4 px-6"><input type="text" value={editTrxId} onChange={(e) => setEditTrxId(e.target.value)} className="border text-xs p-1.5 w-28 rounded-lg font-mono" /></td>
                                  <td className="py-4 px-6 text-right space-x-1">
                                    <button onClick={() => saveAdminEdit(p.id)} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm">Save</button>
                                    <button onClick={() => setEditingPaymentId(null)} className="bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg font-bold">Cancel</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-4 px-6">
                                    {p.status === 'Paid' ? (
                                      <span className="bg-emerald-100 text-emerald-800 text-[11px] px-3 py-1 rounded-full font-bold border border-emerald-200 inline-flex items-center gap-1">✓ Paid</span>
                                    ) : (
                                      <span className="bg-rose-100 text-rose-700 text-[11px] px-3 py-1 rounded-full font-bold border border-rose-200 inline-flex items-center gap-1">! Pending</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-slate-500 font-medium">{p.payment_date || '-'}</td>
                                  <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-600">{p.trx_id || '-'}</td>
                                  <td className="py-4 px-6 text-right space-x-2">
                                    {p.status === 'Pending' && activePaymentId !== p.id && (
                                      <button onClick={() => setActivePaymentId(p.id)} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-sm transition">Pay Now</button>
                                    )}
                                    {activePaymentId === p.id && (
                                      <div className="flex items-center justify-end gap-1">
                                        <input type="text" placeholder="TrxID" value={trxInput} onChange={(e) => setTrxInput(e.target.value)} className="border border-slate-300 px-2.5 py-1 rounded-lg text-xs w-28 font-mono focus:ring-1 focus:ring-emerald-500" />
                                        <button onClick={() => handlePay(p.id)} className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold">Submit</button>
                                      </div>
                                    )}
                                    {p.status === 'Paid' && (
                                      <>
                                        <button onClick={() => downloadReceipt(p)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-bold transition">📥 PDF</button>
                                        <button onClick={() => sendWhatsAppAlert(currentMemberObj, p)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition shadow-sm" title="WhatsApp Alert">💬 WhatsApp</button>
                                      </>
                                    )}
                                    <button onClick={() => startAdminEdit(p)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-2 py-1.5 rounded-lg font-bold transition">✏️ Edit</button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Foundation Overview & Leaderboard */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-700/50 relative overflow-hidden">
                  <p className="text-xs text-emerald-200 uppercase tracking-widest font-bold">মোট সংগৃহীত ফান্ড</p>
                  <h2 className="text-4xl font-black mt-2">৳{grandTotalFund}</h2>
                </div>
                <div className="bg-gradient-to-br from-amber-700 to-orange-800 text-white p-6 rounded-2xl shadow-xl border border-amber-600/50 relative overflow-hidden">
                  <p className="text-xs text-amber-200 uppercase tracking-widest font-bold">মোট খরচ</p>
                  <h2 className="text-4xl font-black mt-2">৳{totalExpenses}</h2>
                </div>
                <div className="bg-gradient-to-br from-cyan-800 to-blue-900 text-white p-6 rounded-2xl shadow-xl border border-cyan-700/50 relative overflow-hidden">
                  <p className="text-xs text-cyan-200 uppercase tracking-widest font-bold">বর্তমান ক্যাশ ব্যালেন্স</p>
                  <h2 className="text-4xl font-black mt-2">৳{currentBalance}</h2>
                </div>
              </div>

              {/* Leaderboard Honor Wall */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <span>🏆</span> সম্মাননা ও লিডারবোর্ড (Donor Wall)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {members.slice(0, 3).map((m, idx) => (
                    <div key={m.member_id} className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl flex items-center gap-3 shadow-xs">
                      <span className="text-3xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <div>
                        <p className="font-extrabold text-sm text-slate-800">{m.name}</p>
                        <p className="text-[11px] text-amber-800 font-bold">নিয়মিত অনুদান প্রদানকারী ({m.member_id})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Summary Ledger Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-extrabold text-slate-800 text-base">সকল সদস্যদের পেমেন্ট সামারি</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold">
                      <th className="py-3.5 px-6">ID</th>
                      <th className="py-3.5 px-6">Name</th>
                      <th className="py-3.5 px-6 text-center">Paid</th>
                      <th className="py-3.5 px-6 text-center">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {members.map((m) => {
                      const memberPaid = allPayments.filter((p) => p.member_id === m.member_id && p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
                      const memberPending = allPayments.filter((p) => p.member_id === m.member_id && p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

                      return (
                        <tr key={m.member_id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 font-mono font-extrabold text-emerald-800">{m.member_id}</td>
                          <td className="py-4 px-6 font-bold text-slate-800">{m.name}</td>
                          <td className="py-4 px-6 text-center font-black text-emerald-600">৳{memberPaid}</td>
                          <td className="py-4 px-6 text-center font-black text-rose-500">৳{memberPending}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Event Calendar */}
          {activeTab === 'events' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <span>📅</span> ইভেন্ট ও মিটিং ক্যালেন্ডার
              </h2>
              {events.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium">কোনো আসন্ন ইভেন্ট পাওয়া যায়নি।</div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-600 border border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{ev.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">📍 স্থান: {ev.location || 'অনলাইন'}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-emerald-200">{ev.event_date}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Public Aid Request Form */}
          {activeTab === 'aid-form' && (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-800 mb-1 flex items-center gap-2">
                <span>🤲</span> সাহায্যের আবেদন ফরম
              </h2>
              <p className="text-xs text-slate-500 mb-6">জরুরি চিকিৎসা, শিক্ষা বা আর্থিক সহায়তার জন্য তথ্য প্রদান করুন।</p>
              <form onSubmit={handleSubmitAidRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">আবেদনকারীর নাম</label>
                  <input type="text" placeholder="আপনার পুরো নাম" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">মোবাইল নম্বর</label>
                  <input type="text" placeholder="017XXXXXXXX" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">প্রয়োজনীয় পরিমাণ (৳)</label>
                  <input type="number" placeholder="5000" value={aidAmount} onChange={(e) => setAidAmount(e.target.value)} className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">আবেদনের কারণ</label>
                  <textarea rows="3" placeholder="বিস্তারিত লিখুন..." value={aidReason} onChange={(e) => setAidReason(e.target.value)} className="w-full border border-slate-300 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 rounded-xl text-sm transition shadow-md">আবেদন জমা দিন</button>
              </form>
            </div>
          )}

          {/* TAB 5: Notice Board */}
          {activeTab === 'notices' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <span>📢</span> নোটিশ বোর্ড
              </h2>
              {notices.map((n) => (
                <div key={n.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-600 border border-slate-200">
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2.5 py-1 rounded-md">{n.date}</span>
                  <p className="text-slate-800 mt-3 text-sm font-medium leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: Admin Panel */}
          {activeTab === 'admin' && (
            <div className="max-w-3xl mx-auto">
              {!isAdminLoggedIn ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-black text-slate-800 mb-4">অ্যাডমিন লগইন</h2>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <input type="password" placeholder="ukf2026" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full border border-slate-300 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-2.5 rounded-xl text-sm shadow-md">Login</button>
                  </form>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Pending Aid Requests */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">📩 প্রাপ্ত সাহায্যের আবেদনসমূহ ({aidRequests.length})</h2>
                    {aidRequests.length === 0 ? (
                      <p className="text-xs text-slate-400">কোনো নতুন আবেদন জমা হয়নি।</p>
                    ) : (
                      aidRequests.map((req) => (
                        <div key={req.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-3 text-xs">
                          <p className="font-extrabold text-slate-800">{req.applicant_name} ({req.phone})</p>
                          <p className="text-emerald-700 font-bold mt-0.5">প্রয়োজন: ৳{req.amount_needed}</p>
                          <p className="text-slate-600 mt-1">কারণ: {req.reason}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Event Form */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">নতুন ইভেন্ট প্রকাশ করুন</h2>
                    <form onSubmit={handleAddEvent} className="space-y-4">
                      <input type="text" placeholder="ইভেন্টের নাম" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="w-full border border-slate-300 px-3.5 py-2 rounded-xl text-sm" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="তারিখ (e.g. 25 Oct 2026)" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full border border-slate-300 px-3.5 py-2 rounded-xl text-sm" />
                        <input type="text" placeholder="স্থান" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="w-full border border-slate-300 px-3.5 py-2 rounded-xl text-sm" />
                      </div>
                      <button type="submit" className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2.5 rounded-xl text-sm shadow-md">ইভেন্ট যুক্ত করুন</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
          <div className="text-center md:text-left">
            <p className="font-extrabold text-sm text-white">উম্মাহ কল্যাণ ফাউন্ডেশন (UKF)</p>
            <p className="mt-1 text-slate-400">একটি অলাভজনক ও জনকল্যাণমূলক সংস্থা | সূচনা: জুন ২০২৬</p>
          </div>
          <p className="font-medium text-slate-400">Developed by <span className="text-white font-bold">Md. Jannatun Naem Refat</span></p>
        </div>
      </footer>
    </div>
  );
}

export default App;