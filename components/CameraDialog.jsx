"use client"
import React, { useState, useRef } from "react";
import { Camera } from 'react-camera-pro';
import { Button } from "./ui/button";
import { CameraIcon } from "lucide-react";
import { analyzeImage } from "@/app/actions/gemini";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addItemToPantry } from "@/app/actions/pantry";


const CameraDialog = ({ selectedPantry }) => {
    const camera = useRef(null);

    const [capturedImage, setCapturedImage] = useState(null);
    const [classification, setClassification] = useState(null);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const queryClient = useQueryClient();

    const captureImage = () => {
        const imageSrc = camera.current.takePhoto();
        setCapturedImage(imageSrc);
    };

    const identifyItem = async () => {
        if (!capturedImage) return;

        setIsIdentifying(true);

        try {
            const res = await analyzeImage(capturedImage.split(',')[1]);
            setClassification(res);
        } catch (error) {
            console.error("Error identifying item:", error);
            setClassification("Error identifying item");
        } finally {
            setIsIdentifying(false);
        }
        setOpenDialog(true);
    };


    const {mutate: addItem} = useMutation({
        mutationFn: async (formData) => {
            console.log('in mutation');
            formData.set('pantryId', selectedPantry);
            console.log('formData', formData);
            const capturedImageData = formData.get('capturedImage');
            if (capturedImageData) {
                const response = await fetch(capturedImageData);
                const blob = await response.blob();
                formData.set('image', blob, 'captured_image.jpg');
            }
            formData.delete('capturedImage'); // Remove the original data URL

            await addItemToPantry(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pantryItems'])
        },
    })

    const formRef = useRef(null);

    const handleSubmit = async (event) => {
        event.preventDefault();  // Add this line
        console.log('formRef', formRef.current);
        const formData = new FormData(formRef.current);
        console.log('Form Data:', formData);
        console.log('in submit')

        addItem(formData);
        setOpenDialog(false);
        setCapturedImage(null);

    };

    const retake = () => {
        setCapturedImage(null);
        setClassification(null);
    }


    return (
        <div className="w-[20rem] h-fit min-h-[25rem] flex items-end justify-center">
            
            { !capturedImage && (
                <>
                    <div className="-z-10">
                        <Camera ref={camera} />
                    </div>
                    <Button onClick={captureImage} className=" py-6 rounded-full"><CameraIcon size={20} /></Button>
                </>

            )}

            <div className="flex flex-col">
                {capturedImage && (
                    <>
                        <img src={capturedImage} alt="Captured Image" className="w-full h-auto" />
                        <div className="flex gap-2 mt-2 w-full">
                            <Button variant="secondary" className="w-full" onClick={retake}>Retake</Button>
                            <Button className="w-full" onClick={identifyItem} disabled={isIdentifying}>
                                {isIdentifying ? 'Identifying...' : 'Identify Item'}
                            </Button>
                            
                        </div>
                    </>
                )}
                
                    <div className="mt-4 w-full">

                               
                            
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>

                        <DialogContent className="w-96">
                            <DialogHeader>
                                <DialogTitle>Add item</DialogTitle>
                            </DialogHeader>

                                <form onSubmit={handleSubmit} ref={formRef} >
                                    <input type="hidden" name="pantryId" value={selectedPantry} />
                                    <div className="flex flex-col gap-2 mt-4">
                                        <Input placeholder="Name" name="name" defaultValue={classification} />
                                        <div className="flex gap-2">
                                            <Input placeholder="Quantity" type="number" name="quantity"/>
                                            <Input placeholder="Unit" name="unit" />
                                        </div>
                                        <Input placeholder="Expiration Date" type="date" name="expirationDate" />
                                        <Textarea placeholder="Notes" name="notes" />
                                        <Input type="hidden" name="capturedImage" value={capturedImage || ''} />
                                        <Button type="submit">Add</Button>
                                    </div>
                                </form>

                        </DialogContent>
                        </Dialog>

                    </div>
            </div>
        </div>
    );

}

export default CameraDialog;
