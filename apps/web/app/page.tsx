'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to ai-demo page
    router.push('/ai-demo');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="text-4xl font-bold text-purple-400 mb-4">
          🎃 BugReaper
        </div>
        <div className="text-gray-400">Redirecting to AI Demo...</div>
      </div>
    </div>
  );
}
