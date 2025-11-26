import { Link, useLocation } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function Header() {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/courses', label: '课程市场' },
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
            <span className="px-3 py-1 bg-purple-500/20 rounded-lg text-purple-400 text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
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
