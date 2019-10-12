import { Bytes, TransactionReceipt, Transaction, Block, wireEncodeByteArray, wireEncodeOffChainTransaction, wireEncodeNumber, wireEncodeBlockTag, wireEncodeOnChainTransaction, validateJsonRpcResponse } from "./index"
import { assert, use as chaiUse } from "chai"
import chaiBytes from 'chai-bytes'
import chaiDatetime from 'chai-datetime'
chaiUse(chaiBytes)
chaiUse(chaiDatetime)

declare global { const console: { log: (message: string) => void; error: (message: string) => void } }

function testBytes() {
	assert.equalBytes(Bytes.fromUnsignedInteger(0n, 8), [0x00])
	assert.equalBytes(Bytes.fromUnsignedInteger(0n, 256), [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
	assert.equalBytes(Bytes.fromSignedInteger(0n, 8), [0x00])
	assert.equalBytes(Bytes.fromUnsignedInteger(1n, 8), [0x01])
	assert.equalBytes(Bytes.fromSignedInteger(1n, 8), [0x01])
	assert.equalBytes(Bytes.fromSignedInteger(-1n, 8), [0xff])
	assert.equalBytes(Bytes.fromHexString('0x00'), [0x00])
	assert.equalBytes(Bytes.fromHexString('00'), [0x00])
	assert.equalBytes(Bytes.fromHexString('0x000000'), [0x00, 0x00, 0x00])
	assert.equalBytes(Bytes.fromHexString('00000000'), [0x00, 0x00, 0x00, 0x00])
	assert.equalBytes(new Bytes(1), [0x00])
	assert.equal(new Bytes(1).to0xString(), '0x00')
	assert.equal(new Bytes(1).toString(), '00')
	assert.equal(new Bytes(1).toUnsignedBigint(), 0n)
	assert.equal(new Bytes(1).toSignedBigint(), 0n)
	assert.equal(Bytes.fromUnsignedInteger(1n, 8).toUnsignedBigint(), 1n)
	assert.equal(Bytes.fromSignedInteger(1n, 8).toSignedBigint(), 1n)
	assert.equal(Bytes.fromSignedInteger(-1n, 8).toSignedBigint(), -1n)
	assert.equal(Bytes.fromHexString('ff').toSignedBigint(), -1n)
	assert.equal(Bytes.fromHexString('ff').toUnsignedBigint(), 255n)
	assert.throws(() => Bytes.fromUnsignedInteger(256n, 8))
	assert.equalBytes(new Bytes(1), [0x00])
	assert.equalBytes(Bytes.fromHexString('0x'), [])
	assert.equalBytes(Bytes.fromHexString(''), [])
}

function testTransactionReceipt() {
	const sampleRawLog = {
		"logIndex": "0x1", // 1
		"blockNumber": "0x1b4", // 436
		"blockHash": "0xb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10c",
		"transactionHash": "0xcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefcafebeef",
		"transactionIndex": "0x0", // 0
		"address": "0xdeadbabedeadbabedeadbabedeadbabedeadbabe",
		"data": "0x0000000000000000000000000000000000000000000000000000000000000000",
		"topics": ["0xdeaffacedeaffacedeaffacedeaffacedeaffacedeaffacedeaffacedeafface"]
	}
	const sampleRawTransactionReceipt = {
		"blockHash": "0xb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10c",
		"blockNumber": "0x6914b0", // 6886576
		"contractAddress": "0xbaadf00dbaadf00dbaadf00dbaadf00dbaadf00d",
		"from": "0xbabebabebabebabebabebabebabebabebabebabe",
		"to": null,
		"cumulativeGasUsed": "0x158e33", // 1412659
		"gasUsed": "0xba2e6", // 762598
		"logs": [sampleRawLog],
		"logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // technically not correct since we have a log, but code doesn't validate this
		"root": null,
		"status": "0x1", // 1
		"transactionHash": "0xcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefcafebeef",
		"transactionIndex": "0x4" // 4
	}
	const sampleTransactionReceipt = new TransactionReceipt(sampleRawTransactionReceipt)
	assert.equal(sampleTransactionReceipt.blockHash, 0xb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cn)
	assert.equal(sampleTransactionReceipt.blockNumber, 6886576n)
	assert.isNotNull(sampleTransactionReceipt.contractAddress)
	assert.equal(sampleTransactionReceipt.contractAddress!, 0xbaadf00dbaadf00dbaadf00dbaadf00dbaadf00dn)
	assert.equal(sampleTransactionReceipt.cumulativeGasUsed, 1412659n)
	assert.equal(sampleTransactionReceipt.from, 0xbabebabebabebabebabebabebabebabebabebaben)
	assert.equal(sampleTransactionReceipt.gasUsed, 762598n)
	assert.equal(sampleTransactionReceipt.hash, 0xcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefn)
	assert.equal(sampleTransactionReceipt.index, 4n)
	assert.equal(sampleTransactionReceipt.status, true)
	assert.isNull(sampleTransactionReceipt.to)
	assert.equal(sampleTransactionReceipt.logsBloom, 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n)
	assert.equal(sampleTransactionReceipt.logs.length, 1)
	const sampleLog = sampleTransactionReceipt.logs[0]
	assert.equal(sampleLog.address, 0xdeadbabedeadbabedeadbabedeadbabedeadbaben)
	assert.equal(sampleLog.blockHash, 0xb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cb10cn)
	assert.equal(sampleLog.blockNumber, 436n)
	assert.equalBytes(sampleLog.data, '0000000000000000000000000000000000000000000000000000000000000000')
	assert.equal(sampleLog.logIndex, 1n)
	assert.equal(sampleLog.topics.length, 1)
	assert.equal(sampleLog.topics[0], 0xdeaffacedeaffacedeaffacedeaffacedeaffacedeaffacedeaffacedeaffacen)
	assert.equal(sampleLog.transactionHash, 0xcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefcafebeefn)
	assert.equal(sampleLog.transactionIndex, 0n)
}

function testTransaction() {
	const rawTransaction = {
		"blockHash": "0xd0007d3e0884b25c214aa15a0daeca341efeadfc46f9d323d4916b5ac4f87533",
		"blockNumber": "0x7a729b",
		"chainId": "0x1",
		"condition": null,
		"creates": null,
		"from": "0xfc15680a8423a540d33ca90c5e3616e93a032f94",
		"gas": "0xc801",
		"gasPrice": "0x98bca5a00",
		"hash": "0x55066e2f47b7fdede6ab6f4a1abb026d9e7bbff94259d2e8da8ed7fb40e87673",
		"input": "0xa9059cbb0000000000000000000000002c55161d18a002307dc721d9bbc6502e1523e9b50000000000000000000000000000000000000000000000000000000000000050",
		"nonce": "0x35d",
		"publicKey": "0xd8b42a0bb61c0dc876fae704807949e4c38e132233304b92deeae2e9e2d7d404e0941835bac5e556ef509e4591ff6d15285cb2519eb43d377d620115c03834a5",
		"r": "0x7bb1ee45cab7da0a651ad45f3b28f4f1503125132d35c211648139cedbd99bbb",
		"raw": "0xf8ab82035d85098bca5a0082c80194d9dbe80995dbe64e371464b94d78baf10a694ed080b844a9059cbb0000000000000000000000002c55161d18a002307dc721d9bbc6502e1523e9b5000000000000000000000000000000000000000000000000000000000000005026a07bb1ee45cab7da0a651ad45f3b28f4f1503125132d35c211648139cedbd99bbba05257df01b2ec8b3384344f29b4c03c1715c1eee30e9c3fd82c0b29691344200e",
		"s": "0x5257df01b2ec8b3384344f29b4c03c1715c1eee30e9c3fd82c0b29691344200e",
		"standardV": "0x1",
		"to": "0xd9dbe80995dbe64e371464b94d78baf10a694ed0",
		"transactionIndex": "0x0",
		"v": "0x26",
		"value": "0x0"
	}
	const transaction = new Transaction(rawTransaction)
	assert.equal(transaction.blockHash!, 0xd0007d3e0884b25c214aa15a0daeca341efeadfc46f9d323d4916b5ac4f87533n)
	assert.equal(transaction.blockNumber, 0x7a729bn)
	assert.equalBytes(transaction.data, 'a9059cbb0000000000000000000000002c55161d18a002307dc721d9bbc6502e1523e9b50000000000000000000000000000000000000000000000000000000000000050')
	assert.equal(transaction.from, 0xfc15680a8423a540d33ca90c5e3616e93a032f94n)
	assert.equal(transaction.gas, 0xc801n)
	assert.equal(transaction.gasPrice, 0x98bca5a00n)
	assert.equal(transaction.hash, 0x55066e2f47b7fdede6ab6f4a1abb026d9e7bbff94259d2e8da8ed7fb40e87673n)
	assert.equal(transaction.index, 0n)
	assert.equal(transaction.nonce, 0x35dn)
	assert.equal(transaction.r, 0x7bb1ee45cab7da0a651ad45f3b28f4f1503125132d35c211648139cedbd99bbbn)
	assert.equal(transaction.s, 0x5257df01b2ec8b3384344f29b4c03c1715c1eee30e9c3fd82c0b29691344200en)
	assert.equal(transaction.to!, 0xd9dbe80995dbe64e371464b94d78baf10a694ed0n)
	assert.equal(transaction.v, 0x26n)
	assert.equal(transaction.value, 0n)
}

function testBlock() {
	const rawBlock = {
		"author": "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c",
		"difficulty": "0x78844c551bb64",
		"extraData": "0x5050594520737061726b706f6f6c2d6574682d636e2d687a32",
		"gasLimit": "0x7a1200",
		"gasUsed": "0x79d085",
		"hash": "0xc2d892b79e5dd49ac92b09e4b3fdecad98e64d0abcd73adb9f942ae5fa6b858a",
		"logsBloom": "0x00c0c0420145010000490200301900000092000a45408440028000080008110080080a41000900b0400020014010050042002d008e800810005000320025011a040c00000026081008a41088080004002200146082040018c080400424500060022c000009002802201048502080000184033a08000830820044803405000819140001010101000008e2041404050031203654402130124085804290001048c820c08000225071809085009ec044030020180ca0048518000000082000220000000004028200000000050110221c0c2008000a0140081002000880820c81001e20062000004901008850629404012004102108000001d4000404110902000021",
		"miner": "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c",
		"mixHash": "0x0d9effe3c486645832f8da82b2e96f85ceae55cf8965128040939824e1fbe234",
		"nonce": "0x8a7ec0380d2e65f1",
		"number": "0x7a876d",
		"parentHash": "0xcf512261ac81443eaadfd1b92bbcd73d053f3b4bcc6004fe6da4f148120e8da9",
		"receiptsRoot": "0x13b6265c328b199e3eb30b29a17e0da9d77991630ff7d20d58f201881854e244",
		"sealFields": [
			"0xa00d9effe3c486645832f8da82b2e96f85ceae55cf8965128040939824e1fbe234",
			"0x888a7ec0380d2e65f1"
		],
		"sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
		"size": "0x2e23",
		"stateRoot": "0x0f5c0beb0a2d2e9d5af0c8de1d43642d52933677320d5b490fb13d6bb496f816",
		"timestamp": "0x5d12ac07",
		"totalDifficulty": "0x246e0f10a832a4c2d73",
		"transactions": [
			"0x36752158b33526c07a6dd016153f2c734f71f714363bcc21161806e7ceb18430",
			"0x25a8a35de22e90826f61008f3decb36a3f64b7fae9dd55c6b0461fee541973e4",
			"0xd36c3373bb6323a4be7d1765352dc5d37fbd1f792353b827e3f5f7150bd5f8a9",
			"0x115bcff9e66e7cfc6fb8e3cc21096494d28027f0c628144d9524cc2aadd84fb7",
			"0x0fde07c15405854f0b6633f8706ada2a657c5604a3ba01c08520babc856395c1",
			"0x5e68f4367e22b39123a05339b98e90dad01c2da0a0a1b13685baad76536a15f0",
			"0x7b39a7f229c4197c94109550d0a8fc7cb484c7108bf228bec7ca2368c53a1c47",
			"0xa8067ee8f252dde7f22e32a58fc9334853c766fd8a863bad538a86334e5bbf27",
			"0x34bec87186e3ec3b5870f22526bda2809bcadcdbe9cf50262f50d2b4203b3352",
			"0xba6a03aae8a81f8df1e07ebb11c8127db0d9ebf7b321303948b7d301985a25f5",
			"0x3f81cd4211d72f5053455cdcf22577e8d34c33f90943d7b107beb1808c57b3fd",
			"0x03e7e26a363a294fc847f6bedddde35f82bfbea6f9f8e9b6231d39909631b7d7",
			"0x573833cf054694f0ebf558614cd73b33b7cf19f2e9545163e6e2795db7eef945",
			"0x075530f150fc6e602215930a7b680157eb81bbe7814c6fe8d3eb902d67710e80",
			"0x2fa036810a17bf36c28b501ec26ca5b3f3de9b6226d19eb41b7d39ee005c5976",
			"0x1c9d193301fc78f3fbfaea1c5b4de18ff9ebddb5e38e79ba7a229cc078d72125",
			"0x95453232a721bcb04f5ec757696c3211633502f18f51d5557652425d791e01be",
			"0x8964b0539c0085ed265152235dd511b1dccd96428e7857189e752c731f630be6",
			"0xa157b97d0818c20c7157f79e348154f0a5dc55574aa76b9f397fb7b4768bdaf6",
			"0x9c0dfe66d63611df2fa2226d82f9209b42ff2abcb2cf877b6dcf74c64d671574",
			"0xb6fdc87e79d901c4bf22d2b9aaec3eda6a7cd88938f9aa3f55c0d52b7fdc27b6",
			"0x9ec26eaf211b114bcc6f0ba5151d3f30753023084f27375f0433f0db6466c687",
			"0x6436d803b9170427bc2791f13e761bde5176b24ccd609d78306809303f4c7f9d",
			"0xe5c10153e21d12b5d5d40d48b0b45c7c561550ec65e6857a1580cfbb9417d7d6",
			"0x1cee551ad0c520e4e9f56b2ea5d0670742e3514083bc3d303133ec7d85f3f92e",
			"0x8e7769743db85507a4887ccb2d290efc2dde40aa6f347333602fb8d0e33b4644",
			"0xe84718d938847984f60a2e3f7551f5ed8d82964936130ebf002a9bb59f25f88e",
			"0xd31db75d672da40d9f9f89512e499231e9cc37e9c6cffc29cb8ee5239b9387e6",
			"0x5174a50cabf63cf90c2d29d5ce20a88e23504380f2f99bf541c0c3e9fc000428",
			"0x4fced0509e77dcdf4fea01e22e0155cfd465548de3110e7a1390b5152ae031e9",
			"0x0cecabadbd8d6d796607e503f9b1586a47e56e07c4963ae6902948940ee1f13c",
			"0x298a213a984e9c008a7c1f0cd34dfe08bcd55fd1e69c5254f0bd1972ba7ed44c",
			"0x12ad0e6c39788cc027d88f66daeaa60bbaa3848324ac840ae8c79f068a13163c",
			"0x18d90d9aabad22d16c1a33118a62c9db49f6129fcb3368ab76333f1b3df56ac4",
			"0x17bf1e6b9c04f8133b51b4c2ec9ed86068ebedf8a67a68b654b6bb54f2dbcb81",
			"0x8fd0d5741063fecf0fceb4df29d025bafac2272deb8c8fb6210da845b603a188",
			"0xaf26613cdcfdbd754a2bb516186e3f7177cb18352551074cccb31e5d0691d454",
			"0xb4902531cdbc24b918632977a8e666e3c55bf41418f5ef99426a791932a8ac98",
			"0x712c7bbe5a6ea9cd6eb2517c8cd00ad51122ff0500ece63a85a8f3e179182d13",
			"0xb90915ef37bd6d4a7dc90f222d006975406c35d56d0510865016b2808a0a4bd4",
			"0x551d1d590c558cc0c8f1c730d77921c6f9967552cd6e36818f7e69caf7aa2124",
			"0xfff185d6b2cea7f077f2d860486c4e091ce8cec0f5d494c20c37973ce9c23bea",
			"0x775abea223453e60ea4e4abf5beabd7e4f36618737e2f09bd737620c8b933e30",
			"0x9c18c72dfeb23e91af3a5b872467c850d62e344fc606e82c04e7663248b6a84b",
			"0xb7b159a80fc56005d39d9ece332aea9265f93c132cada747d3b1fec97949922a",
			"0x6423d4297f90733e452efba5b79e3180adb4c37280e1c4a4dbf5de0f9231240b",
			"0xa9d8fcec3b2e95ce113bc3e8d892b8d1c52301dc8d4ea15f363c5683a59b4242",
			"0x21ff06072dbf105ab18bb0f0b9693bd984694bccf810ba5285887a93ea92cd22",
			"0x58399d30d0187df4614244447a7415ff36b3fe45c5b5b713091504ad76f197bf",
			"0x3eb9611449f719b9a7960d84ef4fe3d220398f9dc8bd61ad92b7155c42694793",
			"0xa8b1eeee7ae640b2e58205b7b10cfd12de84ade9a12d64d33037916ccd8dcd3e",
			"0x76aeb275327ac76df10c716ab54207293006f22c50e6f78186878a5e1ce7a699",
			"0xf418bde323b5bc2b523feb3e079799168e424400a5a019b07c244fb8d04228ea",
			"0xeadc8c4fd30e5187ab92a030f58912282b2a91f875d6f37dada260a249455ea3",
			"0xd08bf6c095f6d650abeed64a2a6b8640cc85c714a447f046c6c3050c0fff0385",
			"0xa05b152874f98844fbb190e8aa9921d8fa0bfc4772afaf69e89c7d31c287454d",
			"0xaea7b35ce32c18c995b42d12581333f99bbb2e70503e2fadf987a03347bb6b37",
			"0xa672d5956982090fb4d4947e8a61df742d703ff135e86a90fa2c21bcf0edd8a9",
			"0xce3fa76e086bb91580617c43123767ed8f2af8d595d79e0629ea733031600df4",
			"0x3f7f5c488b207d3661106493027fcdca92cfb6e2e6f9a88a490407503cd7ac98",
			"0xe123930bb6baf208cc4a6c0e5a52e605d4973cc1833680d44d10c3abe49e3514",
			"0x4aaf4cd51330e35f456fe82b72702e5db51c624ee8deea0fd55447f49e8bba4b",
			"0xa1a37a894aa14a7c284fdbda1944e1a68776bd58e77abc2b021427b895fec92b",
			"0x8f7adae2b468cdf5529c27fc75a0108b4d51326fe34d71b4a6a2fbf133448ebe",
			"0xc3fcd9bc864d7cab1b2016883392eda489caeb4dcce54758441e6e57d4f58081",
			"0x2110ce8e6188bd28fcfcbab309176dff75f5cff1a739b9909b06a1a908bc7e5d",
			"0x54f4815366d1f215fa5913b86b30c78edb4fd0d233edeb0fcc3442860fc4a77f",
			"0x27eeff55f00caafbd494095d3314493f95cf7217fab97d0455acef560ca53f80",
			"0x025c12541b28c37bcbb6d354bf26331cc87ae55f7fc4b065568c030fbc398904",
			"0xce9a369c48643caebcd5e5b1f72d478e7937fdf22e2a9ecdb66ff3c608fb1128",
			"0xb784f8db73e99131c17b72c7dcf51e23e0d90f2bde81d983118b0ec879fbb627",
			"0x945f4f71c8d48ccdc17859e53cfeb5b1b17f6def79296b4dcc4e424857bf90b4",
			"0x5c4d30f7fa62950e39ebc94795ddf655aecd1fecb751a6bd2a6d217a586749bc",
			"0x1d50aacac83d0fcfa6b3138aa1af2d2f8f43ff915b6d9f500a30c8c0f2548a89",
			"0xef1591509970829a80fed0aa36fec496fbf8e663e23202e5bb4f8a2d955b2ce8",
			"0xf6735ee6ae2cc6c4c003d75eb04422cd16a3d46c98175bfa3b74b0906e0ae9cc",
			"0xa5980a5a2f0a7ad36995c9f972e7a0e28b28bd856c76bcd361a09f2e21d47a0a",
			"0xd0e4950e6ec31f2dd5134e07edb407e62975f9f98c203923dc0ee483bda9271a",
			"0x71bf7ace2e6cbd35957818b679016f77d5b9ea093259d310fb307d23936d904c",
			"0x2bafaedfa9ecf124fbf5502867d8629bc2035039a011610df080093ef72c9210",
			"0x0262f20da2c025add32d8ceb36cbca8bedd05ca1464f54719e048bdd23bcf4cd",
			"0x5c305b78a5f4d7c6d0418adeb43e830322c20ac610126c0b6505a64903566d3b",
			"0x35e8c1656beb4a849571643f6d5c3456af01402aeaadf8531f572a745275238b",
			"0x028c1e92eaabfae8ad569d956df204d45a8f9c2b0fd18f1d8fbbdaf936cbebae",
			"0x72a7c495e027c277b3d5b308b608c0960764e4def294b990c8ecd2d49beae443",
			"0xa6d7cbd82437e4c384f518310482e8a0d253c0bc177d336bf2e2ba70a93ceab7",
			"0x3c0c98ad8ee279a59a0b93ddadc65848d422ba25516103f045cf74128be1e599",
			"0x0174afcd5924fd321f9f3f28c537bd348b22bc673cbe6d21c4373809ae0e5f6d",
			"0x5f911a7c1513ea2e6de05aff09475eaaf8deecd5bd15be9be06c8d9eaf07f46d",
			"0x073e2764343a061349c690f9546b85916fea14ebd6432542e5ae7b17143ffad7",
			"0xa2dcb7b7f99443555569f304afd024b4dae4a77296f5ca15f9541c90098647d1",
			"0x5736964d7d81db7d0f3042623132aad34a1bb587e951901c595b74faeb59686d"
		],
		"transactionsRoot": "0x0e999f06814a61a5d23f99adeee92911f782b551580a08bb5c8d6fc3519573d4",
		"uncles": []
	}
	const block = new Block(rawBlock)
	assert.equal(block.author, 0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4cn)
	assert.equal(block.difficulty, 0x78844c551bb64n)
	assert.equalBytes(block.extraData, '5050594520737061726b706f6f6c2d6574682d636e2d687a32')
	assert.equal(block.gasLimit, 0x7a1200n)
	assert.equal(block.gasUsed, 0x79d085n)
	assert.equal(block.hash!, 0xc2d892b79e5dd49ac92b09e4b3fdecad98e64d0abcd73adb9f942ae5fa6b858an)
	assert.isNotNull(block.logsBloom)
	assert.equal(block.logsBloom!, 0x00c0c0420145010000490200301900000092000a45408440028000080008110080080a41000900b0400020014010050042002d008e800810005000320025011a040c00000026081008a41088080004002200146082040018c080400424500060022c000009002802201048502080000184033a08000830820044803405000819140001010101000008e2041404050031203654402130124085804290001048c820c08000225071809085009ec044030020180ca0048518000000082000220000000004028200000000050110221c0c2008000a0140081002000880820c81001e20062000004901008850629404012004102108000001d4000404110902000021n)
	assert.equal(block.miner, 0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4cn)
	assert.equal(block.nonce, 0x8a7ec0380d2e65f1n)
	assert.equal(block.number, 0x7a876dn)
	assert.equal(block.parentHash, 0xcf512261ac81443eaadfd1b92bbcd73d053f3b4bcc6004fe6da4f148120e8da9n)
	assert.equal(block.receiptsRoot, 0x13b6265c328b199e3eb30b29a17e0da9d77991630ff7d20d58f201881854e244n)
	assert.equal(block.sha3Uncles, 0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347n)
	assert.equal(block.size, 0x2e23n)
	assert.equal(block.stateRoot, 0x0f5c0beb0a2d2e9d5af0c8de1d43642d52933677320d5b490fb13d6bb496f816n)
	assert.equalTime(block.timestamp, new Date(0x5d12ac07 * 1000))
	assert.equal(block.totalDifficulty, 0x246e0f10a832a4c2d73n)
	assert.equal(block.transactions.length, 92)
	assert.equal(block.transactions[0] as bigint, 0x36752158b33526c07a6dd016153f2c734f71f714363bcc21161806e7ceb18430n)
	assert.equal(block.transactionsRoot, 0x0e999f06814a61a5d23f99adeee92911f782b551580a08bb5c8d6fc3519573d4n)
	assert.equal(block.uncles.length, 0)
}

function testWireEncoding() {
	assert.equal(wireEncodeByteArray([0xab, 0xcd]), '0xabcd')
	assert.equal(wireEncodeByteArray(new Uint8Array([0xab, 0xcd])), '0xabcd')
	assert.equal(wireEncodeByteArray(Bytes.fromHexString('abcd')), '0xabcd')
	assert.equal(wireEncodeNumber(0), '0x0')
	assert.equal(wireEncodeNumber(1), '0x1')
	assert.equal(wireEncodeNumber(0n), '0x0')
	assert.equal(wireEncodeNumber(1n), '0x1')
	assert.equal(wireEncodeNumber(255), '0xff')
	assert.equal(wireEncodeNumber(255n), '0xff')
	assert.equal(wireEncodeNumber(256), '0x100')
	assert.equal(wireEncodeNumber(256n), '0x100')
	assert.equal(wireEncodeNumber(2**52), '0x10000000000000')
	assert.equal(wireEncodeNumber(2n**256n-1n), '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
	assert.throws(() => wireEncodeNumber(-1), 'Wire encoded values must be positive.  Received: -1')
	assert.throws(() => wireEncodeNumber(-1n), 'Wire encoded values must be positive.  Received: -1')
	assert.throws(() => wireEncodeNumber(2**53), 'Wire encoded number values cannot be bigger than 4503599627370496.  Received: 9007199254740992')
	assert.throws(() => wireEncodeNumber(2n**256n), 'Wire encoded bigint values must be smaller than 115792089237316195423570985008687907853269984665640564039457584007913129639936.  Received: 115792089237316195423570985008687907853269984665640564039457584007913129639936')
	assert.equal(wireEncodeBlockTag('latest'), 'latest')
	assert.equal(wireEncodeBlockTag(0xabcdn), '0xabcd')
	assert.deepEqual(wireEncodeOffChainTransaction({
		from: 0xdeadbabedeadbabedeadbabedeadbabedeadbaben,
		to: 0xcafebeefcafebeefcafebeefcafebeefcafebeefn,
		data: new Bytes(),
		value: 0n,
		gasLimit: 100_000n,
		gasPrice: 2_001_000_000n,
	}), {
		from: '0xdeadbabedeadbabedeadbabedeadbabedeadbabe',
		to: '0xcafebeefcafebeefcafebeefcafebeefcafebeef',
		data: '0x',
		value: '0x0',
		gas: '0x186a0',
		gasPrice: '0x7744d640',
	})
	assert.deepEqual(wireEncodeOnChainTransaction({
		from: 0xdeadbabedeadbabedeadbabedeadbabedeadbaben,
		to: 0xcafebeefcafebeefcafebeefcafebeefcafebeefn,
		data: new Bytes(),
		value: 0n,
		gasLimit: 100_000n,
		gasPrice: 2_001_000_000n,
		nonce: 5n,
	}), {
		from: '0xdeadbabedeadbabedeadbabedeadbabedeadbabe',
		to: '0xcafebeefcafebeefcafebeefcafebeefcafebeef',
		data: '0x',
		value: '0x0',
		gas: '0x186a0',
		gasPrice: '0x7744d640',
		nonce: '0x5',
	})
}

function testValidation() {
	assert.doesNotThrow(() => validateJsonRpcResponse({
		"jsonrpc": "2.0",
		"result": {},
		"id": 1,
	}))
	assert.doesNotThrow(() => validateJsonRpcResponse({
		"jsonrpc": "2.0",
		"error": {
			code: 5,
			message: 'hello',
		},
		"id": 1,
	}))
	assert.throws(() => validateJsonRpcResponse({
		"jsonrpc": "2.0",
		"result": {},
		"error": {
			code: 5,
			message: 'hello',
		},
		"id": 1,
	}), /Expected JSON-RPC response, received something else\..*/)
}

try {
	testBytes()
	testTransactionReceipt()
	testTransaction()
	testBlock()
	testWireEncoding()
	testValidation()

	console.log(`\x1b[32mTests passed.\x1b[0m`)
} catch (error) {
	console.error(error)
	console.log(`\x1b[31mOne or more tests failed.\x1b[0m`)
}
