import React from 'react'
import {FaDiscord,FaTwitter} from 'react-icons/fa'
import {Text} from '@nextui-org/react'

function Navbar() {
  return (
    <div className='flex justify-end h-[10vh] items-center mx-12'>
<Text className='text-2xl '><FaTwitter/></Text>
<Text className='text-2xl ml-6'><FaDiscord/></Text>
    </div>
  )
}

export default Navbar