import { useState } from 'react'
import CourseCard from '../components/CourseCard'

const mockCourses = [
  { id: 1, name: 'Solidity 智能合约开发', description: '从零开始学习 Solidity', category: 'smart_contract', price: '100', totalStudents: 1234 },
  { id: 2, name: 'DeFi 协议原理', description: '深入理解 DeFi 生态', category: 'defi', price: '200', totalStudents: 856 },
  { id: 3, name: 'NFT 市场开发', description: '构建完整 NFT 市场', category: 'nft', price: '150', totalStudents: 678 },
  { id: 4, name: '区块链基础', description: '从比特币到以太坊', category: 'blockchain', price: '50', totalStudents: 2345 },
]

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const filtered = mockCourses.filter(c => c.name.includes(search) || c.description.includes(search))

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">课程<span className="gradient-text">市场</span></h1>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索课程..." className="input-field mb-8 max-w-md" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => <CourseCard key={course.id} course={course} />)}
        </div>
      </div>
    </div>
  )
}
