'use client'
import axios from 'axios';
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Box, Modal, TextField, Typography, Stack, Button, Card, CardContent, CardActions } from "@mui/material";
import Webcam from "react-webcam";
import { firestore } from "@/firebase";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);
  const storage = getStorage();

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

  const handleRecipeOpen = () => setRecipeOpen(true);
  const handleRecipeClose = () => setRecipeOpen(false);

  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);

  const getRecipes = async () => {
    const items = inventory.map(item => item.name).join(", ");
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt: `Suggest recipes based on the following pantry items: ${items}.`,
        max_tokens: 150,
        n: 3,
        stop: null,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const suggestions = response.data.choices.map(choice => choice.text.trim());
      setRecipes(suggestions);
      handleRecipeOpen();
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    handleCameraClose();
  };

  const uploadImage = async () => {
    if (!image) return;

    const imageRef = ref(storage, `images/${Date.now()}.jpg`);
    const response = await fetch(image);
    const blob = await response.blob();

    await uploadBytes(imageRef, blob);
    const imageUrl = await getDownloadURL(imageRef);

    console.log("Uploaded Image URL:", imageUrl);
  };

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection={"column"} justifyContent={"center"} alignItems={"center"} gap={2} p={2}>
      <Modal open={open} onClose={handleClose}>
        <Box position={"absolute"} top="50%" left="50%" 
          width={400} bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection={"column"}
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant="h6">Add Items</Typography>
          <TextField
            variant='outlined'
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
            }}
          />
          <Button
            variant="outlined" onClick={() => {
              addItem(itemName);
              setItemName('');
              handleClose();
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Button variant="contained" onClick={getRecipes}>
        Get Recipe Suggestions
      </Button>
      <Button variant="contained" onClick={handleCameraOpen}>
        Open Camera
      </Button>
      {image && (
        <Box>
          <img src={image} alt="captured" width="200" />
          <Button variant="contained" onClick={uploadImage}>
            Upload Image
          </Button>
        </Box>
      )}
      <Box border="1px solid #333" width="80%" mt={2} p={2} borderRadius={2} boxShadow={3}>
        <Box width="100%" height="100px"
          bgcolor="#ADD8E6" display="flex" justifyContent="center" alignItems="center" borderRadius={2} boxShadow={1} mb={2}>
          <Typography variant="h4" color="#333"> Inventory Items</Typography>
        </Box>
        <Stack width="100%" spacing={2} overflow="auto">
          {
            inventory.map(({ name, quantity }) => (
              <Card key={name} sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h6">
                    Quantity: {quantity}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" onClick={() => addItem(name)}>Add</Button>
                  <Button size="small" variant="contained" onClick={() => removeItem(name)}>Remove</Button>
                </CardActions>
              </Card>
            ))
          }
        </Stack>
      </Box>
      <Modal open={recipeOpen} onClose={handleRecipeClose}>
        <Box position={"absolute"} top="50%" left="50%" 
          width={400} bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection={"column"}
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant="h6">Recipe Suggestions</Typography>
          <Stack spacing={2}>
            {recipes.map((recipe, index) => (
              <Typography key={index}>{recipe}</Typography>
            ))}
          </Stack>
          <Button variant="outlined" onClick={handleRecipeClose}>
            Close
          </Button>
        </Box>
      </Modal>
      <Modal open={cameraOpen} onClose={handleCameraClose}>
        <Box position={"absolute"} top="50%" left="50%" 
          width={400} bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection={"column"}
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant="h6">Capture Image</Typography>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
          />
          <Button variant="contained" onClick={capture}>
            Capture
          </Button>
          <Button variant="outlined" onClick={handleCameraClose}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
