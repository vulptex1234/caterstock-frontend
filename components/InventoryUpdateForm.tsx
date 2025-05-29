'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Item,
  inventoryAPI,
  ItemCategory,
  InventoryType,
  StatusLevel,
} from '@/lib/api';
import { Plus, Minus } from 'lucide-react';
import Cookies from 'js-cookie';

interface InventoryUpdateFormProps {
  items: Item[];
  onUpdate: () => void;
}

export default function InventoryUpdateForm({
  items,
  onUpdate,
}: InventoryUpdateFormProps) {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [statusLevel, setStatusLevel] = useState<StatusLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedItem = items.find((item) => item.id === selectedItemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItemId || !selectedItem) {
      setError('項目を選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get('access_token');
      const isDemo = token === 'demo-token';

      if (selectedItem.inventory_type === InventoryType.QUANTITY_MANAGEMENT) {
        // 量管理の場合
        if (!statusLevel) {
          setError('状況を選択してください');
          setIsLoading(false);
          return;
        }
        await (isDemo
          ? inventoryAPI.updateQuantityManagementTest(
              selectedItemId,
              statusLevel
            )
          : inventoryAPI.updateQuantityManagement(selectedItemId, statusLevel));
        setSuccess('状況を更新しました');
        setStatusLevel(null);
      } else {
        // 個数管理の場合
        if (!quantity) {
          setError('数量を入力してください');
          setIsLoading(false);
          return;
        }
        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 0) {
          setError('正しい数量を入力してください');
          setIsLoading(false);
          return;
        }
        await (isDemo
          ? inventoryAPI.updateCountManagementTest(selectedItemId, quantityNum)
          : inventoryAPI.updateCountManagement(selectedItemId, quantityNum));
        setSuccess('在庫を更新しました');
        setQuantity('');
      }

      setSelectedItemId(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to update inventory:', err);
      setError('更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const adjustQuantity = (delta: number) => {
    const currentQuantity = parseInt(quantity) || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);
    setQuantity(newQuantity.toString());
  };

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

  const getStatusLevelText = (level: StatusLevel) => {
    switch (level) {
      case StatusLevel.HIGH:
        return '多い';
      case StatusLevel.SUFFICIENT:
        return '十分';
      case StatusLevel.LOW:
        return '少ない';
      default:
        return '不明';
    }
  };

  const getStatusColor = (level: StatusLevel) => {
    switch (level) {
      case StatusLevel.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case StatusLevel.SUFFICIENT:
        return 'bg-green-100 text-green-800 border-green-200';
      case StatusLevel.LOW:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 成功メッセージを3秒後に消す
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // 選択項目が変わったら入力をリセット
  useEffect(() => {
    setQuantity('');
    setStatusLevel(null);
    setError(null);
  }, [selectedItemId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">在庫更新</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="item"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            項目を選択
          </label>
          <select
            id="item"
            value={selectedItemId || ''}
            onChange={(e) =>
              setSelectedItemId(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">項目を選択してください</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({getCategoryText(item.category)})
              </option>
            ))}
          </select>
        </div>

        {selectedItem && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">
              {selectedItem.name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              カテゴリ: {getCategoryText(selectedItem.category)}
            </p>
            <p className="text-sm text-gray-600">
              管理方式:{' '}
              {selectedItem.inventory_type === InventoryType.QUANTITY_MANAGEMENT
                ? '3択管理'
                : '数値管理'}
            </p>
          </div>
        )}

        {selectedItem &&
          selectedItem.inventory_type === InventoryType.QUANTITY_MANAGEMENT && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                現在の状況を選択
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  StatusLevel.HIGH,
                  StatusLevel.SUFFICIENT,
                  StatusLevel.LOW,
                ].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setStatusLevel(level)}
                    className={`p-4 border rounded-md text-left transition-colors ${
                      statusLevel === level
                        ? `${getStatusColor(level)} border-current`
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <div className="font-medium">
                      {getStatusLevelText(level)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {level === StatusLevel.HIGH && '在庫が多すぎる状態'}
                      {level === StatusLevel.SUFFICIENT && '適切な在庫量'}
                      {level === StatusLevel.LOW && '在庫が不足している状態'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        {selectedItem &&
          selectedItem.inventory_type === InventoryType.COUNT_MANAGEMENT && (
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                数量
                {selectedItem.threshold_low !== undefined &&
                  selectedItem.threshold_high !== undefined && (
                    <span className="text-gray-500 ml-2">
                      (しきい値: {selectedItem.threshold_low} -{' '}
                      {selectedItem.threshold_high} {selectedItem.unit})
                    </span>
                  )}
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(-1)}
                  disabled={!quantity || parseInt(quantity) <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold"
                  placeholder="0"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

        <Button
          type="submit"
          disabled={
            isLoading ||
            !selectedItemId ||
            (selectedItem?.inventory_type ===
              InventoryType.QUANTITY_MANAGEMENT &&
              !statusLevel) ||
            (selectedItem?.inventory_type === InventoryType.COUNT_MANAGEMENT &&
              !quantity)
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              更新中...
            </div>
          ) : selectedItem?.inventory_type ===
            InventoryType.QUANTITY_MANAGEMENT ? (
            '状況を更新'
          ) : (
            '在庫を更新'
          )}
        </Button>
      </form>
    </div>
  );
}
