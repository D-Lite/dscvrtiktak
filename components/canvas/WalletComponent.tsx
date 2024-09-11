// @ts-nocheck
import { FC } from "react";
import useCanvasWallet from "./CanvasWalletProvider";
import { Button } from "../ui/button";

const WalletComponent = () => {
  const { connectWallet, walletAddress, walletIcon, userInfo, content, signTransaction } =
    useCanvasWallet();

  console.log(userInfo)
    
  return (
    <div className="flex items-center justify-center w-full">
      <Button variant="solid2" onClick={connectWallet}>Connect Solana Wallet</Button>

      {/* {walletAddress && (
        <div>
          <p>Wallet Address: {walletAddress}</p>
          <img src={walletIcon || ""} alt="Wallet Icon" />
        </div>
      )} */}
    </div>
  );
};

export default WalletComponent;