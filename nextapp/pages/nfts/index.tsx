import React from "react";
import Nftcard from "../../components/Nftcard";
import { FetchNft } from "../../context/FetchNFT";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

function EligibleNfts() {
  const wallet = useWallet();
  const [selectedNfts, setSelectedNfts] = useState<any[]>([]);

  return (
    <div className="bg-bg flex flex-col items-center">
      <div className="flex gap-20 px-12 overflow-hidden font-inter">
        <div className="bg-blue w-fit h-fit p-4 px-16  rounded-sm font-semibold text-center">
          <h5 className=" text-lg opacity-[0.75] ">Current Collection</h5>
          <h3 className="text-3xl opacity-[0.75]">Doge Capital</h3>
        </div>
        <div className="bg-green w-fit h-fit p-4 px-16 rounded-sm font-semibold text-center">
          <h5 className=" text-lg opacity-[0.75]">Tickets sold</h5>
          <h3 className="text-3xl opacity-[0.75]">50/100</h3>
        </div>
        <div className="bg-purple w-fit h-fit p-4 px-16 rounded-sm font-semibold text-center">
          <h5 className=" text-lg opacity-[0.75] font-medium">Your Tickets</h5>
          <h3 className="text-3xl opacity-[0.75]">0</h3>
        </div>
      </div>
      <div className="mx-5 mt-12 pb-7 container flex flex-col flex-wrap">
        <h3 className="text-center my-4 font-semibold text-[1.625rem] opacity-75">
          Your Eligible NFTs
        </h3>
        {wallet.connected ? (
          <FetchNft
            selectedNfts={selectedNfts}
            setSelectedNfts={setSelectedNfts}
          />
        ) : (
          <WalletNotConnected />
        )}
        {/* <NoELigibeNfts /> */}
      </div>

      <div className="h-[10vh] sticky bottom-0 w-full px-12 bg-bg z-50">
        <div className="flex align-middle justify-between py-4 h-full">
          <div className="text-[1.125rem] opacity-[0.75] flex items-center gap-4 font-medium ">
            <h3>NFTs Selected : 00</h3>
            <h3>Tickets Received : 00</h3>
          </div>
          {/* <button className="flex ml-auto mr-0 mt-4 text-lg bg-grey rounded-sm text-white px-4 py-2">
            Burn and receive tickets
          </button> */}
          <button className="text-lg bg-[#2278F9] rounded-sm text-white px-4 py-2">
            Burn and receive tickets
          </button>
        </div>
      </div>
    </div>
  );
}

export default EligibleNfts;

const WalletNotConnected = () => {
  return (
    <div className="flex text-center mx-auto w-fit mt-20 ">
      <h3 className="text-[#898989] text-lg font-semibold">
        Connect wallet to display NFTs
      </h3>
    </div>
  );
};

const NoELigibeNfts = () => {
  return (
    <div className="flex text-center mx-auto w-fit mt-20">
      <h3 className="text-[#D44C4C] text-lg  font-semibold">
        Oops.....You dont have any eligible NFTs
      </h3>
    </div>
  );
};

const NFtDisplay = () => {
  return (
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
  );
};
