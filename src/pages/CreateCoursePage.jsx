/**
 * 创建课程页面组件
 * 提供表单供用户创建新课程
 */

// 导入 React 核心功能
import { useState, useEffect } from 'react'

// 导入 wagmi 相关 hooks
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'

// 导入 viem 工具函数，用于处理以太币单位转换
import { parseEther } from 'viem'

// 导入配置文件
import { getContractAddress } from '../config/wagmi'

// 导入合约 ABI
import { CourseFactoryABI } from '../contracts/abis'

// 导入路由相关组件
import { useNavigate } from 'react-router-dom'

/**
 * 创建课程页面组件函数
 * @returns {JSX.Element} 创建课程页面UI
 */
export default function CreateCoursePage() {
  // 获取钱包连接状态
  const { isConnected } = useAccount()
  
  // 获取导航函数
  const navigate = useNavigate()
  
  // 获取当前区块链网络 ID
  const chainId = useChainId()
  
  // 获取课程工厂合约地址
  const factoryAddress = getContractAddress('CourseFactory', chainId)
  
  // 获取写入合约的函数和状态
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  
  // 获取交易确认状态
  const { isLoading: isConfirming, isSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash })
  
  // 交易状态提示
  const [txStatus, setTxStatus] = useState('')

  // 表单数据状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'web3',
    price: '',
    contentURI: ''
  })

  // 课程分类选项
  const categories = [
    { value: 'web3', label: 'Web3 开发' },
    { value: 'smart_contract', label: '智能合约' },
    { value: 'defi', label: 'DeFi' },
    { value: 'nft', label: 'NFT' },
    { value: 'blockchain', label: '区块链基础' },
    { value: 'frontend', label: '前端开发' },
    { value: 'backend', label: '后端开发' },
    { value: 'other', label: '其他' }
  ]

  /**
   * 监听交易确认状态的副作用
   * 交易成功后显示成功消息并跳转
   */
  useEffect(() => {
    if (isSuccess) {
      // 设置成功状态提示
      setTxStatus('课程创建成功!即将跳转...')
      
      // 清空表单数据
      setFormData({
        name: '',
        description: '',
        category: 'web3',
        price: '',
        contentURI: ''
      })
      
      // 延迟跳转到课程市场页面
      setTimeout(() => {
        navigate('/courses')
      }, 1500)
    }
  }, [isSuccess, navigate]) // 当交易成功或导航函数变化时执行

  /**
   * 监听交易错误的副作用
   * 处理写入和确认阶段的错误
   */
  useEffect(() => {
    if (writeError) {
      // 设置写入错误状态提示
      setTxStatus('创建失败: ' + writeError.message)
    } else if (confirmError) {
      // 设置确认错误状态提示
      setTxStatus('交易确认失败: ' + confirmError.message)
    }
  }, [writeError, confirmError]) // 当错误变化时执行

  /**
   * 监听交易状态的副作用
   * 根据交易状态显示不同的提示
   */
  useEffect(() => {
    if (isPending) {
      // 交易正在发送中
      setTxStatus('正在发送交易...')
    } else if (isConfirming) {
      // 交易已发送，等待确认
      setTxStatus('交易已发送,等待确认...')
    }
  }, [isPending, isConfirming]) // 当交易状态变化时执行

  /**
   * 处理表单提交
   * 调用智能合约创建课程
   * @param {Event} e - 表单提交事件
   */
  const handleSubmit = async (e) => {
    // 阻止表单默认提交行为
    e.preventDefault()

    // 验证必填字段
    if (!formData.name || !formData.description || !formData.price) {
      alert('请填写所有必填字段')
      return
    }

    // 调试日志
    console.log('Creating course with data:', formData)
    console.log('Factory address:', factoryAddress)

    try {
      // 调用智能合约创建课程
      writeContract({
        address: factoryAddress,
        abi: CourseFactoryABI,
        functionName: 'createCourse',
        args: [
          formData.name,
          formData.description,
          formData.category,
          parseEther(formData.price), // 将价格转换为 wei
          formData.contentURI || 'ipfs://default' // 如果没有提供内容URI，使用默认值
        ],
        gas: 500000n // 设置 gas 限制
      })
    } catch (error) {
      // 错误处理和日志记录
      console.error('Create course failed:', error)
      setTxStatus('创建失败: ' + (error?.message || '未知错误'))
    }
  }

  /**
   * 处理表单输入变化
   * 更新表单数据状态
   * @param {Event} e - 输入事件
   */
  const handleChange = (e) => {
    // 获取输入名称和值
    const { name, value } = e.target
    // 更新表单数据
    setFormData(prev => ({ ...prev, [name]: value }))
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">创建<span className="gradient-text">课程</span></h1>
          <p className="text-gray-400">发布你的知识,赚取收益</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-6">
            {/* 课程名称 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                课程名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="例: Solidity 智能合约开发"
                className="input-field"
                disabled={isPending}
                required
              />
            </div>

            {/* 课程描述 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                课程描述 <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="简要描述课程内容,帮助学员了解课程..."
                className="input-field min-h-[120px]"
                disabled={isPending}
                required
              />
            </div>

            {/* 课程分类 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                课程分类 <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                disabled={isPending}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 课程价格 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                课程价格 (YD) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="例: 100"
                className="input-field"
                disabled={isPending}
                min="0"
                step="1"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                学员购买课程需要支付的 YD 代币数量
              </p>
            </div>

            {/* 内容 URI */}
            <div>
              <label className="block text-sm font-medium mb-2">
                内容 URI (可选)
              </label>
              <input
                type="text"
                name="contentURI"
                value={formData.contentURI}
                onChange={handleChange}
                placeholder="ipfs://... 或 https://..."
                className="input-field"
                disabled={isPending}
              />
              <p className="text-sm text-gray-500 mt-1">
                课程内容的存储地址 (IPFS、Arweave 等)
              </p>
            </div>

            {/* 状态提示 */}
            {txStatus && (
              <div className={`p-4 rounded-xl ${txStatus.includes('失败') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                {txStatus}
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="flex-1 btn-secondary"
                disabled={isPending || isConfirming}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={isPending || isConfirming}
              >
                {isPending || isConfirming ? '创建中...' : '创建课程'}
              </button>
            </div>
          </div>
        </form>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>💡</span> 提示
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• 创建课程需要支付 Gas 费用</li>
            <li>• 课程创建后将立即在市场中显示</li>
            <li>• 学员购买课程后,收益将进入你的钱包</li>
            <li>• 创建的课程默认为激活状态</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
