import React from "react";
import Navbar from "../../components/Navbar";
import { Image } from "@nextui-org/react";
import { useRouter } from 'next/router';

function Home() {
    const router = useRouter();

    return (
        <div className="bg-[#F5F5F5] font-inter h-full">
            <Navbar />

            <div className="pb-12 mx-12 flex flex-col justify-center items-center">

                <div className="w-screen bg-header-banner bg-no-repeat bg-center bg-contain h-60 flex flex-col justify-center">
                    <div className="flex justify-center items-center w-fit mx-auto mb-5">
                        <h3 className="text-4xl font-bold text-center">
                            Earn with your rugged NFTs
                        </h3>
                    </div>
                    {/* <h3 className="text-5xl font-bold text-center">
                        Earn with your rugged NFTs
                    </h3> */}
                    <p className="opacity-50 font-semibold text-xl text-center max-w-[40ch] flex mx-auto">
                        A simple & secure way for people to have a chance to earn with their
                        rugged NFTs
                    </p>
                </div>

                <div className="flex justify-center gap-7 mx-16 mt-12 mb-48">
                    <div className="flex flex-col items-center text-center">
                        <Image src="/assets/images/nft_gib_icon.svg" width={250} className='hover:scale-[1.05]' />
                        <p className="text-lg font-medium">
                            Give us your rugged NFTs
                        </p>
                        <p className="text-sm opacity-50 font-semibold mt-1">
                            Small fee attatched with the transaction
                        </p>
                    </div>

                    <Image src="/assets/images/right_arrow_icon.png" width={40} className='hover:scale-[1.05]' />

                    <div className="flex flex-col items-center text-center">
                        <Image src="/assets/images/ticket_icon.svg" width={250} className='hover:scale-[1.05]' />
                        <p className="text-lg font-medium">
                            Receive Tickets
                        </p>
                        <p className="text-sm opacity-50 font-semibold mt-1">
                            Small fee attatched with the transaction
                        </p>
                    </div>

                    <Image src="/assets/images/right_arrow_icon.png" width={40} className='hover:scale-[1.05]' />

                    <div className="flex flex-col items-center text-center">
                        <Image src="/assets/images/nft_token_icon.svg" width={250} className='hover:scale-[1.05]' />
                        <p className="text-lg font-medium">
                            Participate in raffles
                        </p>
                        <p className="text-sm opacity-50 font-semibold mt-1">
                            Small fee attatched with the transaction
                        </p>
                    </div>
                </div>

                <div className="mx-16 mb-12">

                    <p className="font-semibold text-xl text-center">
                        What do we do with the fees collected?
                    </p>

                    <div className="flex justify-center mt-24 gap-5">
                        <div className="flex flex-col items-center text-center w-60">
                            <div className="rounded-full bg-slate-200 w-52 h-52 flex justify-center">
                                <Image src="/assets/images/money_icon.svg" width={65} className='hover:scale-[1.05]' />
                            </div>
                            <p className="text-base opacity-50 font-semibold mt-3">
                                We pull the collected fees
                            </p>
                        </div>

                        <Image src="/assets/images/back_arrow_icon.svg" width={40} className='hover:scale-[1.05]' />

                        <div className="flex flex-col items-center text-center w-60">
                            <div className="rounded-full bg-slate-200 w-52 h-52 flex justify-center">
                                <Image src="/assets/images/paw_icon.svg" width={85} className='hover:scale-[1.05]' />
                            </div>
                            <p className="text-base opacity-50 font-semibold mt-3">
                                Buy floor Doge Capital NFTs
                            </p>
                        </div>

                        <Image src="/assets/images/back_arrow_icon.svg" width={40} className='hover:scale-[1.05]' />

                        <div className="flex flex-col items-center text-center w-60">
                            <div className="rounded-full bg-slate-200 w-52 h-52 flex justify-center">
                                <Image src="/assets/images/crown_icon.svg" width={110} className='hover:scale-[1.05]' />
                            </div>
                            <p className="text-base opacity-50 font-semibold mt-3">
                                Create raffles for you
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-xl bg-[#2278F9] px-10 rounded-full text-white w-fit flex mx-auto py-4 hover:border-[#2278F9] border-2 hover:bg-white hover:text-[#2278F9] cursor-pointer mt-14 mb-14" onClick={() => router.push('/nfts')}>
                    Get Started
                </div>

            </div>
        </div>
    );
}

export default Home;
