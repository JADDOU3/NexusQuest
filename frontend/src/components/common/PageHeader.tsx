import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
  iconGradient: string;
  subtitle?: string;
  backTo?: string;
  theme: 'dark' | 'light';
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  icon, 
  iconGradient, 
  subtitle, 
  backTo = '/dashboard',
  theme,
  actions
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={`border-b sticky top-0 z-50 ${theme === 'dark' ? 'border-gray-800/50 bg-gray-950/80' : 'border-gray-200 bg-white/80'} backdrop-blur-xl shadow-sm`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(backTo)} className="hover:bg-gray-800/50">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${iconGradient} flex items-center justify-center shadow-lg`}>
                {icon}
              </div>
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
