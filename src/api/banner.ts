import api from './index'

export interface Banner {
  id: number
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
  button_text: string
  sort_order: number
}

export const bannerAPI = {
  // 获取活跃的轮播图
  getBanners: () => api.get<Banner[]>('/banners'),

  // 获取轮播图详情
  getBannerById: (id: number) => api.get<Banner>(`/banners/${id}`),
}
