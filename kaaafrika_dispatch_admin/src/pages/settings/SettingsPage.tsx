import { Settings } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3 animate-fade-in">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
        <Settings className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-base font-semibold text-slate-500">Settings</p>
      <p className="text-sm text-slate-400">Admin settings coming soon</p>
    </div>
  );
}
