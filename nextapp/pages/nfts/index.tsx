import React from "react";
import { FetchNft } from "../../context/FetchNFT";
import { useState } from "react";
import { useProgram } from "../../context/Program";
import { DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

function EligibleNfts() {
    const { burnNfts, wallet } = useProgram();
    const [selectedNfts, setSelectedNfts] = useState<DigitalAsset[]>([]);
    const [lastBurnSignature, setLastBurnSignature] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleBurnNftsButtonClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        setLoading(true);

        if (selectedNfts && selectedNfts.length <= 3) {
            try {
                const burnSignature = await burnNfts(selectedNfts);
                router.push("/congrats");
                setLastBurnSignature(burnSignature);
                console.log("Burn signature: " + burnSignature);
                toast.success(`Burn signature: ${burnSignature}`);
            } catch (error) {
                console.error("Burn error: " + error);
                toast.error("An error occurred, check the console for details.");
            } finally {
                setLoading(false);
                setSelectedNfts([]);
            }
        } else {
            throw new Error("Wrong NFTs amount to burn: " + selectedNfts.length);
        }
    };

    const handleUnselectAllbuttonClick = () => {
        setSelectedNfts([]);
    }

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

    return (
        <div className="bg-bg flex flex-col items-center min-h-screen">
            <div className="flex gap-20 px-12 overflow-hidden font-inter"></div>
            <div className="mx-5 mt-12 pb-7 container flex flex-col flex-wrap">
                <h3 className="text-center my-4 font-semibold text-[1.625rem] opacity-75">
                    Your Eligible NFTs
                </h3>
                {wallet ? (
                    <FetchNft
                        selectedNfts={selectedNfts}
                        setSelectedNfts={setSelectedNfts}
                        burnSig={lastBurnSignature}
                    />
                ) : (
                    <WalletNotConnected />
                )}
            </div>

            {selectedNfts.length > 0 && (
                <div className="sticky bottom-0 w-full px-2 sm:px-12 bg-bg z-50 border-t-4 border-slate-300">
                    <div className="flex align-middle justify-between py-4 gap-1">
                        <div className="text-[1.125rem] opacity-[0.75] flex-row items-center gap-4 font-medium ">
                            <h3>NFTs Selected : {selectedNfts.length}</h3>
                            <h3>Tickets to receive : {selectedNfts.length}</h3>
                            <h3 className=" text-red-500 text-lg font-bold mt-10">
                                Burn up to 3 NFTs at once.
                            </h3>
                        </div>
                        <div className="flex flex-col gap-2 justify-center">
                            <button className="text-lg bg-[#2278F9] rounded-sm text-white px-4 py-2 text-center border-2 border-[#2278F9] disabled:bg-slate-500 hover:bg-white hover:text-[#2278F9]" onClick={(e) => { handleBurnNftsButtonClick(e) }} disabled={loading}>
                                {loading ? `Burning selected NFT(s)` : `Burn and receive tickets`}
                            </button>
                            <button className="text-lg rounded-sm text-[#2278F9] border-2 border-[#2278F9] px-4 py-2 text-center disabled:bg-slate-500 hover:bg-slate-200" onClick={handleUnselectAllbuttonClick} disabled={loading}>
                                Unselect all
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EligibleNfts;