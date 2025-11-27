/**
 * Web3 自定义 Hooks 集合
 * 提供与智能合约交互的各种功能，包括代币操作、课程管理、质押等
 */

// 导入 wagmi 相关 hooks
import { useAccount, useReadContract, useWriteContract, useSignMessage, useChainId } from 'wagmi'

// 导入 viem 工具函数，用于处理以太币单位转换
import { parseEther, formatEther } from 'viem'

// 导入 React 核心功能
import { useCallback } from 'react'

// 导入配置文件
import { getContractAddress } from '../config/wagmi'

// 导入合约 ABI
import { YDTokenABI, CourseMarketABI, CourseFactoryABI, UserProfileABI, AaveStakingABI } from '../contracts/abis'

/**
 * YD 代币操作 Hook
 * 提供查询余额、授权、购买代币等功能
 * @returns {Object} 包含代币相关状态和函数的对象
 */
export function useYDToken() {
  // 获取当前连接的钱包地址
  const { address } = useAccount()
  
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取 YD 代币合约地址
  const tokenAddress = getContractAddress('YDToken', chainId)
  
  // 获取课程市场合约地址
  const marketAddress = getContractAddress('CourseMarket', chainId)

  // 查询用户 YD 代币余额
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: YDTokenABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!tokenAddress, // 仅在有地址和合约地址时启用查询
    watch: true // 自动监听变化
  })

  // 查询用户对课程市场合约的授权额度
  const { data: currentAllowance } = useReadContract({
    address: tokenAddress,
    abi: YDTokenABI,
    functionName: 'allowance',
    args: [address, marketAddress], // 查询地址对市场合约的授权
    enabled: !!address && !!tokenAddress && !!marketAddress, // 仅在有所有必要参数时启用查询
    watch: true // 自动监听变化
  })

  // 获取写入合约的函数和状态
  const { writeContract, data: txHash, isPending } = useWriteContract()

  // 直接从合约数据计算格式化后的余额和授权额度
  const ydBalance = balance ? formatEther(balance) : '0' // 将 wei 转换为 ETH 单位
  const allowance = currentAllowance ? formatEther(currentAllowance) : '0' // 将 wei 转换为 ETH 单位

  // 调试日志
  console.log('useYDToken - Balance:', ydBalance, 'YD')

  // 返回代币相关的状态和函数
  return {
    // 用户 YD 代币余额
    ydBalance,
    // 对市场合约的授权额度
    allowance,
    // 交易是否正在处理中
    isPending,
    // 最新交易的哈希值
    txHash,
    // 刷新余额的函数
    refetchBalance,
    // 购买代币的函数
    buyTokens: eth =>
      writeContract({
        address: tokenAddress,
        abi: YDTokenABI,
        functionName: 'buyTokens',
        value: parseEther(eth) // 将 ETH 转换为 wei
      }),
    // 授权市场合约使用代币的函数
    approve: amt =>
      writeContract({
        address: tokenAddress,
        abi: YDTokenABI,
        functionName: 'approve',
        args: [marketAddress, parseEther(amt)] // 授权市场合约使用指定数量的代币
      })
  }
}

/**
 * 课程列表 Hook
 * 获取所有课程的 ID 列表
 * @returns {Object} 包含课程 ID 列表和刷新函数的对象
 */
export function useCourses() {
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取课程工厂合约地址
  const factoryAddress = getContractAddress('CourseFactory', chainId)

  // 查询所有课程的 ID
  const { data: courseIds, refetch } = useReadContract({
    address: factoryAddress,
    abi: CourseFactoryABI,
    functionName: 'getAllCourses',
    watch: true // 自动监听变化
  })

  // 调试日志
  console.log('useCourses - Factory:', factoryAddress, 'Chain:', chainId, 'IDs:', courseIds)

  // 返回课程 ID 列表和刷新函数
  return {
    courseIds: courseIds || [], // 如果没有数据则返回空数组
    refetch // 刷新课程列表的函数
  }
}

