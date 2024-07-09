import { Config } from '../src/config';
import { SupportingChain } from '../src/type';

describe('Config Singleton', () => {
    let cfg: Config;

    beforeEach(() => {
        cfg = Config.getInstance({
            tokenAddress: '0x1cccf7FD91fc2fd984dcB4C38B4bE877a724f748',
            airdropAddress: '0x74E7AB220fc74A2A6a3B8Aa98Bb4Bb710d28d065',
            selectedChain: SupportingChain.SEPOLIA,
            extraGasOptions: {
                extraMaxPriorityFeePerGasPercentage: 0.5,
                extraGasPercentage: 1,
                extraOnRetryPercentage: 2,
            },
            thirdwebClientId: '',
            thirdwebClientSecret: '',
            debug: true,
        });
    });

    it('compare airdropAddress', () => {
        const result = cfg.getAirdropAddress();
        expect(result).toBe('0x74E7AB220fc74A2A6a3B8Aa98Bb4Bb710d28d065');
    });

    it('test builder', () => {
        cfg.setAirdropAddress('x000000000000000');
        const result = cfg.getAirdropAddress();
        expect(result).toBe('x000000000000000');
    });
});
