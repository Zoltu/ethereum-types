export class Bytes extends Uint8Array {
	public static fromByteArray(bytes: ArrayLike<number>, pad: 'left' | 'right' = 'right'): Bytes {
		const result = new this(bytes.length)
		if (bytes.length > result.length) throw new Error(`Source bytes are longer (${bytes.length}) than destination bytes (${result.length})\n${bytes}`)
		for (let i = 0; i < bytes.length; ++i) {
			const byte = bytes[i]
			if (byte > 0xff || byte < 0) throw new Error(`Source array must only include numbers between 0 and ${0xff}.\n${bytes}`)
		}
		result.set(bytes, (pad === 'left') ? result.length - bytes.length : 0)
		return result
	}

	public static fromHexString(hex: string, pad?: 'left' | 'right'): Bytes {
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

	public static fromStringLiteral(literal: string, pad32: 'left' | 'right' | 'none' = 'none'): Bytes {
		const encoded = new TextEncoder().encode(literal)
		const padding = new Uint8Array((32 - encoded.length % 32) % 32)
		switch (pad32) {
			case 'none':
				return this.fromByteArray(encoded)
			case 'left':
				return this.fromByteArray([...padding, ...encoded])
			case 'right':
				return this.fromByteArray([...encoded, ...padding])
			default:
				throw new Error(`Invalid 'pad32' parameter: ${pad32}.`)
		}
	}

	public static fromUnsignedInteger(value: bigint | number, numberOfBits: number): Bytes {
		if (numberOfBits % 8) throw new Error(`numberOfBits must be a multiple of 8.`)
		if (typeof value === 'number') value = BigInt(value)
		if (value >= 2n ** BigInt(numberOfBits) || value < 0n) throw new Error(`Cannot fit ${value} into a ${numberOfBits}-bit unsigned integer.`)
		const numberOfBytes = numberOfBits / 8
		const result = new this(numberOfBytes)
		if (result.length !== numberOfBytes) throw new Error(`Cannot a ${numberOfBits} value into a ${result.length} byte array.`)
		for (let i = 0; i < result.length; ++i) {
			result[i] = Number((value >> BigInt(numberOfBits - i * 8 - 8)) & 0xffn)
		}
		return result
	}

	public static fromSignedInteger(value: bigint | number, numberOfBits: number): Bytes {
		if (typeof value === 'number') value = BigInt(value)
		if (value >= 2n ** BigInt(numberOfBits - 1) || value < -(2n ** BigInt(numberOfBits - 1))) throw new Error(`Cannot fit ${value} into a ${numberOfBits}-bit signed integer.`)
		const unsignedValue = this.twosComplement(value, numberOfBits)
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
		return Bytes.twosComplement(unsignedValue, this.length * 8)
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

export type Encodable = EncodablePrimitive | EncodableTuple | EncodableArray
export type EncodablePrimitive = Uint8Array | string | boolean | bigint
export interface EncodableTuple { readonly [x: string]: Encodable }
export interface EncodableArray extends ReadonlyArray<Encodable> { }

export type RawHash = string
export type RawQuantity = string
export type RawBlockTag = string
export type RawAddress = string
export type RawData = string

export interface RawLog {
	readonly blockHash: RawHash
	readonly blockNumber: RawQuantity
	readonly transactionHash: RawHash
	readonly transactionIndex: RawQuantity
	readonly logIndex: RawQuantity
	readonly address: RawAddress
	readonly topics: Array<RawHash>
	readonly data: RawData
}

export interface RawTransactionReceipt {
	readonly blockHash: RawHash
	readonly blockNumber: RawQuantity
	readonly transactionHash: RawHash
	readonly transactionIndex: RawQuantity
	readonly from: RawAddress
	readonly to: RawAddress | null
	readonly contractAddress: RawAddress | null
	readonly cumulativeGasUsed: RawQuantity
	readonly gasUsed: RawQuantity
	readonly logs: Array<RawLog>
	readonly logsBloom: RawData
	readonly status: RawQuantity
}

export interface RawTransaction {
	readonly blockHash: RawHash | null
	readonly blockNumber: RawQuantity | null
	readonly hash: RawHash
	readonly transactionIndex: RawQuantity | null
	readonly from: RawAddress
	readonly to: RawAddress | null
	readonly value: RawQuantity
	readonly input: RawData
	readonly nonce: RawQuantity
	readonly gas: RawQuantity
	readonly gasPrice: RawQuantity
	readonly r: RawQuantity
	readonly s: RawQuantity
	readonly v: RawQuantity
}

export interface RawBlock {
	readonly hash: RawHash | null
	readonly number: RawQuantity | null
	readonly nonce: RawData | null | undefined
	readonly logsBloom: RawData | null
	readonly parentHash: RawHash
	readonly sha3Uncles: RawHash
	readonly transactionsRoot: RawData
	readonly stateRoot: RawData
	readonly receiptsRoot: RawData
	readonly miner: RawAddress
	readonly difficulty: RawQuantity
	readonly totalDifficulty: RawQuantity
	readonly extraData: RawData
	readonly size: RawQuantity
	readonly gasLimit: RawQuantity
	readonly gasUsed: RawQuantity
	readonly timestamp: RawQuantity
	readonly mixHash: RawHash | undefined
	readonly transactions: Array<RawTransaction | RawHash>
	readonly uncles: Array<RawHash>
}

export interface RawTypedData {
	readonly types: {
		readonly EIP712Domain: Array<{ name: string, type: string }>
		readonly [type: string]: Array<{ name: string, type: string }>
	}
	readonly primaryType: string
	readonly domain: unknown
	readonly message: unknown
}

export interface RawMerklePatritiaProof {
	balance: RawQuantity
	codeHash: RawHash
	nonce: RawQuantity
	storageHash: RawHash
	accountProof: Array<RawData>
	storageProof: Array<{
		key: RawQuantity
		// https://github.com/NethermindEth/nethermind/pull/1987
		value: RawQuantity | null
		proof: Array<RawData>
	}>
}

export interface RawOffChainTransaction {
	readonly from: RawAddress
	readonly to: RawAddress | null
	readonly value: RawQuantity
	readonly data: RawData
	readonly gas: RawQuantity | null
	readonly gasPrice: RawQuantity
}

export interface RawOnChainTransaction extends RawOffChainTransaction {
	readonly nonce: RawQuantity
}

export interface RawSignedTransaction {
	readonly from: RawAddress
	readonly to: RawAddress | null
	readonly value: RawQuantity
	readonly input: RawData
	readonly nonce: RawQuantity
	readonly gas: RawQuantity
	readonly gasPrice: RawQuantity
	readonly r: RawQuantity
	readonly s: RawQuantity
	readonly v: RawQuantity
}

export interface ILog {
	readonly blockHash: bigint
	readonly blockNumber: bigint
	readonly transactionHash: bigint
	readonly transactionIndex: bigint
	readonly logIndex: bigint
	readonly address: bigint
	readonly topics: Array<bigint>
	readonly data: Uint8Array
}

export class Log implements ILog {
	public readonly blockHash: bigint
	public readonly blockNumber: bigint
	public readonly transactionHash: bigint
	public readonly transactionIndex: bigint
	public readonly logIndex: bigint
	public readonly address: bigint
	public readonly topics: Array<bigint>
	public readonly data: Bytes
	public constructor(raw: RawLog) {
		this.blockHash = BigInt(raw.blockHash)
		this.blockNumber = BigInt(raw.blockNumber)
		this.transactionHash = BigInt(raw.transactionHash)
		this.transactionIndex = BigInt(raw.transactionIndex)
		this.logIndex = BigInt(raw.logIndex)
		this.address = BigInt(raw.address)
		this.topics = raw.topics.map(x => BigInt(x))
		this.data = Bytes.fromHexString(raw.data)
	}
}

export interface ITransactionReceipt {
	readonly blockHash: bigint
	readonly blockNumber: bigint
	readonly hash: bigint
	readonly index: bigint
	readonly from: bigint
	readonly to: bigint | null
	readonly contractAddress: bigint | null
	readonly cumulativeGasUsed: bigint
	readonly gasUsed: bigint
	readonly logs: Array<ILog>
	readonly logsBloom: bigint
	readonly status: boolean
}

export class TransactionReceipt implements ITransactionReceipt {
	public readonly blockHash: bigint
	public readonly blockNumber: bigint
	public readonly hash: bigint
	public readonly index: bigint
	public readonly from: bigint
	public readonly to: bigint | null
	public readonly contractAddress: bigint | null
	public readonly cumulativeGasUsed: bigint
	public readonly gasUsed: bigint
	public readonly logs: Array<Log>
	public readonly logsBloom: bigint
	public readonly status: boolean
	public constructor(raw: RawTransactionReceipt) {
		this.blockHash = BigInt(raw.blockHash)
		this.blockNumber = BigInt(raw.blockNumber)
		this.hash = BigInt(raw.transactionHash)
		this.index = BigInt(raw.transactionIndex)
		this.from = BigInt(raw.from)
		this.to = (raw.to) ? BigInt(raw.to!) : null
		this.contractAddress = (raw.contractAddress) ? BigInt(raw.contractAddress) : null
		this.cumulativeGasUsed = BigInt(raw.cumulativeGasUsed)
		this.gasUsed = BigInt(raw.gasUsed)
		this.logs = raw.logs.map(x => new Log(x))
		this.logsBloom = BigInt(raw.logsBloom)
		this.status = !!Number.parseInt(raw.status, 16)
	}
}

export interface ITransaction {
	readonly blockHash: bigint | null
	readonly blockNumber: bigint | null
	readonly hash: bigint
	readonly index: bigint | null
	readonly from: bigint
	readonly to: bigint | null
	readonly value: bigint
	readonly data: Uint8Array
	readonly nonce: bigint
	readonly gas: bigint
	readonly gasPrice: bigint
	readonly r: bigint
	readonly s: bigint
	readonly v: bigint
}

export class Transaction implements ITransaction {
	public readonly blockHash: bigint | null
	public readonly blockNumber: bigint | null
	public readonly hash: bigint
	public readonly index: bigint | null
	public readonly from: bigint
	public readonly to: bigint | null
	public readonly value: bigint
	public readonly data: Bytes
	public readonly nonce: bigint
	public readonly gas: bigint
	public readonly gasPrice: bigint
	public readonly r: bigint
	public readonly s: bigint
	public readonly v: bigint
	public constructor(raw: RawTransaction) {
		this.blockHash = (raw.blockHash !== null) ? BigInt(raw.blockHash) : null
		this.blockNumber = (raw.blockNumber !== null) ? BigInt(raw.blockNumber) : null
		this.hash = BigInt(raw.hash)
		this.index = (raw.transactionIndex !== null) ? BigInt(raw.transactionIndex) : null
		this.from = BigInt(raw.from)
		this.to = (raw.to !== null) ? BigInt(raw.to) : null
		this.value = BigInt(raw.value)
		this.data = Bytes.fromHexString(raw.input)
		this.nonce = BigInt(raw.nonce)
		this.gas = BigInt(raw.gas)
		this.gasPrice = BigInt(raw.gasPrice)
		this.r = BigInt(raw.r)
		this.s = BigInt(raw.s)
		this.v = BigInt(raw.v)
	}
}

export interface IBlock {
	readonly hash: bigint | null
	readonly number: bigint | null
	readonly nonce: bigint | null
	readonly logsBloom: bigint | null
	readonly parentHash: bigint
	readonly sha3Uncles: bigint
	readonly transactionsRoot: bigint
	readonly stateRoot: bigint
	readonly receiptsRoot: bigint
	readonly miner: bigint
	readonly difficulty: bigint
	readonly totalDifficulty: bigint
	readonly extraData: Uint8Array
	readonly size: bigint
	readonly gasLimit: bigint
	readonly gasUsed: bigint
	readonly timestamp: Date
	readonly mixHash: bigint | null
	readonly transactions: Array<ITransaction | bigint>
	readonly uncles: Array<bigint>
}

export class Block implements IBlock {
	public readonly hash: bigint | null
	public readonly number: bigint | null
	/** Will be null for OpenEthereum Proof of Authority networks. */
	public readonly nonce: bigint | null
	public readonly logsBloom: bigint | null
	public readonly parentHash: bigint
	public readonly sha3Uncles: bigint
	public readonly transactionsRoot: bigint
	public readonly stateRoot: bigint
	public readonly receiptsRoot: bigint
	public readonly miner: bigint
	public readonly difficulty: bigint
	public readonly totalDifficulty: bigint
	public readonly extraData: Bytes
	public readonly size: bigint
	public readonly gasLimit: bigint
	public readonly gasUsed: bigint
	public readonly timestamp: Date
	/** Will be null for OpenEthereum Proof of Authority networks. */
	public readonly mixHash: bigint | null
	public readonly transactions: Array<Transaction | bigint>
	public readonly uncles: Array<bigint>
	public constructor(raw: RawBlock) {
		this.hash = (raw.hash !== null) ? BigInt(raw.hash) : null
		this.number = (raw.number !== null && raw.number) ? BigInt(raw.number) : null
		this.nonce = (raw.nonce !== null && raw.nonce !== undefined) ? BigInt(raw.nonce) : null
		this.logsBloom = (raw.logsBloom !== null) ? BigInt(raw.logsBloom) : null
		this.parentHash = BigInt(raw.parentHash)
		this.sha3Uncles = BigInt(raw.sha3Uncles)
		this.transactionsRoot = BigInt(raw.transactionsRoot)
		this.stateRoot = BigInt(raw.stateRoot)
		this.receiptsRoot = BigInt(raw.receiptsRoot)
		this.miner = BigInt(raw.miner)
		this.difficulty = BigInt(raw.difficulty)
		this.totalDifficulty = BigInt(raw.totalDifficulty)
		this.extraData = Bytes.fromHexString(raw.extraData)
		this.size = BigInt(raw.size)
		this.gasLimit = BigInt(raw.gasLimit)
		this.gasUsed = BigInt(raw.gasUsed)
		this.timestamp = new Date(Number.parseInt(raw.timestamp) * 1000)
		this.mixHash = (raw.mixHash !== undefined) ? BigInt(raw.mixHash) : null
		this.transactions = raw.transactions.map(x => (typeof x === 'string') ? BigInt(x) : new Transaction(x))
		this.uncles = raw.uncles.map(x => BigInt(x))
	}
}

export class MerklePatritiaProof {
	balance: bigint
	codeHash: bigint
	nonce: bigint
	storageHash: bigint
	accountProof: readonly Bytes[]
	storageProof: readonly {
		key: bigint
		value: bigint
		proof: readonly Bytes[]
	}[]
	constructor(raw: RawMerklePatritiaProof) {
		this.balance = BigInt(raw.balance)
		this.codeHash = BigInt(raw.codeHash)
		this.nonce = BigInt(raw.nonce)
		this.storageHash = BigInt(raw.storageHash)
		this.accountProof = raw.accountProof.map(x => Bytes.fromHexString(x))
		this.storageProof = raw.storageProof.map(x => ({
			key: BigInt(x.key),
			value: BigInt(x.value || '0x0'),
			proof: x.proof.map(y => Bytes.fromHexString(y)),
		}))
	}
}

export interface ISignature {
	readonly r: bigint
	readonly s: bigint
	readonly v: bigint
}

export interface IOffChainTransaction {
	readonly from: bigint
	readonly to: bigint | null
	readonly value: bigint
	readonly data: Uint8Array
	readonly gasLimit: bigint | null
	readonly gasPrice: bigint
}

export interface IOnChainTransaction extends IOffChainTransaction {
	readonly gasLimit: bigint
	readonly nonce: bigint
}

export interface IUnsignedTransaction extends IOnChainTransaction {
	readonly chainId: bigint
}

export interface ISignedTransaction extends IOnChainTransaction, ISignature {
}

export class SignedTransaction implements ISignedTransaction {
	public readonly from: bigint
	public readonly to: bigint | null
	public readonly value: bigint
	public readonly data: Uint8Array
	public readonly gasPrice: bigint
	public readonly gasLimit: bigint
	public readonly nonce: bigint
	public readonly r: bigint
	public readonly s: bigint
	public readonly v: bigint
	public constructor(raw: RawSignedTransaction) {
		this.from = BigInt(raw.from)
		this.to = (raw.to !== null) ? BigInt(raw.to) : null
		this.value = BigInt(raw.value)
		this.data = Bytes.fromHexString(raw.input)
		this.nonce = BigInt(raw.nonce)
		this.gasLimit = BigInt(raw.gas)
		this.gasPrice = BigInt(raw.gasPrice)
		this.r = BigInt(raw.r)
		this.s = BigInt(raw.s)
		this.v = BigInt(raw.v)
	}
}

export function wireEncodeByteArray(bytes: ArrayLike<number>): string {
	let result = ''
	for (let i = 0; i < bytes.length; ++i) {
		result += ('0' + bytes[i].toString(16)).slice(-2)
	}
	return `0x${result}`
}

export function wireEncodeNumber(value: number | bigint, padding: number = 0): RawQuantity {
	if (value < 0) throw new Error(`Wire encoded values must be positive.  Received: ${value}`)
	if (typeof value === 'number' && value > 2**52) throw new Error(`Wire encoded number values cannot be bigger than ${2**52}.  Received: ${value}`)
	if (typeof value === 'bigint' && value >= 2**256) throw new Error(`Wire encoded bigint values must be smaller than ${2n**256n}.  Received: ${value}`)
	return `0x${value.toString(16).padStart(padding, '0')}`
}

export type BlockTag = 'latest' | 'earliest' | 'pending' | bigint
export function wireEncodeBlockTag(tag: BlockTag): RawBlockTag { return (typeof tag === 'string') ? tag : wireEncodeNumber(tag) }

export function wireEncodeOffChainTransaction(transaction: IOffChainTransaction): RawOffChainTransaction {
	return {
		from: wireEncodeNumber(transaction.from, 40),
		to: transaction.to ? wireEncodeNumber(transaction.to, 40) : null,
		value: wireEncodeNumber(transaction.value),
		data: wireEncodeByteArray(transaction.data),
		gas: transaction.gasLimit ? wireEncodeNumber(transaction.gasLimit) : null,
		gasPrice: wireEncodeNumber(transaction.gasPrice),
	}
}

export function wireEncodeOnChainTransaction(transaction: IOnChainTransaction): RawOnChainTransaction {
	return {
		...wireEncodeOffChainTransaction(transaction),
		nonce: wireEncodeNumber(transaction.nonce),
	}
}

export type JsonRpcMethod = 'eth_accounts' | 'eth_blockNumber' | 'eth_call' | 'eth_chainId' | 'eth_coinbase' | 'eth_estimateGas' | 'eth_gasPrice' | 'eth_getBalance' | 'eth_getBlockByHash' | 'eth_getBlockByNumber' | 'eth_getBlockTransactionCountByHash' | 'eth_getBlockTransactionCountByNumber' | 'eth_getCode' | 'eth_getLogs' | 'eth_getProof' | 'eth_getStorageAt' | 'eth_getTransactionByBlockHashAndIndex' | 'eth_getTransactionByBlockNumberAndIndex' | 'eth_getTransactionByHash' | 'eth_getTransactionCount' | 'eth_getTransactionReceipt' | 'eth_getUncleByBlockHashAndIndex' | 'eth_getUncleByBlockNumberAndIndex' | 'eth_getUncleCountByBlockHash' | 'eth_getUncleCountByBlockNumber' | 'eth_protocolVersion' | 'eth_sendRawTransaction' | 'eth_sendTransaction' | 'eth_sign' | 'eth_signTransaction' | 'eth_signTypedData' | 'eth_syncing'
export interface IJsonRpcRequest<TMethod extends JsonRpcMethod, TParams extends Array<unknown>> {
	readonly jsonrpc: '2.0'
	readonly id: string | number | null
	readonly method: TMethod
	readonly params: TParams
}
export interface IJsonRpcSuccess<TResult> {
	readonly jsonrpc: '2.0'
	readonly id: string | number | null
	readonly result: TResult
}
export interface IJsonRpcError {
	readonly jsonrpc: '2.0'
	readonly id: string | number | null
	readonly error: {
		readonly code: number
		readonly message: string
		readonly data?: unknown
	}
}
export type IJsonRpcResponse<T> = IJsonRpcSuccess<T> | IJsonRpcError
export function validateJsonRpcResponse<T>(response: any): response is IJsonRpcResponse<T> {
	if (response.jsonrpc !== '2.0'
		|| (typeof response.id !== 'string' && typeof response.id !== 'number' && response.id !== null)
		|| ('result' in response && 'error' in response)
		|| (!('result' in response) && !('error' in response))
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
					params: [],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Array<bigint>
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = raw.result.map(x => BigInt(x))
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
					params: [],
				})
			}
			export class Response {
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.result = BigInt(raw.result)
				}
			}
		}
		export namespace Call {
			export interface RawRequest extends IJsonRpcRequest<'eth_call', [RawOffChainTransaction, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawData> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly transaction: IOffChainTransaction,
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
					params: [],
				})
			}
			export class Response {
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					const result = raw.result ? BigInt(raw.result) : null
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
					params: [],
				})
			}
			export class Response {
				public readonly result: bigint | null
				public constructor(raw: RawResponse) {
					this.result = raw !== null ? BigInt(raw.result) : null
				}
			}
		}
		export namespace EstimateGas {
			export interface RawRequest extends IJsonRpcRequest<'eth_estimateGas', [RawOffChainTransaction]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawQuantity> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly transaction: IOffChainTransaction,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_estimateGas',
					params: [ wireEncodeOffChainTransaction(this.transaction) ],
				})
			}
			export class Response {
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.result = BigInt(raw.result)
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
					params: [],
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
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: bigint,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getBalance',
					params: [wireEncodeNumber(this.address, 40), wireEncodeBlockTag(this.blockTag)],
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
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly hash: bigint,
					public readonly fullTransactions: boolean = false,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getBlockByHash',
					params: [wireEncodeNumber(this.hash, 64), this.fullTransactions],
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
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockHash: bigint,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getBlockTransactionCountByHash',
					params: [wireEncodeNumber(this.blockHash, 64)],
				})
			}
			export class Response {
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.result = BigInt(raw.result)
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
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.result = BigInt(raw.result)
				}
			}
		}
		export namespace GetCode {
			export interface RawRequest extends IJsonRpcRequest<'eth_getCode', [RawAddress, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawData> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: bigint,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getCode',
					params: [wireEncodeNumber(this.address, 40), wireEncodeBlockTag(this.blockTag)],
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
			export class Request {
				public constructor(
					id: string | number | null,
					criteria: CriteriaTag,
				)
				public constructor(
					id: string | number | null,
					criteria: CriteriaHash,
				)
				public constructor(
					id: string | number | null,
					criteria: Criteria,
				)
				public constructor(
					public readonly id: string | number | null,
					public readonly criteria: Criteria
				){ }
				public readonly wireEncode = (): RawRequest => {
					const address = (Array.isArray(this.criteria.address)) ? this.criteria.address.map(x => wireEncodeNumber(x, 40)) : wireEncodeNumber(this.criteria.address, 40)
					const topics = this.criteria.topics.map(x => wireEncodeNumber(x, 64))
					const criteriaBlockTarget = this.isCriteriaHash(this.criteria)
						? { blockHash: wireEncodeNumber(this.criteria.blockHash, 64) }
						: { fromBlock: wireEncodeBlockTag(this.criteria.fromBlock), toBlock: wireEncodeBlockTag(this.criteria.toBlock) }
					const criteria = { address, topics, ...criteriaBlockTarget }
					return {
						jsonrpc: '2.0',
						id: this.id,
						method: 'eth_getLogs',
						params: [criteria],
					}
				}
				private readonly isCriteriaHash = (criteria: Criteria): criteria is CriteriaHash => !!(criteria as any).blockHash
			}
			export class Response {
				public readonly result: Array<Log>
				public constructor(raw: RawResponse) {
					this.result = raw.result.map(x => new Log(x))
				}
			}
			export interface CriteriaBase {
				address: bigint | Array<bigint>
				topics: Array<bigint>
			}
			export interface CriteriaHash extends CriteriaBase {
				blockHash: bigint
			}
			export interface CriteriaTag extends CriteriaBase {
				fromBlock: bigint
				toBlock: bigint
			}
			type Criteria = CriteriaHash | CriteriaTag
		}
		export namespace GetProof {
			export interface RawRequest extends IJsonRpcRequest<'eth_getProof', [RawAddress, Array<RawHash>, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawMerklePatritiaProof> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: bigint,
					public readonly storageKeys: readonly bigint[],
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getProof',
					params: [wireEncodeNumber(this.address, 40), this.storageKeys.map(x => wireEncodeNumber(x, 64)), wireEncodeBlockTag(this.blockTag)]
				})
			}
			export class Response {
				public readonly result: MerklePatritiaProof
				public constructor(raw: RawResponse) {
					this.result = new MerklePatritiaProof(raw.result)
				}
			}
		}
		export namespace GetStorageAt {
			export interface RawRequest extends IJsonRpcRequest<'eth_getStorageAt', [RawAddress, RawQuantity, RawBlockTag]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawData> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: bigint,
					public readonly index: bigint,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getStorageAt',
					params: [wireEncodeNumber(this.address, 40), wireEncodeNumber(this.index), wireEncodeBlockTag(this.blockTag)],
				})
			}
			export class Response {
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.result = BigInt(raw.result)
				}
			}
		}
		export namespace GetTransactionByBlockHashAndIndex {
			export interface RawRequest extends IJsonRpcRequest<'eth_getTransactionByBlockHashAndIndex', [RawHash, RawQuantity]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawTransaction | null> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockHash: bigint,
					public readonly transactionIndex: bigint,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionByBlockHashAndIndex',
					params: [wireEncodeNumber(this.blockHash, 64), wireEncodeNumber(this.transactionIndex)],
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
					public readonly transactionIndex: bigint,
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
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly transactionHash: bigint,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionByHash',
					params: [wireEncodeNumber(this.transactionHash, 64)],
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
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly address: bigint,
					public readonly blockTag: BlockTag = 'latest',
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionCount',
					params: [wireEncodeNumber(this.address, 40), wireEncodeBlockTag(this.blockTag)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = BigInt(raw.result)
				}
			}
		}
		export namespace GetTransactionReceipt {
			export interface RawRequest extends IJsonRpcRequest<'eth_getTransactionReceipt', [RawHash]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawTransactionReceipt | null> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly transactionHash: bigint,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getTransactionReceipt',
					params: [wireEncodeNumber(this.transactionHash, 64)],
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
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockHash: bigint,
					public readonly uncleIndex: bigint,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getUncleByBlockHashAndIndex',
					params: [wireEncodeNumber(this.blockHash, 64), wireEncodeNumber(this.uncleIndex)],
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
					public readonly uncleIndex: bigint,
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
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly blockHash: bigint,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_getUncleCountByBlockHash',
					params: [wireEncodeNumber(this.blockHash, 64)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = BigInt(raw.result)
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
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = BigInt(raw.result)
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
					params: [],
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
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly signedTransaction: Uint8Array,
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
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = BigInt(raw.result)
				}
			}
		}
		export namespace SendTransaction {
			export interface RawRequest extends IJsonRpcRequest<'eth_sendTransaction', [RawOnChainTransaction]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawHash> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly transaction: IOnChainTransaction,
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
				public readonly result: bigint
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = BigInt(raw.result)
				}
			}
		}
		export namespace Sign {
			export interface RawRequest extends IJsonRpcRequest<'eth_sign', [RawAddress, RawData]> { }
			export interface RawResponse extends IJsonRpcSuccess<RawHash> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly signerAddress: bigint,
					public readonly data: Uint8Array,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_sign',
					params: [wireEncodeNumber(this.signerAddress, 40), wireEncodeByteArray(this.data)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: Bytes
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = Bytes.fromHexString(raw.result)
				}
			}
		}
		export namespace SignTransaction {
			export interface RawRequest extends IJsonRpcRequest<'eth_signTransaction', [RawOnChainTransaction]> { }
			export interface RawResponse extends IJsonRpcSuccess<{raw:RawData, tx: RawSignedTransaction}> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
					public readonly transaction: IOnChainTransaction,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_signTransaction',
					params: [wireEncodeOnChainTransaction(this.transaction)],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: {
					decodedTransaction: ISignedTransaction
					encodedTransaction: Uint8Array
				}
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = {
						decodedTransaction: new SignedTransaction(raw.result.tx),
						encodedTransaction: Bytes.fromHexString(raw.result.raw),
					}
				}
			}
		}
		export namespace Syncing {
			export interface RawRequest extends IJsonRpcRequest<'eth_syncing', []> { }
			export interface RawResponse extends IJsonRpcSuccess<false | { readonly currentBlock: RawQuantity, readonly highestBlock: RawQuantity, readonly startingBlock: RawQuantity }> { }
			export class Request {
				public constructor(
					public readonly id: string | number | null,
				) { }
				public readonly wireEncode = (): RawRequest => ({
					jsonrpc: '2.0',
					id: this.id,
					method: 'eth_syncing',
					params: [],
				})
			}
			export class Response {
				public readonly id: string | number | null
				public readonly result: false | { readonly currentBlock: bigint, readonly highestBlock: bigint, readonly startingBlock: bigint }
				public constructor(raw: RawResponse) {
					this.id = raw.id
					this.result = (typeof raw.result === 'boolean') ? raw.result : {
						currentBlock: BigInt(raw.result.currentBlock),
						highestBlock: BigInt(raw.result.highestBlock),
						startingBlock: BigInt(raw.result.startingBlock),
					}
				}
			}
		}
	}
}

