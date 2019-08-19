abstract class ByteArray extends Uint8Array {
	public static size: number | null

	public static fromByteArray<TConstructor extends typeof ByteArray & { new(): InstanceType<TConstructor> }>(this: TConstructor, bytes: BytesLike, pad: 'left' | 'right' = 'right'): InstanceType<TConstructor> {
		const result = (this.size) ? new this() : new this(bytes.length)
		if (bytes.length > result.length) throw new Error(`Source bytes are longer (${bytes.length}) than destination bytes (${result.length})\n${bytes}`)
		for (let i = 0; i < bytes.length; ++i) {
			const byte = bytes[i]
			if (byte > 0xff || byte < 0) throw new Error(`Source array must only include numbers between 0 and ${0xff}.\n${bytes}`)
		}
		result.set(bytes, (pad === 'left') ? result.length - bytes.length : 0)
		return result as InstanceType<TConstructor>
	}

	public static fromHexString<TConstructor extends typeof ByteArray & { new(): InstanceType<TConstructor> }>(this: TConstructor, hex: string, pad?: 'left' | 'right'): InstanceType<TConstructor> {
		const match = /^(?:0x)?([a-fA-F0-9]*)$/.exec(hex)
		if (match === null) throw new Error(`Expected a hex string encoded byte array with an optional '0x' prefix but received ${hex}`)
		const normalized = match[1]
		if (normalized.length % 2) throw new Error(`Hex string encoded byte array must be an even number of charcaters long.`)
		const bytes = []
		for (let i = 0; i < normalized.length; i += 2) {
			bytes.push(Number.parseInt(`${normalized[i]}${normalized[i + 1]}`, 16))
		}
		return this.fromByteArray(bytes, pad)
	}

	public static fromStringLiteral<TConstructor extends typeof ByteArray & { new(): InstanceType<TConstructor> }>(this: TConstructor, literal: string): InstanceType<TConstructor> {
		const encoded = new TextEncoder().encode(literal)
		return this.fromByteArray(encoded)
	}

	public static fromUnsignedInteger<TConstructor extends typeof ByteArray & { new(): InstanceType<TConstructor> }>(this: TConstructor, value: bigint | number, numberOfBits?: number): InstanceType<TConstructor> {
		if (numberOfBits === undefined && this.size === null) throw new Error(`Must supply numberOfBits when initializing a variable sized ByteArray.`)
		if (numberOfBits !== undefined && this.size !== null) throw new Error(`Must not supply numberOfBits when initializing a fixed size ByteArray.`)
		numberOfBits = numberOfBits || (this.size! * 8)
		if (numberOfBits % 8) throw new Error(`numberOfBits must be a multiple of 8.`)
		if (typeof value === 'number') value = BigInt(value)
		if (value >= 2n ** BigInt(numberOfBits) || value < 0n) throw new Error(`Cannot fit ${value} into a ${numberOfBits}-bit unsigned integer.`)
		const numberOfBytes = numberOfBits / 8
		const result = new this(numberOfBytes)
		if (result.length !== numberOfBytes) throw new Error(`Cannot a ${numberOfBits} value into a ${result.length} byte array.`)
		for (let i = 0; i < result.length; ++i) {
			result[i] = Number((value >> BigInt(numberOfBits - i * 8 - 8)) & 0xffn)
		}
		return result as InstanceType<TConstructor>
	}

	public static fromSignedInteger<TConstructor extends typeof ByteArray & { new(): InstanceType<TConstructor> }>(this: TConstructor, value: bigint | number, numberOfBits?: number): InstanceType<TConstructor> {
		if (numberOfBits === undefined && this.size === null) throw new Error(`Must supply numberOfBits when initializing a variable sized ByteArray.`)
		if (numberOfBits !== undefined && this.size !== null) throw new Error(`Must not supply numberOfBits when initializing a fixed size ByteArray.`)
		const numBits = numberOfBits || (this.size! * 8)
		if (typeof value === 'number') value = BigInt(value)
		if (value >= 2n ** BigInt(numBits - 1) || value < -(2n ** BigInt(numBits - 1))) throw new Error(`Cannot fit ${value} into a ${numBits}-bit signed integer.`)
		const unsignedValue = this.twosComplement(value, numBits)
		return this.fromUnsignedInteger(unsignedValue, numberOfBits)
	}

	public readonly toString = () => this.reduce((result: string, byte: number) => result + ('0' + byte.toString(16)).slice(-2), '')

	public readonly to0xString = () => wireEncodeByteArray(this)

	public readonly toUnsignedBigint = () => {
		let value = 0n
		for (let byte of this) {
			value = (value << 8n) + BigInt(byte)
		}
		return value
	}

	public readonly toSignedBigint = () => {
		const unsignedValue = this.toUnsignedBigint()
		return ByteArray.twosComplement(unsignedValue, this.length * 8)
	}

	public readonly equals = (other: { length: number, [i: number]: number } | undefined | null): boolean => {
		if (other === undefined || other === null) return false
		if (this.length !== other.length) return false
		for (let i = 0; i < this.length; ++i) {
			if (this[i] !== other[i]) return false
		}
		return true
	}

	// this is important TypeScript magic whose provenance and purpose has been lost to time
	public static get [Symbol.species]() { return Uint8Array }

	private static twosComplement(value: bigint, numberOfBits: number): bigint {
		const mask = 2n ** (BigInt(numberOfBits) - 1n) - 1n
		return (value & mask) - (value & ~mask)
	}
}
export class Bytes extends ByteArray { Bytes: unknown; static size = null }
export class Bytes256 extends ByteArray { constructor() { super(256) }; static size = 256; Bytes256: unknown }
export class Bytes32 extends ByteArray { constructor() { super(32) }; static size = 32; Bytes32: unknown }
export class Bytes31 extends ByteArray { constructor() { super(31) }; static size = 31; Bytes31: unknown }
export class Bytes30 extends ByteArray { constructor() { super(30) }; static size = 30; Bytes30: unknown }
export class Bytes29 extends ByteArray { constructor() { super(29) }; static size = 29; Bytes29: unknown }
export class Bytes28 extends ByteArray { constructor() { super(28) }; static size = 28; Bytes28: unknown }
export class Bytes27 extends ByteArray { constructor() { super(27) }; static size = 27; Bytes27: unknown }
export class Bytes26 extends ByteArray { constructor() { super(26) }; static size = 26; Bytes26: unknown }
export class Bytes25 extends ByteArray { constructor() { super(25) }; static size = 25; Bytes25: unknown }
export class Bytes24 extends ByteArray { constructor() { super(24) }; static size = 24; Bytes24: unknown }
export class Bytes23 extends ByteArray { constructor() { super(23) }; static size = 23; Bytes23: unknown }
export class Bytes22 extends ByteArray { constructor() { super(22) }; static size = 22; Bytes22: unknown }
export class Bytes21 extends ByteArray { constructor() { super(21) }; static size = 21; Bytes21: unknown }
export class Bytes20 extends ByteArray { constructor() { super(20) }; static size = 20; Bytes20: unknown }
export class Bytes19 extends ByteArray { constructor() { super(19) }; static size = 19; Bytes19: unknown }
export class Bytes18 extends ByteArray { constructor() { super(18) }; static size = 18; Bytes18: unknown }
export class Bytes17 extends ByteArray { constructor() { super(17) }; static size = 17; Bytes17: unknown }
export class Bytes16 extends ByteArray { constructor() { super(16) }; static size = 16; Bytes16: unknown }
export class Bytes15 extends ByteArray { constructor() { super(15) }; static size = 15; Bytes15: unknown }
export class Bytes14 extends ByteArray { constructor() { super(14) }; static size = 14; Bytes14: unknown }
export class Bytes13 extends ByteArray { constructor() { super(13) }; static size = 13; Bytes13: unknown }
export class Bytes12 extends ByteArray { constructor() { super(12) }; static size = 12; Bytes12: unknown }
export class Bytes11 extends ByteArray { constructor() { super(11) }; static size = 11; Bytes11: unknown }
export class Bytes10 extends ByteArray { constructor() { super(10) }; static size = 10; Bytes10: unknown }
export class Bytes9 extends ByteArray { constructor() { super(9) }; static size = 9; Bytes9: unknown }
export class Bytes8 extends ByteArray { constructor() { super(8) }; static size = 8; Bytes8: unknown }
export class Bytes7 extends ByteArray { constructor() { super(7) }; static size = 7; Bytes7: unknown }
export class Bytes6 extends ByteArray { constructor() { super(6) }; static size = 6; Bytes6: unknown }
export class Bytes5 extends ByteArray { constructor() { super(5) }; static size = 5; Bytes5: unknown }
export class Bytes4 extends ByteArray { constructor() { super(4) }; static size = 4; Bytes4: unknown }
export class Bytes3 extends ByteArray { constructor() { super(3) }; static size = 3; Bytes3: unknown }
export class Bytes2 extends ByteArray { constructor() { super(2) }; static size = 2; Bytes2: unknown }
export class Bytes1 extends ByteArray { constructor() { super(1) }; static size = 1; Bytes1: unknown }
export class Address extends ByteArray { constructor() { super(20) }; static size = 20; Address: unknown }
export class MethodSignatureHash extends ByteArray { constructor() { super(4) }; static size = 4; SignatureHash: unknown }
export class Signature extends ByteArray { constructor() { super(65) }; static size = 65; Signature: unknown }
export interface Bytes32 { readonly length: 32 }
export interface Bytes31 { readonly length: 31 }
export interface Bytes30 { readonly length: 30 }
export interface Bytes29 { readonly length: 29 }
export interface Bytes28 { readonly length: 28 }
export interface Bytes27 { readonly length: 27 }
export interface Bytes26 { readonly length: 26 }
export interface Bytes25 { readonly length: 25 }
export interface Bytes24 { readonly length: 24 }
export interface Bytes23 { readonly length: 23 }
export interface Bytes22 { readonly length: 22 }
export interface Bytes21 { readonly length: 21 }
export interface Bytes20 { readonly length: 20 }
export interface Bytes19 { readonly length: 19 }
export interface Bytes18 { readonly length: 18 }
export interface Bytes17 { readonly length: 17 }
export interface Bytes16 { readonly length: 16 }
export interface Bytes15 { readonly length: 15 }
export interface Bytes14 { readonly length: 14 }
export interface Bytes13 { readonly length: 13 }
export interface Bytes12 { readonly length: 12 }
export interface Bytes11 { readonly length: 11 }
export interface Bytes10 { readonly length: 10 }
export interface Bytes9 { readonly length: 9 }
export interface Bytes8 { readonly length: 8 }
export interface Bytes7 { readonly length: 7 }
export interface Bytes6 { readonly length: 6 }
export interface Bytes5 { readonly length: 5 }
export interface Bytes4 { readonly length: 4 }
export interface Bytes3 { readonly length: 3 }
export interface Bytes2 { readonly length: 2 }
export interface Bytes1 { readonly length: 1 }
export interface Address { readonly length: 20 }
export interface MethodSignatureHash { readonly length: 4 }
export interface Signature { readonly length: 65 }
export type BytesLike = ArrayLike<number>
export type Bytes256Like = BytesLike & { length: 256 }
export type Bytes32Like = BytesLike & { length: 32 }
export type Bytes31Like = BytesLike & { length: 31 }
export type Bytes30Like = BytesLike & { length: 30 }
export type Bytes29Like = BytesLike & { length: 29 }
export type Bytes28Like = BytesLike & { length: 28 }
export type Bytes27Like = BytesLike & { length: 27 }
export type Bytes26Like = BytesLike & { length: 26 }
export type Bytes25Like = BytesLike & { length: 25 }
export type Bytes24Like = BytesLike & { length: 24 }
export type Bytes23Like = BytesLike & { length: 23 }
export type Bytes22Like = BytesLike & { length: 22 }
export type Bytes21Like = BytesLike & { length: 21 }
export type Bytes20Like = BytesLike & { length: 20 }
export type Bytes19Like = BytesLike & { length: 19 }
export type Bytes18Like = BytesLike & { length: 18 }
export type Bytes17Like = BytesLike & { length: 17 }
export type Bytes16Like = BytesLike & { length: 16 }
export type Bytes15Like = BytesLike & { length: 15 }
export type Bytes14Like = BytesLike & { length: 14 }
export type Bytes13Like = BytesLike & { length: 13 }
export type Bytes12Like = BytesLike & { length: 12 }
export type Bytes11Like = BytesLike & { length: 11 }
export type Bytes10Like = BytesLike & { length: 10 }
export type Bytes9Like = BytesLike & { length: 9 }
export type Bytes8Like = BytesLike & { length: 8 }
export type Bytes7Like = BytesLike & { length: 7 }
export type Bytes6Like = BytesLike & { length: 6 }
export type Bytes5Like = BytesLike & { length: 5 }
export type Bytes4Like = BytesLike & { length: 4 }
export type Bytes3Like = BytesLike & { length: 3 }
export type Bytes2Like = BytesLike & { length: 2 }
export type Bytes1Like = BytesLike & { length: 1 }
export type AddressLike = BytesLike & { length: 20 }
export type SignatureHashLike = BytesLike & { length: 4 }

