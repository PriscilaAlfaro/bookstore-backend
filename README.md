# Final Project Technigo Bootcamp
# BookStore: Sweden Tech Library


## Idea  
I created an online bookstore named ***Sweden Tech Library***. The users have the possibility to find books related to technology like programming languages, databases, code, and more.  The user also has the chance to search for a specific title, author, or category, and see more details for every book. They have their own session using signup/in and with that session activated they can see the profile page, make a wishlist, add books to a cart, and finally buy books.  
This is the final project of [Technigo Bootcamp to become a Web Developer](https://www.technigo.io/program). 
I decided to work with the backend and [frontend](https://github.com/PriscilaAlfaro/bookstore-frontend) in separated repositories for the project.

## Technological source

1. [Nodejs](https://nodejs.org/es/)
2. [Express](http://expressjs.com/) 
3. [MongoDB](https://www.mongodb.com/) 
4. [Mongoose](https://mongoosejs.com/docs/)
5. [crypto](https://www.npmjs.com/package/crypto-js)
6. [dotenv](https://www.npmjs.com/package/dotenv)
7. [Klarna checkout](https://www.klarna.com/se/foretag/produkter/checkout/) (test mode)

## Routes
```
  books
  users
  carts
  wishlists
  salesOrders
```
## General design ideas
I developed a general idea about how I wanted my data modeling to be in a simple [jamboard document](https://jamboard.google.com/d/1P-4nCIT4J0eBcKg9AAa4y0nALJxTdqozpYkcxH2C2EM/viewer?f=5).  
The data used was get from a [free data set](https://github.com/ozlerhakan/mongodb-json-files/blob/master/datasets/books.json) and it was transformed and enriched with the required information to develop this project. 

## Installation & setup development mode

1. Create an account for Klarna checkout in playground mode.  
2. Create a database in Mongo DB.  
3. Create `.env` file in the root directory and add `MONGO_URI` (link to connect with Mongo DB), `KLARNA_USERNAME` and `KLARNA_PASSWORD` (to save your secrets to call Klarna API for checkout).    
4. Install all dependencies with `npm install`.  
5. Start the project with `npm start`.  
6. Open [http://localhost:8000](http://localhost:8000) to view it in your browser, or the `PORT` you save in your .env file.  

## Live
This project was deployed in Heroku.

You can see: https://bookstore-project-backend.herokuapp.com/ 