'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  inventoryAPI,
  InventoryStatus,
  Item,
  ItemCategory,
  InventoryType,
  StatusLevel,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Package,
  RefreshCw,
  BarChart3,
  Smartphone,
  Filter,
} from 'lucide-react';
import { getStatusColor, getStatusText } from '@/lib/utils';
import Cookies from 'js-cookie';

type FilterType = 'all' | 'supplies' | 'food' | 'equipment' | 'low' | 'high';

export default function MobilePage() {
  const [inventoryData, setInventoryData] = useState<InventoryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('access_token');
      const isDemo = token === 'demo-token';

      const inventoryResponse = await (isDemo
        ? inventoryAPI.getStatusTest()
        : inventoryAPI.getStatus());
      setInventoryData(inventoryResponse.data);
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

  const getCategoryText = (category: ItemCategory) => {
    switch (category) {
      case ItemCategory.SUPPLIES:
        return '量管理の備品';
      case ItemCategory.FOOD:
        return '量管理の食品';
      case ItemCategory.EQUIPMENT:
        return '個数管理';
      default:
        return '不明';
    }
  };

  const getStatusDisplayValue = (item: InventoryStatus) => {
    if (item.item.inventory_type === InventoryType.QUANTITY_MANAGEMENT) {
      // 量管理の場合
      switch (item.current_status) {
        case StatusLevel.HIGH:
          return '多い';
        case StatusLevel.SUFFICIENT:
          return '十分';
        case StatusLevel.LOW:
          return '少ない';
        default:
          return '不明';
      }
    } else {
      // 個数管理の場合
      return item.current_quantity?.toString() || '0';
    }
  };

  // フィルタリングされたデータ
  const filteredData = inventoryData.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'low' || filter === 'high') return item.status === filter;
    if (filter === 'supplies')
      return item.item.category === ItemCategory.SUPPLIES;
    if (filter === 'food') return item.item.category === ItemCategory.FOOD;
    if (filter === 'equipment')
      return item.item.category === ItemCategory.EQUIPMENT;
    return true;
  });

  // 統計データを計算
  const stats = {
    total: inventoryData.length,
    low: inventoryData.filter((item) => item.status === 'low').length,
    high: inventoryData.filter((item) => item.status === 'high').length,
    normal: inventoryData.filter((item) => item.status === 'normal').length,
    supplies: inventoryData.filter(
      (item) => item.item.category === ItemCategory.SUPPLIES
    ).length,
    food: inventoryData.filter(
      (item) => item.item.category === ItemCategory.FOOD
    ).length,
    equipment: inventoryData.filter(
      (item) => item.item.category === ItemCategory.EQUIPMENT
    ).length,
  };

  const getFilterText = (filterType: FilterType) => {
    switch (filterType) {
      case 'all':
        return 'すべて';
      case 'supplies':
        return '備品';
      case 'food':
        return '食品';
      case 'equipment':
        return '什器';
      case 'low':
        return '不足';
      case 'high':
        return '過剰';
      default:
        return '';
    }
  };

  const getFilterCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'all':
        return stats.total;
      case 'supplies':
        return stats.supplies;
      case 'food':
        return stats.food;
      case 'equipment':
        return stats.equipment;
      case 'low':
        return stats.low;
      case 'high':
        return stats.high;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* モバイル向けヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Package className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">CaterStock</h1>
                <p className="text-xs text-gray-500 flex items-center">
                  <Smartphone className="w-3 h-3 mr-1" />
                  モバイル版
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className={`text-xs ${
                  showFilters ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                フィルター
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                詳細
              </Button>
            </div>
          </div>
        </div>

        {/* フィルター */}
        {showFilters && (
          <div className="px-4 pb-4 border-t bg-gray-50">
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(
                [
                  'all',
                  'supplies',
                  'food',
                  'equipment',
                  'low',
                  'high',
                ] as FilterType[]
              ).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">
                      {getFilterText(filterType)}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {getFilterCount(filterType)}件
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="p-4 pb-20">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* 統計カード（モバイル最適化） */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">総項目数</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 font-bold text-sm">!</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">要注意</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.low + stats.high}
              </p>
            </div>
          </div>
        </div>

        {/* メイン操作ボタン */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/mobile/update')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-xl font-semibold rounded-xl shadow-lg"
          >
            <Package className="w-7 h-7 mr-3" />
            在庫を更新する
          </Button>
        </div>

        {/* 在庫一覧（モバイル版） */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                在庫一覧
                {filter !== 'all' && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({getFilterText(filter)}: {filteredData.length}件)
                  </span>
                )}
              </h2>
              <Button
                onClick={fetchData}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredData.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>
                  {filter === 'all'
                    ? '在庫データがありません'
                    : `該当する在庫はありません`}
                </p>
              </div>
            ) : (
              filteredData.map((item) => (
                <div key={item.item.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {item.item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {getCategoryText(item.item.category)}
                      </p>
                      <p className="text-xs text-gray-500">
                        更新: {item.updated_by_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline space-x-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {getStatusDisplayValue(item)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.item.unit}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </div>

                  {/* クイック更新ボタン */}
                  <Button
                    onClick={() =>
                      router.push(`/mobile/update?item=${item.item.id}`)
                    }
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    この項目を更新する
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 操作ヒント */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 使い方</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 「フィルター」で表示する項目を絞り込み</li>
            <li>• 「在庫を更新する」で全項目から選択</li>
            <li>• 項目別の「この項目を更新」で直接更新</li>
            <li>• 量管理は3択、個数管理は数値で入力</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
