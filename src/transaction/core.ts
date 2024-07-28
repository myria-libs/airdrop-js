/**
 * Set of single functions in our airdrop-js
 * to let consumers pick and use with their strategies
 * @module Transaction/Core
 */

// re-exports: forward export from thirdweb
export { saveSnapshot, setMerkleRoot } from 'thirdweb/extensions/airdrop';

// External imports below this line
import {
    BaseTransactionOptions,
    EstimateGasOptions,
    PreparedTransaction,
    SendTransactionOptions,
    ThirdwebClient,
    ThirdwebContract,
    estimateGas,
    estimateGasCost,
    eth_gasPrice,
    eth_getTransactionCount,
    eth_maxPriorityFeePerGas,
    getContract,
    getRpcClient,
    readContract,
    sendTransaction,
    waitForReceipt,
} from 'thirdweb';
import {
    GenerateMerkleTreeInfoERC20Params,
    claimERC20,
    generateMerkleTreeInfoERC20,
    saveSnapshot,
    setMerkleRoot,
} from 'thirdweb/extensions/airdrop';
import { approve } from 'thirdweb/extensions/erc20';
import { TransactionReceipt } from 'thirdweb/transaction';

// Internal imports below this line
import { retry } from '../common/Retry';
import {
    Account,
    Address,
    CreateRpcClientOptions,
    ExtraGasOptions,
    GasFeeInfo,
    GenerateMerkleTreeInfo,
    RetryOptions,
    SupportingChain,
    WhiteListItem,
} from '../type';
import {
    DEFAULT_EXTRA_GAS_PERCENTAGE,
    DEFAULT_EXTRA_ON_RETRY_PERCENTAGE,
    DEFAULT_EXTRA_PRIORITY_TIP_PERCENTAGE,
    DEFAULT_MAX_BLOCKS_WAIT_TIME,
} from '../type/ConstType';
import {
    doSubmitTransaction,
    getThirdWebChain,
    logFunctionDuration,
    logFunctionTrackStartTime,
} from './internalUse';

/**
 * Returns an RPC request that can be used to make JSON-RPC requests
 *
 * @param {ThirdwebClient} client - Thirdweb client.
 * @param {CreateRpcClientOptions} options - Options to create RpcClient.
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
export const getRpcClientByChain = (
    client: ThirdwebClient,
    options: CreateRpcClientOptions,
) => {
    const { selectingChain, chain } = options;
    if (chain) {
        return getRpcClient({
            client,
            chain,
        });
    }
    return getRpcClient({
        client,
        chain: getThirdWebChain(selectingChain),
    });
};

/**
 * This callback type is called `transactionCallback` and is displayed as a global symbol.
 *
 * @callback transactionCallback
 * @param {TransactionReceipt} result - The transaction receipt received from submitting.
 */

/**
 * Calculate gas fee info need to paid to submit a transaction
 * @see {@link https://ethereum.org/en/developers/docs/gas|Ethereum's gas} or @see {@link https://support.metamask.io/transactions-and-gas/gas-fees/user-guide-gas/|Metamask's gas}
 * @see {@link https://etherscan.io/gastracker|Gas Tracker}
 *
 * @param {EstimateGasOptions} options - The options for estimating gas.
 * @param {boolean} isLogResult - Whether to log the result or not. Default true.
 *  @returns {Promise<GasFeeInfo>} Promise object represents the gas fee info to perform an on-chain transaction
 * @throws An error if the account is missed.
 */
