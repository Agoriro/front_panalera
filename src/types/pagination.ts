export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface PageParams {
  page?: number
  page_size?: number
}
