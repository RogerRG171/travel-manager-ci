/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import nodemailer from 'nodemailer'
import { getMailClient } from '../lib/mail'
import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-error'
import { env } from '../env'

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/invite',
    {
      schema: {
        body: z.object({
          email: z.string().email({ message: 'Invalid email' }),
        }),
        params: z.object({
          tripId: z.string().uuid('Invalid id'),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { email } = request.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId,
        },
      })

      const formattedStartData = dayjs(trip.starts_at).format('DD [de] MMMM')
      const formattedEndData = dayjs(trip.ends_at).format('LL')

      const mail = await getMailClient()

      const confirmTripLink = `http://${env.HOST}:${env.PORT}/participant/${participant.id}/confirm`
      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'example@example.com',
        },
        to: participant.email,
        subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartData}`,
        html: `
              <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartData}</strong> a <strong>${formattedEndData}</strong>.</p>
                <br>
                <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
                <br>
                <p>
                    <a href="${confirmTripLink}">Confirmar presença</a>
                </p>   
                <br> 
                <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
              </div>
              `.trim(),
      })
      console.log(nodemailer.getTestMessageUrl(message))

      return reply.status(201).send({ participantId: participant.id })
    },
  )
}
