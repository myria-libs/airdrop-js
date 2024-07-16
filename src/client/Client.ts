import { createThirdwebClient } from 'thirdweb';
import { IThirdwebClient } from '../type/ClientType';

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
// Use for testing local if you want to keep session
export const createThirdwebClientWithClientId = (
    clientId: string,
): IThirdwebClient => {
    return createThirdwebClient({
        clientId: clientId,
    });
};
// Use for the BE to bypass login with thirdweb cli to keep session
export function createThirdwebClientWithSecretKey(
    secretKey: string,
): IThirdwebClient {
    return createThirdwebClient({ secretKey });
}
