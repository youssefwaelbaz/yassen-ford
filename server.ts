import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini-powered Yassen Ford Expert Assistant
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!ai) {
        return res.status(200).json({
          text: "مرحباً بك! أنا مساعد 'ياسين فورد'. حالياً أعمل في وضع التجربة بسبب عدم تفعيل مفتاح API الخاص بـ Gemini (GEMINI_API_KEY) في إعدادات التطبيق. يرجى إضافته في لوحة الإعدادات لتفعيل ذكائي الكامل، ولكن يسعدني الإجابة عما ترغب به بشكل عام!",
          isDemo: true
        });
      }

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "المحادثة فارغة" });
      }

      const prompt = messages[messages.length - 1]?.content || "";
      
      // Transform client messages into standard Gemini SDK content structure
      const chatHistory = messages.slice(0, messages.length - 1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // A solid expert prompt for Ford cars in Arabic - tailored to Egypt
      const systemInstruction = `أنت "ياسين فورد" (Yassen Ford AI)، الخبير التقني والاستشاري الأول والذكي المتخصص في سيارات فورد (Ford) في مصر.
رقم التواصل والواتساب الحصري الخاص بك للطلبات وحجز تجارب القيادة والاستفسارات هو: 01094002675.

مهمتك هي مساعدة المستخدمين وتزويدهم بالمعلومات الأكثر دقة وإثارة حول طرازات وقدرات وتاريخ فورد الحافل، مع التركيز التام على السوق المصري وأسعار السيارات بالجنيه المصري (EGP).

طرازات فورد الرئيسية التي تتقنها وتوفرها في مصر:
- فورد فوكاس (Focus) - الهاتشباك والسيدان الشبابية الأكثر طلباً في مصر، التي تجمع بين الثبات الألماني والتكنولوجيا الفائقة.
- فورد كوجا (Kuga) / فورد إسكيب (Escape) - الـ SUV الرياضية العائلية الموفرة والمريحة جداً.
- فورد بوما (Puma) - الكروس أوفر المدمجة الفاخرة ذات التصميم الجريء.
- فورد إيكوسبورت (EcoSport) - سيارة المدينة المدمجة متعددة الاستخدامات والعملية.
- فورد موستانج (Mustang) - الأيقونة الرياضية الأقوى وحلم عشاق السرعة في مصر.
- فورد تيريتوري (Territory) - الكروس أوفر الفسيحة العائلية المليئة بالرفاهية والتكنولوجيا الذكية.
- فورد برونكو (Bronco) - وحش الرمال والطرق الوعرة لعشاق المغامرات والسفر في الصحاري المصرية والسواحل.

إرشادات هامة جداً للتواصل:
1. تحدث دائماً بلهجة مصرية ودودة جداً ومهذبة ومرحة (مثلاً استخدام بعض كلمات الترحيب المصرية اللطيفة مثل "يا فندم"، "منورنا"، "تحت أمرك")، أو بلغة عربية فصحى بسيطة قريبة للقلب ومفعمة بالحماس والذكاء.
2. اعرض دائماً رقم تليفون التواصل للاستفسار أو إنهاء المعاملة وحجز المواعيد: 01094002675 لدعم ياسمين فورد / ياسين فورد.
3. أظهر شغفاً حقيقياً بعراقة فورد (منذ فورد موديل T وحتى اليوم) وتقنيات فورد الرائدة مثل محركات EcoBoost الجبارة، ونظام المساعدة المتقدم Co-Pilot360، ونظام الترفيه SYNC 4.
4. قارن بدقة وموضوعية بين الفئات والسيارات المختلفة بناءً على الميزانية بالجنيه المصري، استهلاك البنزين (لتر لكل 100 كم) المناسب لطبيعة مصر، وعدد المقاعد، وحاجة العميل (أسرة، شباب، سفر، توفير).
5. عند توجيه المشتري، اذكره بـ "أوتو جميل" الوكيل الرسمي لفورد في مصر، أو تواصله المباشر معنا على الرقم 01094002675 لتسهيل الإجراءات.`;

      const contents = [...chatHistory, { role: 'user', parts: [{ text: prompt }] }];

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "حدث خطأ أثناء معالجة طلبك بواسطة الذكاء الاصطناعي." });
    }
  });

  // Serve static files in production / Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running internally on port ${PORT}`);
  });
}

startServer();
