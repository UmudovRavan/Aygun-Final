import { motion } from 'framer-motion';

type Variant = 'idle' | 'happy' | 'sad' | 'thinking' | 'wave' | 'celebrate' | 'excited' | 'clap' | 'reading' | 'study';

interface Props {
  variant?: Variant;
  size?: number;
  mood?: Variant;
  className?: string;
}

export default function LingoMascot({ variant = 'idle', size = 64, mood, className = '' }: Props) {
  const v = mood || variant;
  const eyeShape = v === 'happy' || v === 'celebrate' || v === 'excited' || v === 'clap' ? 'happy' : v === 'sad' ? 'sad' : 'normal';
  const mouthPath = v === 'happy' || v === 'celebrate' || v === 'excited' || v === 'clap'
    ? 'M32 44 Q40 52 48 44'
    : v === 'sad'
    ? 'M32 48 Q40 42 48 48'
    : v === 'thinking'
    ? 'M35 46 Q42 44 48 47'
    : 'M34 45 Q40 49 46 45';

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={v === 'idle' || v === 'reading' || v === 'study' ? { y: [0, -4, 0] } : {}}
      transition={v === 'idle' || v === 'reading' || v === 'study' ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <ellipse cx="40" cy="48" rx="22" ry="24" fill="#1e293b" />
      <ellipse cx="40" cy="52" rx="14" ry="16" fill="#f8fafc" />
      <circle cx="40" cy="28" r="20" fill="#1e293b" />
      <ellipse cx="40" cy="30" rx="14" ry="11" fill="#f8fafc" />
      {eyeShape === 'happy' ? (
        <>
          <path d="M32 26 Q34 22 36 26" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M44 26 Q46 22 48 26" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : eyeShape === 'sad' ? (
        <>
          <circle cx="34" cy="27" r="2.5" fill="#0f172a" />
          <circle cx="46" cy="27" r="2.5" fill="#0f172a" />
          <path d="M32 24 L36 26" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M44 26 L48 24" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="34" cy="27" r="3" fill="#0f172a" />
          <circle cx="46" cy="27" r="3" fill="#0f172a" />
          <circle cx="35" cy="26" r="1" fill="#fff" />
          <circle cx="47" cy="26" r="1" fill="#fff" />
        </>
      )}
      <circle cx="28" cy="34" r="3" fill="#fca5a5" opacity="0.6" />
      <circle cx="52" cy="34" r="3" fill="#fca5a5" opacity="0.6" />
      <path d={mouthPath} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M37 33 L43 33 L40 37 Z" fill="#f59e0b" />
      <path d="M24 44 Q40 50 56 44 L54 50 Q40 55 26 50 Z" fill="#f59e0b" />
      <path d="M52 48 L56 58 L50 55 Z" fill="#d97706" />
      <ellipse cx="18" cy="50" rx="6" ry="10" fill="#0f172a" transform="rotate(-15 18 50)" />
      <ellipse cx="62" cy="50" rx="6" ry="10" fill="#0f172a" transform="rotate(15 62 50)" />
      <ellipse cx="33" cy="72" rx="5" ry="3" fill="#f59e0b" />
      <ellipse cx="47" cy="72" rx="5" ry="3" fill="#f59e0b" />
      {(v === 'wave' || v === 'celebrate' || v === 'clap') && (
        <motion.g animate={{ rotate: [0, 20, 0] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ transformOrigin: '62px 40px' }}>
          <ellipse cx="66" cy="32" rx="4" ry="8" fill="#0f172a" transform="rotate(30 66 32)" />
        </motion.g>
      )}
      {v === 'reading' && (
        <g>
          <rect x="22" y="38" width="36" height="22" rx="2" fill="#fff" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="40" y1="38" x2="40" y2="60" stroke="#0f172a" strokeWidth="1" />
          <line x1="26" y1="44" x2="36" y2="44" stroke="#94a3b8" strokeWidth="1" />
          <line x1="26" y1="48" x2="36" y2="48" stroke="#94a3b8" strokeWidth="1" />
          <line x1="26" y1="52" x2="34" y2="52" stroke="#94a3b8" strokeWidth="1" />
          <line x1="44" y1="44" x2="54" y2="44" stroke="#94a3b8" strokeWidth="1" />
          <line x1="44" y1="48" x2="54" y2="48" stroke="#94a3b8" strokeWidth="1" />
          <line x1="44" y1="52" x2="52" y2="52" stroke="#94a3b8" strokeWidth="1" />
        </g>
      )}
      {v === 'study' && (
        <g>
          <circle cx="58" cy="22" r="8" fill="#fbbf24" opacity="0.3" />
          <text x="58" y="26" textAnchor="middle" fontSize="10" fill="#0f172a">?</text>
        </g>
      )}
    </motion.svg>
  );
}