export const getGasFeeInfo = async (
    options: EstimateGasOptions,
    extraGasOptions: ExtraGasOptions = {},
    isLogResult = true,
): Promise<GasFeeInfo> => {
    const { transaction, account } = options;
    if (!account) {
        throw Error('require the account as sender of the transaction');
    }
    const {
        extraGasPercentage = DEFAULT_EXTRA_GAS_PERCENTAGE,
        extraMaxPriorityFeePerGasPercentage = DEFAULT_EXTRA_PRIORITY_TIP_PERCENTAGE,
        extraOnRetryPercentage = DEFAULT_EXTRA_ON_RETRY_PERCENTAGE,
    } = extraGasOptions;
    const { chain, client } = transaction;
    const rpcClient = getRpcClientByChain(client, { chain });
    // Estimate gas use for the transaction
    // -> gas limit
    const gasLimit = await estimateGas({
        transaction,
        account,
    });
    // -> gas extra
    const extraGas =
        (gasLimit / BigInt(100)) *
        BigInt(extraGasPercentage + extraOnRetryPercentage);
    // Gas price per unit of gas
    // -> base fee
    const gasPrice = await eth_gasPrice(rpcClient);
    // -> priority & max fee
    const maxPriorityFeePerGas = await eth_maxPriorityFeePerGas(rpcClient);
    const extraMaxPriorityFeePerGas =
        (maxPriorityFeePerGas / BigInt(100)) *
        BigInt(extraMaxPriorityFeePerGasPercentage + extraOnRetryPercentage);
    const maxFeePerGas =
        gasPrice + maxPriorityFeePerGas + extraMaxPriorityFeePerGas;
    // Estimate Gas Cost to compare with real transaction
    const gasCost = await estimateGasCost({ transaction, account });
    console.log(
        `   [getGasFeeInfo] gasCost.ether = ${gasCost.ether} - gasCost.wei = ${gasCost.wei}`,
    );

    const gasFeeInfo = {
        gas: gasLimit,
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
        extraGas,
    };
    if (isLogResult) {
        console.log(
            `   [getGasFeeInfo]: gasFeeInfo = ${JSON.stringify(gasFeeInfo)}`,
        );
    }
    return gasFeeInfo;
};

/**
 * Retrieves the transaction count (nonce) for a given Ethereum address.
 *
 * @see {@link https://ethereum.org/en/developers/docs/gas} for GAS AND FEES.
 * @see {@link https://etherscan.io/gastracker|Gas Tracker}
 *
 * @param {Address} address - The Ethereum address of Sender.
 * @param {ThirdwebClient} client - Thirdweb client.
 * @param {CreateRpcClientOptions} options - Options to create RpcClient.
 * @param {boolean} isLogResult - Whether to log the result or not. Default true.
 *  @returns {Promise<number>} Promise object represents the next transaction nonce
 */
export const getNextNonce = async (
    address: Address,
    client: ThirdwebClient,
    options: CreateRpcClientOptions,
    isLogResult = true,
): Promise<number> => {
    const startTime = logFunctionTrackStartTime(getNextNonce.name);
    const rpcClient = getRpcClientByChain(client, options);
    const transactionNonce = await eth_getTransactionCount(rpcClient, {
        address,
    });
    if (isLogResult) {
        // TODO: replace with the logger library for better format or other targets
        console.log(
            `   [getNextNonce]>[response] transactionNonce = ${transactionNonce}`,
        );
    }
    logFunctionDuration(getNextNonce.name, startTime);
    return transactionNonce;
};

/**
 * Reads owner of a smart contract.
 *
 * @param {ThirdwebContract} contract - The Thirdweb contract.
 * @returns {Promise<string>} A promise that resolves with the result of the owner ethereum address.
 */
export const getOwnerOfContract = async (
    contract: ThirdwebContract,
): Promise<string> => {
    return await readContract({
        contract,
        // Pass a snippet of the ABI for the method you want to call.
        method: {
            type: 'function',
            name: 'owner',
            inputs: [],
            outputs: [
                {
                    type: 'address',
                    name: '',
                    internalType: 'address',
                },
            ],
            stateMutability: 'view',
        },
        params: [],
    });
};

/**
 * Creates a Thirdweb contract by combining the Thirdweb client and contract options.
 *
 * @param {Address} address - The ethereum smart contract address.
 * @param {ThirdwebClient} client - Thirdweb client.
 * @param {SupportingChain} selectingChain - The selecting chain.
 * @returns The Thirdweb contract.
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type*/
export const getThirdwebContract = (
    address: Address,
    client: ThirdwebClient,
    selectingChain: SupportingChain,
) => {
    return getContract({
        client,
        chain: getThirdWebChain(selectingChain),
        address,
    });
};

