const { boxAndQuoteDBConfig } = require("./dbconfig")
const sql = require('mssql');

const getRef = async (jobNumber) => {
	try {
		let pool = await sql.connect(boxAndQuoteDBConfig);
		let ref = await pool.request()
			.query`SELECT State Job# FROM OmniJobData.JobData.RefrigerationInventory ri WHERE ri.Job# = ${jobNumber}`;

		let res = {};

		//check if there are records
		const hasRef = Boolean(ref.recordsets[0].length);

		//if there are no records skip the ref side of the items
		if (!hasRef) {
			res.Refrigeration = {
				name: 'Refigeration',
				status: 'Complete',
				done: false,
				skip: true,
			};
		}

		//if there are records but the state is not "In House"
		if (
			hasRef &&
			ref.recordsets[0].some(
				(item) => item['Job#'].toLowerCase() !== 'in house'
			)
		) {
			res.Refrigeration = {
				name: 'Refigeration',
				status: 'In Progress',
				done: false,
				skip: true,
			};
		}

		return res;
	} catch (error) {
		throw new Error('REF ERROR');
	}
};

const getCuttinBillStatus = (boxPD) => {
	let done = false;
	let status = '';
	let skip = false;

	switch (boxPD) {
		case (boxPD = 'G'):
			status = 'Complete';
		case (boxPD = 'R'):
			status = 'Not Started';
			done = true;
		case (boxPD = 'Y'):
			status = 'In Process';
			done = true;
		case (boxPD = 'S'):
			status = 'N/A';
			skip = true;
		default:
			break;
	}

	return { status, done, skip };
};

const formatBoxes = async (boxes) => {
	const boxFunc = async (box) => {
		const refrigeration = await getRef(box.JobNumber);
		const cuttinBillStatus = getCuttinBillStatus(box.PD);

		const getPanelStatus = () => {
			const manufactuerPanelsStarted =
				box.CLT !== 0 && box.DShr !== 0 ? 'Complete' : 'In Progress';
			const manufactuerPanelsComplete =
				box.DHng !== 0 && box.Gask !== 0 ? 'Complete' : 'In Progress';
			return {
				name: 'Manufacturers Panels',
				status:
					manufactuerPanelsStarted && manufactuerPanelsComplete === 'Complete'
						? 'Complete'
						: 'In Progress',
			};
		};

		return {
			CreationDate: box.CreationDate,
			QuoteNumber: box.QuoteNumber,
			BoxLetter: box.BoxLetter,
			ItemNumber: box.ItemNumber,
			Description: box.Description,
			JobNumber: box.JobNumber,
			JobState: box.JobState,
			/* Auto Complete */
			status: {
				quoteApproved: {
					name: 'Quote Approved',
					status: 'Complete',
					done: false,
					skip: false,
				},
				drawingApproved: {
					name: 'Drawing Approved',
					status: 'Complete',
					done: false,
					skip: false,
				},
				cuttingBill: {
					name: 'Cutting Bill / Work Order Generated',
					...cuttinBillStatus,
				},

				...refrigeration,

				manufactuerPanels: getPanelStatus(),

				qualityInspection: {
					name: 'Quality Inpspection',
					status:
						box.JobState.toLowerCase() !== 'shipped'
							? 'In Progress'
							: 'Complete',
				},

				shipped: {
					name: 'Shipped',
					status:
						box.JobState.toLowerCase() === 'shipped' ? 'Shipped' : 'Waiting',
				},
			},
		};
	};

	return Promise.all(boxes.map((item) => boxFunc(item)));
};

const getOrderByOrderNumber = async (quoteNumber) => {




	try {

		let pool = await sql.connect(boxAndQuoteDBConfig);

		let quote = await pool.request().query`SELECT
CstrName,
CstrContact,
CstrPostalAddress,
CstrCity,
CstrState,
CstrZip,
CstrTelephone,
CstrCell,
CstrFax,
CstrEmail,
ShpToCompany,
ShpToContact,
ShpToAltContact,
ShpToPostalAddress,
ShpToCity,
ShpToState,
ShpToZip,
ShpToTelephone,
ShpToFax,
ShpToEmail,
Consultant
FROM Quotes q WHERE q.QuoteNumber = ${quoteNumber}`.then((quote) => {
			return quote;
		});

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


		const quoteItems = quote.recordsets[0][0];

		if (!quoteItems) {
			return { error: "Record not found" }
		}


		return { ...quoteItems, boxes: boxList, error: "" };
	} catch (error) {
		return { error: error.message };
	}
};


module.exports = {
	getOrderByOrderNumber
}