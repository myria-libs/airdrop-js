/**
 * Collection of wrapper functions which include single functions in core to simplify consumers's integration like plug (config in) and play
 *  @module Transaction/Wrapper
 */

// External imports below this line
import { ThirdwebContract } from 'thirdweb';
import {
    Account,
    ApproveWhitelistAndAllowanceResult,
    ExtraGasOptions,
    RetryOptions,
    SaveMerkleTreeResult,
} from '../type';
import {
    ALREADY_SUBMITTED_SKIP_TRANSACTION,
    GENERIC_ERROR,
} from '../type/ErrorCodeType';
import {
    approveAirdropAsSpender,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    generateMerkleTreeInfoERC20ForWhitelist,
    getOwnerOfContract,
    saveMerkleRootByOwner,
    saveSnapshotByOwner,
} from './core';
import { logFunctionDuration, logFunctionTrackStartTime } from './internalUse';
import {
    isAlreadyApprovedAllowanceOnchain,
    isAlreadySubmittedOnchain,
} from './validation';

/**
 * Wrapper function: Airdrop's owner approve whitelist to save on-chain include both setMerkleRoot and saveSnapshot
 *
 * @param {Account} account - The Account represent as sender @see {@link https://ethereum.org/en/glossary/#account|Account's Ethereum}.
 * @param {string} merkleRoot - The generated merkleRoot from whitelist @see {@link generateMerkleTreeInfoERC20ForWhitelist|Generate merkleRoot}
 * @param {string} snapshotUri - The generated snapshotUri from whitelist @see {@link generateMerkleTreeInfoERC20ForWhitelist|Generate snapshotUri}
 * @param {ThirdwebContract} airdropContract - The airdrop Thirdweb contract.
 * @param {Address} tokenAddress - The token address to claim.
 * @param {RetryOptions} retryOptions - The configuration on retry
 * @param {ExtraGasOptions} extraGasOptions - The extra gas options bidding for your transaction to be included in the next block.
 * @returns {Promise<SaveMerkleTreeResult>} A promise that resolves to the confirmed transaction hashes accordingly.
 */
export async function saveMerkleTreeByOwner(
    account: Account,
    merkleRoot: string,
    snapshotUri: string,
    airdropContract: ThirdwebContract,
    tokenAddress: string,
    retryOptions: RetryOptions = {},
    extraGasOptions: ExtraGasOptions = {},
): Promise<SaveMerkleTreeResult> {
    const startTime = logFunctionTrackStartTime(saveMerkleTreeByOwner.name);
    // Check to skip approve allowance to reduce our cost
    const shouldSkipSubmitting = await isAlreadySubmittedOnchain(
        airdropContract,
        tokenAddress,
        merkleRoot,
    );
    if (shouldSkipSubmitting) {
        logFunctionDuration(saveMerkleTreeByOwner.name, startTime);
        return {
            snapshotResult: ALREADY_SUBMITTED_SKIP_TRANSACTION,
            merkleRootResult: ALREADY_SUBMITTED_SKIP_TRANSACTION,
        };
    }

    // Save snapshot
    const { transactionHash: snapshotTransactionHash } =
        await saveSnapshotByOwner(
            account,
            airdropContract,
            merkleRoot,
            snapshotUri,
            retryOptions,
            extraGasOptions,
        );
    const snapshotResult = { transactionHash: snapshotTransactionHash };

    // Set MerkleRoot
    const { transactionHash: merkleRootTransactionHash } =
        await saveMerkleRootByOwner(
            account,
            airdropContract,
            tokenAddress,
            merkleRoot,
            retryOptions,
            extraGasOptions,
        );
    const merkleRootResult = { transactionHash: merkleRootTransactionHash };

    logFunctionDuration(saveMerkleTreeByOwner.name, startTime);
    // In case of resubmit with the same data. The transaction hash will be empty
    return {
        snapshotResult,
        merkleRootResult,
    };
}

/**
 * Wrapper function: Owner approve the whitelist on behalf of Airdrop's contract owner and approve allowance on behalf of Token's contract owner.
 *
 * @param {Account} account - The Account represent as sender @see {@link https://ethereum.org/en/glossary/#account|Account's Ethereum}.
 * @param {string} merkleRoot - The generated merkleRoot from whitelist @see {@link generateMerkleTreeInfoERC20ForWhitelist|Generate merkleRoot}
 * @param {string} snapshotUri - The generated snapshotUri from whitelist @see {@link generateMerkleTreeInfoERC20ForWhitelist|Generate snapshotUri}
 * @param {ThirdwebContract} airdropContract - The airdrop Thirdweb contract.
 * @param {ThirdwebContract} tokenContract - The token Thirdweb contract to airdrop
 * @param {number} totalAmount - The total airdrop amount in ether format.
 * @param {RetryOptions} retryOptions - The configuration on retry
 * @param {ExtraGasOptions} extraGasOptions - The extra gas options bidding for your transaction to be included in the next block.
 * @returns {Promise<ApproveWhitelistAndAllowanceResult>} A promise that resolves to the confirmed transaction hashes accordingly.
 * @throws An error if the totalAmount <= 0.
 */
export async function approveWhitelistAndAllowance(
    account: Account,
    merkleRoot: string,
    snapshotUri: string,
    airdropContract: ThirdwebContract,
    tokenContract: ThirdwebContract,
    totalAmount: number,
    retryOptions: RetryOptions = {},
    extraGasOptions: ExtraGasOptions = {},
): Promise<ApproveWhitelistAndAllowanceResult> {
    if (totalAmount <= 0) {
        throw Error('totalAmount must be greater than 0');
    }
    const ownerAddress = await getOwnerOfContract(airdropContract);
    if (account.address.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw Error('account must belong to airdropContract owner');
    }
    const startTime = logFunctionTrackStartTime(
        approveWhitelistAndAllowance.name,
    );
    // Save MerkleTree on-chain
    const saveMerkleTreeResult = await saveMerkleTreeByOwner(
        account,
        merkleRoot,
        snapshotUri,
        airdropContract,
        tokenContract.address,
        retryOptions,
        extraGasOptions,
    );

    // Approve Allowance
    // Check to skip approve allowance to reduce our cost
    const shouldSkipApproveSpender = await isAlreadyApprovedAllowanceOnchain(
        account.address,
        airdropContract.address,
        tokenContract,
        totalAmount,
    );
    if (shouldSkipApproveSpender) {
        logFunctionDuration(approveWhitelistAndAllowance.name, startTime);
        return {
            ...saveMerkleTreeResult,
            approveAllowanceResult: ALREADY_SUBMITTED_SKIP_TRANSACTION,
        };
    }
    let approveAllowanceResult;
    try {
        const { transactionHash } = await approveAirdropAsSpender(
            airdropContract.address,
            totalAmount,
            account,
            tokenContract,
        );
        approveAllowanceResult = {
            transactionHash,
        };
    } catch (error) {
        approveAllowanceResult = {
            ...GENERIC_ERROR,
            errorMessage: error.message,
        };
    }

    logFunctionDuration(approveWhitelistAndAllowance.name, startTime);
    return {
        ...saveMerkleTreeResult,
        approveAllowanceResult: approveAllowanceResult,
    };
}
