"use strict"; // 启用严格模式

const rlp = require("rlp"); // 引入 RLP 编解码库
const keccak = require("keccak"); // 引入 Keccak 哈希库
const wallet = require("ethereumjs-wallet"); // 引入以太坊钱包工具库

const pattern = new RegExp("8888$"); // 匹配以“什么”结尾的地址
// const pattern = new RegExp("6666$"); // 匹配以“什么”结尾的地址
// const pattern = new RegExp("8888$"); // 匹配以“什么”结尾的地址
let found = false; // 是否已找到目标结果的标记
let runs = 0; // 运行计数器

while (!found) {
	// 循环直到找到符合条件的地址
	if (runs % 1e5 == 0) {
		// 每 100000 次输出一次进度
		console.log(`runs: ${runs}`); // 打印当前运行次数
	}
	let nonce = 0x00; //The nonce must be a hex literal! // 交易计数（必须是十六进制字面量）
	let sender = wallet.generate(); // Generate wallet // 生成新的随机钱包
	let address = sender.getAddressString(); //Requires a hex string as input! // 获取钱包地址字符串

	let input_arr = [address, nonce]; // RLP 编码输入：[发送者地址, nonce]
	let rlp_encoded = rlp.encode(input_arr); // 对输入进行 RLP 编码

	let contract_address_long = keccak("keccak256").update(rlp_encoded).digest("hex"); // 对编码结果做 keccak256，得到长哈希

	let contract_address = contract_address_long.substring(24); //Trim the first 24 characters. // 截取后 40 位得到部署合约地址

	if (pattern.test(contract_address)) {
		// 测试地址是否以 444444 结尾
		const privateKey = sender.getPrivateKeyString(); // 获取私钥字符串
		console.log(`contract_address: ${contract_address}`); // 输出合约地址
		console.log(`sender address: ${address}`); // 输出发送者地址
		console.log(`privateKey: ${privateKey}`); // 输出对应私钥（请妥善保管）
		found = true; // 标记为已找到，结束循环
	}
	runs++; // 运行次数加一
}
