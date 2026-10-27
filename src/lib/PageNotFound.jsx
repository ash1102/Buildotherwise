import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);
    const { user, isAuthenticated } = useAuth();

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-3">
                        <p className="text-sm font-medium tracking-wide text-muted-foreground">Error 404</p>
                        <h1 className="text-2xl font-medium text-foreground">
                            This page isn’t here
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            We couldn’t find <span className="font-medium text-foreground">“{pageName}”</span>. The link may be old or have a typo.
                        </p>
                    </div>

                    {isAuthenticated && user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-secondary rounded-lg border border-border text-left">
                            <p className="text-sm font-medium text-foreground">Admin note</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                No route matches this address. Check the link, or add the page to the app’s routes.
                            </p>
                        </div>
                    )}

                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/"
                            className="inline-flex min-h-[44px] items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-secondary hover:border-input transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                        >
                            Go to the workbook
                        </Link>
                        <Link
                            to="/about"
                            className="inline-flex min-h-[44px] items-center px-4 py-2 text-sm font-medium text-accent-ink underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring rounded-lg"
                        >
                            About Entrepalooza
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
