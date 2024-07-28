/**
 * Predefined error message in our sdk to let client can handle accordingly
 * */
export const ALREADY_SUBMITTED_SKIP_TRANSACTION = {
    errorCode: 1,
    errorMessage:
        'Already submitted on-chain. Skip this transaction to save your cost',
} as const;

/**
 * Default Generic error message not defined yet
 * */
export const GENERIC_ERROR = {
    errorCode: 100,
    errorMessage:
        'Already submitted on-chain. Skip this transaction to save your cost',
} as const;
