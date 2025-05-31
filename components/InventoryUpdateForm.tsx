'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Item,
  Drink,
  inventoryAPI,
  InventoryType,
  StatusLevel,
} from '@/lib/api';
import { Plus, Minus } from 'lucide-react';
import Cookies from 'js-cookie';

interface InventoryUpdateFormProps {
  items: Item[];
  drinks: Drink[];
  onUpdate: () => void;
}

export default function InventoryUpdateForm({
  items,
  drinks,
  onUpdate,
}: InventoryUpdateFormProps) {
  const [selectedType, setSelectedType] = useState<'item' | 'drink'>('item');
  const [selectedId, setSelectedId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [statusLevel, setStatusLevel] = useState<StatusLevel>(
    StatusLevel.SUFFICIENT
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      const token = Cookies.get('access_token');
      const isDemo = token === 'demo-token';

      if (selectedType === 'item') {
        const selectedItem = items.find((item) => item.id === selectedId);
        if (!selectedItem) return;

        if (selectedItem.inventory_type === InventoryType.QUANTITY_MANAGEMENT) {
          await (isDemo
            ? inventoryAPI.updateQuantityManagementTest(selectedId, statusLevel)
            : inventoryAPI.updateQuantityManagement(selectedId, statusLevel));
        } else {
          await (isDemo
            ? inventoryAPI.updateCountManagementTest(selectedId, quantity)
            : inventoryAPI.updateCountManagement(selectedId, quantity));
        }
      } else {
        const selectedDrink = drinks.find((drink) => drink.id === selectedId);
        if (!selectedDrink) return;

        if (
          selectedDrink.inventory_type === InventoryType.QUANTITY_MANAGEMENT
        ) {
          await inventoryAPI.updateDrinkQuantityManagement(
            selectedId,
            statusLevel
          );
        } else {
          await inventoryAPI.updateDrinkCountManagement(selectedId, quantity);
        }
      }

      onUpdate();
      setSelectedId(0);
      setQuantity(0);
      setStatusLevel(StatusLevel.SUFFICIENT);
    } catch (error) {
      console.error('Failed to update inventory:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedTarget =
    selectedType === 'item'
      ? items.find((item) => item.id === selectedId)
      : drinks.find((drink) => drink.id === selectedId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">在庫更新</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            更新対象
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedType('item');
                setSelectedId(0);
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedType === 'item'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              商品
            </button>
            <button
              onClick={() => {
                setSelectedType('drink');
                setSelectedId(0);
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedType === 'drink'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              飲み物
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="item"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {selectedType === 'item' ? '商品' : '飲み物'}を選択
          </label>
          <select
            id="item"
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value={0}>選択してください</option>
            {selectedType === 'item'
              ? items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))
              : drinks.map((drink) => (
                  <option key={drink.id} value={drink.id}>
                    {drink.name}
                  </option>
                ))}
          </select>
        </div>

        {selectedTarget?.inventory_type === InventoryType.COUNT_MANAGEMENT ? (
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              数量 ({selectedTarget.unit})
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((q) => Math.max(0, q - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(0, Number(e.target.value)))
                }
                className="block w-20 px-3 py-2 text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          selectedTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                在庫状態
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusLevel(StatusLevel.LOW)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    statusLevel === StatusLevel.LOW
                      ? 'bg-red-100 text-red-900'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  少ない
                </button>
                <button
                  onClick={() => setStatusLevel(StatusLevel.SUFFICIENT)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    statusLevel === StatusLevel.SUFFICIENT
                      ? 'bg-green-100 text-green-900'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  十分
                </button>
                <button
                  onClick={() => setStatusLevel(StatusLevel.HIGH)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    statusLevel === StatusLevel.HIGH
                      ? 'bg-orange-100 text-orange-900'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  多い
                </button>
              </div>
            </div>
          )
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selectedId || isUpdating}
          className="w-full"
        >
          {isUpdating ? '更新中...' : '更新する'}
        </Button>
      </div>
    </div>
  );
}
