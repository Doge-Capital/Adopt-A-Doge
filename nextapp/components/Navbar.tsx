import React from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { Text } from "@nextui-org/react";
import { Wallet } from "../context/Wallet";

function Navbar() {
    return (
        <div className="bg-[#F5F5F5] ">
            <Wallet>
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
                </div>
            </Wallet>
        </div>
    );
}

export default Navbar;
