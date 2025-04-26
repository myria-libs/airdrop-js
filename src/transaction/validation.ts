/**
 * Collection of validation functions
 * @module Transaction/Validation
 */

// External imports below this line
import { ThirdwebContract, toTokens } from 'thirdweb';
import { isClaimed, tokenMerkleRoot } from 'thirdweb/extensions/airdrop';
import { allowance } from 'thirdweb/extensions/erc20';

// Internal imports below this line
import { Address } from '../type';
import { logFunctionDuration, logFunctionTrackStartTime } from './internalUse';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateMerkleTreeInfoERC20ForWhitelist } from './core';

/**
 * Check whether MerkleTree has already been submitted on-chain or not with the same data to reduce our cost by skipping submitting. Retry safer
 *
 * @param {ThirdwebContract} airdropContract - The airdrop Thirdweb contract.
 * @param {Address} tokenAddress - The token address to claim.
 * @param {string} merkleRoot - The generated merkleRoot from whitelist. @see {@link generateMerkleTreeInfoERC20ForWhitelist|Generate merkleRoot}
 * @returns {Promise<boolean>} A promise that resolves whether MerkleTree has already been submitted on-chain or not.
 */
export const isAlreadySubmittedOnchain = async (
    airdropContract: ThirdwebContract,
    tokenAddress: Address,
    merkleRoot: string,
): Promise<boolean> => {
    const startTime = logFunctionTrackStartTime(isAlreadySubmittedOnchain.name);
    const existedTokenMerkleRoot = await tokenMerkleRoot({
        contract: airdropContract,
        tokenAddress,
    });
    const saferMerleRootFormat = `0x${merkleRoot.replace('0x', '')}`;
    logFunctionDuration(isAlreadySubmittedOnchain.name, startTime);
    if (existedTokenMerkleRoot == saferMerleRootFormat) {
        return true;
    }
    return false;
};

/**
 * Check whether Spender has already been approved allowance on-chain or not to reduce our cost by skipping submitting. Retry safer
 *
 * @param {Address} owner - The token's owner address.
 * @param {Address} spender - The spender's address.
 * @param {ThirdwebContract} tokenContract - The airdrop Thirdweb contract.
 * @param {number} totalAmount - The total airdrop amount in ether format.
 * @param decimals - The number of decimal places to include in the string representation. Default 18
 * @returns {Promise<boolean>} A promise that resolves whether Spender has already been approved allowance on-chain or not.
 * @throws An error if the totalAmount <= 0.
 */
export const isAlreadyApprovedAllowanceOnchain = async (
    owner: Address,
    spender: Address,
    tokenContract: ThirdwebContract,
    totalAmount: number,
    decimals: number = 18,
): Promise<boolean> => {
    if (totalAmount <= 0) {
        throw Error('totalAmount must be greater than 0');
    }
    const startTime = logFunctionTrackStartTime(
        isAlreadyApprovedAllowanceOnchain.name,
    );
    console.log(
        `isAlreadyApprovedAllowanceOnchain owner: ${owner}, spender: ${spender}, tokenContract: ${tokenContract.address}, totalAmount: ${totalAmount}, decimals: ${decimals}`,
    );
    const remainingAllowance = await allowance({
        contract: tokenContract,
        owner,
        spender,
    });
    console.log(
        `isAlreadyApprovedAllowanceOnchain remainingAllowance: ${remainingAllowance}`,
    );
    const existedAllowance = Number(toTokens(remainingAllowance, decimals));

    console.log(
        `isAlreadyApprovedAllowanceOnchain existedAllowance: ${existedAllowance}, totalAmount: ${totalAmount}`,
    );
    if (existedAllowance >= totalAmount) {
        return true;
    }
    logFunctionDuration(isAlreadyApprovedAllowanceOnchain.name, startTime);
    return false;
};

/**
 * Check whether recipient is claimed or not
 *
 * @param {Address} recipient - The ethereum wallet address to check.
 * @param {ThirdwebContract} airdropContract - The airdrop Thirdweb contract.
 * @param {Address} token - The token address to claim.
 * @param {bigint} claimAmount - The claimAmount or tokenId for ERC721
 * @returns {Promise<boolean>} A promise that resolves whether the recipient already claimed or not.
 */
export const isRecipientClaimed = async (
    recipient: Address,
    airdropContract: ThirdwebContract,
    token: Address,
    claimAmount = BigInt(0),
): Promise<boolean> => {
    return await isClaimed({
        // AirdropClaimable contract at step #2
        contract: airdropContract,
        receiver: recipient,
        token,
        tokenId: claimAmount,
    });
};
