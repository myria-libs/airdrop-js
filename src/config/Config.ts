/**
 * Config module.
 * @module Config
 */
import { ConfigOptions, ExtraGasOptions, SupportingChain } from '../type';
/**
 * Centralize your configuration in Config class
 * @class
 */
export class Config {
    private static instance: Config;
    private tokenAddress: string | undefined;
    private airdropAddress: string | undefined;
    private selectedChain: SupportingChain | undefined;
    private extraGasOptions: ExtraGasOptions | undefined;
    private thirdwebClientId: string | undefined;
    private thirdwebClientSecret: string | undefined;
    private debug: boolean | undefined;

    /**
     * private constructor follow singleton design pattern
     *
     *  @param {ConfigOptions} options - optional config object to initialize once if you want
     */
    private constructor(options?: ConfigOptions) {
        this.tokenAddress = options?.tokenAddress;
        this.airdropAddress = options?.airdropAddress;
        this.selectedChain = options?.selectedChain;
        this.extraGasOptions = options?.extraGasOptions;
        this.thirdwebClientId = options?.thirdwebClientId;
        this.thirdwebClientSecret = options?.thirdwebClientSecret;
        this.debug = options?.debug;
    }

    /**
     * Single entry point to let consumer initial or access the shared access with singleton pattern
     *
     *  @param {ConfigOptions} configOptions - optional config object to initialize once if you want
     * @returns {Config} - Return the exiting or create a new one
     */
    public static getInstance(configOptions?: ConfigOptions): Config {
        if (!Config.instance) {
            Config.instance = new Config(configOptions);
        }
        return Config.instance;
    }

    // Setters
    /**
     * Set the tokenAddress
     *  @param {string} tokenAddress - The token smart contract address
     * @returns {Config} - Return the current instance
     */
    setTokenAddress(tokenAddress: string): Config {
        this.tokenAddress = tokenAddress;
        return this;
    }

    /**
     * Set the airdropAddress
     *  @param {string} airdropAddress - The airdrop smart contract address
     * @returns {Config} - Return the current instance
     */
    setAirdropAddress(airdropAddress: string): Config {
        this.airdropAddress = airdropAddress;
        return this;
    }

    /**
     * Set the selectedChain
     *  @param {SupportingChain} selectedChain - The selected chain
     * @returns {Config} - Return the current instance
     */
    setSelectedChain(selectedChain: SupportingChain): Config {
        this.selectedChain = selectedChain;
        return this;
    }

    /**
     * Set the thirdwebClientId
     *  @param {string} thirdwebClientId - The thirdweb client id
     * @returns {Config} - Return the current instance
     */
    setThirdwebClientId(thirdwebClientId: string): Config {
        this.thirdwebClientId = thirdwebClientId;
        return this;
    }

    /**
     * Set the thirdwebClientSecret
     *  @param {string} thirdwebClientSecret - The thirdweb client secret key
     * @returns {Config} - Return the current instance
     */
    setThirdwebClientSecret(thirdwebClientSecret: string): Config {
        this.thirdwebClientSecret = thirdwebClientSecret;
        return this;
    }

    /**
     * Set the debug
     *  @param {boolean} debug - Whether turn on the log to debug or not
     * @returns {Config} - Return the current instance
     */
    setDebug(debug: boolean): Config {
        this.debug = debug;
        return this;
    }

    /**
     * Set the extraGasOptions
     *  @param {ExtraGasOptions} extraGasOptions - Configure the ExtraGasOptions when submitting a transaction
     * @returns {Config} - Return the current instance
     */
    setExtraGasOptions(extraGasOptions: ExtraGasOptions): Config {
        this.extraGasOptions = extraGasOptions;
        return this;
    }

    // Getters
    /**
     * Get the tokenAddress
     * @returns {string} - Return the current tokenAddress
     */
    getTokenAddress(): string | undefined {
        return this.tokenAddress;
    }

    /**
     * Get the airdropAddress
     * @returns {string} - Return the current airdropAddress
     */
    getAirdropAddress(): string | undefined {
        return this.airdropAddress;
    }

    /**
     * Get the extraGasOptions
     * @returns {ExtraGasOptions} - Return the current extraGasOptions
     */
    getExtraGasOptions(): ExtraGasOptions | undefined {
        return this.extraGasOptions;
    }

    /**
     * Get the selectedChain
     * @returns {SupportingChain} - Return the current selectedChain
     */
    getSelectedChain(): SupportingChain | undefined {
        return this.selectedChain;
    }

    /**
     * Get the thirdwebClientId
     * @returns {string} - Return the current thirdwebClientId
     */
    getThirdwebClientId(): string | undefined {
        return this.thirdwebClientId;
    }

    /**
     * Get the thirdwebClientSecret
     * @returns {string} - Return the current thirdwebClientSecret
     */
    getThirdwebClientSecret(): string | undefined {
        return this.thirdwebClientSecret;
    }

    /**
     * Get the debug
     * @returns {boolean} - Return the current debug mode
     */
    getDebug(): boolean | undefined {
        return this.debug;
    }
}
