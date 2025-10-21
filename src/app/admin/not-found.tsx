import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-600 text-lg mb-8">
          Sorry, the admin page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/admin">
            <Button className="px-6 py-2">
              Go to Admin Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="px-6 py-2">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Error Code: 404 - Not Found</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
