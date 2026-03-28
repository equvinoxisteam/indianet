import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'

export default {
    createRfq: (details) => {
        return new Promise((resolve, reject) => {
            details.createdAt = new Date()
            details.updatedAt = new Date()
            details.status = 'pending'
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
    updateRfqStatus: ({ rfqId, status, adminNotes, quotedPrice }) => {
        return new Promise((resolve, reject) => {
            let updateFields = {
                status: status,
                updatedAt: new Date()
            }
            if (adminNotes !== undefined) updateFields.adminNotes = adminNotes
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
}
