const express = require('express');
const cors = require('cors')
const listEndpoints = require('express-list-endpoints')
const { connect } = require('./config/database')

const port = process.env.PORT || 8000
const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json(listEndpoints(app));
})
const books = require('./controllers/books');
const users = require('./controllers/users');
const carts = require('./controllers/carts');
const wishlists = require('./controllers/wishlists');
const salesOrders = require('./controllers/salesOrders');

app.use('/books', books);
app.use('/users', users);
app.use('/carts', carts);
app.use('/wishlists', wishlists);
app.use('/salesOrders', salesOrders);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
connect();