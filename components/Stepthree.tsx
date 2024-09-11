import { mplToolbox, transferSol } from "@metaplex-foundation/mpl-toolbox"
import { generateSigner, signerIdentity, sol, transactionBuilder } from "@metaplex-foundation/umi"
import { base58 } from "@metaplex-foundation/umi/serializers"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters"
import { WalletNotConnectedError } from "@solana/wallet-adapter-base"
import { useWallet } from "@solana/wallet-adapter-react"
import { clusterApiUrl, PublicKey } from "@solana/web3.js"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Button } from "./ui/button"

type ResultStatus = "idle" | "success" | "failed" | "skipped"

const Stepthree: React.FC<{ gameMode: string; setResult: (status: ResultStatus) => void }> = ({
  gameMode,
  setResult,
}) => {
  const size = useRef<number>(3)
  const player1 = "O"
  const player2 = "X"
  const [won, setWon] = useState<string>("")
  const [draw, setDraw] = useState<boolean>(false)
  const playablePoints = useRef<{ y: number; x: number }[]>([])
  const [playing, setPlaying] = useState<boolean>(false)
  const [blocks, setBlocks] = useState<string[][]>([])
  const [currentPlayer, setCurrentPlayer] = useState<string>(player2)
  const [signature, setSignature] = useState("")
  const [loading, setLoading] = useState(false)

  const computePlayablePoints = useCallback(() => {
    playablePoints.current = []
    for (let i = 0; i < size.current; i++) {
      for (let j = 0; j < size.current; j++) {
        playablePoints.current.push({ y: i, x: j })
      }
    }
    playablePoints.current = shuffleArray(playablePoints.current)
  }, [])

  const computeInitialBlocks = () => {
    const array: string[][] = []
    for (let i = 0; i < size.current; i++) {
      const subArray: string[] = []
      for (let j = 0; j < size.current; j++) {
        subArray.push("")
      }
      array.push(subArray)
    }
    setBlocks(array)
  }

  useEffect(() => {
    computePlayablePoints()
    computeInitialBlocks()
  }, [computePlayablePoints])

  const shuffleArray = (array: any[]): any[] => array.sort(() => 0.5 - Math.random())

  const hasWin = (array: string[] = [], value: string): boolean =>
    array.length > 0 && array.every((ele) => ele === value)

  const determinWin = useCallback((blocks: string[][], value: string, points: { y: number; x: number }): boolean => {
    const winX = (value: string, points: { y: number; x: number }): boolean => {
      const vals: string[] = []
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[i][points.x])
      }
      return hasWin(vals, value)
    }

    const winY = (value: string, points: { y: number; x: number }): boolean => {
      const vals: string[] = []
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[points.y][i])
      }
      return hasWin(vals, value)
    }

    const canWinDiagonally = (points: { y: number; x: number }): boolean =>
      (points.x > 0 && points.x < size.current - 1 && points.y > 0 && points.y < size.current - 1) ||
      (points.y === 0 && points.x === 0) ||
      (points.y === 0 && points.x === size.current - 1) ||
      (points.y === size.current - 1 && points.x === 0) ||
      (points.y === size.current - 1 && points.x === size.current - 1)

    const leadingDiagonalWin = (value: string): boolean => {
      const vals: string[] = []
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[i][i])
      }
      return hasWin(vals, value)
    }

    const noneLeadingDiagonalWin = (value: string): boolean => {
      const vals: string[] = []
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[i][size.current - 1 - i])
      }
      return hasWin(vals, value)
    }

    const winDiagonal = (value: string): boolean => {
      return leadingDiagonalWin(value) || noneLeadingDiagonalWin(value)
    }

    return winX(value, points) || winY(value, points) || (canWinDiagonally(points) && winDiagonal(value))
  }, [])

  const isDraw = (): boolean => {
    return !playablePoints.current.length
  }

  const play = useCallback(
    (value: string, points: { y: number; x: number } | null, blocks: string[][]) => {
      setPlaying(true)
      const newBlocks = blocks.map((ele: string[]) => ele.slice())

      if (points) {
        // Update the block with the current player's move
        newBlocks[points.y][points.x] = value
        const hasWin = determinWin(newBlocks, value, points) // Check for a win
        setBlocks(newBlocks) // Update blocks state
        // Remove played point from playable points
        playablePoints.current = playablePoints.current.filter((ele) => !(ele.x === points.x && ele.y === points.y))

        if (!hasWin) {
          if (isDraw()) {
            setDraw(true)
            setPlaying(false)
          } else {
            if (gameMode === "system" && value === player2) {
              const newPoints = playablePoints.current.pop()
              setTimeout(() => {
                play(player1, newPoints as { y: number; x: number } | null, newBlocks)
              }, 1000)
            } else {
              setCurrentPlayer(value === player1 ? player2 : player1)
              setPlaying(false)
            }
          }
        } else {
          // If there's a winner, set the winner and stop playing
          setWon(value)
          setPlaying(false)
        }
      } else {
        // If no points are left, it's a draw
        setDraw(true)
        setPlaying(false)
      }
    },
    [determinWin, gameMode, currentPlayer]
  )

  const resetGame = () => {
    computePlayablePoints()
    computeInitialBlocks()
    setWon("")
    setPlaying(false)
    setDraw(false)
    setCurrentPlayer(player2)
  }

  const elements = useMemo(
    () => (
      <div className="mx-auto flex max-w-md flex-col items-center">
        {blocks.map((ele: string[], index: number) => {
          return (
            <div key={index.toString()} className="flex w-full items-center justify-between">
              {ele.map((e: string, indexer: number) => {
                const makePlay = () => {
                  if (!playing && (gameMode === "player" || (gameMode === "system" && currentPlayer === player2))) {
                    play(currentPlayer, { y: index, x: indexer }, blocks)
                  }
                }
                return (
                  <button
                    onClick={makePlay}
                    disabled={!!e || !!won || (gameMode === "system" && currentPlayer === player1)}
                    className="m-1 h-20 w-20 flex-1 rounded border-2 border-black text-center text-4xl font-bold disabled:opacity-50"
                    key={index.toString() + " _ " + indexer.toString()}
                  >
                    {e}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    ),
    [blocks, play, won, playing, gameMode, currentPlayer]
  )

  const solstoreString = localStorage.getItem("soltacwallets")
  const solstore: { amount: string; banker: string; opponent: string; player: string } = solstoreString
    ? (JSON.parse(solstoreString) as { amount: string; banker: string; opponent: string; player: string })
    : { amount: "0", banker: "", opponent: "", player: "" }
  const stakedAmount = parseFloat(solstore.amount)

  const wallet = useWallet()
  const { publicKey } = wallet

console.log(clusterApiUrl("devnet"))
  const umi = createUmi(clusterApiUrl("devnet")).use(mplToolbox())
  if (!publicKey) {
    const signer = generateSigner(umi)
    umi.use(signerIdentity(signer))
  } else {
    umi.use(walletAdapterIdentity(wallet))
  }

  const submitTransaction = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    let destination = fromWeb3JsPublicKey(new PublicKey(solstore.opponent))
    switch (true) {
      case won === player2:
        console.log("1")
        destination = fromWeb3JsPublicKey(new PublicKey(solstore.player))
        break
      case gameMode === "system":
        console.log("2")
        toast.success("The system won")
        destination = fromWeb3JsPublicKey(new PublicKey(solstore.banker))
        break
      case gameMode === "player" && won === player1:
        console.log("3")
        destination = fromWeb3JsPublicKey(new PublicKey(solstore.opponent))
        break
      default:
        break
    }

    try {
      setLoading(true)
      setResult("idle")
      setSignature("")

      if (won == player2) {
        toast.success("You won, no need to burn gas fee")
      } else {
        const builder = transactionBuilder()
          .add(transferSol(umi, { amount: sol(stakedAmount), destination }))
          .sendAndConfirm(umi, { send: { skipPreflight: true } })

        setSignature(base58.deserialize((await builder).signature)[0])
      }

      setResult("success")
    } catch (error) {
      console.error(error)
      setResult("failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 text-center font-sans">
      <h1 className="mb-4 text-3xl font-bold">Tic Tac Toe Game</h1>
      <h2 className="mb-2 text-xl">Current Mode: {gameMode === "system" ? "System" : "Player vs Player"}</h2>
      <h2 className="mb-2 text-xl font-extrabold">Commited Amount: {stakedAmount}</h2>
      <h3 className="mb-2 text-lg font-semibold">Instructions:</h3>
      <div className="mb-4">
        {gameMode === "system" ? (
          <p>
            You are player <b>X</b>. Play against the system.
          </p>
        ) : (
          <p>
            Two players (X - Player and O - Opponent) take turns. Current player: <b>{currentPlayer}</b>
          </p>
        )}
      </div>
      {won && <div className="mb-4 rounded bg-red-200 p-2 text-2xl font-bold text-red-700">Player {won} won</div>}
      {draw && <div className="mb-4 bg-gray-200 p-2 text-3xl font-bold">DRAW</div>}
      {elements}

      <div className="mt-10 flex w-full gap-10">
        <Button disabled={!won && !draw} onClick={resetGame} variant="outline">
          Reset Game
        </Button>

        {won && (
          <Button className="w-1/2" variant="solid2" onClick={submitTransaction}>
            {" "}
            Checkout and Pay{" "}
          </Button>
        )}
      </div>

      {signature.length > 1 && (
        <a
          href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
          className="text-blue h-8 bg-orange-300 px-3 underline"
        >
          Check transaction
        </a>
      )}
    </div>
  )
}

export default Stepthree
