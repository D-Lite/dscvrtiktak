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
import Link from "next/link";


type ResultStatus = "idle" | "success" | "failed" | "skipped"

interface SteptwoProps {
  opponent: string;
  amount: string,
  setAmount: (amount: string) => void,
  setResult: (status: ResultStatus) => void
}

const Steptwo: React.FC<SteptwoProps> = ({ opponent, setResult, amount, setAmount }) => {
    const wallet = useWallet();
    const { publicKey } = wallet;
    const { banker } = siteConfig;

    const [loading, setLoading] = useState(false)
    const [signature, setSignature] = useState("")

    const umi = createUmi('https://api.devnet.solana.com/').use(mplToolbox());
    if(!publicKey) {
        const signer = generateSigner(umi);
        umi.use(signerIdentity(signer));
    } else {
        umi.use(walletAdapterIdentity(wallet));
    }

    const submitTransaction = async () => {
        if (!publicKey) throw new WalletNotConnectedError()
    
            try {
                setLoading(true)
                setResult("idle")
                setSignature("")

                const destination =  fromWeb3JsPublicKey(new PublicKey(banker));


                let builder = transactionBuilder()
                    .add(transferSol(umi, { amount: sol(parseFloat(amount)), destination }))
                    .sendAndConfirm(umi, { send: { skipPreflight: true } });

                setSignature(base58.deserialize((await builder).signature)[0])

                setResult("success")
              } catch (error) {
                console.error(error)
                setResult("failed")
              } finally {
                setLoading(false)
              }
        }

    return (
        <div className="flex gap-10 flex-col">
            <div className="flex w-full items-center gap-5">
                <Input fullWidth type="number" className="border border-black" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
                <Button variant="solid2" fullWidth loading={loading} disabled={!banker || !amount} onClick={submitTransaction}>
                    Stake ahead of the game
                </Button>
            </div>
            { signature.length > 1 && 
                <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} 
                    className="h-8 bg-orange-300 text-blue px-3 underline">
                        Check transaction
                </a>
            }

            <Typography level="body2" color="secondary" className="text-center">
                <strong>Important Notice:</strong> The winner of the game will have the option to claim the staked amount. The system acts as a banker, securely holding the amount. Upon winning, the staked amount will be transferred directly to the winner's wallet. Please note that if you decide to skip this process, the staked amount will not be awarded to anyone.
            </Typography>
            <Button variant="outline"  onClick={() => setResult("skipped")}>
                    Skip
            </Button>
        </div>  
    )
}

export default Steptwo;