export type Encodable = EncodablePrimitive | EncodableTuple | EncodableArray
export type EncodablePrimitive = BytesLike | string | boolean | bigint
export interface EncodableTuple { [x: string]: Encodable }
export interface EncodableArray extends ArrayLike<Encodable> { }
export type FixedBytesLike = Bytes32Like | Bytes31Like | Bytes30Like | Bytes29Like | Bytes28Like | Bytes27Like | Bytes26Like | Bytes25Like | Bytes24Like | Bytes23Like | Bytes22Like | Bytes21Like | Bytes20Like | Bytes19Like | Bytes18Like | Bytes17Like | Bytes16Like | Bytes15Like | Bytes14Like | Bytes13Like | Bytes12Like | Bytes11Like | Bytes10Like | Bytes9Like | Bytes8Like | Bytes7Like | Bytes6Like | Bytes5Like | Bytes4Like | Bytes3Like | Bytes2Like | Bytes1Like

export type RawHash = string
export type RawQuantity = string
export type RawBlockTag = string
export type RawAddress = string
export type RawData = string

export interface RawLog {
	blockHash: RawHash
	blockNumber: RawQuantity
	transactionHash: RawHash
	transactionIndex: RawQuantity
	logIndex: RawQuantity
	address: RawAddress
	topics: Array<RawHash>
	data: RawData
}