/**
 * End-User connects wallet to trigger Claim from Client side
 *
 * @param {Address} tokenAddress - The token address to claim.
 * @param {Account} account - The Account represent as sender @see {@link https://ethereum.org/en/glossary/#account|Account's Ethereum}.
 * @param {ThirdwebContract} airdropContract - The airdrop Thirdweb contract.
 * @param {transactionCallback} callback - The callback that handles the post-submit state.
 * @param {boolean} isLogResult - Whether to log the result or not. Default true.
 * @returns {Promise<TransactionReceipt>} A promise that resolves to the confirmed transaction receipt.
 * @throws An error if the wallet is not connected.
 * @example
 * ```ts
 * import { claimAirdropToken } from "./index";
 *
 * const transactionReceipt = await claimAirdropToken(
 *  tokenAddress,
 *  account,
 *  airdropContract
 * );
 * ```
 */
export const claimAirdropToken = async (
    tokenAddress: Address,
    account: Account,
    airdropContract: ThirdwebContract,
    callback?: (result: TransactionReceipt) => void,
    isLogResult = true,
): Promise<TransactionReceipt> => {
    const claimTransaction = claimERC20({
        contract: airdropContract,
        tokenAddress,
        recipient: account.address,
    });
    // Send the transaction
    return doSubmitTransaction(
        { transaction: claimTransaction, account },
        callback,
        isLogResult,
    );
};

/**
 * Token contract owner approve airdrop contract address as spender with amount
 *
 * @param {Address} spender - The airdrop smart contract address as spender.
 * @param {number} amount - The total airdrop amount in ether format.
 * @param {Account} account - The Account represent as sender @see {@link https://ethereum.org/en/glossary/#account|Account's Ethereum}.
 * @param {ThirdwebContract} tokenContract - The token Thirdweb contract to airdrop
 * @param {transactionCallback} callback - The callback that handles the post-submit state.
 * @param {boolean} isLogResult - Whether to log the result or not. Default true.
 * @returns {Promise<TransactionReceipt>} A promise that resolves to the confirmed transaction receipt.
 * @throws An error if the amount <= 0.
 * @throws An error if the wallet is not connected.
 * @example
 * ```ts
 * import { approveAirdropAsSpender } from "./index";
 *
 * const transactionReceipt = await approveAirdropAsSpender(
 *  spender,
 *  amount,
 *  account,
 *  tokenContract
 * );
 * ```
 */
export const approveAirdropAsSpender = async (
    spender: Address,
    amount: number,
    account: Account,
    tokenContract: ThirdwebContract,
    callback?: (result: TransactionReceipt) => void,
    isLogResult = true,
): Promise<TransactionReceipt> => {
    if (amount <= 0) {
        throw Error('total airdrop amount must be greater than 0');
    }
    const startTime = logFunctionTrackStartTime(approveAirdropAsSpender.name);
    const transaction = approve({
        contract: tokenContract,
        spender,
        amount,
    });
    // Send the transaction
    const result = await doSubmitTransaction(
        { transaction, account },
        callback,
        isLogResult,
    );
    logFunctionDuration(approveAirdropAsSpender.name, startTime);
    return result;
};

/**
 * Generate merkle tree info for a whitelist
 *
 * @param {WhiteListItem[]} whitelist - The list of items is available for airdrop.
 * @param {ThirdwebContract} airdropContract - The Airdrop Thirdweb contract.
 * @param {Address} tokenAddress - The token address to claim.
 * @param {boolean} isLogResult - Whether to log the result or not. Default true.
 * @returns {Promise<GenerateMerkleTreeInfo>} A promise that resolves to the generated info.
 * @throws An error if the wallet is zero.
 * @example
 * ```ts
 * import { generateMerkleTreeForWhitelist } from "./index";
 *
 * const generateMerkleTreeInfo = await generateMerkleTreeForWhitelist(
 *  whitelist,
 *  airdropContract,
 *  tokenAddress,
 *  tokenContract
 * );
 * ```
 */
