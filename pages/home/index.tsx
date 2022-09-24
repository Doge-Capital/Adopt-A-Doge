import React from "react";
import Navbar from "../../components/Navbar";
import { Image } from "@nextui-org/react";
import Winners from "../../components/Winners";
function Home() {
  return (
    <div className="bg-[#F5F5F5] font-inter">
      <Navbar />
     <div className="pb-12 border-b-[1px] border-[#4C82D4] mx-12">
     <div className=" ">
        {/* <div className="flex justify-center items-center w-fit">
        <Image src="/assets/images/home4.svg" width={200} className="mx-auto " />
        <h3 className="text-5xl font-bold text-center">
          Earn with your rugged NFTs
        </h3>
        <Image src="/assets/images/home4.svg" width={250} className="mx-auto " />
        </div> */}
         <h3 className="text-5xl font-bold text-center">
          Earn with your rugged NFTs
        </h3>
        <p className="opacity-50 font-semibold text-2xl text-center max-w-[40ch] flex mx-auto mt-12">
          A simple & secure way for people to have a chance to earn with their
          rugged NFTs
        </p>
      </div>
      <div className="flex justify-around mx-16 mt-12">
        <div className="flex flex-col items-center text-center">
          <Image src="/assets/images/home1.svg" width={200} />
          <p className="text-lg font-medium">Give us your rugged NFTs</p>
          <p className="text-sm opacity-50 font-semibold">
            Small fee attatched with the transaction
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <Image src="/assets/images/home3.svg" width={200}/>
          <p className="text-lg font-medium">Give us your rugged NFTs</p>
          <p className="text-sm opacity-50 font-semibold">
            Small fee attatched with the transaction
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <Image src="/assets/images/home2.svg"  width={200}/>
          <p className="text-lg font-medium">Give us your rugged NFTs</p>
          <p className="text-sm opacity-50 font-semibold">
            Small fee attatched with the transaction
          </p>
        </div>
      </div>
      <div className="text-lg bg-[#2278F9] px-8 rounded-full text-white w-fit flex mx-auto mt-12 py-2">
        Get Started
      </div>
     </div>
     <Winners />
    </div>
  );
}

export default Home;
