import React from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { Text } from "@nextui-org/react";
import useIsMounted from "../utils/Mounted";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useRouter } from "next/router";

function Navbar() {
    const isMounted = useIsMounted();
    const router = useRouter();

    return (
        <div className="bg-[#f5f5f5] sticky top-0 z-50 ">
            <div className="flex justify-center sm:justify-end h-[10vh] items-center mx-2 sm:mx-12 gap-6">
                <Text className=" text-xl hover:translate-y-[-2px] rounded-full w-8 text-center border-2 border-black cursor-pointer" onClick={() => router.push("/about")}>
                    i
                </Text>
                <Text className="text-3xl hover:translate-y-[-2px] cursor-pointer">
                    <Link href="https://twitter.com/thedogecapital" passHref>
                        <a target="_blank" rel="noopener noreferrer">
                            <FaTwitter />
                        </a>
                    </Link>
                </Text>
                <Text className="text-3xl hover:translate-y-[-2px] cursor-pointer">
                    <Link href="https://discord.com/invite/yjw62xHbQb" passHref>
                        <a target="_blank" rel="noopener noreferrer">
                            <FaDiscord />
                        </a>
                    </Link>
                </Text>
                {isMounted && <WalletMultiButton />}
            </div>
        </div>
    );
}

export default Navbar;
