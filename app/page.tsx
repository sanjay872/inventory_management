"use client"
import { Box, Typography } from "@mui/material";
import { useState,useEffect } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import firestore from "./utils/firebase";
import Item  from "./data/Item";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  const getItems = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const documents = await getDocs(snapshot);
    const inventoryItems = documents.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        itemName: data.itemName,
        quantity: data.quantity,
        price: data.price,
        description: data.description,
      };
    }
    );
    setItems(inventoryItems);
  }
  useEffect(() => {
    getItems();
  },[]);

  return (
    <Box>
      <Typography variant="h3">Inventory Management</Typography>
      <Box>
        {items.map((item) => (
          <Box key={item.id}>
            <Typography>{item.itemName}</Typography>
          </Box>
        ))}
        </Box>
    </Box>
  );
}
