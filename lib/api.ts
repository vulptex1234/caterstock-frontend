import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Axiosインスタンスを作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
  (response: AxiosResponse) => {
    return response.data;
  },
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
export enum ItemCategory {
  SUPPLIES = 'SUPPLIES',
  FOOD = 'FOOD',
  EQUIPMENT = 'EQUIPMENT',
}

export enum InventoryType {
  LEVEL = 'LEVEL',
  COUNT = 'COUNT',
}

export enum StatusLevel {
  LOW = 'LOW',
  SUFFICIENT = 'SUFFICIENT',
  HIGH = 'HIGH',
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
  current_quantity?: number;
  current_status?: StatusLevel;
  last_updated: string;
  updated_by_name: string;
  status: 'normal' | 'low' | 'high';
}

export interface InventoryLog {
  id: number;
  item_id: number;
  quantity?: number;
  status_level?: StatusLevel;
  updated_by: number;
  updated_at: string;
  item: Item;
  user: User;
}

export interface User {
  id: number;
  name: string;
  role: string;
  line_id?: string;
  last_login?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LineAuthUrl {
  auth_url: string;
}

// API関数
export const authAPI = {
  getLineAuthUrl: () =>
    api
      .get<LineAuthUrl>('/auth/line/auth-url')
      .then((response) => response.data),
  lineCallback: (code: string, state?: string) =>
    api
      .post<Token>('/auth/line/callback', { code, state })
      .then((response) => response.data),
};

export const inventoryAPI = {
  getStatus: () =>
    api
      .get<InventoryStatus[]>('/inventory/status')
      .then((response) => response.data),
  updateQuantityManagement: (item_id: number, status_level: StatusLevel) =>
    api
      .post<InventoryLog>('/inventory/update/quantity', {
        item_id,
        status_level,
      })
      .then((response) => response.data),
  updateCountManagement: (item_id: number, quantity: number) =>
    api
      .post<InventoryLog>('/inventory/update/count', {
        item_id,
        quantity,
      })
      .then((response) => response.data),
  getHistory: (item_id?: number, limit = 100) =>
    api
      .get<InventoryLog[]>('/inventory/history', {
        params: { item_id, limit },
      })
      .then((response) => response.data),
  getItems: () =>
    api.get<Item[]>('/inventory/items').then((response) => response.data),
  getItemsByCategory: (category: ItemCategory) =>
    api
      .get<Item[]>(`/inventory/items/category/${category}`)
      .then((response) => response.data),
  createItem: (item: Omit<Item, 'id'>) =>
    api.post<Item>('/inventory/items', item).then((response) => response.data),

  // 開発用：認証なしエンドポイント
  getStatusTest: () =>
    api
      .get<InventoryStatus[]>('/inventory/status/test')
      .then((response) => response.data),
  getItemsTest: () =>
    api.get<Item[]>('/inventory/items/test').then((response) => response.data),
  updateQuantityManagementTest: (item_id: number, status_level: StatusLevel) =>
    api
      .post<InventoryLog>('/inventory/update/quantity/test', {
        item_id,
        status_level,
      })
      .then((response) => response.data),
  updateCountManagementTest: (item_id: number, quantity: number) =>
    api
      .post<InventoryLog>('/inventory/update/count/test', {
        item_id,
        quantity,
      })
      .then((response) => response.data),
};

export default api;
