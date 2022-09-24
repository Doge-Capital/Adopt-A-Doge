import React from "react";
import { Button } from "@nextui-org/react";
import Nftcard from "../../components/Nftcard";
import Navbar from "../../components/Navbar";

function EligibleNfts() {
  return (
    <div className=" bg-bg">
      <Navbar />
      <div className="flex justify-evenly px-12 overflow-hidden font-inter">
        <div className="bg-blue w-fit h-fit p-4 px-16 w-[25vw]  rounded-sm font-semibold text-center">
          <h5 className=" text-lg opacity-[0.75] ">Current Collection</h5>
          <h3 className="text-3xl opacity-[0.75]">Doge Capital</h3>
        </div>
        <div className="bg-green w-fit h-fit p-4 px-16 w-[25vw] rounded-sm font-semibold text-center">
          <h5 className=" text-lg opacity-[0.75]">Tickets sold</h5>
          <h3 className="text-3xl opacity-[0.75]">50/100</h3>
        </div>
        <div className="bg-purple w-fit h-fit p-4 px-16 w-[25vw] rounded-sm font-semibold text-center">
          <h5 className=" text-lg opacity-[0.75]">Your Tickets</h5>
          <h3 className="text-3xl opacity-[0.75]">0</h3>
        </div>
      </div>
      <div className="mx-12 mt-12">
        <h3 className="text-center mt-4 font-semibold text-[1.625rem] opacity-75 font-bold">
          Your Eligible NFTs
        </h3>
        <div className="h-screen ">
         <NFtDisplay />
{/* <WalletNotConnected /> */}
{/* <NoELigibeNfts /> */}
        </div>
      </div>
      <div className="h-[20vh] fixed bottom-0 w-full px-12 bg-bg">
        <div className="border-t-[1px] border-grey">
          <div className="text-[1.125rem] opacity-[0.75] pt-4 flex ">
            <h3>NFTs Selected : 00</h3>
            <h3 className="mx-12">Tickets Received : 00</h3>
          </div>
          {/* <button className="flex ml-auto mr-0 mt-4 text-lg bg-grey rounded-sm text-white px-4 py-2">
            Burn and receive tickets
          </button> */}
          <button className="flex ml-auto mr-0 mt-4 text-lg bg-[#2278F9] rounded-sm text-white px-4 py-2">
            Burn and receive tickets
          </button>

        </div>
      </div>
    </div>
  );
}

export default EligibleNfts;


const WalletNotConnected = () => {
  return(
    <div className="flex text-center mx-auto w-fit mt-20 ">
      <h3 className="text-[#898989] text-lg font-semibold">Connect wallet to display NFTs</h3>
    </div>
  )
}


const NoELigibeNfts = () => {
  return(
    <div className="flex text-center mx-auto w-fit mt-20">
      <h3 className="text-[#D44C4C] text-lg  font-semibold">Oops.....You dont have any eligible NFTs</h3>
    </div>
  )
  
}

const NFtDisplay = () => {
  return(
    <div className="flex gap-8 mt-4">
       <div className="">
            <Nftcard />
          </div>
          <div className="">
            <Nftcard />
          </div>
          <div className="">
            <Nftcard />
          </div>
    </div>
  )
}