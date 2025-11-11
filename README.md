# Vanity Contract Address Generator / 以太坊合约靓号地址生成器

[English](#english) | [中文](#中文)

---

## English

### Overview

A tool to mine vanity Ethereum contract addresses based on regex patterns. This tool generates random wallets and calculates contract addresses to find addresses matching your desired pattern.

**✨ Special Feature: Proxy Contract Support** - This tool specifically supports generating vanity addresses for upgradeable proxy contracts, where the proxy contract is deployed as the second contract (nonce 0x01).

### Features

-   **Proxy Contract Support** 🎯 - Generate vanity addresses for upgradeable proxy contracts (nonce 0x01)
-   Generate vanity addresses for the first contract deployment (nonce 0x00) - implementation contracts
-   Generate vanity addresses for the second contract deployment (nonce 0x01) - **perfect for proxy contracts in upgradeable contract patterns**
-   Support for custom regex patterns
-   Progress tracking during mining process

### Installation

```bash
npm install
```

### Usage

#### Generate First Contract Address (Implementation Contract)

Run the default script to find a vanity address for the first contract:

```bash
node index.js
```

or

```bash
npm start
```

This script calculates the contract address using nonce `0x00`.

#### Generate Second Contract Address (Proxy Contract) 🎯

**This is the key feature for upgradeable contracts!** For upgradeable contract patterns (like OpenZeppelin's UUPS, Transparent, or Beacon proxies), the proxy contract is deployed as the second contract. Use this script to find a vanity address for your proxy:

```bash
node index-proxy.js
```

This script calculates the contract address using nonce `0x01`, which is exactly what you need for proxy contracts.

**⚠️ Important Deployment Order**: When using `index-proxy.js`, you must:

1. First deploy the implementation contract (using the wallet found by this script) - this will be at nonce 0x00
2. Then deploy the proxy contract - this will be at nonce 0x01 and will have the vanity address you're looking for

**Why This Matters**: In upgradeable contract architectures, the proxy contract address is the one users interact with. Having a vanity proxy address makes your contract more memorable and professional.

### Customizing the Pattern

Edit the pattern in the script file to match your desired address pattern. The pattern should be a regular expression.

**Example in `index.js` or `index-proxy.js`:**

```javascript
const pattern = new RegExp("8888$"); // Match addresses ending with "8888"
// const pattern = new RegExp("6666$"); // Match addresses ending with "6666"
// const pattern = new RegExp("^5e74"); // Match addresses starting with "5e74"
```

**Note**: All addresses should be in lowercase when specifying patterns.

### Output

When a matching address is found, the script will output:

-   `contract_address`: The vanity contract address
-   `sender address`: The wallet address used to deploy
-   `privateKey`: The private key (keep this secure!)

### Running in PM2 Cluster Mode

To utilize multiple CPU cores for faster mining, run the script in PM2 cluster mode:

```bash
pm2 start index.js -i max
```

or for the proxy script:

```bash
pm2 start index-proxy.js -i max
```

This will spawn one process per CPU core, significantly increasing the mining speed.

### How It Works

1. Generates a random Ethereum wallet
2. Calculates the contract address using RLP encoding of `[sender_address, nonce]`
3. Applies Keccak256 hash to get the contract address
4. Checks if the address matches the desired pattern
5. Repeats until a match is found

### Security Warning

⚠️ **Keep your private keys secure!** Never share or commit private keys to version control.

### Credits

Original Author: [Synthetixio/vanity-contract](https://github.com/Synthetixio/vanity-contract.git)

---

## 中文

### 项目简介

一个基于正则表达式模式挖掘以太坊合约靓号地址的工具。该工具通过生成随机钱包并计算合约地址，找到符合您期望模式的地址。

**✨ 特别功能：代理合约支持** - 本工具专门支持为可升级代理合约生成靓号地址，代理合约作为第二个合约部署（nonce 0x01）。

### 功能特性

-   **代理合约支持** 🎯 - 为可升级代理合约生成靓号地址（nonce 0x01）
-   生成第一个合约部署（nonce 0x00）的靓号地址 - 实现合约
-   生成第二个合约部署（nonce 0x01）的靓号地址 - **完美适用于可升级合约模式中的代理合约**
-   支持自定义正则表达式模式
-   挖矿过程中显示进度追踪

### 安装

```bash
npm install
```

### 使用方法

#### 生成第一个合约地址（实现合约）

运行默认脚本查找第一个合约的靓号地址：

```bash
node index.js
```

或

```bash
npm start
```

此脚本使用 nonce `0x00` 计算合约地址。

#### 生成第二个合约地址（代理合约）🎯

**这是可升级合约的核心功能！** 对于可升级合约模式（如 OpenZeppelin 的 UUPS、Transparent 或 Beacon 代理），代理合约是第二个部署的合约。使用此脚本为您的代理合约查找靓号地址：

```bash
node index-proxy.js
```

此脚本使用 nonce `0x01` 计算合约地址，这正是代理合约所需的。

**⚠️ 重要部署顺序**：使用 `index-proxy.js` 时，您必须：

1. 首先部署实现合约（使用此脚本找到的钱包）- 这将是 nonce 0x00
2. 然后部署代理合约 - 这将是 nonce 0x01，并将获得您寻找的靓号地址

**为什么这很重要**：在可升级合约架构中，代理合约地址是用户交互的地址。拥有一个靓号代理地址可以让您的合约更加令人印象深刻和专业。

### 自定义模式

在脚本文件中编辑模式以匹配您期望的地址模式。模式应为正则表达式。

**在 `index.js` 或 `index-proxy.js` 中的示例：**

```javascript
const pattern = new RegExp("8888$"); // 匹配以 "8888" 结尾的地址
// const pattern = new RegExp("6666$"); // 匹配以 "6666" 结尾的地址
// const pattern = new RegExp("^5e74"); // 匹配以 "5e74" 开头的地址
```

**注意**：指定模式时，所有地址应为小写。

### 输出结果

找到匹配的地址时，脚本将输出：

-   `contract_address`: 靓号合约地址
-   `sender address`: 用于部署的钱包地址
-   `privateKey`: 私钥（请妥善保管！）

### 使用 PM2 集群模式运行

为了利用多核 CPU 加速挖矿，可以在 PM2 集群模式下运行脚本：

```bash
pm2 start index.js -i max
```

或对于代理脚本：

```bash
pm2 start index-proxy.js -i max
```

这将为每个 CPU 核心生成一个进程，显著提高挖矿速度。

### 工作原理

1. 生成随机以太坊钱包
2. 使用 `[发送者地址, nonce]` 的 RLP 编码计算合约地址
3. 应用 Keccak256 哈希得到合约地址
4. 检查地址是否匹配期望的模式
5. 重复直到找到匹配的地址

### 安全警告

⚠️ **请妥善保管您的私钥！** 永远不要分享或将私钥提交到版本控制系统。

### 致谢

原始作者：[Synthetixio/vanity-contract](https://github.com/Synthetixio/vanity-contract.git)
