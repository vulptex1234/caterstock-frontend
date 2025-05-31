'use client';

import {
  InventoryStatus,
  ItemCategory,
  InventoryType,
  StatusLevel,
} from '@/lib/api';
import { formatDateTime, getStatusColor } from '@/lib/utils';
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
    'all' | 'low' | 'high' | 'supplies' | 'food' | 'equipment' | 'drinks'
  >('all');

  const filteredData = inventoryData.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'low' || filter === 'high') return item.status === filter;
    if (filter === 'supplies')
      return (
        item.item?.category === ItemCategory.SUPPLIES ||
        item.drink?.category === ItemCategory.SUPPLIES
      );
    if (filter === 'food')
      return (
        item.item?.category === ItemCategory.FOOD ||
        item.drink?.category === ItemCategory.FOOD
      );
    if (filter === 'equipment')
      return (
        item.item?.category === ItemCategory.EQUIPMENT ||
        item.drink?.category === ItemCategory.EQUIPMENT
      );
    if (filter === 'drinks')
      return item.drink?.category === ItemCategory.DRINKS;
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
      case ItemCategory.DRINKS:
        return '飲み物';
      default:
        return '不明';
    }
  };

  const getStatusDisplayValue = (status: InventoryStatus) => {
    const target = status.item || status.drink;
    if (!target) return '不明';

    if (target.inventory_type === InventoryType.QUANTITY_MANAGEMENT) {
      // 量管理の場合
      switch (status.current_status) {
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
      return status.current_quantity?.toString() || '0';
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
              onClick={() => setFilter('drinks')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'drinks'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              飲み物
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アイテム名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                在庫状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最終更新
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                更新者
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((status, index) => {
              const target = status.item || status.drink;
              if (!target) return null;

              return (
                <tr key={`${target.id}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {target.name}
                    </div>
                    <div className="text-sm text-gray-500">{target.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryText(target.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        status.status
                      )}`}
                    >
                      {getStatusDisplayValue(status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(status.last_updated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {status.updated_by_name}
                  </td>
                </tr>
              );
            })}
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
