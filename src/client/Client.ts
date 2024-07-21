/**
 * Client module.
 * @module Client
 */
import { createThirdwebClient } from 'thirdweb';
import { IThirdwebClient } from '../type/ClientType';

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
/**
 * Initialize Thirdweb client from clientId. Use for testing local if you want to keep session
 *
 * @param {string} clientId - API client id
 * @returns {IThirdwebClient} - ThirdwebClient
 */
export const createThirdwebClientWithClientId = (
    clientId: string,
): IThirdwebClient => {
    return createThirdwebClient({
        clientId: clientId,
    });
};
/**
 * Initialize Thirdweb client from secretKey. Use for the BE to bypass login
 *
 * @param {string} secretKey - API secret key
 * @returns {IThirdwebClient} - ThirdwebClient
 */
export function createThirdwebClientWithSecretKey(
    secretKey: string,
): IThirdwebClient {
    return createThirdwebClient({ secretKey });
}