type DropFirst<T extends any[]> = ((...t: T) => void) extends ((x: any, ...u: infer U) => void) ? U : never
type ResultType<T extends { readonly result: unknown }> = T extends { readonly result: infer R } ? R : never
type RpcMethod<
	TRequestConstructor extends new (id: string | number | null, ...args: any[]) => { wireEncode: () => IJsonRpcRequest<JsonRpcMethod, any[]> },
	TResponseConstructor extends new (rawResponse: IJsonRpcSuccess<any>) => { readonly result: any },
> = (...args: DropFirst<ConstructorParameters<TRequestConstructor>>) => Promise<ResultType<InstanceType<TResponseConstructor>>>
type MakeRequired<T, K extends keyof T> = T & { [Key in K]-?: T[Key] }

export interface JsonRpc {
	readonly sendEth: (destination: bigint, amount: bigint) => Promise<TransactionReceipt>
	readonly deployContract: (bytecode: Uint8Array, value?: bigint) => Promise<bigint>
	readonly onChainContractCall: (transaction: MakeRequired<Partial<IOnChainTransaction>, 'to'|'data'>) => Promise<TransactionReceipt>
	readonly offChainContractCall: (transaction: MakeRequired<Partial<IOffChainTransaction>, 'to'|'data'>) => Promise<Bytes>
	readonly remoteProcedureCall: <
		TRawRequest extends IJsonRpcRequest<JsonRpcMethod, Array<any>>,
		TRawResponse extends IJsonRpcSuccess<any>
	>(request: TRawRequest) => Promise<TRawResponse>

