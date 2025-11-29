/**
 * 我的课程页面组件
 * 显示当前用户创建的所有课程
 */

// 导入 React 核心功能
import { useState, useEffect } from 'react'

// 导入路由相关组件
import { Link } from 'react-router-dom'

// 导入 wagmi 钱包相关 hooks
import { useAccount } from 'wagmi'

// 导入自定义 hooks
import { useCourses, useCourse, useAuthorEarnings, useYDToken } from '../hooks/useWeb3'

/**
 * 已创建课程项组件
 * 显示单个用户创建的课程卡片
 * @param {Object} props - 组件属性
 * @param {string|number} props.courseId - 课程 ID
 * @param {string} props.currentUserAddress - 当前用户地址
 * @returns {JSX.Element|null} 课程卡片或 null
 */
function CreatedCourseItem({ courseId, currentUserAddress }) {
  // 获取课程详细信息
  const course = useCourse(courseId)

  // 只显示当前用户创建的激活课程
  if (!courseId || !course || !course.isActive) return null
  if (!currentUserAddress || course.author?.toLowerCase() !== currentUserAddress.toLowerCase()) return null

  return (
    <div className="card">
      <div className="aspect-video rounded-xl mb-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
        <span className="text-4xl">📚</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{course.category}</span>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">我的课程</span>
      </div>
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-purple-400 font-bold">{course.price} YD</span>
        <span className="text-gray-500 text-sm">{course.totalStudents?.toString() || 0} 学员</span>
      </div>
    </div>
  )
}

export default function MyCreatedCoursesPage() {
  const { address, isConnected } = useAccount()
  const { courseIds } = useCourses()
  const [search, setSearch] = useState('')
  const [lastTxHash, setLastTxHash] = useState(null)

  // 获取 YD 代币余额刷新函数（与 Header 共享缓存）
  const { refetchBalance } = useYDToken()

  // 获取作者收入相关数据和函数
  const {
    earnings,
    isPending,
    isConfirmed,
    txHash,
    withdrawEarnings,
    refetchEarnings
  } = useAuthorEarnings()

  // 监听交易确认，刷新数据
  useEffect(() => {
    if (isConfirmed && txHash && txHash !== lastTxHash) {
      setLastTxHash(txHash)
      refetchEarnings()
      refetchBalance()
      alert('提取成功！YD 代币已转入您的钱包')
    }
  }, [isConfirmed, txHash, lastTxHash, refetchEarnings, refetchBalance])

  // 判断是否正在加载：提交中 或 已提交但未确认
  const isLoading = isPending || (txHash && !isConfirmed && txHash !== lastTxHash)

  // 处理提取收入
  const handleWithdraw = () => {
    if (parseFloat(earnings) <= 0) {
      alert('暂无可提取的收入')
      return
    }
    withdrawEarnings()
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

  // 过滤掉无效的 courseId
  const validCourseIds = courseIds.filter(id => id != null && id !== undefined)
  const hasCourses = validCourseIds && validCourseIds.length > 0

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">我创建的<span className="gradient-text">课程</span></h1>
          <Link to="/create-course" className="btn-primary">
            ➕ 创建新课程
          </Link>
        </div>

        {/* 收入提取卡片 */}
        <div className="card mb-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">我的课程收入（可提取）</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {parseFloat(earnings).toFixed(4)} <span className="text-lg text-yellow-500">YD</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isLoading || parseFloat(earnings) <= 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                parseFloat(earnings) > 0 && !isLoading
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  提取中...
                </span>
              ) : (
                '提取收入'
              )}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-4">
            * 当学员购买您的课程时，您将获得课程价格的 95%（平台收取 5% 手续费）
          </p>
        </div>

        {hasCourses && (
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索我的课程..."
            className="input-field mb-8 max-w-md"
          />
        )}

        {hasCourses ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validCourseIds.map(courseId => (
              <CreatedCourseItem key={courseId.toString()} courseId={courseId} currentUserAddress={address} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 card">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">还没有创建课程</h2>
            <p className="text-gray-400 mb-6">开始创建您的第一个课程,分享知识赚取收益!</p>
            <Link to="/create-course" className="btn-primary inline-block">
              创建第一个课程
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
