/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  Sliders, 
  Shield, 
  Compass, 
  Phone, 
  MessageSquare, 
  Bot, 
  Zap, 
  Award, 
  Info, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Calendar, 
  User, 
  MapPin, 
  RotateCcw, 
  Sparkles,
  Check,
  Fuel,
  Maximize2,
  PhoneCall,
  Activity,
  UserCheck,
  Share2,
  PlusCircle,
  Wrench
} from 'lucide-react';
import { FORD_CARS, WHEEL_OPTIONS, PACKAGES, CONTACT_INFO } from './data';
import { FordCar, CustomizedCar, ChatMessage } from './types';
import AddCarForm from './components/AddCarForm';
import SparePartsManager from './components/SparePartsManager';

export default function App() {
  // Load vehicles list including any user added custom cars
  const [cars, setCars] = useState<FordCar[]>(() => {
    const local = typeof window !== 'undefined' ? localStorage.getItem('yassen_ford_custom_cars') : null;
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...FORD_CARS];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return FORD_CARS;
  });

  // Theme & Navigation States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCar, setSelectedCar] = useState<FordCar>(cars[0]);
  
  // Customization States
  const [selectedColor, setSelectedColor] = useState(cars[0].colors[0]);
  const [selectedWheel, setSelectedWheel] = useState(WHEEL_OPTIONS[0]);
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]);

  // Comparison State
  const [compareList, setCompareList] = useState<FordCar[]>([cars[0], cars[1] || cars[0]]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'أهلاً بك يا فندم في بوابة "ياسين فورد" الرقمية بمصر! 🇪🇬 أنا مستشارك الذاتي لمساعدتك في استكشاف وتفصيل سيارتك فورد المفضلة ومقارنتها بالأسعار الرسمية بالجنيه المصري. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Booking Form State
  const [bookingName, setBookingName] = useState<string>('');
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [bookingCarId, setBookingCarId] = useState<string>(cars[0].id);
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [savedBookings, setSavedBookings] = useState<any[]>([]);
  const [showBookingSuccess, setShowBookingSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'showroom' | 'customizer' | 'bookings' | 'add_car' | 'parts'>('showroom');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keep customization synced when car changes
  useEffect(() => {
    setSelectedColor(selectedCar.colors[0]);
    setSelectedWheel(WHEEL_OPTIONS[0]);
    setSelectedPackage(PACKAGES[0]);
  }, [selectedCar]);

  // Handle auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // Load bookings from local storage
  useEffect(() => {
    const local = localStorage.getItem('yassen_ford_bookings');
    if (local) {
      try {
        setSavedBookings(JSON.parse(local));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Format Price to Egyptian style (EGP)
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Calculate Total Configuration Price
  const totalConfigPrice = selectedCar.priceEstimate + selectedWheel.price + selectedPackage.price;

  // Handle Category Filtering
  const filteredCars = selectedCategory === 'all' 
    ? cars 
    : cars.filter(car => car.category === selectedCategory);

  // Handle Adding to Comparison
  const toggleCompare = (car: FordCar) => {
    if (compareList.some(c => c.id === car.id)) {
      setCompareList(compareList.filter(c => c.id !== car.id));
    } else {
      if (compareList.length >= 3) {
        alert('يمكنك مقارنة ٣ سيارات كحد أقصى في المرة الواحدة يا فندم.');
        return;
      }
      setCompareList([...compareList, car]);
    }
  };

  // Chat message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const messagesPayload = [...chatMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesPayload })
      });

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.text || 'عذراً يا فندم، واجهت مشكلة صغيرة في معالجة طلبك، يرجى إعادة المحاولة من جديد.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: 'نأسف جداً يا فندم، حدث خطأ في الاتصال بالخادم. يرجى العلم أنه يمكنك التواصل معنا مباشرة على الرقم الهاتفى 01094002675 لمساعدتك فوراً.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Submit test drive booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone) {
      alert('الرجاء كتابة الاسم ورقم الهاتف لإكمال الحجز.');
      return;
    }

    const newBooking = {
      id: 'B-' + Math.floor(Math.random() * 90000 + 10000),
      name: bookingName,
      phone: bookingPhone,
      carId: bookingCarId,
      carName: cars.find(c => c.id === bookingCarId)?.name || 'فورد',
      time: bookingTime,
      notes: bookingNotes,
      date: new Date().toLocaleDateString('ar-EG'),
      status: 'قيد المراجعة والاتصال'
    };

    const updated = [newBooking, ...savedBookings];
    setSavedBookings(updated);
    localStorage.setItem('yassen_ford_bookings', JSON.stringify(updated));

    setShowBookingSuccess(true);
    
    // Clear fields
    setBookingName('');
    setBookingPhone('');
    setBookingNotes('');
    setBookingTime('');
  };

  const handleAddCar = (newCar: FordCar) => {
    const customCarsLocal = localStorage.getItem('yassen_ford_custom_cars');
    let customCarsList: FordCar[] = [];
    if (customCarsLocal) {
      try {
        customCarsList = JSON.parse(customCarsLocal);
        if (!Array.isArray(customCarsList)) {
          customCarsList = [];
        }
      } catch (e) {
        console.error(e);
      }
    }
    const updatedCustomList = [newCar, ...customCarsList];
    localStorage.setItem('yassen_ford_custom_cars', JSON.stringify(updatedCustomList));
    setCars([newCar, ...cars]);
    setSelectedCar(newCar);
    setActiveTab('showroom');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Helper to construct WhatsApp quick sharing link for customized config
  const getWhatsAppConfigLink = () => {
    const text = `أهلاً ياسين فورد، أود الاستفسار عن سيارة ${selectedCar.name} ${selectedCar.nameEn} من بوابتكم بمصر.
تكويني المفضل هو:
- اللون: ${selectedColor.name} (${selectedColor.nameEn})
- العجلات: ${selectedWheel.name}
- الباقة المضافة: ${selectedPackage.name}
- الإجمالي التقريبي: ${formatPrice(totalConfigPrice)}
أرجو التواصل معي على رقم هاتفي لتأكيد الطلب وحجز موعد استشارة تفصيلية.`;
    return `https://wa.me/201094002675?text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppBookingLink = (booking: any) => {
    const text = `مرحباً ياسين فورد مصر، قمت بتقديم طلب حجز تجربة قيادة / استفسار:
- كود الطلب: ${booking.id}
- الاسم: ${booking.name}
- الهاتف: ${booking.phone}
- السيارة المطلوبة: ${booking.carName}
- الموعد المقترح: ${booking.time || 'في أقرب وقت'}
- ملاحظات: ${booking.notes || 'لا يوجد'}
أرجو تأكيد الموعد وتزويدي بالترتيبات اللازمة وموقع الفرع الأقرب.`;
    return `https://wa.me/201094002675?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased dir-rtl select-none" style={{ direction: 'rtl' }} id="yassen-ford-app">
      
      {/* Upper Premium Floating Contact Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-neutral-900 to-amber-800 border-b border-neutral-800 py-2.5 px-4 text-xs md:text-sm text-center font-medium sticky top-0 z-50 shadow-md flex flex-wrap justify-between items-center max-w-7xl mx-auto rounded-b-xl" id="contact-bar">
        <div className="flex items-center gap-2 text-amber-300" id="premium-dealership-badge">
          <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
          <span>بوابة فورد المتميزة بمصر - إدارة الأستاذ ياسين</span>
        </div>
        <div className="flex items-center gap-4 text-neutral-200 mt-1 sm:mt-0" id="contact-info-list">
          <a href="tel:01094002675" className="flex items-center gap-1.5 hover:text-amber-400 transition">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>اتصل بنا: <strong className="tracking-wider">01094002675</strong></span>
          </a>
          <span className="text-neutral-600">|</span>
          <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition">
            <MessageSquare className="w-4 h-4" />
            <span>واتساب الاستشارات متاح 24س</span>
          </a>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6" id="main-content-layout">
        
        {/* Header Branding */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-neutral-800/60 pb-6" id="app-header">
          <div className="text-right" id="brand-logo-area">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg ring-2 ring-blue-500/40" id="brand-logo-icon">
                <Car className="w-8 h-8 transform -scale-x-100" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-amber-300 to-amber-500 bg-clip-text text-transparent" id="brand-title">
                  yassen-ford
                </h1>
                <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase text-left md:text-right">Egypt Elite Gateway</p>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mt-2 max-w-xl">
              المعرض الرقمي التفاعلي والذكي المتكامل الأحدث لسيارات فورد في جمهورية مصر العربية. تصفّح مواصفات سيارتك وقارن بينها بالجنيه المصري وقم بحجز تجربة قيادة فوريّة.
            </p>
          </div>

          {/* Core Desktop Tabs */}
          <div className="flex bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl text-sm" id="main-navigation-tabs">
            <button
              id="tab-showroom-btn"
              onClick={() => { setActiveTab('showroom'); }}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                activeTab === 'showroom' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              صالة العرض التفاعلية
            </button>
            <button
              id="tab-customizer-btn"
              onClick={() => { setActiveTab('customizer'); }}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                activeTab === 'customizer' 
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              مخصص تفاصيل السيارة
            </button>
            <button
              id="tab-bookings-btn"
              onClick={() => { setActiveTab('bookings'); }}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'bookings' 
                  ? 'bg-neutral-800 text-amber-400 shadow-inner' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              طلباتي وحجوزاتي
              {savedBookings.length > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold" id="badge-booking-count">
                  {savedBookings.length}
                </span>
              )}
            </button>
            <button
              id="tab-parts-btn"
              onClick={() => { setActiveTab('parts'); }}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                activeTab === 'parts' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              سوق قطع الغيار
            </button>
            <button
              id="tab-add-car-btn"
              onClick={() => { setActiveTab('add_car'); }}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'add_car' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              إضافة سيارة للمعرض
            </button>
          </div>
        </header>

        {/* Dynamic Display Grid based on selected tab */}
        {activeTab === 'showroom' && (
          <div className="space-y-8 animate-fade-in" id="showroom-tab-view">
            
            {/* Elegant Video-like Feature Banner */}
            <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl overflow-hidden border border-neutral-700/50 shadow-2xl" id="hero-banner">
              <div className="absolute inset-0 bg-gradient-to-l from-neutral-950/80 via-neutral-950/40 to-transparent z-10" />
              
              {/* Image Background */}
              <img 
                src={selectedCar.bannerImage || selectedCar.image} 
                alt={selectedCar.name} 
                className="w-full h-[320px] md:h-[450px] object-cover object-center brightness-90 animate-pulse-slow filter transform hover:scale-105 transition duration-1000"
                id="hero-banner-image"
              />
              
              {/* Banner Text overlay */}
              <div className="absolute bottom-0 right-0 left-0 p-6 md:p-10 z-20 flex flex-col justify-end text-right" id="hero-banner-overlay">
                <span className="bg-blue-600/90 text-white font-bold text-xs px-3.5 py-1.5 rounded-full w-fit mb-3 tracking-wide backdrop-blur-sm shadow" id="hero-badge">
                  طراز الأسبوع الحصري بمصر
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md" id="hero-car-title">
                  {selectedCar.name} <span className="font-mono text-neutral-300 text-2xl md:text-4xl">{selectedCar.nameEn}</span>
                </h2>
                <p className="text-amber-300 font-medium mt-1 text-sm md:text-lg max-w-2xl drop-shadow">
                  {selectedCar.tagline}
                </p>
                
                {/* Specs quick pill preview */}
                <div className="flex flex-wrap gap-3 mt-4 text-xs md:text-sm text-neutral-200" id="hero-specs-pills">
                  <div className="bg-neutral-950/70 py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-neutral-800 backdrop-blur-sm">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{selectedCar.horsepower} حصان</span>
                  </div>
                  <div className="bg-neutral-950/70 py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-neutral-800 backdrop-blur-sm">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>{selectedCar.engineAr}</span>
                  </div>
                  <div className="bg-neutral-950/70 py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-neutral-800 backdrop-blur-sm">
                    <Fuel className="w-4 h-4 text-emerald-400" />
                    <span>{selectedCar.fuelEconomyAr}</span>
                  </div>
                  <div className="bg-neutral-950/70 py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-neutral-800 backdrop-blur-sm">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>يبدأ من {selectedCar.priceStartAr}</span>
                  </div>
                </div>

                {/* Configuration Call-to-action */}
                <div className="flex flex-wrap gap-3 mt-6 justify-start" id="hero-action-buttons">
                  <button 
                    id="configure-now-hero-btn"
                    onClick={() => {
                      setSelectedCar(selectedCar);
                      setActiveTab('customizer');
                    }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white py-2.5 px-6 rounded-xl font-extrabold text-sm md:text-base shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-2"
                  >
                    <Sliders className="w-4 h-4" />
                    تخصيص وشراء هذه السيارة الآن
                  </button>
                  <button 
                    id="open-chat-hero-btn"
                    onClick={() => { setIsChatOpen(true); }}
                    className="bg-neutral-950/90 text-neutral-200 border border-neutral-700 hover:bg-neutral-900 py-2.5 px-5 rounded-xl font-bold text-sm backdrop-blur transition flex items-center gap-2"
                  >
                    <Bot className="w-4 h-4 text-blue-400" />
                    دردشة مع ياسين حول فورد
                  </button>
                  <button 
                    id="add-to-compare-hero-btn"
                    onClick={() => toggleCompare(selectedCar)}
                    className={`py-2.5 px-4 rounded-xl font-bold text-sm border transition flex items-center gap-2 ${
                      compareList.some(c => c.id === selectedCar.id)
                        ? 'bg-blue-900 border-blue-600 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    {compareList.some(c => c.id === selectedCar.id) ? 'مضافة للمقارنة ✓' : 'أضف للمقارنة الحرة'}
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filters Area */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center bg-neutral-900/40 p-5 rounded-2xl border border-neutral-900" id="filter-bar">
              <div>
                <h3 className="text-lg font-bold text-neutral-100" id="filter-title">السيارات المتاحة للطلب الفوري في مصر</h3>
                <p className="text-xs text-neutral-400"></p>
              </div>

              {/* Badges for filters */}
              <div className="flex flex-wrap gap-2" id="filter-options">
                <button
                  id="filter-category-all"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  جميع السيارات
                </button>
                <button
                  id="filter-category-sedans"
                  onClick={() => setSelectedCategory('sedans')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCategory === 'sedans' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  سيدان وهاتشباك (Focus)
                </button>
                <button
                  id="filter-category-suvs"
                  onClick={() => setSelectedCategory('suvs-crossovers')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCategory === 'suvs-crossovers' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  الـ SUV والكروس اوفر (Puma, Kuga, Bronco)
                </button>
                <button
                  id="filter-category-trucks"
                  onClick={() => setSelectedCategory('trucks')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCategory === 'trucks' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  شاحنات البيك اب (F-150)
                </button>
                <button
                  id="filter-category-sports"
                  onClick={() => setSelectedCategory('sports')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCategory === 'sports' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  رياضية فائقة (Mustang)
                </button>
              </div>
            </div>

            {/* Cars Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="cars-grid">
              {filteredCars.map((car) => {
                const isSelected = selectedCar.id === car.id;
                const isInCompare = compareList.some(c => c.id === car.id);
                
                return (
                  <div 
                    id={`car-card-${car.id}`}
                    key={car.id}
                    className={`group bg-neutral-900 text-right rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 ${
                      isSelected 
                        ? 'border-blue-500/80 shadow-md shadow-blue-500/5 bg-gradient-to-b from-neutral-900 to-neutral-800/80' 
                        : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/90'
                    }`}
                  >
                    <div className="relative overflow-hidden cursor-pointer" onClick={() => setSelectedCar(car)} id={`car-card-image-box-${car.id}`}>
                      <img 
                        src={car.image} 
                        alt={car.name} 
                        className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e: any) => {
                          e.target.src = 'https://picsum.photos/600/400';
                        }}
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5" id={`car-card-pills-${car.id}`}>
                        <span className="bg-neutral-950/80 backdrop-blur-sm shadow border border-neutral-700 text-amber-400 font-bold px-2.5 py-1 rounded-lg text-xs">
                          {car.categoryAr}
                        </span>
                      </div>

                      {/* Power Score Circle */}
                      <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-sm p-1.5 rounded-xl border border-neutral-700 flex items-center gap-1 text-[11px] font-bold text-neutral-100" id={`car-card-perf-${car.id}`}>
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>أداء {car.performanceScore}%</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3" id={`car-card-body-${car.id}`}>
                      <div>
                        <div className="flex justify-between items-start" id={`car-card-title-row-${car.id}`}>
                          <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-1 cursor-pointer" onClick={() => setSelectedCar(car)}>
                            {car.name}
                          </h4>
                          <span className="text-amber-400 font-semibold text-sm font-mono mt-1 ring-1 ring-amber-400/20 px-2 rounded-md bg-amber-400/5">
                            {car.priceStartAr}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-mono" id={`car-card-subtitle-${car.id}`}>{car.nameEn}</p>
                      </div>

                      <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed" id={`car-card-desc-${car.id}`}>
                        {car.descriptionAr}
                      </p>

                      {/* Performance Indicators */}
                      <hr className="border-neutral-800/80" />
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300" id={`car-card-stats-grid-${car.id}`}>
                        <div className="flex items-center gap-1.5" id={`car-stat-hp-${car.id}`}>
                          <Zap className="w-3.5 h-3.5 text-blue-400" />
                          <span>القوة: <strong className="text-white">{car.horsepower} حصان</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5" id={`car-stat-accel-${car.id}`}>
                          <Activity className="w-3.5 h-3.5 text-red-400" />
                          <span>تجاوز 100م: <strong className="text-white">{car.acceleration}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5" id={`car-stat-econ-${car.id}`}>
                          <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                          <span>الاستهلاك: <strong className="text-white">{car.fuelEconomyAr}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5" id={`car-stat-trans-${car.id}`}>
                          <Sliders className="w-3.5 h-3.5 text-purple-400" />
                          <span className="truncate">الناقل: <strong className="text-white">{car.transmissionAr}</strong></span>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2" id={`car-card-actions-${car.id}`}>
                        <button
                          id={`car-btn-select-${car.id}`}
                          onClick={() => {
                            setSelectedCar(car);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                            isSelected 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isSelected ? 'السيارة المحددة حالياً' : 'تحديد المركبة'}
                        </button>
                        
                        <button
                          id={`car-btn-compare-${car.id}`}
                          onClick={() => toggleCompare(car)}
                          className={`p-2 rounded-lg text-xs transition border flex items-center justify-center ${
                            isInCompare 
                              ? 'bg-amber-950 border-amber-600 text-amber-400' 
                              : 'bg-neutral-800 border-transparent text-neutral-400 hover:text-white'
                          }`}
                          title={isInCompare ? 'إلغاء المقارنة' : 'إضافة إلى المقارنة'}
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-neutral-900/30 p-8 rounded-3xl border border-neutral-900 mt-12" id="benefits-section">
              <div className="flex items-start gap-4 text-right" id="benefit-item-1">
                <div className="bg-blue-600/10 p-3.5 rounded-xl border border-blue-500/20 text-blue-400 flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">ضمان رسمي وقطع غيار أصلية</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    جميع سيارات فورد المتوفرة تأتي مع ضمان شامل وخدمات صيانة معتمدة ومدعومة بقطع غيار أصلية 100% من الوكيل الرسمي في مصر.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-right" id="benefit-item-2">
                <div className="bg-amber-600/10 p-3.5 rounded-xl border border-amber-500/20 text-amber-400 flex-shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">مستشار ياسين فورد الذكي</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    دردش في أي وقت مع مساعدنا الذكي المدعوم بـ AI المتقدم للإجابة التفصيلية ومعرفة جدول الصيانة، وأسعار قطع الغيار الاستهلاكية والتقسيط.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-right" id="benefit-item-3">
                <div className="bg-red-600/10 p-3.5 rounded-xl border border-red-500/20 text-red-400 flex-shrink-0">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">تواصل فوري مباشر ومتابعة لتجربتك</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    يمكنك تقديم رقم التليفون أو حجز تجربة القيادة مباشرة، ونقوم بالتواصل معك في اليوم والوقت المحدد لتجهيز الفحص. (01094002675).
                  </p>
                </div>
              </div>
            </div>

            {/* Live Comparison Bar if items > 0 */}
            {compareList.length > 0 && (
              <div className="fixed bottom-6 right-6 left-6 md:right-1/2 md:translate-x-1/2 md:left-auto bg-neutral-900 border border-neutral-700/80 p-4 rounded-2xl shadow-2xl z-40 max-w-lg w-auto min-w-[320px] transition-all flex items-center justify-between gap-4" id="compare-strip">
                <div className="flex items-center gap-3" id="compare-strip-info">
                  <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-neutral-100">مقارنة السيارات الذاتية</h5>
                    <p className="text-[11px] text-neutral-400">لقد حددت {compareList.length} سيارات للمقارنة</p>
                  </div>
                </div>

                <div className="flex gap-2" id="compare-strip-actions">
                  <button
                    id="open-compare-modal-btn"
                    onClick={() => setShowCompareModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2 px-4 rounded-lg shadow-md hover:shadow-blue-600/10 active:scale-95 transition"
                  >
                    قارن الآن تفصيليا
                  </button>
                  <button
                    id="clear-compare-list-btn"
                    onClick={() => setCompareList([])}
                    className="bg-neutral-800 text-neutral-400 hover:text-white text-xs p-2 rounded-lg transition"
                    title="تفريغ القائمة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Interactive Configurator */}
        {activeTab === 'customizer' && (
          <div className="space-y-8 animate-fade-in" id="customizer-tab-view">
            
            <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-900 flex flex-col lg:flex-row gap-8" id="car-customizer-grid">
              
              {/* Product Visual Area */}
              <div className="flex-1 space-y-4" id="customizer-left-panel">
                <div className="relative bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-inner p-4" id="customizer-viewport">
                  {/* Selected Color Ring Overlay Glow */}
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none transition duration-500 blur-3xl"
                    style={{ backgroundColor: selectedColor.hex }}
                    id="customizer-glow-overlay"
                  />
                  
                  {/* Car Large Image representing the choice */}
                  <img 
                    src={selectedCar.image} 
                    alt={selectedCar.name} 
                    className="w-full h-64 md:h-96 object-contain transform hover:scale-105 transition duration-500"
                    id="customizer-car-image"
                  />

                  {/* Summary overlay parameters */}
                  <div className="absolute bottom-4 right-4 left-4 bg-neutral-900/90 backdrop-blur-md p-4 rounded-xl border border-neutral-800/80 flex flex-wrap justify-between items-center text-xs text-neutral-200" id="customizer-choices-summary">
                    <div>
                      <span className="text-neutral-500 block">مركبة التصميم الخاصة بك</span>
                      <strong className="text-white text-sm">{selectedCar.name} ({selectedCar.nameEn})</strong>
                    </div>
                    <div className="text-left">
                      <span className="text-neutral-500 block">اللون المحدد</span>
                      <span className="text-amber-400 font-bold">{selectedColor.name}</span>
                    </div>
                    <div className="text-left border-r border-neutral-800 padding-r pr-4">
                      <span className="text-neutral-500 block">سعر التخصيص الإجمالي</span>
                      <strong className="text-emerald-400 text-sm md:text-base font-mono leading-none">{formatPrice(totalConfigPrice)}</strong>
                    </div>
                  </div>
                </div>

                {/* Score Meters */}
                <div className="bg-neutral-900 border border-neutral-800/60 rounded-xl p-5 space-y-4" id="customizer-ratings">
                  <h5 className="font-bold text-sm text-neutral-300 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    تحليل الأداء الفني والعملاني لـ {selectedCar.name}
                  </h5>

                  <div className="space-y-3" id="scores-meters-list">
                    <div id="meter-performance">
                      <div className="flex justify-between text-xs mb-1 text-neutral-300">
                        <span>قوة المحرك والأداء الرياضي</span>
                        <span className="text-blue-400 font-bold">{selectedCar.performanceScore}%</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                        <div className="bg-gradient-to-l from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${selectedCar.performanceScore}%` }} />
                      </div>
                    </div>

                    <div id="meter-utility">
                      <div className="flex justify-between text-xs mb-1 text-neutral-300">
                        <span>الرحابة العائلية، الاستيعاب، والمهام الشاقة</span>
                        <span className="text-emerald-400 font-bold">{selectedCar.utilityScore}%</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                        <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${selectedCar.utilityScore}%` }} />
                      </div>
                    </div>

                    <div id="meter-tech">
                      <div className="flex justify-between text-xs mb-1 text-neutral-300">
                        <span>التكنولوجيا الذكية وأنظمة الرفاهية والأمان Co-Pilot</span>
                        <span className="text-purple-400 font-bold">{selectedCar.techScore}%</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                        <div className="bg-gradient-to-l from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${selectedCar.techScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configurations Control Panel Area */}
              <div className="w-full lg:w-[450px] space-y-6" id="customizer-right-panel">
                <div>
                  <span className="text-xs text-amber-400 block font-bold mb-1">المرحلة الثانية</span>
                  <h2 className="text-2xl font-extrabold text-white" id="configurator-title">تخصيص سيارة أحلامك</h2>
                  <p className="text-xs text-neutral-400">حدد اللون، مقاس العجلات، واللمسة الفاخرة للوكيل بمصر</p>
                </div>

                {/* Car Selector Dropdown inside customizer */}
                <div className="space-y-1.5" id="customizer-select-dropdown-box">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-blue-500" />
                    السيارة المراد تخصيصها:
                  </label>
                  <select
                    id="customizer-car-dropdown"
                    value={selectedCar.id}
                    onChange={(e) => {
                      const match = cars.find(c => c.id === e.target.value);
                      if (match) setSelectedCar(match);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-blue-500 transition font-bold"
                  >
                    {cars.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.nameEn}) - يبدأ من {c.priceStartAr}</option>
                    ))}
                  </select>
                </div>

                {/* 1. Paint Color Swatches */}
                <div className="space-y-2.5" id="color-configurator-box">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-300">ألوان وتكسية فورد الخارجية المتميزة:</span>
                    <span className="text-blue-400">{selectedColor.name} ({selectedColor.nameEn})</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5" id="color-swatches-row">
                    {selectedCar.colors.map((color) => {
                      const isActive = selectedColor.name === color.name;
                      return (
                        <button
                          id={`color-swatch-${color.nameEn.replace(/\s+/g, '-').toLowerCase()}`}
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all relative flex items-center justify-center hover:scale-110 active:scale-90 ${
                            isActive ? 'border-amber-400 ring-4 ring-amber-500/20 shadow' : 'border-neutral-800'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {isActive && (
                            <Check className="w-5 h-5 text-shadow font-bold text-white z-10 filter drop-shadow bg-neutral-950/20 rounded-full p-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Wheel Rims Configurator */}
                <div className="space-y-2.5" id="wheels-configurator-box">
                  <label className="text-xs font-bold text-neutral-300 block">نوع الجنوط الرياضية ومقاس الإطار:</label>
                  <div className="space-y-2" id="wheels-list">
                    {WHEEL_OPTIONS.map((wheel) => {
                      const isActive = selectedWheel.name === wheel.name;
                      return (
                        <button
                          id={`wheel-option-${wheel.price}`}
                          key={wheel.name}
                          onClick={() => setSelectedWheel(wheel)}
                          className={`w-full text-right p-3 rounded-lg border text-xs transition flex justify-between items-center ${
                            isActive 
                              ? 'bg-blue-950/50 border-blue-500/80 text-blue-200 font-bold' 
                              : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800/80 text-neutral-300'
                          }`}
                        >
                          <span>{wheel.name}</span>
                          <span className={`${wheel.price === 0 ? 'text-neutral-500' : 'text-emerald-400 font-bold'}`}>
                            {wheel.price === 0 ? 'مشمول أساسي' : `+ ${formatPrice(wheel.price)}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Luxury/Sports Packages */}
                <div className="space-y-2.5" id="packages-configurator-box">
                  <label className="text-xs font-bold text-neutral-300 block">باقة الإضافات الحصرية والتحديث التقني:</label>
                  <div className="space-y-2.5" id="packages-list">
                    {PACKAGES.map((pkg) => {
                      const isActive = selectedPackage.name === pkg.name;
                      return (
                        <button
                          id={`package-option-${pkg.price}`}
                          key={pkg.name}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`w-full text-right p-3.5 rounded-lg border text-xs transition flex flex-col gap-1 ${
                            isActive 
                              ? 'bg-amber-950/30 border-amber-500/80 text-amber-200' 
                              : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-300'
                          }`}
                        >
                          <div className="flex justify-between w-full font-bold">
                            <span>{pkg.name}</span>
                            <span className={`${pkg.price === 0 ? 'text-neutral-500' : 'text-emerald-400'}`}>
                              {pkg.price === 0 ? 'بدون تكلفة' : `+ ${formatPrice(pkg.price)}`}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 text-right leading-relaxed mt-0.5">
                            {pkg.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Final Checkout Widget */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 shadow-inner" id="customizer-checkout-card">
                  <div className="flex justify-between items-center text-xs" id="subtotal-row-1">
                    <span>قيمة الموديل الأساسي:</span>
                    <span className="font-mono text-neutral-300">{formatPrice(selectedCar.priceEstimate)}</span>
                  </div>
                  {selectedWheel.price > 0 && (
                    <div className="flex justify-between items-center text-xs text-neutral-300" id="subtotal-row-wheels">
                      <span>إطارات وجنوط إضافية:</span>
                      <span className="font-mono text-neutral-400">+ {formatPrice(selectedWheel.price)}</span>
                    </div>
                  )}
                  {selectedPackage.price > 0 && (
                    <div className="flex justify-between items-center text-xs text-neutral-300" id="subtotal-row-package">
                      <span>الباقات والترقيات التكنولوجية:</span>
                      <span className="font-mono text-neutral-400">+ {formatPrice(selectedPackage.price)}</span>
                    </div>
                  )}
                  <hr className="border-neutral-800" />
                  <div className="flex justify-between items-center" id="total-pricing-row">
                    <span className="text-xs font-bold text-neutral-100">سعر التخصيص الإجمالي (تقديري):</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{formatPrice(totalConfigPrice)}</span>
                  </div>

                  <div className="pt-2 flex flex-col gap-2" id="customizer-footer-buttons">
                    <a 
                      id="share-whatsapp-config-btn"
                      href={getWhatsAppConfigLink()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm py-2.5 rounded-xl text-center active:scale-95 transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <MessageSquare className="w-4 h-4" />
                      إرسال التكوين للأستاذ ياسين على الواتساب 01094002675
                    </a>
                    
                    <button
                      id="book-customized-car-btn"
                      onClick={() => {
                        setBookingCarId(selectedCar.id);
                        setBookingNotes(`تم تحديد لون خارجي: ${selectedColor.name}، جنوط: ${selectedWheel.name}، ترقية: ${selectedPackage.name}. إجمالي التكوين المقترح: ${formatPrice(totalConfigPrice)}.`);
                        setActiveTab('bookings');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs py-2 rounded-lg text-center transition flex justify-center items-center gap-1"
                    >
                      <UserCheck className="w-4 h-4" />
                      حجز موعد فحص وتجربة للموديل المخصص
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab 3: Bookings & Consultation requests */}
        {activeTab === 'bookings' && (
          <div className="space-y-8 animate-fade-in" id="bookings-tab-view">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="bookings-screen-grid">
              
              {/* Request form left panel */}
              <div className="bg-neutral-900/60 p-6 md:p-8 rounded-3xl border border-neutral-900 space-y-6" id="bookings-input-form-box">
                <div>
                  <h3 className="text-2xl font-black text-white" id="booking-form-title">طلب حجز تجربة قيادة واستشارة</h3>
                  <p className="text-xs text-neutral-400 mt-1">سوف نتواصل معك مباشرة من خلال الرقم المرفق 01094002675 لترتيب المواعيد</p>
                </div>

                {showBookingSuccess && (
                  <div className="bg-emerald-900/30 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-xs md:text-sm space-y-2 text-right animate-bounce-short" id="booking-success-indicator">
                    <p className="font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      تم إرسال وحفظ طلب الحجز بنجاح في متصفحك يا فندم!
                    </p>
                    <p>قمنا بإدراج رغباتك في بوابتنا المحلية. لتسريع عملية المراجعة وحجز السيارة الفوري، يُرجى الضغط على زر "تأكيد فوري بالواتساب" أسفل التذكرة للتحدث الفوري مع ياسين فورد.</p>
                    <button 
                      id="close-booking-success-banner"
                      onClick={() => setShowBookingSuccess(false)} 
                      className="text-white underline text-[11px] block text-left"
                    >
                      إغلاق الرسالة التنبيهية
                    </button>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4" id="booking-actual-form">
                  <div className="space-y-1.5" id="form-group-name">
                    <label className="text-xs font-bold text-neutral-300 block">الاسم الكريم بالكامل:</label>
                    <div className="relative">
                      <input
                        id="booking-input-name"
                        type="text"
                        placeholder="اكتب اسمك الكريم لتسجيل البيانات"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pr-10 text-xs md:text-sm text-neutral-200 focus:outline-none focus:border-amber-400 transition text-right"
                      />
                      <User className="absolute top-1/2 -translate-y-1/2 right-3.5 text-neutral-500 w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5" id="form-group-phone">
                    <label className="text-xs font-bold text-neutral-300 block">رقم تليفون التواصل (مصر):</label>
                    <div className="relative">
                      <input
                        id="booking-input-phone"
                        type="tel"
                        placeholder="مثال: 01094002675"
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pr-10 text-xs md:text-sm text-neutral-200 focus:outline-none focus:border-amber-400 transition text-right tracking-wider"
                      />
                      <Phone className="absolute top-1/2 -translate-y-1/2 right-3.5 text-neutral-500 w-4 h-4" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="form-group-row-datetime">
                    <div className="space-y-1.5" id="form-group-car">
                      <label className="text-xs font-bold text-neutral-300 block">طراز فورد المطلوب:</label>
                      <select
                        id="booking-select-car"
                        value={bookingCarId}
                        onChange={(e) => setBookingCarId(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-100"
                      >
                        {cars.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.nameEn})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5" id="form-group-time">
                      <label className="text-xs font-bold text-neutral-300 block">الموعد والتوقيت المفضل:</label>
                      <input
                        id="booking-input-time"
                        type="text"
                        placeholder="مثال: غداً ٦ مساءً، أو الأسبوع القادم"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5" id="form-group-notes">
                    <label className="text-xs font-bold text-neutral-300 block">ملاحظات أو تعديلات تفضيلية:</label>
                    <textarea
                      id="booking-input-notes"
                      rows={3}
                      placeholder="اكتب باقة المواصفات، أو أي أسئلة ترغب بها..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    id="booking-submit-btn"
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold py-3 rounded-xl text-xs md:text-sm transition shadow-lg active:scale-95"
                  >
                    تسجيل معلومات الحجز بالبوابة
                  </button>
                </form>
              </div>

              {/* Saved requests list right panel */}
              <div className="space-y-4" id="saved-bookings-history-box">
                <h3 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  الطلبات المسجلة في متصفحك ({savedBookings.length})
                </h3>

                {savedBookings.length === 0 ? (
                  <div className="bg-neutral-900/40 border border-neutral-900 p-8 rounded-2xl text-center text-neutral-500 space-y-3" id="no-bookings-placeholder">
                    <Calendar className="w-12 h-12 mx-auto text-neutral-700 animate-pulse" />
                    <p className="text-xs md:text-sm">لا توجد طلبات حجز مسجلة حالياً يا فندم.</p>
                    <p className="text-[10px] text-neutral-600">املأ النموذج على اليمين لتسجيل طلب جديد فوراً.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1" id="saved-bookings-list">
                    {savedBookings.map((b) => (
                      <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow text-right hover:border-neutral-700 transition" id={`booking-card-${b.id}`}>
                        <div className="flex justify-between items-start" id={`booking-card-header-${b.id}`}>
                          <div>
                            <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-1 rounded-lg font-mono">
                              كود: {b.id}
                            </span>
                            <h4 className="font-extrabold text-base text-white mt-1">{b.carName}</h4>
                          </div>
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2.5 py-1 rounded-full font-bold">
                            {b.status}
                          </span>
                        </div>

                        <div className="text-xs text-neutral-300 space-y-1.5" id={`booking-card-info-rows-${b.id}`}>
                          <p className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-neutral-500" />
                            <span>مقدم الطلب: <strong className="text-neutral-100">{b.name}</strong></span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-neutral-500" />
                            <span>رقم الاتصال السريع: <strong className="text-neutral-100">{b.phone}</strong></span>
                          </p>
                          {b.time && (
                            <p className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                              <span>التوقيت الملائم: <strong className="text-neutral-100">{b.time}</strong></span>
                            </p>
                          )}
                          {b.notes && (
                            <div className="bg-neutral-950 p-2.5 rounded-lg text-[10px] text-neutral-400 border border-neutral-800 mt-2">
                              {b.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2" id={`booking-card-actions-${b.id}`}>
                          <a
                            id={`booking-card-whatsapp-link-${b.id}`}
                            href={getWhatsAppBookingLink(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] py-1.5 rounded-lg text-center transition flex justify-center items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            تأكيد فوري بالواتساب 01094002675
                          </a>
                          
                          <button
                            id={`booking-card-delete-${b.id}`}
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا الطلب من ذاكرة متصفحك يا فندم؟')) {
                                const filtered = savedBookings.filter(item => item.id !== b.id);
                                setSavedBookings(filtered);
                                localStorage.setItem('yassen_ford_bookings', JSON.stringify(filtered));
                              }
                            }}
                            className="bg-neutral-800 hover:bg-red-950 hover:text-red-400 text-neutral-500 p-1.5 rounded-lg transition"
                            title="حذف الطلب"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 4: Add New Car Form */}
        {activeTab === 'add_car' && (
          <div className="space-y-8 animate-fade-in" id="add-car-tab-view">
            <AddCarForm onAddCar={handleAddCar} />
          </div>
        )}

        {/* Tab 5: Spare Parts Marketplace */}
        {activeTab === 'parts' && (
          <div className="space-y-8 animate-fade-in" id="parts-tab-view">
            <SparePartsManager cars={cars} />
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="bg-neutral-950/90 border-t border-neutral-950 pt-12 pb-6 max-w-7xl mx-auto rounded-t-3xl mt-16 px-4 md:px-6" id="app-footer-area">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-neutral-400 text-xs md:text-sm text-right" id="footer-grid">
          <div className="space-y-3" id="footer-info-column">
            <h5 className="font-extrabold text-neutral-100 text-sm">Yassen Ford Egypt • بوابة ياسين فورد</h5>
            <p className="leading-relaxed text-neutral-400 text-[11px]">
              رؤيتنا هي تبسيط استكشاف سيارات فورد الفاخرة، وتقديم خدمات حجز تفاعلية ذكية للعملاء في جمهورية مصر العربية على مدار الساعة.
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">
              Designed dynamically with Antigravity AI Stack.
            </p>
          </div>

          <div className="space-y-2 text-[11px]" id="footer-cars-list-column">
            <h5 className="font-extrabold text-neutral-100 text-sm">المجموعة الرئيسية في مصر</h5>
            <p className="hover:text-amber-400 cursor-pointer" onClick={() => { setSelectedCar(FORD_CARS[0]); setActiveTab('showroom'); }}>فورد فوكاس (سيدان - هاتشباك)</p>
            <p className="hover:text-amber-400 cursor-pointer" onClick={() => { setSelectedCar(FORD_CARS[1]); setActiveTab('showroom'); }}>فورد بوما المدمجة</p>
            <p className="hover:text-amber-400 cursor-pointer" onClick={() => { setSelectedCar(FORD_CARS[2]); setActiveTab('showroom'); }}>فورد كوجا SUV العائلية</p>
            <p className="hover:text-amber-400 cursor-pointer" onClick={() => { setSelectedCar(FORD_CARS[3]); setActiveTab('showroom'); }}>فورد موستانج الأسطورية</p>
          </div>

          <div className="space-y-3" id="footer-contact-column">
            <h5 className="font-extrabold text-neutral-100 text-sm">مركز التواصل المباشر بالقاهرة</h5>
            <p className="text-amber-400 font-bold tracking-widest text-base">01094002675</p>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              تواصل معنا مباشرة عبر الهاتف أو بمجرد إرسال استفسار عبر الواتساب لتجهيز تجربة القيادة، جدول الصيانة الأسعار، وتسهيلات البنوك بمصر.
            </p>
            <p className="text-neutral-500 text-[10px]">
              حقوق النشر © ٢٠٢٦ ياسين فورد. جميع الحقوق محفوظة لعلامة فورد ووكيلها الرسمي بمصر.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="floating-chat-container">
        
        {/* Toggle Chat Button */}
        <button
          id="chat-toggle-floating-btn"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-full shadow-2xl transition duration-300 relative flex items-center gap-2 group cursor-pointer ${
            isChatOpen ? 'rotate-90 bg-amber-600 hover:bg-amber-500' : 'animate-bounce-short'
          }`}
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-white" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold whitespace-nowrap">مساعد ياسين فورد الذكي</span>
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-neutral-900 animate-pulse" />
            </>
          )}
        </button>

        {/* Chat Window Box */}
        {isChatOpen && (
          <div className="absolute bottom-16 right-0 w-[350px] sm:w-[420px] h-[500px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-right animate-fade-in" id="chat-window-box">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-neutral-900 p-4 border-b border-neutral-800 flex justify-between items-center" id="chat-window-header">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-500 p-1.5 rounded-lg text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-white">مستشارتك الذكية: ياسين فورد</h5>
                  <p className="text-[9px] text-amber-400 font-mono">Powered by Gemini AI 3.5 Flash</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-neutral-400">
                <a href="tel:01094002675" className="hover:text-white" title="اتصل بنا">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </a>
                <button id="close-chat-box-btn" onClick={() => setIsChatOpen(false)} className="hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans scrollbar-thin scrollbar-thumb-neutral-800" id="chat-messages-container">
              {chatMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isUser ? 'justify-start' : 'justify-end'} text-right`}
                    id={`chat-msg-${msg.id}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-br-none text-right' 
                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none text-right border border-neutral-700/50'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-[9px] text-neutral-400 block mt-1 text-left">
                        {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isChatLoading && (
                <div className="flex justify-end text-right" id="chat-loading-bubble">
                  <div className="bg-neutral-800 text-neutral-400 rounded-2xl p-3.5 rounded-bl-none border border-neutral-700 flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span>ياسين يكتب الآن...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2" id="chat-input-form">
              <input
                id="chat-input-field"
                type="text"
                placeholder="اسأل ياسين فورد عن الفئات، الأسعار، أو الصيانة..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-right"
              />
              <button
                id="chat-send-msg-btn"
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition flex items-center justify-center active:scale-90"
              >
                <Send className="w-4 h-4 transform -scale-x-100" />
              </button>
            </form>

          </div>
        )}

      </div>

      {/* DETAILED COMPARISON MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" id="compare-modal-backdrop">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl p-6 relative overflow-hidden text-right flex flex-col max-h-[90vh]" id="compare-modal-content">
            
            <button 
              id="close-compare-modal-btn"
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 left-4 bg-neutral-800 text-neutral-400 hover:text-white p-1.5 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-1" id="compare-modal-header">
              <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                المقارنة الثلاثية الذكية بمصر
              </h3>
              <p className="text-xs text-neutral-400">تحليل مقارن فني شامل بين أفضل خيارات فورد المقترحة لميزانيتك</p>
            </div>

            {/* List to compare */}
            {compareList.length === 0 ? (
              <p className="text-center text-neutral-500 py-12 text-sm">برجاء إغلاق النافذة واختيار سيارة من المعرض أولاً يا فندم.</p>
            ) : (
              <div className="overflow-x-auto flex-1 pb-4" id="compare-table-container">
                <table className="w-full text-xs text-right text-neutral-300 border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/40">
                      <th className="p-3 text-neutral-400">الوصف والمواصفة</th>
                      {compareList.map(car => (
                        <th key={car.id} className="p-3 text-neutral-100 text-sm font-extrabold min-w-[150px]">
                          {car.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">الاسم التجاري</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3 text-amber-400 font-bold">{car.nameEn}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">فئة الهيكل بمصر</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3 font-medium">{car.categoryAr}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">سعر البداية التقديري</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3 text-emerald-400 font-black">{car.priceStartAr}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">المحرك والسعة</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3 text-neutral-200">{car.engineAr}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">القوة الحصانية</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3 font-bold text-white">{car.horsepower} حصان</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">عزم الدوران الأقصى</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3">{car.torque}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">زمن التسارع (0-100 كم)</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3 font-mono text-red-400">{car.acceleration}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">ناقل الحركة والدوران</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3">{car.driveTypeAr} / {car.transmissionAr}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">معدل الاقتصاد بالبنزين</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3 text-emerald-400 font-medium">{car.fuelEconomyAr}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400">عدد المقاعد العائلية</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3">{car.seats} مقاعد</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-neutral-950/20">
                      <td className="p-3 font-semibold text-neutral-400 font-bold text-blue-400">تقييم الأداء الكلي</td>
                      {compareList.map(car => (
                        <td key={car.id} className="p-3">
                          <div className="flex items-center gap-1 font-bold text-white">
                            <span className="text-blue-400">{car.performanceScore} / 100</span>
                            <div className="w-12 bg-neutral-950 h-1.5 rounded-full overflow-hidden inline-block mr-1">
                              <div className="bg-blue-600 h-full" style={{ width: `${car.performanceScore}%` }} />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-between items-center text-xs" id="compare-modal-footer">
              <span className="text-neutral-500">ملاحظة: الأسعار تقديرية وتتأثر بعوامل السوق الرسمية في مصر.</span>
              <div className="flex gap-2">
                <button
                  id="compare-modal-clear-all-btn"
                  onClick={() => {
                    setCompareList([]);
                    setShowCompareModal(false);
                  }}
                  className="bg-neutral-800 text-neutral-400 hover:text-white px-4 py-2 rounded-xl transition"
                >
                  حذف كافة الاختيارات
                </button>
                <button
                  id="compare-modal-close-underlay-btn"
                  onClick={() => setShowCompareModal(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl transition"
                >
                  فهمت وإغلاق
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
