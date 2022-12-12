const formatRefrigeration = (box) => {
	let res = {}
	try {
		//if there are NO records skip the ref side of the items
		if (!box.hasRef) {
			res.Refrigeration = {
				name: 'Refrigeration',
				status: 'Complete',
				done: false,
				skip: true,
			}
			//if there are records but the state is NOT "In House"
		} else if (box.hasRef && !box.refInHouse) {
			res.refrigeration = {
				name: 'Refrigeration',
				status: 'In Progress',
				done: false,
				skip: false,
			}
			//if there are records AND the state is not "In House"
		} else if (box.hasRef && box.refInHouse) {
			res.refrigeration = {
				name: 'Refrigeration',
				status: 'Complete',
				done: false,
				skip: false,
			}
		}

		return res
	} catch (error) {
		throw new Error(error)
	}
}

module.exports = {
	formatRefrigeration,
}
