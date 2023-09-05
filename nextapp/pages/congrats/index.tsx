import React from "react";
import { Image } from "@nextui-org/react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import router from "next/router";

function Congrats() {
    const { width, height } = useWindowSize(700, 375);
    return (
        <div className="h-full min-h-screen bg-[#f5f5f5] pt-2 sm:pt-14">
            <Confetti width={width} height={height} numberOfPieces={50} className="w-screen"/>
            <div className="flex justify-center items-center w-fit mx-auto font-inter">

                <Image src="/assets/images/congrats1.png" width={120} />
                <Image src="/assets/images/congrats3.png" width={120} />
                <Image src="/assets/images/congrats1.png" width={120} />
            </div>
            <h3 className="text-[1.625rem] font-bold text-[#79BD9A] text-center mt-2 sm:mt-12">
                Congrats!
            </h3>
            <div className="flex justify-center items-center mt-5 mb-10 mx-2">
                <h3 className="text-5xl text-center font-semibold text-[#171717]">
                    You have successfully received tickets!
                </h3>
            </div>
            <div className="flex flex-col sm:flex-row w-3/4 m-auto justify-center items-center">
                <div className="flex text-xl bg-[#2278F9] px-10 rounded-full text-white w-fit mx-3 py-3 sm:py-4 hover:border-[#2278F9] border-2 hover:bg-white hover:text-[#2278F9] cursor-pointer mt-14 mb-4 sm:mb-14">
                    <a href="https://www.kenl.live/raffles" target="_blank" rel="noopener noreferrer" className="text-center">
                        Spend tickets
                    </a>
                </div>
                <div
                    className="flex text-xl bg-[#2278F9] px-10 rounded-full text-white w-fit mx-3 py-3 sm:py-4 hover:border-[#2278F9] border-2 hover:bg-white hover:text-[#2278F9] cursor-pointer mt-4 mb-14 sm:mt-14"
                    onClick={() => router.back()}
                >
                    Back
                </div>
            </div>
        </div>
    );
}

export default Congrats;
