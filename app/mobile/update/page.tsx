'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  inventoryAPI,
  Item,
  ItemCategory,
  InventoryType,
  StatusLevel,
} from '@/lib/api';
import { ArrowLeft, Package, CheckCircle } from 'lucide-react';
import Cookies from 'js-cookie';

function MobileUpdateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [statusLevel, setStatusLevel] = useState<StatusLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: 項目選択, 2: 数量/状況入力

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = Cookies.get('access_token');
        const isDemo = token === 'demo-token';

        const response = await (isDemo
          ? inventoryAPI.getItemsTest()
          : inventoryAPI.getItems());
        setItems(response.data);

        // URLクエリパラメータからアイテムIDを取得
        const itemId = searchParams.get('item');
        if (itemId) {
          const targetItem = response.data.find(
            (item) => item.id === parseInt(itemId)
          );
          if (targetItem) {
            setSelectedItem(targetItem);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Failed to fetch items:', err);
        setError('項目の取得に失敗しました');
      }
    };

    fetchItems();
  }, [searchParams]);

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
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case StatusLevel.SUFFICIENT:
        return 'bg-green-100 text-green-800 border-green-300';
      case StatusLevel.LOW:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    setStep(2);
    setQuantity('');
    setStatusLevel(null);
    setError(null);
  };

  const handleQuantitySet = (value: number) => {
    setQuantity(value.toString());
  };

  const handleQuantityAdjust = (delta: number) => {
    const current = parseInt(quantity) || 0;
    const newValue = Math.max(0, current + delta);
    setQuantity(newValue.toString());
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = Cookies.get('access_token');
      const isDemo = token === 'demo-token';

      if (selectedItem.inventory_type === InventoryType.QUANTITY_MANAGEMENT) {
        if (!statusLevel) {
          setError('状況を選択してください');
          setIsLoading(false);
          return;
        }
        await (isDemo
          ? inventoryAPI.updateQuantityManagementTest(
              selectedItem.id,
              statusLevel
            )
          : inventoryAPI.updateQuantityManagement(
              selectedItem.id,
              statusLevel
            ));
      } else {
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
          ? inventoryAPI.updateCountManagementTest(selectedItem.id, quantityNum)
          : inventoryAPI.updateCountManagement(selectedItem.id, quantityNum));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/mobile');
      }, 2000);
    } catch (err) {
      console.error('Failed to update inventory:', err);
      setError('更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getThresholdWarning = () => {
    if (
      !selectedItem ||
      selectedItem.inventory_type !== InventoryType.COUNT_MANAGEMENT
    ) {
      return null;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty)) return null;

    if (qty < (selectedItem.threshold_low || 0)) {
      return { type: 'low', message: '⚠️ 在庫が不足しています' };
    }
    if (qty > (selectedItem.threshold_high || 100)) {
      return { type: 'high', message: '🔴 在庫が過剰です' };
    }
    return { type: 'normal', message: '✅ 適切な在庫量です' };
  };

  const warning = getThresholdWarning();

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">更新完了！</h1>
          <p className="text-gray-600 mb-6">
            {selectedItem?.name}の
            {selectedItem?.inventory_type === InventoryType.QUANTITY_MANAGEMENT
              ? '状況'
              : '在庫'}
            を更新しました
          </p>
          <div className="animate-pulse text-blue-600">
            メイン画面に戻ります...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center">
          <button
            onClick={() => (step === 1 ? router.back() : setStep(1))}
            className="mr-4 p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <Package className="w-6 h-6 mr-2" />
            <h1 className="text-xl font-bold">
              {step === 1 ? '項目選択' : '数量/状況入力'}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              更新する項目を選択してください
            </h2>

            {/* カテゴリ別表示 */}
            {[
              { category: ItemCategory.SUPPLIES, title: '量管理の備品' },
              { category: ItemCategory.FOOD, title: '量管理の食品' },
              { category: ItemCategory.EQUIPMENT, title: '個数管理' },
            ].map(({ category, title }) => {
              const categoryItems = items.filter(
                (item) => item.category === category
              );

              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3 px-2">
                    {title}
                  </h3>
                  <div className="grid gap-3">
                    {categoryItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                      >
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {item.unit} • {getCategoryText(item.category)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && selectedItem && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedItem.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {getCategoryText(selectedItem.category)} • {selectedItem.unit}
              </p>
            </div>

            {selectedItem.inventory_type ===
            InventoryType.QUANTITY_MANAGEMENT ? (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  現在の状況を選択
                </h3>
                <div className="space-y-3">
                  {[
                    StatusLevel.HIGH,
                    StatusLevel.SUFFICIENT,
                    StatusLevel.LOW,
                  ].map((level) => (
                    <button
                      key={level}
                      onClick={() => setStatusLevel(level)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        statusLevel === level
                          ? `${getStatusColor(level)} border-current`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-lg">
                        {getStatusLevelText(level)}
                      </div>
                      <div className="text-sm opacity-75 mt-1">
                        {level === StatusLevel.HIGH && '在庫が多すぎる状態'}
                        {level === StatusLevel.SUFFICIENT && '適切な在庫量'}
                        {level === StatusLevel.LOW && '在庫が不足している状態'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  数量を入力
                </h3>

                {/* クイック設定ボタン */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[0, 5, 10, 20].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuantitySet(value)}
                      className="p-3 bg-gray-100 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {value}
                    </button>
                  ))}
                </div>

                {/* +/- ボタンと入力 */}
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={() => handleQuantityAdjust(-1)}
                    className="w-14 h-14 bg-red-500 text-white rounded-full text-2xl font-bold hover:bg-red-600 transition-colors"
                    disabled={!quantity || parseInt(quantity) <= 0}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 text-center text-3xl font-bold py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />

                  <button
                    onClick={() => handleQuantityAdjust(1)}
                    className="w-14 h-14 bg-green-500 text-white rounded-full text-2xl font-bold hover:bg-green-600 transition-colors"
                  >
                    ＋
                  </button>
                </div>

                {/* しきい値情報 */}
                {selectedItem.threshold_low !== undefined &&
                  selectedItem.threshold_high !== undefined && (
                    <div className="text-sm text-gray-600 text-center mb-2">
                      しきい値: {selectedItem.threshold_low} -{' '}
                      {selectedItem.threshold_high} {selectedItem.unit}
                    </div>
                  )}

                {/* 警告表示 */}
                {warning && (
                  <div
                    className={`p-3 rounded-lg text-center font-medium ${
                      warning.type === 'low'
                        ? 'bg-red-50 text-red-700'
                        : warning.type === 'high'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {warning.message}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                (selectedItem.inventory_type ===
                  InventoryType.QUANTITY_MANAGEMENT &&
                  !statusLevel) ||
                (selectedItem.inventory_type ===
                  InventoryType.COUNT_MANAGEMENT &&
                  !quantity)
              }
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  更新中...
                </div>
              ) : selectedItem.inventory_type ===
                InventoryType.QUANTITY_MANAGEMENT ? (
                '状況を更新'
              ) : (
                '在庫を更新'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileUpdatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <MobileUpdateContent />
    </Suspense>
  );
}
