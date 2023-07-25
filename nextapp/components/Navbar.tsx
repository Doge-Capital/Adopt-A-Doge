import React from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { Text } from "@nextui-org/react";
import useIsMounted from "../utils/Mounted";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function Navbar() {
    const isMounted = useIsMounted();

    return (
        <div className="bg-[#f5f5f5] sticky top-0 z-50">
            <div className="flex justify-end h-[10vh] items-center mx-12 gap-6">
                <Text className=" text-xl hover:translate-y-[-2px] rounded-full w-8 text-center border-2 border-black cursor-pointer">
                    i
                </Text>
                <Text className="text-3xl hover:translate-y-[-2px] cursor-pointer">
                    <FaTwitter />
                </Text>
                <Text className="text-3xl hover:translate-y-[-2px] cursor-pointer">
                    <FaDiscord />
                </Text>
                {isMounted && <WalletMultiButton />}
            </div>
        </div>
    );
}

export default Navbar;
