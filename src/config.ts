import { ConfigOptions, SupportingChain } from './type';
export class Config {
    private static instance: Config;
    private tokenAddress: string;
    private airdropAddress: string;
    private selectedChain: SupportingChain;
    private extraGasOptions: string;
    private thirdwebClientId: string;
    private thirdwebClientSecret: string;
    private debug: boolean;

    constructor(options: ConfigOptions) {
        this.tokenAddress = options.tokenAddress;
        this.airdropAddress = options.airdropAddress;
        this.selectedChain = options.selectedChain;
        this.extraGasOptions = options.extraGasOptions;
        this.thirdwebClientId = options.thirdwebClientId;
        this.thirdwebClientSecret = options.thirdwebClientSecret;
        this.debug = options.debug;
    }

    public static getInstance(configOptions?: ConfigOptions): Config {
        if (!Config.instance) {
            if (!configOptions) {
                throw new Error('The configuration should not empty');
            }
            Config.instance = new Config(configOptions);
        }
        return Config.instance;
    }

    setTokenAddress(tokenAddress: string): Config {
        this.tokenAddress = tokenAddress;
        return this;
    }
    setAirdropAddress(airdropAddress: string): Config {
        this.airdropAddress = airdropAddress;
        return this;
    }
    setSelectedChain(selectedChain: SupportingChain): Config {
        this.selectedChain = selectedChain;
        return this;
    }
    setThirdwebClientId(thirdwebClientId: string): Config {
        this.thirdwebClientId = thirdwebClientId;
        return this;
    }

    setThirdwebClientSecret(thirdwebClientSecret: string): Config {
        this.thirdwebClientSecret = thirdwebClientSecret;
        return this;
    }

    setDebug(debug: boolean): Config {
        this.debug = debug;
        return this;
    }
    getTokenAddress(): string {
        return this.tokenAddress;
    }

    getAirdropAddress(): string {
        return this.airdropAddress;
    }

    getExtraGasOptions(): string {
        return this.extraGasOptions;
    }

    getSelectedChain(): string {
        return this.selectedChain;
    }

    getThirdwebClientId(): string {
        return this.thirdwebClientId;
    }
    getThirdwebClientSecret(): string {
        return this.thirdwebClientSecret;
    }

    getDebug(): boolean {
        return this.debug;
    }
}
