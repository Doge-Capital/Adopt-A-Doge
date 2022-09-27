import React from "react";
import Navbar from "../../components/Navbar";
import { Image } from "@nextui-org/react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

function Congrats() {
  const { width, height } = useWindowSize();
  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center w-fit mx-auto font-inter mt-20">
      <Confetti width={width-100} height={height -100} numberOfPieces={50} />
       
        <Image src="/assets/images/congrats1.png" width={120} />
        <Image src="/assets/images/congrats3.png" width={120} />
        <Image src="/assets/images/congrats1.png" width={120} />
      </div>
      <h3 className="text-[1.625rem] font-bold text-[#79BD9A] text-center mt-12">
        Congrats!
      </h3>
      <div className="flex mx-auto justify-center item-center w-fit mt-6">
        <h3 className="text-4xl font-semibold text-[#171717] mr-2">
          You have successfully received 5 Tickets!
        </h3>
        <Image src="/assets/images/congrats2.svg" width={120} />
      </div>
      <h3 className="text-[#2278F9] text-lg opacity-75 font-semibold text-center mt-24 cursor-pointer">
        Back to home
      </h3>
    </div>
  );
}

export default Congrats;
