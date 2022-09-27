import React from "react";
import Navbar from "../../components/Navbar";
import { Image } from "@nextui-org/react";
import Winners from "../../components/Winners";
import  styles from '../../components/styles/animation.module.css'
function Home() {
  return (
    <div className="bg-[#F5F5F5] font-inter">
      <Navbar />
     <div className="pb-12 border-b-[1px] border-[#4C82D4] mx-12 mt-12">
     <div className=" ">
        <div className="flex justify-center items-center w-fit mx-auto">
        <Image style={{
          transform:'scaleX(-1)'
        }} src="/assets/images/home4.png" width={80} className={styles['animated_image']} />
        <h3 className="text-4xl font-bold text-center">
          Earn with your rugged NFTs
        </h3>
        <Image src="/assets/images/home4.png" width={80} className={styles['animated_image']} />
        </div>
         {/* <h3 className="text-5xl font-bold text-center">
          Earn with your rugged NFTs
        </h3> */}
        <p className="opacity-50 font-semibold text-xl text-center max-w-[40ch] flex mx-auto ">
          A simple & secure way for people to have a chance to earn with their
          rugged NFTs
        </p>
      </div>
      <div className="flex justify-around mx-16 mt-12">
        <div className="flex flex-col items-center text-center">
          <Image src="/assets/images/home1.svg" width={250} className='hover:scale-[1.05]' />
          <p className="text-lg font-medium">Give us your rugged NFTs</p>
          <p className="text-sm opacity-50 font-semibold">
            Small fee attatched with the transaction
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <Image src="/assets/images/home3.svg" width={250} className='hover:scale-[1.05]'/>
          <p className="text-lg font-medium">Give us your rugged NFTs</p>
          <p className="text-sm opacity-50 font-semibold">
            Small fee attatched with the transaction
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <Image src="/assets/images/home2.svg"  width={250} className='hover:scale-[1.05]'/>
          <p className="text-lg font-medium">Give us your rugged NFTs</p>
          <p className="text-sm opacity-50 font-semibold">
            Small fee attatched with the transaction
          </p>
        </div>
      </div>
      <div className="text-lg bg-[#2278F9] px-8 rounded-full text-white w-fit flex mx-auto mt-12 py-2 hover:bg-[#4f8ff0] cursor-pointer	">
        Get Started
      </div>
     </div>
     <Winners />
    </div>
  );
}

export default Home;
