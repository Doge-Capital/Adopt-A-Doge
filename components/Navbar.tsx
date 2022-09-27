import React from 'react'
import {FaDiscord,FaTwitter} from 'react-icons/fa'
import {Text} from '@nextui-org/react'

function Navbar() {
  return (
    <div className='flex justify-end h-[10vh] items-center mx-12'>
<Text className='text-3xl hover:translate-y-[-2px]'><FaTwitter/></Text>
<Text className='text-3xl ml-6 hover:translate-y-[-2px]'><FaDiscord/></Text>
    </div>
  )
}

export default Navbar