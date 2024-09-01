import React, { useMemo, useEffect, useCallback, useState, useRef } from "react";
import { Button } from "./ui/button";

const Stepthree: React.FC<{ gameMode: string }> = ({ gameMode }) => {
  const size = useRef<number>(3); // Specify type for game size
  const player1 = "O";
  const player2 = "X";
  const [won, setWon] = useState<string>(""); 
  const [draw, setDraw] = useState<boolean>(false);
  const playablePoints = useRef<{ y: number; x: number; }[]>([]); 
  const [playing, setPlaying] = useState<boolean>(false); 
  const [blocks, setBlocks] = useState<string[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<string>(player2);

  const computePlayablePoints = useCallback(() => {
    playablePoints.current = [];
    for (let i = 0; i < size.current; i++) {
      for (let j = 0; j < size.current; j++) {
        playablePoints.current.push({ y: i, x: j });
      }
    }
    playablePoints.current = shuffleArray(playablePoints.current);
  }, []);

  const computeInitialBlocks = () => {
    const array: string[][] = [];
    for (let i = 0; i < size.current; i++) {
      const subArray: string[] = [];
      for (let j = 0; j < size.current; j++) {
        subArray.push("");
      }
      array.push(subArray);
    }
    setBlocks(array);
  };

  useEffect(() => {
    computePlayablePoints();
    computeInitialBlocks();
  }, [computePlayablePoints]);

  const shuffleArray = (array: any[]): any[] => array.sort(() => 0.5 - Math.random()); 

  const hasWin = (array: string[] = [], value: string): boolean => 
    array.length > 0 && array.every((ele) => ele === value);

  const determinWin = useCallback((blocks: string[][], value: string, points: { y: number; x: number }): boolean => {
    const winX = (value: string, points: { y: number; x: number }): boolean => {
      const vals: string[] = [];
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[i][points.x]);
      }
      return hasWin(vals, value);
    };

    const winY = (value: string, points: { y: number; x: number }): boolean => {
      const vals: string[] = [];
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[points.y][i]);
      }
      return hasWin(vals, value);
    };

    const canWinDiagonally = (points: { y: number; x: number }): boolean =>
      (points.x > 0 &&
        points.x < size.current - 1 &&
        points.y > 0 &&
        points.y < size.current - 1) ||
      (points.y === 0 && points.x === 0) ||
      (points.y === 0 && points.x === size.current - 1) ||
      (points.y === size.current - 1 && points.x === 0) ||
      (points.y === size.current - 1 && points.x === size.current - 1);

    const leadingDiagonalWin = (value: string): boolean => {
      let vals: string[] = []; 
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[i][i]);
      }
      return hasWin(vals, value);
    };

    const noneLeadingDiagonalWin = (value: string): boolean => {
      let vals: string[] = []; 
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[i][size.current - 1 - i]);
      }
      return hasWin(vals, value);
    };

    const winDiagonal = (value: string): boolean => {
      return leadingDiagonalWin(value) || noneLeadingDiagonalWin(value);
    };

    return (
      winX(value, points) ||
      winY(value, points) ||
      (canWinDiagonally(points) && winDiagonal(value))
    );
  }, []);

  const isDraw = (): boolean => {
    return !playablePoints.current.length;
  };

const play = useCallback(
    (value: string, points: { y: number; x: number } | null, blocks: string[][]) => {
      setPlaying(true); 
      const newBlocks = blocks.map((ele: string[]) => ele.slice());
  
      if (points) {
        // Update the block with the current player's move
        newBlocks[points.y][points.x] = value;
        const hasWin = determinWin(newBlocks, value, points); // Check for a win
        setBlocks(newBlocks); // Update blocks state
        // Remove played point from playable points
        playablePoints.current = playablePoints.current.filter(
          (ele) => !(ele.x === points.x && ele.y === points.y)
        );
  
        if (!hasWin) {
          if (isDraw()) {
            setDraw(true);
            setPlaying(false);
          } else {
            if (gameMode === "system" && value === player2) {
              const newPoints = playablePoints.current.pop();
              setTimeout(() => {
                play(player1, newPoints as { y: number; x: number } | null, newBlocks);
              }, 1000);
            } else {
              setCurrentPlayer(value === player1 ? player2 : player1);
              setPlaying(false);
            }
          }
        } else {
          // If there's a winner, set the winner and stop playing
          setWon(value);
          setPlaying(false);
        }
      } else {
        // If no points are left, it's a draw
        setDraw(true);
        setPlaying(false);
      }
    },
    [determinWin, gameMode, currentPlayer]
  );
  

  const resetGame = () => {
    computePlayablePoints();
    computeInitialBlocks();
    setWon("");
    setPlaying(false);
    setDraw(false);
    setCurrentPlayer(player2);
  };

  const elements = useMemo(
    () => (
      <div className="flex flex-col items-center max-w-md mx-auto">
        {blocks.map((ele: string[], index: number) => {
          return (
            <div key={index.toString()} className="flex justify-between items-center w-full">
              {ele.map((e: string, indexer: number) => {
                const makePlay = () => {
                  if (!playing && (gameMode === "player" || (gameMode === "system" && currentPlayer === player2))) {
                    play(currentPlayer, { y: index, x: indexer }, blocks);
                  }
                };
                return (
                  <button
                    onClick={makePlay}
                    disabled={!!e || !!won || (gameMode === "system" && currentPlayer === player1)}
                    className="flex-1 text-center text-4xl font-bold h-20 w-20 m-1 border-2 border-black rounded disabled:opacity-50"
                    key={index.toString() + " _ " + indexer.toString()}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    ),
    [blocks, play, won, playing, gameMode, currentPlayer]
  );

  return (
    <div className="font-sans text-center p-4">
      <h1 className="text-3xl font-bold mb-4">Tic Tac Toe Game</h1>
      <h2 className="text-xl mb-2">Current Mode: {gameMode === "system" ? "System" : "Player vs Player"}</h2>
      <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
      <div className="mb-4">
        {gameMode === "system" ? (
          <p>You are player <b>X</b>. Play against the system.</p>
        ) : (
          <p>Two players (X - Player and O - Opponent) take turns. Current player: <b>{currentPlayer}</b></p>
        )}
      </div>
      {won && <div className="bg-red-200 text-red-700 font-bold text-2xl rounded p-2 mb-4">Player {won} won</div>}
      {draw && <div className="bg-gray-200 font-bold text-3xl p-2 mb-4">DRAW</div>}
      {elements}
      <Button
        disabled={!won && !draw}
        onClick={resetGame}
        variant="outline"
      >
        Reset Game
      </Button>
    </div>
  );
};

export default Stepthree;