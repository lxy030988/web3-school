import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useAaveStaking, useYDToken } from '../hooks/useWeb3'

export default function StakingPage() {
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [tab, setTab] = useState('deposit')
  const { stakedAmount, apy, depositYD, withdrawYD, isDepositing, isWithdrawing } = useAaveStaking()
  const { ydBalance } = useYDToken()

  const handleAction = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    try {
      if (tab === 'deposit') {
        await depositYD(amount)
      } else {
        await withdrawYD(amount)
      }
      setAmount('')
    } catch (error) {
      console.error('Staking action failed:', error)
    }
  }

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

  const isLoading = isDepositing || isWithdrawing

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">质押<span className="gradient-text">理财</span></h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-400">我的余额</p>
            <p className="text-3xl font-bold">{parseFloat(ydBalance || 0).toFixed(2)} YD</p>
          </div>
          <div className="card">
            <p className="text-gray-400">当前 APY</p>
            <p className="text-3xl font-bold text-green-400">{apy || '0'}%</p>
          </div>
          <div className="card">
            <p className="text-gray-400">已质押</p>
            <p className="text-3xl font-bold">{parseFloat(stakedAmount || 0).toFixed(2)} YD</p>
          </div>
        </div>

        <div className="card">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('deposit')}
              className={`flex-1 py-3 rounded-xl ${tab === 'deposit' ? 'bg-purple-600' : 'bg-white/5'}`}
              disabled={isLoading}
            >
              质押
            </button>
            <button
              onClick={() => setTab('withdraw')}
              className={`flex-1 py-3 rounded-xl ${tab === 'withdraw' ? 'bg-purple-600' : 'bg-white/5'}`}
              disabled={isLoading}
            >
              提取
            </button>
          </div>
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">
              {tab === 'deposit' ? `可用余额: ${parseFloat(ydBalance || 0).toFixed(2)} YD` : `已质押: ${parseFloat(stakedAmount || 0).toFixed(2)} YD`}
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="输入金额"
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleAction}
            className="w-full btn-primary"
            disabled={isLoading}
          >
            {isLoading
              ? (isDepositing ? '质押中...' : '提取中...')
              : (tab === 'deposit' ? '确认质押' : '确认提取')
            }
          </button>
        </div>
      </div>
    </div>
  )
}
