const getCuttingBillStatus = (box) => {
    const boxPD = box.status.PD

    let done = false
    let status = ''
    let skip = false

    switch (boxPD) {
        case 'G':
            status = 'Complete'
            break
        case 'R':
            status = 'Not Started'
            done = true
            break
        case 'Y':
            status = 'In Process'
            done = true
            break
        case 'S':
            status = 'N/A'
            skip = true
            break
        default:
            break
    }

    return { status, done, skip }
}

module.exports = {
    getCuttingBillStatus,
}
