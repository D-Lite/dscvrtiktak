import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import type { AppProps } from "next/app"
import { DefaultSeo } from "next-seo"
import type { FC } from "react"
import React, { useMemo } from "react"
import RootLayout from "@/components/layout"
import { siteConfig } from "@/config/site"
import { Metadata } from "next"
import { CanvasWalletProvider } from "@/components/canvas/CanvasWalletProvider"

// Use require instead of import since order matters
require("@solana/wallet-adapter-react-ui/styles.css")
require("../styles/globals.css")


export const metadata: Metadata = {
  other: {
    "dscvr:canvas:version": "vNext",
    "og:image": "https://my-canvas.com/preview-image.png",
  }   
}

const App: FC<AppProps> = ({ Component, pageProps }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  )

  return (
    <>
      <DefaultSeo
        title={siteConfig.name}
        openGraph={{
          type: "website",
          locale: "en_EN",
          description: siteConfig.description,
          site_name: siteConfig.name,
          title: siteConfig.name,
        }}
        description={siteConfig.description}
      />

      <ConnectionProvider endpoint={endpoint}>
        <CanvasWalletProvider>
        <WalletProvider wallets={wallets} autoConnect={false}>
          <WalletModalProvider>
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </WalletModalProvider>
        </WalletProvider>
        </CanvasWalletProvider>
      </ConnectionProvider>
    </>
  )
}

export default App
