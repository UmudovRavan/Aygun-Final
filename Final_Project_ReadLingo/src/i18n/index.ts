import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const pricingDataAZ = {
  free: {
    name: 'Pulsuz',
    price: '$0',
    period: 'həmişə',
    cta: 'Pulsuz Başla',
    features: [
      'Gündəlik 5 AI Mesajı ✨',
      'Gündə 3 hekayə oxu',
      'Əsas Lüğət İzləmə',
      'Ürək Sistemi ❤️',
      'Gündəlik Seriya',
      'İcma Dəstəyi'
    ]
  },
  pro: {
    name: 'Pro',
    price: '$3.99',
    period: 'ay başına',
    cta: 'Pro-ya keç',
    features: [
      'Pulsuz plandakı hər şey +',
      'Gündəlik 50 AI Mesajı ⚡',
      'Limitsiz Hekayə Girişi',
      'Tam Lüğət İzləmə',
      'Limitsiz Ürək ♾️',
      'Qrammatika İzahı & Analiz',
      'Reklamsız Təcrübə',
      'Prioritet Dəstək'
    ]
  },
  premium: {
    name: 'Premium',
    price: '$6.99',
    period: 'ay başına',
    cta: 'Premium-a keç',
    features: [
      '♾️ Limitsiz 24/7 AI Təlimçi 👑',
      'AI Fərdi Hekayə Generatoru 🌲',
      'Limitsiz Hekayə Girişi',
      'Tam Lüğət İzləmə',
      'Limitsiz Ürək ♾️',
      'Prioritet Yüksək Sürətli AI',
      'Xüsusi Öyrənmə Yolları',
      'Oflayn Oxu & İmtahanlar'
    ]
  }
};

export const pricingDataEN = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    cta: 'Start Free',
    features: [
      '5 Daily AI Tutor Messages ✨',
      'Read 3 stories/day',
      'Basic Vocabulary Tracking',
      'Heart System ❤️',
      'Daily Streak',
      'Community Support'
    ]
  },
  pro: {
    name: 'Pro',
    price: '$3.99',
    period: 'per month',
    cta: 'Go Pro',
    features: [
      'Everything in Free +',
      '50 Daily AI Messages ⚡',
      'Unlimited Story Access',
      'Full Vocabulary Tracking',
      'Unlimited Hearts ♾️',
      'Grammar Check & Analysis',
      'Ad-Free Experience',
      'Priority Support'
    ]
  },
  premium: {
    name: 'Premium',
    price: '$6.99',
    period: 'per month',
    cta: 'Go Premium',
    features: [
      '♾️ Unlimited 24/7 AI Tutor 👑',
      'AI Custom Story Generator 🌲',
      'Unlimited Story Access',
      'Full Vocabulary Tracking',
      'Unlimited Hearts ♾️',
      'Priority High-Speed AI',
      'Custom Learning Paths',
      'Offline Reading & Quizzes'
    ]
  }
};

