// hooks/useCryptoTransfer.ts
import { useState, useEffect } from 'react';
//@ts-ignore
import { getPaths } from '@pioneer-platform/pioneer-coins';
//@ts-ignore
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

const getWalletByChain = async (keepkey:any, chain:any) => {
    if (!keepkey[chain]) return null;

    const walletMethods = keepkey[chain].walletMethods;
    const address = await walletMethods.getAddress();
    if (!address) return null;

    let balance = [];
    if (walletMethods.getPubkeys) {
        const pubkeys = await walletMethods.getPubkeys();
        for (const pubkey of pubkeys) {
            const pubkeyBalance = await walletMethods.getBalance([{ pubkey }]);
            balance.push(Number(pubkeyBalance[0].toFixed(pubkeyBalance[0].decimal)) || 0);
        }
        balance = [{ total: balance.reduce((a, b) => a + b, 0), address }];
    } else {
        balance = await walletMethods.getBalance([{address}]);
    }

    return { address, balance };
};


export const initWallet = async (): Promise<KeepKeyWallet> => {
    try {
        const chains = ['BTC', 'ETH']; // Example chains
        // let chains =  [
        //     'ARB',  'AVAX', 'BNB',
        //     'BSC',  'BTC',  'BCH',
        //     'GAIA', 'OSMO', 'XRP',
        //     'DOGE', 'DASH', 'ETH',
        //     'LTC',  'OP',   'MATIC',
        //     'THOR'
        // ]
        const { keepkeyWallet } = await import('@coinmasters/wallet-keepkey');
        const walletKeepKey: KeepKeyWallet = {
            type: 'KEEPKEY',
            icon: 'https://pioneers.dev/coins/keepkey.png',
            chains,
            wallet: keepkeyWallet,
            status: 'offline',
            isConnected: false,
        };

        const allByCaip = chains.map((chainStr) => {
            const chain = getChainEnumValue(chainStr);
            if (chain) {
                return ChainToNetworkId[chain];
            }
            return undefined;
        });
        const paths = getPaths(allByCaip);
        console.log('paths: ', paths);
        let keepkey:any = {};
        // @ts-ignore
        // Implement the addChain function with additional logging
        function addChain({ chain, walletMethods, wallet }) {
            console.log(`Adding chain: ${chain}`);
            console.log(`Chain data:`, { chain, walletMethods, wallet });
            keepkey[chain] = {
                walletMethods,
                wallet
            };
        }

        let keepkeyConfig = {
            apiKey: localStorage.getItem('keepkeyApiKey') || '123',
            pairingInfo: {
                name: "int-test-package",
                imageUrl: "",
                basePath: 'http://localhost:1646/spec/swagger.json',
                url: 'http://localhost:1646',
            }
        }
        let covalentApiKey = 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q'
        let ethplorerApiKey = 'freekey'
        let utxoApiKey = 'B_s9XK926uwmQSGTDEcZB3vSAmt5t2'
        let input = {
            apis: {},
            rpcUrls:{},
            addChain,
            config: { keepkeyConfig, covalentApiKey, ethplorerApiKey, utxoApiKey },
        }
        
        // Step 1: Invoke the outer function with the input object
        const connectFunction = walletKeepKey.wallet.connect(input);

        // Step 2: Invoke the inner function with chains and paths
        let kkApikey = await connectFunction(chains, paths);
        console.log("kkApikey: ", kkApikey);
        localStorage.setItem('keepkeyApiKey', kkApikey);
        //walletKeepKey
        // console.log("walletKeepKey: ",walletKeepKey.wallet)
        // console.log("connectFunction: ",connectFunction)
        console.log("keepkey: ",keepkey)

        //got balances
        for(let i = 0; i < chains.length; i++) {
            let chain = chains[i]
            let walletData:any = await getWalletByChain(keepkey, chain);
            console.log(chain+ " walletData: ",walletData)
            // keepkey[chain].wallet.address = walletData.address
            // keepkey[chain].wallet.balances = walletData.balance
        }

        // Additional setup or connection logic here

        return keepkey;
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

            console.log(paths);

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