/**
 * 单个课程 Hook
 * 获取指定 ID 的课程详细信息
 * @param {string|number} courseId - 课程 ID
 * @returns {Object|null} 课程对象，如果课程不存在则返回 null
 */
export function useCourse(courseId) {
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取课程工厂合约地址
  const factoryAddress = getContractAddress('CourseFactory', chainId)

  // 查询指定 ID 的课程详细信息
  const { data: course } = useReadContract({
    address: factoryAddress,
    abi: CourseFactoryABI,
    functionName: 'getCourse',
    args: [courseId],
    enabled: !!courseId, // 仅在有课程 ID 时启用查询
    watch: true // 自动监听变化
  })

  // 调试日志
  console.log('useCourse - ID:', courseId?.toString(), 'Data:', course)

  // 如果课程不存在则返回 null
  if (!course) return null

  // 合约返回的是一个对象，不是数组，将其转换为前端需要的格式
  return {
    id: course.id,
    author: course.author,
    name: course.name,
    description: course.description,
    category: course.category,
    price: course.price ? formatEther(course.price) : '0', // 将 wei 转换为 ETH 单位
    contentURI: course.contentURI,
    createdAt: course.createdAt,
    totalStudents: course.totalStudents,
    isActive: course.isActive
  }
}

/**
 * 课程购买 Hook
 * 提供购买课程的功能
 * @returns {Object} 包含购买函数和相关状态的对象
 */
export function useCoursePurchase() {
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取课程市场合约地址
  const marketAddress = getContractAddress('CourseMarket', chainId)
  
  // 获取写入合约的函数和状态
  const { writeContract, data: purchaseHash, isPending } = useWriteContract()

  // 返回购买课程相关的函数和状态
  return {
    // 购买课程的函数
    purchaseCourse: id =>
      writeContract({
        address: marketAddress,
        abi: CourseMarketABI,
        functionName: 'purchaseCourse',
        args: [id] // 课程 ID
      }),
    // 购买是否正在进行中
    isPurchasing: isPending,
    // 购买交易的哈希值
    purchaseHash
  }
}

/**
 * 已购买课程列表 Hook
 * 获取用户已购买的所有课程 ID
 * @returns {Object} 包含已购买课程 ID 列表的对象
 */
export function usePurchasedCourses() {
  // 获取当前连接的钱包地址
  const { address } = useAccount()
  
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取课程市场合约地址
  const marketAddress = getContractAddress('CourseMarket', chainId)

  // 查询用户已购买的课程 ID 列表
  const { data: purchasedIds } = useReadContract({
    address: marketAddress,
    abi: CourseMarketABI,
    functionName: 'getPurchasedCourses',
    args: [address], // 用户地址
    enabled: !!address && !!marketAddress, // 仅在有地址和合约地址时启用查询
    watch: true // 自动监听变化
  })

  // 返回已购买课程 ID 列表
  return {
    purchasedCourseIds: purchasedIds || [] // 如果没有数据则返回空数组
  }
}

/**
 * 课程购买状态 Hook
 * 检查用户是否已购买指定课程
 * @param {string|number} courseId - 课程 ID
 * @returns {Object} 包含购买状态和刷新函数的对象
 */
export function useHasPurchased(courseId) {
  // 获取当前连接的钱包地址
  const { address } = useAccount()
  
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取课程市场合约地址
  const marketAddress = getContractAddress('CourseMarket', chainId)

  // 查询用户是否已购买指定课程
  const { data: hasPurchased, refetch } = useReadContract({
    address: marketAddress,
    abi: CourseMarketABI,
    functionName: 'hasPurchased',
    args: [address, courseId], // 用户地址和课程 ID
    enabled: !!address && !!marketAddress && !!courseId, // 仅在有所有必要参数时启用查询
    watch: true // 自动监听变化
  })

  // 返回购买状态和刷新函数
  return {
    // 是否已购买课程
    hasPurchased: hasPurchased || false, // 默认为 false
    refetch // 刷新购买状态的函数
  }
}

