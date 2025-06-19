import request from './index'
import type { Banner } from '@/types'

// 获取活跃的横幅列表
export const getBanners = () => request.get<Banner[]>('/banners')
