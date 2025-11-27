import { useState, useEffect } from 'react'
import { useCoursePurchase, useYDToken, useHasPurchased } from '../hooks/useWeb3'
import { useWaitForTransactionReceipt } from 'wagmi'

export default function CourseCard({ course }) {
  const { id, name, description, category, price, totalStudents = 0 } = course
  const [showPurchase, setShowPurchase] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const { purchaseCourse, isPurchasing, purchaseHash } = useCoursePurchase()
  const { approve, isPending: isApproving, allowance } = useYDToken()
  const { hasPurchased, refetch: refetchPurchaseStatus } = useHasPurchased(id)

  // 使用 hook 返回的实时状态
  const isPurchased = hasPurchased

  // 监听购买成功
  const { isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({ hash: purchaseHash })

  // 检查是否需要授权
  useEffect(() => {
    if (allowance && price) {
      const priceNum = parseFloat(price)
      const allowanceNum = parseFloat(allowance)
      setNeedsApproval(allowanceNum < priceNum)
    }
  }, [allowance, price])

  // 购买成功后关闭对话框、刷新状态并显示提示
  useEffect(() => {
    if (isPurchaseSuccess) {
      setShowPurchase(false)
      // 立即刷新购买状态
      setTimeout(() => {
        refetchPurchaseStatus()
      }, 1000) // 等待1秒让区块确认
      alert('🎉 购买成功!课程已添加到"个人中心"')
    }
  }, [isPurchaseSuccess, refetchPurchaseStatus])

  const handleApprove = () => {
    console.log('=== Approve Debug ===')
    console.log('Approving amount: 10000')
    try {
      approve('10000')
      console.log('Approve function called')
    } catch (error) {
      console.error('Approve error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
  }

  const handlePurchase = () => {
    console.log('=== Purchase Debug ===')
    console.log('Course ID:', id)
    console.log('Course ID type:', typeof id)
    try {
      purchaseCourse(id)
      console.log('Purchase function called')
    } catch (error) {
      console.error('Purchase error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
  }

  return (
    <div className={`card transition-transform ${isPurchased ? 'cursor-default' : 'hover:scale-105 cursor-pointer'}`} onClick={() => !isPurchased && setShowPurchase(true)}>
      <div className="aspect-video rounded-xl mb-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
        <span className="text-4xl">📚</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{category}</span>
        {isPurchased && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">✅ 已购买</span>}
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
            {needsApproval && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">⚠️ 需要先授权才能购买课程</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowPurchase(false)} className="flex-1 btn-secondary" disabled={isPurchasing || isApproving}>
                取消
              </button>
              {needsApproval ? (
                <button onClick={handleApprove} className="flex-1 btn-primary" disabled={isApproving}>
                  {isApproving ? '授权中...' : '授权支付'}
                </button>
              ) : (
                <button onClick={handlePurchase} className="flex-1 btn-primary" disabled={isPurchasing}>
                  {isPurchasing ? '购买中...' : '确认购买'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
