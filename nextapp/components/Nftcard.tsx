import React from 'react'
import { Image ,Text} from "@nextui-org/react"
import {BsCheck} from 'react-icons/bs'

function Nftcard() {
  return (
    <div style={{
        boxShadow:' 0px 4px 50px rgba(0, 0, 0, 0.13)'
    }} className='bg-white w-fit h-fit p-1 rounded-sm hover:scale-[1.02]'>
        <div className="absolute bg-[#79BD9A] z-20 rounded-full mt-[-0.5rem] ml-[-0.5rem] border-[5px] border-bg text-lg">
      <Text color='white'> <BsCheck/></Text>
        </div>
<Image src='/icon.png' width={200} className="rounded-sm"/>
<Text h5 className='text-sm text-center font-semibold'>Okay Bear #2245</Text>
    </div>
  )
}

export default Nftcard