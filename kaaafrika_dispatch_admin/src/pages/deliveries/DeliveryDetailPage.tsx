import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  User,
  RefreshCw,
  DollarSign,
  AlertCircle,
  History,
  CornerDownRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { deliveriesApi } from '../../api/deliveries';
import { dispatchersApi } from '../../api/dispatchers';
import { Badge } from '../../components/ui/Badge';
import { deliveryStatusBadge, paymentStatusBadge } from '../../components/ui/badgeUtils';
import { Modal } from '../../components/ui/Modal';
import type { PayoutStatus } from '../../types';
import { clsx } from 'clsx';

const STATUS_STEPS = ['pending', 'assigned', 'accepted', 'picked_up', 'delivering', 'delivered'];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

export function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const deliveryId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reassignModal, setReassignModal] = useState(false);
  const [reassignDispatcher, setReassignDispatcher] = useState('');
  const [reassignSearch, setReassignSearch] = useState('');

  // New action modals
  const [forceCompleteModal, setForceCompleteModal] = useState(false);
  const [forceCompleteReason, setForceCompleteReason] = useState('');
  
  const [refundModal, setRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const [fareModal, setFareModal] = useState(false);
  const [fareBase, setFareBase] = useState('');
  const [fareTotal, setFareTotal] = useState('');
  const [farePayout, setFarePayout] = useState('');
  const [fareReason, setFareReason] = useState('');

  const [resolveModal, setResolveModal] = useState<number | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['delivery', deliveryId],
    queryFn: () => deliveriesApi.getOne(deliveryId),
  });

  const { data: issuesData } = useQuery({
    queryKey: ['delivery-issues', deliveryId],
    queryFn: () => deliveriesApi.getIssues(deliveryId),
  });

  const otpRequired = data?.data?.otp_required ?? false;
  const { data: otpData } = useQuery({
    queryKey: ['delivery-otp', deliveryId],
    queryFn: () => deliveriesApi.getOtp(deliveryId),
    enabled: otpRequired,
    retry: false,
  });

  const { data: dispatchersData } = useQuery({
    queryKey: ['dispatchers-search', reassignSearch],
    queryFn: () => dispatchersApi.list({ search: reassignSearch, is_approved: '1', per_page: 20 }),
    enabled: reassignModal,
    staleTime: 1000 * 30,
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => deliveriesApi.cancel(deliveryId, reason),
    onSuccess: () => {
      toast.success('Delivery cancelled');
      setCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
    onError: () => toast.error('Failed to cancel delivery'),
  });

  const confirmMutation = useMutation({
    mutationFn: () => deliveriesApi.confirm(deliveryId),
    onSuccess: () => {
      toast.success('Delivery confirmed');
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
    },
    onError: () => toast.error('Failed to confirm delivery'),
  });

  const reassignMutation = useMutation({
    mutationFn: (dispatcherId: number) => deliveriesApi.reassign(deliveryId, dispatcherId),
    onSuccess: () => {
      toast.success('Delivery reassigned');
      setReassignModal(false);
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
    },
    onError: () => toast.error('Failed to reassign'),
  });

  const payoutMutation = useMutation({
    mutationFn: (status: PayoutStatus) => deliveriesApi.updatePayoutStatus(deliveryId, status),
    onSuccess: () => {
      toast.success('Payout status updated');
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
    },
    onError: () => toast.error('Failed to update payout status'),
  });

  const forceCompleteMutation = useMutation({
    mutationFn: () => deliveriesApi.forceComplete(deliveryId, forceCompleteReason),
    onSuccess: () => {
      toast.success('Delivery force completed');
      setForceCompleteModal(false);
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to complete delivery'),
  });

  const refundMutation = useMutation({
    mutationFn: () => deliveriesApi.refund(deliveryId, refundAmount ? Number(refundAmount) : undefined, refundReason),
    onSuccess: () => {
      toast.success('Refund processed successfully');
      setRefundModal(false);
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to refund'),
  });

  const fareMutation = useMutation({
    mutationFn: () => deliveriesApi.overrideFare(deliveryId, {
      base_fare: fareBase ? Number(fareBase) : undefined,
      total_amount: fareTotal ? Number(fareTotal) : undefined,
      payout_amount: farePayout ? Number(farePayout) : undefined,
      reason: fareReason,
    }),
    onSuccess: () => {
      toast.success('Fare updated successfully');
      setFareModal(false);
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update fare'),
  });

  const resolveMutation = useMutation({
    mutationFn: (issueId: number) => deliveriesApi.resolveIssue(deliveryId, issueId, resolveNotes),
    onSuccess: () => {
      toast.success('Issue resolved');
      setResolveModal(null);
      setResolveNotes('');
      queryClient.invalidateQueries({ queryKey: ['delivery-issues', deliveryId] });
    },
    onError: () => toast.error('Failed to resolve issue'),
  });

  const delivery = data?.data;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-40 bg-slate-200 rounded" />
        <div className="card p-6 h-48 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="text-center py-16 text-slate-500">
        Delivery not found.
        <button onClick={() => navigate(-1)} className="ml-2 text-brand-500 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const statusBadge = deliveryStatusBadge(delivery.status);
  const payBadge = paymentStatusBadge(delivery.payment_status);
  const currentStepIdx = Math.max(STATUS_STEPS.indexOf(delivery.status), 0);
  const paymentMethod =
    typeof delivery.payment_method === 'string' && delivery.payment_method.length > 0
      ? delivery.payment_method.toUpperCase()
      : '—';

  const isCancellable = !['delivered', 'cancelled'].includes(delivery.status);
  const isConfirmable = delivery.status === 'delivering' || delivery.status === 'picked_up';
  const isForceCompletable = !['delivered', 'cancelled'].includes(delivery.status);
  const isRefundable = delivery.payment_status === 'paid';

  return (
    <div className="space-y-5 animate-fade-in w-full pb-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Deliveries
      </button>

      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-slate-400" />
              <code className="text-sm font-bold text-slate-700 tracking-wide">{delivery.tracking_code}</code>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge label={statusBadge.label} variant={statusBadge.variant} dot />
              <Badge label={payBadge.label} variant={payBadge.variant} />
              {delivery.otp_required && <Badge label="OTP Required" variant="blue" />}
            </div>
          </div>

          {/* Admin actions */}
          <div className="flex flex-wrap gap-2">
            {isConfirmable && (
              <button
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="btn-success text-xs"
              >
                {confirmMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Confirm Delivery
              </button>
            )}
            
            {isForceCompletable && (
              <button
                onClick={() => setForceCompleteModal(true)}
                className="btn-secondary text-xs h-9 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Force Complete
              </button>
            )}

            {isRefundable && (
              <button
                onClick={() => setRefundModal(true)}
                className="btn-secondary text-xs h-9 bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Refund
              </button>
            )}

            <button
              onClick={() => setReassignModal(true)}
              className="btn-secondary text-xs h-9 gap-1.5"
              disabled={delivery.status === 'delivered' || delivery.status === 'cancelled'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reassign
            </button>

            {isCancellable && (
              <button onClick={() => setCancelModal(true)} className="btn-danger text-xs h-9">
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {delivery.status !== 'cancelled' && (
          <div className="mt-5">
            <div className="flex items-center">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 flex-shrink-0 transition-colors',
                      idx < currentStepIdx
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : idx === currentStepIdx
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'bg-white border-slate-200 text-slate-400'
                    )}
                  >
                    {idx < currentStepIdx ? '✓' : idx + 1}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={clsx(
                        'flex-1 h-0.5 mx-1',
                        idx < currentStepIdx ? 'bg-emerald-400' : 'bg-slate-200'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {STATUS_STEPS.map((step) => (
                <span key={step} className="text-[9px] text-slate-400 capitalize">
                  {step.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Route Card */}
        <div className="card p-5 space-y-4">
          <p className="section-title">Route</p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Pickup</p>
                <p className="text-sm font-medium text-slate-700">{delivery.pickup_address}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  {delivery.pickup_contact_name}
                  <Phone className="w-3 h-3 ml-1" />
                  {delivery.pickup_contact_phone}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Dropoff</p>
                <p className="text-sm font-medium text-slate-700">{delivery.dropoff_address}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  {delivery.dropoff_contact_name}
                  <Phone className="w-3 h-3 ml-1" />
                  {delivery.dropoff_contact_phone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financials Card */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Package & Financials</p>
            {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
              <button
                onClick={() => {
                  setFareBase(String(delivery.base_fare));
                  setFareTotal(String(delivery.total_amount));
                  setFarePayout(String(delivery.payout_amount));
                  setFareModal(true);
                }}
                className="text-xs text-brand-500 font-medium hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Override Fare
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm mb-4">
            <DetailItem label="Base Fare" value={formatCurrency(delivery.base_fare)} />
            <DetailItem label="Total Amount" value={formatCurrency(delivery.total_amount)} highlight />
            <DetailItem label="Payout" value={formatCurrency(delivery.payout_amount)} />
            <DetailItem label="Payment Method" value={paymentMethod} />
          </div>

          <div className="pt-4 border-t border-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Payout Status</p>
                <Badge
                  label={delivery.payout_status}
                  variant={
                    delivery.payout_status === 'paid' ? 'green' : delivery.payout_status === 'failed' ? 'red' : 'yellow'
                  }
                  className="mt-1"
                />
              </div>
              {delivery.payout_status !== 'paid' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => payoutMutation.mutate('paid')}
                    disabled={payoutMutation.isPending}
                    className="btn-success text-[11px] py-1 px-2.5 h-8"
                  >
                    Mark Paid
                  </button>
                  {delivery.payout_status !== 'failed' && (
                    <button
                      onClick={() => payoutMutation.mutate('failed')}
                      disabled={payoutMutation.isPending}
                      className="btn-danger text-[11px] py-1 px-2.5 h-8"
                    >
                      Mark Failed
                    </button>
                  )}
                </div>
              )}
            </div>

            {delivery.otp_required && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Delivery OTP</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">
                    {otpData?.data?.code ?? '—'}
                  </p>
                </div>
                {otpData?.data && (
                  <Badge
                    label={otpData.data.is_used ? 'Used' : 'Active'}
                    variant={otpData.data.is_used ? 'slate' : 'green'}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issues Section */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="section-title">Delivery Issues</p>
          </div>
          {issuesData?.data && issuesData.data.length > 0 && (
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {issuesData.data.filter(i => i.status === 'open').length} OPEN
            </span>
          )}
        </div>
        
        {issuesData?.data && issuesData.data.length > 0 ? (
          <div className="space-y-3">
            {issuesData.data.map((issue) => (
              <div key={issue.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase">{issue.type.replace(/_/g, ' ')}</span>
                      <Badge 
                        label={issue.status} 
                        variant={issue.status === 'open' ? 'red' : 'green'} 
                        className="text-[10px] py-0 px-1.5"
                      />
                    </div>
                    <p className="text-sm text-slate-600">{issue.description}</p>
                    <p className="text-[10px] text-slate-400">Reported {new Date(issue.created_at).toLocaleString()}</p>
                  </div>
                  {issue.status === 'open' && (
                    <button
                      onClick={() => setResolveModal(issue.id)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Resolve
                    </button>
                  )}
                </div>
                {issue.status === 'resolved' && (
                  <div className="mt-2 pt-2 border-t border-slate-200/50 flex gap-2">
                    <CornerDownRight className="w-3 h-3 text-slate-300 mt-1" />
                    <div>
                      <p className="text-[11px] text-slate-500 italic">"{issue.resolution_notes}"</p>
                      <p className="text-[10px] text-slate-400">Resolved at {new Date(issue.resolved_at!).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">
            No issues reported for this delivery
          </div>
        )}
      </div>

      {/* Bottom row: dispatcher + timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dispatcher */}
        <div className="card p-5">
          <p className="section-title mb-3">Dispatcher</p>
          {delivery.dispatcher ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-brand-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{delivery.dispatcher.name}</p>
                <p className="text-xs text-slate-400">ID: {delivery.dispatcher.id}</p>
              </div>
              <button 
                onClick={() => navigate(`/dispatchers/${delivery.dispatcher?.id}`)}
                className="p-2 text-slate-400 hover:text-brand-500"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Not yet assigned to a dispatcher</p>
          )}
        </div>

        {/* Tracking timeline */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-400" />
            <p className="section-title">Timeline</p>
          </div>
          {delivery.tracking_steps && delivery.tracking_steps.length > 0 ? (
            <div className="space-y-4">
              {delivery.tracking_steps.map((step, i) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      'w-2 h-2 rounded-full mt-1.5',
                      i === 0 ? 'bg-brand-500 ring-4 ring-brand-50' : 'bg-slate-300'
                    )} />
                    {i < delivery.tracking_steps.length - 1 && (
                      <div className="w-px h-full bg-slate-100 my-1" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 capitalize">
                      {(step.step ?? '').replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(step.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
              <Clock className="w-5 h-5 opacity-20" />
              <p className="text-xs italic">No tracking history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Cancel Modal */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Delivery"
        footer={
          <>
            <button onClick={() => setCancelModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={() => cancelMutation.mutate(cancelReason)}
              disabled={cancelMutation.isPending || !cancelReason}
              className="btn-danger text-sm"
            >
              {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirm Cancel
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">Please provide a reason for cancelling this delivery.</p>
        <label className="label">Reason</label>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          className="input h-24 resize-none"
          placeholder="e.g. Customer requested cancellation"
        />
      </Modal>

      {/* Force Complete Modal */}
      <Modal
        open={forceCompleteModal}
        onClose={() => setForceCompleteModal(false)}
        title="Force Complete Delivery"
        footer={
          <>
            <button onClick={() => setForceCompleteModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={() => forceCompleteMutation.mutate()}
              disabled={forceCompleteMutation.isPending || !forceCompleteReason}
              className="btn-primary text-sm bg-emerald-600 hover:bg-emerald-700 border-emerald-700"
            >
              {forceCompleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirm Completion
            </button>
          </>
        }
      >
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mb-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Warning:</strong> This will manually mark the delivery as <strong>Delivered</strong>. 
            Only use this if the driver app is offline and you have verified delivery via phone.
          </p>
        </div>
        <label className="label">Resolution Reason</label>
        <textarea
          value={forceCompleteReason}
          onChange={(e) => setForceCompleteReason(e.target.value)}
          className="input h-24 resize-none"
          placeholder="e.g. Verified with recipient by phone, driver app offline"
        />
      </Modal>

      {/* Refund Modal */}
      <Modal
        open={refundModal}
        onClose={() => setRefundModal(false)}
        title="Issue Refund"
        footer={
          <>
            <button onClick={() => setRefundModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={() => refundMutation.mutate()}
              disabled={refundMutation.isPending || !refundReason}
              className="btn-primary text-sm bg-orange-600 hover:bg-orange-700 border-orange-700"
            >
              {refundMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Process Refund
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">This will credit the customer's wallet. Total paid: <strong>{formatCurrency(delivery.total_amount)}</strong></p>
        <div className="space-y-4">
          <div>
            <label className="label">Amount (Optional - leave empty for full refund)</label>
            <input
              type="number"
              className="input"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={String(delivery.total_amount)}
            />
          </div>
          <div>
            <label className="label">Reason for Refund</label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="input h-24 resize-none"
              placeholder="e.g. Package arrived damaged"
            />
          </div>
        </div>
      </Modal>

      {/* Fare Override Modal */}
      <Modal
        open={fareModal}
        onClose={() => setFareModal(false)}
        title="Override Delivery Fare"
        footer={
          <>
            <button onClick={() => setFareModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={() => fareMutation.mutate()}
              disabled={fareMutation.isPending || !fareReason}
              className="btn-primary text-sm"
            >
              {fareMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update Fare
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label text-[10px]">Base Fare</label>
              <input
                type="number"
                className="input text-sm"
                value={fareBase}
                onChange={(e) => setFareBase(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-[10px]">Total Amount</label>
              <input
                type="number"
                className="input text-sm"
                value={fareTotal}
                onChange={(e) => setFareTotal(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-[10px]">Payout</label>
              <input
                type="number"
                className="input text-sm"
                value={farePayout}
                onChange={(e) => setFarePayout(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Override Reason</label>
            <textarea
              value={fareReason}
              onChange={(e) => setFareReason(e.target.value)}
              className="input h-24 resize-none"
              placeholder="e.g. Distance correction after review"
            />
          </div>
        </div>
      </Modal>

      {/* Resolve Issue Modal */}
      <Modal
        open={resolveModal !== null}
        onClose={() => setResolveModal(null)}
        title="Resolve Issue"
        footer={
          <>
            <button onClick={() => setResolveModal(null)} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={() => resolveModal && resolveMutation.mutate(resolveModal)}
              disabled={resolveMutation.isPending || !resolveNotes}
              className="btn-primary text-sm"
            >
              {resolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Mark Resolved
            </button>
          </>
        }
      >
        <label className="label">Resolution Notes</label>
        <textarea
          value={resolveNotes}
          onChange={(e) => setResolveNotes(e.target.value)}
          className="input h-24 resize-none"
          placeholder="Describe how the issue was resolved..."
        />
      </Modal>

      {/* Reassign Modal */}
      <Modal
        open={reassignModal}
        onClose={() => setReassignModal(false)}
        title="Reassign Delivery"
        size="lg"
        footer={
          <>
            <button onClick={() => setReassignModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={() => reassignMutation.mutate(Number(reassignDispatcher))}
              disabled={reassignMutation.isPending || !reassignDispatcher}
              className="btn-primary text-sm"
            >
              {reassignMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Reassign
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Search Dispatcher</label>
            <input
              type="text"
              className="input"
              placeholder="Search by name or phone..."
              value={reassignSearch}
              onChange={(e) => setReassignSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {dispatchersData?.data?.data?.map((d) => (
              <button
                key={d.id}
                onClick={() => setReassignDispatcher(String(d.id))}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border transition-all',
                  reassignDispatcher === String(d.id)
                    ? 'bg-brand-50 border-brand-500 text-brand-700'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                )}
              >
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600">
                  {d.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-bold text-xs">{d.name}</p>
                  <p className="text-[10px] text-slate-400">{d.phone_number} · {d.status}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

const Edit2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
);

function DetailItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className={clsx('mt-1 font-bold', highlight ? 'text-slate-800 text-base' : 'text-slate-700 text-sm')}>
        {value}
      </p>
    </div>
  );
}

