import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Search, 
  User, 
  Package, 
  Shield, 
  Clock,
  ArrowRight,
} from 'lucide-react';
import { activityLogsApi } from '../../api/activity-logs';
import { Pagination } from '../../components/ui/Pagination';
import type { ActivityLogFilters } from '../../types';

export function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ActivityLogFilters>({
    per_page: 25,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', page, filters],
    queryFn: () => activityLogsApi.list({ ...filters, page }),
  });

  const logs = data?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">Audit Trail</p>
            <p className="text-xs text-slate-400">System-wide activity and changes</p>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input pl-9 h-10 text-sm"
            placeholder="Search by log name or event..."
            onChange={(e) => setFilters({ ...filters, log_name: e.target.value })}
          />
        </div>
        <select 
          className="input h-10 text-sm w-40"
          onChange={(e) => setFilters({ ...filters, event: e.target.value || undefined })}
        >
          <option value="">All Events</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
        </select>
        <div className="flex items-center gap-2">
           <input 
             type="date" 
             className="input h-10 text-sm w-36"
             onChange={(e) => setFilters({ ...filters, from: e.target.value || undefined })}
           />
           <span className="text-slate-300">to</span>
           <input 
             type="date" 
             className="input h-10 text-sm w-36"
             onChange={(e) => setFilters({ ...filters, to: e.target.value || undefined })}
           />
        </div>
      </div>

      {/* Logs table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-5 py-3">Event / Log</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Admin (Causer)</th>
              <th className="px-5 py-3">Changes / Reason</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-5 py-6 bg-slate-50/20" />
                </tr>
              ))
            ) : logs?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm italic">
                  No activity logs found matching your criteria
                </td>
              </tr>
            ) : (
              logs?.data.map((log) => (
                <tr key={log.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                       <EventIcon event={log.event} />
                       <span className="font-bold text-slate-700 capitalize text-xs">
                         {log.description.split('.')[1]?.replace(/_/g, ' ') || log.event}
                       </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{log.log_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                       <SubjectIcon type={log.subject_type} />
                       <div>
                         <p className="text-xs font-semibold text-slate-700">
                           {log.subject?.tracking_code || log.subject?.name || `ID: ${log.subject_id}`}
                         </p>
                         <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                           {log.subject_type.split('\\').pop()}
                         </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {log.causer ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-[10px] font-bold text-brand-600">
                          {log.causer.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-600">{log.causer.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">System</span>
                    )}
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    {log.properties.reason && (
                      <p className="text-xs text-slate-500 italic mb-1">"{log.properties.reason}"</p>
                    )}
                    {log.properties.before && log.properties.after && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.keys(log.properties.after).slice(0, 2).map(key => (
                          <div key={key} className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-500">
                            <span className="font-bold">{key}:</span>
                            <span className="line-through opacity-50">{String(log.properties.before?.[key])}</span>
                            <ArrowRight className="w-2 h-2" />
                            <span className="font-bold text-brand-600">{String(log.properties.after?.[key])}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px] font-medium">
                        {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {logs && (
        <Pagination
          currentPage={logs.current_page}
          lastPage={logs.last_page}
          total={logs.total}
          from={logs.from}
          to={logs.to}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function EventIcon({ event }: { event: string }) {
  switch (event) {
    case 'created': return <div className="w-2 h-2 rounded-full bg-emerald-500" />;
    case 'deleted': return <div className="w-2 h-2 rounded-full bg-red-500" />;
    default:        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
  }
}

function SubjectIcon({ type }: { type: string }) {
  const model = type.split('\\').pop()?.toLowerCase();
  if (model?.includes('delivery')) return <Package className="w-3.5 h-3.5 text-slate-400" />;
  if (model?.includes('dispatcher')) return <Shield className="w-3.5 h-3.5 text-slate-400" />;
  if (model?.includes('user')) return <User className="w-3.5 h-3.5 text-slate-400" />;
  return <History className="w-3.5 h-3.5 text-slate-400" />;
}
