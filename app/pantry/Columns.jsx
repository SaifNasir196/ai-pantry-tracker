"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deletePantryItem, updatePantryItem } from "@/app/actions/pantry"
import { useQueryClient } from '@tanstack/react-query'
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image"


const createColumns = (pantryId) => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },

  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="">{row.getValue("quantity") + " "+ row.getValue("unit")} </div>
    }

  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  {
    accessorKey: "expirationDate",
    header: "Expiration",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
      const formRef = useRef();

      const queryClient = useQueryClient();
      const handleDelete = async () => {
        await deletePantryItem({pantryId: pantryId, itemId: row.original.id});
        queryClient.invalidateQueries(['pantryItems', pantryId])
      }

      const handleSubmit = async (event) => {
        const formData = new FormData(formRef.current);
        formData.append('pantryId', pantryId);
        formData.append('itemId', row.original.id);
        updatePantryItem(formData);
    };
 
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild >
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>View item</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{row.original.name}</DialogTitle>
                <DialogDescription>
                  <form ref={formRef} action={handleSubmit}>
                    <div className="flex flex-col gap-2 mt-4">
                      <Input placeholder="Name" name="name" defaultValue={row.original.name}/>
                      <div className="flex gap-2">
                          <Input  placeholder="Quantity" type="number" name="quantity"  defaultValue={row.original.quantity}/>
                          <Input placeholder="Unit" name="unit" defaultValue={row.original.unit} />
                      </div>
                      <Input placeholder="Expiration Date" type="date" name="expirationDate" defaultValue={row.original.expirationDate} />
                      <Textarea placeholder="Notes" name="notes" defaultValue={row.original.notes} />
                      <Input type="file" name="image" />
                      {
                        row.original.image && <img src={row.original.image} width={400} height={400} />
                      }
                      <Button type="submit">Update</Button>
                    </div>
                  </form>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      )
    },
  },
]

export default createColumns;