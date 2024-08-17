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
import { Loader2 } from 'lucide-react'

const CreatePantry = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const {mutate: addPantry, isPending} = useMutation({
    mutationFn: async (formData) => {
      await createPantry(formData);
      setOpen(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPantries'])
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addPantry(formData);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
        <Button>
         <span className='text-2xl font-medium mr-2 mb-1'>+</span> Create Pantry
        </Button>
        </DialogTrigger>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Create Pantry</DialogTitle>
        </DialogHeader>
            <form onSubmit={handleSubmit} method='post'>
                <div className="flex flex-col gap-2 mt-5">
                    <Label htmlFor="name">Pantry Name</Label>
                    <Input name="name" label="name" placeholder="Pantry Name" />
                    <Button disabled={isPending} type="submit">
                        {isPending ? (<><Loader2 className='animate-spin' />Creating...</>) : 'Create'}
                    </Button>
                </div>
            </form>
            
    </DialogContent>
    </Dialog>

  )
}

export default CreatePantry