/**
 * @module Type/ConstType
 */
export { ZERO_ADDRESS } from 'thirdweb';
/**
 * Default extra gas percentage on gasLimit
 * */
export const DEFAULT_EXTRA_GAS_PERCENTAGE = 10;
/**
 * Default extra gas percentage on maxPriorityFeePerGas
 * */
export const DEFAULT_EXTRA_PRIORITY_TIP_PERCENTAGE = 20;
/**
 * Default extra percentage when retry on top of gasLimit and maxPriorityFeePerGas
 * */
export const DEFAULT_EXTRA_ON_RETRY_PERCENTAGE = 1;
/**
 * Default maximum of blocks need to wait before considering a transaction in final status
 * */
export const DEFAULT_MAX_BLOCKS_WAIT_TIME = 30;
/**
 * The error message return in case of user try to claim again
 * */
export const TRANSACTION_ERROR_AIRDROP_ALREADY_CLAIMED =
    'AirdropAlreadyClaimed';
