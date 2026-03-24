import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EnterMarksPage = () => {
  const { examId } = useParams();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState({});

  const { data: exam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const res = await axios.get(`/api/results/exams/${examId}`);
      return res.data.data;
    }
  });

  const { data: students } = useQuery({
    queryKey: ['students', exam?.class, exam?.section],
    queryFn: async () => {
      const res = await axios.get(`/api/students?class=${exam.class}&section=${exam.section}`);
      return res.data.data;
    },
    enabled: !!exam
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      return axios.post('/api/results/marks', data);
    },
    onSuccess: () => {
      toast.success('Marks saved successfully');
      setSelectedStudent(null);
      setMarks({});
      queryClient.invalidateQueries(['examResults']);
    }
  });

  const handleSaveMarks = () => {
    const marksArray = exam.subjects.map(subject => ({
      subject: subject.name,
      marksObtained: parseFloat(marks[subject.name] || 0),
      maxMarks: subject.maxMarks
    }));

    saveMutation.mutate({
      examId,
      studentId: selectedStudent._id,
      marks: marksArray
    });
  };

  if (!exam) return <div>Loading...</div>;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Enter Marks - {exam.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Students</h3>
            <div className="space-y-2">
              {students?.map((student) => (
                <button
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-3 rounded ${
                    selectedStudent?._id === student._id
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } border`}
                >
                  <div className="font-medium">{student.user.name}</div>
                  <div className="text-sm text-gray-500">{student.rollNumber}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            {selectedStudent ? (
              <>
                <h3 className="text-lg font-medium mb-4">
                  Enter Marks for {selectedStudent.user.name}
                </h3>
                <div className="space-y-4">
                  {exam.subjects.map((subject) => (
                    <div key={subject.name} className="flex items-center gap-4">
                      <label className="w-1/3 text-sm font-medium">{subject.name}</label>
                      <input
                        type="number"
                        max={subject.maxMarks}
                        value={marks[subject.name] || ''}
                        onChange={(e) => setMarks({ ...marks, [subject.name]: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-md"
                        placeholder={`Out of ${subject.maxMarks}`}
                      />
                      <span className="text-sm text-gray-500">/ {subject.maxMarks}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveMarks}
                  disabled={saveMutation.isPending}
                  className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Marks'}
                </button>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select a student to enter marks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterMarksPage;
