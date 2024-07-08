// TODO: Add config class to serve customize configuration

import { ConfigOptions } from './type';

// Apply Design patterns:
// Creational Design Patterns
// Singleton to ensure that a class has just a single instance: https://refactoring.guru/design-patterns/singleton
// Builder to construct complex objects step by step: https://refactoring.guru/design-patterns/builder
// - tokenAddress: Token Smart contract address
// - airdropAddress: Airdrop Smart contract address
// - selectedChain: type of SupportingChain
// - extraGasParams: type of ExtraGasParams
// - thirdwebClientId: retrieve from generating a thirdweb api key

export class Config {
    private static instance: Config;
    public tokenAddress: string;
    public airdropAddress: string;
    public selectedChain: string;
    public extraGasParams: string;
    public thirdwebClientId: string;
    public debug: boolean;

    private constructor(options: ConfigOptions) {
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
}
