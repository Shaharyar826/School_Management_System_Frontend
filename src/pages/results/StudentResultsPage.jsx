import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const StudentResultsPage = () => {
  const { user } = useContext(AuthContext);

  const { data, isLoading } = useQuery({
    queryKey: ['studentResults', user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/results/student/${user.id}`);
      return res.data.data;
    },
    enabled: !!user
  });

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Results</h1>

        {data?.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No results published yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data?.map((result) => (
              <div key={result._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{result.exam.name}</h3>
                    <p className="text-sm text-gray-500">{result.exam.examType}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{result.percentage.toFixed(2)}%</div>
                    <div className="text-sm text-gray-500">Grade: {result.grade}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Subject-wise Marks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.marks.map((mark, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-900">{mark.subject}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{mark.marksObtained}/{mark.maxMarks}</span>
                          <span className="ml-2 text-xs text-gray-500">({mark.grade})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                  <span>Total: {result.totalMarks}/{result.totalMaxMarks}</span>
                  {result.publishedAt && (
                    <span>Published: {format(new Date(result.publishedAt), 'MMM dd, yyyy')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResultsPage;
