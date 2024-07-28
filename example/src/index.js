import { Client, Config, Transaction, Type, Wallet } from '@myria/airdrop-js';

/**
 * Retrieve the necessary variables
 */
function getThirdwebContract(
    apiSecretKey,
    tokenAddress,
    airdropAddress,
    selectedChain,
) {
    const { getThirdwebContract } = Transaction;
    const { createThirdwebClientWithSecretKey } = Client;
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
        client,
        tokenContract,
        airdropContract,
    };
}

/**
 * Myria(Provider): who provides tracking user’s progress joining the campaign generate Merkle tree by calculate the eligible wallets as whitelist
 *
 * @param {WhiteListItem[]} snapshotWhitelist - The list of items is available for airdrop.
 * @param {Address} airdropAddress - The Airdrop smart contract address.
 * @param {Address} tokenAddress - The token smart contract address to claim.
 */
async function generateMerkleRootByMyria(
    snapshotWhitelist,
    airdropAddress,
    tokenAddress,
) {
    // retrieve the necessary variables
    const { airdropContract } = getThirdwebContract(
        Config.getInstance().getThirdwebClientSecret(),
        tokenAddress,
        airdropAddress,
        Config.getInstance().getSelectedChain(),
    );
    const { generateMerkleTreeInfoERC20ForWhitelist } = Transaction;
    const { merkleRoot, snapshotUri } =
        await generateMerkleTreeInfoERC20ForWhitelist(
            snapshotWhitelist,
            airdropContract,
            tokenAddress,
        );
    return {
        merkleRoot,
        snapshotUri,
    };
}

/**
 * Partner(Consumer): Who is the organizer of the campaign and allocates budget for Airdrop
 *
 * @param {string} merkleRoot - The generated merkleRoot from whitelist @see {@link generateMerkleRootByMyria} pass by Myria
 * @param {string} snapshotUri - The generated snapshotUri from whitelist @see {@link generateMerkleRootByMyria} pass by Myria
 * @param {string} tokenAddress - The token contract address to airdrop pass by Myria
 * @param {string} airdropAddress - The Airdrop contract address pass by Myria
 * @param {number} totalAmount - The total airdrop amount in ether format pass by Myria
 */
async function approveWhitelistAndAllowanceByPartner(
    merkleRoot,
    snapshotUri,
    tokenAddress,
    airdropAddress,
    totalAmount,
) {
    // 1. Partner plugs in necessary configs (credentials)
    // partner retrieve the necessary variable
    const { airdropContract, tokenContract, client } = getThirdwebContract(
        Config.getInstance().getThirdwebClientSecret(),
        tokenAddress,
        airdropAddress,
        Config.getInstance().getSelectedChain(),
    );
    // partner inject ETH_PRIVATE_KEY from their system
    const { privateKeyToAccount } = Wallet;
    const ownerContractAccount = privateKeyToAccount({
        client,
        privateKey: ETH_PRIVATE_KEY,
    });
    // 2. Partner invokes `airdrop-js` to perform approve whitelist and allowance on-chain
    const { approveWhitelistAndAllowance } = Transaction;

    // Invoke a wrapper function to simplify for our partner by executing all required on-chain transactions. Reference the implementation of approveWhitelistAndAllowance function to get more insight
    const approveWhitelistAndAllowanceResult =
        await approveWhitelistAndAllowance(
            ownerContractAccount,
            merkleRoot,
            snapshotUri,
            airdropContract,
            tokenContract,
            totalAmount,
            {
                retries: 3,
                delay: 1000,
            },
            {
                extraMaxPriorityFeePerGasPercentage:
                    Type.DEFAULT_EXTRA_PRIORITY_TIP_PERCENTAGE,
                extraGasPercentage: Type.DEFAULT_EXTRA_GAS_PERCENTAGE,
                extraOnRetryPercentage: Type.DEFAULT_EXTRA_ON_RETRY_PERCENTAGE,
            },
        );

    console.log(
        '[approveWhitelistAndAllowanceByPartner] approveWhitelistAndAllowanceResult = ' +
            JSON.stringify(approveWhitelistAndAllowanceResult),
    );
    const { snapshotResult, merkleRootResult, approveAllowanceResult } =
        approveWhitelistAndAllowanceResult;
    if (
        snapshotResult.errorCode ==
        Type.ErrorCode.ALREADY_SUBMITTED_SKIP_TRANSACTION.errorCode
    ) {
        console.log(
            ' [approveWhitelistAndAllowanceByPartner]>[snapshotResult] Consider as success as previous submitting with transactionHash. Consumer SHOULD store it',
        );
    }
    if (
        merkleRootResult.errorCode ==
        Type.ErrorCode.ALREADY_SUBMITTED_SKIP_TRANSACTION.errorCode
    ) {
        console.log(
            ' [approveWhitelistAndAllowanceByPartner]>[merkleRootResult] Consider as success as previous submitting with transactionHash. Consumer SHOULD store it',
        );
    }
    if (
        approveAllowanceResult.errorCode ==
        Type.ErrorCode.ALREADY_SUBMITTED_SKIP_TRANSACTION.errorCode
    ) {
        console.log(
            ' [approveWhitelistAndAllowanceByPartner]> [approveAllowanceResult] Consider as success as previous submitting with transactionHash. Consumer SHOULD store it',
        );
    }

    return {
        snapshotResult,
        merkleRootResult,
        approveAllowanceResult,
    };
}

