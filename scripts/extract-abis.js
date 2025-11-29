/**
 * ABI 提取脚本
 * 从 artifacts/contracts 目录提取合约 ABI 到 src/contracts/abis.js
 *
 * 使用方法: node scripts/extract-abis.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 路径配置
const ARTIFACTS_DIR = path.join(__dirname, '..', 'artifacts', 'contracts')
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'contracts', 'abis.js')

// 要提取的合约列表（按顺序）
const CONTRACTS = [
  'YDToken',
  'CourseFactory',
  'CourseMarket',
  'UserProfile',
  'AaveStaking'
]

/**
 * 从 artifact JSON 文件中读取 ABI
 * @param {string} contractName 合约名称
 * @returns {Array|null} ABI 数组或 null
 */
function readABI(contractName) {
  const jsonPath = path.join(
    ARTIFACTS_DIR,
    `${contractName}.sol`,
    `${contractName}.json`
  )

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ 未找到: ${jsonPath}`)
    return null
  }

  try {
    const content = fs.readFileSync(jsonPath, 'utf-8')
    const artifact = JSON.parse(content)
    console.log(`✅ 读取成功: ${contractName} (${artifact.abi.length} 个条目)`)
    return artifact.abi
  } catch (error) {
    console.error(`❌ 读取失败 ${contractName}:`, error.message)
    return null
  }
}

/**
 * 生成 abis.js 文件内容
 * @param {Object} abis 合约名称到 ABI 的映射
 * @returns {string} 文件内容
 */
function generateABIsFile(abis) {
  let content = `/**
 * 智能合约 ABI 文件
 * 由 scripts/extract-abis.js 自动生成
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 *
 * 请勿手动修改此文件，如需更新请运行:
 * node scripts/extract-abis.js
 */

`

  for (const contractName of CONTRACTS) {
    const abi = abis[contractName]
    if (abi) {
      content += `export const ${contractName}ABI = ${JSON.stringify(abi, null, 2)}\n\n`
    }
  }

  return content
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始提取 ABI...\n')

  // 检查 artifacts 目录是否存在
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    console.error(`❌ 目录不存在: ${ARTIFACTS_DIR}`)
    console.log('请先编译合约: npx hardhat compile')
    process.exit(1)
  }

  // 读取所有合约的 ABI
  const abis = {}
  let successCount = 0

  for (const contractName of CONTRACTS) {
    const abi = readABI(contractName)
    if (abi) {
      abis[contractName] = abi
      successCount++
    }
  }

  console.log(`\n📊 成功读取 ${successCount}/${CONTRACTS.length} 个合约`)

  if (successCount === 0) {
    console.error('❌ 没有成功读取任何 ABI，退出')
    process.exit(1)
  }

  // 生成并写入文件
  const content = generateABIsFile(abis)

  // 确保目标目录存在
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8')
  console.log(`\n✅ 已生成: ${OUTPUT_FILE}`)
  console.log(`📦 文件大小: ${(content.length / 1024).toFixed(2)} KB`)
}

// 运行
main()
