import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      displayName: '',
      purchasedCourses: [],
      setDisplayName: (name) => set({ displayName: name }),
      addPurchasedCourse: (id) => set((s) => ({ purchasedCourses: [...s.purchasedCourses, id] })),
    }),
    { name: 'web3-school-user' }
  )
)

export const useCourseStore = create((set) => ({
  courses: [],
  filters: { category: 'all', priceRange: 'all', sortBy: 'newest' },
  setCourses: (courses) => set({ courses }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
}))

export const useTokenStore = create((set) => ({
  ydBalance: '0',
  allowance: '0',
  tokenPrice: '0.001',
  setYdBalance: (b) => set({ ydBalance: b }),
  setAllowance: (a) => set({ allowance: a }),
  setTokenPrice: (p) => set({ tokenPrice: p }),
}))

export const useStakingStore = create((set) => ({
  stakedAmount: '0',
  earnedInterest: '0',
  apy: '5',
  setStakedAmount: (a) => set({ stakedAmount: a }),
  setEarnedInterest: (i) => set({ earnedInterest: i }),
  setApy: (a) => set({ apy: a }),
}))

export const useUIStore = create((set) => ({
  notifications: [],
  addNotification: (n) => set((s) => ({ notifications: [...s.notifications, { ...n, id: Date.now() }] })),
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}))
