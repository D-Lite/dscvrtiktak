import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Typography } from "./ui/typography"

type ResultStatus = "idle" | "success" | "failed" | "skipped"

interface SteptwoProps {
  opponent: string
  amount: string
  setAmount: (amount: string) => void
  setResult: (status: ResultStatus) => void
}

const Steptwo: React.FC<SteptwoProps> = ({ opponent, setResult, amount, setAmount }) => {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex w-full items-center gap-5">
        <Input
          fullWidth
          type="number"
          className="border border-black"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
        />
      </div>

      <Typography level="body2" color="secondary" className="text-center">
        <strong>Important Notice:</strong> By staking an amount, you are committing to pay whoever wins the game. If you
        lose to the system, you will also be paying the system. However, you have the option to skip this process if you
        change your mind. Please note that if you do skip, the staked amount will not be awarded to anyone.
      </Typography>
      <Button variant="outline" onClick={() => setResult("skipped")}>
        Skip
      </Button>
    </div>
  )
}

export default Steptwo
