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
  const [campaigns, setCampaigns] = useState([]);
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
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberJob, setNewMemberJob] = useState('');
  const [newMemberBlood, setNewMemberBlood] = useState('A+');
  const [newMemberAvatar, setNewMemberAvatar] = useState('');

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  const [noticeText, setNoticeText] = useState('');

  const [campTitle, setCampTitle] = useState('');
  const [campTarget, setCampTarget] = useState('');
  const [campRaised, setCampRaised] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Aid Request Public Form
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [aidReason, setAidReason] = useState('');
  const [aidAmount, setAidAmount] = useState('');

  useEffect(() => {
    fetchMembers();
    fetchAllPayments();
    fetchExpenses();
    fetchNotices();
    fetchCampaigns();
    fetchEvents();
    fetchAidRequests();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchPayments(selectedMember);
    }
  }, [selectedMember]);

  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*').order('id', { ascending: true });
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

  const fetchCampaigns = async () => {
    const { data } = await supabase.from('campaigns').select('*').order('id', { ascending: false });
    setCampaigns(data || []);
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
      alert(lang === 'bn' ? 'পেমেন্ট জমা হয়েছে! অনুমোদনের জন্য ট্র্যাকিংয়ে অপেক্ষা করুন।' : 'Payment submitted successfully!');
      setTrxInput('');
      setActivePaymentId(null);
      fetchPayments(selectedMember);
      fetchAllPayments();
    }
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
      alert(lang === 'bn' ? 'আপনার আবেদন সফলভাবে জমা হয়েছে। অতি শীঘ্রই যোগাযোগ করা হবে।' : 'Application submitted successfully!');
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

  // Inline Admin Edit Actions
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
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .receipt-box { max-width: 600px; margin: auto; padding: 30px; border: 2px solid #047857; border-radius: 10px; }
            h2 { color: #047857; text-align: center; margin-bottom: 5px; }
            .details { margin-top: 20px; width: 100%; border-collapse: collapse; }
            .details td { padding: 10px; border-bottom: 1px solid #ddd; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <h2>উম্মাহ কল্যাণ ফাউন্ডেশন (UKF)</h2>
            <p style="text-align: center; font-size: 12px; color: #555;">অফিসিয়াল পেমেন্ট রসিদ</p>
            <hr style="border: 0; border-top: 1px solid #047857; margin: 20px 0;">
            <table class="details">
              <tr><td><strong>Member ID:</strong></td><td>${currentMemberObj.member_id}</td></tr>
              <tr><td><strong>Member Name:</strong></td><td>${currentMemberObj.name}</td></tr>
              <tr><td><strong>Month:</strong></td><td>${p.month}</td></tr>
              <tr><td><strong>Amount Paid:</strong></td><td>৳${p.amount}</td></tr>
              <tr><td><strong>Status:</strong></td><td style="color: green; font-weight: bold;">Paid (${p.status})</td></tr>
              <tr><td><strong>Payment Date:</strong></td><td>${p.payment_date || '-'}</td></tr>
              <tr><td><strong>TrxID:</strong></td><td>${p.trx_id || '-'}</td></tr>
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

  // Search Results
  const searchResults = searchQuery
    ? allPayments.filter((p) => p.trx_id && p.trx_id.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="bg-emerald-800 text-white shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              {lang === 'bn' ? 'উম্মাহ কল্যাণ ফাউন্ডেশন' : 'Ummah Kalyan Foundation'}
            </h1>
            <p className="text-xs text-emerald-200 mt-0.5">
              {lang === 'bn' ? 'যাত্রার সূচনা: জুন ২০২৬ | মাসিক অনুদান: ৳১০০' : 'Journey Started: June 2026 | Monthly Fee: ৳100'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="bg-emerald-900 text-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-700"
            >
              {lang === 'bn' ? 'English 🌐' : 'বাংলা 🌐'}
            </button>

            <div className="flex flex-wrap bg-emerald-900 p-1 rounded-xl gap-1 text-xs md:text-sm font-medium">
              <button onClick={() => setActiveTab('my-tracker')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'my-tracker' ? 'bg-white text-emerald-800 font-bold' : 'text-emerald-100'}`}>
                {lang === 'bn' ? 'মেম্বার ট্র্যাকার' : 'Tracker'}
              </button>
              <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'overview' ? 'bg-white text-emerald-800 font-bold' : 'text-emerald-100'}`}>
                {lang === 'bn' ? 'সার্বিক ফান্ড' : 'Overview'}
              </button>
              <button onClick={() => setActiveTab('events')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'events' ? 'bg-white text-emerald-800 font-bold' : 'text-emerald-100'}`}>
                {lang === 'bn' ? 'ইভেন্ট ও মিটিং' : 'Events'}
              </button>
              <button onClick={() => setActiveTab('aid-form')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'aid-form' ? 'bg-white text-emerald-800 font-bold' : 'text-emerald-100'}`}>
                {lang === 'bn' ? 'সাহায্যের আবেদন' : 'Aid Request'}
              </button>
              <button onClick={() => setActiveTab('notices')} className={`px-3 py-1.5 rounded-lg relative ${activeTab === 'notices' ? 'bg-white text-emerald-800 font-bold' : 'text-emerald-100'}`}>
                {lang === 'bn' ? 'নোটিশ' : 'Notices'}
                {notices.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">{notices.length}</span>}
              </button>
              <button onClick={() => setActiveTab('admin')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'admin' ? 'bg-white text-emerald-800 font-bold' : 'text-emerald-100'}`}>
                ⚙️ {lang === 'bn' ? 'অ্যাডমিন' : 'Admin'}
              </button>
            </div>
          </div>
        </header>

        {/* Global TrxID Quick Search Bar */}
        <div className="bg-emerald-900 px-6 py-2 border-t border-emerald-700 text-center">
          <div className="max-w-xl mx-auto flex items-center justify-center gap-2">
            <span className="text-xs text-emerald-200">🔍 {lang === 'bn' ? 'দ্রুত TrxID সার্চ:' : 'Quick TrxID Search:'}</span>
            <input
              type="text"
              placeholder="e.g. BKASH123456"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 text-xs rounded border border-emerald-600 bg-emerald-800 text-white focus:outline-none w-48"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 bg-white text-gray-800 max-w-xl mx-auto rounded p-3 text-left shadow-lg text-xs">
              <p className="font-bold border-b pb-1 mb-2 text-emerald-700">Search Results for "{searchQuery}":</p>
              {searchResults.length === 0 ? (
                <p className="text-gray-500">No matching TrxID found.</p>
              ) : (
                searchResults.map((r) => (
                  <div key={r.id} className="flex justify-between border-b py-1">
                    <span>Member: <strong>{r.member_id}</strong> ({r.month})</span>
                    <span className="text-green-600 font-bold">৳{r.amount} - {r.status}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <main className="max-w-7xl mx-auto p-6">
          {/* TAB 1: Individual Tracker with Left Sidebar */}
          {activeTab === 'my-tracker' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:col-span-1 h-fit">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 border-b pb-2">
                  {lang === 'bn' ? `সদস্য বৃন্দ (${members.length})` : `Members (${members.length})`}
                </h2>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {members.map((m) => (
                    <button
                      key={m.member_id}
                      onClick={() => setSelectedMember(m.member_id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-3 ${
                        selectedMember === m.member_id ? 'bg-emerald-700 text-white shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-emerald-50'
                      }`}
                    >
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedMember === m.member_id ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate">{m.name}</p>
                        <p className={`text-[10px] ${selectedMember === m.member_id ? 'text-emerald-200' : 'text-gray-400'}`}>{m.member_id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-6">
                  {currentMemberObj.avatar_url ? (
                    <img src={currentMemberObj.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-600 shadow" />
                  ) : (
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner border-2 border-emerald-600">
                      {currentMemberObj.name ? currentMemberObj.name.charAt(0) : 'U'}
                    </div>
                  )}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold text-gray-800">{currentMemberObj.name}</h2>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">ID: {currentMemberObj.member_id}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-xs text-gray-600 font-medium">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">📱 {currentMemberObj.phone || 'N/A'}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">💼 {currentMemberObj.job || 'N/A'}</span>
                      <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold">🩸 {currentMemberObj.blood_group || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-full">💳</div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">{lang === 'bn' ? 'মোট পরিশোধিত' : 'Total Paid'}</p>
                      <p className="text-md font-bold text-green-600">৳{totalPersonalPaid}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-700 rounded-full">⚠️</div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">{lang === 'bn' ? 'মোট বকেয়া' : 'Total Due'}</p>
                      <p className="text-md font-bold text-red-600">৳{totalPersonalPending}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-full">📅</div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">{lang === 'bn' ? 'যুক্ত হয়েছেন' : 'Joined'}</p>
                      <p className="text-md font-bold text-gray-800">{currentMemberObj.join_date}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">{lang === 'bn' ? 'মাসিক অনুদান ট্র্যাকার' : 'Monthly Donation Tracker'}</h2>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">{currentMemberObj.name}</span>
                  </div>

                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading data...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b">
                            <th className="py-3 px-6">{lang === 'bn' ? 'মাস' : 'Month'}</th>
                            <th className="py-3 px-6">{lang === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                            <th className="py-3 px-6">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                            <th className="py-3 px-6">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                            <th className="py-3 px-6">TrxID</th>
                            <th className="py-3 px-6 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="py-4 px-6 font-medium text-gray-800">{p.month}</td>
                              <td className="py-4 px-6 font-semibold">৳{p.amount}</td>
                              
                              {editingPaymentId === p.id ? (
                                <>
                                  <td className="py-4 px-6">
                                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="border text-xs p-1 rounded">
                                      <option value="Paid">Paid</option>
                                      <option value="Pending">Pending</option>
                                    </select>
                                  </td>
                                  <td className="py-4 px-6"><input type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="border text-xs p-1 w-28 rounded" /></td>
                                  <td className="py-4 px-6"><input type="text" value={editTrxId} onChange={(e) => setEditTrxId(e.target.value)} className="border text-xs p-1 w-28 rounded font-mono" /></td>
                                  <td className="py-4 px-6 text-right flex justify-end gap-2">
                                    <button onClick={() => saveAdminEdit(p.id)} className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded">Save</button>
                                    <button onClick={() => setEditingPaymentId(null)} className="bg-gray-300 text-xs px-2.5 py-1 rounded">Cancel</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-4 px-6">
                                    {p.status === 'Paid' ? (
                                      <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">✓ Paid</span>
                                    ) : (
                                      <span className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">! Pending</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-xs text-gray-600">{p.payment_date || '-'}</td>
                                  <td className="py-4 px-6 font-mono text-xs text-gray-500">{p.trx_id || '-'}</td>
                                  <td className="py-4 px-6 text-right space-x-2">
                                    {p.status === 'Pending' && activePaymentId !== p.id && (
                                      <button onClick={() => setActivePaymentId(p.id)} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded">Pay Now</button>
                                    )}
                                    {activePaymentId === p.id && (
                                      <div className="flex items-center justify-end gap-1">
                                        <input type="text" placeholder="TrxID" value={trxInput} onChange={(e) => setTrxInput(e.target.value)} className="border px-2 py-1 rounded text-xs w-24" />
                                        <button onClick={() => handlePay(p.id)} className="bg-emerald-600 text-white text-xs px-2 py-1 rounded">Submit</button>
                                      </div>
                                    )}
                                    {p.status === 'Paid' && (
                                      <button onClick={() => downloadReceipt(p)} className="bg-blue-50 text-blue-700 border text-xs px-2.5 py-1 rounded">📥 PDF</button>
                                    )}
                                    <button onClick={() => startAdminEdit(p)} className="bg-gray-200 text-xs px-2.5 py-1 rounded">✏️ Edit</button>
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

          {/* TAB 2: Foundation Overview & Donor Wall */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-800 text-white p-6 rounded-xl shadow-md">
                  <p className="text-xs text-emerald-200 uppercase font-semibold">মোট সংগৃহীত ফান্ড</p>
                  <h2 className="text-3xl font-extrabold mt-1">৳{grandTotalFund}</h2>
                </div>
                <div className="bg-amber-700 text-white p-6 rounded-xl shadow-md">
                  <p className="text-xs text-amber-200 uppercase font-semibold">মোট খরচ</p>
                  <h2 className="text-3xl font-extrabold mt-1">৳{totalExpenses}</h2>
                </div>
                <div className="bg-blue-800 text-white p-6 rounded-xl shadow-md">
                  <p className="text-xs text-blue-200 uppercase font-semibold">বর্তমান ক্যাশ ব্যালেন্স</p>
                  <h2 className="text-3xl font-extrabold mt-1">৳{currentBalance}</h2>
                </div>
              </div>

              {/* Top Donor Wall */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-bold text-gray-800 text-lg mb-4">🏆 সম্মাননা ও লিডারবোর্ড (Donor Wall)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {members.slice(0, 3).map((m, idx) => (
                    <div key={m.member_id} className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{m.name}</p>
                        <p className="text-xs text-amber-700 font-semibold">নিয়মিত অনুদান প্রদানকারী</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Members Table */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h3 className="font-bold text-gray-800">সকল সদস্যদের পেমেন্ট সামারি</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                      <th className="py-3 px-6">ID</th>
                      <th className="py-3 px-6">Name</th>
                      <th className="py-3 px-6 text-center">Paid</th>
                      <th className="py-3 px-6 text-center">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {members.map((m) => {
                      const memberPaid = allPayments.filter((p) => p.member_id === m.member_id && p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
                      const memberPending = allPayments.filter((p) => p.member_id === m.member_id && p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

                      return (
                        <tr key={m.member_id} className="hover:bg-gray-50">
                          <td className="py-4 px-6 font-mono font-semibold text-emerald-700">{m.member_id}</td>
                          <td className="py-4 px-6 font-medium text-gray-800">{m.name}</td>
                          <td className="py-4 px-6 text-center font-bold text-green-600">৳{memberPaid}</td>
                          <td className="py-4 px-6 text-center font-bold text-red-500">৳{memberPending}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Event & Meeting Schedule */}
          {activeTab === 'events' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📅 ইভেন্ট ও মিটিং ক্যালেন্ডার</h2>
              {events.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500">কোনো আসন্ন ইভেন্ট নেই।</div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-600 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800 text-md">{ev.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">📍 স্থান: {ev.location || 'অনলাইন'}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-full">{ev.event_date}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Public Aid Request Form */}
          {activeTab === 'aid-form' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-800 mb-2">🤲 সাহায্যের আবেদন ফরম</h2>
              <p className="text-xs text-gray-500 mb-4">জরুরি চিকিৎসা, শিক্ষা বা আর্থিক সহায়তার জন্য আপনার তথ্য প্রদান করুন।</p>
              <form onSubmit={handleSubmitAidRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">আবেদনকারীর নাম</label>
                  <input type="text" placeholder="আপনার পুরো নাম" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">মোবাইল নম্বর</label>
                  <input type="text" placeholder="017XXXXXXXX" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">প্রয়োজনীয় পরিমাণ (৳)</label>
                  <input type="number" placeholder="5000" value={aidAmount} onChange={(e) => setAidAmount(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">আবেদনের কারণ</label>
                  <textarea rows="3" placeholder="বিস্তারিত লিখুন..." value={aidReason} onChange={(e) => setAidReason(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-semibold py-2 rounded text-sm">আবেদন জমা দিন</button>
              </form>
            </div>
          )}

          {/* TAB 5: Notice Board */}
          {activeTab === 'notices' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📢 নোটিশ বোর্ড</h2>
              {notices.map((n) => (
                <div key={n.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-600">
                  <span className="text-xs text-emerald-700 font-semibold">{n.date}</span>
                  <p className="text-gray-800 mt-2 text-sm">{n.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: Admin Panel */}
          {activeTab === 'admin' && (
            <div className="max-w-3xl mx-auto">
              {!isAdminLoggedIn ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">অ্যাডমিন লগইন</h2>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <input type="password" placeholder="ukf2026" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full border px-4 py-2 rounded-lg text-sm" />
                    <button type="submit" className="w-full bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm">Login</button>
                  </form>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Pending Aid Requests */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">📩 প্রাপ্ত সাহায্যের আবেদনসমূহ ({aidRequests.length})</h2>
                    {aidRequests.length === 0 ? (
                      <p className="text-xs text-gray-500">কোনো নতুন আবেদন নেই।</p>
                    ) : (
                      aidRequests.map((req) => (
                        <div key={req.id} className="bg-gray-50 p-4 rounded border mb-2 text-xs">
                          <p className="font-bold text-gray-800">{req.applicant_name} ({req.phone})</p>
                          <p className="text-emerald-700 font-semibold">প্রয়োজন: ৳{req.amount_needed}</p>
                          <p className="text-gray-600 mt-1">কারণ: {req.reason}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Event Form */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">নতুন ইভেন্ট যুক্ত করুন</h2>
                    <form onSubmit={handleAddEvent} className="space-y-4">
                      <input type="text" placeholder="ইভেন্টের নাম" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="তারিখ (e.g. 25 Oct 2026)" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
                        <input type="text" placeholder="স্থান" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded text-sm">ইভেন্ট প্রকাশ করুন</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-emerald-950 text-emerald-200 py-6 border-t border-emerald-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs">
          <div>
            <p className="font-bold text-sm text-white">উম্মাহ কল্যাণ ফাউন্ডেশন (UKF)</p>
            <p className="mt-1 text-emerald-400">একটি অলাভজনক ও জনকল্যাণমূলক সংস্থা | যাত্রা শুরু: জুন ২০২৬</p>
          </div>
          <p className="mt-2 md:mt-0 font-medium">Developed with ❤️ by <span className="text-white font-semibold">Md. Jannatun Naem Refat</span></p>
        </div>
      </footer>
    </div>
  );
}

export default App;