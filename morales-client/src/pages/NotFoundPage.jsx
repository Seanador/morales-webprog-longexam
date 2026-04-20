import React from 'react';
import Button from '../components/Button';

// enhancement 2

function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-blue-50 px-4">
      <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-blue-900 bg-white px-12 py-16 text-center shadow-lg max-w-md w-full">
        
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 border-2 border-blue-900">
          <span className="text-3xl">🔍</span>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">
            404 Error
          </p>
          <h1 className="text-3xl font-bold leading-tight text-blue-900 sm:text-4xl">
            Page Not Found
          </h1>
        </div>

        <p className="text-sm leading-7 text-blue-700">
          The link you followed to get here must be broken...
        </p>

        <Button to="/">Back to Home Store</Button>

      </div>
    </div>
  );
}

export default NotFoundPage;