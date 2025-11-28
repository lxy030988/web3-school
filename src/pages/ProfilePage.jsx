/**
 * 个人资料页面组件
 * 显示用户信息、购买的课程和代币购买功能
 */

// 导入 React 核心功能
import { useState, useEffect } from 'react'

// 导入 wagmi 相关 hooks
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'

// 导入自定义 hooks
import { useUserProfile, useYDToken, usePurchasedCourses, useCourse } from '../hooks/useWeb3'

function PurchasedCourseCard({ courseId }) {
  const course = useCourse(courseId)

  if (!course) return null

  return (
    <div className="card">
      <div className="aspect-video rounded-xl mb-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
        <span className="text-4xl">📚</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{course.category}</span>
        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">已购买</span>
      </div>
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-purple-400 font-bold">{course.price} YD</span>
        <button className="btn-primary text-sm py-1 px-3">开始学习</button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [name, setName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [ethAmount, setEthAmount] = useState('')
  const [lastProcessedTx, setLastProcessedTx] = useState(null)

  // 用户资料相关
  const {
    displayName,
    updateDisplayName,
    refetchDisplayName,
    txHash: profileTxHash,
    isUpdating
  } = useUserProfile()

  // YD 代币相关
  const { ydBalance, buyTokens, isPending, txHash: ydTxHash, refetchBalance } = useYDToken()
  const { purchasedCourseIds } = usePurchasedCourses()

  // 监听 YD 购买交易
  const { isSuccess: isYDTransactionSuccess } = useWaitForTransactionReceipt({
    hash: ydTxHash
  })

  // 监听用户资料更新交易
  const { isSuccess: isProfileTransactionSuccess } = useWaitForTransactionReceipt({
    hash: profileTxHash
  })

  // 同步合约中的 displayName 到本地 state
  useEffect(() => {
    if (displayName) {
      setName(displayName)
    }
  }, [displayName])

  // 购买代币成功后刷新余额
  useEffect(() => {
    if (isYDTransactionSuccess && ydTxHash && ydTxHash !== lastProcessedTx) {
      console.log('✅ Purchase successful! Hash:', ydTxHash)
      setLastProcessedTx(ydTxHash)

      // 多次刷新确保数据更新
      const refreshBalance = () => {
        console.log('🔄 Refreshing balance...')
        refetchBalance()
      }

      refreshBalance()
      setTimeout(refreshBalance, 1000)
      setTimeout(refreshBalance, 2000)

      alert('✅ 购买成功!')
    }
  }, [isYDTransactionSuccess, ydTxHash, lastProcessedTx, refetchBalance])

  // 用户资料更新成功后刷新并关闭编辑模式
  useEffect(() => {
    if (isProfileTransactionSuccess && profileTxHash) {
      console.log('✅ Profile update successful! Hash:', profileTxHash)

      // 多次刷新确保数据更新
      const refreshProfile = () => {
        console.log('🔄 Refreshing profile...')
        refetchDisplayName()
      }

      refreshProfile()
      setTimeout(refreshProfile, 1000)
      setTimeout(refreshProfile, 2000)

      // 关闭编辑模式
      setIsEditing(false)
      alert('✅ 名称更新成功!')
    }
  }, [isProfileTransactionSuccess, profileTxHash, refetchDisplayName])

  /**
   * 处理购买代币的函数
   * 当用户点击购买按钮时触发此函数
   * 它会验证输入的ETH数量是否有效，然后执行购买操作
   */
  const handleBuyTokens = () => {
    // 检查输入的ETH金额是否存在或者是否小于等于0
    // 如果条件满足，则直接返回，不执行后续操作
    if (!ethAmount || parseFloat(ethAmount) <= 0) return
    // 调用buyTokens函数，传入用户输入的ETH金额
    buyTokens(ethAmount)
    // 购买完成后，清空ETH输入框
    setEthAmount('')
  }

  const handleSave = async () => {
    if (!name.trim()) return
    console.log('💾 开始保存名称:', name)
    try {
      await updateDisplayName(name)
      console.log('✅ updateDisplayName 调用完成')
    } catch (error) {
      console.error('❌ handleSave 错误:', error)
      alert('❌ 保存失败: ' + error.message)
    }
    // 不要立即关闭编辑模式,等交易确认后再关闭
  }

  // 调试: 监听 profileTxHash 变化
  useEffect(() => {
    console.log('📊 profileTxHash 变化:', profileTxHash)
    console.log('📊 isUpdating:', isUpdating)
    console.log('📊 isProfileTransactionSuccess:', isProfileTransactionSuccess)
  }, [profileTxHash, isUpdating, isProfileTransactionSuccess])

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold">请先连接钱包</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl font-bold">
              {address?.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field"
                    placeholder="输入名称"
                    disabled={isUpdating}
                  />
                  <button onClick={handleSave} className="btn-primary py-2 px-4" disabled={isUpdating}>
                    {isUpdating ? '保存中...' : '保存'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-secondary py-2 px-4" disabled={isUpdating}>
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{displayName || address?.slice(0, 10) + '...'}</h2>
                  <button onClick={() => setIsEditing(true)} className="text-purple-400 hover:text-purple-300">
                    ✏️ 编辑
                  </button>
                </div>
              )}
              <p className="text-gray-400 mt-1">{address}</p>
              <p className="text-purple-400 mt-2">余额: {parseFloat(ydBalance || 0).toFixed(2)} YD</p>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h3 className="text-lg font-semibold mb-4">购买 YD 代币</h3>
          <p className="text-gray-400 text-sm mb-4">使用 ETH 购买 YD 代币。汇率: 1 ETH = 1000 YD (0.001 ETH = 1 YD)</p>
          <div className="flex gap-3">
            <input
              type="number"
              value={ethAmount}
              onChange={e => setEthAmount(e.target.value)}
              placeholder="输入 ETH 数量"
              className="input-field flex-1"
              disabled={isPending}
              step="0.001"
            />
            <button
              onClick={handleBuyTokens}
              disabled={isPending || !ethAmount || parseFloat(ethAmount) <= 0}
              className="btn-primary px-6 whitespace-nowrap"
            >
              {isPending ? '购买中...' : '购买 YD'}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            预计获得: {ethAmount ? (parseFloat(ethAmount) * 1000).toFixed(2) : '0'} YD
          </p>
        </div>

        <h3 className="text-xl font-bold mb-4">我的课程 ({purchasedCourseIds.length})</h3>
        {purchasedCourseIds.length === 0 ? (
          <div className="text-center py-12 card">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-400">还没有购买课程</p>
            <p className="text-sm text-gray-500 mt-2">前往课程市场购买课程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedCourseIds.map(courseId => (
              <PurchasedCourseCard key={courseId.toString()} courseId={courseId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