/**
 * 课程作者检查 Hook
 * 检查当前用户是否为指定课程的作者
 * @param {string|number} courseId - 课程 ID
 * @returns {boolean} 是否为课程作者
 */
export function useIsAuthor(courseId) {
  // 获取当前连接的钱包地址
  const { address } = useAccount()
  
  // 获取课程详细信息
  const course = useCourse(courseId)

  // 如果课程或地址不存在，返回 false
  if (!course || !address) return false

  // 比较课程作者地址和当前用户地址（不区分大小写）
  return course.author?.toLowerCase() === address.toLowerCase()
}

/**
 * 用户资料 Hook
 * 提供更新用户显示名称的功能
 * @returns {Object} 包含更新函数和状态的对象
 */
export function useUserProfile() {
  // 获取当前连接的钱包地址
  const { address } = useAccount()
  
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取签名消息的函数
  const { signMessageAsync } = useSignMessage()
  
  // 获取用户资料合约地址
  const profileAddress = getContractAddress('UserProfile', chainId)

  // 查询用户签名随机数，用于防止重放攻击
  const { data: nonce } = useReadContract({
    address: profileAddress,
    abi: UserProfileABI,
    functionName: 'getSignatureNonce',
    args: [address], // 用户地址
    enabled: !!address // 仅在有地址时启用查询
  })

  // 获取写入合约的函数和状态
  const { writeContract, isPending } = useWriteContract()

  /**
   * 更新用户显示名称
   * 使用签名验证用户身份
   * @param {string} name - 新的显示名称
   */
  const updateDisplayName = useCallback(
    async name => {
      try {
        // 构造签名消息，包含用户名称和随机数
        const msg = `Web3 School: Update display name to "${name}" (nonce: ${nonce || 0})`
        
        // 签名消息
        const sig = await signMessageAsync({ message: msg })
        
        // 调用智能合约更新显示名称
        writeContract({
          address: profileAddress,
          abi: UserProfileABI,
          functionName: 'setDisplayName',
          args: [name, sig] // 名称和签名
        })
      } catch (e) {
        // 错误处理和日志记录
        console.error('Failed to update display name:', e.message)
      }
    },
    [nonce, signMessageAsync, writeContract, profileAddress] // 依赖项
  )

  // 返回更新函数和状态
  return { 
    // 更新显示名称的函数
    updateDisplayName, 
    // 是否正在更新
    isUpdating: isPending 
  }
}

/**
 * Aave 质押 Hook
 * 提供与 Aave 质押合约交互的功能，包括质押、提取和领取奖励
 * @returns {Object} 包含质押相关状态和函数的对象
 */
