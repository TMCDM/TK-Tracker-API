const getPanelStatus = (box) => {
	const manufactuerPanelsStarted =
		box.status.CLT !== 0 && box.status.DShr !== 0 ? 'Complete' : 'In Progress';
	const manufactuerPanelsComplete =
		box.status.DHng !== 0 && box.status.Gask !== 0 ? 'Complete' : 'In Progress';
	return {
		name: 'Manufacturers Panels',
		status:
			manufactuerPanelsStarted && manufactuerPanelsComplete === 'Complete'
				? 'Complete'
				: 'In Progress',
	};
};

module.exports = {
	getPanelStatus
}