export interface RawTransactionReceipt {
	blockHash: RawHash
	blockNumber: RawQuantity
	transactionHash: RawHash
	transactionIndex: RawQuantity
	from: RawAddress
	to: RawAddress | null
	contractAddress: RawAddress | null
	cumulativeGasUsed: RawQuantity
	gasUsed: RawQuantity
	logs: Array<RawLog>
	logsBloom: RawData
	status: RawQuantity
}

export interface RawTransaction {
	blockHash: RawHash | null
	blockNumber: RawQuantity | null
	hash: RawHash
	transactionIndex: RawQuantity | null
	from: RawAddress
	to: RawAddress | null
	value: RawQuantity
	input: RawData
	nonce: RawQuantity
	gas: RawQuantity
	gasPrice: RawQuantity
	v: RawQuantity
	r: RawData
	s: RawData
}

export interface RawBlock {
	hash: RawHash | null
	number: RawQuantity | null
	nonce: RawData | null
	logsBloom: RawData | null
	parentHash: RawHash
	sha3Uncles: RawHash
	transactionsRoot: RawData
	stateRoot: RawData
	receiptsRoot: RawData
	author: RawAddress
	miner: RawAddress
	difficulty: RawQuantity
	totalDifficulty: RawQuantity
	extraData: RawData
	size: RawQuantity
	gasLimit: RawQuantity
	gasUsed: RawQuantity
	timestamp: RawQuantity
	transactions: Array<RawTransaction | RawHash>
	uncles: Array<RawHash>
}

export interface RawTypedData {
	types: {
		EIP712Domain: Array<{ name: string, type: string }>
		[type: string]: Array<{ name: string, type: string }>
	}
	primaryType: string
	domain: unknown
	message: unknown
}

export interface RawOffChainTransaction {
	from: RawAddress
	to: RawAddress | null
	value: RawQuantity
	data: RawData
	gas: RawQuantity | null
	gasPrice: RawQuantity
}

export interface RawOnChainTransaction extends RawOffChainTransaction {
	nonce: RawQuantity
}

export interface ILog<TBytes32, TAddress, TBytes> {
	blockHash: TBytes32
	blockNumber: number
	transactionHash: TBytes32
	transactionIndex: number
	logIndex: number
	address: TAddress
	topics: Array<TBytes32>
	data: TBytes
}

export class Log implements ILog<Bytes32, Address, Bytes> {
	public readonly blockHash: Bytes32
	public readonly blockNumber: number
	public readonly transactionHash: Bytes32
	public readonly transactionIndex: number
	public readonly logIndex: number
	public readonly address: Address
	public readonly topics: Array<Bytes32>
	public readonly data: Bytes
	public constructor(raw: RawLog) {
		this.blockHash = Bytes32.fromHexString(raw.blockHash)
		this.blockNumber = Number.parseInt(raw.blockNumber, 16)
		this.transactionHash = Bytes32.fromHexString(raw.transactionHash)
		this.transactionIndex = Number.parseInt(raw.transactionIndex, 16)
		this.logIndex = Number.parseInt(raw.logIndex, 16)
		this.address = Address.fromHexString(raw.address)
		this.topics = raw.topics.map(x => Bytes32.fromHexString(x))
		this.data = Bytes.fromHexString(raw.data)
	}
}

export interface ITransactionReceipt<TBytes32, TAddress, TLog, TBytes256> {
	blockHash: TBytes32
	blockNumber: number
	hash: TBytes32
	index: number
	from: TAddress
	to: TAddress | null
	contractAddress: TAddress | null
	cumulativeGasUsed: number
	gasUsed: number
	logs: Array<TLog>
	logsBloom: TBytes256
	status: boolean
}

export class TransactionReceipt implements ITransactionReceipt<Bytes32, Address, Log, Bytes256> {
	public readonly blockHash: Bytes32
	public readonly blockNumber: number
	public readonly hash: Bytes32
	public readonly index: number
	public readonly from: Address
	public readonly to: Address | null
	public readonly contractAddress: Address | null
	public readonly cumulativeGasUsed: number
	public readonly gasUsed: number
	public readonly logs: Array<Log>
	public readonly logsBloom: Bytes256
	public readonly status: boolean
	public constructor(raw: RawTransactionReceipt) {
		this.blockHash = Bytes32.fromHexString(raw.blockHash)
		this.blockNumber = Number.parseInt(raw.blockNumber, 16)
		this.hash = Bytes32.fromHexString(raw.transactionHash)
		this.index = Number.parseInt(raw.transactionIndex, 16)
		this.from = Address.fromHexString(raw.from)
		this.to = (raw.to) ? Address.fromHexString(raw.to!) : null
		this.contractAddress = (raw.contractAddress) ? Address.fromHexString(raw.contractAddress) : null
		this.cumulativeGasUsed = Number.parseInt(raw.cumulativeGasUsed, 16)
		this.gasUsed = Number.parseInt(raw.gasUsed, 16)
		this.logs = raw.logs.map(x => new Log(x))
		this.logsBloom = Bytes256.fromHexString(raw.logsBloom)
		this.status = !!Number.parseInt(raw.status, 16)
	}
}

export interface ITransaction<TBytes32, TAddress, TBytes, TBytes1> {
	blockHash: TBytes32 | null
	blockNumber: number | null
	hash: TBytes32
	index: number | null
	from: TAddress
	to: TAddress | null
	value: bigint
	data: TBytes
	nonce: number
	gas: number
	gasPrice: bigint
	v: TBytes1
	r: TBytes32
	s: TBytes32
}

