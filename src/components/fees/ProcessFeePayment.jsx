import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';

const ProcessFeePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fee, setFee] = useState(null);

  const [paymentData, setPaymentData] = useState({
    status: 'paid',
    paidAmount: 0,
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  });

  useEffect(() => {
    const fetchFeeRecord = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/fees/${id}`);

        if (res.data.success) {
          const feeData = res.data.data;
          setFee(feeData);

          // Set initial payment data
          setPaymentData({
            status: 'paid',
            paidAmount: feeData.amount,
            paymentMethod: 'cash',
            transactionId: '',
            remarks: feeData.description || ''
          });

          console.log('Fetched fee record:', feeData);
        }
      } catch (err) {
        setError('Failed to fetch fee record. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeRecord();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });

    // If status changes to partial, adjust paidAmount if needed
    if (name === 'status' && value === 'partial' && paymentData.paidAmount === fee.amount) {
      setPaymentData(prev => ({
        ...prev,
        paidAmount: fee.amount / 2, // Default to half payment for partial
        [name]: value
      }));
    }

    // If status changes to paid, set paidAmount to full amount
    if (name === 'status' && value === 'paid') {
      setPaymentData(prev => ({
        ...prev,
        paidAmount: fee.amount,
        [name]: value
      }));
    }
  };

  const getStudentName = () => {
    if (!fee || !fee.student || !fee.student.user) return 'Student';
    return fee.student.user.name;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Validate payment data
      if (paymentData.status === 'partial' && (!paymentData.paidAmount || paymentData.paidAmount <= 0)) {
        throw new Error('Paid amount must be greater than 0 for partial payment');
      }

      if (paymentData.status === 'partial' && paymentData.paidAmount >= fee.amount) {
        throw new Error('Partial payment amount must be less than the total amount');
      }

      // Ensure paidAmount is set correctly based on status
      let finalPaidAmount = paymentData.paidAmount;
      if (paymentData.status === 'paid') {
        finalPaidAmount = fee.amount;
      }

      // Prepare data for update
      const dataToUpdate = {
        status: paymentData.status,
        paidAmount: finalPaidAmount,
        paymentMethod: paymentData.paymentMethod,
        paymentDate: new Date(),
        remarks: paymentData.remarks,
        // If payment method is not cash or check, transaction ID is required
        transactionId: paymentData.paymentMethod !== 'cash' && paymentData.paymentMethod !== 'check'
          ? paymentData.transactionId
          : paymentData.transactionId || null
      };

      // Ensure status is set to 'paid' if full payment
      if (finalPaidAmount >= fee.amount) {
        dataToUpdate.status = 'paid';
      }

      console.log('Sending update data:', dataToUpdate);

      const res = await axios.put(`/api/fees/${id}`, dataToUpdate);

      if (res.data.success) {
        console.log('Fee payment processed successfully:', res.data);

        // Add a small delay before navigation to ensure the backend has time to process the update
        setTimeout(() => {
          // Navigate back to fees page with success message
          navigate(`/fees`, {
            state: {
              message: `Payment processed successfully. Fee status updated to ${paymentData.status}.`,
              _timestamp: Date.now() // Add a timestamp to ensure the state is seen as new
            },
            replace: true // Use replace to ensure we don't have navigation history issues
          });
        }, 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
      console.error('Error processing payment:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!fee) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Fee record not found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't allow processing if already paid
  if (fee.status === 'paid') {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">This fee has already been paid in full.</p>
                <div className="mt-2">
                  <button
                    onClick={() => navigate(`/fees`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Fees
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Process Fee Payment for {getStudentName()}</h1>
        </div>

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 relative z-20">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fee Details</h3>
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Student:</span>
                <span className="ml-2 text-sm text-gray-900">{getStudentName()}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Fee Type:</span>
                <span className="ml-2 text-sm text-gray-900">{fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Amount:</span>
                <span className="ml-2 text-sm text-gray-900">${fee.amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Due Date:</span>
                <span className="ml-2 text-sm text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Current Status:</span>
                <span className={`ml-2 text-sm px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                    fee.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                    fee.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}
                >
                  {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative z-30">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="status"
                    name="status"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={paymentData.status}
                    onChange={handleChange}
                  >
                    <option value="paid">Paid (Full Payment)</option>
                    <option value="partial">Partial Payment</option>
                  </select>
                  <label
                    htmlFor="status"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${paymentData.status ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Payment Status <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={paymentData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="online">Online Transfer</option>
                    <option value="bank transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                  <label
                    htmlFor="paymentMethod"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${paymentData.paymentMethod ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {paymentData.status === 'partial' && (
                <div className="sm:col-span-3">
                  <FormInput
                    id="paidAmount"
                    name="paidAmount"
                    type="number"
                    label="Amount to Pay"
                    required
                    min="0.01"
                    max={fee.amount}
                    step="0.01"
                    value={paymentData.paidAmount}
                    onChange={handleChange}
                    placeholder="Enter amount to pay"
                  />
                </div>
              )}

              {(paymentData.paymentMethod !== 'cash' && paymentData.paymentMethod !== 'check') && (
                <div className="sm:col-span-3">
                  <FormInput
                    id="transactionId"
                    name="transactionId"
                    type="text"
                    label="Transaction ID"
                    required
                    value={paymentData.transactionId}
                    onChange={handleChange}
                    placeholder="Enter transaction ID"
                  />
                </div>
              )}

              <div className="sm:col-span-6">
                <FormInput
                  id="remarks"
                  name="remarks"
                  type="text"
                  label="Remarks (Optional)"
                  value={paymentData.remarks}
                  onChange={handleChange}
                  placeholder="Add any additional notes"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate(`/fees`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {processing ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProcessFeePayment;
