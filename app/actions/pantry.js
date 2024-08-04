"use server"

import { auth } from '@clerk/nextjs/server';

import { db, storage } from '../firebaseConfig';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref, deleteObject } from 'firebase/storage';


// Create a new pantry
export async function createPantry(formData) {
    // const { userId } = auth();
    const userId = null;
    if (!userId) return { error: 'User not authenticated' };

    const name = formData.get('name');
    try {
        const pantryRef = await addDoc(collection(db, 'pantries'), {
            userId,
            name,
            createdAt: serverTimestamp(),
        });
        return pantryRef.id;
    } catch (error) {
        console.error(error)
    }
}

// Get all pantries for a user
export async function getUserPantries() {
    const { userId } = auth();
    if (!userId) return { error: 'User not authenticated' };



    const pantriesQuery = query(collection(db, 'pantries'), where('userId', '==', userId));
    const pantriesSnapshot = await getDocs(pantriesQuery);

    return pantriesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
    }));
}

export async function deletePantry({ pantryId }) {
    const { userId } = auth();
    if (!userId) return { error: 'User not authenticated' };

    const pantryRef = doc(db, 'pantries', pantryId);
    const pantryDoc = await getDoc(pantryRef);

    if (!pantryDoc.exists() || pantryDoc.data()?.userId !== userId) {
        return new Error('Pantry not found or access denied');
    }

    await deleteDoc(pantryRef);
}

// Add an item to a pantry
export async function addItemToPantry(formData) {

    const { userId } = auth();
    if (!userId) return { error: 'User not authenticated' };

    console.log('formData', formData);
    const pantryId = formData.get('pantryId');
    const name = formData.get('name');
    const quantity = Number(formData.get('quantity'));
    const unit = formData.get('unit');
    const expirationDate = formData.get('expirationDate');
    const notes = formData.get('notes');
    const image = formData.get('image');

    const pantryRef = doc(db, 'pantries', pantryId);
    const pantryDoc = await getDoc(pantryRef);

    if (!pantryDoc.exists() || pantryDoc.data()?.userId !== userId) {
        return ('Pantry not found or access denied');
    }

    let imageUrl = null;
    if (image) {
        const imageRef = ref(storage, `items/${Date.now()}.jpg`);
        await uploadBytes(imageRef, image)
        imageUrl = await getDownloadURL(imageRef);
    }

    const itemRef = await addDoc(collection(db, 'pantries', pantryId, 'items'), {
        name,
        quantity,
        unit,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        notes,
        image: imageUrl,
    });

    return itemRef.id;
}

// Get all items in a pantry
export async function getPantryItems(formData) {
    const { userId } = auth();
    if (!userId) return { error: 'User not authenticated' };

    const pantryId = formData.pantryId;

    if (!pantryId) {
        return { error: 'Pantry ID is required to get items' };
    };

    const pantryRef = doc(db, 'pantries', pantryId);
    const pantryDoc = await getDoc(pantryRef);

    if (!pantryDoc.exists() || pantryDoc.data()?.userId !== userId) {
        return { error: 'Pantry not found or access denied' };
    }

    const itemsSnapshot = await getDocs(collection(db, 'pantries', pantryId, 'items'));

    return itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}


// Delete an item from a pantry
export async function deletePantryItem(formData) {
    const { userId } = auth();
    if (!userId) return { error: 'User not authenticated' };

    console.log('formData', formData);

    const { pantryId, itemId } = formData

    const pantryRef = doc(db, 'pantries', pantryId);
    const pantryDoc = await getDoc(pantryRef);

    if (!pantryDoc.exists() || pantryDoc.data()?.userId !== userId) {
        return { error: 'Pantry not found or access denied' };
    }

    await deleteDoc(doc(db, 'pantries', pantryId, 'items', itemId));
}

// Update an item in a pantry
export async function updatePantryItem(formData) {
    const { userId } = auth();
    if (!userId) return { error: 'User not authenticated' };
    console.log('formData', formData);

    const pantryId = formData.get("pantryId")
    const itemId = formData.get("itemId")


    try {
        if (!pantryId || !itemId) {
            return { error: 'PantryId and ItemId are required' };
        }

        const pantryRef = doc(db, 'pantries', pantryId);
        const pantryDoc = await getDoc(pantryRef);

        if (!pantryDoc.exists() || pantryDoc.data()?.userId !== userId) {
            return { error: 'Pantry not found or access denied' };
        }

        const itemRef = doc(db, 'pantries', pantryId, 'items', itemId);
        const itemDoc = await getDoc(itemRef);
        if (!itemDoc.exists()) {
            return { error: 'Item not found' };
        }

        const currentItemData = itemDoc.data();
        const updates = {
            name: formData.get("name"),
            quantity: Number(formData.get("quantity")),
            unit: formData.get("unit"),
            expirationDate: formData.get("expirationDate") ? new Date(formData.get("expirationDate")) : null,
            notes: formData.get("notes"),
        };

        const newImage = formData.get('image');
        if (newImage) {
            // Delete old image if it exists
            if (currentItemData.image) {
                const oldImageRef = ref(storage, currentItemData.image);
                await deleteObject(oldImageRef);
            }
            // Upload new image
            const imageRef = ref(storage, `items/${Date.now()}.jpg`);
            await uploadBytes(imageRef, newImage);
            const imageUrl = await getDownloadURL(imageRef);
            updates.image = imageUrl;
        } else {
            // Keep the existing image URL if no new image is provided
            updates.image = currentItemData.image;
        }

        await updateDoc(itemRef, updates);
        return { success: true };  // Return a simple object
    } catch (error) {
        console.error('Error updating pantry item:', error);
        return { success: false, error: error.message };  // Return a simple object with error info
    }

}