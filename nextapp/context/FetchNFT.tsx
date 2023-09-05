import { useWallet } from "@solana/wallet-adapter-react";
import { Metadata, Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { FC, useEffect, useState } from "react";
import { Image, Text } from "@nextui-org/react";
import { BsCheck } from "react-icons/bs";
import { useProgram } from "./Program";

type NftData = [Metadata, string];

export const FetchNft: FC<{
    selectedNfts: Metadata[];
    setSelectedNfts: (nfts: Metadata[]) => void;
    burnSig: string;
}> = ({ selectedNfts, setSelectedNfts, burnSig }) => {
    const [nftData, setNftData] = useState<null | NftData[]>(null);
    const [spinner, setSpinner] = useState<boolean>(false);
    const { connection } = useProgram();
    const wallet = useWallet();
    const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

    // fetch nfts
    const fetchNfts = async () => {
        setSpinner(true);
        if (!wallet.connected) {
            return;
        }

        if (!wallet.publicKey) {
            return;
        }

        // fetch NFTs for connected wallet
        const userNfts = await metaplex.nfts().findAllByOwner({ owner: wallet.publicKey }) as Metadata[];

        let nftData: NftData[] = [];

        // fetch off chain metadata for each NFT and set [[nft, image]...[nft, image]] array
        for (const nft of userNfts) {
            try {
                let fetchResult = await fetch(nft.uri);

                if (!fetchResult.ok) {
                    console.error(`HTTP error! status: ${fetchResult.status}`);
                    continue; // Skip this iteration and proceed to the next one
                }

                let json = await fetchResult.json();
                nftData.push([nft, json.image]);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        }

        // set state
        setNftData(nftData);
        setSpinner(false);
    };

    // fetch nfts when connected wallet changes
    useEffect(() => {
        fetchNfts();
        setSelectedNfts([]);
    }, [wallet.publicKey, burnSig]);

    if (spinner) {
        return (
            <div className="flex justify-center items-center">
                <div>Loading...</div>
            </div>
        );
    } else if (nftData && nftData.length === 0) {
        return (
            <div className="flex text-center mx-auto w-fit mt-20">
                <h3 className="text-[#D44C4C] text-lg  font-semibold">
                    There are no NFTs in your wallet!
                </h3>
            </div>
        );
    }
    else {
        return (
            <>
                {nftData && (
                    <div className="flex flex-wrap justify-center mt-4 gap-8">
                        {nftData.map((nftData, key) => (
                            <div
                                style={{ boxShadow: " 0px 4px 50px rgba(0, 0, 0, 0.13)", margin: "6px" }}
                                className={`bg-white p-1 rounded-sm hover:scale-[1.02]  ${selectedNfts.includes(nftData[0]) ? "selected-nft" : ""}`}
                                key={key}
                                onClick={() => {
                                    if (selectedNfts && selectedNfts.includes(nftData[0])) {
                                        setSelectedNfts(
                                            selectedNfts.filter((item) => item !== nftData[0]),
                                        );
                                    } else if (selectedNfts.length < 3) {
                                        setSelectedNfts([...selectedNfts, nftData[0]]);
                                    }
                                }}
                            >
                                {selectedNfts.includes(nftData[0]) && (
                                    <div className="absolute bg-[#79BD9A] z-20 rounded-full mt-[-0.5rem] ml-[-0.5rem] border-[5px] border-bg text-lg">
                                        <Text color="white">
                                            {" "}
                                            <BsCheck />
                                        </Text>
                                    </div>
                                )}

                                <Image
                                    src={nftData[1]}
                                    width={200}
                                    height={150}
                                    className="rounded-sm"
                                />
                                <Text h5 className="text-sm text-center font-semibold">
                                    {nftData[0].name}
                                </Text>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    }
};
