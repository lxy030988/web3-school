/**
 * YDToken 智能合约 ABI (应用二进制接口)
 * 包含与 YD 代币交互所需的所有函数和事件定义
 */
export const YDTokenABI = [
  {
    // 函数输入参数
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    // 函数名称：查询指定地址的代币余额
    "name": "balanceOf",
    // 函数返回值
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：授权地址和授权数量
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    // 函数名称：授权指定地址使用一定数量的代币
    "name": "approve",
    // 函数返回值：是否授权成功
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：代币所有者和授权使用者的地址
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    // 函数名称：查询指定地址对另一个地址的授权额度
    "name": "allowance",
    // 函数返回值：授权的代币数量
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：购买代币
    "name": "buyTokens",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：支付函数，可以接收以太币
    "stateMutability": "payable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：获取代币价格
    "name": "tokenPrice",
    // 函数返回值：代币价格（以wei为单位）
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：获取合约所有者地址
    "name": "owner",
    // 函数返回值：所有者地址
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：提取合约中的 ETH（仅所有者）
    "name": "withdraw",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  }
]

/**
 * CourseFactory 智能合约 ABI (应用二进制接口)
 * 包含与课程工厂合约交互所需的所有函数和事件定义
 */
export const CourseFactoryABI = [
  {
    // 函数输入参数：课程名称、描述、类别、价格和内容URI
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "category", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "string", "name": "contentURI", "type": "string" }
    ],
    // 函数名称：创建新课程
    "name": "createCourse",
    // 函数返回值：新创建课程的ID
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：课程ID
    "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
    // 函数名称：获取指定课程信息
    "name": "getCourse",
    // 函数返回值：包含课程详细信息的结构体
    "outputs": [
      {
        // 结构体组件：课程的各种属性
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "string", "name": "contentURI", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "totalStudents", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        // 内部类型：CourseFactory.Course 结构体
        "internalType": "struct CourseFactory.Course",
        "name": "",
        "type": "tuple"
      }
    ],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：获取所有课程ID
    "name": "getAllCourses",
    // 函数返回值：包含所有课程ID的数组
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：课程ID、新名称、新描述和新价格
    "inputs": [
      { "internalType": "uint256", "name": "courseId", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    // 函数名称：更新课程信息
    "name": "updateCourse",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：课程ID
    "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
    // 函数名称：增加课程学生数量
    "name": "incrementStudents",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 是否匿名：否，事件可以被索引和筛选
    "anonymous": false,
    // 事件参数
    "inputs": [
      // 索引参数：课程ID，可用于事件筛选
      { "indexed": true, "internalType": "uint256", "name": "courseId", "type": "uint256" },
      // 索引参数：课程作者地址，可用于事件筛选
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" },
      // 非索引参数：课程名称
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      // 非索引参数：课程价格
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    // 事件名称：课程创建事件
    "name": "CourseCreated",
    // 类型：事件
    "type": "event"
  },
  {
    // 是否匿名：否，事件可以被索引和筛选
    "anonymous": false,
    // 事件参数
    "inputs": [
      // 索引参数：课程ID，可用于事件筛选
      { "indexed": true, "internalType": "uint256", "name": "courseId", "type": "uint256" },
      // 非索引参数：课程名称
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      // 非索引参数：课程价格
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    // 事件名称：课程更新事件
    "name": "CourseUpdated",
    // 类型：事件
    "type": "event"
  }
]

/**
 * CourseMarket 智能合约 ABI (应用二进制接口)
 * 包含与课程市场合约交互所需的所有函数和事件定义
 */
export const CourseMarketABI = [
  {
    // 函数输入参数：课程ID
    "inputs": [{ "internalType": "uint256", "name": "courseId", "type": "uint256" }],
    // 函数名称：购买课程
    "name": "purchaseCourse",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：用户地址和课程ID（映射键）
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    // 函数名称：检查用户是否已购买指定课程
    "name": "hasPurchased",
    // 函数返回值：是否已购买
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：用户地址
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    // 函数名称：获取用户已购买的所有课程ID
    "name": "getPurchasedCourses",
    // 函数返回值：已购买课程ID的数组
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：提取课程销售收入
    "name": "withdrawEarnings",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  }
]

/**
 * UserProfile 智能合约 ABI (应用二进制接口)
 * 包含与用户资料合约交互所需的所有函数定义
 */
export const UserProfileABI = [
  {
    // 函数输入参数：显示名称和签名
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    // 函数名称：设置显示名称
    "name": "setDisplayName",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：用户地址
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    // 函数名称：获取显示名称
    "name": "getDisplayName",
    // 函数返回值：显示名称字符串
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：用户地址
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    // 函数名称：获取签名随机数
    "name": "getSignatureNonce",
    // 函数返回值：nonce值
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  }
]

/**
 * AaveStaking 智能合约 ABI (应用二进制接口)
 * 包含与 Aave 质押合约交互所需的所有函数和事件定义
 */
export const AaveStakingABI = [
  {
    // 函数输入参数：YD代币数量
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    // 函数名称：质押YD代币
    "name": "depositYD",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：质押以太币
    "name": "depositETH",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：支付函数，可以接收以太币
    "stateMutability": "payable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：YD代币数量
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    // 函数名称：提取YD代币
    "name": "withdrawYD",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：领取质押奖励
    "name": "claimRewards",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：复投质押奖励
    "name": "compoundRewards",
    // 函数返回值：无
    "outputs": [],
    // 状态可变性：非支付函数，修改状态但不接收以太币
    "stateMutability": "nonpayable",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：用户地址
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    // 函数名称：获取用户质押余额
    "name": "getStakedBalance",
    // 函数返回值：YD代币余额和ETH余额
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：用户地址
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    // 函数名称：计算用户可获得的奖励
    "name": "calculateRewards",
    // 函数返回值：奖励数量
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  },
  {
    // 函数输入参数：无
    "inputs": [],
    // 函数名称：获取当前年化收益率(APY)
    "name": "getCurrentAPY",
    // 函数返回值：APY值（以基点为单位，如500表示5%）
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    // 状态可变性：只读，不修改状态
    "stateMutability": "view",
    // 类型：函数
    "type": "function"
  }
]
