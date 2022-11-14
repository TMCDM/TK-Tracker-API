const formatRefrigeration = (box) => {

	let res = {}
	try {
		//if there are no records skip the ref side of the items
		if (!box.hasRef) {
			res.Refrigeration = {
				name: 'Refigeration',
				status: 'Complete',
				done: false,
				skip: true,
			};
		}

		//if there are records but the state is not "In House"
		if (box.hasRef && box.refInHouse) {
			res.refrigeration = {
				name: 'Refigeration',
				status: 'In Progress',
				done: false,
				skip: true,
			};
		}

		return res;
	} catch (error) {
		throw new Error(error);
	}
};

module.exports = {
	formatRefrigeration,
};