const resources = {
  en: {
    translation: {
      nav: { home: 'Home', library: 'Library', dashboard: 'Dashboard', vocabulary: 'Vocabulary', progress: 'Progress', profile: 'Profile', contact: 'Contact', blog: 'Blog', pricing: 'Pricing', faq: 'FAQ', settings: 'Settings', signIn: 'Sign In', signUp: 'Get Started', signOut: 'Sign Out' },
      hero: { badge: 'AI-Powered English Learning', title: 'Learn English Through Stories', subtitle: 'Read captivating stories at your level, learn new words in context, and track your progress. Powered by AI.', cta: 'Start Learning Free', browse: 'Browse Library', learners: '12,000+ learners', levels: '6 CEFR levels' },
      sections: {
        features: 'Why ReadLingo?', featuresSub: 'Everything you need to master English, one story at a time',
        howItWorks: 'How It Works', howItWorksSub: 'Three simple steps to start your journey',
        storyPreview: 'Story Preview', storyPreviewSub: 'See what reading with ReadLingo looks like',
        categories: 'Browse by Category', categoriesSub: 'Find stories that match your interests',
        pricing: 'Simple, Transparent Pricing', pricingSub: 'Choose the plan that fits your learning journey. Cancel anytime.',
        cta: 'Ready to Start Your Journey?', ctaSub: 'Join thousands of learners improving their English one story at a time.',
      },
      features: {
        context: { title: 'Learn in Context', desc: 'Words appear in real stories, so you remember them naturally — not from boring lists.' },
        ai: { title: 'AI Tutor Lingo', desc: 'Get instant word definitions, translations, and personalized story recommendations.' },
        progress: { title: 'Track Progress', desc: 'Watch your vocabulary grow, your streak build, and your level rise day by day.' },
      },
      how: {
        step1: { title: 'Choose Your Level', desc: 'Take a quick placement test or pick your CEFR level from A1 to C2.' },
        step2: { title: 'Read Stories', desc: 'Tap any word for instant definitions and translations. Read at your own pace.' },
        step3: { title: 'Practice & Learn', desc: 'Take quizzes, earn XP, and watch your vocabulary grow with each story.' },
      },
      pricing: pricingDataEN,
      auth: { signIn: 'Welcome back', signInSub: 'Sign in to continue your learning journey', signUp: 'Create your account', signUpSub: 'Start learning English through stories today', fullName: 'Full Name', email: 'Email', password: 'Password', forgot: 'Forgot password?', google: 'Continue with Google', or: 'or', noAccount: "Don't have an account?", haveAccount: 'Already have an account?', back: 'Back' },
      forgot: { title: 'Forgot Password', subtitle: 'Enter your email and we\'ll send you a reset link', send: 'Send Reset Link', sent: 'Check your email! We\'ve sent a password reset link.', back: 'Back to Sign In' },
      common: { loading: 'Loading...', readMore: 'Read More', readArticle: 'Read Article', popular: 'MOST POPULAR', back: 'Back' },
      lingo: { title: 'Ask Lingo', subtitle: 'Your AI reading assistant', placeholder: 'Ask about ReadLingo...', send: 'Send' },
    },
  },
  az: {
    translation: {
      nav: { home: 'Ana səhifə', library: 'Kitabxana', dashboard: 'Panel', vocabulary: 'Lüğət', progress: 'Tərəqqi', profile: 'Profil', contact: 'Əlaqə', blog: 'Bloq', pricing: 'Qiymət', faq: 'SSS', settings: 'Ayarlar', signIn: 'Daxil ol', signUp: 'Başla', signOut: 'Çıxış' },
      hero: { badge: 'AI ilə İngilis dili öyrənmə', title: 'Hekayələrlə İngilis dili öyrən', subtitle: 'Səviyyənizə uyğun hekayələr oxuyun, yeni sözləri kontekstdə öyrənin və tərəqqinizi izləyin. AI ilə gücləndirilmiş.', cta: 'Pulsuz Başla', browse: 'Kitabxanaya bax', learners: '12,000+ tələbə', levels: '6 CEFR səviyyəsi' },
      sections: {
        features: 'Niyə ReadLingo?', featuresSub: 'İngilis dilini mükəmməlləşdirmək üçün hər şey, hər dəfə bir hekayə',
        howItWorks: 'Necə İşləyir', howItWorksSub: 'Səyahətinizə başlamaq üçün üç sadə addım',
        storyPreview: 'Hekayə Önizləməsi', storyPreviewSub: 'ReadLingo ilə oxumanın necə olduğunu görün',
        categories: 'Kateqoriyaya görə gözdən keçir', categoriesSub: 'Maraqlarınıza uyğun hekayələr tapın',
        pricing: 'Sadə, Şəffaf Qiymət', pricingSub: 'Öyrənmə səyahətinizə uyğun planı seçin. İstənilən vaxt ləğv edin.',
        cta: 'Səyahətinizə Başlamağa Hazırsınız?', ctaSub: 'Minlərlə tələbənin İngilis dilini hər gün bir hekayə ilə yaxşılaşdırdığı yerə qoşulun.',
      },
      features: {
        context: { title: 'Kontekstdə Öyrən', desc: 'Sözlər real hekayələrdə görünür, buna görə onları təbii olaraq xatırlayırsınız.' },
        ai: { title: 'AI Təlimçi Lingo', desc: 'Anlıq söz tərifləri, tərcümələr və şəxiləşdirilmiş hekayə tövsiyələri alın.' },
        progress: { title: 'Tərəqqini İzlə', desc: 'Lüğətinizin böyüməsini, seriyalarınızın artmasını və səviyyənizin yüksəlməsini izləyin.' },
      },
      how: {
        step1: { title: 'Səviyyənizi Seçin', desc: 'Qısa yerləşdirmə testi keçin və ya A1-dən C2-yə qədər CEFR səviyyənizi seçin.' },
        step2: { title: 'Hekayələr Oxuyun', desc: 'Anlıq təriflər və tərcümələr üçün istənilən sözə toxunun. Öz tempinizdə oxuyun.' },
        step3: { title: 'Praktika və Öyrən', desc: 'Quizlər keçin, XP qazanın və hər hekayə ilə lüğətinizin böyümsini görün.' },
      },
      pricing: pricingDataAZ,
      auth: { signIn: 'Xoş gəlmisiniz', signInSub: 'Öyrənmə səyahətinizə davam etmək üçün daxil olun', signUp: 'Hesabınızı yaradın', signUpSub: 'Bu gün hekayələrlə İngilis dili öyrənməyə başlayın', fullName: 'Tam Ad', email: 'Email', password: 'Şifrə', forgot: 'Şifrəni unutdunuz?', google: 'Google ilə davam edin', or: 'və ya', noAccount: 'Hesabınız yoxdur?', haveAccount: 'Artıq hesabınız var?', back: 'Geri' },
      forgot: { title: 'Şifrəni Unutdunuz', subtitle: 'Emailinizi daxil edin və biz sizə sıfırlama linki göndərəcəyik', send: 'Sıfırlama Linki Göndər', sent: 'Emailinizi yoxlayın! Şifrə sıfırlama linki göndərdik.', back: 'Girişə Geri Qayıt' },
      common: { loading: 'Yüklənir...', readMore: 'Daha Çox Oxu', readArticle: 'Məqaləni Oxu', popular: 'ƏN POPULYAR', back: 'Geri' },
      lingo: { title: 'Linqo-ya Sor', subtitle: 'Sizin AI oxu köməkçiniz', placeholder: 'ReadLingo haqqında soruş...', send: 'Göndər' },
    },
  },
  ru: {
    translation: {
      nav: { home: 'Главная', library: 'Библиотека', dashboard: 'Панель', vocabulary: 'Словарь', progress: 'Прогресс', profile: 'Профиль', contact: 'Контакт', blog: 'Блог', pricing: 'Цены', faq: 'Вопросы', settings: 'Настройки', signIn: 'Войти', signUp: 'Начать', signOut: 'Выйти' },
      hero: { badge: 'Изучение английского с ИИ', title: 'Учите английский через истории', subtitle: 'Читайте увлекательные истории по своему уровню, учите новые слова в контексте и отслеживайте прогресс. На базе ИИ.', cta: 'Начать бесплатно', browse: 'Смотреть библиотеку', learners: '12,000+ учеников', levels: '6 уровней CEFR' },
      sections: {
        features: 'Почему ReadLingo?', featuresSub: 'Всё для освоения английского, по одной истории за раз',
        howItWorks: 'Как это работает', howItWorksSub: 'Три простых шага для начала',
        storyPreview: 'Предпросмотр истории', storyPreviewSub: 'Посмотрите, как выглядит чтение с ReadLingo',
        categories: 'По категориям', categoriesSub: 'Найдите истории по своим интересам',
        pricing: 'Простые, прозрачные цены', pricingSub: 'Выберите план для своего обучения. Отмена в любой момент.',
        cta: 'Готовы начать путешествие?', ctaSub: 'Присоединяйтесь к тысячам учеников, улучшающих английский по одной истории за раз.',
      },
      features: {
        context: { title: 'Учите в контексте', desc: 'Слова встречаются в реальных историях, поэтому вы запоминаете их естественно.' },
        ai: { title: 'ИИ-наставник Линго', desc: 'Мгновенные определения слов, переводы и персональные рекомендации историй.' },
        progress: { title: 'Отслеживайте прогресс', desc: 'Следите, как растёт словарный запас, серия дней и уровень день за днём.' },
      },
      how: {
        step1: { title: 'Выберите уровень', desc: 'Пройдите быстрый тест или выберите уровень CEFR от A1 до C2.' },
        step2: { title: 'Читайте истории', desc: 'Нажмите на слово для мгновенного определения и перевода. Читайте в своём темпе.' },
        step3: { title: 'Практикуйтесь', desc: 'Проходите тесты, зарабатывайте XP и наблюдайте, как растёт словарный запас.' },
      },
      pricing: {
        free: { name: 'Бесплатно', price: '$0', period: 'навсегда', cta: 'Начать бесплатно', features: ['3 истории/день', 'Базовое отслеживание словаря', 'Система сердец ❤️', 'Ежедневная серия', 'Поддержка сообщества'] },
        pro: { name: 'Pro', price: '$3.99', period: 'в месяц', cta: 'Перейти на Pro', features: ['Всё из бесплатного +', 'Безлимитный доступ к историям', 'Полное отслеживание словаря', 'Безлимитные сердца ♾️', 'Чат с ИИ-наставником', 'Детальная аналитика прогресса', 'Без рекламы', 'Приоритетная поддержка'] },
        premium: { name: 'Premium', price: '$6.99', period: 'в месяц', cta: 'Перейти на Premium', features: ['Безлимитный доступ к историям', 'Полное отслеживание словаря', 'Безлимитные сердца ♾️', 'Чат с ИИ-наставником', 'Детальная аналитика прогресса', 'Без рекламы', 'Приоритетная поддержка', 'ИИ-генерация персональных историй', 'Офлайн чтение', 'Персональные пути обучения', 'Индивидуальная практика с ИИ'] },
      },
      auth: { signIn: 'С возвращением', signInSub: 'Войдите, чтобы продолжить обучение', signUp: 'Создайте аккаунт', signUpSub: 'Начните учить английский через истории сегодня', fullName: 'Полное имя', email: 'Email', password: 'Пароль', forgot: 'Забыли пароль?', google: 'Войти через Google', or: 'или', noAccount: 'Нет аккаунта?', haveAccount: 'Уже есть аккаунт?', back: 'Назад' },
      forgot: { title: 'Забыли пароль', subtitle: 'Введите email, и мы отправим ссылку для сброса', send: 'Отправить ссылку', sent: 'Проверьте почту! Мы отправили ссылку для сброса пароля.', back: 'Назад ко входу' },
      common: { loading: 'Загрузка...', readMore: 'Читать далее', readArticle: 'Читать статью', popular: 'ПОПУЛЯРНЫЙ', back: 'Назад' },
      lingo: { title: 'Спросите Линго', subtitle: 'Ваш ИИ-помощник для чтения', placeholder: 'Спросите о ReadLingo...', send: 'Отправить' },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