/**
 * Demo E2E for BE integration include generating merkleRoot and approve whitelist and allowance
 *
 * @param {WhiteListItem[]} snapshotWhitelist - The list of items is available for airdrop.list
 * @param {Address} airdropAddress - The Airdrop smart contract address.s
 * @param {Address} tokenAddress - The token smart contract address to claim.
 * @param {number} totalAmount - The total airdrop amount in ether format
 */
async function generateAndApproveWhitelistAirdropE2E(
    snapshotWhitelist,
    airdropAddress,
    tokenAddress,
    totalAmount,
) {
    // 1. Myria validates to produce the whitelist and then trigger generating merkleTree and then invoke partner to get an approval
    const generateResult = await generateMerkleRootByMyria(
        snapshotWhitelist,
        airdropAddress,
        tokenAddress,
    );
    console.log('Myria generate result' + JSON.stringify(generateResult));

    // 2. Partner receives request from Myria and then approve by invoking the following function
    const approveResult = await approveWhitelistAndAllowanceByPartner(
        generateResult.merkleRoot,
        generateResult.snapshotUri,
        tokenAddress,
        airdropAddress,
        totalAmount,
    );
    console.log(
        '1️⃣[partner] first approve result = ' + JSON.stringify(approveResult),
    );

    // Simulate safe retry when partial success some steps need to retry. SHOULD not submit on-chain transactions again to reduce our cost
    const duplicatedApproveResult = await approveWhitelistAndAllowanceByPartner(
        generateResult.merkleRoot,
        generateResult.snapshotUri,
        tokenAddress,
        airdropAddress,
        totalAmount,
    );
    console.log(
        '2️⃣[partner] retry approve result = ' +
            JSON.stringify(duplicatedApproveResult),
    );
}

/**
 * Configure variables. Replace with your credentials to test, please. Otherwise, They can be deprecated soon, please
 */
// Configure whitelist wallets available for claim with limit amount
// Replace with your wallets
const SNAPSHOT_WHITELIST = [
    {
        recipient: '0x9E468DC850CC2B91a2C6e7eb5418088C7242b894',
        amount: 3,
    },
    {
        recipient: '0xeF9Dc3DCE1673A725774342851a3C9fC12EDA694',
        amount: 3,
    },
];
const TOTAL_TOKEN_CLAIMABLE_AMOUNT = SNAPSHOT_WHITELIST.reduce(
    (accumulator, currentValue) => accumulator + currentValue.amount,
    0,
);
// Replace with your api secret key. Default value might be deprecated soon
// Retrieve via: https://thirdweb.com/dashboard/settings/api-keys
const THIRD_WEB_CLIENT_SECRETE =
    'tGzGcXEEIW9ooVydHd79JUfStwJ8BMnoyGKcD5tpV1g1Kn-ypAcOX4ulbn-dV4F7QZXttffAEZabanAHjJp83g';
// Replace with your deployed smart contract addresses
// Retrieve via: https://thirdweb.com/dashboard/contracts/deploy
const TOKEN_CONTRACT_ADDRESS = '0x1cccf7FD91fc2fd984dcB4C38B4bE877a724f748';
const AIRDROP_CONTRACT_ADDRESS = '0x74E7AB220fc74A2A6a3B8Aa98Bb4Bb710d28d065';
// Inject your ETH private key when start
// ETH_PRIVATE_KEY=... npm run start
const ETH_PRIVATE_KEY =
    process.env.ETH_PRIVATE_KEY || 'replace with your key to test local';
// Group complex initialize config our variables to make it simpler
const config = Config.getInstance({})
    .setTokenAddress(TOKEN_CONTRACT_ADDRESS)
    .setAirdropAddress(AIRDROP_CONTRACT_ADDRESS)
    .setThirdwebClientSecret(THIRD_WEB_CLIENT_SECRETE)
    .setSelectedChain(Type.SupportingChain.SEPOLIA)
    .setDebug(true);

// Execute functions for testing
generateAndApproveWhitelistAirdropE2E(
    SNAPSHOT_WHITELIST,
    config.getAirdropAddress(),
    config.getTokenAddress(),
    TOTAL_TOKEN_CLAIMABLE_AMOUNT,
);
