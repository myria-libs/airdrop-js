import { ConfigOptions } from './type';
export class Config {
    private static instance: Config;
    public tokenAddress: string;
    public airdropAddress: string;
    public selectedChain: string;
    public extraGasParams: string;
    public thirdwebClientId: string;
    public debug: boolean;

    constructor(options: ConfigOptions) {
        this.tokenAddress = options.tokenAddress;
        this.airdropAddress = options.airdropAddress;
        this.selectedChain = options.selectedChain;
        this.extraGasParams = options.extraGasParams;
        this.thirdwebClientId = options.thirdwebClientId;
        this.debug = options.debug;
    }

    public static getInstance(configOptions: ConfigOptions): Config {
        if (!Config.instance) {
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
    setSelectedChain(selectedChain: string): Config {
        this.selectedChain = selectedChain;
        return this;
    }
    setThirdwebClientId(thirdwebClientId: string): Config {
        this.thirdwebClientId = thirdwebClientId;
        return this;
    }
    setDebug(debug: boolean): Config {
        this.debug = debug;
        return this;
    }
}
