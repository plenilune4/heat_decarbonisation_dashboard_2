import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { Request, Response, Router } from 'express'

import Client from '../models/client.model'
import Token from '../models/token.model'
import {
    SamplingStrategy,
    ScenarioConfiguration,
    SimulationError,
    SimulationLog,
    SimulationResult,
    SimulationSetup,
} from '../models/types'
import User from '../models/user.model'
import { SALT_ROUNDS } from '../services/authentication.service'
import { EMAIL_TEMPLATES } from '../services/email.config'
import { SendEmail } from '../services/email.service'
import LoggingService from '../services/logging.service'
import { ENDPOINTS } from './_endpoints'
import BaseRoutes from './helper'

const router = Router()
const ROUTES = ENDPOINTS.app

const POPULATE_ANALYSIS = ['evaluationFunction', 'owner', 'client']
const POPULATE_EXTERNAL_ANALYSIS = ['owner', 'client']

// function isClientAccessActive(client: { accessStartAt?: Date; accessEndAt?: Date } | null | undefined) {
//     if (!client) return false
//     const now = new Date()
//     if (client.accessStartAt && new Date(client.accessStartAt).valueOf() > now.valueOf()) {
//         return false
//     }
//     if (client.accessEndAt && new Date(client.accessEndAt).valueOf() < now.valueOf()) {
//         return false
//     }
//     return true
// }

// User routes with access control
BaseRoutes(router, {
    model: User,
    route: ROUTES.user,
    excludedRoutes: ['delete'],
    userSpecific: true,
    ownerField: '_id',
    populate: ['client'],
    excludedUpdateProperties: ['client', 'permissions', 'passwordHash', 'isClientAdmin'],
})

// Client User routes with access control
// All users can get all users in their client
BaseRoutes(router, {
    model: User,
    route: ROUTES.clientUser,
    excludedRoutes: ['post', 'delete'],
    userSpecific: true,
    ownerField: 'client',
    ownerComparisonFunction: (res) => res.locals.sessionUser?.client?._id?.toString(),
    filter: { isArchived: { $ne: true } },
})

//
//Maybe we will want something like this again.
// // Analysis routes with access control
// BaseRoutes(router, {
//     model: Analysis,
//     route: ROUTES.analysis,
//     excludedRoutes: ['get'],
//     userSpecific: true,
//     ownerField: 'client',
//     ownerComparisonFunction: (res) => res.locals.sessionUser?.client?._id?.toString(),
//     populate: ['owner', 'client', 'evaluationFunction', 'evaluationFunction.name'],
// })
// router.get(ROUTES.analysis, async (req: Request, res: Response) => {
//     const { sessionUser } = res.locals
//
//     const targetClient = await Client.findById(sessionUser.client._id)
//     if (!targetClient) {
//         return res.status(404).json({ message: 'Client not found' })
//     }
//
//     const analyses = await Analysis.find({ client: targetClient._id })
//         .sort({ createdAt: -1 })
//         .select('-results')
//         .populate(POPULATE_ANALYSIS)
//
//     return res.status(200).json(analyses)
// })


// // Client Analyses routes
// router.get(ROUTES.client + '/:client_id/analyses', async (req: Request, res: Response) => {
//     const { sessionUser } = res.locals
//
//     if (!req.params.client_id || req.params.client_id === 'undefined') {
//         return res.status(400).json({ message: 'Client ID is required' })
//     }
//
//     const targetClient = await Client.findById(req.params.client_id)
//     if (!targetClient) {
//         return res.status(404).json({ message: 'Client not found' })
//     }
//
//     if (sessionUser.client._id.toString() !== targetClient._id.toString()) {
//         return res.status(403).json({ message: 'You are not authorized to view analyses for this client' })
//     }
//
//     const analyses = await Analysis.find({ client: targetClient._id })
//         .sort({ createdAt: -1 })
//         .populate(POPULATE_ANALYSIS)
//     return res.status(200).json(analyses)
// })

// Cli

export default router
