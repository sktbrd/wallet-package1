// app/wallet.tsx
"use client";

import { useState, useEffect } from "react";
import { initWallet, useTransfer } from "./hooks/useWallet"; // Corrected import to use the new hook
export default function Wallet() {
    const [asset, setAsset] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [destination, setDestination] = useState<string>(""); // Add destination state if required
    const { transfer, isTransferring, error } = useTransfer(); // Corrected to useTransfer

    ///useEff
    // start the context provider
    useEffect(() => {
        initWallet()
    }, []);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!asset || !amount) return;
        // Assume destination is required and add a field for it in your form.
        await transfer(asset, amount, destination); // Adjusted to include destination
    };

    return (
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

    );
}
