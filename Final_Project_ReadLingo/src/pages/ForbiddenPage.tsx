import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import LingoMascot from '../components/ui/LingoMascot';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-mesh dark:bg-surface-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <LingoMascot variant="thinking" size={100} />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <ShieldX size={32} className="text-danger-500" />
          <h1 className="font-display text-6xl font-bold gradient-text">403</h1>
        </div>
        <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">Access Forbidden</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          Oops! You don't have permission to access this page. If you believe this is an error, please contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard"><Button variant="gradient" size="lg" leftIcon={<ArrowLeft size={18} />}>Go to Dashboard</Button></Link>
          <Link to="/"><Button variant="secondary" size="lg">Back Home</Button></Link>
        </div>
      </div>
    </div>
  );
}
