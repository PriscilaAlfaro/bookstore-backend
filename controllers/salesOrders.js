/* eslint-disable camelcase */
const express = require('express');
const SalesOrders = require('../models/salesOrders');
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
        return res.status(500).json({ message: error.message });
    }
})

salesOrderRouter.post('/checkout/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId) {
            const body = {
                purchase_country: "SE",
                purchase_currency: "SEK",
                locale: "en-se",
                order_amount: 50000,
                order_tax_amount: 4545,
                order_lines: [
                    {
                        type: "physical",
                        reference: "19-402-USA",
                        name: "Red T-Shirt",
                        quantity: 5,
                        quantity_unit: "pcs",
                        unit_price: 10000,
                        tax_rate: 1000,
                        total_amount: 50000,
                        total_discount_amount: 0,
                        total_tax_amount: 4545
                    }
                ],
                merchant_urls: {
                    terms: "https://www.example.com/terms.html",
                    checkout: "https://www.example.com/checkout.html",
                    confirmation: "https://www.example.com/confirmation.html",
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

            return fetch(url, options)
                .then(res => res.json())
                .then(klarnaResponse =>
                    res.status(200).json({ response: klarnaResponse, success: true }));

        } else {
            return res.status(400).json({ message: "Bad request", success: false });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

module.exports = salesOrderRouter;