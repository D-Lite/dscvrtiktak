import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplToolbox, transferSol } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, signerIdentity, sol, transactionBuilder } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { siteConfig } from "@/config/site";
import { Typography } from "./ui/typography";

type ResultStatus = "idle" | "success" | "failed" | "skipped"

interface SteptwoProps {
  opponent: string;
  amount: string,
  setAmount: (amount: string) => void,
  setResult: (status: ResultStatus) => void
}

const Steptwo: React.FC<SteptwoProps> = ({ opponent, setResult, amount, setAmount }) => {

    return (
        <div className="flex gap-10 flex-col">
            <div className="flex w-full items-center gap-5">
                <Input fullWidth type="number" className="border border-black" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
            </div>

            <Typography level="body2" color="secondary" className="text-center">
                <strong>Important Notice:</strong> By staking an amount, you are committing to pay whoever wins the game. If you lose to the system, you will also be paying the system. However, you have the option to skip this process if you change your mind. Please note that if you do skip, the staked amount will not be awarded to anyone.
            </Typography>
            <Button variant="outline"  onClick={() => setResult("skipped")}>
                    Skip
            </Button>
        </div>  
    )
}

export default Steptwo;