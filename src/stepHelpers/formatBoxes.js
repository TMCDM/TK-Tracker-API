const { getCuttingBillStatus } = require("./getCuttinBillStatus")


const formatBoxes = async (boxes, pool) => {
	console.log("formatting boxes")
	const boxFunc = async (box) => {
		//check if the box has refridgeration

		//get the cutting bill status of the box
		const cuttinBillStatus = getCuttingBillStatus(box.PD);

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

	return Promise.all(boxes.map(async (item) => await boxFunc(item)));
};

module.exports = {
	formatBoxes
}