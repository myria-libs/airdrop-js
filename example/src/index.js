import * as AirDrop from '@myria/airdrop-js';

function getThirdwebContract(
    apiSecretKey,
    tokenAddress,
    airdropAddress,
    selectedChain,
) {
    const { getThirdwebContract } = AirDrop.Transaction;
    const { createThirdwebClientWithSecretKey } = AirDrop.Client;
    console.log('[getThirdwebContract]: apiSecretKey = ' + apiSecretKey);
    const client = createThirdwebClientWithSecretKey(apiSecretKey);
    // 1. Get token contract use to airdrop
    const tokenContract = getThirdwebContract(
        tokenAddress,
        client,
        selectedChain,
    );
    console.log(
        '[getThirdwebContract]: tokenContract = ' +
            JSON.stringify(tokenContract),
    );
    // 2. Get airdrop contract
    const airdropContract = getThirdwebContract(
        airdropAddress,
        client,
        selectedChain,
    );
    console.log(
        '[getThirdwebContract]: airdropContract = ' +
            JSON.stringify(airdropContract),
    );
    return {
        thirdwebClient: client,
        tokenContract,
        airdropContract,
    };
}

async function generateMerkleRoot(
    snapshotWhitelist,
    airdropContract,
    tokenAddress,
) {
    const { generateMerkleTreeInfoERC20ForWhitelist } = AirDrop.Transaction;
    const { merkleRoot, snapshotUri } =
        await generateMerkleTreeInfoERC20ForWhitelist(
            snapshotWhitelist,
            airdropContract,
            tokenAddress,
        );
    console.log('merkleRoot: ' + merkleRoot);
    console.log('snapshotUri: ' + snapshotUri);
}

/**
 * Configure variables. Replace with your credentials to test
 */
// Configure whitelist wallets available for claim with limit amount
const SNAPSHOT_WHITELIST = [
    {
        recipient: '0x9E468DC850CC2B91a2C6e7eb5418088C7242b894',
        amount: 1,
    },
    {
        recipient: '0xeF9Dc3DCE1673A725774342851a3C9fC12EDA694',
        amount: 1,
    },
];
// Retrieve via: https://thirdweb.com/dashboard/settings/api-keys
const THIRD_WEB_CLIENT_SECRETE =
    'tGzGcXEEIW9ooVydHd79JUfStwJ8BMnoyGKcD5tpV1g1Kn-ypAcOX4ulbn-dV4F7QZXttffAEZabanAHjJp83g';
// Retrieve via: https://thirdweb.com/dashboard/contracts/deploy
const TOKEN_CONTRACT_ADDRESS = '0x1cccf7FD91fc2fd984dcB4C38B4bE877a724f748';
const AIRDROP_CONTRACT_ADDRESS = '0x74E7AB220fc74A2A6a3B8Aa98Bb4Bb710d28d065';
// Group complex initialize config our variables to make it simpler
const config = AirDrop.Config.getInstance()
    .setTokenAddress(TOKEN_CONTRACT_ADDRESS)
    .setAirdropAddress(AIRDROP_CONTRACT_ADDRESS)
    .setThirdwebClientSecret(THIRD_WEB_CLIENT_SECRETE)
    .setSelectedChain(AirDrop.Type.SupportingChain.SEPOLIA)
    .setDebug(true);

// Execute functions for testing
const { airdropContract } = getThirdwebContract(
    config.getThirdwebClientSecret(),
    config.getTokenAddress(),
    config.getAirdropAddress(),
    config.getSelectedChain(),
);
generateMerkleRoot(SNAPSHOT_WHITELIST, airdropContract, config.tokenAddress);
