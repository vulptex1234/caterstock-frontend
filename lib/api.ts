import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Axiosインスタンスを作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンを自動付与）
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、トークンを削除してログインページにリダイレクト
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 型定義
export interface User {
  id: number;
  name: string;
  role: string;
  line_id?: string;
  last_login: string;
}

export enum ItemCategory {
  SUPPLIES = 'supplies', // 量管理の備品
  FOOD = 'food', // 量管理の食品
  EQUIPMENT = 'equipment', // 個数管理
}

export enum InventoryType {
  QUANTITY_MANAGEMENT = 'quantity_management', // 量管理（3択）
  COUNT_MANAGEMENT = 'count_management', // 個数管理（数値）
}

export enum StatusLevel {
  HIGH = 'high', // 多い（過剰）
  SUFFICIENT = 'sufficient', // 十分（正常）
  LOW = 'low', // 少ない（不足）
}

export interface Item {
  id: number;
  name: string;
  unit: string;
  category: ItemCategory;
  inventory_type: InventoryType;
  threshold_low?: number;
  threshold_high?: number;
}

export interface InventoryStatus {
  item: Item;
  current_quantity?: number; // 個数管理のみ
  current_status?: StatusLevel; // 量管理のみ
  last_updated: string;
  updated_by_name: string;
  status: 'normal' | 'low' | 'high'; // 統一ステータス
}

export interface InventoryLog {
  id: number;
  item_id: number;
  quantity?: number; // 個数管理のみ
  status_level?: StatusLevel; // 量管理のみ
  updated_by: number;
  updated_at: string;
  item: Item;
  user: User;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// API関数
export const authAPI = {
  getLineAuthUrl: () => api.get<{ auth_url: string }>('/auth/line/auth-url'),
  lineCallback: (code: string, state?: string) =>
    api.post<Token>('/auth/line/callback', { code, state }),
};

export const inventoryAPI = {
  getStatus: () => api.get<InventoryStatus[]>('/inventory/status'),
  updateQuantityManagement: (item_id: number, status_level: StatusLevel) =>
    api.post<InventoryLog>('/inventory/update/quantity', {
      item_id,
      status_level,
    }),
  updateCountManagement: (item_id: number, quantity: number) =>
    api.post<InventoryLog>('/inventory/update/count', { item_id, quantity }),
  getHistory: (item_id?: number, limit = 100) =>
    api.get<InventoryLog[]>('/inventory/history', {
      params: { item_id, limit },
    }),
  getItems: () => api.get<Item[]>('/inventory/items'),
  getItemsByCategory: (category: ItemCategory) =>
    api.get<Item[]>(`/inventory/items/category/${category}`),
  createItem: (item: Omit<Item, 'id'>) =>
    api.post<Item>('/inventory/items', item),

  // 開発用：認証なしエンドポイント
  getStatusTest: () => api.get<InventoryStatus[]>('/inventory/status/test'),
  getItemsTest: () => api.get<Item[]>('/inventory/items/test'),
  updateQuantityManagementTest: (item_id: number, status_level: StatusLevel) =>
    api.post<InventoryLog>('/inventory/update/quantity/test', {
      item_id,
      status_level,
    }),
  updateCountManagementTest: (item_id: number, quantity: number) =>
    api.post<InventoryLog>('/inventory/update/count/test', {
      item_id,
      quantity,
    }),
};

export default api;
