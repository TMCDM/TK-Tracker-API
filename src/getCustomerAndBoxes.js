const { unflatten } = require('./utils/unflat');

const getRefrigeration = async (box, pool) => {
	try {
		let ref = await pool.request()
			.query`SELECT State as Job# FROM OmniJobData.JobData.RefrigerationInventory ri WHERE ri.Job# = ${box.jobNumber}`;

		const data = ref.recordsets[0]

		//if no ref on the order
		if (!data) {
			box.hasRef = false
			box.refInHouse = null
		} else {
			//there is ref on the order

			box.hasRef = Boolean(ref.recordsets[0].length);
			box.refInHouse = ref.recordsets[0].some(
				(item) => item['Job#'].toLowerCase() !== 'in house'
			);
		}



		return box;
	} catch (error) {
		console.log(error)
	}
};

const getCustomerAndBoxes = async (orderNumner, pool) => {
	let customerAndBoxes = await pool.request().query`
SELECT 
q.QuoteNumber as "quoteNumber",
q.CstrName as "customer.name",
q.CstrContact as "customer.contact",
q.CstrPostalAddress as "customer.address",
q.CstrCity as "customer.city",
q.CstrState as "customer.state",
q.CstrZip as "customer.zip",
q.CstrTelephone as "customer.phone",
q.CstrCell as "customer.cell",
q.CstrEmail as "customer.email",
b.CreationDate as "box.creationDate", 
b.QuoteNumber as "box.quoteNumber", 
b.BoxLetter as "box.boxLetter", 
b.ItemNumber as "box.ItemNumber" , 
b.Description as "box.description",
js.JobNumber as "box.jobNumber",
js.JobState as "box.status.jobState",
js.PD as "box.status.PD",
js.Elec as "box.status.Elec",
js.CNC as "box.status.CNC",
js.Fram as "box.status.Fram",
js.CTL as "box.status.CTL",
js.WShr as "box.status.Wshr",
js.WLay as "box.status.Wlay",
js.WBrk as "box.status.WBrk",
js.DShr as "box.status.DShr",
js.DLay as "box.status.DLay",
js.DBrk as "box.status.DBrk",
js.Weld as "box.status.Weld",
js.Ref as "box.status.Ref",
js.WAsm as "box.status.WAsm",
js.DAsm as "box.status.DAsm",
js.DWir as "box.status.DWir",
js.DHng as "box.status.DHng",
js.Foam as "box.status.Foam",
js.Gask as "box.status.Gask",
js.Ship as "box.status.Ship"
FROM Box b 
INNER JOIN OmniJobData.JobData.JobStatuses js 
ON b.OrderNumber = js.JobNumber
INNER JOIN Quotes q 
ON  q.QuoteNumber = b.QuoteNumber
WHERE b.QuoteNumber = (SELECT QuoteNumber FROM  Box b  WHERE b.OrderNumber = ${orderNumner}) 
	`;

	//pull the data from the records
	const data = customerAndBoxes.recordsets[0];

	//error if there is no data
	if (!data) {
		throw new Error('No records found');
	}


	//unflat the response 
	const inflated = data.map((record) => unflatten(record));

	//pull out the customer from the first
	const customer = inflated[0].customer;

	// const customer = inflated[0].customer
	const boxes = inflated
		.map((item) => item.box)

	//TODO: it would be better to get these all in one query
	const boxesWithRef = await Promise.all(boxes.map(async (box) => await getRefrigeration(box, pool)))



	return { customer: customer, boxes: boxesWithRef };
};

module.exports = {
	getCustomerAndBoxes,
};
