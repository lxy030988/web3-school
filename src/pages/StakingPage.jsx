import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function StakingPage() {
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [tab, setTab] = useState('deposit')

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
        <h1 className="text-4xl font-bold mb-8">质押<span className="gradient-text">理财</span></h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card"><p className="text-gray-400">TVL</p><p className="text-3xl font-bold">$2.5M</p></div>
          <div className="card"><p className="text-gray-400">当前 APY</p><p className="text-3xl font-bold text-green-400">5.2%</p></div>
          <div className="card"><p className="text-gray-400">总收益</p><p className="text-3xl font-bold">$125K</p></div>
        </div>

        <div className="card">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('deposit')} className={`flex-1 py-3 rounded-xl ${tab === 'deposit' ? 'bg-purple-600' : 'bg-white/5'}`}>质押</button>
            <button onClick={() => setTab('withdraw')} className={`flex-1 py-3 rounded-xl ${tab === 'withdraw' ? 'bg-purple-600' : 'bg-white/5'}`}>提取</button>
          </div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="输入金额" className="input-field mb-4" />
          <button className="w-full btn-primary">{tab === 'deposit' ? '确认质押' : '确认提取'}</button>
        </div>
      </div>
    </div>
  )
}