export const generateMerkleTreeInfoERC20ForWhitelist = async (
    whitelist: WhiteListItem[],
    airdropContract: ThirdwebContract,
    tokenAddress: Address,
    isLogResult = true,
): Promise<GenerateMerkleTreeInfo> => {
    const startTime = logFunctionTrackStartTime(
        generateMerkleTreeInfoERC20ForWhitelist.name,
    );
    const params: BaseTransactionOptions<GenerateMerkleTreeInfoERC20Params> = {
        contract: airdropContract,
        snapshot: whitelist,
        tokenAddress,
    };
    const generateMerkleTreeInfo = await generateMerkleTreeInfoERC20(params);
    if (isLogResult) {
        // TODO: replace with the logger library for better format or other targets
        console.log('   [generateMerkleTreeForWhitelist]');
        console.log(`       [request] params = ${JSON.stringify(params)}`);
        console.log(
            `       [response] result = ${JSON.stringify(generateMerkleTreeInfo)}`,
        );
    }
    logFunctionDuration(
        generateMerkleTreeInfoERC20ForWhitelist.name,
        startTime,
    );
    return generateMerkleTreeInfo;
};

/**
 * Airdrop's owner saved merkleRoot to on-chain.
 *
 * @remarks
 * MUST execute saveSnapshotByOwner first. Order master
 *
 * @param {Account} account - The Account represent as sender @see {@link https://ethereum.org/en/glossary/#account|Account's Ethereum}.
 * @param {ThirdwebContract} airdropContract - The airdrop Thirdweb contract.
 * @param {Address} tokenAddress - The token address to claim.
 * @param {string} merkleRoot - The generated merkleRoot from whitelist @see {@link generateMerkleTreeInfoERC20ForWhitelist|Generate merkleRoot}
 * @param {RetryOptions} retryOptions - The configuration on retry
 * @param {ExtraGasOptions} extraGasOptions - The extra gas options bidding for your transaction to be included in the next block.
 * @returns {Promise<TransactionReceipt>} A promise that resolves to the confirmed transaction receipt.
 * @throws An error if the wallet is not connected.
 */
export const saveMerkleRootByOwner = async (
    account: Account,
    airdropContract: ThirdwebContract,
    tokenAddress: string,
    merkleRoot: string,
    retryOptions: RetryOptions = {},
    extraGasOptions: ExtraGasOptions = {},
): Promise<TransactionReceipt> => {
    const startTime = logFunctionTrackStartTime(saveMerkleRootByOwner.name);
    const merkleRootTransaction = setMerkleRoot({
        contract: airdropContract,
        token: `0x${tokenAddress.replace('0x', '')}`,
        tokenMerkleRoot: `0x${merkleRoot.replace('0x', '')}`,
        resetClaimStatus: true,
    });
    const result = await retryPrepareAndSubmitRawTransaction(
        merkleRootTransaction,
        account,
        retryOptions,
        extraGasOptions,
    );
    logFunctionDuration(saveMerkleRootByOwner.name, startTime);
    return result;
};

/**
 * Airdrop's owner saved snapshotUri to on-chain.
 *
 * @param {Account} account - The Account represent as sender @see {@link https://ethereum.org/en/glossary/#account|Account's Ethereum}.
 * @param {ThirdwebContract} airdropContract - The airdrop Thirdweb contract.
 * @param {string} merkleRoot - The generated merkleRoot from whitelist @see {@link generateMerkleTreeInfoERC20ForWhitelist|Generate merkleRoot}
 * @param {string} snapshotUri - The generated snapshotUri from whitelist @see {@link generateMerkleTreeInfoERC20ForWhitelist|Generate snapshotUri}
 * @param {RetryOptions} retryOptions - The configuration on retry
 * @param {ExtraGasOptions} extraGasOptions - The extra gas options bidding for your transaction to be included in the next block.
 * @returns {Promise<TransactionReceipt>} A promise that resolves to the confirmed transaction receipt.
 * @throws An error if the wallet is not connected.
 */
