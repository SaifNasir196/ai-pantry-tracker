import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { createPantry } from '@/app/actions/pantry'
import { useMutation, useQueryClient } from '@tanstack/react-query'


const CreatePantry = () => {
  const queryClient = useQueryClient();

  const {mutate: addPantry} = useMutation({
    mutationFn: async (formData) => {
      console.log('formData', formData);
      createPantry(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPantries'])
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addPantry(formData);
  }

  return (
    <Dialog>
    <DialogTrigger asChild>
        <Button>
         <span className='text-2xl font-medium mr-2 mb-1'>+</span> Create Pantry
        </Button>
        </DialogTrigger>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Create Pantry</DialogTitle>
        <DialogDescription>


            
            <form onSubmit={handleSubmit} method='post'>
                <div className="flex flex-col gap-2 mt-5">
                    <Label htmlFor="name">Pantry Name</Label>
                    <Input name="name" label="name" placeholder="Pantry Name" />
                    <Button type="submit" >Submit</Button>
                </div>
            </form>
            
        </DialogDescription>
        </DialogHeader>
    </DialogContent>
    </Dialog>

  )
}

export default CreatePantry