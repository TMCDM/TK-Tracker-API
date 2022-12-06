require('dotenv').config()
const cors = require('cors')
const morgan = require('morgan')
const express = require('express')
const path = require('path')

const { getOrderByJobNumber } = require('./db-operations')

// Setup express
const app = express()
//use cords
//TODO lockdown cors to domain only
//TODO add rate limiting
app.use(cors())

// Set up logging
if (app.get('env') == 'production') {
    path.join(__dirname, 'access.log'), { flags: 'a' }
} else {
    app.use(morgan('dev')) //log to console on development
}

app.post('/getOrderByJobNumber', express.json(), async (req, res) => {
    const jobNumber = req.body.jobNumber

    if (!jobNumber) {
        return res.json({ error: 'INVALID_INPUT' })
    }

    //get the customer and their boxes
    const data = await getOrderByJobNumber(jobNumber).catch((err) => {
        res.json(err)
    })

    let final = {
        customer: data.customer,
        boxes: data.boxes,
        rawData: data.rawData,
        error: '',
    }

    return res.json(final)
})

app.get('/__tmc_test__', (req, res) => {
    return res.json({ msg: 'OK' })
})

app.listen(3000)
