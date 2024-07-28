/**
 * Type module.
 * @memberof Type
 */
import { Chain } from 'thirdweb';
export type {
    Account,
    GetWalletBalanceOptions,
    Wallet,
} from 'thirdweb/wallets';
/**
 * @type {string} Address
 */
export type Address = string;

/**
 * Configured extra gas as you are bidding for your transaction to be included in the next block.
 *
 * @typedef {Object} ExtraGasOptions
 * @property {number} extraMaxPriorityFeePerGasPercentage - The percentage as extra amount add on top up maxPriorityFeePerGas.
 * @property {number} extraGasPercentage- The percentage as extra amount add on top up gas limit.
 * @property {number} extraOnRetryPercentage- The percentage add on top of extraMaxPriorityFeePerGasPercentage and extraGasPercentage when retry. Multiply by retryCount
 * @example
 * ```ts
 *
 * const extraGas =
 *  (gasLimit / BigInt(100)) *
 *  BigInt(extraGasPercentage +
 *      extraOnRetryPercentage * retryCount);
 * const extraMaxPriorityFeePerGas =
 *  (maxPriorityFeePerGas / BigInt(100)) *
 *      BigInt(extraMaxPriorityFeePerGasPercentage +
 *      extraOnRetryPercentage * retryCount);
 * const maxFeePerGas =
 *  gasPrice + maxPriorityFeePerGas + extraMaxPriorityFeePerGas;
 * ```
 */
export interface ExtraGasOptions {
    extraMaxPriorityFeePerGasPercentage?: number;
    extraGasPercentage?: number;
    extraOnRetryPercentage?: number;
}

/**
 * The GasFeeInfo need to configure to paid for a transaction.
 * @typedef {Object} GasFeeInfo
 * @property {bigint | undefined} gas - The amount of computational effort required to execute specific operations on the Ethereum network. @see {@link https://ethereum.org/en/developers/docs/gas/#what-is-gas|Ethereum's gas} or @see {@link https://support.metamask.io/transactions-and-gas/gas-fees/user-guide-gas/|Metamask's gas}
 * @property {bigint | undefined} gasPrice - Indicates the current gas base fee of the network. @see {@link https://ethereum.org/en/developers/docs/gas/#base-fee|Ethereum's Base fee}
 * @property {bigint | undefined} maxFeePerGas - Maximum limit they are willing to pay for their transaction to be executed. The max fee must exceed the sum of the base fee and the tip. @see {@link https://ethereum.org/en/developers/docs/gas/#maxfee | Ethereum's maxFeePerGas}
 * @property {bigint | undefined} maxPriorityFeePerGas - The priority fee (tip) incentivizes validators to include a transaction in the block.
 * @property {bigint | undefined} extraGas - Indicates the extra gas you are willing to paid on top-up gas.
 */
export interface GasFeeInfo {
    gas?: bigint | undefined;
    gasPrice?: bigint | undefined;
    maxFeePerGas?: bigint | undefined;
    maxPriorityFeePerGas?: bigint | undefined;
    extraGas?: bigint | undefined;
}

/**
 * The eligible item is added to the whitelist for Airdrop.
 * @typedef {Object} WhiteListItem
 * @property {Address} recipient - Indicates the ethereum wallet address.
 * @property {number} amount - Indicates the allocated amount in ether format for recipient.
 */
export interface WhiteListItem {
    recipient: Address;
    amount: number;
}

/**
 * The generated merkle tree info.
 * @typedef {Object} export type GenerateMerkleTreeInfo
 * @property {string} merkleRoot - Indicates the merkleRoot value in hex format.
 * @property {string} snapshotUri - Indicates snapshotUri value in ipfs format.
 */
export interface GenerateMerkleTreeInfo {
    merkleRoot: string;
    snapshotUri: string;
}

/**
 * Types of current supporting chain in this library either ETHEREUM or SEPOLIA
 * @readonly
 * @enum {string}
 */
export enum SupportingChain {
    // Mainnet
    ETHEREUM = 'ethereum',
    // Testnet
    SEPOLIA = 'sepolia',
}

/**
 * Configured options on retry.
 * @typedef {Object} RetryOptions
 * @property {number} retries - The number of times to retry the function before failing.
 * @property {number} delay- The delay in milliseconds between retries.
 */
export interface RetryOptions {
    retries?: number;
    delay?: number;
}

/**
 * Combines members of an intersection into a readable type.
 * @see {@link https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg}
 * @example
 * Prettify<{ a: string } & { b: string } & { c: number, d: bigint }>
 * => { a: string, b: string, c: number, d: bigint }
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
};

/**
 * Configured options when creating a thirdweb chain either specify a SupportingChain or Chain
 * @typedef {Object} CreateThirdwebChainOptions
 * @property {SupportingChain} selectingChain - The selecting chain in case of chain skip.
 * @property {Chain} chain- The thirdweb chain in case of selectingChain skip.
 */
export type CreateRpcClientOptions = Prettify<
    | {
          selectingChain: SupportingChain;
          chain?: never;
      }
    | {
          selectingChain?: never;
          chain: Chain;
      }
>;

/**
 * Transaction Result wrapper to return predefined errors to let consumers handle them accordingly. Success with transaction hash or Failed with error code and message
 *
 * @typedef {Object} TransactionResultOptions
 * @property {string} transactionHash - The generated transaction hash when submitting on-chain success.
 * @property {number} errorCode - Predefine error code
 * @property {string} errorMessage - Predefine error message
 * @see {@link Type.ErrorCode | Predefined errors}
 */
export type TransactionResultOptions = Prettify<
    | {
          transactionHash: string; // Success
          errorCode?: never;
          errorMessage?: never;
      }
    | {
          transactionHash?: never; // Failed
          errorCode: number;
          errorMessage: string;
      }
>;

/**
 * SaveMerkleTreeResult when submitting on-chain saveMerkleTree transaction.
 *
 * @typedef {Object} SaveMerkleTreeResult
 * @property {TransactionResultOptions} snapshotResult - The transaction result wrap with predefined errors.
 * @property {TransactionResultOptions} merkleRootResult - The transaction result wrap with predefined errors.
 */
export interface SaveMerkleTreeResult {
    snapshotResult: TransactionResultOptions;
    merkleRootResult: TransactionResultOptions;
}

/**
 * ApproveWhitelistAndAllowanceResult when submitting on-chain saveMerkleTree and allowance transaction.
 *
 * @typedef {Object} ApproveWhitelistAndAllowanceResult
 * @property {TransactionResultOptions} snapshotResult - The transaction result wrap with predefined errors.
 * @property {TransactionResultOptions} merkleRootResult - The transaction result wrap with predefined errors.
 * @property {TransactionResultOptions} approveAllowanceResult - The transaction result wrap with predefined errors.
 */
export interface ApproveWhitelistAndAllowanceResult
    extends SaveMerkleTreeResult {
    approveAllowanceResult: TransactionResultOptions;
}

/**
 * Centralize configuration required variables for our sdk
 */
export interface ConfigOptions {
    tokenAddress: string;
    airdropAddress: string;
    selectedChain: SupportingChain;
    extraGasOptions: ExtraGasOptions;
    thirdwebClientId: string;
    thirdwebClientSecret: string;
    debug: boolean;
}
