import { Link } from 'react-router-dom'

export default function CourseCard({ course, isPurchased }) {
  const { id, name, description, category, price, author, totalStudents = 0 } = course

  return (
    <Link to={`/course/${id}`} className="card block hover:scale-105 transition-transform">
      <div className="aspect-video rounded-xl mb-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
        <span className="text-4xl">📚</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{category}</span>
        {isPurchased && <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">已购买</span>}
      </div>
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-purple-400 font-bold">{price} YD</span>
        <span className="text-gray-500 text-sm">{totalStudents} 学员</span>
      </div>
    </Link>
  )
}
