import { Link } from 'react-router-dom'
import { useAccount, useConnect } from 'wagmi'

export default function HomePage() {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

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
