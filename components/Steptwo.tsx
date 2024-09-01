import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type ResultStatus = "idle" | "success" | "failed" | "skipped"

interface SteptwoProps {
  opponent: string;
  setResult: (status: ResultStatus) => void
}

const Steptwo: React.FC<SteptwoProps> = ({ opponent, setResult }) => {
  const { connected, publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()

    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [signature, setSignature] = useState("")


    const submitTransaction = async () => {
        if (!publicKey) throw new WalletNotConnectedError()
    
        try {
          setLoading(true)
          setResult("idle")
          setSignature("")
          const ix = SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(opponent),
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
          })
          const tx = new Transaction().add(ix)
          const signature = await sendTransaction(tx, connection)
          await connection.confirmTransaction(signature, "processed")
          setSignature(signature)
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
            <div className="flex w-full gap items-center gap-5">
            <Input fullWidth type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
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