export function useAaveStaking() {
  // 获取当前连接的钱包地址
  const { address } = useAccount()
  
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取 Aave 质押合约地址
  const stakingAddress = getContractAddress('AaveStaking', chainId)
  
  // 获取 YD 代币合约地址
  const tokenAddress = getContractAddress('YDToken', chainId)

  // 查询用户质押余额
  const { data: staked, refetch: refetchStaked } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getStakedBalance',
    args: [address], // 用户地址
    enabled: !!address && !!stakingAddress, // 仅在有地址和合约地址时启用查询
    watch: true // 自动监听变化
  })

  // 查询当前年化收益率(APY)
  const { data: currentApy } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getCurrentAPY',
    enabled: !!stakingAddress, // 仅在有合约地址时启用查询
    watch: true // 自动监听变化
  })

  // 查询用户对质押合约的授权额度
  const { data: stakingAllowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: YDTokenABI,
    functionName: 'allowance',
    args: [address, stakingAddress], // 用户地址和质押合约地址
    enabled: !!address && !!tokenAddress && !!stakingAddress, // 仅在有所有必要参数时启用查询
    watch: true // 自动监听变化
  })

  // 查询用户待领取的奖励
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'calculateRewards',
    args: [address], // 用户地址
    enabled: !!address && !!stakingAddress, // 仅在有地址和合约地址时启用查询
    watch: true // 自动监听变化
  })

  // 获取写入合约的函数和状态
  const { writeContract, data: txHash, isPending } = useWriteContract()

  // 查询 Aave 相关数据
  const { data: aaveBalance } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getAaveBalance',
    enabled: !!stakingAddress, // 仅在有合约地址时启用查询
    watch: true // 自动监听变化
  })

  // 查询 Aave 收益
  const { data: aaveEarnings } = useReadContract({
    address: stakingAddress,
    abi: AaveStakingABI,
    functionName: 'getAaveEarnings',
    enabled: !!stakingAddress, // 仅在有合约地址时启用查询
    watch: true // 自动监听变化
  })

  // 直接从合约数据计算格式化后的数据
  const stakedYDAmount = staked && staked.length >= 2 ? formatEther(staked[0]) : '0' // YD 代币质押量
  const stakedETHAmount = staked && staked.length >= 2 ? formatEther(staked[1]) : '0' // ETH 质押量
  const apy = currentApy ? (Number(currentApy) / 100).toString() : '5' // 将基点转换为百分比，默认为5%

  // 调试日志
  console.log('useAaveStaking - YD:', stakedYDAmount, 'ETH:', stakedETHAmount, 'APY:', apy)

  // 返回质押相关的状态和函数
  // 返回质押相关的状态和函数
  return {
    // YD 质押数据
    stakedAmount: stakedYDAmount, // YD 代币质押量（别名）
    stakedYDAmount, // YD 代币质押量
    
    // ETH 质押数据
    stakedETHAmount, // ETH 质押量
    aaveBalance: aaveBalance ? formatEther(aaveBalance) : '0', // Aave 协议中的 ETH 余额
    aaveEarnings: aaveEarnings ? formatEther(aaveEarnings) : '0', // Aave 协议收益
    
    // 通用数据
    apy, // 年化收益率
    pendingRewards: pendingRewards ? formatEther(pendingRewards) : '0', // 待领取奖励
    stakingAllowance: stakingAllowance ? formatEther(stakingAllowance) : '0', // 对质押合约的授权额度
    
    // 状态数据
    isPending, // 交易是否正在处理中
    txHash, // 最新交易的哈希值
    
    // 刷新函数
    refetchStaked, // 刷新质押余额
    refetchAllowance, // 刷新授权额度
    refetchRewards, // 刷新奖励
    
    // YD 代币操作
    approveStaking: amt => // 授权质押合约使用 YD 代币
      writeContract({
        address: tokenAddress,
        abi: YDTokenABI,
        functionName: 'approve',
        args: [stakingAddress, parseEther(amt)] // 质押合约地址和授权金额
      }),
    depositYD: amt => // 质押 YD 代币
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'depositYD',
        args: [parseEther(amt)] // 质押金额
      }),
    withdrawYD: amt => // 提取 YD 代币
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'withdrawYD',
        args: [parseEther(amt)] // 提取金额
      }),
    
    // ETH 操作
    depositETH: amt => // 质押 ETH
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'depositETH',
        value: parseEther(amt) // 质押金额（作为 value 传递）
      }),
    withdrawETH: amt => // 提取 ETH
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'withdrawETH',
        args: [parseEther(amt)] // 提取金额
      }),
    
    // 收益操作
    claimRewards: () => // 领取奖励
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'claimRewards'
      }),
    compoundRewards: () => // 复投奖励（将奖励重新质押）
      writeContract({
        address: stakingAddress,
        abi: AaveStakingABI,
        functionName: 'compoundRewards'
      })
  }
}
