import Link from 'next/link'
import React from 'react'

const MainCaterory = () => {
  return (
    <div>
      <div className='grid grid-cols-2 justify-center gap-1 h-28 px-7'>
        <Link href={'/category/slot'} className='relative h-24 cursor-pointer'>
            <img className='absolute left-0 top-0 w-full h-full' src="/images/slot-bf07af03.png" alt="" />
            <img className='absolute top-0 w-24 left-4 h-full' src="/images/slot.png" alt="" />
            <h3 className='absolute right-6 bottom-4 text-xl text-cardbg font-semibold'>Slot</h3>
        </Link>
        <Link href={'/category/sports'} className='relative h-24 cursor-pointer'>
            <img className='absolute left-0 top-0 w-full h-full' src="/images/flash-eac62fa4.png" alt="" />
            <img className='absolute top-0 w-24 left-4 h-full' src="/images/sports.png" alt="" />
            <h3 className='absolute right-6 bottom-4 text-xl text-cardbg font-semibold'>Sports</h3>
        </Link>
      </div>
       <div className='grid grid-cols-2 justify-center gap-1 h-28 px-7'>
        <Link href={'/category/fishing'} className='relative h-24 cursor-pointer'>
            <img className='absolute left-0 top-0 w-full h-full' src="/images/flash-eac62fa4.png" alt="" />
            <img className='absolute top-0 w-24 left-2 h-full' src="/images/fishing.png" alt="" />
            <h3 className='absolute right-6 bottom-4 text-xl text-cardbg font-semibold'>Fishing</h3>
        </Link>
        <Link href={'/category/live'} className='relative h-24 cursor-pointer'>
            <img className='absolute left-0 top-0 w-full h-full' src="/images/flash-eac62fa4.png" alt="" />
            <img className='absolute top-0 w-24 left-2 h-full' src="/images/live.png" alt="" />
            <h3 className='absolute right-6 bottom-4 text-xl text-cardbg font-semibold'>Live</h3>
        </Link>

       
      </div>
    </div>
  )
}

export default MainCaterory
