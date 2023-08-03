import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { FC, useEffect, useState } from "react"
import { Image, Text } from "@nextui-org/react"
import { BsCheck } from 'react-icons/bs'
import { set } from "@project-serum/anchor/dist/cjs/utils/features"



export const FetchNft: FC<{selectedNfts: any[], setSelectedNfts: (nfts: any[]) => void}> = ({selectedNfts, setSelectedNfts}) => {
    const [nftData, setNftData] = useState<null | any[]>(null)
    const [spinner, setSpinner] = useState<boolean>(false);
    const { connection } = useConnection()
    const wallet = useWallet()
    const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet))

    // fetch nfts
    const fetchNfts = async () => {
        setSpinner(true)
        if (!wallet.connected) {
            return
        }

        if (!wallet.publicKey) {
            return;
        }

        // fetch NFTs for connected wallet
        const nfts = await metaplex.nfts()
        const userNfts = await nfts.findAllByOwner({ owner: wallet.publicKey })

        // fetch off chain metadata for each NFT
        let nftData = []
        for (let i = 0; i < userNfts.length; i++) {
            try {
                let fetchResult = await fetch(userNfts[i].uri)

                if (!fetchResult.ok) {
                    console.error(`HTTP error! status: ${fetchResult.status}`);
                    continue; // Skip this iteration and proceed to the next one
                }

                let json = await fetchResult.json()
                nftData.push(json)
                console.log(json);
            } catch (error) {
                console.error('Fetch error: ', error);
                // You can also use 'continue' here if you want to skip any iteration that throws an error
            }
        }
        // set state
        setNftData(nftData)
        setSpinner(false)
    }

    // fetch nfts when connected wallet changes
    useEffect(() => {
        fetchNfts()
    }, [wallet.publicKey])

    if (spinner) {
        return (
            <div className="flex justify-center items-center">
                <div>Loading...</div>
            </div>
        )
    } else {
        return (
            <>
                {nftData && (
                    <div className="flex flex-wrap justify-center mt-4 gap-7">
                        {nftData.map((nft, i) => (
                            <div
                                style={{ boxShadow: ' 0px 4px 50px rgba(0, 0, 0, 0.13)' }}
                                className={`bg-white p-1 rounded-sm hover:scale-[1.02] ${selectedNfts.includes(nft) ? 'selected-nft' : ''}`}

                                key={i}
                                onClick={() => {
                                    if (selectedNfts && selectedNfts.includes(nft)) {
                                        setSelectedNfts(selectedNfts.filter(item => item !== nft));
                                    } else {
                                        setSelectedNfts([...selectedNfts, nft]);
                                    }
                                }}
                            >

                                {selectedNfts.includes(nft) && <div className="absolute bg-[#79BD9A] z-20 rounded-full mt-[-0.5rem] ml-[-0.5rem] border-[5px] border-bg text-lg">
                                    <Text color='white'> <BsCheck /></Text>
                                </div>}

                                <Image src={nft.image} width={200} className="rounded-sm" />
                                <Text h5 className='text-sm text-center font-semibold'>{nft.name}</Text>

                            </div>
                        ))}
                    </div>
                )}
            </>
        )
    }
}