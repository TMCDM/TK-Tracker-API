const { getCuttingBillStatus } = require('./getCuttinBillStatus')
const { formatRefrigeration } = require('./formatRefrigeration')
const { getPanelStatus } = require('./getPanelStatus')

const formatBoxes = (boxes) => {
    return boxes.map((box) => {
        const cuttinBillStatus = getCuttingBillStatus(box)
        const refrigeration = formatRefrigeration(box)
        const panelStatus = getPanelStatus(box)

        const formattedBox = {
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
                manufactuerPanels: panelStatus,
                qualityInspection: {
                    name: 'Quality Inpspection',
                    //if the status is shipped that means it went through qa so move to shipped beloew
                    status:
                        box.status.jobState.toLowerCase() === 'shipped'
                            ? 'Complete'
                            : 'In Progress',
                    done:
                        box.status.jobState.toLowerCase() === 'shipped'
                            ? false
                            : true,
                },
                shipped: {
                    name: 'Shipped',
                    status:
                        box.status.jobState.toLowerCase() === 'shipped'
                            ? 'Shipped'
                            : 'Waiting',
                },
            },
        }

        return Object.assign(box, formattedBox)
    })
}

module.exports = {
    formatBoxes,
}
