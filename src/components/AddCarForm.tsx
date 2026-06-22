import React, { useState } from 'react';
import { FordCar } from '../types';
import { PlusCircle, Sparkles, AlertCircle, Check, Car, Image as ImageIcon } from 'lucide-react';

interface AddCarFormProps {
  onAddCar: (newCar: FordCar) => void;
}

export default function AddCarForm({ onAddCar }: AddCarFormProps) {
  // Form fields state
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [tagline, setTagline] = useState('');
  const [taglineEn, setTaglineEn] = useState('');
  const [category, setCategory] = useState<'sports' | 'suvs-crossovers' | 'trucks' | 'sedans'>('sedans');
  const [priceStartAr, setPriceStartAr] = useState('');
  const [priceEstimate, setPriceEstimate] = useState<number>(1000000);
  const [engineAr, setEngineAr] = useState('');
  const [horsepower, setHorsepower] = useState<number>(180);
  const [torque, setTorque] = useState('');
  const [acceleration, setAcceleration] = useState('');
  const [transmissionAr, setTransmissionAr] = useState('');
  const [driveTypeAr, setDriveTypeAr] = useState('دفع أمامي');
  const [fuelEconomyAr, setFuelEconomyAr] = useState('');
  const [fuelTypeAr, setFuelTypeAr] = useState('بنزين ٩٥');
  const [seats, setSeats] = useState<number>(5);
  const [descriptionAr, setDescriptionAr] = useState('');
  const [feature1, setFeature1] = useState('');
  const [feature2, setFeature2] = useState('');
  const [feature3, setFeature3] = useState('');
  
  // High-quality image options that can be quick-selected by the admin
  const PRESET_IMAGES = [
    { name: 'فورد فيوجن الفاخرة', path: '/src/assets/images/ford_fusion_egypt_1782162667497.jpg' },
    { name: 'فورد إيدج SUV العائلية', path: '/src/assets/images/ford_edge_egypt_1782162724945.jpg' },
    { name: 'فورد فوكاس سيدان', path: '/src/assets/images/ford_focus_egypt_1782161780739.jpg' },
    { name: 'فورد بوما كروس أوفر', path: '/src/assets/images/ford_puma_egypt_1782161796424.jpg' },
    { name: 'فورد موستانج الرياضية', path: '/src/assets/images/mustang_gt_1782161616041.jpg' },
    { name: 'فورد برونكو باد لاندز', path: '/src/assets/images/bronco_offroad_1782161647781.jpg' },
  ];

  const [selectedImagePath, setSelectedImagePath] = useState(PRESET_IMAGES[1].path);
  const [customImagePath, setCustomImagePath] = useState('');
  const [imageType, setImageType] = useState<'preset' | 'custom'>('preset');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !nameEn.trim()) {
      setErrorMsg('الرجاء تعبئة اسم السيارة باللغتين العربية والإنجليزية لضمان عرضها بشكل صحيح.');
      return;
    }

    if (!priceStartAr.trim()) {
      setErrorMsg('الرجاء إدخال السعر التقريبي بالفورمات المصري (مثال: ١,٨٥٠,٠٠٠ ج.م)');
      return;
    }

    const finalImage = imageType === 'preset' ? selectedImagePath : (customImagePath || 'https://picsum.photos/600/400');

    // Create unique dynamic ID
    const carId = nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newCar: FordCar = {
      id: carId,
      name: name.trim(),
      nameEn: nameEn.trim(),
      tagline: tagline.trim() || 'قوة وجمال التصميم من فورد',
      taglineEn: taglineEn.trim() || 'Uncompromising Ford strength and style',
      category,
      categoryAr: category === 'sedans' ? 'سيدان فاخرة' : category === 'suvs-crossovers' ? 'كروس أوفر / SUV' : category === 'trucks' ? 'بيك اب / شاحنات' : 'رياضية فائقة',
      priceStartAr: priceStartAr.trim(),
      priceEstimate: Number(priceEstimate) || 1000000,
      engine: 'EcoBoost Turbocharged Engine',
      engineAr: engineAr.trim() || '١.٥ لتر إيكوبوست تيربو',
      horsepower: Number(horsepower) || 180,
      torque: torque.trim() || '٢٤٠ نيوتن-متر',
      acceleration: acceleration.trim() || '٨.٥ ثانية',
      transmission: 'Automatic Transmission',
      transmissionAr: transmissionAr.trim() || 'أتوماتيك ٨ سرعات',
      driveTypeAr: driveTypeAr,
      fuelEconomyAr: fuelEconomyAr.trim() || '٦.٥ لتر / ١٠٠ كم',
      fuelTypeAr: fuelTypeAr,
      seats: Number(seats) || 5,
      descriptionAr: descriptionAr.trim() || `سيارة فورد ${name.trim()} الجديدة كلياً متوفرة الآن في المعرض بتجهيزاتها الذكية الحصرية والأمان الفائق للتنقل المثالي والراحة الفخمة على الطرق المصرية.`,
      featuresAr: [
        feature1.trim() || 'شاشة ترفيه ملونة عالية الدقة تعمل باللمس',
        feature2.trim() || 'ثبات ونظام أمان متقدم مع وسائد هوائية كاملة',
        feature3.trim() || 'تكييف رقمي أوتوماتيكي ثنائي المخارج مع فتحات خلفية'
      ],
      colors: [
        { name: 'أبيض لؤلؤي قطبي', hex: '#F9FAFB', nameEn: 'Polar White' },
        { name: 'رمادي مغناطيسي فخم', hex: '#4B5563', nameEn: 'Magnetic Gray' },
        { name: 'أسود معتم ملكي', hex: '#111827', nameEn: 'Shadow Black' },
        { name: 'أزرق كوزميك مجسم', hex: '#1E3A8A', nameEn: 'Cosmic Blue' }
      ],
      image: finalImage,
      bannerImage: finalImage,
      performanceScore: category === 'sports' ? 95 : 85,
      utilityScore: category === 'suvs-crossovers' || category === 'trucks' ? 95 : 80,
      techScore: 90
    };

    onAddCar(newCar);
    setSuccessMsg(`تمت إضافة سيارة فورد "${name}" إلى المعرض الرقمي بنجاح! وسوف تظهر مباشرة في قائمة السيارات وفي خيارات التخصيص والمقارنة.`);
    
    // Reset form fields
    setName('');
    setNameEn('');
    setTagline('');
    setTaglineEn('');
    setPriceStartAr('');
    setPriceEstimate(1000000);
    setEngineAr('');
    setHorsepower(180);
    setTorque('');
    setAcceleration('');
    setTransmissionAr('');
    setFuelEconomyAr('');
    setDescriptionAr('');
    setFeature1('');
    setFeature2('');
    setFeature3('');
    setCustomImagePath('');
  };

  return (
    <div className="bg-neutral-900/60 p-6 md:p-8 rounded-3xl border border-neutral-800 space-y-6 text-right" id="add-car-container">
      <div>
        <h3 className="text-2xl font-black text-white flex items-center justify-start gap-2" id="add-car-title">
          <PlusCircle className="w-7 h-7 text-emerald-500" />
          إضافة موديل سيارة فورد جديد للمعرض
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          يمكنك تعبئة بيانات الموديل المراد إضافته ليعرض فوراً للعملاء وبأدوات التخصيص والطلب.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-sm space-y-1" id="add-car-success">
          <div className="font-bold flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>نجاح العملية!</span>
          </div>
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl text-red-300 text-xs flex items-center gap-2" id="add-car-error">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" id="add-car-form">
        {/* Section 1: Main Names & Price */}
        <div className="bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 space-y-4">
          <h4 className="text-sm font-bold text-amber-300 pb-2 border-b border-neutral-900">المعلومات الأساسية للموديل</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">الاسم بالعربية <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="مثال: فورد إيدج"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 focus:outline-none focus:border-blue-500 text-right font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">الاسم بالإنجليزية <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="مثال: Ford Edge"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 focus:outline-none focus:border-blue-500 text-left font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-200">الشعار التسويقي للسيارة بالعربية:</label>
              <input
                type="text"
                placeholder="مثال: الفخامة المطلقة والرحابة العائلية التي تستحقها"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-right"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-200">الشعار التسويقي بالإنجليزية:</label>
              <input
                type="text"
                placeholder="مثال: Unrivalled luxury for premium families"
                value={taglineEn}
                onChange={(e) => setTaglineEn(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 text-left font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">فئة السيارة الهيكلية <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
              >
                <option value="sedans">سيدان أو هاتشباك</option>
                <option value="suvs-crossovers">كروس أوفر / SUV العائلية</option>
                <option value="trucks">بيك اب / شاحنات نقل</option>
                <option value="sports">رياضية فائقة الأداء</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">سعر البداية بالعربية مصر <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="مثال: ٢,١٥٠,٠٠٠ ج.م"
                value={priceStartAr}
                onChange={(e) => setPriceStartAr(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-right font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">المبلغ الرقمي للتقييم والتخصيص (بالجنيه):</label>
              <input
                type="number"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(Number(e.target.value))}
                min={100}
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-left font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Technical Specs */}
        <div className="bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 space-y-4">
          <h4 className="text-sm font-bold text-amber-300 pb-2 border-b border-neutral-900">المواصفات الفنية المتقدمة</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">سعة ونوع المحرك:</label>
              <input
                type="text"
                placeholder="مثال: ٢.٠ لتر تيربو ٤ سلندر"
                value={engineAr}
                onChange={(e) => setEngineAr(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">القوة الحصانية (Horsepower):</label>
              <input
                type="number"
                value={horsepower}
                onChange={(e) => setHorsepower(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-left font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">العزم الأقصى للدوران:</label>
              <input
                type="text"
                placeholder="مثال: ٣٤٠ نيوتن-متر"
                value={torque}
                onChange={(e) => setTorque(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">زمن التسارع 0 - 100 كم / س:</label>
              <input
                type="text"
                placeholder="مثال: ٧.٨ ثانية"
                value={acceleration}
                onChange={(e) => setAcceleration(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-left font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">ناقل الحركة والدوران:</label>
              <input
                type="text"
                placeholder="مثال: أتوماتيك ٨ سرعات"
                value={transmissionAr}
                onChange={(e) => setTransmissionAr(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">نوع الجر:</label>
              <select
                value={driveTypeAr}
                onChange={(e) => setDriveTypeAr(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
              >
                <option value="دفع أمامي ديناميكي">دفع أمامي</option>
                <option value="دفع خلفي مسار حلبة">دفع خلفي</option>
                <option value="دفع رباعي ذكي">دفع رباعي</option>
                <option value="دفع كلي متطور">دفع كلي مستمر</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">استهلاك الوقود الزمني كمتوسط:</label>
              <input
                type="text"
                placeholder="مثال: ٦.٨ لتر / ١٠٠ كم"
                value={fuelEconomyAr}
                onChange={(e) => setFuelEconomyAr(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">نوع الوقود المناسب:</label>
              <input
                type="text"
                value={fuelTypeAr}
                onChange={(e) => setFuelTypeAr(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">عدد المقاعد العائلية:</label>
              <input
                type="number"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                min={2}
                max={9}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-200 text-left font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Visual & Details Description */}
        <div className="bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 space-y-4">
          <h4 className="text-sm font-bold text-amber-300 pb-2 border-b border-neutral-900">الملامح والصورة والمميزات الرائدة</h4>

          {/* Preset or Custom Image selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-200 block">صورة السيارة المعروضة في المعرض:</label>
            
            <div className="flex gap-4 mb-3 border-b border-neutral-900 pb-3" id="image-selection-tabs">
              <button
                type="button"
                onClick={() => setImageType('preset')}
                className={`py-1.5 px-4 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  imageType === 'preset' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Car className="w-4 h-4" />
                الاختيار من خلفيات فورد الاحترافية بمصر
              </button>
              <button
                type="button"
                onClick={() => setImageType('custom')}
                className={`py-1.5 px-4 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  imageType === 'custom' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                وضع رابط صورة مخصص
              </button>
            </div>

            {imageType === 'preset' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" id="preset-images-grid">
                {PRESET_IMAGES.map((img) => {
                  const isChosen = selectedImagePath === img.path;
                  return (
                    <div
                      key={img.path}
                      onClick={() => setSelectedImagePath(img.path)}
                      className={`cursor-pointer group relative rounded-xl overflow-hidden border transition ${
                        isChosen ? 'border-amber-400 ring-4 ring-amber-500/10' : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <img src={img.path} alt={img.name} className="w-full h-16 object-cover" />
                      <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-transparent transition" />
                      <span className="absolute bottom-1 right-1 left-1 bg-black/80 text-[9px] text-white p-0.5 rounded text-center truncate">
                        {img.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="https://example.com/car-photo.jpg"
                  value={customImagePath}
                  onChange={(e) => setCustomImagePath(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 text-left font-mono"
                />
                <p className="text-[10px] text-neutral-500">ضع هنا رابط مباشر لصورة فورد بصيغة jpg أو png.</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 block">الوصف التسويقي الشامل باللغة العربية للسيارة بمصر:</label>
            <textarea
              rows={3}
              placeholder="اكتب خلاصة مواصفات فورد الجديدة والمميزات المنافسة لها..."
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs md:text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 3 highlights */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 block">أبرز ٣ تكنولوجيات / تفاصيل بالمقصورة للسيارة:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="أبرز ميزة ١ (شاشة ترفيه ملونة تعمل باللمس مقاس 12 بوصة)"
                value={feature1}
                onChange={(e) => setFeature1(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200"
              />
              <input
                type="text"
                placeholder="أبرز ميزة ٢ (ثبات ديناميكي إلكتروني متقدم ESP)"
                value={feature2}
                onChange={(e) => setFeature2(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200"
              />
              <input
                type="text"
                placeholder="أبرز ميزة ٣ (أنظمة الأمان والوسائد الهوائية الـ٩ الذكية)"
                value={feature3}
                onChange={(e) => setFeature3(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-teal-700 hover:opacity-90 text-white font-extrabold py-3.5 rounded-2xl text-xs md:text-sm transition shadow-lg shadow-emerald-950/20 active:scale-95 flex items-center justify-center gap-1.5"
        >
          <PlusCircle className="w-5 h-5" />
          تأكيد إضافة سيارة فورد الجديدة وعرضها بالمعرض فوراً!
        </button>
      </form>
    </div>
  );
}
