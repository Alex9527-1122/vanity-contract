"use strict"; // 启用严格模式

const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const os = require("os");

// 配置参数 - 可以通过命令行参数或环境变量设置
// 使用方式: PATTERN="ABCD$" WORKERS=8 node account-parallel.js
// 或者: node account-parallel.js ABCD$ 8
const PATTERN = process.argv[2] || process.env.PATTERN || "6666$"; // 匹配模式
const NUM_WORKERS = parseInt(process.argv[3]) || parseInt(process.env.WORKERS) || os.cpus().length; // 工作线程数量
const PROGRESS_INTERVAL = 1e5; // 每 100000 次输出一次进度
const WORKER_REPORT_INTERVAL = 1e4; // worker 每 10000 次报告一次进度，以便主线程平滑输出

if (isMainThread) {
	// 主线程：管理工作线程
	console.log(`启动 ${NUM_WORKERS} 个工作线程，模式: ${PATTERN}`);
	console.log(`CPU 核心数: ${os.cpus().length}`);
	console.log("开始搜索账户靓号...\n");

	const workers = [];
	let totalRuns = 0;
	let lastLoggedRuns = 0; // 上次输出日志时的总运行次数
	let found = false;
	const startTime = Date.now();

	// 创建多个工作线程
	for (let i = 0; i < NUM_WORKERS; i++) {
		const worker = new Worker(__filename, {
			workerData: {
				pattern: PATTERN,
				workerId: i,
				progressInterval: WORKER_REPORT_INTERVAL,
			},
		});

		worker.on("message", (msg) => {
			if (msg.type === "progress") {
				// 汇总进度
				totalRuns += msg.runs;
				// 每10万次总运行次数输出一次日志（检查是否达到10万的倍数）
				const nextLogPoint = Math.floor(totalRuns / PROGRESS_INTERVAL) * PROGRESS_INTERVAL;
				if (nextLogPoint > lastLoggedRuns) {
					const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
					const rate = ((totalRuns / (Date.now() - startTime)) * 1000).toFixed(0);
					console.log(`总运行次数: ${totalRuns.toLocaleString()} | 耗时: ${elapsed}s | 速度: ${rate}/s`);
					lastLoggedRuns = nextLogPoint;
				}
			} else if (msg.type === "found") {
				// 找到匹配的地址
				if (!found) {
					found = true;
					console.log("\n" + "=".repeat(60));
					console.log("找到匹配的账户地址！");
					console.log("=".repeat(60));
					console.log(`account_address: ${msg.account_address}`);
					console.log(`privateKey: ${msg.privateKey}`);
					console.log(`总运行次数: ${totalRuns.toLocaleString()}`);
					console.log(`总耗时: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
					console.log("=".repeat(60) + "\n");

					// 通知所有工作线程停止
					workers.forEach((w) => {
						w.postMessage("stop");
						w.terminate();
					});
					process.exit(0);
				}
			}
		});

		worker.on("error", (err) => {
			console.error(`工作线程 ${i} 错误:`, err);
			if (!found) {
				// 如果还没找到结果，重新创建工作线程
				console.log(`重新创建工作线程 ${i}...`);
				// 这里可以添加重新创建逻辑，但为了简化，我们直接退出
			}
		});

		worker.on("exit", (code) => {
			if (code !== 0 && !found) {
				console.error(`工作线程 ${i} 异常退出，退出码: ${code}`);
			}
		});

		workers.push(worker);
	}

	// 优雅退出处理
	process.on("SIGINT", () => {
		console.log("\n正在停止所有工作线程...");
		workers.forEach((w) => w.terminate());
		process.exit(0);
	});
} else {
	// 工作线程：执行实际计算
	const wallet = require("ethereumjs-wallet");

	const pattern = new RegExp(workerData.pattern);
	const workerId = workerData.workerId;
	const progressInterval = workerData.progressInterval;
	let runs = 0;
	let lastReportedRuns = 0;
	let shouldStop = false;

	// 监听主线程的停止信号
	parentPort.on("message", (msg) => {
		if (msg === "stop") {
			shouldStop = true;
		}
	});

	while (!shouldStop) {
		// 循环直到找到符合条件的账户地址
		const sender = wallet.generate();
		const address = sender.getAddressString();

		if (pattern.test(address)) {
			// 找到匹配的账户地址
			const privateKey = sender.getPrivateKeyString();
			parentPort.postMessage({
				type: "found",
				account_address: address,
				privateKey: privateKey,
			});
			break;
		}

		runs++;

		// 定期报告进度
		if (runs - lastReportedRuns >= progressInterval) {
			parentPort.postMessage({
				type: "progress",
				runs: runs - lastReportedRuns,
			});
			lastReportedRuns = runs;
		}
	}
}
