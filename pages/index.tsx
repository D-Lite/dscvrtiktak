import { WalletNotConnectedError } from "@solana/wallet-adapter-base"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { useEffect, useState } from "react"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Typography } from "@/components/ui/typography"
import { cn } from "@/utils/cn"
import truncate from "@/utils/truncate"
import Stepone from "@/components/Stepone"
import toast, { Toaster } from "react-hot-toast"

type ResultStatus = "idle" | "success" | "failed"

export default function HomePage() {
  const { connected, publicKey, sendTransaction } = useWallet()
  const [mode, setMode] = useState(''); 
  const [playerWallet, setPlayerWallet] = useState(''); 
  const [opponentWallet, setOpponentWallet] = useState('');

  const handleModeChange = (selectedMode: string) => {
      setMode(selectedMode);
      toast.success(mode + ' mode selected', {
          duration: 2000,
          position: 'top-center'
      })
  };

  useEffect(() => {
    if (publicKey) {
      setPlayerWallet(truncate(publicKey.toBase58(), 32, true));
            toast.success("You are connected and ready to go!", {
                duration: 2000,
                position: 'top-center'
            })
        }
    }, [publicKey, connected, mode]);

  return (
    <div className="flex flex-col justify-between h-screen w-full">
      <Stepone handleModeChange={handleModeChange} />

      <div className="flex gap-5 w-full bg-electric-50 h-24 items-center px-4 fixed right-0 bottom-0">
        <div className="w-1/2">
          <Typography level='body4' color='info'>Player Wallet</Typography>
            <Input 
                type="text" 
                placeholder="Your wallet address" 
                value={playerWallet} 
                disabled
                className="mt-2 p-2 border rounded w-full"
            />
        </div>

        {mode === 'player' && (
            <div className="w-1/2">
              <Typography level='body4' color='info'>Opponent Wallet</Typography>
                <Input 
                    type="text" 
                    placeholder="Enter opponent's wallet address" 
                    value={opponentWallet} 
                    onChange={(e) => setOpponentWallet(e.target.value)} 
                    className="mt-2 p-2 border rounded"
                />
            </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
