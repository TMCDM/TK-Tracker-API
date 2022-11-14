const { boxAndQuoteDBConfig } = require('./dbconfig');
const sql = require('mssql');
const { getCustomerAndBoxes } = require("./getCustomerAndBoxes")



const getOrderByJobNumber = async (JobNumber) => {

	try {
		let pool = await sql.connect(boxAndQuoteDBConfig);


		const { customer, boxes } = await getCustomerAndBoxes(JobNumber, pool).catch(err => {
			console.log(err)
		})






		// const formatedBoxes = await formatBoxes(boxes, pool)


		return {
			customer,
			boxes: boxes
		}




	} catch (error) {
		return { error: error.message };
	}
};
const getOrderByQuoteNumber = async (quoteNumber) => {
	try {
		let pool = await sql.connect(boxAndQuoteDBConfig);

		let quote = await pool.request().query`SELECT
QuoteNumber,
CstrName,
CstrContact,
CstrPostalAddress,
CstrCity,
CstrState,
CstrZip,
CstrTelephone,
CstrCell,
CstrEmail,
ShpToCompany,
ShpToContact,
ShpToAltContact,
ShpToPostalAddress,
ShpToCity,
ShpToState,
ShpToZip,
ShpToTelephone,
ShpToEmail,
Consultant
FROM Quotes q WHERE q.QuoteNumber = ${quoteNumber}`.then((quote) => {
			return quote;
		});

		const quoteItems = quote.recordsets[0][0];

		if (!quoteItems) {
			return { error: 'NO_RECORD_FOUND' };
		}

		let boxes = await pool.request().query`
		SELECT 
b.CreationDate, b.QuoteNumber, b.BoxLetter, b.ItemNumber, b.Description,
js.JobNumber,
js.JobState,
js.PD,
js.Elec,
js.CNC,
js.Fram,
js.CTL,
js.WShr,
js.WLay,
js.WBrk,
js.DShr,
js.DLay,
js.DBrk,
js.Weld,
js.Ref,
js.WAsm,
js.DAsm,
js.DWir,
js.DHng,
js.Foam,
js.Gask,
js.Ship
FROM ComputairQuotes.dbo.Box b
		INNER JOIN OmniJobData.JobData.JobStatuses js
		ON js.JobNumber = b.OrderNumber
		WHERE b.QuoteNumber = ${quoteNumber}`;

		const boxList = await formatBoxes(boxes.recordsets[0]);

		return { ...quoteItems, boxes: boxList, error: '' };
	} catch (error) {
		return { error: error.message };
	}
};

module.exports = {
	getOrderByJobNumber,
	getOrderByQuoteNumber,
};
