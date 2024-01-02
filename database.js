var mysql = require('mysql2')


const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'proj2023'
}).promise()

//get products table include columns from other tables
async function getProducts() {
    //query to get colums required
    const query = `
    SELECT p.pid AS productid, p.productdesc AS description, ps.sid AS storeid, s.location, ps.Price AS price
    FROM product p
    LEFT JOIN product_store ps ON p.pid = ps.pid
    LEFT JOIN store s ON ps.sid = s.sid;
    `
    //store query results in rows
    const [rows] = await pool.query(query)

    //handling the rows that do not have all attributes of the table
    const products = rows.map(row => ({
        //entering null values in these rows
        productid: row.productid || '',
        description: row.description || '',
        storeid: row.storeid || '',
        location: row.location || '',
        price: row.price || '',
        pid: row.pid || '', 
    }))
    //returning the table from the rows map
    return products
}

//get product by id
async function getProductByID(pid){
    //calling qurey and storing in rows
    const [rows] =  await pool.query('SELECT * FROM product WHERE pid = ?', [pid])
    return rows
}

//get all stores for table
async function getStores() {
    const [rows] = await pool.query("SELECT * FROM store")
    return rows
}

//get store by id
async function getStoreById(sid) {
    const [rows] = await pool.query('SELECT * FROM store WHERE sid = ?', [sid])
     return rows[0]//retrieving first row from array to display in input boxs of update page
}

//update the store 
async function updateStore(sid, newLocation, newMgrid) {
    //query to get row that is to be edited
    const [existingRow] = await pool.query('SELECT * FROM store WHERE sid = ?', [sid])
    //check if row exists
    if (existingRow.length === 0) {
        throw new Error('Store entry not found')
    }
    //if row does exist call a update query to update the row
    await pool.query('UPDATE store SET location = ?, mgrid = ? WHERE sid = ?', [newLocation, newMgrid, sid])
}

//add store
async function addStore(sid, location, mgrid) {
    //query to search for the sid thats been entered
    const [existingRow] = await pool.query('SELECT * FROM store WHERE sid = ?', [sid])
    //if id entered already exists throw error
    if (existingRow.length > 0) {
        throw new Error('Store with this SID already exists')
    }
    //otherwise call a insert query to add the new store the table
    await pool.query('INSERT INTO store (sid, location, mgrid) VALUES (?, ?, ?)', [sid, location, mgrid])
}

//delet product
async function deleteProduct(productId) {
    //search from row to see if it is in stores by checking product_store table
    const [result] = await pool.query('SELECT * FROM product_store WHERE pid = ?', [productId])
    //if row diesnt exist in the product_store means it is not in stores
    if (result.length === 0) {
        //query to delete from the product table
        const [deleteResult] = await pool.query('DELETE FROM product WHERE pid = ?', [productId])
        //if statements to return a message on if it deleted or not
        if (deleteResult.affectedRows > 0) {
            return { success: true, message: 'Product deleted successfully' }
        } else {
            return { success: false, message: 'Product not found or delete operation failed' }
        }
    //return a fail message if product is already in a store
    } else {
        return { success: false, message: 'Product is associated with stores, cannot delete' }
    }
}

//exporting functions
module.exports = { getProducts, getProductByID, getStores, getStoreById, updateStore, addStore, deleteProduct }

