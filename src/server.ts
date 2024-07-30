import fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import { createTrip } from './routes/create-trip'
import { getTrips } from './routes/get_trips'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { confirmTrip } from './routes/confirm-trip'
import { confirmParticipant } from './routes/confirm-participant'
import { createActivity } from './routes/create-actitvity'
import { getActivities } from './routes/get-activities'
import { createLink } from './routes/create-link'
import { getLinks } from './routes/get-links'
import { getPartcipants } from './routes/get-participants'
import { createInvite } from './routes/create-invite'
import { updatetrip } from './routes/update-trip'
import { getTripDetails } from './routes/get-trip-details'
import { getPartcipantDetails } from './routes/get-participant-detail'
import { errorhandler } from './error-handler'
import { env } from './env'

const app = fastify()

// cors
app.register(cors, {
  origin: true,
})

// fastify-type-provider-zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// dotenv
dotenv.config({ path: '.env' })
const PORT = env.PORT
const HOST = env.HOST

// error handler
app.setErrorHandler(errorhandler)

// routes
app.register(createTrip)
app.register(getTrips)
app.register(confirmTrip)
app.register(confirmParticipant)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)
app.register(getPartcipants)
app.register(createInvite)
app.register(updatetrip)
app.register(getTripDetails)
app.register(getPartcipantDetails)

app.listen({ port: PORT, host: HOST }).then(() => {
  console.log(`HTTP server running on http://${HOST}:${PORT}`)
})
