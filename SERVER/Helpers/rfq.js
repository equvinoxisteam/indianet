import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'
import { getMonthStart } from '../Config/vendorPlans.js'

export default {
    createRfq: (details) => {
        return new Promise((resolve, reject) => {
            details.createdAt = new Date()
            details.updatedAt = new Date()
            details.status = 'approved'
            details.autoApproved = true
            details.adminNotes = ''
            details.quotedPrice = null
            db.get().collection(collections.RFQ).insertOne(details).then((done) => {
                resolve(done)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getAllRfqs: ({ search, skip, status }, limit) => {
        return new Promise(async (resolve, reject) => {
            let matchStage = {}
            if (search && search.length > 0) {
                matchStage.$or = [
                    { userName: { $regex: search, $options: 'i' } },
                    { productName: { $regex: search, $options: 'i' } },
                    { userEmail: { $regex: search, $options: 'i' } }
                ]
            }
            if (status && status !== 'all') {
                matchStage.status = status
            }

            let rfqs = await db.get().collection(collections.RFQ)
                .find(matchStage)
                .sort({ createdAt: -1 })
                .skip(parseInt(skip) || 0)
                .limit(limit)
                .toArray().catch(() => {
                    reject()
                })

            if (rfqs) {
                resolve(rfqs)
            } else {
                reject()
            }
        })
    },
    getTotalRfqs: ({ search, status }) => {
        return new Promise(async (resolve, reject) => {
            let matchStage = {}
            if (search && search.length > 0) {
                matchStage.$or = [
                    { userName: { $regex: search, $options: 'i' } },
                    { productName: { $regex: search, $options: 'i' } },
                    { userEmail: { $regex: search, $options: 'i' } }
                ]
            }
            if (status && status !== 'all') {
                matchStage.status = status
            }

            let total = await db.get().collection(collections.RFQ)
                .countDocuments(matchStage).catch(() => {
                    reject()
                })

            resolve(total || 0)
        })
    },
    getOneRfq: (rfqId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.RFQ).findOne({
                _id: ObjectId(rfqId)
            }).then((rfq) => {
                resolve(rfq)
            }).catch(() => {
                reject()
            })
        })
    },
    updateRfqStatus: ({ rfqId, status, adminNotes, quotedPrice, payType }) => {
        return new Promise((resolve, reject) => {
            let updateFields = {
                status: status,
                updatedAt: new Date()
            }
            if (adminNotes !== undefined) updateFields.adminNotes = adminNotes
            if (payType !== undefined) updateFields.payType = payType
            if (quotedPrice !== undefined && quotedPrice !== null) {
                updateFields.quotedPrice = parseFloat(quotedPrice)
            }

            db.get().collection(collections.RFQ).updateOne({
                _id: ObjectId(rfqId)
            }, {
                $set: updateFields
            }).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    },
    deleteRfq: (rfqId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.RFQ).deleteOne({
                _id: ObjectId(rfqId)
            }).then((data) => {
                if (data.deletedCount > 0) {
                    resolve()
                } else {
                    reject()
                }
            }).catch(() => {
                reject()
            })
        })
    },
    getUserRfqs: (userId) => {
        return new Promise(async (resolve, reject) => {
            let rfqs = await db.get().collection(collections.RFQ)
                .find({ userId: userId })
                .sort({ createdAt: -1 })
                .toArray().catch(() => {
                    reject()
                })

            resolve(rfqs || [])
        })
    }
    ,

    // Vendor RFQ list + pagination (visibility limited by plan quota per month)
    getVendorRfqs: ({ vendorId, search, skip, status, rfqVisibilityLimit }, limit) => {
        return new Promise(async (resolve, reject) => {
            try {
                const monthStart = getMonthStart()
                const approvedBase = {
                    vendorId,
                    status: 'approved',
                    createdAt: { $gte: monthStart },
                }

                let visibleIds = null
                let totalApproved = await db.get().collection(collections.RFQ)
                    .countDocuments(approvedBase)

                if (rfqVisibilityLimit != null) {
                    const visibleRfqs = await db.get().collection(collections.RFQ)
                        .find(approvedBase)
                        .sort({ createdAt: -1 })
                        .limit(rfqVisibilityLimit)
                        .project({ _id: 1 })
                        .toArray()

                    visibleIds = visibleRfqs.map((r) => r._id)
                }

                let matchStage = {
                    vendorId,
                    status: 'approved',
                }

                if (visibleIds) {
                    if (!visibleIds.length) {
                        return resolve({
                            total: 0,
                            rfqs: [],
                            totalApproved: totalApproved || 0,
                            hiddenCount: totalApproved || 0,
                        })
                    }
                    matchStage._id = { $in: visibleIds }
                }

                if (search && search.length > 0) {
                    matchStage.$or = [
                        { userName: { $regex: search, $options: 'i' } },
                        { productName: { $regex: search, $options: 'i' } },
                        { userEmail: { $regex: search, $options: 'i' } },
                    ]
                }

                if (status && status !== 'all') {
                    matchStage.status = status
                }

                const total = await db.get().collection(collections.RFQ)
                    .countDocuments(matchStage)

                const rfqs = await db.get().collection(collections.RFQ)
                    .find(matchStage)
                    .sort({ createdAt: -1 })
                    .skip(parseInt(skip, 10) || 0)
                    .limit(limit)
                    .toArray()

                const hiddenCount = rfqVisibilityLimit != null
                    ? Math.max(0, (totalApproved || 0) - rfqVisibilityLimit)
                    : 0

                resolve({
                    total: total || 0,
                    rfqs: rfqs || [],
                    totalApproved: totalApproved || 0,
                    hiddenCount,
                })
            } catch {
                reject()
            }
        })
    },

    getRfqWithVendorDetails: (rfqId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const rfq = await db.get().collection(collections.RFQ).findOne({
                    _id: ObjectId(rfqId),
                })
                if (!rfq) return reject()

                let vendorDetails = null
                if (rfq.vendorId && String(rfq.vendorId).length === 24) {
                    vendorDetails = await db.get().collection(collections.VENDORS).findOne({
                        _id: ObjectId(rfq.vendorId),
                    }, {
                        projection: {
                            name: 1,
                            email: 1,
                            number: 1,
                            phone: 1,
                            companyInfo: 1,
                            plan: 1,
                            planStatus: 1,
                        },
                    })
                }

                resolve({
                    ...rfq,
                    vendorName: vendorDetails?.companyInfo || vendorDetails?.name || null,
                    vendorEmail: vendorDetails?.email || null,
                    vendorPhone: vendorDetails?.number || vendorDetails?.phone || null,
                    vendorPlan: vendorDetails?.plan || null,
                })
            } catch {
                reject()
            }
        })
    },

    // Vendor can only update RFQs belonging to them.
    updateVendorQuotedPrice: ({ rfqId, quotedPrice, vendorId }) => {
        return new Promise((resolve, reject) => {
            if (!rfqId || !vendorId) return reject()
            if (rfqId.length !== 24) return reject()

            const price = quotedPrice !== undefined && quotedPrice !== null ? parseFloat(quotedPrice) : null
            if (price === null || Number.isNaN(price)) return reject()

            db.get().collection(collections.RFQ).updateOne(
                { _id: ObjectId(rfqId), vendorId: vendorId, status: 'approved' },
                {
                    $set: {
                        quotedPrice: price,
                        updatedAt: new Date()
                    }
                }
            ).then(() => resolve()).catch(() => reject())
        })
    }
}
