export default function HomePage() {
  return (
    <div>
      <div className="rounded-lg bg-white p-8 text-gray-800 shadow-md">
        <h2 className="mb-4 text-3xl font-bold">Tic Tac Toe on Solana: A Web3 Gaming Experience</h2>
        <p className="mb-6">
          Are you ready to take your Tic Tac Toe skills to the next level? Join us in building a decentralized Tic Tac
          Toe game on the Solana blockchain! This project aims to create an innovative Web3 gaming experience by
          leveraging the Solana ecosystem and the Metaplex Foundation SDKs. Players will be able to engage in thrilling
          Tic Tac Toe matches, with the option to play against the system or challenge other opponents.
        </p>

        <h3 className="mb-2 text-2xl font-semibold">Key Features</h3>
        <ul className="mb-6 list-inside list-disc">
          <li>
            <strong>Game Mode Selection:</strong> Users can choose to play against the system or another player by
            inputting the opponent(s) public key.
          </li>
          <li>
            <strong>Staking and Wagering:</strong> Players can stake an amount they are willing to wager on the outcome
            of the game. This amount will be transferred to the winner, whether it is the system or the opponent.
          </li>
          <li>
            <strong>Secure, Decentralized Gameplay:</strong> The game logic and transactions will be handled on the
            Solana blockchain, ensuring a secure and transparent gaming experience.
          </li>
          <li>
            <strong>Checkout and Payout:</strong> After the game, the winner will receive the staked amount, and the
            payment will be processed through the Solana blockchain.
          </li>
        </ul>
      </div>
    </div>
  )
}
