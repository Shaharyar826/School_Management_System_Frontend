import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const TenantBillingPage = () => {
  const { data: billing } = useQuery({
    queryKey: ['tenantBilling'],
    queryFn: async () => {
      const res = await axios.get('/api/tenant-admin/billing');
      return res.data.data;
    }
  });

  const { data: invoices } = useQuery({
    queryKey: ['tenantInvoices'],
    queryFn: async () => {
      const res = await axios.get('/api/tenant-admin/invoices');
      return res.data.data;
    }
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Billing & Subscription</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Subscription</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-lg font-semibold">{billing?.currentPlan || 'Trial'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Cost</p>
              <p className="text-lg font-semibold">${billing?.monthlyAmount?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                billing?.hasActiveSubscription ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {billing?.hasActiveSubscription ? 'Active' : 'Trial'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Features</p>
              <p className="text-sm">{billing?.features?.length || 0} enabled</p>
            </div>
          </div>
        </div>

        {billing?.paymentMethods && billing.paymentMethods.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
            <div className="space-y-3">
              {billing.paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium uppercase">{method.brand}</span>
                    <span className="text-sm text-gray-600">•••• {method.last4}</span>
                    <span className="text-sm text-gray-500">
                      Expires {method.expMonth}/{method.expYear}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Invoice History</h2>
          {invoices && invoices.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(invoice.created * 1000), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Download PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-4">No invoices yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantBillingPage;
