import { NextResponse } from 'next/server';
import { model } from "@/lib/utils";
import { getPantryItems } from "@/app/actions/pantry";



const PROMPT = "Based on these ingredients, suggest some recipes:";


export async function POST(request) {
    try {
        const { pantryId } = await request.json();

        const pantryItems = await getPantryItems({ pantryId });

        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage(`${PROMPT}\n\nIngredients: ${pantryItems.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ')}`);

        console.log('Response:', result.response.text());
        return NextResponse.json({ response: result.response.text() });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Error processing your request' }, { status: 500 });
    }
}