export const saveSnapshotByOwner = async (
    account: Account,
    airdropContract: ThirdwebContract,
    merkleRoot: string,
    snapshotUri: string,
    retryOptions: RetryOptions = {},
    extraGasOptions: ExtraGasOptions = {},
): Promise<TransactionReceipt> => {
    const startTime = logFunctionTrackStartTime(saveSnapshotByOwner.name);
    const saveSnapshotTransaction = saveSnapshot({
        contract: airdropContract,
        merkleRoot,
        snapshotUri,
    });
    const result = await retryPrepareAndSubmitRawTransaction(
        saveSnapshotTransaction,
        account,
        retryOptions,
        extraGasOptions,
    );
    logFunctionDuration(saveSnapshotByOwner.name, startTime);
    return result;
};

/**
 * Sends a transaction using the provided wallet.
 * @param {SendTransactionOptions} options - The options for sending the transaction.
 * @param {number} maxBlocksWaitTime - The maximum of blocks to wait for confirmation before considering success.
 * @returns {Promise<TransactionReceipt>} A promise that resolves to the confirmed transaction receipt.
 * @throws An error if the wallet is not connected.
 * @example
 * ```ts
 * import { sendAndConfirmTransaction } from "./index";
 *
 * const transactionReceipt = await sendAndConfirmTransaction(
 * options,
 * maxBlocksWaitTime
 * );
 * ```
 */
export async function sendTransactionAndWaitForReceipt(
    options: SendTransactionOptions,
    maxBlocksWaitTime = DEFAULT_MAX_BLOCKS_WAIT_TIME,
): Promise<TransactionReceipt> {
    const submittedTx = await sendTransaction(options);
    return waitForReceipt({
        ...submittedTx,
        maxBlocksWaitTime,
    });
}

/**
 * Retry on preparing the gas fee, and nonce, and send a transaction using the provided wallet.
 *
 * @param {PreparedTransaction} transaction - The raw transaction to submit
 * @param {Account} account - The Account represent as sender @see {@link https://ethereum.org/en/glossary/#account|Account's Ethereum}.
 * @param {ExtraGasOptions} extraGasOptions - The extra gas options bidding for your transaction to be included in the next block. Otherwise, Use default our sdk {@link Type | Default Variables}
 * @param {RetryOptions} retryOptions - The configuration on retry
 * @returns {Promise<TransactionReceipt>} A promise that resolves to the confirmed transaction receipt.
 * @throws An error if the wallet is not connected.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function retryPrepareAndSubmitRawTransaction(
    transaction: PreparedTransaction<any>,
    account: Account,
    retryOptions: RetryOptions = {},
    extraGasOptions: ExtraGasOptions = {},
): Promise<TransactionReceipt> {
    const {
        extraGasPercentage = DEFAULT_EXTRA_GAS_PERCENTAGE,
        extraMaxPriorityFeePerGasPercentage = DEFAULT_EXTRA_PRIORITY_TIP_PERCENTAGE,
        extraOnRetryPercentage = DEFAULT_EXTRA_ON_RETRY_PERCENTAGE,
    } = extraGasOptions;
    const { client, chain } = transaction;
    return retry<TransactionReceipt>(async (retryCount) => {
        // Get transaction nonce
        const nextNonce = await getNextNonce(account.address, client, {
            chain,
        });
        // Calculate gas fee of a transaction
        const gasFeeInfo = await getGasFeeInfo(
            { transaction, account },
            {
                extraGasPercentage,
                extraMaxPriorityFeePerGasPercentage,
                extraOnRetryPercentage: extraOnRetryPercentage * retryCount,
            },
        );
        const sendingSnapshotTransaction = {
            ...transaction,
            ...gasFeeInfo,
            nonce: nextNonce,
        };
        return await sendTransactionAndWaitForReceipt({
            transaction: sendingSnapshotTransaction,
            account: account,
        });
    }, retryOptions);
}
