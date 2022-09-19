import React from 'react'
import { Button } from "@nextui-org/react";

function EligibleNfts() {
  return (
    <div className='px-12'>
<div className="flex justify-evenly">
    <div className="bg-blue w-fit h-fit p-4 px-16 w-[25vw]  rounded-sm font-semibold">
        <h5 className=' text-lg opacity-[0.75]'>Current Collection</h5>
        <h3 className='text-3xl opacity-[0.75]'>Doge Capital</h3>
    </div>
    <div className="bg-green w-fit h-fit p-4 px-16 w-[25vw] rounded-sm font-semibold">
        <h5 className=' text-lg opacity-[0.75]'>Tickets sold</h5>
        <h3 className='text-3xl opacity-[0.75]'>50/100</h3>
    </div>
    <div className="bg-purple w-fit h-fit p-4 px-16 w-[25vw] rounded-sm font-semibold">
        <h5 className=' text-lg opacity-[0.75]'>Your Tickets</h5>
        <h3 className='text-3xl opacity-[0.75]'>0</h3>
    </div>
</div>
<div className="">
    <h3 className='text-center mt-4 font-semibold text-[1.625rem]'>Your Eligible NFTs</h3>
<div className=""></div>
</div>
<div className="h-[20vh] ">
<div className="text-[1.125rem] opacity-[0.75] border-t-[1px] pt-4 flex">
<h3>NFTs Selected : 00</h3>
<h3 className='mx-12'>Tickets Received : 00</h3>
</div>
<button className='flex ml-auto mr-0 mt-4 text-lg bg-grey rounded-sm text-white px-2'>Burn and receive tickets</button>
</div>

    </div>
  )
}

export default EligibleNfts