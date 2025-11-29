/**
 * 课程卡片组件
 * 显示课程信息并提供购买功能
 */

// 导入 React 核心功能
import { useState, useEffect } from 'react'

// 导入自定义 Web3 hooks
import { useCoursePurchase, useYDToken, useHasPurchased } from '../hooks/useWeb3'

// 导入 wagmi 交易状态监听 hook
import { useWaitForTransactionReceipt } from 'wagmi'

/**
 * 课程卡片组件
 * @param {Object} course - 课程对象，包含课程详情
 * @returns {JSX.Element} 课程卡片UI
 */
export default function CourseCard({ course }) {
  // 从课程对象中解构所需属性
  const { id, name, description, category, price, totalStudents = 0 } = course

  // 控制购买对话框的显示状态
  const [showPurchase, setShowPurchase] = useState(false)

  // 控制是否需要授权的状态
  const [needsApproval, setNeedsApproval] = useState(false)

  // 记录当前操作的交易hash，用于区分是否是本卡片发起的交易
  const [currentApproveHash, setCurrentApproveHash] = useState(null)
  const [currentPurchaseHash, setCurrentPurchaseHash] = useState(null)
  // 记录已处理的交易hash，防止重复处理
  const [handledApproveHash, setHandledApproveHash] = useState(null)
  const [handledPurchaseHash, setHandledPurchaseHash] = useState(null)

  // 购买课程相关的 hook
  const { purchaseCourse, isPurchasing, purchaseHash } = useCoursePurchase()

  // YD代币相关的 hook
  const { approve, isPending: isApproving, txHash: approveTxHash, refetchAllowance, refetchBalance, allowance } = useYDToken()

  // 检查是否已购买课程的 hook
  const { hasPurchased, refetch: refetchPurchaseStatus } = useHasPurchased(id)

  // 使用 hook 返回的实时状态判断是否已购买
  const isPurchased = hasPurchased

  // 监听授权交易是否成功
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: currentApproveHash,
    enabled: !!currentApproveHash
  })

  // 监听购买交易是否成功
  const { isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
    hash: currentPurchaseHash,
    enabled: !!currentPurchaseHash
  })

  // 检查是否需要授权的副作用
  useEffect(() => {
    if (allowance && price) {
      // 将字符串转换为数字进行比较
      const priceNum = parseFloat(price)
      const allowanceNum = parseFloat(allowance)
      // 如果授权额度小于价格，则需要授权
      setNeedsApproval(allowanceNum < priceNum)
    }
  }, [allowance, price]) // 当授权额度或价格变化时重新计算

  // 授权成功后的处理
  useEffect(() => {
    if (isApproveSuccess && currentApproveHash && currentApproveHash !== handledApproveHash) {
      // 标记已处理
      setHandledApproveHash(currentApproveHash)
      // 刷新授权额度
      refetchAllowance()
      // 重置当前hash
      setCurrentApproveHash(null)
    }
  }, [isApproveSuccess, currentApproveHash, handledApproveHash, refetchAllowance])

  // 购买成功后的处理副作用
  useEffect(() => {
    if (isPurchaseSuccess && currentPurchaseHash && currentPurchaseHash !== handledPurchaseHash) {
      // 标记已处理
      setHandledPurchaseHash(currentPurchaseHash)
      // 关闭购买对话框
      setShowPurchase(false)
      // 刷新购买状态和余额
      refetchPurchaseStatus()
      refetchBalance()
      // 重置当前hash
      setCurrentPurchaseHash(null)
      // 显示成功提示
      alert('🎉 购买成功!课程已添加到"个人中心"')
    }
  }, [isPurchaseSuccess, currentPurchaseHash, handledPurchaseHash, refetchPurchaseStatus, refetchBalance])

  // 监听授权交易hash变化
  useEffect(() => {
    if (approveTxHash && isApproving === false && !currentApproveHash) {
      // 新的授权交易已提交
      setCurrentApproveHash(approveTxHash)
    }
  }, [approveTxHash, isApproving, currentApproveHash])

  // 监听购买交易hash变化
  useEffect(() => {
    if (purchaseHash && isPurchasing === false && !currentPurchaseHash) {
      // 新的购买交易已提交
      setCurrentPurchaseHash(purchaseHash)
    }
  }, [purchaseHash, isPurchasing, currentPurchaseHash])

  /**
   * 处理授权操作
   * 授权智能合约使用用户的代币
   */
  const handleApprove = () => {
    // 调试日志
    console.log('=== Approve Debug ===')
    console.log('Approving amount: 10000')
    try {
      // 调用授权函数，授权额度为10000
      approve('10000')
      console.log('Approve function called')
    } catch (error) {
      // 错误处理和日志记录
      console.error('Approve error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
  }

  /**
   * 处理购买课程操作
   * 调用智能合约购买指定课程
   */
  const handlePurchase = () => {
    // 调试日志
    console.log('=== Purchase Debug ===')
    console.log('Course ID:', id)
    console.log('Course ID type:', typeof id)
    try {
      // 调用购买课程函数
      purchaseCourse(id)
      console.log('Purchase function called')
    } catch (error) {
      // 错误处理和日志记录
      console.error('Purchase error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
  }

  // 判断授权是否正在进行中（提交中或等待确认）
  const isApprovingOrConfirming = isApproving || (currentApproveHash && !isApproveSuccess)

  // 判断购买是否正在进行中（提交中或等待确认）
  const isPurchasingOrConfirming = isPurchasing || (currentPurchaseHash && !isPurchaseSuccess)

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
              <button onClick={() => setShowPurchase(false)} className="flex-1 btn-secondary" disabled={isPurchasingOrConfirming || isApprovingOrConfirming}>
                取消
              </button>
              {needsApproval ? (
                <button onClick={handleApprove} className="flex-1 btn-primary" disabled={isApprovingOrConfirming}>
                  {isApprovingOrConfirming ? '授权中...' : '授权支付'}
                </button>
              ) : (
                <button onClick={handlePurchase} className="flex-1 btn-primary" disabled={isPurchasingOrConfirming}>
                  {isPurchasingOrConfirming ? '购买中...' : '确认购买'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
