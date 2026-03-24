import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ParentDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['parentDashboard'],
    queryFn: async () => {
      const res = await axios.get('/api/parent/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { parent, children } = data || {};

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Parent Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome, {parent?.name}! View your children's academic progress and information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {children?.map((child) => (
            <div key={child.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">{child.name}</h3>
                <p className="text-sm text-blue-100">
                  Class {child.class} - {child.section} | Roll No: {child.rollNumber}
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">Paid Fees</div>
                    <div className="text-2xl font-bold text-green-700">
                      ₹{child.paidFees?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-red-600 font-medium">Pending Fees</div>
                    <div className="text-2xl font-bold text-red-700">
                      ₹{child.pendingFees?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-blue-600 font-medium">Attendance</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {child.attendanceCount || 0} days present
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/parent/children/${child.id}/fees`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 text-center"
                  >
                    View Fees
                  </Link>
                  <Link
                    to={`/parent/children/${child.id}/attendance`}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 text-center"
                  >
                    View Attendance
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!children || children.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">No children registered under your account.</p>
            <p className="text-sm text-yellow-600 mt-2">Please contact the school administration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
