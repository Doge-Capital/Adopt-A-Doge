import React from "react";
import Nftcard from "../../components/Nftcard";
import { FetchNft } from "../../context/FetchNFT";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

function EligibleNfts() {
  const wallet = useWallet();
  const [selectedNfts, setSelectedNfts] = useState<any[]>([]);

  return (
    <div className="bg-bg flex flex-col items-center h-[90vh]">
      <div className="flex gap-20 px-12 overflow-hidden font-inter"></div>
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
      </div>

      {selectedNfts.length > 0 && selectedNfts.length < 5 && (
        <div className="sticky bottom-0 w-full px-12 bg-bg z-50">
          <div className="flex align-middle justify-between py-4">
            <div className="text-[1.125rem] opacity-[0.75] flex-row items-center gap-4 font-medium ">
              <h3>NFTs Selected : {selectedNfts.length}</h3>
              <h3>Tickets Received : {selectedNfts.length}</h3>
              <h3 className="text-[#D44C4C] text-lg font-bold mt-10">
                NOTE: You can only burn 4 NFTs at once.
              </h3>
            </div>
            <div>
              <button className="text-lg bg-[#2278F9] rounded-sm text-white px-4 py-2 text-center">
                Burn and receive tickets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EligibleNfts;

const WalletNotConnected = () => {
  return (
    <div className="flex-row text-center mx-auto w-fit mt-20">
      <h3 className="text-[#898989] text-lg font-semibold">
        Connect wallet to display NFTs <br />
      </h3>
      <h3 className="text-[#D44C4C] text-lg font-bold mt-10">
        Use Burner Wallet!
      </h3>
    </div>
  );
};
