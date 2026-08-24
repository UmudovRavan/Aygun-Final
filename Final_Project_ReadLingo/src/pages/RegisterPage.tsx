import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock, Sparkles, Check } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import FormInput from '../components/auth/FormInput';
import PasswordInput from '../components/auth/PasswordInput';
import SocialButtons from '../components/auth/SocialButtons';
import AuthDivider from '../components/auth/AuthDivider';
import Button from '../components/ui/Button';
import { authService } from '../services';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const nativeLanguages = [
  { value: 'Azerbaijani', label: 'Azərbaycan', flag: '🇦🇿', desc: 'Ana diliniz' },
  { value: 'Turkish', label: 'Türkçe', flag: '🇹🇷', desc: 'Anadiliniz' },
  { value: 'Russian', label: 'Русский', flag: '🇷🇺', desc: 'Родной язык' },
  { value: 'English', label: 'English', flag: '🇬🇧', desc: 'Native speaker' },
  { value: 'Spanish', label: 'Español', flag: '🇪🇸', desc: 'Idioma materno' },
  { value: 'German', label: 'Deutsch', flag: '🇩🇪', desc: 'Muttersprache' },
  { value: 'French', label: 'Français', flag: '🇫🇷', desc: 'Langue maternelle' },
  { value: 'Arabic', label: 'العربية', flag: '🇸🇦', desc: 'اللغة الأم' },
];

const cefrLevels = [
  { value: 'A1', label: 'Beginner', desc: 'A1 - Yeni başlayıram', detail: 'Sadə cümlələr və təməl sözlər' },
  { value: 'A2', label: 'Elementary', desc: 'A2 - İbtidai səviyyə', detail: 'Gündəlik ifadələr və qısa mətnlər' },
  { value: 'B1', label: 'Intermediate', desc: 'B1 - Orta səviyyə', detail: 'Geniş mövzuları başa düşmək' },
  { value: 'B2', label: 'Upper Int.', desc: 'B2 - Yüksək orta', detail: 'Mürəkkəb mətnləri oxumaq' },
  { value: 'C1', label: 'Advanced', desc: 'C1 - İrəliləmiş', detail: 'Sərbəst və sürətli oxu' },
  { value: 'C2', label: 'Proficient', desc: 'C2 - Mükəmməl', detail: 'Hər növ mətni tam mənimsəmə' },
];

const dailyGoals = [
  { minutes: 5, label: '5 dəqiqə / gün', badge: 'Asan', wordsPerYear: '1,000+', desc: 'Yüngül və rahat öyrənmə tempi' },
  { minutes: 10, label: '10 dəqiqə / gün', badge: 'Standart', wordsPerYear: '2,000+', desc: 'Hər gün davamlı tərəqqi' },
  { minutes: 15, label: '15 dəqiqə / gün', badge: '⭐ Tövsiyə olunan', wordsPerYear: '3,500+', recommended: true, desc: 'Ən effektiv gündəlik öyrənmə balansı' },
  { minutes: 30, label: '30 dəqiqə / gün', badge: 'Ciddi', wordsPerYear: '6,000+', desc: 'Sürətli inkişaf və daha çox hekayə' },
  { minutes: 45, label: '45 dəqiqə / gün', badge: 'İntensiv', wordsPerYear: '9,000+', desc: 'Maksimum tərəqqi və dərin öyrənmə' },
];

