import request from './index'
import type { Banner, ApiResponse } from '@/types'

// ===== Banner横幅广告相关 =====

// 获取活跃的横幅列表
export const getBanners = () => request.get<ApiResponse<Banner[]>>('/banners')

// 获取横幅详情
export const getBannerDetail = (id: number) => request.get<ApiResponse<Banner>>(`/banners/${id}`)
