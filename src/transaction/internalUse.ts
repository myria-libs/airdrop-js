/**
 * Collection of utils functions use for internal
 * DO NOT export for our consumers use. Otherwise, Move to core or wrapper instead
 */

// External imports below this line
import { Chain, SendTransactionOptions } from 'thirdweb';
import { TransactionReceipt } from 'thirdweb/transaction';

// Internal imports below this line
import { ethereum, sepolia } from 'thirdweb/chains';
import { SupportingChain } from '../type';
import { sendTransactionAndWaitForReceipt } from './core';

/**
 * Log with start time to keep track
 *
 * @param {string} functionName - The source's function name invoke this function
 * @returns {number} the current start time in milliseconds
 */
export const logFunctionTrackStartTime = (functionName: string): number => {
    const currentDate = new Date();
    console.log(
        `   👉 [@myria/airdrop-js]>[${functionName}] is executing...🏃 at ⏰ ${currentDate.toLocaleTimeString()} 👈`,
    );
    return currentDate.getMilliseconds();
};

/**
 * Log function's duration to keep track
 *
 * @param {string} functionName - The source's function name invoke this function
 * @param {number} startTime - The start time in milliseconds when you perform the same functionName
 */
export const logFunctionDuration = (
    functionName: string,
    startTime: number,
): void => {
    const currentDate = new Date();
    console.log(
        `   ✅ [@myria/airdrop-js]>[${functionName}] has been executed at ⏰ ${currentDate.toLocaleTimeString()} in 💁 ${currentDate.getMilliseconds() - startTime} milliseconds ✅          `,
    );
};

/**
 * Retrieve thirdweb chain from a supporting chain in our sdk
 *
 * @param {SupportingChain} supportingChain - The selected chain by invoker.
 * @returns {Chain} A thirdweb chain.
 */
export const getThirdWebChain = (supportingChain: SupportingChain): Chain => {
    switch (supportingChain) {
        case SupportingChain.ETHEREUM:
            return ethereum;
        case SupportingChain.SEPOLIA:
            return sepolia;
    }
};

/**
 * Private method Sends a transaction using the provided wallet.
 *
 * @param {SendTransactionOptions} options - The options for sending the transaction.
 * @param {transactionCallback} callback - The callback that handles the post-submit state.
 * @param {boolean} isLogResult - Whether to log the result or not. Default true.
 * @returns {Promise<TransactionReceipt>} A promise that resolves to the confirmed transaction receipt.
 * @throws An error if the wallet is not connected.
 */
export const doSubmitTransaction = async (
    options: SendTransactionOptions,
    callback?: (result: TransactionReceipt) => void,
    isLogResult = true,
): Promise<TransactionReceipt> => {
    if (isLogResult) {
        // TODO: replace with the logger library for better format or other targets
        console.log(`[request] options = ${JSON.stringify(options)}`);
    }
    const transactionReceipt = await sendTransactionAndWaitForReceipt(options);
    if (isLogResult) {
        // TODO: replace with the logger library for better format or other targets
        console.log(
            `[response] result = ${JSON.stringify(transactionReceipt)}`,
        );
    }
    if (callback) {
        callback(transactionReceipt);
    }
    return transactionReceipt;
};
