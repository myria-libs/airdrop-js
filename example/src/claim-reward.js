import { Transaction } from '@myria/airdrop-js';
import { API } from '@myria/api-request';
import { Signature } from '@myria/crypto-js';
require('dotenv').config()(async () => {
    const resourceApiService = new API.ResourceApiService({
        developerApiKey: '',
        clientApiKey: '',
        adminApiKey: '',
    });
    resourceApiService.setUrl(
        'https://staging.myriaverse-leaderboard-api.nonprod-myria.com',
    );
    const userId = process.env.USER_ID;
    const xApiKey = process.env.X_API_KEY;
    const xDevApiKey = process.env.X_DEV_API_KEY;
    const res = await resourceApiService.get(
        `/v1/rewards/by-user/${userId}`,
        { leaderboardId: 79 },
        {
            'x-api-developer-key': xDevApiKey,
            'x-api-key': xApiKey,
        },
    );
    // Build signature
    let timestamp = new Date().getTime();

    let signatureResult = Signature.generateHeaderSignatureFromTimestamp(
        process.env.VALID_PRIVATE_STARK_KEY,
        process.env.VALID_STARK_KEY,
        timestamp,
        `/v1/rewards/pre-claim/by-user/${userId}`,
    );
    // Pre claim
    const resPreClaim = await resourceApiService.post(
        `/v1/rewards/pre-claim/by-user/${userId}`,
        {
            leaderboardId: 0,
            rewardIds: ['string'],
        },
        {
            'x-api-developer-key': xDevApiKey,
            'x-api-key': xApiKey,
            'x-signature': signatureResult['x-signature'],
            'x-timestamp': signatureResult['x-timestamp'].toString(),
            'Stark-Key': signatureResult['stark-key'],
        },
    );
    // Claim Air
    const transactionReceipt = await Transaction.claimAirdropToken(
        tokenAddress,
        account,
        airdropContract,
    );

    signatureResult = Signature.generateHeaderSignatureFromTimestamp(
        VALID_PRIVATE_STARK_KEY,
        VALID_STARK_KEY,
        timestamp,
        `/v1/rewards/post-claim/by-user/${userId}`,
    );
    // Pre claim
    const resPostClaim = await resourceApiService.post(
        `/v1/rewards/post-claim/by-user/${userId}`,
        {
            rewardIds: ['string'],
            transactionHash: 'string',
            errorMessage: 'string',
        },
        {
            'x-api-developer-key': xDevApiKey,
            'x-api-key': xApiKey,
            'x-signature': signatureResult['x-signature'],
            'x-timestamp': signatureResult['x-timestamp'].toString(),
            'Stark-Key': signatureResult['stark-key'],
        },
    );
})();