export class Transaction implements ITransaction<Bytes32, Address, Bytes, Bytes1> {
	public readonly blockHash: Bytes32 | null
	public readonly blockNumber: number | null
	public readonly hash: Bytes32
	public readonly index: number | null
	public readonly from: Address
	public readonly to: Address | null
	public readonly value: bigint
	public readonly data: Bytes
	public readonly nonce: number
	public readonly gas: number
	public readonly gasPrice: bigint
	public readonly v: Bytes1
	public readonly r: Bytes32
	public readonly s: Bytes32
	public constructor(raw: RawTransaction) {
		this.blockHash = (raw.blockHash !== null) ? Bytes32.fromHexString(raw.blockHash) : null
		this.blockNumber = (raw.blockNumber !== null) ? Number.parseInt(raw.blockNumber, 16) : null
		this.hash = Bytes32.fromHexString(raw.hash)
		this.index = (raw.transactionIndex !== null) ? Number.parseInt(raw.transactionIndex, 16) : null
		this.from = Address.fromHexString(raw.from)
		this.to = (raw.to !== null) ? Address.fromHexString(raw.to) : null
		this.value = BigInt(raw.value)
		this.data = Bytes.fromHexString(raw.input)
		this.nonce = Number.parseInt(raw.nonce)
		this.gas = Number.parseInt(raw.gas, 16)
		this.gasPrice = BigInt(raw.gasPrice)
		this.v = Bytes1.fromUnsignedInteger(BigInt(raw.v))
		this.r = Bytes32.fromHexString(raw.r)
		this.s = Bytes32.fromHexString(raw.s)
	}
}

export interface IBlock<TBytes, TBytes32, TBytes256, TAddress, TTransaction> {
	hash: TBytes32 | null
	number: number | null
	nonce: bigint | null
	logsBloom: TBytes256 | null
	parentHash: TBytes32
	sha3Uncles: TBytes32
	transactionsRoot: TBytes32
	stateRoot: TBytes32
	receiptsRoot: TBytes32
	author: TAddress
	miner: TAddress
	difficulty: bigint
	totalDifficulty: bigint
	extraData: TBytes
	size: number
	gasLimit: number
	gasUsed: number
	timestamp: Date
	transactions: Array<TTransaction | TBytes32>
	uncles: Array<TBytes32>
}

export class Block implements IBlock<Bytes, Bytes32, Bytes256, Address, Transaction> {
	public readonly hash: Bytes32 | null
	public readonly number: number | null
	public readonly nonce: bigint | null
	public readonly logsBloom: Bytes256 | null
	public readonly parentHash: Bytes32
	public readonly sha3Uncles: Bytes32
	public readonly transactionsRoot: Bytes32
	public readonly stateRoot: Bytes32
	public readonly receiptsRoot: Bytes32
	public readonly author: Address
	public readonly miner: Address
	public readonly difficulty: bigint
	public readonly totalDifficulty: bigint
	public readonly extraData: Bytes
	public readonly size: number
	public readonly gasLimit: number
	public readonly gasUsed: number
	public readonly timestamp: Date
	public readonly transactions: Array<Transaction | Bytes32>
	public readonly uncles: Array<Bytes32>
	public constructor(raw: RawBlock) {
		this.hash = (raw.hash !== null) ? Bytes32.fromHexString(raw.hash) : null
		this.number = (raw.number !== null) ? Number.parseInt(raw.number, 16) : null
		this.nonce = (raw.nonce !== null) ? BigInt(raw.nonce) : null
		this.logsBloom = (raw.logsBloom !== null) ? Bytes256.fromHexString(raw.logsBloom) : null
		this.parentHash = Bytes32.fromHexString(raw.parentHash)
		this.sha3Uncles = Bytes32.fromHexString(raw.sha3Uncles)
		this.transactionsRoot = Bytes32.fromHexString(raw.transactionsRoot)
		this.stateRoot = Bytes32.fromHexString(raw.stateRoot)
		this.receiptsRoot = Bytes32.fromHexString(raw.receiptsRoot)
		this.author = Address.fromHexString(raw.author)
		this.miner = Address.fromHexString(raw.miner)
		this.difficulty = BigInt(raw.difficulty)
		this.totalDifficulty = BigInt(raw.totalDifficulty)
		this.extraData = Bytes.fromHexString(raw.extraData)
		this.size = Number.parseInt(raw.size, 16)
		this.gasLimit = Number.parseInt(raw.gasLimit, 16)
		this.gasUsed = Number.parseInt(raw.gasUsed, 16)
		this.timestamp = new Date(Number.parseInt(raw.timestamp, 16) * 1000)
		this.transactions = raw.transactions.map(x => (typeof x === 'string') ? Bytes32.fromHexString(x) : new Transaction(x))
		this.uncles = raw.uncles.map(x => Bytes32.fromHexString(x))
	}
}

export interface ISignature<TBytes32, TBytes1> {
	v: TBytes1
	r: TBytes32
	s: TBytes32
}

export interface IOffChainTransaction<TAddress, TBytes> {
	from: TAddress
	to: TAddress | null
	value: bigint
	data: TBytes
	gasLimit: number | null
	gasPrice: bigint
}

export interface IOnChainTransaction<TAddress, TBytes> extends IOffChainTransaction<TAddress, TBytes> {
	gasLimit: number
	nonce: number
}

export interface IUnsignedTransaction<TAddress, TBytes> extends IOnChainTransaction<TAddress, TBytes> {
	chainId: number
}

export interface ISignedTransaction<TAddress, TBytes, TBytes32, TBytes1> extends IUnsignedTransaction<TAddress, TBytes>, ISignature<TBytes32, TBytes1> {
}

export function wireEncodeByteArray(bytes: BytesLike): string {
	let result = ''
	for (let i = 0; i < bytes.length; ++i) {
		result += ('0' + bytes[i].toString(16)).slice(-2)
	}
	return `0x${result}`
}

export function wireEncodeOffChainTransaction(transaction: IOffChainTransaction<AddressLike, BytesLike>): RawOffChainTransaction {
	return {
		from: wireEncodeByteArray(transaction.from),
		to: transaction.to ? wireEncodeByteArray(transaction.to) : null,
		value: wireEncodeNumber(transaction.value),
		data: wireEncodeByteArray(transaction.data),
		gas: transaction.gasLimit ? wireEncodeNumber(transaction.gasLimit) : null,
		gasPrice: wireEncodeNumber(transaction.gasPrice),
	}
}

export function wireEncodeOnChainTransaction(transaction: IOnChainTransaction<AddressLike, BytesLike>): RawOnChainTransaction {
	return Object.assign(wireEncodeOffChainTransaction(transaction), {
		nonce: wireEncodeNumber(transaction.nonce)
	})
}

export function offChainToUnsignedTransaction<TAddress, TBytes>(transaction: IOffChainTransaction<TAddress, TBytes>, gasLimit: number, nonce: number, chainId: number): IUnsignedTransaction<TAddress, TBytes> {
	return {
		from: transaction.from,
		to: transaction.to,
		gasPrice: transaction.gasPrice,
		value: transaction.value,
		data: transaction.data,
		gasLimit: gasLimit,
		nonce: nonce,
		chainId: chainId,
	}
}

