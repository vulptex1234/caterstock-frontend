'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryAPI, InventoryStatus, Item } from '@/lib/api';
import InventoryTable from '@/components/InventoryTable';
import InventoryUpdateForm from '@/components/InventoryUpdateForm';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Package,
  TrendingUp,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const [inventoryData, setInventoryData] = useState<InventoryStatus[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('access_token');
      const isDemo = token === 'demo-token';

      const [inventoryResponse, itemsResponse] = await Promise.all([
        isDemo ? inventoryAPI.getStatusTest() : inventoryAPI.getStatus(),
        isDemo ? inventoryAPI.getItemsTest() : inventoryAPI.getItems(),
      ]);

      setInventoryData(inventoryResponse);
      setItems(itemsResponse);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 認証チェックを有効化
    const token = Cookies.get('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/login');
  };

  const handleRefresh = () => {
    fetchData();
  };

  // 統計データを計算
  const stats = {
    total: inventoryData.length,
    low: inventoryData.filter((item) => item.status === 'low').length,
    high: inventoryData.filter((item) => item.status === 'high').length,
    normal: inventoryData.filter((item) => item.status === 'normal').length,
  };

  if (isLoading && inventoryData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">CaterStock</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => router.push('/mobile')}
                variant="outline"
                size="sm"
                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                📱 モバイル版
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総項目数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">正常</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.normal}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">不足</p>
                <p className="text-2xl font-bold text-red-600">{stats.low}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">過剰</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.high}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 在庫一覧 */}
          <div className="lg:col-span-2">
            <InventoryTable
              inventoryData={inventoryData}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </div>

          {/* 在庫更新フォーム */}
          <div className="lg:col-span-1">
            <InventoryUpdateForm items={items} onUpdate={handleRefresh} />
          </div>
        </div>
      </main>
    </div>
  );
}
