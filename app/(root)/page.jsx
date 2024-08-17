"use client"
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserPantries } from '@/app/actions/pantry' // Adjust the import path as needed
import { Button } from '@/components/ui/button'
import { deletePantry } from '@/app/actions/pantry'
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2Icon } from 'lucide-react'
import PantryItem from '@/components/PantryItem'




const page = () => {
  const queryClient = useQueryClient();
  const { data: pantries, isLoading, error } = useQuery({
    queryKey: ['userPantries'],
    queryFn: async () => {
      const data = await getUserPantries();
      return data;
    }
  })



  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className='mt-20  mx-56 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 sm: gap-6 transition-all'>
      {pantries && pantries.length !== 0 ? pantries.map((pantry) => {
        return (
          <React.Fragment key={pantry.id}>
            <PantryItem pantry={pantry} />
          </React.Fragment>
        )
      }) : (

        <div className="text-center col-span-full">
          <h2 className="text-xl font-bold">No Pantries Found</h2>
          <h2 className="text-2xl font-bold">Create new pantry to add items.</h2>
        </div>
        
      )}
    </div>
  )
}

export default page 