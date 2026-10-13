import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import CurriculumHome from '@/pages/CurriculumHome';
import GettingStartedPage from '@/pages/GettingStartedPage';
import ModulePage from '@/pages/ModulePage';
import LessonPage from '@/pages/LessonPage';
import JournalPage from '@/pages/JournalPage';
import LifeMapPage from '@/pages/LifeMapPage';
import DiscoveryRecordPage from '@/pages/DiscoveryRecordPage';
import ProgramLibrary from '@/pages/ProgramLibrary';
import TribeThreads from '@/pages/TribeThreads';
import AspectIndex from '@/pages/AspectIndex';
import AspectPage from '@/pages/AspectPage';
import Settings from '@/pages/Settings';
import DiscoveryMapPage from '@/pages/DiscoveryMapPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Connect from '@/pages/Connect';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginRedirect from '@/components/LoginRedirect';
import PreviewHome from '@/pages/preview/PreviewHome';
import PreviewModulePage from '@/pages/preview/PreviewModulePage';
import PreviewStepPage from '@/pages/preview/PreviewStepPage';
import PreviewNotes from '@/pages/preview/PreviewNotes';
import PreviewReview from '@/pages/preview/PreviewReview';

function AdminOnly() {
  const { user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
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
        <Route path="/getting-started" element={<GettingStartedPage />} />
        <Route path="/module/getting-started" element={<Navigate to="/getting-started" replace />} />
        {/* The workbook itself is for participants. Getting Started's own steps stay open, so those are gated on the step page rather than here. */}
        <Route element={<ProtectedRoute unauthenticatedElement={<LoginRedirect />} />}>
          <Route path="/module/:slug" element={<ModulePage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/map" element={<LifeMapPage />} />
          <Route path="/discovery-map" element={<DiscoveryMapPage />} />
          <Route path="/record" element={<DiscoveryRecordPage />} />
          <Route path="/program-library" element={<ProgramLibrary />} />
          <Route path="/tribe-threads" element={<TribeThreads />} />
        <Route path="/aspects" element={<AspectIndex />} />
          <Route path="/aspect/:slug" element={<AspectPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/lesson/:code" element={<LessonPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/connect" element={<Connect />} />
        <Route element={<AdminOnly />}>
          <Route path="/preview" element={<PreviewHome />} />
          <Route path="/preview/module/:slug" element={<PreviewModulePage />} />
          <Route path="/preview/step/:code" element={<PreviewStepPage />} />
          <Route path="/preview/notes" element={<PreviewNotes />} />
          <Route path="/preview/review" element={<PreviewReview />} />
        </Route>
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