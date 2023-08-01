import React from "react";
import { Image } from "@nextui-org/react";
import { useRouter } from "next/router";

function About() {
    const router = useRouter();

    return (
        <div className="bg-[#F5F5F5] font-inter h-screen">
            <div className="pb-12 mx-12 flex flex-col justify-center items-center">
                <h1 className="font-semibold text-4xl mb-20">
                    Creators:
                </h1>

                <div className="flex justify-between text-center gap-7">
                    <div>
                        <h2>Al</h2>
                        <p>Linux- and ChatGPT-maxi</p>
                    </div>

                    <div>
                        <h2>Elijah</h2>
                        <p>Loves Rust and Solana</p>
                    </div>

                    <div>
                        <h2>Arun</h2>
                        <p>Hates when Al uses ChatGPT</p>
                    </div>
                </div>
            </div>

            <div
                className="text-xl bg-[#2278F9] px-10 rounded-full text-white w-fit flex mx-auto py-4 hover:border-[#2278F9] border-2 hover:bg-white hover:text-[#2278F9] cursor-pointer mt-14 mb-14"
                onClick={() => router.back()}
            >
                Back
            </div>
        </div>
    );
}

export default About;