export function unsignedToSignedTransaction<TAddress, TBytes, TBytes32, TBytes1>(transaction: IUnsignedTransaction<TAddress, TBytes>, v: TBytes1, r: TBytes32, s: TBytes32): ISignedTransaction<TAddress, TBytes, TBytes32, TBytes1> {
	return {
		from: transaction.from,
		to: transaction.to,
		gasPrice: transaction.gasPrice,
		value: transaction.value,
		data: transaction.data,
		gasLimit: transaction.gasLimit,
		nonce: transaction.nonce,
		chainId: transaction.chainId,
		v: v,
		r: r,
		s: s,
	}
}

export type JsonRpcMethod = 'eth_accounts' | 'eth_blockNumber' | 'eth_call' | 'eth_chainId' | 'eth_coinbase' | 'eth_estimateGas' | 'eth_gasPrice' | 'eth_getBalance' | 'eth_getBlockByHash' | 'eth_getBlockByNumber' | 'eth_getBlockTransactionCountByHash' | 'eth_getBlockTransactionCountByNumber' | 'eth_getCode' | 'eth_getLogs' | 'eth_getStorageAt' | 'eth_getTransactionByBlockHashAndIndex' | 'eth_getTransactionByBlockNumberAndIndex' | 'eth_getTransactionByHash' | 'eth_getTransactionCount' | 'eth_getTransactionReceipt' | 'eth_getUncleByBlockHashAndIndex' | 'eth_getUncleByBlockNumberAndIndex' | 'eth_getUncleCountByBlockHash' | 'eth_getUncleCountByBlockNumber' | 'eth_protocolVersion' | 'eth_sendRawTransaction' | 'eth_sendTransaction' | 'eth_sign' | 'eth_signTransaction' | 'eth_signTypedData' | 'eth_syncing'
export interface IJsonRpcRequest<TMethod extends JsonRpcMethod, TParams extends Array<unknown>> {
	jsonrpc: '2.0'
	id: string | number | null
	method: TMethod
	params?: TParams
}
export interface IJsonRpcSuccess<TResult> {
	jsonrpc: '2.0'
	id: string | number | null
	result: TResult
}
export interface IJsonRpcError {
	jsonrpc: '2.0'
	id: string | number | null
	error: {
		code: number
		message: string
		data?: unknown
	}
}
export type IJsonRpcResponse<T> = IJsonRpcSuccess<T> | IJsonRpcError
export function validateJsonRpcResponse<T>(response: any): response is IJsonRpcResponse<T> {
	if (response.jsonrpc !== '2.0'
		|| (typeof response.id !== 'string' && typeof response.id !== 'number' && response.id !== null)
		|| (response.result && response.error)
		|| (!response.result && !response.error)
		|| (response.error && typeof response.error.code !== 'number')
		|| (response.error && typeof response.error.message !== 'string'))
		throw new Error(`Expected JSON-RPC response, received something else.\n${JSON.stringify(response)}`)
	return true
}
export function isJsonRpcSuccess<T>(response: IJsonRpcResponse<T>): response is IJsonRpcSuccess<T> {
	return !!(response as IJsonRpcSuccess<T>).result && !(response as IJsonRpcError).error
}
export function isJsonRpcError<T>(response: IJsonRpcResponse<T>): response is IJsonRpcError {
	return !!(response as IJsonRpcError).error && !(response as IJsonRpcSuccess<T>).result
}

export function wireEncodeNumber(value: number | bigint): RawQuantity {
	if (value < 0) throw new Error(`Wire encoded values must be positive.  Received: ${value}`)
	if (typeof value === 'number' && value > 2**52) throw new Error(`Wire encoded number values cannot be bigger than ${2**52}.  Received: ${value}`)
	if (typeof value === 'bigint' && value >= 2**256) throw new Error(`Wire encoded bigint values must be smaller than ${2n**256n}.  Received: ${value}`)
	return `0x${value.toString(16)}`
}
export type BlockTag = 'latest' | 'earliest' | 'pending' | number
export function wireEncodeBlockTag(tag: BlockTag): RawBlockTag { return (typeof tag === 'string') ? tag : wireEncodeNumber(tag) }

