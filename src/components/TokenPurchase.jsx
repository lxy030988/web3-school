/**
 * 代币购买组件
 * 提供使用 ETH 购买 YD 代币的界面和功能
 */

// 导入 React 核心功能
import { useState } from 'react'

// 导入自定义 Web3 hooks
import { useYDToken } from '../hooks/useWeb3'

/**
 * 代币购买组件函数
 * @param {Function} onClose - 关闭组件的回调函数
 * @returns {JSX.Element} 代币购买UI
 */
export default function TokenPurchase({ onClose }) {
  // 存储用户输入的 ETH 数量
  const [ethAmount, setEthAmount] = useState('')
  
  // 获取购买代币相关的函数和状态
  const { buyTokens, isBuying } = useYDToken()
  
  // 计算可获得的 YD 代币数量（1 ETH = 1000 YD，即 0.001 ETH = 1 YD）
  const ydAmount = ethAmount ? (parseFloat(ethAmount) / 0.001).toFixed(2) : '0'

  /**
   * 处理购买代币操作
   * 调用智能合约购买 YD 代币
   */
  const handleBuy = async () => {
    // 验证输入的 ETH 数量是否有效
    if (!ethAmount || parseFloat(ethAmount) <= 0) return
    
    try {
      // 调用购买函数
      await buyTokens(ethAmount)
      // 购买成功后关闭组件
      onClose()
    } catch (error) {
      // 错误处理和日志记录
      console.error('Purchase failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative card max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">购买 YD 代币</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">支付 ETH</label>
            <input
              type="number"
              value={ethAmount}
              onChange={e => setEthAmount(e.target.value)}
              className="input-field"
              placeholder="0.0"
              disabled={isBuying}
            />
          </div>
          <div className="text-center text-2xl">↓</div>
          <div>
            <label className="text-sm text-gray-400">获得 YD (1 ETH = 1000 YD)</label>
            <input type="text" value={ydAmount} readOnly className="input-field bg-white/5" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary" disabled={isBuying}>取消</button>
            <button onClick={handleBuy} className="flex-1 btn-primary" disabled={isBuying}>
              {isBuying ? '购买中...' : '购买'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
