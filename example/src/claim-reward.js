import { Client, Transaction, Type, Wallet } from '@myria/airdrop-js';
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
    const userClaimingWalletAddress = process.env.USER_WALLET_ID; // User role Wallet
    const ethPrivateKey = process.env.USER_ETH_PRIVATE_KEY; // User role

    // Thirdweb
    const claimTokenAddress = process.env.MYRIA_CLAIM_TOKEN_ADDRESS;
    const airDropTokenAddress = process.env.AIR_DROP_TOKEN_ADDRESS;
    const apiThirdwebSecretKey = process.env.THIRD_WEB_SECRET_KEY;
    const selectedChain = Type.SupportingChain.SEPOLIA;

    // Myria
    const claimingLeaderboardId = Number(process.env.LEADERBOARD_ID);
    const myriaClientApiKey = process.env.X_API_KEY;
    const myriaPrivateStarkKey = process.env.MYRIA_PRIVATE_STARK_KEY;
    const myriaPublicStarkKey = process.env.MYRIA_PUBLIC_STARK_KEY;

    // 1. Fetching Myria's Available rewards
    const res = await resourceApiService.get(
        `/v1/rewards/by-user/${userClaimingWalletAddress}`,
        { leaderboardId: claimingLeaderboardId },
        {
            'x-api-key': myriaClientApiKey,
        },
    );
    const { items } = res.data.data;
    const rewardIds = items.map((i) => i.reward.id);
    console.log('---->rewardIds', rewardIds);

    // 2. Fetching claim info by invoking Myria's Pre-claim
    // Build signature
    let timestamp = new Date().getTime();
    // User role (End user) info
    let signatureResult = Signature.generateHeaderSignatureFromTimestamp(
        myriaPrivateStarkKey,
        myriaPublicStarkKey,
        timestamp,
        `/v1/rewards/pre-claim/by-user/${userClaimingWalletAddress}`,
    );
    const resPreClaim = await resourceApiService.patch(
        `/v1/rewards/pre-claim/by-user/${userClaimingWalletAddress}`,
        {
            leaderboardId: claimingLeaderboardId,
            rewardIds,
        },
        {
            'x-api-key': myriaClientApiKey,
            'x-signature': signatureResult['x-signature'],
            'x-timestamp': signatureResult['x-timestamp'].toString(),
            'Stark-Key': signatureResult['stark-key'],
        },
    );

    // 3. Invoke on-chain claim with Ethereum account
    const { getThirdwebContract } = Transaction;
    const { createThirdwebClientWithSecretKey } = Client;

    console.log(
        '[getThirdwebContract]: apiSecretKey = ' + apiThirdwebSecretKey,
    );
    const client = createThirdwebClientWithSecretKey(apiThirdwebSecretKey);

    console.log('---> client', JSON.stringify(client));

    const { privateKeyToAccount } = Wallet;
    const endUserAccount = privateKeyToAccount({
        client,
        privateKey: ethPrivateKey,
    });
    console.log('endUserAccount', JSON.stringify(endUserAccount));
    const { address: addressUserClaim } = endUserAccount;
    // Claim Air
    // 2. Get airdrop contract
    const airdropContract = getThirdwebContract(
        airDropTokenAddress,
        client,
        selectedChain,
    );
    console.log(
        '[getThirdwebContract]: airdropContract = ' +
            JSON.stringify(airdropContract),
    );
    let transactionReceipt;
    let errorMessage;
    try {
        transactionReceipt = await Transaction.claimAirdropToken(
            claimTokenAddress, // MyriaTestToken
            endUserAccount, //
            airdropContract,
        );
        console.log(JSON.stringify(transactionReceipt));
    } catch (error) {
        errorMessage = error.message;
        console.log('--->>>>>', JSON.stringify(error));
    }

    // 4. Post-claim: Sync on-chain with Myria's service
    const signatureResultPostClaim =
        Signature.generateHeaderSignatureFromTimestamp(
            myriaPrivateStarkKey,
            myriaPublicStarkKey,
            timestamp,
            `/v1/rewards/post-claim/by-user/${userClaimingWalletAddress}`,
        );
    const transactionHash = transactionReceipt
        ? transactionReceipt.transactionHash
        : undefined;
    const payloadPostClaim = {
        rewardIds,
    };
    if (transactionHash) {
        // submit the transactionHash to map as CLAIMED
        payloadPostClaim['transactionHash'] = transactionHash;
    } else {
        // submit with error; to revert status to AVAILABLE
        payloadPostClaim['errorMessage'] = errorMessage || 'Unknown';
    }
    // Pre claim
    const resPostClaim = await resourceApiService.patch(
        `/v1/rewards/post-claim/by-user/${userClaimingWalletAddress}`,
        payloadPostClaim,
        {
            'x-api-key': myriaClientApiKey,
            'x-signature': signatureResultPostClaim['x-signature'],
            'x-timestamp': signatureResultPostClaim['x-timestamp'].toString(),
            'Stark-Key': signatureResultPostClaim['stark-key'],
        },
    );
    console.log('-->resPostClaim', resPostClaim.data);
})();
