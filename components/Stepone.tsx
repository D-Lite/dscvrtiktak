import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "./ui/button"

interface SteponeProps {
  handleModeChange: (value: string) => void
}

const Stepone: React.FC<SteponeProps> = ({ handleModeChange }) => {
  const { publicKey } = useWallet()

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-bold">Select Game Mode</h1>
        <div className="flex gap-5">
          <Button disabled={!publicKey} variant="outline" onClick={() => handleModeChange("player")}>
            {" "}
            Play Against Another Player{" "}
          </Button>
          <Button variant="solid2" disabled={!publicKey} onClick={() => handleModeChange("system")}>
            {" "}
            Play Against System{" "}
          </Button>
        </div>
      </div>
    </>
  )
}

export default Stepone
