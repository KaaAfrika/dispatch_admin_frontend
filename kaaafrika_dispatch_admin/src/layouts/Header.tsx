import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { admin } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-100 flex-shrink-0">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white" />
        </button>

        {/* Admin */}
        {admin && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {admin.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{admin.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{admin.role?.replace('_', ' ') ?? ''}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
