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
    accessorFn: (row) => `${row.quantity} ${row.unit}`,
    id: "quantity",
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
      return <div className="text-left">{row.getValue("quantity")} </div>
    }

  },
  {
    accessorKey: "expirationDate",
    header: "Expiration",
    cell: ({ row }) => {
      const timestamp = row.original.expirationDate;
      if (timestamp && typeof timestamp.seconds === 'number') {
        // Convert Firestore Timestamp to JavaScript Date
        const date = new Date(timestamp.seconds * 1000);
        
        // Format the date
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
        return <div>{formattedDate}</div>;
      } else {
        // If it's not a valid timestamp, return a placeholder or the original value
        return <div>{'N/A'}</div>;
      }

    }
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
      const formRef = useRef();
      const [isLoading, setIsLoading] = useState(false);

      const queryClient = useQueryClient();
      const handleDelete = async () => {
        await deletePantryItem({pantryId: pantryId, itemId: row.original.id});
        queryClient.invalidateQueries(['pantryItems', pantryId])
      }

      const handleSubmit = async (event) => {
        setIsLoading(true);
        console.log('isloading', isLoading);
        const formData = new FormData(formRef.current);
        formData.append('pantryId', pantryId);
        formData.append('itemId', row.original.id);
        updatePantryItem(formData);
        queryClient.invalidateQueries(['pantryItems', pantryId])
        setIsLoading(false);
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
              </DialogHeader>
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
                      <Button type="submit" disabled={isLoading}> { isLoading ? "Updating" : "Update"}</Button>
                      {isLoading}
                    </div>
                  </form>
            </DialogContent>
          </Dialog>
        </>
      )
    },
  },
]

export default createColumns;