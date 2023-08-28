import React, { useEffect, useState } from "react";
import { Grid, Card, Text } from "@nextui-org/react";

interface WinnerType {
    Date: String;
    Winner: String;
    Claim: Boolean;
}
interface BoundType {
    low: number;
    high: number;
}

function Winners() {


    const [bound, setBound] = useState<BoundType>({ low: 0, high: 4 });
    const [winnerData, setWinnerData] = useState<WinnerType[] | any>([])
    const Data: WinnerType[] = [
        {
            Date: "12-12-2021",
            Winner: "0x123456789",
            Claim: true,
        },
        {
            Date: "12-12-2021",
            Winner: "0x123456789",
            Claim: false,
        },
        {
            Date: "12-12-2021",
            Winner: "0x123456789",
            Claim: true,
        },
        {
            Date: "12-12-2021",
            Winner: "0x123456789",
            Claim: true,
        },
        {
            Date: "12-12-2021",
            Winner: "0x123456789",
            Claim: true,
        },
        {
            Date: "12-12-2021",
            Winner: "0x123456789",
            Claim: true,
        },
    ];
    useEffect(() => {
        function MapData() {
            var winner: WinnerType[] = [];
            for (var i = bound.low; i < bound.high; i++) {
                winner.push(Data[i]);
                // console.log(Data[i]);
            }
            setWinnerData([...winnerData, winner])
        }
        MapData();
    }, [bound]);

    const viewMoreHandler = () => {
        bound.low += 5;
        bound.high += 5;
    };
    return (
        <div className="my-6 pb-12 border-b-[1px] border-[#4C82D4] mx-12 ">
            <h1 className="text-[2rem] font-bold text-center mt-6">Winners</h1>
            <div className="">
                <div className="grid grid-cols-5 mt-6 text-2xl opacity-50 font-semibold bg-[#F4F4F4] rounded-full">
                    <div className="col-span-1 text-center"> Date </div>
                    <div className="col-span-3 text-center"> Winner</div>
                    <div className="col-span-1 text-center"> Claim</div>
                </div>
                {Data?.map((item, index) => (
                    <div
                        className="grid grid-cols-5 mt-6 text-[1.5em] opacity-50"
                        key={index}
                    >
                        <div className="col-span-1 text-center"> {item?.Date} </div>
                        <div className="col-span-3 text-center">{item?.Winner} </div>
                        <div className={item?.Claim ? "col-span-1 text-center" : 'text-[#278B31] text-center'} >
                            {item?.Claim ? "Claimed" : "Claim"}{" "}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={viewMoreHandler} className='text-[#2278F9] mt-6 font-semibold text-lg flex mx-auto'>view more</button>
        </div>
    );
}

export default Winners;
