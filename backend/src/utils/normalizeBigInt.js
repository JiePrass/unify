function normalizeBigInt(obj) {
    if (Array.isArray(obj)) {
        return obj.map(normalizeBigInt)
    } else if (obj && typeof obj === 'object') {
        return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, normalizeBigInt(v)])
        )
    } else if (typeof obj === 'bigint') {
        return Number(obj) // atau obj.toString()
    }
    return obj
}

module.exports = normalizeBigInt;