// hooks/useCryptoTransfer.ts
import { useState, useEffect } from 'react';
import { getPaths } from '@pioneer-platform/pioneer-coins';
import { ChainToNetworkId, getChainEnumValue, availableChainsByWallet, WalletOption } from '@coinmasters/types';
import { AssetValue } from '@coinmasters/core';
import assert from 'assert';

interface KeepKeyWallet {
    type: string;
    icon: string;
    chains: string[];
    wallet: any;
    status: string;
    isConnected: boolean;
}

export const initWallet = async (): Promise<KeepKeyWallet> => {
    try {
        const chains = ['BTC', 'ETH']; // Example chains
        const { keepkeyWallet } = await import('@coinmasters/wallet-keepkey');
        const walletKeepKey: KeepKeyWallet = {
            type: 'KEEPKEY',
            icon: 'https://pioneers.dev/coins/keepkey.png',
            chains,
            wallet: keepkeyWallet,
            status: 'offline',
            isConnected: false,
        };

        const allByCaip = chains.map((chainStr) => ChainToNetworkId[getChainEnumValue(chainStr)]);
        const paths = getPaths(allByCaip);
        console.log('paths: ', paths);

        // Additional setup or connection logic here

        return walletKeepKey;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to initialize wallet');
    }
};

export const useTransfer = () => {
    const [isTransferring, setIsTransferring] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const transfer = async (asset: string, amount: string, destination: string) => {
        setIsTransferring(true);
        setError(null);

        try {
            const chain = getChainEnumValue(asset);
            assert(chain, "Invalid asset type");

            const networkId = ChainToNetworkId[chain];
            assert(networkId, "Unsupported chain for transfer");

            const paths = getPaths([networkId]);
            assert(paths.length > 0, "No available paths for transfer");

            // Simulated transfer logic
            console.log(`Transferred ${amount} of ${asset} to ${destination}`);
        } catch (e: any) {
            setError(e.message || "An error occurred during the transfer.");
        } finally {
            setIsTransferring(false);
        }
    };

    return { transfer, isTransferring, error };
};
