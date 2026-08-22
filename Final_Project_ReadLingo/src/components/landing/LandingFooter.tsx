import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Github,
  Heart,
  type LucideIcon,
} from 'lucide-react';

const columns: {
  title: string;
  links: { label: string; to: string }[];
}[] = [
  {
    title: 'Product',
    links: [
      { label: 'Library', to: '/library' },
      { label: 'Flashcards', to: '/flashcards' },
      { label: 'Quiz', to: '/quiz' },
      { label: 'Pricing', to: '/#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/#about' },
      { label: 'Blog', to: '/#blog' },
      { label: 'Careers', to: '/#careers' },
      { label: 'Press', to: '/#press' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '/contact' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy Policy', to: '/#privacy' },
      { label: 'Terms of Service', to: '/#terms' },
    ],
  },
];

const socials: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
  { icon: Github, label: 'GitHub', href: 'https://github.com' },
];

export function LandingFooter() {
  return (
    <footer className="relative bg-ink-50 dark:bg-ink-950 border-t border-ink-200 dark:border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="py-14 grid gap-10 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 max-w-sm">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path
                    d="M2 5.5C2 4.67 2.67 4 3.5 4H10c1.1 0 2 .9 2 2v14c-1.5-1-3-1-5-1H3.5c-.83 0-1.5-.67-1.5-1.5v-12zM22 5.5C22 4.67 21.33 4 20.5 4H14c-1.1 0-2 .9-2 2v14c1.5-1 3-1 5-1h3.5c.83 0 1.5-.67 1.5-1.5v-12z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-ink-900 dark:text-white">
                Read<span className="text-primary-500">Lingo</span>
              </span>
            </Link>
            <p className="text-ink-500 dark:text-ink-400 leading-relaxed mb-6">
              Learn English through engaging stories, AI-powered guidance, and gamified practice.
              Build your vocabulary and confidence, one story at a time.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ y: -3 }}
                    className="w-9 h-9 rounded-lg bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 flex items-center justify-center text-ink-500 dark:text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-800 transition-colors"
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display font-bold text-ink-900 dark:text-white mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-500 dark:text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-ink-200 dark:border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-400 text-center sm:text-left">
            © {new Date().getFullYear()} Read<span className="text-primary-400">Lingo</span>. All rights reserved.
          </p>
          <p className="text-sm text-ink-400 flex items-center gap-1.5">
            Made with
            <Heart className="w-4 h-4 fill-error-500 text-error-500" />
            for English learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
