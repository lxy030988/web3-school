/**
 * 网站头部组件
 * 显示网站标题、导航菜单和钱包连接状态
 */

// 导入路由相关组件
import { Link, useLocation } from 'react-router-dom'

// 导入 wagmi 钱包相关 hooks
import { useAccount, useConnect, useDisconnect } from 'wagmi'

// 导入自定义 Web3 hooks
import { useYDToken, useUserProfile } from '../hooks/useWeb3'

/**
 * 头部组件函数
 * @returns {JSX.Element} 头部UI
 */
export default function Header() {
  // 获取当前路由位置
  const location = useLocation()

  // 获取钱包账户信息
  const { address, isConnected } = useAccount()

  // 获取钱包连接相关函数和连接器
  const { connect, connectors } = useConnect()

  // 获取断开连接函数
  const { disconnect } = useDisconnect()

  // 获取YD代币余额
  const { ydBalance } = useYDToken()

  // 获取用户显示名称
  const { displayName } = useUserProfile()

  // 导航链接配置
  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/courses', label: '课程市场' },
    { path: '/my-courses', label: '我的课程' },
    { path: '/create-course', label: '创建课程' },
    { path: '/staking', label: '质押理财' },
    { path: '/profile', label: '个人中心' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">W3</div>
          <span className="text-xl font-bold"><span className="gradient-text">Web3</span> School</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className={`transition-colors ${location.pathname === link.path ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-500/20 rounded-lg text-green-400 text-sm font-medium">
              {ydBalance || '0'} YD
            </span>
            <span className="px-3 py-1 bg-purple-500/20 rounded-lg text-purple-400 text-sm">
              {displayName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </span>
            <button onClick={() => disconnect()} className="text-gray-400 hover:text-white text-sm">断开</button>
          </div>
        ) : (
          <button onClick={() => connect({ connector: connectors[0] })} className="btn-primary py-2 px-4 text-sm">
            连接钱包
          </button>
        )}
      </div>
    </header>
  )
}
