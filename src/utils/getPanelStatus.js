const getPanelStatus = (box) => {
  const manufactuerPanelsStarted =
    box.status.CLT !== '' && box.status.DShr !== '' ? true : false
  const manufactuerPanelsComplete =
    box.status.DHng !== 0 && box.status.Gask !== 0 ? true : false

  return {
    name: 'Manufacturers Panels',
    status:
      manufactuerPanelsStarted && manufactuerPanelsComplete
        ? 'Complete'
        : 'In Progress',
    done:
      manufactuerPanelsStarted && manufactuerPanelsComplete
        ? false
        : true,
    skip: false,
  }
}

module.exports = {
  getPanelStatus,
}
