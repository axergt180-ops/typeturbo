// lib/seo.ts - SEO Configuration untuk setiap bahasa

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
}

export const seoConfig: Record<string, SEOConfig> = {
  indonesian: {
    title: 'Tes Mengetik Bahasa Indonesia - Typemeteor',
    description: 'Tes Mengetik - Typemeteor menawarkan tes kecepatan mengetik gratis dalam Bahasa Indonesia. Anda dapat mengukur kecepatan mengetik Anda, meningkatkan kemampuan mengetik Anda, dan bersaing dengan pengguna lain.',
    keywords: ['tes mengetik', 'kecepatan mengetik', 'typing test', 'bahasa indonesia', 'WPM', 'words per minute', 'typemeteor'],
    ogTitle: 'Tes Mengetik Bahasa Indonesia - Ukur Kecepatan Mengetik Anda',
    ogDescription: 'Tes kecepatan mengetik gratis dalam Bahasa Indonesia. Tingkatkan kemampuan mengetik dan bersaing dengan pengguna lainnya.'
  },
  english: {
    title: 'English Typing Test - Typemeteor',
    description: 'Typing Test - Typemeteor offers a free online English Typing Speed Test. You can measure your typing skills, improve your typing speed, and compete with other users.',
    keywords: ['typing test', 'typing speed', 'english typing', 'WPM', 'words per minute', 'typemeteor'],
    ogTitle: 'English Typing Test - Measure Your Typing Speed',
    ogDescription: 'Free online English typing speed test. Improve your typing skills and compete with users worldwide.'
  },
  spanish: {
    title: 'Prueba de Mecanografía en Español - Typemeteor',
    description: 'Prueba de Mecanografía - Typemeteor ofrece una prueba gratuita de velocidad de mecanografía en español. Puedes medir tus habilidades de mecanografía, mejorar tu velocidad y competir con otros usuarios.',
    keywords: ['prueba de mecanografía', 'velocidad de mecanografía', 'español', 'WPM', 'palabras por minuto', 'typemeteor'],
    ogTitle: 'Prueba de Mecanografía en Español - Mide tu Velocidad',
    ogDescription: 'Prueba gratuita de velocidad de mecanografía en español. Mejora tus habilidades y compite con usuarios de todo el mundo.'
  },
  french: {
    title: 'Test de Dactylographie Français - Typemeteor',
    description: 'Test de Dactylographie - Typemeteor propose un test de vitesse de frappe gratuit en français. Vous pouvez mesurer vos compétences en dactylographie, améliorer votre vitesse et rivaliser avec d\'autres utilisateurs.',
    keywords: ['test de dactylographie', 'vitesse de frappe', 'français', 'MPM', 'mots par minute', 'typemeteor'],
    ogTitle: 'Test de Dactylographie Français - Mesurez Votre Vitesse',
    ogDescription: 'Test gratuit de vitesse de frappe en français. Améliorez vos compétences et rivalisez avec des utilisateurs du monde entier.'
  },
  german: {
    title: 'Tippgeschwindigkeitstest Deutsch - Typemeteor',
    description: 'Tippgeschwindigkeitstest - Typemeteor bietet einen kostenlosen Online-Tippgeschwindigkeitstest auf Deutsch. Sie können Ihre Tippfähigkeiten messen, Ihre Geschwindigkeit verbessern und mit anderen Benutzern konkurrieren.',
    keywords: ['tippgeschwindigkeitstest', 'tippgeschwindigkeit', 'deutsch', 'WPM', 'wörter pro minute', 'typemeteor'],
    ogTitle: 'Tippgeschwindigkeitstest Deutsch - Messen Sie Ihre Geschwindigkeit',
    ogDescription: 'Kostenloser Online-Tippgeschwindigkeitstest auf Deutsch. Verbessern Sie Ihre Fähigkeiten und konkurrieren Sie weltweit.'
  },
  portuguese: {
    title: 'Teste de Digitação em Português - Typemeteor',
    description: 'Teste de Digitação - Typemeteor oferece um teste gratuito de velocidade de digitação em português. Você pode medir suas habilidades de digitação, melhorar sua velocidade e competir com outros usuários.',
    keywords: ['teste de digitação', 'velocidade de digitação', 'português', 'PPM', 'palavras por minuto', 'typemeteor'],
    ogTitle: 'Teste de Digitação em Português - Meça Sua Velocidade',
    ogDescription: 'Teste gratuito de velocidade de digitação em português. Melhore suas habilidades e compita com usuários do mundo todo.'
  },
  japanese: {
    title: 'タイピングテスト 日本語 - Typemeteor',
    description: 'タイピングテスト - Typemeteorは日本語の無料オンラインタイピング速度テストを提供しています。タイピングスキルを測定し、速度を向上させ、他のユーザーと競争できます。',
    keywords: ['タイピングテスト', 'タイピング速度', '日本語', 'WPM', '1分間の単語数', 'typemeteor'],
    ogTitle: 'タイピングテスト 日本語 - タイピング速度を測定',
    ogDescription: '日本語の無料オンラインタイピング速度テスト。スキルを向上させ、世界中のユーザーと競争しましょう。'
  },
  italian: {
    title: 'Test di Dattilografia Italiano - Typemeteor',
    description: 'Test di Dattilografia - Typemeteor offre un test gratuito di velocità di digitazione in italiano. Puoi misurare le tue abilità di dattilografia, migliorare la tua velocità e competere con altri utenti.',
    keywords: ['test di dattilografia', 'velocità di digitazione', 'italiano', 'PPM', 'parole al minuto', 'typemeteor'],
    ogTitle: 'Test di Dattilografia Italiano - Misura la Tua Velocità',
    ogDescription: 'Test gratuito di velocità di digitazione in italiano. Migliora le tue abilità e competi con utenti di tutto il mondo.'
  },
  russian: {
    title: 'Тест Скорости Печати Русский - Typemeteor',
    description: 'Тест Скорости Печати - Typemeteor предлагает бесплатный онлайн-тест скорости печати на русском языке. Вы можете измерить свои навыки печати, улучшить скорость и соревноваться с другими пользователями.',
    keywords: ['тест скорости печати', 'скорость печати', 'русский', 'слов в минуту', 'typemeteor'],
    ogTitle: 'Тест Скорости Печати Русский - Измерьте Свою Скорость',
    ogDescription: 'Бесплатный онлайн-тест скорости печати на русском языке. Улучшите свои навыки и соревнуйтесь с пользователями по всему миру.'
  },
  korean: {
    title: '타이핑 테스트 한국어 - Typemeteor',
    description: '타이핑 테스트 - Typemeteor는 한국어 무료 온라인 타이핑 속도 테스트를 제공합니다. 타이핑 기술을 측정하고 속도를 향상시키며 다른 사용자와 경쟁할 수 있습니다.',
    keywords: ['타이핑 테스트', '타이핑 속도', '한국어', '분당 단어', 'typemeteor'],
    ogTitle: '타이핑 테스트 한국어 - 타이핑 속도 측정',
    ogDescription: '한국어 무료 온라인 타이핑 속도 테스트. 기술을 향상시키고 전 세계 사용자와 경쟁하세요.'
  },
  chinese: {
    title: '打字测试 中文 - Typemeteor',
    description: '打字测试 - Typemeteor提供免费的中文在线打字速度测试。您可以测量您的打字技能，提高打字速度，并与其他用户竞争。',
    keywords: ['打字测试', '打字速度', '中文', '每分钟字数', 'typemeteor'],
    ogTitle: '打字测试 中文 - 测量您的打字速度',
    ogDescription: '免费的中文在线打字速度测试。提高您的技能并与全球用户竞争。'
  },
  arabic: {
    title: 'اختبار الكتابة بالعربية - Typemeteor',
    description: 'اختبار الكتابة - يقدم Typemeteor اختبار سرعة الكتابة المجاني عبر الإنترنت باللغة العربية. يمكنك قياس مهارات الكتابة الخاصة بك وتحسين سرعتك والتنافس مع المستخدمين الآخرين.',
    keywords: ['اختبار الكتابة', 'سرعة الكتابة', 'عربي', 'كلمات في الدقيقة', 'typemeteor'],
    ogTitle: 'اختبار الكتابة بالعربية - قس سرعة كتابتك',
    ogDescription: 'اختبار مجاني لسرعة الكتابة باللغة العربية عبر الإنترنت. حسّن مهاراتك وتنافس مع المستخدمين حول العالم.'
  },
  dutch: {
    title: 'Typesnelheidstest Nederlands - Typemeteor',
    description: 'Typesnelheidstest - Typemeteor biedt een gratis online typesnelheidstest in het Nederlands. U kunt uw typvaardigheden meten, uw snelheid verbeteren en concurreren met andere gebruikers.',
    keywords: ['typesnelheidstest', 'typesnelheid', 'nederlands', 'WPM', 'woorden per minuut', 'typemeteor'],
    ogTitle: 'Typesnelheidstest Nederlands - Meet Uw Snelheid',
    ogDescription: 'Gratis online typesnelheidstest in het Nederlands. Verbeter uw vaardigheden en concurreer wereldwijd.'
  },
  turkish: {
    title: 'Yazma Hızı Testi Türkçe - Typemeteor',
    description: 'Yazma Hızı Testi - Typemeteor Türkçe ücretsiz çevrimiçi yazma hızı testi sunar. Yazma becerilerinizi ölçebilir, hızınızı artırabilir ve diğer kullanıcılarla yarışabilirsiniz.',
    keywords: ['yazma hızı testi', 'yazma hızı', 'türkçe', 'dakika başına kelime', 'typemeteor'],
    ogTitle: 'Yazma Hızı Testi Türkçe - Hızınızı Ölçün',
    ogDescription: 'Türkçe ücretsiz çevrimiçi yazma hızı testi. Becerilerinizi geliştirin ve dünya çapında yarışın.'
  },
  thai: {
    title: 'ทดสอบความเร็วในการพิมพ์ ภาษาไทย - Typemeteor',
    description: 'ทดสอบความเร็วในการพิมพ์ - Typemeteor นำเสนอการทดสอบความเร็วในการพิมพ์ออนไลน์ฟรีภาษาไทย คุณสามารถวัดทักษะการพิมพ์ พัฒนาความเร็ว และแข่งขันกับผู้ใช้คนอื่นๆ',
    keywords: ['ทดสอบความเร็วในการพิมพ์', 'ความเร็วในการพิมพ์', 'ภาษาไทย', 'คำต่อนาที', 'typemeteor'],
    ogTitle: 'ทดสอบความเร็วในการพิมพ์ ภาษาไทย - วัดความเร็วของคุณ',
    ogDescription: 'ทดสอบความเร็วในการพิมพ์ออนไลน์ฟรีภาษาไทย พัฒนาทักษะและแข่งขันกับผู้ใช้ทั่วโลก'
  },
  vietnamese: {
    title: 'Kiểm Tra Tốc Độ Gõ Tiếng Việt - Typemeteor',
    description: 'Kiểm Tra Tốc Độ Gõ - Typemeteor cung cấp bài kiểm tra tốc độ gõ trực tuyến miễn phí bằng tiếng Việt. Bạn có thể đo kỹ năng gõ phím, cải thiện tốc độ và cạnh tranh với người dùng khác.',
    keywords: ['kiểm tra tốc độ gõ', 'tốc độ gõ', 'tiếng việt', 'từ mỗi phút', 'typemeteor'],
    ogTitle: 'Kiểm Tra Tốc Độ Gõ Tiếng Việt - Đo Tốc Độ Của Bạn',
    ogDescription: 'Kiểm tra tốc độ gõ trực tuyến miễn phí bằng tiếng Việt. Cải thiện kỹ năng và cạnh tranh với người dùng toàn cầu.'
  },
  hindi: {
    title: 'टाइपिंग टेस्ट हिंदी - Typemeteor',
    description: 'टाइपिंग टेस्ट - Typemeteor हिंदी में मुफ्त ऑनलाइन टाइपिंग स्पीड टेस्ट प्रदान करता है। आप अपने टाइपिंग कौशल को माप सकते हैं, अपनी गति में सुधार कर सकते हैं और अन्य उपयोगकर्ताओं के साथ प्रतिस्पर्धा कर सकते हैं।',
    keywords: ['टाइपिंग टेस्ट', 'टाइपिंग स्पीड', 'हिंदी', 'प्रति मिनट शब्द', 'typemeteor'],
    ogTitle: 'टाइपिंग टेस्ट हिंदी - अपनी गति मापें',
    ogDescription: 'हिंदी में मुफ्त ऑनलाइन टाइपिंग स्पीड टेस्ट। अपने कौशल में सुधार करें और दुनिया भर के उपयोगकर्ताओं के साथ प्रतिस्पर्धा करें।'
  }
};

// Homepage SEO
export const homepageSEO: SEOConfig = {
  title: 'Typemeteor - Free Typing Speed Test in 17 Languages',
  description: 'Test your typing speed with Typemeteor. Free online typing test available in 17 languages including Indonesian, English, Spanish, French, German, and more. Improve your WPM and compete on the leaderboard.',
  keywords: ['typing test', 'typing speed', 'WPM', 'words per minute', 'multilingual typing', 'free typing test', 'typemeteor'],
  ogTitle: 'Typemeteor - Test Your Typing Speed in Multiple Languages',
  ogDescription: 'Free online typing speed test in 17 languages. Measure your WPM, track your progress, and compete with typists worldwide.'
};