"use client"
import { Box, Button, FormLabel, Modal, Stack, TextField, Typography } from "@mui/material";
import { useState,useEffect, FormEvent } from "react";
import { collection, getDocs, query,doc,getDoc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import firestore from "./utils/firebase";
import Item  from "./data/Item";
import toast from "react-hot-toast";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [editItem, setEditItem] = useState<boolean>(false);

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

  const addItem = async (e:FormEvent)=> {
    e.preventDefault();
    if(editItem){
      const docRef= doc(collection(firestore,"inventory"),itemName);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()){
        const docData = docSnap.data();
        await setDoc(docRef,{...docData,itemName:itemName,quantity:quantity,price:price,description:description});
        toast.success("Item Updated Successfully");
      }
      else{
        toast.error("Item does not exist");
      }
    }
    else{
      const docRef= doc(collection(firestore,"inventory"),itemName);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()){
        toast.error("Item Already exist")
      }
      else{
        const item = {
          id: itemName,
          itemName: itemName,
          quantity: quantity,
          price: price,
          description: description
        }
        //console.log(item);
        await setDoc(docRef,{...item});
        toast.success("Item Added Successfully");
      }
    }
    clearForm();
    closeForm();
    getItems();
  }

  function clearForm(){
    setItemName("");
    setPrice(0);
    setQuantity(0);
    setDescription("");
  }

  function openEditForm(item: Item) {
    if(!open){
      setItemName(item.itemName);
      setPrice(item.price);
      setQuantity(item.quantity);
      setDescription(item.description);
      setOpen(true);
      setEditItem(true);
      setSelectedItem(item);  
    }
  }

  function openAddNewItemForm(){
    if(!open){
      setOpen(true);
      setEditItem(false);
    }
  }

  function closeForm(){
    setOpen(false);
    clearForm();
    setEditItem(false);
  } 

  const deleteItem = async (id: string) => {
    const docRef= doc(collection(firestore,"inventory"),id);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      //const docData = docSnap.data();
      // if(docData.quantity>1){
      //   await setDoc(docRef,{...docData,quantity:docData.quantity-1});
      // }
      // else{
        await deleteDoc(docRef);
      // }
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
        padding={"2rem"}
        gap={2}
        sx={{ transform: 'translate(-50%, -50%)'}}
        borderRadius={"1rem"}
        >
          <Typography variant="h6" borderBottom={".1rem solid black"}>{editItem?"Edit":"Add"} Item</Typography>
          <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} 
          component="form" onSubmit={(e) => addItem(e)}>
            <Stack width="100%" direction="column" spacing={2} padding="2rem">
              <FormLabel>Name</FormLabel>
              <TextField 
                variant="outlined"
                fullWidth
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              ></TextField>
              <FormLabel>Price</FormLabel>
              <TextField 
                variant="outlined"
                fullWidth
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              ></TextField>
              <FormLabel>Quantity</FormLabel>
              <TextField 
                variant="outlined"
                fullWidth
                required
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              ></TextField>
              <FormLabel>Description</FormLabel>
              <TextField 
                variant="outlined"
                type="textArea"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></TextField>
            </Stack>
            <Stack width="100%" direction="row" spacing={2} display={"flex"} alignContent={"center"} justifyContent={"center"}>
              <Button variant="contained" onClick={closeForm}>Cancel</Button>
              <Button variant="contained" type="submit">{editItem?"Update":"Add"}</Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
      <Box display="flex" flexDirection="column" gap={2} alignItems={"center"} justifyContent={"center"}>
        <Box fontSize={"6vw"}>Inventory Management</Box>
        <Box display={"flex"} flexDirection={"row"}>
          <Box padding={"2rem"}>
            <Button variant="contained" onClick={openAddNewItemForm}>Add Item</Button>
          </Box>
          <Box padding={"2rem"}>
            <Button variant="contained" onClick={getItems}>Refresh</Button>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" padding={"2rem"} gap={2} marginTop={"2rem"} marginBottom={"2rem"} flexWrap={"wrap"}>
        {items.map((item) => (
          <Box key={item.itemName} display="flex" margin={"1rem"} flexDirection="column" gap={2} padding={"2rem"} border={"solid black .2rem"} boxShadow={".5rem 1rem"}>
            <Typography variant="h6">{item.itemName}</Typography>
            <Typography variant="body1">Quantity: {item.quantity}</Typography>
            <Typography variant="body1">Price: {item.price}</Typography>
            <Typography variant="body1">Description: {item.description==""?"-":item.description}</Typography>
            <Box display={"flex"} flexDirection={"row"} margin={"2px"}>
              <Box padding={".5rem"}>
                <Button variant="contained" onClick={() => openEditForm(item)}>Edit</Button>
              </Box>
              <Box padding={".5rem"}>
                <Button variant="contained" onClick={() => deleteItem(item.itemName)}>Delete</Button>
              </Box>
            </Box>
          </Box>
        ))}
        </Box>
    </Box>
  );
}
