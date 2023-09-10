import { DigitalAsset, fetchAllDigitalAssetByOwner, fetchJsonMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { FC, useEffect, useState } from "react";
import { Image, Text } from "@nextui-org/react";
import { BsCheck } from "react-icons/bs";
import { useProgram } from "./Program";
import noImg from "../public/assets/images/no-img.png";

type NftData = [DigitalAsset, string];

export const FetchNft: FC<{
    selectedNfts: DigitalAsset[];
    setSelectedNfts: (nfts: DigitalAsset[]) => void;
    burnSig: string;
}> = ({ selectedNfts, setSelectedNfts, burnSig }) => {
    const [nftData, setNftData] = useState<null | NftData[]>(null);
    const [spinner, setSpinner] = useState<boolean>(false);

    const { umi, wallet } = useProgram();

    const fetchUserAssets = async () => {
        setSpinner(true);
        if (!wallet) {
            return;
        }

        const userAssets = await fetchAllDigitalAssetByOwner(umi, fromWeb3JsPublicKey(wallet.publicKey), { tokenAmountFilter: (amount) => amount > 0 });
        let nftData: NftData[] = [];

        for (const asset of userAssets) {
            if (asset.mint.decimals === 0) {
                try {
                    const response = await fetch(asset.metadata.uri);
                    if (response.ok) {
                        const data = await response.json();
                        const imageField = data.image;
                        nftData.push([asset, imageField]);
                    } else {
                        console.error("Fetching image failed: " + response);
                    }
                } catch (error) {
                    console.error("Error parsing JSON response:", error);
                }
            }
        }

        setNftData(nftData);
        setSpinner(false);
    }

    // fetch nfts when connected wallet changes
    useEffect(() => {
        fetchUserAssets();
        setSelectedNfts([]);
    }, [wallet, burnSig]);

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
                                    src={nftData[1] ? nftData[1] : noImg.src}
                                    width={200}
                                    height={150}
                                    className="rounded-sm"
                                />
                                <Text h5 className="text-sm text-center font-semibold">
                                    {nftData[0].metadata.name ? nftData[0].metadata.name : "Unknown"}
                                </Text>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    }
};
