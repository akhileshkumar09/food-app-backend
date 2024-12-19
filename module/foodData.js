const mongoose = require("mongoose");

const foodCategorySchema = new mongoose.Schema({
    CategoryName:{type: String, required: true},
}, { timestamps: true })

const drinkOptionSchema = new mongoose.Schema({
    regular: { type: Number, required: true },  // Price for regular size
    medium: { type: Number, required: true },   // Price for medium size
    large: { type: Number, required: true },    // Price for large size
},{ timestamps: true });

const foodOptionSchema = new mongoose.Schema({
    half: { type: Number, required: true },  // Price for half size
    full : { type: Number, required: true },   // Price for full size
    
},{ timestamps: true });
 


// Define schema for the  food
const food_itemsFoodSchema = new mongoose.Schema({
    CategoryName: { type: String, required: true },   // Category Name (Main_Course)
    name: { type: String, required: true },           // Name of the food item
    img: { type: String, required: true },            // Image URL of the food item
    options: [foodOptionSchema],                          // Array of options (sizes with prices)
    description: { type: String, required: true }     // Description of the food item
},  { timestamps: true });  // Explicitly specify collection name


// Define schema for the  drink
const food_itemsDrinkdSchema = new mongoose.Schema({
    CategoryName: { type: String, required: true },   // Category Name (Main_Course)
    name: { type: String, required: true },           // Name of the food item
    img: { type: String, required: true },            // Image URL of the food item
    options: [drinkOptionSchema],                          // Array of options (sizes with prices)
    description: { type: String, required: true }     // Description of the food item
}, { timestamps: true });  // Explicitly specify collection name

// define schema for users
const usersSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true, // Name is mandatory
      trim: true,     // Removes any extra whitespace
    },
    email: {
      type: String,
      required: true, // Email is mandatory
      unique: true,   // Email must be unique
      trim: true,
      lowercase: true, // Ensures email is stored in lowercase
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address', // Validation for email format
      ],
    },
    password: {
      type: String,
      required: true, // Password is mandatory
      minlength: 4,   // Ensures password is at least 8 characters
    },
    img: {
      type: String, // Stores the image URL
      default: null, // Optional field, default is null
    },
  }, { timestamps: true })

// define orders schema
const orderSchema = new mongoose.Schema({
    userName : {type: String, required: true},
    userEmail : {type: String, required: true},
    itemName : {type: String, required: true},
    category : {type: String, required: true},
    option : {type: String, required: true},
    price : {type: Number, required: true},
    quantity : {type: Number, required: true},
    orderedAt : {type: Date, default: Date.now}
}, { timestamps: true })

const users = mongoose.model('users', usersSchema);

const userOrders = mongoose.model('orderDetail', orderSchema);

const foodCategory = mongoose.model('foodcategories', foodCategorySchema );

const foodItemsFood = mongoose.model('food-items-foods', food_itemsFoodSchema)

const foodItemsDrink = mongoose.model('food-item-drinks', food_itemsDrinkdSchema)

module.exports = {foodCategory, foodItemsFood, foodItemsDrink, userOrders, users};