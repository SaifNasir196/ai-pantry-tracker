"use server"

import { pro_model } from "@/lib/utils";




export const analyzeImage = async (base64Image) => {

    try {
        const result = await pro_model.generateContent([
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                }
            },
            { text: "Name the item you see, this will be used to store it in a database. only give the name of the item, no text around it" },
        ]);
        console.log('Result:', result.response.text());
        return result.response.text();
    } catch (error) {
        console.error('Error analyzing with Gemini:', error);
        throw error;
    }
};

