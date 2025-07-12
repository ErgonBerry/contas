import { useState, useEffect } from 'react';

interface ShoppingItem {
  id: string;
  name: string;
  purchased: boolean;
  priority: boolean;
  createdAt: string;
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

  const sortedShoppingList = [...shoppingList].sort((a, b) => {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const addItem = async (name: string) => {
    if (name.trim() === '') return;
    try {
      const response = await fetch(`${API_BASE_URL}/shopping-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), priority: false, createdAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const newItem = await response.json();
      setShoppingList((prevList) => [newItem, ...prevList]);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const togglePriority = async (id: string) => {
    try {
      const itemToUpdate = shoppingList.find(item => item.id === id);
      if (!itemToUpdate) return;

      const response = await fetch(`${API_BASE_URL}/shopping-list/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: !itemToUpdate.priority }),
        });

      if (!response.ok) throw new Error('Failed to toggle priority');

      // Optimistically update the UI
      setShoppingList((prevList) =>
        prevList.map((item) =>
          item.id === id ? { ...item, priority: !itemToUpdate.priority } : item
        )
      );

      // Await the actual response to confirm the change on the backend
      const updatedItem = await response.json();
      console.log("Backend confirmed update for item:", updatedItem);

    } catch (error) {
      console.error("Error toggling priority:", error);
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
    shoppingList: sortedShoppingList,
    addItem,
    togglePurchased,
    removeItem,
    clearPurchased,
    togglePriority,
  };
};