const benefits = ['Free forever plan included', 'No credit card required', 'Access 500+ stories instantly'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('Azerbaijani');
  const [learningLevel, setLearningLevel] = useState('A1');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(15);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = 'Ad və soyad tələb olunur';
    else if (name.trim().length < 2) e.name = 'Ad ən azı 2 simvol olmalıdır';
    if (!email.trim()) e.email = 'Email tələb olunur';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Düzgün email daxil edin';
    if (!password) e.password = 'Şifrə tələb olunur';
    else if (password.length < 6) e.password = 'Şifrə ən azı 6 simvol olmalıdır';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!validateStep1()) return;
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.register(name, email, password, nativeLanguage, learningLevel, dailyGoalMinutes);
      navigate('/verify-email', {
        state: {
          email,
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Hesab yaradılarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const selectedGoal = dailyGoals.find((g) => g.minutes === dailyGoalMinutes) || dailyGoals[2];

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Hesabınızı Yaradın ✨';
      case 2:
        return 'Ana Dilinizi Seçin 🌐';
      case 3:
        return 'İngilis Dili Səviyyəniz 🎓';
      case 4:
        return 'Gündəlik Hədəfiniz ⏱️';
      default:
        return 'Qeydiyyat';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1:
        return 'Öyrənməyə başlamaq üçün məlumatlarınızı daxil edin';
      case 2:
        return 'Sözlərin lüğət və tərcümələri bu dildə təqdim olunacaq';
      case 3:
        return 'Sizə uyğun hekayələri təklif etmək üçün səviyyənizi seçin';
      case 4:
        return 'Gündəlik oxu vərdişi üçün rahat vaxt təyin edin';
      default:
        return '';
    }
  };

  const getMascotVariant = () => {
    switch (step) {
      case 1:
        return 'excited';
      case 2:
        return 'thinking';
      case 3:
        return 'wave';
      case 4:
        return 'happy';
      default:
        return 'excited';
    }
  };

  return (
    <AuthLayout
      mascotVariant={getMascotVariant()}
      welcomeMessage={getStepTitle()}
      subtitle={getStepSubtitle()}
    >
      {/* Progress step bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-surface-500 dark:text-surface-400 mb-2">
          <span>Addım {step} / {totalSteps}</span>
          <span className="text-primary-600 dark:text-primary-400 font-bold">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 text-sm text-danger-700 dark:text-danger-400 animate-fade-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: Name, Email, Password */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleNextFromStep1}
            className="space-y-4"
          >
            <FormInput
              label="Ad və Soyad"
              type="text"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              touched={touched.name}
              error={errors.name}
              placeholder="Məs: Rəvan Umudov"
              autoComplete="name"
            />

            <FormInput
              label="Email Ünvanı"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              touched={touched.email}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <PasswordInput
              label="Şifrə"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              touched={touched.password}
              error={errors.password}
              hint="Ən azı 6 simvol olmalıdır"
              placeholder="Güclü şifrə yaradın"
              autoComplete="new-password"
            />

            <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                className="mt-1 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800"
              />
              <span className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                İstifadə <a href="#" className="font-medium text-primary-600 dark:text-primary-400">Şərtləri</a> və{' '}
                <a href="#" className="font-medium text-primary-600 dark:text-primary-400">Məxfilik Qaydaları</a> ilə razıyam
              </span>
            </label>

            <Button type="submit" variant="gradient" fullWidth size="lg" disabled={!agreed}>
              Davam Et
              <ArrowRight size={18} />
            </Button>

            <div className="pt-2">
              <AuthDivider />
              <SocialButtons />
            </div>

            <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-5">
              Artıq hesabınız var?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                Daxil Olun
              </Link>
            </p>
          </motion.form>
        )}

        {/* STEP 2: Native Language Selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {nativeLanguages.map((lang) => {
                const active = nativeLanguage === lang.value;
                return (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setNativeLanguage(lang.value)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all relative flex items-center gap-3 ${
                      active
                        ? 'border-primary-500 bg-primary-50/80 dark:bg-primary-500/10 shadow-sm'
                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 bg-white dark:bg-surface-800/60'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-surface-900 dark:text-white truncate">{lang.label}</p>
                      <p className="text-[11px] text-surface-400 truncate">{lang.desc}</p>
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)} leftIcon={<ArrowLeft size={18} />}>
                Geri
              </Button>
              <Button type="button" variant="gradient" size="lg" className="flex-1" onClick={() => setStep(3)} rightIcon={<ArrowRight size={18} />}>
                Səviyyəni Seç
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: English CEFR Level Selection */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="space-y-2.5 max-h-[330px] overflow-y-auto pr-1">
              {cefrLevels.map((lvl) => {
                const active = learningLevel === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setLearningLevel(lvl.value)}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                      active
                        ? 'border-primary-500 bg-primary-50/80 dark:bg-primary-500/10 shadow-sm'
                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 bg-white dark:bg-surface-800/60'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-base shrink-0 ${
                      active ? 'bg-primary-600 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200'
                    }`}>
                      {lvl.value}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-surface-900 dark:text-white">{lvl.desc}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{lvl.detail}</p>
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep(2)} leftIcon={<ArrowLeft size={18} />}>
                Geri
              </Button>
              <Button type="button" variant="gradient" size="lg" className="flex-1" onClick={() => setStep(4)} rightIcon={<ArrowRight size={18} />}>
                Hədəfi Təyin Et
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Daily Reading Goal */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {dailyGoals.map((g) => {
                const active = dailyGoalMinutes === g.minutes;
                return (
                  <button
                    key={g.minutes}
                    type="button"
                    onClick={() => setDailyGoalMinutes(g.minutes)}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 ${
                      active
                        ? 'border-primary-500 bg-primary-50/80 dark:bg-primary-500/10 shadow-sm'
                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 bg-white dark:bg-surface-800/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      active ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
                    }`}>
                      <Clock size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-surface-900 dark:text-white">{g.label}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          g.recommended
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                            : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
                        }`}>
                          {g.badge}
                        </span>
                      </div>
                      <p className="text-xs text-surface-400 truncate mt-0.5">{g.desc}</p>
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Projection Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex items-center gap-2.5 shadow-md">
              <Sparkles size={20} className="shrink-0 text-amber-300 animate-pulse" />
              <p className="text-xs leading-relaxed">
                Bu temp ilə ildə təxminən <strong>{selectedGoal.wordsPerYear} yeni ingilis sözü</strong> öyrənəcəksiniz!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep(3)} leftIcon={<ArrowLeft size={18} />} disabled={loading}>
                Geri
              </Button>
              <Button
                type="button"
                variant="gradient"
                size="lg"
                className="flex-1"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Hesab yaradılır...
                  </>
                ) : (
                  <>
                    Qeydiyyatı Tamamla
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800 space-y-2">
        {benefits.map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-surface-400">
            <CheckCircle2 size={14} className="text-success-500" />
            {item}
          </div>
        ))}
      </div>
    </AuthLayout>
  );
}
