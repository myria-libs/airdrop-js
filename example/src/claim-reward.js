import { Client, Transaction, Wallet } from '@myria/airdrop-js';
import { API } from '@myria/api-request';
import { Signature } from '@myria/crypto-js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
    const resourceApiService = new API.ResourceApiService({
        developerApiKey: '',
        clientApiKey: '',
        adminApiKey: '',
    });

    resourceApiService.setUrl(
        'https://staging.myriaverse-leaderboard-api.nonprod-myria.com',
    );

    // End user developer
    const userWalletId = process.env.USER_WALLET_ID; // User role Wallet
    const xApiKey = process.env.X_API_KEY;

    const ethPrivateKey = process.env.USER_ETH_PRIVATE_KEY; // User role
    // Thirdweb
    const airDropTokenAddress = process.env.AIR_DROP_TOKEN_ADDRESS;
    const apiSecretKey = process.env.THIRD_WEB_SECRET_KEY;

    // Myria

    const privateStarkKey = process.env.MYRIA_PRIVATE_STARK_KEY;
    const publicStarkKey = process.env.MYRIA_PUBLIC_STARK_KEY;
    const myriaClaimTokenAddress = process.env.MYRIA_CLAIM_TOKEN_ADDRESS;

    const res = await resourceApiService.get(
        `/v1/rewards/by-user/${userWalletId}`,
        { leaderboardId: 189 },
        {
            'x-api-key': xApiKey,
        },
    );
    const { items } = res.data.data;
    const rewardIds = items.map((i) => i.reward.id);
    console.log('---->rewardIds', rewardIds);
    // Build signature
    let timestamp = new Date().getTime();
    // User role (End user) info
    let signatureResult = Signature.generateHeaderSignatureFromTimestamp(
        privateStarkKey,
        publicStarkKey,
        timestamp,
        `/v1/rewards/pre-claim/by-user/${userWalletId}`,
    );
    // Pre claim
    const resPreClaim = await resourceApiService.patch(
        `/v1/rewards/pre-claim/by-user/${userWalletId}`,
        {
            leaderboardId: 189,
            rewardIds,
        },
        {
            'x-api-key': xApiKey,
            'x-signature': signatureResult['x-signature'],
            'x-timestamp': signatureResult['x-timestamp'].toString(),
            'Stark-Key': signatureResult['stark-key'],
        },
    );

    const { getThirdwebContract } = Transaction;
    const { createThirdwebClientWithSecretKey } = Client;

    console.log('[getThirdwebContract]: apiSecretKey = ' + apiSecretKey);
    const client = createThirdwebClientWithSecretKey(apiSecretKey);

    console.log('---> client', JSON.stringify(client));

    const { privateKeyToAccount } = Wallet;
    const ownerContractAccount = privateKeyToAccount({
        client,
        privateKey: ethPrivateKey,
    });
    console.log('ownerContractAccount', JSON.stringify(ownerContractAccount));
    const { address: addressUserClaim } = ownerContractAccount;
    // Claim Air
    // 2. Get airdrop contract
    const airdropContract = getThirdwebContract(
        airDropTokenAddress,
        client,
        'sepolia',
    );
    console.log(
        '[getThirdwebContract]: airdropContract = ' +
            JSON.stringify(airdropContract),
    );
    try {
        const transactionReceipt = await Transaction.claimAirdropToken(
            myriaClaimTokenAddress, // MyriaTestToken
            addressUserClaim.toLocaleLowerCase(), //
            airdropContract,
        );
        console.log(JSON.stringify(transactionReceipt));
    } catch (error) {
        console.log('--->>>>>', JSON.stringify(error));
    }

    signatureResultPostClaim = Signature.generateHeaderSignatureFromTimestamp(
        VALID_PRIVATE_STARK_KEY,
        VALID_STARK_KEY,
        timestamp,
        `/v1/rewards/post-claim/by-user/${userWalletId}`,
    );
    // Pre claim
    const resPostClaim = await resourceApiService.post(
        `/v1/rewards/post-claim/by-user/${userWalletId}`,
        {
            rewardIds: ['string'],
            transactionHash: 'string',
            errorMessage: 'string',
        },
        {
            'x-api-key': xApiKey,
            'x-signature': signatureResultPostClaim['x-signature'],
            'x-timestamp': signatureResultPostClaim['x-timestamp'].toString(),
            'Stark-Key': signatureResultPostClaim['stark-key'],
        },
    );
    console.log('-->resPostClaim', resPostClaim.data);
})();
