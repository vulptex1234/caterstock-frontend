'use client';

import {
  InventoryStatus,
  ItemCategory,
  InventoryType,
  StatusLevel,
} from '@/lib/api';
import { formatDateTime, getStatusColor, getStatusText } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface InventoryTableProps {
  inventoryData: InventoryStatus[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function InventoryTable({
  inventoryData,
  onRefresh,
  isLoading,
}: InventoryTableProps) {
  const [filter, setFilter] = useState<
    'all' | 'low' | 'high' | 'supplies' | 'food' | 'equipment'
  >('all');

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">在庫一覧</h2>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('supplies')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'supplies'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              備品
            </button>
            <button
              onClick={() => setFilter('food')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'food'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              食品
            </button>
            <button
              onClick={() => setFilter('equipment')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'equipment'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              什器
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'low'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              不足
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'high'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              過剰
            </button>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            更新
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                項目名
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                カテゴリ
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                現在の状況
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                単位
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                ステータス
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                最終更新者
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                更新日時
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {filter === 'all'
                    ? '在庫データがありません'
                    : `該当する在庫はありません`}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.item.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4 font-medium text-gray-900">
                    {item.item.name}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {getCategoryText(item.item.category)}
                  </td>
                  <td className="py-4 px-4 text-gray-700 text-lg font-semibold">
                    {getStatusDisplayValue(item)}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{item.item.unit}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {item.updated_by_name}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {formatDateTime(item.last_updated)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          {filteredData.length}件の在庫を表示中
        </div>
      )}
    </div>
  );
}
