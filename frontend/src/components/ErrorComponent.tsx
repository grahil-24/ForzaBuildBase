interface ErrorComponentProps {
  error: Error;
}

const ErrorComponent = ({error}: ErrorComponentProps) => {
    const isNetworkError = error.message.includes('NetworkError') || error.message.includes('Fetch') ||
                            error.name === 'TypeError';
    
    return (
        <div className="w-full flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg p-8 text-center">
            <div className="mb-4">
            {isNetworkError ? (
                <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                </svg>
            ) : (
                <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isNetworkError ? 'Connection Problem' : 'Something Went Wrong'}
            </h2>
            
            <p className="text-gray-600 mb-6">
            {isNetworkError 
                ? "We couldn't connect to the server. Please check your internet connection and try again."
                : "An unexpected error occurred while loading this page."
            }
            </p>
        </div>
        </div>
    );              
}

export default ErrorComponent;