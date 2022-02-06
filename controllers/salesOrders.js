/* eslint-disable camelcase */
const express = require('express');
const mongoose = require('mongoose');
const SalesOrders = require('../models/salesOrders');
const Carts = require('../models/carts');
const Books = require('../models/books');

const { Buffer } = require('buffer');
const fetch = require('node-fetch');

const salesOrderRouter = express.Router();

// middleware to catch the id param
salesOrderRouter.param('id', async (req, res, next, id) => {
    try {
        const salesOrderId = id;
        if (!salesOrderId || salesOrderId === null) {
            return res.status(404).send('Id does not exist')
        } else {
            const result = await SalesOrders.findById(salesOrderId);
            if (result === null || !result) {
                res.status(404).json({ message: 'Id does not exist', success: "false" });
            } else {
                req.salesOrderById = result;
                next();
            }
        }
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Bad id request", success: "true" });
        } else {
            return res.status(500).json({ message: error.message });
        }
    }
})

salesOrderRouter.get('/', async (req, res) => {
    try {
        const { limit } = req.query;
        const salesOrder = await SalesOrders.find().limit(+limit);
        if (salesOrder) {
            res.status(200).json({ salesOrders: salesOrder, success: "true" });
        } else {
            res.status(404).json({ message: 'No results', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


salesOrderRouter.get('/:id', async (req, res) => {
    try {
        res.status(200).json({ salesOrder: req.salesOrderById, success: "true" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// should send all body
salesOrderRouter.put('/:id', async (req, res) => {
    const { body } = req
    try {
        const salesOrderUpdated = await SalesOrders.updateOne({ _id: req.salesOrderById }, body);
        if (salesOrderUpdated.nModified > 0) {
            res.status(200).json({ ...body, success: "true" });
        } else {
            res.status(404).json({ message: 'No updated', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// update just one value of the object
salesOrderRouter.patch('/:id', async (req, res) => {
    const { body } = req
    try {
        const salesOrderUpdated = await SalesOrders.updateOne({ _id: req.salesOrderById },
            { $set: body });

        if (salesOrderUpdated.nModified > 0) {
            res.status(200).json({ ...body, success: "true" });
        } else {
            res.status(404).json({ message: 'No updated', success: "false" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

salesOrderRouter.delete('/:id', async (req, res) => {
    try {
        await SalesOrders.deleteOne({ _id: req.salesOrderById });
        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

salesOrderRouter.post('/', async (req, res) => {
    try {
        const { userId,
            details
        } = req.body;

        if (
            userId && details && details.length > 0
        ) {
            const salesOrder = new SalesOrders({ ...req.body })
            const savedSalesOrder = await salesOrder.save();
            res.status(200).json({ salesOrder: savedSalesOrder, success: "true" });
        } else {
            return res.status(400).json({ message: "Bad request", success: "true" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.response });
    }
})


salesOrderRouter.get('/orderConfirmation/:klarnaOrderId', async (req, res) => {
    try {
        const { klarnaOrderId } = req.params;
        if (klarnaOrderId) {

            const base64Secrets = Buffer.from(process.env.KARNA_USERNAME + ':' + process.env.KLARNA_PASSWORD).toString('base64');
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Basic " + base64Secrets,
                }

            }

            const url = `https://api.playground.klarna.com/checkout/v3/orders/${klarnaOrderId}`;

            return fetch(url, options)
                .then(res => res.json())
                .then(klarnaResponse => {
                    //borrar cart de la base de datos
                    // await Carts.updateOne(
                    //     { userId: userIdAsObjectId },
                    //     { $push: { items: [] } })


                    res.status(200).json({ response: klarnaResponse, success: true })
                });

            //TODO: salvar salesOrder en Database


        } else {
            res.status(404).json({ response: 'No results', success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message });
    }
});


salesOrderRouter.post('/checkout/:userId', async (req, res) => {
    try {
        const { userId } = req.params;


        if (userId) {
            const userIdAsObjectId = mongoose.Types.ObjectId(userId);
            const cartAlreadyExists = await Carts.exists({ userId: userIdAsObjectId });

            if (cartAlreadyExists) {
                //hacer el fetch a klarna
                //completar los datos con lo que hay en el backend
                const cart = await Carts.find({ userId: userIdAsObjectId });
                const productIdBatch = cart[0]?.items.map(item => item.productId);
                const books = await Books.find({ _id: { $in: productIdBatch } });


                //Klarna checkout
                const taxRate = 0.13;

                const itemsInfo = books.map(book => {
                    const cartItem = cart[0].items.find(item => item.productId.equals(book._id))

                    const unitPrice = book.price * 100;  //book.price
                    const unitTaxAmount = unitPrice * taxRate;
                    const unitPriceWithTax = unitPrice + unitTaxAmount;

                    const totalAmountWitTaxes = unitPriceWithTax * cartItem.quantity;
                    const totalTaxAmount = (unitPrice * taxRate) * cartItem.quantity;


                    return {
                        type: "physical",
                        reference: book._id,
                        name: book.title,
                        quantity: cartItem.quantity, //book.quantity
                        quantity_unit: "pcs",
                        unit_price: unitPriceWithTax, //unitPrice + unitTaxAmount, //Includes tax. Example: 100 Euros should be 10000.
                        tax_rate: taxRate * 10000, //The percentage value is represented with two implicit decimals. Example: 25 % should be 2500.
                        total_amount: totalAmountWitTaxes, //Includes tax. Example: 25 euros should be 2500 Value = (quantity x unit_price)
                        total_discount_amount: 0,
                        total_tax_amount: totalTaxAmount //Must be within ±1 of total_amount - total_amount * 10000 / (10000 + tax_rate). Negative when type is discount.
                    }
                });

                const orderAmount = itemsInfo.reduce((a, b) => a + b.total_amount, 0);
                const orderTaxAmount = itemsInfo.reduce((a, b) => a + b.total_tax_amount, 0);

                const body = {
                    purchase_country: "SE",
                    purchase_currency: "SEK",
                    locale: "en-se",
                    order_amount: orderAmount, //Total amount of the order including tax and any available discounts.
                    order_tax_amount: orderTaxAmount, //Total TAX amount of the order. The value should be in non-negative minor units.
                    order_lines: itemsInfo,
                    merchant_urls: {
                        terms: "https://www.example.com/terms.html",
                        checkout: "http://localhost:3000/payment",
                        confirmation: "http://localhost:3000/paymentConfirmation",
                        push: "https://www.example.com/api/push"
                    }
                }

                const base64Secrets = Buffer.from(process.env.KARNA_USERNAME + ':' + process.env.KLARNA_PASSWORD).toString('base64');

                const options = {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: "Basic " + base64Secrets,
                    }

                }

                const url = "https://api.playground.klarna.com/checkout/v3/orders"

                fetch(url, options)
                    .then(res => res.json())
                    .then(klarnaResponse => {
                        // Carts.updateOne(
                        //     { userId: userIdAsObjectId },
                        //     { klarnaOrderId: klarnaResponse.order_id });

                        res.status(200).json({ response: klarnaResponse, success: true })
                    });

                //a;adir order-id al cart para salvar la orden




            } else {
                return res.status(404).json({ response: "cart not found", success: false });
            }

        } else {
            return res.status(400).json({ response: "Bad request", success: false });
        }
    } catch (error) {
        return res.status(500).json({ response: error.message });
    }
})

module.exports = salesOrderRouter;