import { useAccount, useReadContract, useWriteContract, useSignMessage, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useCallback, useEffect } from 'react'
import { getContractAddress } from '../config/wagmi'
import { YDTokenABI, CourseMarketABI, UserProfileABI, AaveStakingABI } from '../contracts/abis'
import { useTokenStore, useStakingStore, useUIStore } from '../store'

export function useYDToken() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { setYdBalance, setAllowance, ydBalance, allowance } = useTokenStore()
  const tokenAddress = getContractAddress('YDToken', chainId)
  const marketAddress = getContractAddress('CourseMarket', chainId)

  const { data: balance } = useReadContract({
    address: tokenAddress, abi: YDTokenABI, functionName: 'balanceOf', args: [address], enabled: !!address
  })

  const { data: currentAllowance } = useReadContract({
    address: tokenAddress, abi: YDTokenABI, functionName: 'allowance', args: [address, marketAddress], enabled: !!address
  })

  const { writeContract: buyTokens, isPending: isBuying } = useWriteContract()
  const { writeContract: approve, isPending: isApproving } = useWriteContract()

  useEffect(() => {
    if (balance) setYdBalance(formatEther(balance))
    if (currentAllowance) setAllowance(formatEther(currentAllowance))
  }, [balance, currentAllowance])

  return {
    ydBalance, allowance, isBuying, isApproving,
    buyTokens: (eth) => buyTokens({ address: tokenAddress, abi: YDTokenABI, functionName: 'buyTokens', value: parseEther(eth) }),
    approve: (amt) => approve({ address: tokenAddress, abi: YDTokenABI, functionName: 'approve', args: [marketAddress, parseEther(amt)] }),
  }
}

export function useCoursePurchase() {
  const chainId = useChainId()
  const marketAddress = getContractAddress('CourseMarket', chainId)
  const { writeContract, isPending } = useWriteContract()
  
  return {
    purchaseCourse: (id) => writeContract({ address: marketAddress, abi: CourseMarketABI, functionName: 'purchaseCourse', args: [id] }),
    isPurchasing: isPending,
  }
}

export function useUserProfile() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const { addNotification } = useUIStore()
  const profileAddress = getContractAddress('UserProfile', chainId)
  
  const { data: nonce } = useReadContract({
    address: profileAddress, abi: UserProfileABI, functionName: 'getSignatureNonce', args: [address], enabled: !!address
  })
  
  const { writeContract, isPending } = useWriteContract()

  const updateDisplayName = useCallback(async (name) => {
    try {
      const msg = `Web3 School: Update display name to "${name}" (nonce: ${nonce || 0})`
      const sig = await signMessageAsync({ message: msg })
      writeContract({ address: profileAddress, abi: UserProfileABI, functionName: 'setDisplayName', args: [name, sig] })
    } catch (e) {
      addNotification({ type: 'error', message: e.message })
    }
  }, [nonce, signMessageAsync])

  return { updateDisplayName, isUpdating: isPending }
}

export function useAaveStaking() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { setStakedAmount, setApy, stakedAmount, apy } = useStakingStore()
  const stakingAddress = getContractAddress('AaveStaking', chainId)

  const { data: staked } = useReadContract({
    address: stakingAddress, abi: AaveStakingABI, functionName: 'getStakedBalance', args: [address], enabled: !!address
  })

  const { data: currentApy } = useReadContract({
    address: stakingAddress, abi: AaveStakingABI, functionName: 'getCurrentAPY'
  })

  const { writeContract: depositYD, isPending: isDepositing } = useWriteContract()
  const { writeContract: withdrawYD, isPending: isWithdrawing } = useWriteContract()

  useEffect(() => {
    if (staked) setStakedAmount(formatEther(staked[0]))
    if (currentApy) setApy((Number(currentApy) / 100).toString())
  }, [staked, currentApy])

  return {
    stakedAmount, apy, isDepositing, isWithdrawing,
    depositYD: (amt) => depositYD({ address: stakingAddress, abi: AaveStakingABI, functionName: 'depositYD', args: [parseEther(amt)] }),
    withdrawYD: (amt) => withdrawYD({ address: stakingAddress, abi: AaveStakingABI, functionName: 'withdrawYD', args: [parseEther(amt)] }),
  }
}
