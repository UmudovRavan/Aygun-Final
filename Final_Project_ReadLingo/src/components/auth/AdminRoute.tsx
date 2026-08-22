import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, adminService } from '../../services';
import { LoadingState } from '../ui/Loading';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      // 1. Check local token and JWT claims
      if (!authService.isAuthenticated() || !authService.isAdmin()) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
          navigate('/admin-login?error=unauthorized', { replace: true });
        }
        return;
      }

      // 2. Strict backend verification: Call protected Admin API to verify token validity
      try {
        await adminService.getStats();
        if (isMounted) {
          setIsAuthorized(true);
          setIsVerifying(false);
        }
      } catch (err: any) {
        console.error('Admin token verification failed:', err);
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
          navigate('/admin-login?error=session_expired', { replace: true });
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-ink-950">
        <LoadingState message="Verifying administrator security credentials..." />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
