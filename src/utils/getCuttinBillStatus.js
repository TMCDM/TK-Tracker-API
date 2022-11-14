const getCuttingBillStatus = (box) => {
	const boxPD = box.status.PD
	let done = false;
	let status = '';
	let skip = false;

	switch (boxPD) {
		case (boxPD === 'G'):
			status = 'Complete';
		case (boxPD === 'R'):
			status = 'Not Started';
			done = true;
		case (boxPD === 'Y'):
			status = 'In Process';
			done = true;
		case (boxPD === 'S'):
			status = 'N/A';
			skip = true;
		default:
			break;
	}

	return { status, done, skip };
};


module.exports = {
	getCuttingBillStatus
}