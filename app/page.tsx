"use client"
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { useState,useEffect } from "react";
import { collection, getDocs, query,doc,getDoc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import firestore from "./utils/firebase";
import Item  from "./data/Item";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(true);
  const [itemName, setItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item>();

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

  const addItem = async (item:Item)=> {
    const docRef= doc(collection(firestore,"inventory"),item.id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      const docData = docSnap.data();
      await setDoc(docRef,{...docData,quantity:docData.quantity+1});
    }
    else{
      await setDoc(docRef,{...item,quantity:1});
    }
    getItems();
  }

  function openEditForm(item: Item) {
    if(!open){
      setOpen(true);
      setSelectedItem(item);  
    }
  }

  function closeForm(){
    setOpen(false);
  } 

  const deleteItem = async (id: string) => {
    const docRef= doc(collection(firestore,"inventory"),id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      const docData = docSnap.data();
      if(docData.quantity>1){
        await setDoc(docRef,{...docData,quantity:docData.quantity-1});
      }
      else{
        await deleteDoc(docRef);
      }
    }
    closeForm();
    getItems();
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    getItems();
  },[]);

  return (
    <Box 
      display={"flex"} 
      justifyContent="center" 
      alignItems="center" 
      flexDirection="column"
      gap="2"
      >
      <Modal open={open} onClose={handleClose}>
        <Box 
        position="absolute" top="50%" left="50%" 
        bgcolor="white" width={400} border={"2px solid black"} 
        boxShadow={24} display={"flex"}
        flexDirection="column"
        sx={{ transform: 'translate(-50%, -50%)'}}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
             <TextField 
              variant="outlined"
              fullWidth
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
             ></TextField>
              <Button 
                variant="contained" 
                onClick={() => addItem({id:itemName,itemName:itemName,quantity:0,price:0,description:""})}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Box display="flex" flexDirection="column" gap={2} alignItems={"center"} justifyContent={"center"}>
        <Box fontSize={"6vw"}>Inventory Management</Box>
        <Box display={"flex"} flexDirection={"row"}>
          <Box padding={"2rem"}>
            <Button variant="contained" onClick={handleOpen}>Add Item</Button>
          </Box>
          <Box padding={"2rem"}>
            <Button variant="contained" onClick={getItems}>Refresh</Button>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" padding={"2rem"} gap={2} marginTop={"2rem"} marginBottom={"2rem"} flexWrap={"wrap"}>
        {items.map((item) => (
          <Box key={item.id} display="flex" margin={"1rem"} flexDirection="column" gap={2} padding={"2rem"} border={"solid black .2rem"} boxShadow={".5rem 1rem"}>
            <Typography variant="h6">{item.itemName}</Typography>
            <Typography variant="body1">Quantity: {item.quantity}</Typography>
            <Typography variant="body1">Price: {item.price}</Typography>
            <Typography variant="body1">Description: {item.description==""?"-":item.description}</Typography>
            <Box display={"flex"} flexDirection={"row"} margin={"2px"}>
              <Box padding={".5rem"}>
                <Button variant="contained" onClick={() => openEditForm(item)}>Edit</Button>
              </Box>
              <Box padding={".5rem"}>
                <Button variant="contained" onClick={() => deleteItem(item.id)}>Delete</Button>
              </Box>
            </Box>
          </Box>
        ))}
        </Box>
    </Box>
  );
}
