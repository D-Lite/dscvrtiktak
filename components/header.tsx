import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { siteConfig } from "@/config/site"
import { cn } from "@/utils/cn"
import { IconButton } from "./ui/icon-button"
import { Typography } from "./ui/typography"
import WalletComponent from "./canvas/WalletComponent"
import { useEffect, useState } from "react"

const MenuItems = [
  {
    text: "Home",
    href: "/",
  },
  {
    text: "About",
    href: "/about",
  },
]

export default function Header() {
  const { asPath } = useRouter()
  const [iframe, setIframe] = useState(false);


  const isIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

useEffect(() => {
  setIframe(isIframe)
}, [])

  return (
    <header className="fixed left-0 top-0 z-20 w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto flex items-center p-4 md:px-6">
        <a href="/" className="flex items-center">
          <img src="/assets/logo.svg" className="mr-3 h-8" alt={siteConfig.name} />
        </a>

        <ul className="ml-10 hidden items-center gap-6 md:flex">
          {MenuItems.map((item) => (
            <li key={item.text}>
              <Link
                href={item.href}
                className={cn("text-gray-600 hover:underline", {
                  "text-gray-900": item.href === "/" ? asPath === item.href : asPath.startsWith(item.href),
                })}
              >
                <Typography level="body4" className="font-semibold">
                  {item.text}
                </Typography>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-1 items-center justify-end gap-2">
          {!iframe && <ConnectWalletButton />}

          {iframe && <WalletComponent />}

          <IconButton className="md:hidden">
            <MenuIcon />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
