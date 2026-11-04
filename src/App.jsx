import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginRedirect from '@/components/LoginRedirect';

// Every route loads its own code on first visit, so the first screen starts faster in the WebView.
const PageNotFound = lazy(() => import('./lib/PageNotFound'));
const CurriculumHome = lazy(() => import('@/pages/CurriculumHome'));
const GettingStartedPage = lazy(() => import('@/pages/GettingStartedPage'));
const ModulePage = lazy(() => import('@/pages/ModulePage'));
const LessonPage = lazy(() => import('@/pages/LessonPage'));
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const JournalReflection = lazy(() => import('@/pages/JournalReflection'));
const LifeMapPage = lazy(() => import('@/pages/LifeMapPage'));
const DiscoveryRecordPage = lazy(() => import('@/pages/DiscoveryRecordPage'));
const MyRecordsPage = lazy(() => import('@/pages/MyRecordsPage'));
const ProgramLibrary = lazy(() => import('@/pages/ProgramLibrary'));
const TribeThreads = lazy(() => import('@/pages/TribeThreads'));
const AspectIndex = lazy(() => import('@/pages/AspectIndex'));
const AspectPage = lazy(() => import('@/pages/AspectPage'));
const Settings = lazy(() => import('@/pages/Settings'));
const DiscoveryMapPage = lazy(() => import('@/pages/DiscoveryMapPage'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const OAuthConsent = lazy(() => import('@/pages/OAuthConsent'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Connect = lazy(() => import('@/pages/Connect'));
const Mission = lazy(() => import('@/pages/Mission'));
const Programs = lazy(() => import('@/pages/Programs'));
const GetInvolved = lazy(() => import('@/pages/GetInvolved'));
const PreviewHome = lazy(() => import('@/pages/preview/PreviewHome'));
const PreviewModulePage = lazy(() => import('@/pages/preview/PreviewModulePage'));
const PreviewStepPage = lazy(() => import('@/pages/preview/PreviewStepPage'));
const PreviewNotes = lazy(() => import('@/pages/preview/PreviewNotes'));
const PreviewReview = lazy(() => import('@/pages/preview/PreviewReview'));

function RouteFallback() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  );
}

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
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

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
    }
    // An unauthenticated visitor may still use the public pages and the
    // app's email/password login. ProtectedRoute handles private pages.
  }

  // Render the main app
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<Layout />}>
          {/* The home page is public: signed-out visitors see the front door, signed-in people see their workbook (CurriculumHome decides). */}
          <Route path="/" element={<CurriculumHome />} />
          {/* Lessons and modules are readable only when signed in, so every workbook page needs an account. */}
          <Route element={<ProtectedRoute unauthenticatedElement={<LoginRedirect />} />}>
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/module/getting-started" element={<Navigate to="/getting-started" replace />} />
            <Route path="/module/:slug" element={<ModulePage />} />
            <Route path="/lesson/:code" element={<LessonPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/reflect" element={<JournalReflection />} />
            <Route path="/map" element={<LifeMapPage />} />
            <Route path="/discovery-map" element={<DiscoveryMapPage />} />
            <Route path="/record" element={<DiscoveryRecordPage />} />
            {/* Old /my-discoveries links still work: that page is now part of the Discovery Record. */}
            <Route path="/my-discoveries" element={<Navigate to="/record" replace />} />
            <Route path="/my-records" element={<MyRecordsPage />} />
            <Route path="/program-library" element={<ProgramLibrary />} />
            <Route path="/tribe-threads" element={<TribeThreads />} />
            <Route path="/aspects" element={<AspectIndex />} />
            <Route path="/aspect/:slug" element={<AspectPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/get-involved" element={<GetInvolved />} />
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
    </Suspense>
  );
};


class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Entrepalooza application error', error, info); }
  render() {
    if (this.state.error) return <main style={{padding:'2rem',fontFamily:'system-ui',color:'#222'}}><h1>Entrepalooza couldn't open</h1><p>The preview encountered an application error. Your saved work has not been changed.</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{this.state.error.message}</pre><button onClick={() => window.location.reload()}>Try again</button></main>;
    return this.props.children;
  }
}

function App() {

  return (
    <AppErrorBoundary><AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider></AppErrorBoundary>
  )
}

export default App
