"use client"
import { useState, useCallback, useMemo, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CameraDialog from "@/components/CameraDialog"
 
import {
  flexRender,
  SortingState,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getUserPantries, getPantryItems, addItemToPantry } from "@/app/actions/pantry"
import createColumns from "./Columns"
import { Camera, CameraIcon } from "lucide-react"



export default 
function DataTable() {
    const [selectedPantry, setSelectedPantry] = useState(null)
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [rowSelection, setRowSelection] = useState({})
    const formRef = useRef(null);
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const openDialog = () => setIsDialogOpen(true);
    const closeDialog = () => setIsDialogOpen(false);




    const columns = createColumns(selectedPantry);


    const { data: pantries, isLoading, error } = useQuery({
        queryKey: ['userPantries'],
        queryFn: async () => {
        const data = await getUserPantries();
        return data;
        }
    })

    const { data: items, isLoading: isItemsLoading, error: itemsError } = useQuery({
        queryKey: ['pantryItems', selectedPantry],
        queryFn: async () => {
            const data = await getPantryItems({ pantryId: selectedPantry });
            return data;
        }
    })

    const memoizedItems = useMemo(() => items || [], 
        [items]
    );

    const {mutate: addItem} = useMutation({
        mutationFn: async (formData) => {
            formData.append('pantryId', selectedPantry);
            await addItemToPantry(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userPantries'])
        },
    })

    const handleSubmit = async (event) => {
        const formData = new FormData(formRef.current);
        console.log('form data', formData);
        addItem(formData);
    };

    const handlePantrySelect = useCallback((value) => {
        setSelectedPantry(value);
        
    }, []);

    const [isGenerating, setIsGenerating] = useState(false);
    const [recipes, setRecipes] = useState("");

    const handleGenerateRecipes = async () => {
        openDialog();
        try {
            console.log('Generate recipes');
            setIsGenerating(true);
            const res = await fetch('/api/gemini/recipe', {
                method: 'POST',
                body: JSON.stringify({ pantryId: selectedPantry }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setRecipes(res.response);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
        
            const clonedRes = res.clone(); // Clone the response        
        
            const data = await res.json();

            if (data && data.response) {
                setRecipes(data.response);
            } else {
                console.error('Unexpected response format:', data);
                setRecipes('Unexpected response format');
            }
        } catch (error) {
            console.error('Error generating recipes:', error);
            setRecipes(`Error generating recipes: ${error.message}`);
        } finally {
        setIsGenerating(false);
        }

    };


    const table = useReactTable({
        data: memoizedItems,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    })

    

    // const pantries = [
    //     {
    //         id: 1,
    //         name: "Pantry 1"
    //     },
    //     {
    //         id: 2,
    //         name: "Pantry 2"
    //     }
    // ]

    return (
        <div className="xl:mx-64 lg:mx-48 mx-20 transition-all">
            <div className="flex items-center py-4 mt-10 gap-4">
                {/* pantry select */}
                <Select onValueChange={handlePantrySelect} value={selectedPantry || ""} >
                    <SelectTrigger className="w-1/6">
                        <SelectValue placeholder="Select Pantry"/>
                    </SelectTrigger>

                    <SelectContent>
                        {pantries?.map((pantry) => {
                            return (
                                <SelectItem key={pantry.id} value={pantry.id.toString()}>
                                    {pantry.name}
                                </SelectItem>
                            )
                        }
                        )}
                    </SelectContent>
                </Select>
                
                <Input 
                    placeholder="Filter by item..."
                    value={(table.getColumn("name")?.getFilterValue() ) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="flex flex-1 min-w-24"
                />

                <Button variant="secondary" className="w-fit" disabled={!selectedPantry} onClick={handleGenerateRecipes}>
                    Generate recipes
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[250rem]">
                    <DialogHeader>
                    <DialogTitle>Generate Recipes</DialogTitle>
                    <DialogDescription>
                    {/* <Button variant="secondary" className="w-fit" disabled={!selectedPantry || isGenerating} >
                        Generate recipes
                    </Button> */}
                        <form>
                            <ScrollArea className="flex flex-col gap-2 mt-4 h-[400px] ">
                                {isGenerating ? (
                                    <div>Generating...</div>
                                ) : recipes ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {recipes}
                                    </ReactMarkdown>
                                ) : (
                                    <div>Click to generate receipies</div>
                                )}
                                
                            </ScrollArea>
                        </form>
                    </DialogDescription>
                    </DialogHeader>
                </DialogContent>
                </Dialog>

                <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="w-fit" disabled={!selectedPantry}>
                        <CameraIcon  className="w-6 h-6" />
                    </Button>
                </DialogTrigger>

                <DialogContent className="w-fit h-fit">
                    <DialogDescription>
                        <CameraDialog selectedPantry={selectedPantry} />
                    
                    </DialogDescription>
                </DialogContent>
                </Dialog>

                

                <Dialog>

                <DialogTrigger asChild>
                    <Button className="w-fit px-5" disabled={!selectedPantry}>Add item</Button>
                </DialogTrigger>
                <DialogContent className="w-96">
                    <DialogHeader>
                    <DialogTitle>Add item</DialogTitle>
                    </DialogHeader>
                        <form action={handleSubmit} ref={formRef}>
                            <div className="flex flex-col gap-2 mt-4">
                                <Input placeholder="Name" name="name" />
                                <div className="flex gap-2">
                                    <Input placeholder="Quantity" type="number" name="quantity"/>
                                    <Input placeholder="Unit" name="unit" />
                                </div>
                                <Input placeholder="Expiration Date" type="date" name="expirationDate" />
                                <Input type="file" name="image" />
                                <Textarea placeholder="Notes" name="notes" />
                                <Button type="submit">Add</Button>
                            </div>
                        </form>
                </DialogContent>
                </Dialog>

            </div>

            <div className="rounded-md border w-full">
                <Table>
                    <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                            <TableHead key={header.id}>
                                {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                    )}
                            </TableHead>
                            )
                        })}
                        </TableRow>
                    ))}
                    </TableHeader>
                    <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                            ))}
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-center mt-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} >
                    Next
                </Button>
            </div>
        </div>

    )
}
