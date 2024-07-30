import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../lib/prisma'

import { getMailClient } from '../lib/mail'
import nodemailer from 'nodemailer'

import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-error'

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/confirm',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid('Invalid id'),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participant: {
            where: {
              is_owner: false,
            },
          },
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      if (trip.is_confirmed) {
        return reply.redirect(`http://localhost:3000/trips/${tripId}`)
      }

      await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          is_confirmed: true,
        },
      })

      const formattedStartData = dayjs(trip.starts_at).format('DD [de] MMMM')
      const formattedEndData = dayjs(trip.ends_at).format('LL')

      const mail = await getMailClient()

      await Promise.all(
        trip.participant.map(async (p) => {
          const confirmTripLink = `http://localhost:3333/participant/${p.id}/confirm`
          const message = await mail.sendMail({
            from: {
              name: 'Equipe plann.er',
              address: 'example@example.com',
            },
            to: p.email,
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
        }),
      )

      return reply.redirect(`http://localhost:3000/trips/${tripId}`)
    },
  )
}
