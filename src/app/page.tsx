 
 'use client '
 import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
const page = () => {
  return (
    <div className='  flex  justify-end items-end mt-4 pr-3'>
      <Link href='/login'> <Button>  click to Login </Button></Link> 
      
    </div>
  )
}

export default page
