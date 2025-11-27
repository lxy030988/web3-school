/**
 * 首页组件
 * 展示平台介绍和主要功能
 */

// 导入路由相关组件
import { Link } from 'react-router-dom'

// 导入 wagmi 钱包相关 hooks
import { useAccount, useConnect } from 'wagmi'

/**
 * 首页组件函数
 * @returns {JSX.Element} 首页UI
 */
export default function HomePage() {
  // 获取钱包连接状态
  const { isConnected } = useAccount()
  
  // 获取钱包连接相关函数和连接器
  const { connect, connectors } = useConnect()

  // 平台主要功能列表
  const features = [
    { icon: '🎓', title: '去中心化课程', desc: '课程存储在区块链上，永不丢失' },
    { icon: '💰', title: 'YD 代币支付', desc: '使用平台代币购买课程' },
    { icon: '📈', title: 'AAVE 理财', desc: '质押获取稳定收益' },
    { icon: '🔐', title: '签名验证', desc: 'MetaMask 安全访问' },
  ]

  return (
    <div className="min-h-screen">
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-purple-500/20 rounded-full text-purple-400 text-sm mb-8">
            🚀 基于区块链的在线教育平台
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Web3</span> 大学
          </h1>
          <p className="text-xl text-gray-400 mb-10">
            使用 YD 代币购买课程，通过 MetaMask 签名安全访问
          </p>
          {isConnected ? (
            <Link to="/courses" className="btn-primary">浏览课程 →</Link>
          ) : (
            <button onClick={() => connect({ connector: connectors[0] })} className="btn-primary">连接钱包开始</button>
          )}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
