//npm run dev to run
//express
var express = require('express')
var app = express()

const opn = require('opn')//using opn to open the local host in the browser when index is ran
const { getProducts, getProductByID, getStores, getStoreById, updateStore, addStore, deleteProduct } = require('./database.js')//requiring the functions from the database


var path = require('path')
var ejs = require('ejs')
app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//bodyparser middleware
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//link to the homepage
app.get('/', function (req, res) {
  res.render('links')
})

//link to the addstore page
app.get('/addStore', (req, res) => {
  res.render('addStore')
})

//gets products from the get products function for table
app.get('/Products', async (req, res) => {
  const products = await getProducts()//calling the get products query and storing in products
  res.render('products', { products })//sending the products to the table in products.ejs
})

//gets stores from the get stoers function for table(same as above)
app.get('/Stores', async (req, res) => {
  const stores = await getStores()
  res.render('stores', { stores })
})

//gets store by id for the update
app.get('/stores/:id', async (req, res) => {
  const storeId = req.params.id//gets the store id from url
  const storeDetails = await getStoreById(storeId)
  res.render('update', { store: storeDetails })
})

//update store by id
app.post('/updateStores/:id', async (req, res) => {
  const storeId = req.params.id//gets the store id from url
  const { location, mgrid } = req.body //stores the new location and mgrid from request sent from update.ejs

  try {
    const updateResult = await updateStore(storeId, location, mgrid)//calling udatestore query
    res.redirect('/Stores')//redirecting to store table page after update is complete
  } catch (error) {//error handling
    console.error('Error updating store:', error)
    res.status(500).json({ error: 'Error updating store' })
  }
})

//add store 
app.post('/addstores', async (req, res) => {
  const { sid, location, mgrid } = req.body//store information for the new store passed in request

  try {
      await addStore(sid, location, mgrid)//calling addstore query to add new information to a new row in table
      res.redirect('/Stores');//redirect back to store when added
  } catch (error) {//error handling
      console.error('Error adding store:', error)
      res.status(500).send('Error adding store')
  }
})

//delete product by id cant be used on page due to link sending a get instead of delete but tested on thunder client extension and works properly
app.delete('/productsdelete/:id', async (req, res) => {
  const productId = req.params.id//retrieving the id from url

  try {
    //calling query to delete the row
      const deletionResult = await deleteProduct(productId)
      if (deletionResult.success) {//response based on resut
          res.status(200).json({ message: deletionResult.message })
      } else {
          res.status(404).json({ error: deletionResult.message })
      }
  } catch (error) {//error handling
      console.error('Error deleting product:', error)
      res.status(500).json({ error: 'Error deleting product' })
  }
})

//runing server on port 4000
app.listen(4000, () => {
  console.log('Running on port 4000')
  opn('http://localhost:4000/')//open the localhost on browser when server is ran
})