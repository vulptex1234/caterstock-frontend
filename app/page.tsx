'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 認証トークンがあるかチェック
    const token = Cookies.get('access_token');

    if (token) {
      // トークンがある場合はダッシュボードにリダイレクト
      router.push('/dashboard');
    } else {
      // トークンがない場合はログインページにリダイレクト
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  );
}
