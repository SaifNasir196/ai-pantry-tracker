"use client"
import React, { useState, useRef } from "react";
import { Camera } from 'react-camera-pro';
import { db } from "@/app/firebaseConfig";
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Button } from "./ui/button";
import { CameraIcon } from "lucide-react";
import { analyzeImage } from "@/app/actions/gemini";

const CameraDialog = () => {
    const camera = useRef(null);

    const [capturedImage, setCapturedImage] = useState(null);
    const [classification, setClassification] = useState(null);
    const [model, setModel] = useState(null);
    const [isIdentifying, setIsIdentifying] = useState(false);

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
    };



    const addToDatabase = async () => {
        console.log('Adding item to database');
        if (classification && capturedImage) {
        try {
            // Upload image to Firebase Storage
            const storageRef = ref(storage, `items/${Date.now()}.jpg`);
            await uploadString(storageRef, capturedImage, 'data_url');
            const imageUrl = await getDownloadURL(storageRef);

            // Add item to Firestore
            const docRef = await addDoc(collection(db, 'items'), {
            name: classification,
            imageUrl: imageUrl,
            timestamp: new Date()
            });

            console.log("Document written with ID: ", docRef.id);
            alert('Item added to database!');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert('Error adding item to database');
        }
        }
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
                    <Button onClick={captureImage} className="mt-2"><CameraIcon size={20} /></Button>
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
                {classification && (
                    <div className="mt-4 w-full">
                        Identified as: {classification}
                        <Button className="w-full mt-3" onClick={addToDatabase}>Add to Database</Button>
                    </div>
                )}
            </div>
        </div>
    );

}

export default CameraDialog;
