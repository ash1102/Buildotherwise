import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import CurriculumHome from '@/pages/CurriculumHome';
import ModulePage from '@/pages/ModulePage';
import LessonPage from '@/pages/LessonPage';
import JournalPage from '@/pages/JournalPage';
import LifeMapPage from '@/pages/LifeMapPage';
import DiscoveryRecordPage from '@/pages/DiscoveryRecordPage';
import ProgramLibrary from '@/pages/ProgramLibrary';
import TribeThreads from '@/pages/TribeThreads';
import JournalReflection from '@/pages/JournalReflection';
import ContentReview from '@/pages/ContentReview';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import AgentAccess from '@/pages/AgentAccess';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CurriculumHome />} />
        <Route path="/module/:slug" element={<ModulePage />} />
        <Route path="/lesson/:code" element={<LessonPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/map" element={<LifeMapPage />} />
        <Route path="/record" element={<DiscoveryRecordPage />} />
        <Route path="/program-library" element={<ProgramLibrary />} />
        <Route path="/tribe-threads" element={<TribeThreads />} />
        <Route path="/journal-reflection" element={<JournalReflection />} />
        <Route path="/content-review" element={<ContentReview />} />
        <Route path="/agent-access" element={<AgentAccess />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App