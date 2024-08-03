import Image from "next/image";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query } from "firebase/firestore";
import { Box, TextField, Typography, Stack } from "@mui/material";
import { firestore } from "@/firebase";
import InventoryModal from "./InventoryModal";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection={"column"} justifyContent={"center"} alignItems={"center"} gap={2}>
      <InventoryModal open={open} handleClose={handleClose} itemName={itemName} setItemName={setItemName} addItem={addItem} />
      <button variant="contained"
        onClick={() => {
          handleOpen();
        }}>
        Add New Item
      </button>
      <Box border="1px solid #333">
        <Box width="800px" height="100px" bgcolor="#ADD8E6">
          <Typography variant="h2" color="#333" display="flex" justifyContent={"center"} alignItems={"center"}> Inventory Items</Typography>
        </Box>
      
        <Stack width="800px" height="300" spacing="2" overflow="auto">
          {
            inventory.map(({ name, quantity}) => (
              <Box key={name} width="100%" minHeight="150px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#f0f0f0"
                padding={5}
              >
                <Typography variant="h3" color="#333" textAlign={"center"}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h3" color="#333" textAlign={"center"}>
                  {quantity}
                </Typography>
                <button variant="contained" onClick={()=> {
                  addItem(name);
                }}>Add</button>
                <Stack direction="row" spacing="2">
                  <button variant="contained" onClick={()=> {
                    removeItem(name);
                  }}>Remove</button>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box> 
    </Box>
  );
}