export namespace Rpc {
	export namespace Eth {
		export namespace Accounts {
			export interface RawRequest extends IJsonRpcRequest<'eth_accounts', []> { }
			export interface RawResponse extends IJsonRpcSuccess<Array<RawData>> { }
			export class Request {
				public constructor(public readonly id: string | number | null) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_accounts',
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Array<Address>
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = raw.result.map(x => Address.fromHexString(x))
				}
			}
		}
		export namespace BlockNumber {
			export interface RawRequest extends IJsonRpcRequest<'eth_blockNumber', []> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request {
				public constructor(public readonly id: string | number | null) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_blockNumber',
				})
			}
			export class Response {
				public readonly result: number
				public constructor(raw: RawResponse) {
					this.result = Number.parseInt(raw.result, 16)
				}
			}
		}
		export namespace Call {
			export interface RawRequest extends IJsonRpcRequest<'eth_call', [RawOffChainTransaction, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawData> { }
			export class Request<TAddress extends AddressLike, TBytes extends BytesLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly transaction: IOffChainTransaction<TAddress, TBytes>,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_call',
					params: [ wireEncodeOffChainTransaction(this.transaction), wireEncodeBlockTag(this.blockTag) ],
				})
			}
			export class Response {
				public readonly result: Bytes
				public constructor(raw: RawResponse) {
					this.result = Bytes.fromHexString(raw.result)
				}
			}
		}
		export namespace ChainId {
			export interface RawRequest extends IJsonRpcRequest<'eth_chainId', []> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity | null> { }
			export class Request {
				public constructor(public readonly id: string | number | null) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_chainId',
				})
			}
			export class Response {
				public readonly result: number
				public constructor(raw: RawResponse) {
					const result = raw.result ? Number.parseInt(raw.result, 16) : null
					if (result === null) throw new Error(`eth_chainId returned null`)
					this.result = result
				}
			}
		}
		export namespace Coinbase {
			export interface RawRequest extends IJsonRpcRequest<'eth_coinbase', []> { }
			export interface RawResponse extends IJsonRpcSuccess<RawAddress> { }
			export class Request {
				public constructor(public readonly id: string | number | null) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_coinbase',
				})
			}
			export class Response {
				public readonly result: Address
				public constructor(raw: RawResponse) {
					this.result = Address.fromHexString(raw.result)
				}
			}
		}
		export namespace EstimateGas {
			export interface RawRequest extends IJsonRpcRequest<'eth_estimateGas', [RawOffChainTransaction, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request<TAddress extends AddressLike, TBytes extends BytesLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly transaction: IOffChainTransaction<TAddress, TBytes>,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_estimateGas',
					params: [ wireEncodeOffChainTransaction(this.transaction), wireEncodeBlockTag(this.blockTag) ],
				})
			}
			export class Response {
				public readonly result: number
				public constructor(raw: RawResponse) {
					this.result = Number.parseInt(raw.result, 16)
				}
			}
		}
		export namespace GasPrice {
			export interface RawRequest extends IJsonRpcRequest<'eth_gasPrice', []> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request {
				public constructor(public readonly id: string | number | null) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_gasPrice',
				})
			}
			export class Response {
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.result = BigInt(raw.result)
				}
			}
		}
		export namespace GetBalance {
			export interface RawRequest extends IJsonRpcRequest<'eth_getBalance', [RawAddress, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request<TAddress extends AddressLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: TAddress,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getBalance',
					params: [wireEncodeByteArray(this.address), wireEncodeBlockTag(this.blockTag)],
				})
			}
			export class Response {
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.result = BigInt(raw.result)
				}
			}
		}
		export namespace GetBlockByHash {
			export interface RawRequest extends IJsonRpcRequest<'eth_getBlockByHash', [RawHash, boolean]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawBlock | null> { }
			export class Request<TBytes32 extends Bytes32Like> {
				public constructor(
					public readonly id: string | number | null,
					public readonly hash: TBytes32,
					public readonly fullTransactions: boolean = false,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getBlockByHash',
					params: [wireEncodeByteArray(this.hash), this.fullTransactions],
				})
			}
			export class Response {
				public readonly result: Block | null
				public constructor(raw: RawResponse) {
					this.result = (raw.result !== null) ? new Block(raw.result) : null
				}
			}
		}
		export namespace GetBlockByNumber {
			export interface RawRequest extends IJsonRpcRequest<'eth_getBlockByNumber', [RawBlockTag, boolean]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawBlock | null> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly fullTransactions: boolean = false,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getBlockByNumber',
					params: [wireEncodeBlockTag(this.blockTag), this.fullTransactions],
				})
			}
			export class Response {
				public readonly result: Block | null
				public constructor(raw: RawResponse) {
					this.result = (raw.result !== null) ? new Block(raw.result) : null
				}
			}
		}
		export namespace GetBlockTransactionCountByHash {
			export interface RawRequest extends IJsonRpcRequest<'eth_getBlockTransactionCountByHash', [RawHash]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request<TBytes32 extends Bytes32Like> {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockHash: TBytes32,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getBlockTransactionCountByHash',
					params: [wireEncodeByteArray(this.blockHash)],
				})
			}
			export class Response {
				public readonly result: number
				public constructor(raw: RawResponse) {
					this.result = Number.parseInt(raw.result, 16)
				}
			}
		}
		export namespace GetBlockTransactionCountByNumber {
			export interface RawRequest extends IJsonRpcRequest<'eth_getBlockTransactionCountByNumber', [RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getBlockTransactionCountByNumber',
					params: [wireEncodeBlockTag(this.blockTag)],
				})
			}
			export class Response {
				public readonly result: number
				public constructor(raw: RawResponse) {
					this.result = Number.parseInt(raw.result, 16)
				}
			}
		}
		export namespace GetCode {
			export interface RawRequest extends IJsonRpcRequest<'eth_getCode', [RawAddress, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawData> { }
			export class Request<TAddress extends AddressLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: TAddress,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getCode',
					params: [wireEncodeByteArray(this.address), wireEncodeBlockTag(this.blockTag)],
				})
			}
			export class Response {
				public readonly result: Bytes
				public constructor(raw: RawResponse) {
					this.result = Bytes.fromHexString(raw.result)
				}
			}
		}
		export namespace GetLogs {
			export interface RawRequest extends IJsonRpcRequest<'eth_getLogs', [{ address: RawAddress | Array<RawAddress>, topics: Array<RawHash> } & ({ fromBlock: RawBlockTag, toBlock: RawBlockTag } | { blockHash: RawHash })]> { }
			export interface RawResponse extends IJsonRpcSuccess<Array<RawLog>> { }
			export class Request<TAddress extends AddressLike, TBytes32 extends Bytes32Like> {
				public constructor(
					id: string | number | null,
					criteria: CriteriaTag<TAddress, TBytes32>,
				)
				public constructor(
					id: string | number | null,
					criteria: CriteriaHash<TAddress, TBytes32>,
				)
				public constructor(
					public readonly id: string | number | null,
					public readonly criteria: Criteria<TAddress, TBytes32>
				){ }
				public readonly wireEncode = (): RawRequest => {
					const address = (Array.isArray(this.criteria.address)) ? this.criteria.address.map(x => wireEncodeByteArray(x)) : wireEncodeByteArray(this.criteria.address)
					const topics = this.criteria.topics.map(x => wireEncodeByteArray(x))
					const criteriaBlockTarget: { blockHash: string } | { fromBlock: string, toBlock: string } = this.isCriteriaHash(this.criteria)
						? { blockHash: wireEncodeByteArray(this.criteria.blockHash) }
						: { fromBlock: wireEncodeBlockTag(this.criteria.fromBlock), toBlock: wireEncodeBlockTag(this.criteria.toBlock) }
					const criteria = Object.assign({ address, topics }, criteriaBlockTarget)
					return {
						jsonrpc: '2.0',
						id: this.id,
						method: 'eth_getLogs',
						params: [criteria],
					}
				}
				private readonly isCriteriaHash = <TAddress extends AddressLike, TBytes32 extends Bytes32Like>(criteria: Criteria<TAddress, TBytes32>): criteria is CriteriaHash<TAddress, TBytes32> => !!(criteria as any).blockHash
			}
			export class Response {
				public readonly result: Array<Log>
				public constructor(raw: RawResponse) {
					this.result = raw.result.map(x => new Log(x))
				}
			}
			export interface CriteriaBase<TAddress extends AddressLike, TBytes32 extends Bytes32Like> {
				address: TAddress | Array<TAddress>
				topics: Array<TBytes32>
			}
			export interface CriteriaHash<TAddress extends AddressLike, TBytes32 extends Bytes32Like> extends CriteriaBase<TAddress, TBytes32> {
				blockHash: TBytes32
			}
			export interface CriteriaTag<TAddress extends AddressLike, TBytes32 extends Bytes32Like> extends CriteriaBase<TAddress, TBytes32> {
				fromBlock: number
				toBlock: number
			}
			type Criteria<TAddress extends AddressLike, TBytes32 extends Bytes32Like> = CriteriaHash<TAddress, TBytes32> | CriteriaTag<TAddress, TBytes32>
		}
		export namespace GetStorageAt {
			export interface RawRequest extends IJsonRpcRequest<'eth_getStorageAt', [RawAddress, RawQuantity, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawData> { }
			export class Request<TAddress extends AddressLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: TAddress,
					public readonly index: bigint,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getStorageAt',
					params: [wireEncodeByteArray(this.address), wireEncodeNumber(this.index), wireEncodeBlockTag(this.blockTag)],
				})
			}
			export class Response {
				public readonly result: Bytes
				public constructor(raw: RawResponse) {
					this.result = Bytes.fromHexString(raw.result)
				}
			}
		}
		export namespace GetTransactionByBlockHashAndIndex {
			export interface RawRequest extends IJsonRpcRequest<'eth_getTransactionByBlockHashAndIndex', [RawHash, RawQuantity]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawTransaction | null> { }
			export class Request<TBytes32 extends Bytes32Like> {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockHash: TBytes32,
					public readonly transactionIndex: number,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionByBlockHashAndIndex',
					params: [wireEncodeByteArray(this.blockHash), wireEncodeNumber(this.transactionIndex)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Transaction | null
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = (raw.result !== null) ? new Transaction(raw.result): null
				}
			}
		}
		export namespace GetTransactionByBlockNumberAndIndex {
			export interface RawRequest extends IJsonRpcRequest<'eth_getTransactionByBlockNumberAndIndex', [RawBlockTag, RawQuantity]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawTransaction | null> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly transactionIndex: number,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionByBlockNumberAndIndex',
					params: [wireEncodeBlockTag(this.blockTag), wireEncodeNumber(this.transactionIndex)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Transaction | null
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = (raw.result !== null) ? new Transaction(raw.result): null
				}
			}
		}
		export namespace GetTransactionByHash {
			export interface RawRequest extends IJsonRpcRequest<'eth_getTransactionByHash', [RawHash]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawTransaction | null> { }
			export class Request<TBytes32 extends Bytes32Like> {
				public constructor(
					public readonly id: string | number | null,
					public readonly transactionHash: TBytes32,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionByHash',
					params: [wireEncodeByteArray(this.transactionHash)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Transaction | null
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = (raw.result !== null) ? new Transaction(raw.result): null
				}
			}
		}
		export namespace GetTransactionCount {
			export interface RawRequest extends IJsonRpcRequest<'eth_getTransactionCount', [RawAddress, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request<TAddress extends AddressLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: TAddress,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionCount',
					params: [wireEncodeByteArray(this.address), wireEncodeBlockTag(this.blockTag)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: number
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = Number.parseInt(raw.result, 16)
				}
			}
		}
		export namespace GetTransactionReceipt {
			export interface RawRequest extends IJsonRpcRequest<'eth_getTransactionReceipt', [RawHash]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawTransactionReceipt | null> { }
			export class Request<TBytes32 extends Bytes32Like> {
				public constructor(
					public readonly id: string | number | null,
					public readonly transactionHash: TBytes32,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionReceipt',
					params: [wireEncodeByteArray(this.transactionHash)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: TransactionReceipt | null
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = (raw.result !== null) ? new TransactionReceipt(raw.result) : null
				}
			}
		}
		export namespace GetUncleByBlockHashAndIndex {
			export interface RawRequest extends IJsonRpcRequest<'eth_getUncleByBlockHashAndIndex', [RawHash, RawQuantity]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawBlock> { }
			export class Request<TBytes32 extends Bytes32Like> {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockHash: TBytes32,
					public readonly uncleIndex: number,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getUncleByBlockHashAndIndex',
					params: [wireEncodeByteArray(this.blockHash), wireEncodeNumber(this.uncleIndex)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Block | null
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = (raw.result !== null) ? new Block(raw.result) : null
				}
			}
		}
		export namespace GetUncleByBlockNumberAndIndex {
			export interface RawRequest extends IJsonRpcRequest<'eth_getUncleByBlockNumberAndIndex', [RawBlockTag, RawQuantity]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawBlock> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockTag: BlockTag,
					public readonly uncleIndex: number,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getUncleByBlockNumberAndIndex',
					params: [wireEncodeBlockTag(this.blockTag), wireEncodeNumber(this.uncleIndex)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Block | null
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = (raw.result !== null) ? new Block(raw.result) : null
				}
			}
		}
		export namespace GetUncleCountByBlockHash {
			export interface RawRequest extends IJsonRpcRequest<'eth_getUncleCountByBlockHash', [RawHash]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request<TBytes32 extends Bytes32Like> {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockHash: TBytes32,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getUncleCountByBlockHash',
					params: [wireEncodeByteArray(this.blockHash)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: number
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = Number.parseInt(raw.result, 16)
				}
			}
		}
		export namespace GetUncleCountByBlockNumber {
			export interface RawRequest extends IJsonRpcRequest<'eth_getUncleCountByBlockNumber', [RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockTag: BlockTag,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getUncleCountByBlockNumber',
					params: [wireEncodeBlockTag(this.blockTag)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: number
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = Number.parseInt(raw.result, 16)
				}
			}
		}
		export namespace ProtocolVersion {
			export interface RawRequest extends IJsonRpcRequest<'eth_protocolVersion', []> { }
			export interface RawResponse extends IJsonRpcSuccess<string> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_protocolVersion',
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: string
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = raw.result
				}
			}
		}
		export namespace SendRawTransaction {
			export interface RawRequest extends IJsonRpcRequest<'eth_sendRawTransaction', [RawData]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawHash> { }
			export class Request<TBytes extends BytesLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly signedTransaction: TBytes,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_sendRawTransaction',
					params: [wireEncodeByteArray(this.signedTransaction)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Bytes32
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = Bytes32.fromHexString(raw.result)
				}
			}
		}
		export namespace SendTransaction {
			export interface RawRequest extends IJsonRpcRequest<'eth_sendTransaction', [RawOnChainTransaction]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawHash> { }
			export class Request<TAddress extends AddressLike, TBytes extends BytesLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly transaction: IOnChainTransaction<TAddress, TBytes>,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_sendTransaction',
					params: [wireEncodeOnChainTransaction(this.transaction)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Bytes32
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = Bytes32.fromHexString(raw.result)
				}
			}
		}
		export namespace Sign {
			export interface RawRequest extends IJsonRpcRequest<'eth_sign', [RawAddress, RawData]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawHash> { }
			export class Request<TAddress extends AddressLike, TBytes extends BytesLike> {
				public constructor(
					public readonly id: string | number | null,
					public readonly signerAddress: TAddress,
					public readonly data: TBytes,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_sign',
					params: [wireEncodeByteArray(this.signerAddress), wireEncodeByteArray(this.data)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Signature
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = Signature.fromHexString(raw.result)
				}
			}
		}
		export namespace Syncing {
			export interface RawRequest extends IJsonRpcRequest<'eth_syncing', []> { }
			export interface RawResponse extends IJsonRpcSuccess<false | { currentBlock: RawQuantity, highestBlock: RawQuantity, startingBlock: RawQuantity }> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_syncing',
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: false | { currentBlock: number, highestBlock: number, startingBlock: number }
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = (typeof raw.result === 'boolean') ? raw.result : {
						currentBlock: Number.parseInt(raw.result.currentBlock, 16),
						highestBlock: Number.parseInt(raw.result.highestBlock, 16),
						startingBlock: Number.parseInt(raw.result.startingBlock, 16),
					}
				}
			}
		}
	}
}

