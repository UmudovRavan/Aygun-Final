import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import LingoAssistant from './components/LingoAssistant';
import LandingPage from './pages/LandingPage';
import LibraryPage from './pages/LibraryPage';
import StoryDetailsPage from './pages/StoryDetailsPage';
import StoryReaderPage from './pages/StoryReaderPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import VocabularyPage from './pages/VocabularyPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import BlogPage from './pages/BlogPage';
import BlogDetailsPage from './pages/BlogDetailsPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import LingoAIPage from './pages/LingoAIPage';
import BookmarksPage from './pages/BookmarksPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import AdminStoryDetailPage from './pages/AdminStoryDetailPage';
import AdminRoute from './components/auth/AdminRoute';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/lingo-ai" element={<LingoAIPage />} />
          <Route path="/story/:id" element={<StoryDetailsPage />} />
          <Route path="/read/:id" element={<StoryReaderPage />} />
          <Route path="/quiz/:storyId" element={<QuizPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/story/:id"
            element={
              <AdminRoute>
                <AdminStoryDetailPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <LingoAssistant />
      </LanguageProvider>
    </ThemeProvider>
  );
}
