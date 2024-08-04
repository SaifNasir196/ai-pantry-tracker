"use client"
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserPantries } from '@/app/actions/pantry' // Adjust the import path as needed
import { Button } from '@/components/ui/button'
import { deletePantry } from '@/app/actions/pantry'
import { Skeleton } from "@/components/ui/skeleton"




const page = () => {
  const queryClient = useQueryClient();
  const { data: pantries, isLoading, error } = useQuery({
    queryKey: ['userPantries'],
    queryFn: async () => {
      const data = await getUserPantries();
      return data;
    }
  })

  const {mutate: deleteFunc} = useMutation({
    mutationFn: async (formData) => {
      await deletePantry(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPantries'])
    },
  })

  if (error) {
    return <div>Error: {error.message}</div>
  }

 


  return (
    <div className='mt-20  mx-56 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 sm: gap-6 transition-all'>
      {pantries && pantries.length !== 0 ? pantries.map((pantry) => {
        return (
          <div key={pantry.id} className="p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold">{pantry.name}</h2>
            <Button onClick={() => (deleteFunc({ pantryId: pantry.id }))} variant="secondary" className="mt-2 cursor-pointer">Delete</Button>
          </div>
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