	readonly call: RpcMethod<typeof Rpc.Eth.Call.Request, typeof Rpc.Eth.Call.Response>
	readonly coinbase: RpcMethod<typeof Rpc.Eth.Coinbase.Request, typeof Rpc.Eth.Coinbase.Response>
	readonly estimateGas: RpcMethod<typeof Rpc.Eth.EstimateGas.Request, typeof Rpc.Eth.EstimateGas.Response>
	readonly getAccounts: RpcMethod<typeof Rpc.Eth.Accounts.Request, typeof Rpc.Eth.Accounts.Response>
	readonly getBalance: RpcMethod<typeof Rpc.Eth.GetBalance.Request, typeof Rpc.Eth.GetBalance.Response>
	readonly getBlockByHash: RpcMethod<typeof Rpc.Eth.GetBlockByHash.Request, typeof Rpc.Eth.GetBlockByHash.Response>
	readonly getBlockByNumber: RpcMethod<typeof Rpc.Eth.GetBlockByNumber.Request, typeof Rpc.Eth.GetBlockByNumber.Response>
	readonly getBlockNumber: RpcMethod<typeof Rpc.Eth.BlockNumber.Request, typeof Rpc.Eth.BlockNumber.Response>
	readonly getBlockTransactionCountByHash: RpcMethod<typeof Rpc.Eth.GetBlockTransactionCountByHash.Request, typeof Rpc.Eth.GetBlockTransactionCountByHash.Response>
	readonly getBlockTransactionCountByNumber: RpcMethod<typeof Rpc.Eth.GetBlockTransactionCountByNumber.Request, typeof Rpc.Eth.GetBlockTransactionCountByNumber.Response>
	readonly getChainId: RpcMethod<typeof Rpc.Eth.ChainId.Request, typeof Rpc.Eth.ChainId.Response>
	readonly getCode: RpcMethod<typeof Rpc.Eth.GetCode.Request, typeof Rpc.Eth.GetCode.Response>
	readonly getGasPrice: RpcMethod<typeof Rpc.Eth.GasPrice.Request, typeof Rpc.Eth.GasPrice.Response>
	readonly getLogs: RpcMethod<typeof Rpc.Eth.GetLogs.Request, typeof Rpc.Eth.GetLogs.Response>
	readonly getProof: RpcMethod<typeof Rpc.Eth.GetProof.Request, typeof Rpc.Eth.GetProof.Response>
	readonly getStorageAt: RpcMethod<typeof Rpc.Eth.GetStorageAt.Request, typeof Rpc.Eth.GetStorageAt.Response>
	readonly getTransactionByBlockHashAndIndex: RpcMethod<typeof Rpc.Eth.GetTransactionByBlockHashAndIndex.Request, typeof Rpc.Eth.GetTransactionByBlockHashAndIndex.Response>
	readonly getTransactionByBlockNumberAndIndex: RpcMethod<typeof Rpc.Eth.GetTransactionByBlockNumberAndIndex.Request, typeof Rpc.Eth.GetTransactionByBlockNumberAndIndex.Response>
	readonly getTransactionByHash: RpcMethod<typeof Rpc.Eth.GetTransactionByHash.Request, typeof Rpc.Eth.GetTransactionByHash.Response>
	readonly getTransactionCount: RpcMethod<typeof Rpc.Eth.GetTransactionCount.Request, typeof Rpc.Eth.GetTransactionCount.Response>
	readonly getTransactionReceipt: RpcMethod<typeof Rpc.Eth.GetTransactionReceipt.Request, typeof Rpc.Eth.GetTransactionReceipt.Response>
	readonly getUncleByBlockHashAndIndex: RpcMethod<typeof Rpc.Eth.GetUncleByBlockHashAndIndex.Request, typeof Rpc.Eth.GetUncleByBlockHashAndIndex.Response>
	readonly getUncleByBlockNumberAndIndex: RpcMethod<typeof Rpc.Eth.GetUncleByBlockNumberAndIndex.Request, typeof Rpc.Eth.GetUncleByBlockNumberAndIndex.Response>
	readonly getUncleCountByBlockHash: RpcMethod<typeof Rpc.Eth.GetUncleCountByBlockHash.Request, typeof Rpc.Eth.GetUncleCountByBlockHash.Response>
	readonly getUncleCountByBlockNumber: RpcMethod<typeof Rpc.Eth.GetUncleCountByBlockNumber.Request, typeof Rpc.Eth.GetUncleCountByBlockNumber.Response>
	readonly getProtocolVersion: RpcMethod<typeof Rpc.Eth.ProtocolVersion.Request, typeof Rpc.Eth.ProtocolVersion.Response>
	readonly sendRawTransaction: RpcMethod<typeof Rpc.Eth.SendRawTransaction.Request, typeof Rpc.Eth.SendRawTransaction.Response>
	readonly sendTransaction: RpcMethod<typeof Rpc.Eth.SendTransaction.Request, typeof Rpc.Eth.SendTransaction.Response>
	readonly signTransaction: RpcMethod<typeof Rpc.Eth.SignTransaction.Request, typeof Rpc.Eth.SignTransaction.Response>
	readonly sign: RpcMethod<typeof Rpc.Eth.Sign.Request, typeof Rpc.Eth.Sign.Response>
	readonly syncing: RpcMethod<typeof Rpc.Eth.Syncing.Request, typeof Rpc.Eth.Syncing.Response>
}

// https://github.com/microsoft/TypeScript/issues/31535
interface TextEncoder {
	/** Returns "utf-8". */
	readonly encoding: string
	/** Returns the result of running UTF-8's encoder. */
	encode(input?: string): Uint8Array
}
declare var TextEncoder: { prototype: TextEncoder; new(): TextEncoder }
