import { WalletNotConnectedError } from "@solana/wallet-adapter-base"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import ConnectWalletButton from "@/components/connect-wallet-button"
import Stepone from "@/components/Stepone"
import Stepthree from "@/components/Stepthree"
import Steptwo from "@/components/Steptwo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Typography } from "@/components/ui/typography"
import { siteConfig } from "@/config/site"
import { cn } from "@/utils/cn"
import truncate from "@/utils/truncate"

export default function HomePage() {
  type ResultStatus = "idle" | "success" | "failed" | "skipped"
  const gameflow = [
    {
      id: 1,
      flow: "Select Game Mode",
    },
    {
      id: 2,
      flow: "Stake an Amount",
    },
    {
      id: 3,
      flow: "Play Game",
    },
    {
      id: 4,
      flow: "Checkout and Pay",
    },
  ]

  const { banker } = siteConfig

  const { connected, publicKey, sendTransaction } = useWallet()
  const [mode, setMode] = useState("")
  const [playerWallet, setPlayerWallet] = useState("")
  const [opponentWallet, setOpponentWallet] = useState("")
  const [currentFlow, setCurrentFlow] = useState(gameflow[0])
  const [result, setResult] = useState<ResultStatus>("idle")
  const [amount, setAmount] = useState("")

  const handleModeChange = (selectedMode: string) => {
    setMode(selectedMode)
    toast.success(mode + " mode selected", {
      duration: 2000,
      position: "top-center",
    })
  }

  useEffect(() => {
    if (mode == "system") {
      setOpponentWallet(banker)
    }

    const wallets = {
      banker: banker,
      opponent: opponentWallet,
      player: publicKey,
      amount,
    }
    localStorage.setItem("soltacwallets", JSON.stringify(wallets))
  }, [banker, opponentWallet, playerWallet, amount, mode])

  useEffect(() => {
    if (publicKey) {
      setPlayerWallet(truncate(publicKey.toBase58(), 32, true))
      if (!mode) {
        toast.success("You are connected and ready to go!", {
          duration: 2000,
          position: "top-center",
        })
      }
    }
  }, [publicKey, connected, mode])

  const goForward = () => {
    const currentIndex = gameflow.findIndex((flow) => flow.id === currentFlow.id)
    if (currentIndex < gameflow.length - 1) {
      setCurrentFlow(gameflow[currentIndex + 1])
    }
  }

  const goBackward = () => {
    const currentIndex = gameflow.findIndex((flow) => flow.id === currentFlow.id)
    if (currentIndex > 0) {
      setCurrentFlow(gameflow[currentIndex - 1])
    }
  }

  const isDisabled = [
    () => currentFlow.id === 1 && mode === "player" && !opponentWallet,
    () => currentFlow.id === 1 && !mode,
    () => currentFlow.id === 1 && !playerWallet,
  ].some((condition) => condition())

  useEffect(() => {
    if (result === "skipped") {
      goForward()
    }
  }, [result])

  const resetGame = () => {
    setCurrentFlow(gameflow[0])
    setPlayerWallet("")
    setOpponentWallet("")
    setAmount("")
    setMode("")
    setResult("idle")
    localStorage.removeItem("soltacwallets")
  }

  return (
    <div className="flex h-screen w-full flex-col items-center">
      {currentFlow.id == 1 && <Stepone handleModeChange={handleModeChange} />}
      {currentFlow.id == 2 && (
        <Steptwo amount={amount} setAmount={setAmount} setResult={setResult} opponent={opponentWallet} />
      )}
      {currentFlow.id == 3 && <Stepthree gameMode={mode} setResult={setResult} />}

      <div className="mt-40 flex h-24 w-full gap-10">
        {currentFlow.id !== gameflow.length - 1 && (
          <Button className="w-1/2" disabled={isDisabled} variant="solid2" onClick={() => goForward()}>
            {" "}
            {gameflow[currentFlow.id].flow}{" "}
          </Button>
        )}
        <Button className="w-1/2 bg-red-500" variant="solid" onClick={resetGame}>
          End
        </Button>
      </div>

      <div className="fixed bottom-0 right-0 flex h-24 w-full items-center gap-5 bg-electric-50 px-4">
        <div className="w-1/2">
          <Typography level="body4" color="info">
            Player Wallet
          </Typography>
          <Input
            type="text"
            placeholder="Your wallet address"
            value={playerWallet}
            disabled
            className="mt-2 w-full rounded border p-2"
          />
        </div>

        {mode === "player" && (
          <div className="w-1/2">
            <Typography level="body4" color="info">
              Opponent Wallet
            </Typography>
            <Input
              type="text"
              placeholder="Enter opponent's wallet address"
              value={opponentWallet}
              onChange={(e) => setOpponentWallet(e.target.value)}
              className="mt-2 rounded border p-2"
            />
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
