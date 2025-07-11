import { useState, useEffect } from 'react';

interface ShoppingItem {
  id: string;
  name: string;
  purchased: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useShoppingList = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shopping-list`);
        if (!response.ok) throw new Error('Failed to fetch shopping list');
        const data = await response.json();
        setShoppingList(data);
      } catch (error) {
        console.error("Error fetching shopping list:", error);
      }
    };
    fetchShoppingList();
  }, []);

  const addItem = async (name: string) => {
    if (name.trim() === '') return;
    try {
      const response = await fetch(`${API_BASE_URL}/shopping-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const newItem = await response.json();
      setShoppingList((prevList) => [...prevList, newItem]);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const togglePurchased = async (id: string) => {
    try {
      const itemToUpdate = shoppingList.find(item => item.id === id);
      if (!itemToUpdate) return;

      const response = await fetch(`${API_BASE_URL}/shopping-list/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchased: !itemToUpdate.purchased }),
      });
      if (!response.ok) throw new Error('Failed to toggle purchased status');
      const updatedItem = await response.json();
      setShoppingList((prevList) =>
        prevList.map((item) =>
          item.id === id ? updatedItem : item
        )
      );
    } catch (error) {
      console.error("Error toggling purchased status:", error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shopping-list/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove item');
      setShoppingList((prevList) => prevList.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const clearPurchased = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shopping-list/purchased`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear purchased items');
      setShoppingList((prevList) => prevList.filter((item) => !item.purchased));
    } catch (error) {
      console.error("Error clearing purchased items:", error);
    }
  };

  return {
    shoppingList,
    addItem,
    togglePurchased,
    removeItem,
    clearPurchased,
  };
};