type DropFirst<T extends any[]> = ((...t: T) => void) extends ((x: any, ...u: infer U) => void) ? U : never
type ResultType<T extends { result: unknown }> = T extends { result: infer R } ? R : never
type RpcMethod<
	TRequestConstructor extends new (id: string | number | null, ...args: any[]) => { wireEncode: () => IJsonRpcRequest<JsonRpcMethod, any[]> },
	TResponseConstructor extends new (rawResponse: IJsonRpcSuccess<any>) => { result: any },
> = (...args: DropFirst<ConstructorParameters<TRequestConstructor>>) => Promise<ResultType<InstanceType<TResponseConstructor>>>

export interface JsonRpc {
	sendEth: (destination: AddressLike, amount: bigint) => Promise<TransactionReceipt>
	deployContract: (bytecode: BytesLike, value?: bigint) => Promise<Address>
	onChainContractCall: (transaction: Partial<IOnChainTransaction<AddressLike, BytesLike>> & { to: AddressLike, data: BytesLike }) => Promise<TransactionReceipt>
	offChainContractCall: (transaction: Partial<IOffChainTransaction<AddressLike, BytesLike>> & { to: AddressLike, data: BytesLike }) => Promise<Bytes>
	remoteProcedureCall: <
		TRawRequest extends IJsonRpcRequest<JsonRpcMethod, Array<any>>,
		TRawResponse extends IJsonRpcSuccess<any>
	>(request: TRawRequest) => Promise<TRawResponse>

