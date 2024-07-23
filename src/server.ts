import fastify from 'fastify'
import dotenv from 'dotenv'

const app = fastify()

dotenv.config({ path: '.env' })
const PORT = parseInt(process.env.PORT as string)
const HOST = process.env.HOST as string

app.listen({ port: PORT, host: HOST }).then(() => {
  console.log(`HTTP server running on http://${HOST}:${PORT}`)
})
