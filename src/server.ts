import fastify from 'fastify'
import dotenv from 'dotenv'
import { createTrip } from './routes/create-trip'
import { getTrips } from './routes/get_trips'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

const app = fastify()

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

app.listen({ port: PORT, host: HOST }).then(() => {
  console.log(`HTTP server running on http://${HOST}:${PORT}`)
})
