import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from './ui/button';
import { deletePantry } from '@/app/actions/pantry';
import { Loader2Icon } from 'lucide-react';


const PantryItem = ({ pantry }) => {
    const queryClient = useQueryClient();

    const {mutate: deleteFunc, isPending: deletePending} = useMutation({
        mutationFn: async () => {
            await deletePantry({pantryId: pantry.id});
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userPantries'])
        },
    })

    return (
        <div className="p-6 border rounded-lg shadow-md w-96 flex flex-col justify-between h-44">
            <h2 className="text-xl font-bold">{pantry.name}</h2>
            <Button disabled={deletePending} onClick={deleteFunc} variant="secondary" className="mt-2 cursor-pointer w-1/5">
                {deletePending ? <Loader2Icon className='animate-spin' /> : 'Delete'}
            </Button>
        </div>
    )
}

export default PantryItem