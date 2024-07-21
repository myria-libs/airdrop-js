/**
 * Wallet module.
 * @module Wallet
 */

/**
 * Retrieves the balance of a token or native currency for a given wallet.
 * @function
 * @name getWalletBalance
 * @param options - The options for retrieving the token balance.
 * @param options.address - The address for which to retrieve the balance.
 * @param options.client - The Thirdweb client to use for the request.
 * @param options.chain - The chain for which to retrieve the balance.
 * @param options.tokenAddress - (Optional) The address of the token to retrieve the balance for. If not provided, the balance of the native token will be retrieved.
 * @returns A promise that resolves to the token balance result.
 * @example
 * ```ts
 * import { Wallet } from "@myria/airdrop-js";
 * const balance = await Wallet.getWalletBalance({ account, client, chain, tokenAddress });
 * ```
 */
export { getWalletBalance } from 'thirdweb/wallets';

/**
 * Get an `Account` object from a private key.
 * @function
 * @name privateKeyToAccount
 * @param options - The options for `privateKeyToAccount`
 * Refer to the type [`PrivateKeyToAccountOptions`](https://portal.thirdweb.com/references/typescript/v5/PrivateKeyToAccountOptions)
 * @returns The `Account` object that represents the private key
 * @example
 * ```ts
 * import { Wallet } from "@myria/airdrop-js"
 *
 * const wallet = Wallet.privateKeyToAccount({
 *  client,
 *  privateKey: "...",
 * });
 * ```
 */
export { privateKeyToAccount } from 'thirdweb/wallets';
