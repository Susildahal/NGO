import React from 'react'
import { Spinner } from '../components/ui/spinner'

function Spinners() {
  return (
    <div className=' fixed inset-0 z-50 bg-black/80 dark:bg-white/80 bg-opacity-50 flex items-center justify-center'>
      <div className='absolute  z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 '>
        <Spinner className=' size-10' />
      </div>
    </div>
  )
}

export default Spinners

