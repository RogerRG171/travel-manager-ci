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
const PORT = parseInt(process.env.PORT as string)
const HOST = process.env.HOST as string

// routes
app.register(createTrip)
app.register(getTrips)
app.register(confirmTrip)
app.register(confirmParticipant)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)

app.listen({ port: PORT, host: HOST }).then(() => {
  console.log(`HTTP server running on http://${HOST}:${PORT}`)
})
