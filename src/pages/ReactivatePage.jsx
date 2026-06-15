import { useEffect, useMemo, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const axiosClient = axios.create({});

export default function ReactivatePage() {
  const { api } = useContext(AuthContext) || {};
  const authCtx = useContext(AuthContext);
  const user = authCtx?.user;

  const [schoolSubdomain, setSchoolSubdomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [planId, setPlanId] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  const [activePaymentMethods, setActivePaymentMethods] = useState([]);
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const apiClient = useMemo(() => {
    // Prefer existing axios instance from AuthContext/config if available
    return api || axiosClient;
  }, [api]);

  useEffect(() => {
    // Prefill from current hostname subdomain if possible
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length >= 3) {
      const maybeSubdomain = parts[0];
      setSchoolSubdomain(maybeSubdomain);
    }

    if (user?.email) setAdminEmail(user.email);

    (async () => {
      try {
        setLoading(true);

        // Fetch plans (whatever exists in your backend)
        // If plans endpoint differs, adjust in a follow-up.
        const plansRes = await apiClient.get('/api/platform/plans').catch(() => null);
        if (plansRes?.data?.data) setPlans(plansRes.data.data);
        if (plansRes?.data?.data?.length && !planId) setPlanId(plansRes.data.data[0].id || plansRes.data.data[0].plan || '');

        // Fetch active payment methods
        const methodsRes = await apiClient
          .get('/api/payment-methods', {
            headers: { 'X-Tenant': schoolSubdomain || undefined },
          })
          .catch(() => null);

        if (methodsRes?.data?.data) setActivePaymentMethods(methodsRes.data.data);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When subdomain changes, reload payment methods
    if (!schoolSubdomain) return;

    (async () => {
      try {
        setLoading(true);
        const methodsRes = await apiClient.get('/api/payment-methods', {
          headers: { 'X-Tenant': schoolSubdomain },
        });
        if (methodsRes?.data?.data) setActivePaymentMethods(methodsRes.data.data);
      } catch {
        // Keep silent; show later on submit
      } finally {
        setLoading(false);
      }
    })();
  }, [schoolSubdomain, apiClient]);

  const handleSubmit = async () => {
    setSuccess(null);
    setError(null);

    if (!schoolSubdomain) return setError('School subdomain is required.');
    if (!adminEmail) return setError('Admin email is required.');
    if (!planId) return setError('Please select a plan.');
    const sc = Number(studentCount);
    if (!Number.isFinite(sc) || sc <= 0) return setError('Student count must be a positive number.');
    if (!transactionId) return setError('Transaction ID (TID) is required.');
    if (!receiptFile) return setError('Please upload the receipt image.');

    try {
      setLoading(true);

      const form = new FormData();
      form.append('receipt', receiptFile);
      // Upload receipt first (reuses existing upload endpoint if you already have one)
      // If your upload route for arbitrary file differs, adapt next.
      const uploadRes = await apiClient
        .post('/api/upload/receipt', form, {
          headers: { 'Content-Type': 'multipart/form-data', 'X-Tenant': schoolSubdomain },
        })
        .catch(() => null);

      const receiptImageUrl =
        uploadRes?.data?.url ||
        uploadRes?.data?.data?.url ||
        uploadRes?.data?.data?.receiptImageUrl ||
        uploadRes?.data?.receiptImageUrl;

      if (!receiptImageUrl) {
        return setError('Failed to upload receipt image. Try again.');
      }

      const payload = {
        plan: planId,
        studentCount: sc,
        adminEmail,
        transactionId,
        receiptImageUrl,
      };

      const submitRes = await apiClient.post(
        '/api/payment-submissions',
        payload,
        { headers: { 'X-Tenant': schoolSubdomain } },
      );

      setSuccess(submitRes?.data?.message || 'Payment proof submitted successfully.');
      setError(null);

      setTransactionId('');
      setReceiptFile(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit payment proof. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Reactivate / Submit Payment Proof</h1>
        <p className="text-gray-600 mt-2">
          Upload your transaction details and receipt to restore access.
        </p>

        {loading && (
          <div className="mt-4 text-blue-600">Processing…</div>
        )}

        {success && (
          <div className="mt-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">School subdomain</label>
            <input
              value={schoolSubdomain}
              onChange={(e) => setSchoolSubdomain(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="schoolName"
            />
            <p className="text-xs text-gray-500 mt-1">Your portal URL will be schoolName.learnexes.qzz.io</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Admin email</label>
            <input
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Plan</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              {plans.length ? (
                plans.map((p) => (
                  <option key={p.id || p.plan || p.name} value={p.id || p.plan || p.name}>
                    {p.name || p.id || p.plan}
                  </option>
                ))
              ) : (
                <option value="">Select a plan</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Student count</label>
            <input
              type="number"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="e.g. 25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction ID (TID)</label>
            <input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="e.g. TID123..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Receipt image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="mt-1 w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 disabled:opacity-60"
          >
            Submit Payment Proof
          </button>
        </form>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Active Payment Methods</h2>
          <div className="mt-4 space-y-3">
            {activePaymentMethods.length ? (
              activePaymentMethods.map((m) => (
                <div key={m.id} className="border rounded-lg p-4">
                  <div className="font-medium text-gray-900">{m.methodName || m.name}</div>
                  <div className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Account title:</span> {m.accountTitle || m.account_title || '-'}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Account / IBAN:</span> {m.accountNumberOrIban || m.account_number_or_iban || m.accountNumber || '-'}
                  </div>
                  <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {m.instructions || m.details || '-'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No active payment methods available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
