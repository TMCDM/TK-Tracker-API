require('dotenv').config();

const { getOrderByOrderNumber } = require('./db-operations');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');

const app = express();
app.use(cors());

// Set up logging
if (app.get('env') == 'production') {
	path.join(__dirname, 'access.log'), { flags: 'a' };
} else {
	app.use(morgan('dev')); //log to console on development
}

app.post('/getOrder', express.json(), async (req, res) => {
	const quoteNumber = req.body.quoteNumber;

	const data = await getOrderByOrderNumber(quoteNumber).catch((error) =>
		res.json({ err: 'Something went wrong' })
	);

	let final = {
		customer: {
			name: data.CstrName,
			contact: data.CstrContact,
			address: data.CstrPostalAddress,
			city: data.CstrCity,
			state: data.CstrState,
			zip: data.CstrZip,
			telephone: data.CstrTelephone,
			cell: data.CstrCell,
			email: data.CstrEmail,
		},
		boxes: data.boxes,
		error: '',
	};

	res.json(final);
});

app.get('/__tmc_test__', (req, res) => {
	res.json({ msg: 'OK' });
});

app.listen(3000, () => console.log('Listening on port 3000'));
