import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useUserProfile, useYDToken } from '../hooks/useWeb3'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [name, setName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const { updateDisplayName, isUpdating } = useUserProfile()
  const { ydBalance } = useYDToken()

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      await updateDisplayName(name)
      setIsEditing(false)
    } catch (error) {
      console.error('Update failed:', error)
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="card mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl font-bold">
              {address?.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field"
                    placeholder="输入名称"
                    disabled={isUpdating}
                  />
                  <button
                    onClick={handleSave}
                    className="btn-primary py-2 px-4"
                    disabled={isUpdating}
                  >
                    {isUpdating ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary py-2 px-4"
                    disabled={isUpdating}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{name || address?.slice(0, 10) + '...'}</h2>
                  <button onClick={() => setIsEditing(true)} className="text-purple-400 hover:text-purple-300">
                    ✏️ 编辑
                  </button>
                </div>
              )}
              <p className="text-gray-400 mt-1">{address}</p>
              <p className="text-purple-400 mt-2">余额: {parseFloat(ydBalance || 0).toFixed(2)} YD</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">我的课程</h3>
        <div className="text-center py-12 card">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-400">还没有购买课程</p>
          <p className="text-sm text-gray-500 mt-2">前往课程市场购买课程</p>
        </div>
      </div>
    </div>
  )
}
