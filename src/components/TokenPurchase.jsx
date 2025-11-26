import { useState } from 'react'
import { useYDToken } from '../hooks/useWeb3'

export default function TokenPurchase({ onClose }) {
  const [ethAmount, setEthAmount] = useState('')
  const { buyTokens, isBuying } = useYDToken()
  const ydAmount = ethAmount ? (parseFloat(ethAmount) / 0.001).toFixed(2) : '0'

  const handleBuy = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) return
    try {
      await buyTokens(ethAmount)
      onClose()
    } catch (error) {
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
