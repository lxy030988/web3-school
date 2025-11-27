/**
 * Web3 School 应用程序入口文件
 * 此文件负责初始化 React 应用并设置必要的提供者
 */

// 导入 React 核心库和 ReactDOM 用于渲染
import React from 'react'
import ReactDOM from 'react-dom/client'

// 导入 Web3 相关的 wagmi 提供者，用于处理以太坊钱包连接
import { WagmiProvider } from 'wagmi'

// 导入 React Query 相关组件，用于处理异步状态管理和缓存
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 导入 BrowserRouter 用于处理前端路由
import { BrowserRouter } from 'react-router-dom'

// 导入主应用组件
import App from './App'

// 导入 wagmi 配置，包含钱包连接设置
import { config } from './config/wagmi'

// 导入全局样式
import './index.css'

// 创建 React Query 客户端实例，用于管理应用中的异步状态
const queryClient = new QueryClient()

// 使用 React 18 的 createRoot API 渲染应用
ReactDOM.createRoot(document.getElementById('root')).render(
  // 启用 React 严格模式，有助于发现潜在问题
  <React.StrictMode>
    {/* wagmi 提供者，使整个应用可以访问 Web3 功能 */}
    <WagmiProvider config={config}>
      {/* React Query 提供者，使整个应用可以访问查询功能 */}
      <QueryClientProvider client={queryClient}>
        {/* 路由提供者，启用前端路由功能 */}
        <BrowserRouter>
          {/* 主应用组件 */}
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
