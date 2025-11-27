import { useState, useEffect } from 'react'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { useAaveStaking, useYDToken } from '../hooks/useWeb3'

/**
 * StakingPage - 质押页面组件
 * 提供YD和ETH的质押、提取功能，以及收益管理功能
 */
export default function StakingPage() {
  // 钱包连接状态
  const { isConnected, address } = useAccount()
  // 金额输入状态
  const [amount, setAmount] = useState('')
  // 操作类型状态：'deposit'质押 或 'withdraw'提取
  const [tab, setTab] = useState('deposit')
  const [assetType, setAssetType] = useState('YD') // 'YD' 或 'ETH'
  const [needsApproval, setNeedsApproval] = useState(false)
  const {
    stakedAmount,
    stakedYDAmount,
    stakedETHAmount,
    aaveBalance,
    aaveEarnings,
    apy,
    pendingRewards,
    stakingAllowance,
    depositYD,
    withdrawYD,
    depositETH,
    withdrawETH,
    approveStaking,
    claimRewards,
    compoundRewards,
    isPending,
    txHash,
    refetchStaked,
    refetchAllowance,
    refetchRewards
  } = useAaveStaking()
  const { ydBalance, refetchBalance } = useYDToken()

  const [lastProcessedTx, setLastProcessedTx] = useState(null)

  const {
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    error: transactionError
  } = useWaitForTransactionReceipt({
    hash: txHash
  })

  // 检查是否需要授权（只有 YD 需要）
  useEffect(() => {
    if (tab === 'deposit' && assetType === 'YD' && stakingAllowance && amount) {
      const amountNum = parseFloat(amount)
      const allowanceNum = parseFloat(stakingAllowance)
      const needsAuth = allowanceNum < amountNum
      console.log('Approval check - Amount:', amountNum, 'Allowance:', allowanceNum, 'Needs approval:', needsAuth)
      setNeedsApproval(needsAuth)
    } else {
      setNeedsApproval(false)
    }
  }, [stakingAllowance, amount, tab, assetType])

  // 交易成功后清空输入并刷新数据
  useEffect(() => {
    if (isTransactionSuccess && txHash && txHash !== lastProcessedTx) {
      console.log('✅ Transaction successful! Hash:', txHash)
      setLastProcessedTx(txHash)
      setAmount('')

      // 多次刷新确保数据更新（Hardhat 本地网络需要）
      const refreshData = () => {
        console.log('🔄 Refreshing staking data...')
        refetchStaked()
        refetchAllowance()
        refetchRewards()
        refetchBalance() // 刷新 YD 余额
      }

      // 立即刷新一次
      refreshData()

      // 1秒后再刷新
      setTimeout(refreshData, 1000)

      // 2秒后再刷新一次
      setTimeout(refreshData, 2000)

      alert(tab === 'deposit' ? '✅ 质押成功!' : '✅ 提取成功!')
    }
  }, [
    isTransactionSuccess,
    tab,
    txHash,
    lastProcessedTx,
    refetchStaked,
    refetchAllowance,
    refetchRewards,
    refetchBalance
  ])

  // 交易失败处理
  useEffect(() => {
    if (isTransactionError && txHash && txHash !== lastProcessedTx) {
      console.error('❌ Transaction failed:', transactionError)
      setLastProcessedTx(txHash)
      alert('❌ 交易失败: ' + (transactionError?.message || '未知错误'))
    }
  }, [isTransactionError, transactionError, txHash, lastProcessedTx])

  const handleApprove = () => {
    if (!amount || parseFloat(amount) <= 0) return
    approveStaking(amount)
  }

  const handleAction = () => {
    if (!amount || parseFloat(amount) <= 0) return
    if (tab === 'deposit') {
      if (assetType === 'YD') {
        depositYD(amount)
      } else {
        depositETH(amount)
      }
    } else {
      if (assetType === 'YD') {
        withdrawYD(amount)
      } else {
        withdrawETH(amount)
      }
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

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          质押<span className="gradient-text">理财</span>
        </h1>

        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-400 text-sm">YD 余额</p>
            <p className="text-2xl font-bold">{parseFloat(ydBalance || 0).toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm">已质押 YD</p>
            <p className="text-2xl font-bold text-blue-400">{parseFloat(stakedYDAmount || 0).toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm">已质押 ETH</p>
            <p className="text-2xl font-bold text-purple-400">{parseFloat(stakedETHAmount || 0).toFixed(4)}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm">YD APY</p>
            <p className="text-2xl font-bold text-green-400">{apy}%</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm">YD 收益</p>
            <p className="text-2xl font-bold text-yellow-400">{parseFloat(pendingRewards || 0).toFixed(4)}</p>
          </div>
        </div>

        {parseFloat(stakedETHAmount || 0) > 0 && (
          <div className="card mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span>📈</span>
                  <span>Aave 协议收益</span>
                  <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">Sepolia 测试网</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">aWETH 余额</p>
                    <p className="text-xl font-mono">{parseFloat(aaveBalance || 0).toFixed(6)} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Aave 总收益</p>
                    <p className="text-xl font-mono text-green-400">+{parseFloat(aaveEarnings || 0).toFixed(6)} ETH</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {parseFloat(pendingRewards || 0) > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">收益管理</h3>
                <p className="text-gray-400 text-sm">当前待领取收益: {parseFloat(pendingRewards || 0).toFixed(4)} YD</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={claimRewards}
                  disabled={isPending}
                  className="px-6 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isPending ? '处理中...' : '领取收益'}
                </button>
                <button
                  onClick={compoundRewards}
                  disabled={isPending}
                  className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isPending ? '处理中...' : '复投收益'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          {/* 操作类型选择 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab('deposit')}
              className={`flex-1 py-3 rounded-xl ${tab === 'deposit' ? 'bg-purple-600' : 'bg-white/5'}`}
              disabled={isPending}
            >
              质押
            </button>
            <button
              onClick={() => setTab('withdraw')}
              className={`flex-1 py-3 rounded-xl ${tab === 'withdraw' ? 'bg-purple-600' : 'bg-white/5'}`}
              disabled={isPending}
            >
              提取
            </button>
          </div>

          {/* 资产类型选择 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAssetType('YD')}
              className={`flex-1 py-2 rounded-lg text-sm ${
                assetType === 'YD' ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-gray-400'
              }`}
              disabled={isPending}
            >
              💎 YD 代币
            </button>
            <button
              onClick={() => setAssetType('ETH')}
              className={`flex-1 py-2 rounded-lg text-sm ${
                assetType === 'ETH' ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-gray-400'
              }`}
              disabled={isPending}
            >
              🌐 ETH (Aave)
            </button>
          </div>

          {/* ETH 提示信息 */}
          {assetType === 'ETH' && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
              <p className="text-yellow-400 mb-1">⚠️ ETH 质押需要部署到 Sepolia 测试网</p>
              <p className="text-gray-400 text-xs">本地网络不支持 Aave 协议，请先部署到测试网再使用此功能</p>
            </div>
          )}

          {/* 金额输入 */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">
              {tab === 'deposit'
                ? assetType === 'YD'
                  ? `可用余额: ${parseFloat(ydBalance || 0).toFixed(2)} YD`
                  : `ETH 余额: 查看钱包`
                : assetType === 'YD'
                ? `已质押: ${parseFloat(stakedYDAmount || 0).toFixed(2)} YD`
                : `已质押: ${parseFloat(stakedETHAmount || 0).toFixed(4)} ETH`}
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`输入${assetType === 'YD' ? 'YD' : 'ETH'}数量`}
              step={assetType === 'ETH' ? '0.001' : '1'}
              className="input-field"
              disabled={isPending}
            />
          </div>

          {/* 操作按钮 */}
          {tab === 'deposit' && assetType === 'YD' && needsApproval ? (
            <button onClick={handleApprove} className="w-full btn-primary" disabled={isPending}>
              {isPending ? '授权中...' : '授权质押'}
            </button>
          ) : (
            <button onClick={handleAction} className="w-full btn-primary" disabled={isPending}>
              {isPending
                ? tab === 'deposit'
                  ? '质押中...'
                  : '提取中...'
                : tab === 'deposit'
                ? `确认质押 ${assetType}`
                : `确认提取 ${assetType}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
