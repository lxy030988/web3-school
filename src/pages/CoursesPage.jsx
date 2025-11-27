/**
 * 课程市场页面组件
 * 显示所有可用课程，并提供搜索和创建功能
 */

// 导入 React 核心功能
import { useState } from 'react'

// 导入路由相关组件
import { Link } from 'react-router-dom'

// 导入 wagmi 钱包相关 hooks
import { useAccount } from 'wagmi'

// 导入组件和自定义 hooks
import CourseCard from '../components/CourseCard'
import { useCourses, useCourse } from '../hooks/useWeb3'

function CourseItem({ courseId, currentUserAddress }) {
  const course = useCourse(courseId)

  // 过滤掉自己创建的课程
  if (!courseId || !course || !course.isActive) return null
  if (currentUserAddress && course.author?.toLowerCase() === currentUserAddress.toLowerCase()) return null

  return <CourseCard course={course} />
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const { address } = useAccount()
  const { courseIds } = useCourses()

  // 过滤掉无效的 courseId
  const validCourseIds = courseIds.filter(id => id != null && id !== undefined)

  console.log('CoursesPage - courseIds:', courseIds, 'valid:', validCourseIds, 'length:', validCourseIds?.length)

  // 由于没有课程数据,显示创建课程提示
  const hasCourses = validCourseIds && validCourseIds.length > 0

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">课程<span className="gradient-text">市场</span></h1>
          <Link to="/create-course" className="btn-primary">
            ➕ 创建课程
          </Link>
        </div>

        {hasCourses && (
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索课程..."
            className="input-field mb-8 max-w-md"
          />
        )}

        {hasCourses ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validCourseIds.map(courseId => (
              <CourseItem key={courseId.toString()} courseId={courseId} currentUserAddress={address} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 card">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-2">暂无课程</h2>
            <p className="text-gray-400 mb-6">课程市场中还没有课程,快来创建第一个吧!</p>
            <Link to="/create-course" className="btn-primary inline-block">
              创建第一个课程
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
