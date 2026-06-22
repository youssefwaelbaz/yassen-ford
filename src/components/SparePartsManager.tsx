import React, { useState, useEffect } from 'react';
import { SparePart, FordCar } from '../types';
import { FORD_SPARE_PARTS } from '../data';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Phone, 
  MessageCircle, 
  Tag, 
  CheckCircle2, 
  Plus, 
  X, 
  Sparkles, 
  Wrench, 
  HelpCircle, 
  AlertCircle, 
  Check, 
  Car,
  ChevronDown
} from 'lucide-react';

interface SparePartsManagerProps {
  cars: FordCar[];
}

export default function SparePartsManager({ cars }: SparePartsManagerProps) {
  // Load parts list including any user added custom parts
  const [parts, setParts] = useState<SparePart[]>(() => {
    const local = typeof window !== 'undefined' ? localStorage.getItem('yassen_ford_custom_parts') : null;
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...FORD_SPARE_PARTS];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return FORD_SPARE_PARTS;
  });

  // State controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [partCategory, setPartCategory] = useState<'engine' | 'brakes' | 'filters' | 'suspension' | 'accessories' | 'electrical'>('filters');
  const [partCarModel, setPartCarModel] = useState('fusion');
  const [partCondition, setPartCondition] = useState<'new' | 'used'>('new');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [customImage, setCustomImage] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preset spare parts images that users can choose from easily
  const PART_PRESET_IMAGES = [
    { name: 'فلاتر ومحركات', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80' },
    { name: 'بوجيهات وإلكترونيات', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80' },
    { name: 'عوّامات وفلاتر دقيقة', url: 'https://images.unsplash.com/photo-1552656967-7a0991a13906?auto=format&fit=crop&w=600&q=80' },
    { name: 'مساعدين وعفشة', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80' },
    { name: 'إكسسوارات وجسم خارجي', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80' },
    { name: 'جنوط ومكابح', url: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80' },
  ];
  const [selectedPresetImage, setSelectedPresetImage] = useState(PART_PRESET_IMAGES[0].url);
  const [imageTab, setImageTab] = useState<'preset' | 'url'>('preset');

  // Filter listings
  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          part.descriptionAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          part.carModelAr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
    const matchesModel = selectedModel === 'all' || part.carModel === selectedModel;
    return matchesSearch && matchesCategory && matchesModel;
  });

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('الرجاء إدخال اسم قطعة الغيار بوضوح.');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMsg('الرجاء إدخال رقم سعر صحيح بالجنيه المصري.');
      return;
    }
    if (!sellerName.trim() || !sellerPhone.trim()) {
      setErrorMsg('الرجاء إدخال اسم المعلن ورقم الهاتف للتواصل عبر الـ WhatsApp.');
      return;
    }

    const matchedCar = cars.find(c => c.id === partCarModel) || { name: 'فورد' };

    const selectedImage = imageTab === 'preset' ? selectedPresetImage : (customImage || PART_PRESET_IMAGES[0].url);

    const newPart: SparePart = {
      id: `custom-part-${Date.now()}`,
      name: name.trim(),
      category: partCategory,
      categoryAr: 
        partCategory === 'engine' ? 'محرك وأجزاؤه' : 
        partCategory === 'brakes' ? 'مكابح / فرامل' : 
        partCategory === 'filters' ? 'فلاتر وزيوت' : 
        partCategory === 'suspension' ? 'عفشة ومساعدين' : 
        partCategory === 'accessories' ? 'إكسسوارات وكماليات' : 'كهرباء وإلكترونيات',
      carModel: partCarModel,
      carModelAr: `فورد ${matchedCar.name} تكنولوجيا مخصصة`,
      condition: partCondition,
      conditionAr: partCondition === 'new' ? 'جديدة بالتغليف' : 'مستعملة بحالة ممتازة',
      price: Number(price),
      priceAr: `${Number(price).toLocaleString('ar-EG')} ج.م`,
      descriptionAr: description.trim() || `قطعة غيار فورد أصلية للبيع بحالة فنية ممتازة تناسب سيارات فورد.`,
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      image: selectedImage,
      isVerified: false
    };

    // Save and update state
    const customPartsLocal = localStorage.getItem('yassen_ford_custom_parts');
    let customPartsList: SparePart[] = [];
    if (customPartsLocal) {
      try {
        customPartsList = JSON.parse(customPartsLocal);
        if (!Array.isArray(customPartsList)) {
          customPartsList = [];
        }
      } catch (e) {
        console.error(e);
      }
    }
    const updatedParts = [newPart, ...customPartsList];
    localStorage.setItem('yassen_ford_custom_parts', JSON.stringify(updatedParts));
    
    setParts([newPart, ...parts]);
    setSuccessMsg(`تهانينا! تم إدراج قطعة الغيار "${name}" للبيع بنجاح وسوف تظهر لجميع الزوار.`);
    
    // Reset Form
    setName('');
    setPrice('');
    setDescription('');
    setCustomImage('');
    
    // Delay closing form slightly to show success
    setTimeout(() => {
      setShowAddForm(false);
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="space-y-8 text-right" id="parts-marketplace-root">
      {/* Header section with action button */}
      <div className="bg-gradient-to-l from-indigo-950/40 via-neutral-900 to-neutral-900 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-amber-400 text-xs font-bold px-3 py-1 bg-amber-500/10 rounded-full inline-block mb-3 border border-amber-500/10">
            سوق تفاعلي آمن لقطع غيار فورد بمصر
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center justify-start gap-2" id="parts-headline">
            <Wrench className="w-8 h-8 text-blue-500" />
            قطع غيار فورد الأصلية وسوق البيع المباشر
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
            تصفح تيل الفرامل، الفلاتر، كماليات فورد فيوجن، فوكاس والموديلات الأخرى. كما يمكنك عرض قطع الغيار الفائضة لديك للبيع والتواصل مع مشتريين مباشرة عبر الـ WhatsApp مجاناً.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs md:text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-950/20 w-full md:w-auto justify-center active:scale-95"
          id="toggle-add-part-form-btn"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-5 h-5" />}
          {showAddForm ? 'إغلاق نافذة العرض' : 'عرض قطعة غيار للبيع'}
        </button>
      </div>

      {/* Add Part for Sale Form */}
      {showAddForm && (
        <div className="bg-neutral-900/80 border border-emerald-500/30 p-6 md:p-8 rounded-3xl space-y-6 animate-fade-in relative overflow-hidden" id="add-part-form-container">
          <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 px-4 py-1 text-[10px] font-mono rounded-bl-xl border-l border-b border-emerald-500/20">
            نموذج إدراج مجاني
          </div>

          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              أدخل تفاصيل قطعة الغيار المراد بيعها
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              املأ البيانات بدقة لمساعدة أصحاب سيارات فورد الأخرى في العثور على قطعتك والتواصل معك فوراً.
            </p>
          </div>

          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-xs md:text-sm font-bold flex items-center gap-2" id="part-success-notif">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl text-red-300 text-xs flex items-center gap-2" id="part-error-notif">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreatePart} className="grid grid-cols-1 md:grid-cols-2 gap-6" id="add-part-form">
            
            {/* Right Column: Key details */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">اسم قطعة الغيار / التفاصيل <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تيل فرامل أمامي فورد فيوجن كسر زيرو"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-right font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">تصنيف الجزء:</label>
                  <select
                    value={partCategory}
                    onChange={(e) => setPartCategory(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
                  >
                    <option value="filters">فلاتر وزيوت</option>
                    <option value="brakes">مكابح / فرامل</option>
                    <option value="engine">محرك وأجزاؤه</option>
                    <option value="suspension">عفشة ومساعدين</option>
                    <option value="accessories">إكسسوارات وكماليات</option>
                    <option value="electrical">كهرباء وإلكترونيات</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">السيارة المتوافقة:</label>
                  <select
                    value={partCarModel}
                    onChange={(e) => setPartCarModel(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
                  >
                    <option value="all">كل طرازات فورد</option>
                    {cars.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">حالة القطعة:</label>
                  <div className="flex bg-neutral-950 border border-neutral-800 rounded-xl p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setPartCondition('new')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${partCondition === 'new' ? 'bg-indigo-600 text-white' : 'text-neutral-500'}`}
                    >
                      جديدة بالتغليف
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartCondition('used')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${partCondition === 'used' ? 'bg-indigo-600 text-white' : 'text-neutral-500'}`}
                    >
                      مستعملة
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">السعر المطلوب بالجنيه (ج.م) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 1500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-left font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 block">وصف فني دقيق وطريقة التسليم أو الشحن بمصر:</label>
                <textarea
                  rows={3}
                  placeholder="مثال: قطعة مستوردة من ألمانيا تناسب موستانج، التسليم الفوري بمصر الجديدة أو بالتجمع الخامس..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Left Column: Image setup & Contact */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Image tab select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 block">صورة القطعة التوضيحية:</label>
                  <div className="flex gap-4 border-b border-neutral-900 pb-2">
                    <button
                      type="button"
                      onClick={() => setImageTab('preset')}
                      className={`text-xs font-bold pb-1 transition-all ${imageTab === 'preset' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-500'}`}
                    >
                      اختر من المعرض الافتراضي
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`text-xs font-bold pb-1 transition-all ${imageTab === 'url' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-500'}`}
                    >
                      رابط صورة مخصص
                    </button>
                  </div>

                  {imageTab === 'preset' ? (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {PART_PRESET_IMAGES.map((img) => (
                        <div
                          key={img.url}
                          onClick={() => setSelectedPresetImage(img.url)}
                          className={`cursor-pointer group relative rounded-lg overflow-hidden border h-14 transition ${
                            selectedPresetImage === img.url ? 'border-amber-400 ring-2 ring-amber-500/10' : 'border-neutral-800'
                          }`}
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-transparent" />
                          <span className="absolute bottom-0 right-0 left-0 bg-black/80 text-[8px] text-white p-0.5 text-center truncate">
                            {img.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="https://example.com/part.jpg"
                      value={customImage}
                      onChange={(e) => setCustomImage(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 text-left font-mono"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">اسم المعلن / المعرض <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: شركة أوتو جميل فورد"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-right"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">رقم واتساب للتواصل <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 01094002675"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-left font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-teal-700 hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl text-xs md:text-sm transition shadow-lg mt-4 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                تأكيد نشر قطعة الغيار فوراً بالدليل
              </button>
            </div>
            
          </form>
        </div>
      )}

      {/* FILTER AND SEARCH CONTROLS */}
      <div className="bg-neutral-900/40 p-5 rounded-2xl border border-neutral-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-96 text-right">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="ابحث عن: تيل فرامل، بوجيهات أو فورد فيوجن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-xs md:text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 transition font-medium"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto" id="filter-selectors">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-neutral-300" id="filter-cat-container text-right">
            <span className="text-[10px] text-neutral-500 font-bold ml-1">التصنيف:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 focus:outline-none font-bold"
            >
              <option value="all" className="bg-neutral-950">كل الأقسام</option>
              <option value="filters" className="bg-neutral-950">فلاتر وزيوت</option>
              <option value="brakes" className="bg-neutral-950">مكابح / فرامل</option>
              <option value="engine" className="bg-neutral-950">محرك وأجزاؤه</option>
              <option value="suspension" className="bg-neutral-950">عفشة ومساعدين</option>
              <option value="accessories" className="bg-neutral-950">إكسسوارات وكماليات</option>
              <option value="electrical" className="bg-neutral-950">كهرباء وإلكترونيات</option>
            </select>
          </div>

          {/* Model Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-neutral-300" id="filter-model-container">
            <span className="text-[10px] text-neutral-500 font-bold ml-1">الموديل:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 focus:outline-none font-bold"
            >
              <option value="all" className="bg-neutral-950">كل طرازات فورد</option>
              {cars.map(c => (
                <option key={c.id} value={c.id} className="bg-neutral-950">{c.name}</option>
              ))}
            </select>
          </div>

          {/* Reset Filter Button if any is chosen */}
          {(selectedCategory !== 'all' || selectedModel !== 'all' || searchTerm !== '') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedModel('all');
                setSearchTerm('');
              }}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] md:text-xs font-bold px-3 py-2 rounded-xl transition"
            >
              تصفير الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* PARTS GRID LISTINGS */}
      {filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="spare-parts-listings-grid">
          {filteredParts.map((part) => {
            const formattedMsg = `مرحباً، أود الاستفسار عن قطعة الغيار المعروضة بموقع ياسين فورد: ${part.name} - السعر: ${part.priceAr}. هل ما زالت متوفرة؟`;
            const waLink = `https://wa.me/20${part.sellerPhone.replace(/^0+/, '')}?text=${encodeURIComponent(formattedMsg)}`;
            const callLink = `tel:${part.sellerPhone}`;

            return (
              <div
                key={part.id}
                className="bg-neutral-950 rounded-2xl border border-neutral-800/80 overflow-hidden hover:border-neutral-700 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 flex flex-col justify-between group"
                id={`part-card-${part.id}`}
              >
                {/* Photo and Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${part.condition === 'new' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {part.conditionAr}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-indigo-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {part.categoryAr}
                    </span>
                  </div>

                  {/* Price overlay */}
                  <div className="absolute bottom-3 right-3 text-right">
                    <span className="text-xl font-mono font-black text-amber-300 bg-neutral-950/85 px-2.5 py-1 rounded-lg border border-neutral-800 shadow">
                      {part.priceAr}
                    </span>
                  </div>
                </div>

                {/* Description and Content */}
                <div className="p-4 space-y-3 text-right flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-neutral-100 group-hover:text-amber-400 transition" id={`part-name-${part.id}`}>
                      {part.name}
                    </h3>

                    {/* Target Car Details */}
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                      <Car className="w-3.5 h-3.5 text-blue-500" />
                      <span>متوافق مع:</span>
                      <span className="text-neutral-200 font-bold">{part.carModelAr}</span>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {part.descriptionAr}
                    </p>
                  </div>

                  {/* Seller Info Block */}
                  <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-800/60 mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400 font-medium">المعلن / البائع:</span>
                      <span className="text-neutral-200 font-bold flex items-center gap-1">
                        {part.sellerName}
                        {part.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">رقم التواصل:</span>
                      <span className="text-indigo-300 font-mono font-bold">{part.sellerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Contact buttons */}
                <div className="grid grid-cols-2 border-t border-neutral-900 bg-neutral-900/20">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3 hover:bg-emerald-950/20 text-xs font-bold text-emerald-400 border-l border-neutral-900 transition active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    استفسار واتساب
                  </a>
                  <a
                    href={callLink}
                    className="flex items-center justify-center gap-1.5 py-3 hover:bg-indigo-950/20 text-xs font-bold text-indigo-400 transition active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    اتصال هاتفي
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-neutral-900/30 border border-neutral-800 py-16 px-6 text-center rounded-3xl space-y-4" id="empty-parts-message">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-600">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-black text-neutral-300">لم نعثر على تطابقات لقطع غيار فورد</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              جرب تغيير الكلمات المفتاحية للبحث أو تصفير تصفية الطرازات والأقسام لعرض كافة القطع المتاحة حالياً بالسوق المصري.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedModel('all');
              setSearchTerm('');
            }}
            className="text-xs bg-indigo-600 hover:bg-indigo-505 text-white font-bold py-2 px-5 rounded-xl transition"
          >
            عرض كافة معروضات قطع الغيار
          </button>
        </div>
      )}

      {/* Useful tips footer for Ford spare parts in Egypt */}
      <div className="bg-neutral-950/50 rounded-2xl p-5 border border-neutral-800 space-y-3 text-right">
        <h4 className="text-xs font-extrabold text-amber-400 flex items-center justify-start gap-1">
          <CheckCircle2 className="w-4 h-4" />
          ملاحظات وإرشادات مهمة لمالكي سيارات فورد في مصر:
        </h4>
        <ul className="text-xs text-neutral-400 list-disc list-inside space-y-1.5 pr-1">
          <li>ننصح دائماً بمقارنة الرقم التسلسلي (Part Number) لقطع الغيار الأصلية قبل إتمام عملية الشراء للتأكد من الملاءمة المثالية.</li>
          <li>المعروضات الفردية يتم التنسيق لأصحابها مباشرة عبر الواتساب، ولطلب قطع غيار الوكالة الحصرية لسيارات فورد فيوجن/فوكاس أو غيرها يمكنك التواصل مع دعم ياسين فورد الرسمي فوراً.</li>
          <li>إذا كان لديك قطع غيار فائضة نتيجة ترقية أو صيانة وتريد بيعها، استخدم زر <strong>"عرض قطعة غيار للبيع"</strong> بالأعلى مجاناً لتصل لآلاف العملاء.</li>
        </ul>
      </div>
    </div>
  );
}
