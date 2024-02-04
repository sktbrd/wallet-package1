// app/wallet.tsx
"use client";

import { useState, useEffect } from "react";
import { initWallet, useTransfer } from "./hooks/useWallet"; // Corrected import to use the new hook


export default function Wallet() {
    const [asset, setAsset] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [keepkey, setKeepkey] = useState<any>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null); // Add wallet address state
    const [destination, setDestination] = useState<string>(""); // Add destination state if required
    const { transfer, isTransferring, error } = useTransfer(); // Corrected to useTransfer
    // start the context provider
    useEffect(() => {
        initWallet()
    }, []);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!asset || !amount || !destination) return;

        await transfer(keepkey, asset, amount, destination);
    };


    useEffect(() => {
        const init = async () => {
            try {
                let keepkey = await initWallet();
                setKeepkey(keepkey);
                // Assuming you want the address for the ETH wallet
                if (keepkey && keepkey.ETH.address) {
                    const walletData = await keepkey.ETH.walletMethods.getAddress();
                    console.log("walletData: ", walletData);
                    setWalletAddress(walletData); // Set the fetched wallet address
                    console.log("walletAddress: ", walletAddress);
                }
            } catch (error) {
                console.error("Failed to initialize wallet", error);
            }
        };
        init();
    }, []);

    return (
        <div>
            {/* Display wallet address if available */}

            <p>Wallet Address: {walletAddress}</p>

            <form className="formulary" onSubmit={handleTransfer}>
                <select style={{ color: "black" }} value={asset} onChange={(e) => setAsset(e.target.value)}>
                    <option value="">Select Asset</option>
                    <option value="BTC">Bitcoin</option>
                    <option value="ETH">Ethereum</option>
                    {/* Add more assets as needed */}
                </select>

                <div style={{ color: "black" }}>
                    <input
                        type="text"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <br />
                <div style={{ color: "black" }}>
                    <input
                        type="text"
                        placeholder="Destination Address"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                </div>

                <button className="sendButton" type="submit" disabled={isTransferring}
                    onClick={handleTransfer}>
                    {isTransferring ? "Transferring..." : "Transfer"}
                </button>
                {error && <p>Error: {error}</p>}

            </form>
        </div>
    );
}
