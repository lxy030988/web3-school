import { useState } from 'react'
import { useCoursePurchase, useYDToken } from '../hooks/useWeb3'

export default function CourseCard({ course, isPurchased }) {
  const { id, name, description, category, price, author, totalStudents = 0 } = course
  const [showPurchase, setShowPurchase] = useState(false)
  const { purchaseCourse, isPurchasing } = useCoursePurchase()
  const { approve, isApproving, allowance } = useYDToken()

  const handlePurchase = async (e) => {
    e.preventDefault()
    try {
      // 检查是否需要授权
      const priceNum = parseFloat(price)
      const allowanceNum = parseFloat(allowance || 0)

      if (allowanceNum < priceNum) {
        await approve(price)
      }

      await purchaseCourse(id)
      setShowPurchase(false)
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  return (
    <div className="card hover:scale-105 transition-transform cursor-pointer" onClick={() => !isPurchased && setShowPurchase(true)}>
      <div className="aspect-video rounded-xl mb-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
        <span className="text-4xl">📚</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{category}</span>
        {isPurchased && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">已购买</span>}
      </div>
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-purple-400 font-bold">{price} YD</span>
        <span className="text-gray-500 text-sm">{totalStudents?.toString() || 0} 学员</span>
      </div>

      {showPurchase && !isPurchased && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPurchase(false)} />
          <div className="relative card max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">购买课程</h2>
            <div className="mb-6">
              <p className="text-gray-400 mb-2">课程名称</p>
              <p className="font-semibold">{name}</p>
            </div>
            <div className="mb-6">
              <p className="text-gray-400 mb-2">价格</p>
              <p className="text-2xl font-bold text-purple-400">{price} YD</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPurchase(false)} className="flex-1 btn-secondary" disabled={isPurchasing || isApproving}>
                取消
              </button>
              <button onClick={handlePurchase} className="flex-1 btn-primary" disabled={isPurchasing || isApproving}>
                {isApproving ? '授权中...' : isPurchasing ? '购买中...' : '确认购买'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
