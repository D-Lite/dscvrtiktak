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


type ResultStatus = "idle" | "success" | "failed" | "skipped"

interface SteptwoProps {
  opponent: string;
  player: string;
  setResult: (status: ResultStatus) => void
}

const Steptwo: React.FC<SteptwoProps> = ({ opponent, setResult, player }) => {
    const wallet = useWallet();
    const { publicKey } = wallet;



    const [amount, setAmount] = useState("")
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

                const destination =  fromWeb3JsPublicKey(new PublicKey(opponent));


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
        <div>
            <div className="flex w-full items-center gap-5">
            <Input fullWidth type="number" className="border border-black" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
                <Button variant="solid2" fullWidth loading={loading} disabled={!opponent || !amount} onClick={submitTransaction}>
                    Stake ahead of the game
                </Button>
        </div>
            <Button variant="solid2"  onClick={() => setResult("skipped")}>
                    Skip
            </Button>
        </div>  
    )
}

export default Steptwo;