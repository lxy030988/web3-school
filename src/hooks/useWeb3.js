import { useAccount, useReadContract, useWriteContract, useSignMessage, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useCallback } from 'react'
import { getContractAddress } from '../config/wagmi'
import { YDTokenABI, CourseMarketABI, CourseFactoryABI, UserProfileABI, AaveStakingABI } from '../contracts/abis'

export function useYDToken() {
  const { address } = useAccount()
  const chainId = useChainId()
  const tokenAddress = getContractAddress('YDToken', chainId)
  const marketAddress = getContractAddress('CourseMarket', chainId)

  const { data: balance, refetch: refetchBalance } = useReadContract({
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

  // 直接从合约数据计算
  const ydBalance = balance ? formatEther(balance) : '0'
  const allowance = currentAllowance ? formatEther(currentAllowance) : '0'

  console.log('useYDToken - Balance:', ydBalance, 'YD')

  return {
    ydBalance,
    allowance,
    isPending,
    txHash,
    refetchBalance,
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

export function useIsAuthor(courseId) {
  const { address } = useAccount()
  const course = useCourse(courseId)

  if (!course || !address) return false

  return course.author?.toLowerCase() === address.toLowerCase()
}

export function useUserProfile() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
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
        console.error('Failed to update display name:', e.message)
      }
    },
    [nonce, signMessageAsync, writeContract, profileAddress]
  )

  return { updateDisplayName, isUpdating: isPending }
}

export function useAaveStaking() {
  const { address } = useAccount()
  const chainId = useChainId()
  const stakingAddress = getContractAddress('AaveStaking', chainId)
  const tokenAddress = getContractAddress('YDToken', chainId)

  const { data: staked, refetch: refetchStaked } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getStakedBalance',
    args: [address],
    enabled: !!address && !!stakingAddress,
    watch: true
  })

  const { data: currentApy } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getCurrentAPY',
    enabled: !!stakingAddress,
    watch: true
  })

  const { data: stakingAllowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: YDTokenABI,
    functionName: 'allowance',
    args: [address, stakingAddress],
    enabled: !!address && !!tokenAddress && !!stakingAddress,
    watch: true
  })

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'calculateRewards',
    args: [address],
    enabled: !!address && !!stakingAddress,
    watch: true
  })

  const { writeContract, data: txHash, isPending } = useWriteContract()

  // 查询 Aave 相关数据
  const { data: aaveBalance } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getAaveBalance',
    enabled: !!stakingAddress,
    watch: true
  })

  const { data: aaveEarnings } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getAaveEarnings',
    enabled: !!stakingAddress,
    watch: true
  })

  // 直接从合约数据计算，不使用 store
  const stakedYDAmount = staked && staked.length >= 2 ? formatEther(staked[0]) : '0'
  const stakedETHAmount = staked && staked.length >= 2 ? formatEther(staked[1]) : '0'
  const apy = currentApy ? (Number(currentApy) / 100).toString() : '5'

  console.log('useAaveStaking - YD:', stakedYDAmount, 'ETH:', stakedETHAmount, 'APY:', apy)

  return {
    // YD 质押数据
    stakedAmount: stakedYDAmount,
    stakedYDAmount,
    // ETH 质押数据
    stakedETHAmount,
    aaveBalance: aaveBalance ? formatEther(aaveBalance) : '0',
    aaveEarnings: aaveEarnings ? formatEther(aaveEarnings) : '0',
    // 通用数据
    apy,
    pendingRewards: pendingRewards ? formatEther(pendingRewards) : '0',
    stakingAllowance: stakingAllowance ? formatEther(stakingAllowance) : '0',
    isPending,
    txHash,
    refetchStaked,
    refetchAllowance,
    refetchRewards,
    // YD 操作
    approveStaking: amt =>
      writeContract({
        address: tokenAddress,
        abi: YDTokenABI,
        functionName: 'approve',
        args: [stakingAddress, parseEther(amt)]
      }),
    depositYD: amt =>
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'depositYD',
        args: [parseEther(amt)]
      }),
    withdrawYD: amt =>
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'withdrawYD',
        args: [parseEther(amt)]
      }),
    // ETH 操作
    depositETH: amt =>
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'depositETH',
        value: parseEther(amt)
      }),
    withdrawETH: amt =>
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'withdrawETH',
        args: [parseEther(amt)]
      }),
    // 收益操作
    claimRewards: () =>
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'claimRewards'
      }),
    compoundRewards: () =>
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'compoundRewards'
      })
  }
}
