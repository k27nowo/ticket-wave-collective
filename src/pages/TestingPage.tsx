
import TestingEnvironment from '@/components/TestingEnvironment';

const TestingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ticket System Testing
          </h1>
          <p className="text-gray-600">
            Test the complete ticket ordering and generation flow
          </p>
        </div>
        
        <TestingEnvironment />
      </div>
    </div>
  );
};

export default TestingPage;
