require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const multer = require('multer');
const path = require('path');
const JWT_SECRET = process.env.JWT_SECRET;

const dbConnection = require('./config/db')
const {foodCategory, foodItemsFood, foodItemsDrink, users, userOrders} = require('./module/foodData.js')
const cors = require('cors');




const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true, // Allow cookies if needed
}));
app.use(express.json())
app.use(express.urlencoded({extended : true}))

const port = process.env.PORT || 3000;

function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
}

// to fetch all orders of user by email

app.get('/orders', async (req, res) => {
  const email = req.query.email; // Get the email from query parameters

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const userOrder = await userOrders.find({ userEmail: email }); // Fetch orders for the given email
    if (userOrder.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json(userOrder);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello, ${req.user.email}!` });
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try{
  // Validate email and password (example - replace with actual validation)
  const user = await users.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate a token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });


  res.status(201).json({ message: 'Login successful',
     token,
    user: { id: user._id, email: user.email, name: user.name },  });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }

});

// GET route to fetch a user by email
app.get('/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer header
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findById(decoded.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
 
});


// find all category
app.get('/categories',  (req, res) => {
foodCategory.find()
  .then((items) => {
    
    res.send(items)
  })
  .catch((err) => {
    console.error('Error fetching items:', err);
    res.send("error")
  });
})

// find all items of  drink
app.get('/drinks', async (req, res) => {
  foodItemsDrink.find()
  .then((items)=>{
    res.send(items)
  })
  .catch((err) => {
    console.error('Error fetching items:', err);
    res.send("error")
  });
})


// find all items of  starter
app.get('/starter', async (req, res) => {
  foodItemsFood.find({CategoryName:'Starter'})
  .then((items)=>{
    res.send(items)
  })
  .catch((err) => {
    console.error('Error fetching items:', err);
    res.send("error")
  });
})

// find all items of  main course
app.get('/main-course', async (req, res) => {
  foodItemsFood.find({CategoryName:'Main_Course'})
  .then((items)=>{
    res.send(items)
  })
  .catch((err) => {
    console.error('Error fetching items:', err);
    res.send("error")
  });
})

// add a item to drink category
app.post('/drink-item', async (req, res) => {
  const {name, img, description} = req.body;
  const {regular, medium, large} = req.body;
  try{
  const isNameExist = await foodItemsDrink.find({name: name})
  if(isNameExist[0].name === name){
   
    res.send("This food Item already exist in menu")
  }
  else{
     await foodItemsDrink.create({
      CategoryName : "Drink",
      name : name,
      img : img,
      options : [{
          regular: regular,
          medium : medium,
          large : large,
        }],
      description : description  
    })
    res.send("item has been saved into our menu")
  }
}catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}

 
})


// add a item to starter category
app.post('/starter-item', async (req, res) => {
  const {name, img, description} = req.body;
  const {half, full} = req.body;
  try{
  const isNameExist = await foodItemsFood.find({name: name})
  if(isNameExist[0].name === name){
    res.send("This food Item already exist in menu")
  } 
  else {
   await foodItemsFood.create({
    CategoryName : "Starter",
    name : name,
    img : img,
    options : [{
        half: half,
        full : full
      }],
    description : description  
  })
 
  res.send("success")
}
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
})


// add a item to main course category
app.post('/mains-item', async (req, res) => {
  const {name, img, description} = req.body;
  const {half, full} = req.body;
  try{
    const isUserExist = await users.findOne({ name: name });
    if (isUserExist) {
      return res.status(400).json({ message: 'this item already exists' });
    }
 
 await foodItemsFood.create({
    CategoryName : "Main_Course",
    name : name,
    img : img,
    options : [{
        half: half,
        full : full
      }],
    description : description  
  })
 
  res.send("success")

  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}

})

app.post('/signup', upload.single('img'), async (req, res) => {
  console.log('Body:', req.body);
  console.log('File:', req.file);
  const {name, email, password} = req.body;
  const img = req.file ? req.file.path : null; // Get the uploaded file path

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields (name, email, password) are required' });
  }

  try{
    const isUserExist = await users.findOne({ email: email });
    
    if (isUserExist) {
      return res.status(400).json({ message: 'User already exists' });
    }
 
   
    const user = await users.create({
      name: name,
      email: email,
      password: password,
      img : img
    })
  
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ message: 'User created successfully', token });
  
}
catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}
})

app.post('/orders', async ( req, res ) => {
  try{
  const { userName, userEmail, itemName, category, quantity, price, option } = req.body;

  // Validate required fields
  if (!userName || !userEmail || !itemName || !category || !quantity || !price || !option) {
      return res.status(400).json({ error: 'All fields are required.' });
  }
  await userOrders.create({
    userName : userName,
    userEmail : userEmail,
    itemName : itemName,
    category : category,
    option : option,
    price : price,
    quantity : quantity
  })
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}

})


// Delete order by ID
app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const order = await userOrders.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
});




app.listen(port, ()=>{
    console.log("backend is running on port: ", port);
})
