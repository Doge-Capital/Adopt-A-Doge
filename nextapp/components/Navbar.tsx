import React from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import useIsMounted from "../utils/Mounted";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import SpendTickets from "./SpendTickets";

function Navbar() {
    const isMounted = useIsMounted();
    const router = useRouter();

    return (
        <div className="bg-[#f5f5f5] sticky top-0 z-50 border-b-4 border-slate-300">
            <div className="flex w-full justify-center sm:justify-between gap-2">
                <div
                    className="flex gap-2 ml-2 sm:ml-5 items-center justify-center text-xl text-center cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <Image
                        src="/assets/images/black_paw_icon.png"
                        width={30}
                        height={28}
                    />
                    <p className="hidden sm:flex text-2xl font-normal">
                        Adopt A Doge
                    </p>
                </div>
                <div className="flex justify-center sm:justify-end h-[10vh] items-center mx-2 sm:mr-5 gap-3 sm:gap-6">
                    {/*}
                    <div className="bg-black px-6 rounded-full text-white w-fit mx-2 py-3 hover:border-black border-2 hover:bg-white hover:text-black cursor-pointer mt-14 mb-4 sm:mb-14 ">
                        <SpendTickets />
                    </div>
                    */}
                    <div
                        className=" text-xl hover:translate-y-[-2px] rounded-full w-8 text-center border-2 border-black cursor-pointer"
                        onClick={() => router.push("/about")}
                    >
                        i
                    </div>
                    <div className="text-3xl hover:translate-y-[-2px] cursor-pointer">
                        <Link
                            href="https://twitter.com/thedogecapital"
                            passHref
                        >
                            <a target="_blank" rel="noopener noreferrer">
                                <FaTwitter />
                            </a>
                        </Link>
                    </div>
                    <div className="text-3xl hover:translate-y-[-2px] cursor-pointer">
                        <Link
                            href="https://discord.com/invite/yjw62xHbQb"
                            passHref
                        >
                            <a target="_blank" rel="noopener noreferrer">
                                <FaDiscord />
                            </a>
                        </Link>
                    </div>
                    {isMounted && <WalletMultiButton />}
                </div>
            </div>
        </div>
    );
}

export default Navbar;
