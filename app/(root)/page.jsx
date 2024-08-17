"use client"
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { getUserPantries } from '@/app/actions/pantry' // Adjust the import path as needed
import PantryItem from '@/components/PantryItem'




const page = () => {
  const { data: pantries, isLoading, error } = useQuery({
    queryKey: ['userPantries'],
    queryFn: async () => {
      const data = await getUserPantries();
      return data;
    }
  })

  if (isLoading) {
    return (
      <div className='mt-20  mx-56 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 sm: gap-6 transition-all'>
        {[...Array(6)].map((_, index) => <Skeleton key={index} className="w-96 h-44" />)}
      </div>
    )
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!pantries || pantries.length === 0) {
    return (
      <div className='flex flex-col mt-40 justify-center items-center'>
        <h2 className="text-xl font-bold">No Pantries Found</h2>
        <h2 className="text-2xl font-bold">Create new pantry to add items.</h2>
      </div>
      )
  }

  return (
    <div className='mt-20  mx-56 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 sm: gap-6 transition-all'>
      {pantries.map((pantry) => {
        return (
          <React.Fragment key={pantry.id}>
            <PantryItem pantry={pantry} />
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default page 