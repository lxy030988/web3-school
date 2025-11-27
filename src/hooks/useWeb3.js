import { useAccount, useReadContract, useWriteContract, useSignMessage, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useCallback, useEffect } from 'react'
import { getContractAddress } from '../config/wagmi'
import { YDTokenABI, CourseMarketABI, CourseFactoryABI, UserProfileABI, AaveStakingABI } from '../contracts/abis'
import { useTokenStore, useStakingStore, useUIStore } from '../store'

export function useYDToken() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { setYdBalance, setAllowance, ydBalance, allowance } = useTokenStore()
  const tokenAddress = getContractAddress('YDToken', chainId)
  const marketAddress = getContractAddress('CourseMarket', chainId)

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: YDTokenABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!tokenAddress,
    watch: true
  })

  const { data: currentAllowance } = useReadContract({
    address: tokenAddress,
    abi: YDTokenABI,
    functionName: 'allowance',
    args: [address, marketAddress],
    enabled: !!address && !!tokenAddress && !!marketAddress,
    watch: true
  })

  const { writeContract, data: txHash, isPending } = useWriteContract()

  console.log(
    'useYDToken - Chain:',
    chainId,
    'Token:',
    tokenAddress,
    'Balance:',
    balance,
    'Formatted:',
    balance ? formatEther(balance) : '0'
  )

  useEffect(() => {
    if (balance) setYdBalance(formatEther(balance))
    if (currentAllowance) setAllowance(formatEther(currentAllowance))
  }, [balance, currentAllowance, setYdBalance, setAllowance])

  return {
    ydBalance,
    allowance,
    isPending,
    txHash,
    buyTokens: eth =>
      writeContract({
        address: tokenAddress,
        abi: YDTokenABI,
        functionName: 'buyTokens',
        value: parseEther(eth)
      }),
    approve: amt =>
      writeContract({
        address: tokenAddress,
        abi: YDTokenABI,
        functionName: 'approve',
        args: [marketAddress, parseEther(amt)]
      })
  }
}

export function useCourses() {
  const chainId = useChainId()
  const factoryAddress = getContractAddress('CourseFactory', chainId)

  const { data: courseIds, refetch } = useReadContract({
    address: factoryAddress,
    abi: CourseFactoryABI,
    functionName: 'getAllCourses',
    watch: true
  })

  console.log('useCourses - Factory:', factoryAddress, 'Chain:', chainId, 'IDs:', courseIds)

  return {
    courseIds: courseIds || [],
    refetch
  }
}

export function useCourse(courseId) {
  const chainId = useChainId()
  const factoryAddress = getContractAddress('CourseFactory', chainId)

  const { data: course } = useReadContract({
    address: factoryAddress,
    abi: CourseFactoryABI,
    functionName: 'getCourse',
    args: [courseId],
    enabled: !!courseId,
    watch: true
  })

  console.log('useCourse - ID:', courseId?.toString(), 'Data:', course)

  if (!course) return null

  // 合约返回的是一个对象，不是数组
  return {
    id: course.id,
    author: course.author,
    name: course.name,
    description: course.description,
    category: course.category,
    price: course.price ? formatEther(course.price) : '0',
    contentURI: course.contentURI,
    createdAt: course.createdAt,
    totalStudents: course.totalStudents,
    isActive: course.isActive
  }
}

export function useCoursePurchase() {
  const chainId = useChainId()
  const marketAddress = getContractAddress('CourseMarket', chainId)
  const { writeContract, data: purchaseHash, isPending } = useWriteContract()

  return {
    purchaseCourse: id =>
      writeContract({
        address: marketAddress,
        abi: CourseMarketABI,
        functionName: 'purchaseCourse',
        args: [id]
      }),
    isPurchasing: isPending,
    purchaseHash
  }
}

export function usePurchasedCourses() {
  const { address } = useAccount()
  const chainId = useChainId()
  const marketAddress = getContractAddress('CourseMarket', chainId)

  const { data: purchasedIds } = useReadContract({
    address: marketAddress,
    abi: CourseMarketABI,
    functionName: 'getPurchasedCourses',
    args: [address],
    enabled: !!address && !!marketAddress,
    watch: true
  })

  return {
    purchasedCourseIds: purchasedIds || []
  }
}

export function useHasPurchased(courseId) {
  const { address } = useAccount()
  const chainId = useChainId()
  const marketAddress = getContractAddress('CourseMarket', chainId)

  const { data: hasPurchased, refetch } = useReadContract({
    address: marketAddress,
    abi: CourseMarketABI,
    functionName: 'hasPurchased',
    args: [address, courseId],
    enabled: !!address && !!marketAddress && !!courseId,
    watch: true
  })

  return {
    hasPurchased: hasPurchased || false,
    refetch
  }
}

export function useUserProfile() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const { addNotification } = useUIStore()
  const profileAddress = getContractAddress('UserProfile', chainId)

  const { data: nonce } = useReadContract({
    address: profileAddress,
    abi: UserProfileABI,
    functionName: 'getSignatureNonce',
    args: [address],
    enabled: !!address
  })

  const { writeContract, isPending } = useWriteContract()

  const updateDisplayName = useCallback(
    async name => {
      try {
        const msg = `Web3 School: Update display name to "${name}" (nonce: ${nonce || 0})`
        const sig = await signMessageAsync({ message: msg })
        writeContract({
          address: profileAddress,
          abi: UserProfileABI,
          functionName: 'setDisplayName',
          args: [name, sig]
        })
      } catch (e) {
        addNotification({ type: 'error', message: e.message })
      }
    },
    [nonce, signMessageAsync]
  )

  return { updateDisplayName, isUpdating: isPending }
}

export function useAaveStaking() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { setStakedAmount, setApy, stakedAmount, apy } = useStakingStore()
  const stakingAddress = getContractAddress('AaveStaking', chainId)

  const { data: staked } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getStakedBalance',
    args: [address],
    enabled: !!address
  })

  const { data: currentApy } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getCurrentAPY'
  })

  const { writeContract: depositYD, isPending: isDepositing } = useWriteContract()
  const { writeContract: withdrawYD, isPending: isWithdrawing } = useWriteContract()

  useEffect(() => {
    if (staked) setStakedAmount(formatEther(staked[0]))
    if (currentApy) setApy((Number(currentApy) / 100).toString())
  }, [staked, currentApy])

  return {
    stakedAmount,
    apy,
    isDepositing,
    isWithdrawing,
    depositYD: amt =>
      depositYD({ address: stakingAddress, abi: AaveStakingABI, functionName: 'depositYD', args: [parseEther(amt)] }),
    withdrawYD: amt =>
      withdrawYD({ address: stakingAddress, abi: AaveStakingABI, functionName: 'withdrawYD', args: [parseEther(amt)] })
  }
}
