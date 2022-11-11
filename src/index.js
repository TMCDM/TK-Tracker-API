require('dotenv').config();

const { getOrderByJobNumber, getOrderByQuoteNumber } = require('./db-operations');
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

app.post('/getOrderByJobNumber', express.json(), async (req, res) => {
	const jobNumber = req.body.jobNumber;

	if (!jobNumber) {
		return res.json({ error: "INVALID_INPUT" })
	}


	const data = await getOrderByJobNumber(jobNumber).catch(err => {
		res.json(err)
	})


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

	return res.json(final);
});

app.post('/orderByQuoteNumber', express.json(), async (req, res) => {
	const quoteNumber = req.body.quoteNumber;

	const data = await getOrderByQuoteNumber(quoteNumber).catch((error) =>
		res.json({ error })
	);


	if (data.error) {
		return res.json({ error: data.error })
	}


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

	return res.json(final);
});


app.get('/__tmc_test__', (req, res) => {
	return res.json({ msg: 'OK' });
});

app.listen(3000, () => console.log('Listening on port 3000'));
