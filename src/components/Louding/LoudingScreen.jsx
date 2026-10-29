import { Spinner } from '@heroui/react'
import React from 'react'

export default function LoudingScreen() {
  return (
    <div className='text-center py-50'>
        <Spinner color="default" label="Loading..." />;
    </div>
  )
}
