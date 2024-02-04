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
    ETH: any;
}
const getWalletBalances = async (walletMethods: any, pubkeys: any) => {
    const balancePromises = pubkeys.map((pubkey: any) => walletMethods.getBalance([{ pubkey }]));
    const balances = await Promise.all(balancePromises);
    return balances.map(balance => Number(balance[0].toFixed(balance[0].decimal)) || 0);
};

const getWalletByChain = async (keepkey: any, chain: any) => {
    if (!keepkey[chain]) return null;

    const walletMethods = keepkey[chain].walletMethods;
    const address = await walletMethods.getAddress();
    console.log("address: ", address);
    if (!address) return null;

    let balance = [];
    if (walletMethods.getPubkeys) {
        const pubkeys = await walletMethods.getPubkeys();
        const balances = await getWalletBalances(walletMethods, pubkeys);
        balance = [{ total: balances.reduce((a, b) => a + b, 0), address }];
    } else {
        balance = await walletMethods.getBalance([{ address }]);
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
            ETH: null,
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
        let keepkey: any = {};
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
            rpcUrls: {},
            addChain,
            config: { keepkeyConfig, covalentApiKey, ethplorerApiKey, utxoApiKey },
        }

        // Step 1: Invoke the outer function with the input object
        const connectFunction = walletKeepKey.wallet.connect(input)
        // Step 2: Invoke the inner function with chains and paths
        let kkApikey = await connectFunction(chains, paths);
        console.log("kkApikey: ", kkApikey);
        localStorage.setItem('keepkeyApiKey', kkApikey);
        //walletKeepKey
        // console.log("walletKeepKey: ",walletKeepKey.wallet)
        // console.log("connectFunction: ",connectFunction)
        console.log("keepkey: ", keepkey)

        //got balances
        for (let i = 0; i < chains.length; i++) {
            let chain = chains[i]
            let walletData: any = await getWalletByChain(keepkey, chain);
            console.log(chain + " walletData: ", walletData)
            // keepkey[chain].wallet.address = walletData.address
            keepkey[chain].wallet.balances = walletData.balance
            console.log(chain + " walletData: ", keepkey[chain].wallet)
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

    // Assuming setIsTransferring and setError are useState hooks from the component

    const validateTransferDetails = (keepkey: any, asset: string, amount: string, destination: string) => {
        if (!keepkey) return 'Wallet not initialized';
        if (!asset || !amount || !destination) return 'Invalid transfer details';
        // Additional validation logic can be added here
        return '';
    };

    const transfer = async (keepkey: any, asset: string, amount: string, destination: string) => {
        const validationError = validateTransferDetails(keepkey, asset, amount, destination);
        if (validationError) {
            setError(validationError);
            setIsTransferring(false);
            return;
        }

        setIsTransferring(true);
        setError(null); // Reset any previous error

        try {
            const assetValue = AssetValue.fromStringSync(`${asset}.${asset}`, parseFloat(amount));
            const sendPayload = {
                assetValue,
                memo: '', // Consider if memo needs to be dynamic or configurable
                recipient: destination,
            };

            const txHash = await keepkey.transfer(sendPayload);
            // Optionally, handle the success case, e.g., update UI or state to reflect the successful transfer
        } catch (e: any) {
            setError(e.message || "An error occurred during the transfer.");
        } finally {
            setIsTransferring(false);
        }
    };

    return { transfer, isTransferring, error };
};