	call: RpcMethod<typeof Rpc.Eth.Call.Request, typeof Rpc.Eth.Call.Response>
	coinbase: RpcMethod<typeof Rpc.Eth.Coinbase.Request, typeof Rpc.Eth.Coinbase.Response>
	estimateGas: RpcMethod<typeof Rpc.Eth.EstimateGas.Request, typeof Rpc.Eth.EstimateGas.Response>
	getAccounts: RpcMethod<typeof Rpc.Eth.Accounts.Request, typeof Rpc.Eth.Accounts.Response>
	getBalance: RpcMethod<typeof Rpc.Eth.GetBalance.Request, typeof Rpc.Eth.GetBalance.Response>
	getBlockByHash: RpcMethod<typeof Rpc.Eth.GetBlockByHash.Request, typeof Rpc.Eth.GetBlockByHash.Response>
	getBlockByNumber: RpcMethod<typeof Rpc.Eth.GetBlockByNumber.Request, typeof Rpc.Eth.GetBlockByNumber.Response>
	getBlockNumber: RpcMethod<typeof Rpc.Eth.BlockNumber.Request, typeof Rpc.Eth.BlockNumber.Response>
	getBlockTransactionCountByHash: RpcMethod<typeof Rpc.Eth.GetBlockTransactionCountByHash.Request, typeof Rpc.Eth.GetBlockTransactionCountByHash.Response>
	getBlockTransactionCountByNumber: RpcMethod<typeof Rpc.Eth.GetBlockTransactionCountByNumber.Request, typeof Rpc.Eth.GetBlockTransactionCountByNumber.Response>
	getChainId: RpcMethod<typeof Rpc.Eth.ChainId.Request, typeof Rpc.Eth.ChainId.Response>
	getCode: RpcMethod<typeof Rpc.Eth.GetCode.Request, typeof Rpc.Eth.GetCode.Response>
	getGasPrice: RpcMethod<typeof Rpc.Eth.GasPrice.Request, typeof Rpc.Eth.GasPrice.Response>
	getLogs: RpcMethod<typeof Rpc.Eth.GetLogs.Request, typeof Rpc.Eth.GetLogs.Response>
	getStorageAt: RpcMethod<typeof Rpc.Eth.GetStorageAt.Request, typeof Rpc.Eth.GetStorageAt.Response>
	getTransactionByBlockHashAndIndex: RpcMethod<typeof Rpc.Eth.GetTransactionByBlockHashAndIndex.Request, typeof Rpc.Eth.GetTransactionByBlockHashAndIndex.Response>
	getTransactionByBlockNumberAndIndex: RpcMethod<typeof Rpc.Eth.GetTransactionByBlockNumberAndIndex.Request, typeof Rpc.Eth.GetTransactionByBlockNumberAndIndex.Response>
	getTransactionByHash: RpcMethod<typeof Rpc.Eth.GetTransactionByHash.Request, typeof Rpc.Eth.GetTransactionByHash.Response>
	getTransactionCount: RpcMethod<typeof Rpc.Eth.GetTransactionCount.Request, typeof Rpc.Eth.GetTransactionCount.Response>
	getTransactionReceipt: RpcMethod<typeof Rpc.Eth.GetTransactionReceipt.Request, typeof Rpc.Eth.GetTransactionReceipt.Response>
	getUncleByBlockHashAndIndex: RpcMethod<typeof Rpc.Eth.GetUncleByBlockHashAndIndex.Request, typeof Rpc.Eth.GetUncleByBlockHashAndIndex.Response>
	getUncleByBlockNumberAndIndex: RpcMethod<typeof Rpc.Eth.GetUncleByBlockNumberAndIndex.Request, typeof Rpc.Eth.GetUncleByBlockNumberAndIndex.Response>
	getUncleCountByBlockHash: RpcMethod<typeof Rpc.Eth.GetUncleCountByBlockHash.Request, typeof Rpc.Eth.GetUncleCountByBlockHash.Response>
	getUncleCountByBlockNumber: RpcMethod<typeof Rpc.Eth.GetUncleCountByBlockNumber.Request, typeof Rpc.Eth.GetUncleCountByBlockNumber.Response>
	getProtocolVersion: RpcMethod<typeof Rpc.Eth.ProtocolVersion.Request, typeof Rpc.Eth.ProtocolVersion.Response>
	sendRawTransaction: RpcMethod<typeof Rpc.Eth.SendRawTransaction.Request, typeof Rpc.Eth.SendRawTransaction.Response>
	sendTransaction: RpcMethod<typeof Rpc.Eth.SendTransaction.Request, typeof Rpc.Eth.SendTransaction.Response>
	sign: RpcMethod<typeof Rpc.Eth.Sign.Request, typeof Rpc.Eth.Sign.Response>
	syncing: RpcMethod<typeof Rpc.Eth.Syncing.Request, typeof Rpc.Eth.Syncing.Response>
}

// https://github.com/microsoft/TypeScript/issues/31535
interface TextEncoder {
	/** Returns "utf-8". */
	readonly encoding: string
	/** Returns the result of running UTF-8's encoder. */
	encode(input?: string): Uint8Array
}
declare var TextEncoder: { prototype: TextEncoder; new(): TextEncoder }
