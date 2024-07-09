import { ConfigOptions, ExtraGasOptions, SupportingChain } from './type';
export class Config {
    private static instance: Config;
    private tokenAddress: string | undefined;
    private airdropAddress: string | undefined;
    private selectedChain: SupportingChain | undefined;
    private extraGasOptions: ExtraGasOptions | undefined;
    private thirdwebClientId: string | undefined;
    private thirdwebClientSecret: string | undefined;
    private debug: boolean | undefined;

    constructor(options?: ConfigOptions) {
        this.tokenAddress = options?.tokenAddress;
        this.airdropAddress = options?.airdropAddress;
        this.selectedChain = options?.selectedChain;
        this.extraGasOptions = options?.extraGasOptions;
        this.thirdwebClientId = options?.thirdwebClientId;
        this.thirdwebClientSecret = options?.thirdwebClientSecret;
        this.debug = options?.debug;
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
    getTokenAddress(): string | undefined {
        return this.tokenAddress;
    }

    getAirdropAddress(): string | undefined {
        return this.airdropAddress;
    }

    getExtraGasOptions(): ExtraGasOptions | undefined {
        return this.extraGasOptions;
    }

    getSelectedChain(): string | undefined {
        return this.selectedChain;
    }

    getThirdwebClientId(): string | undefined {
        return this.thirdwebClientId;
    }
    getThirdwebClientSecret(): string | undefined {
        return this.thirdwebClientSecret;
    }

    getDebug(): boolean | undefined {
        return this.debug;
    }
}
