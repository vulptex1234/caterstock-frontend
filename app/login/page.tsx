'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 既にログイン済みかチェック
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLineLogin = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getLineAuthUrl();
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Failed to get LINE auth URL:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">CaterStock</h1>
          <p className="text-gray-600 mt-2">在庫管理システム</p>
        </div>

        <Button
          onClick={handleLineLogin}
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              認証URL取得中...
            </div>
          ) : (
            'LINEでログイン'
          )}
        </Button>
      </div>
    </div>
  );
}
