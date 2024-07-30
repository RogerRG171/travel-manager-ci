/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { getMailClient } from '../lib/mail'
import nodemailer from 'nodemailer'

import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-error'
import { env } from '../env'

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips',
    {
      schema: {
        body: z.object({
          destination: z
            .string()
            .min(3, 'Minimum 3 characters')
            .max(150, 'Maximum 150 characters'),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z
            .string()
            .min(3, 'Minimum 3 characters')
            .max(150, 'Maximum 150 characters'),
          owner_email: z.string().email({ message: 'Invalid email' }),
          emails_to_invite: z.array(
            z.string().email({ message: 'Invalid email' }),
          ),
        }),
      },
    },
    async (request, reply) => {
      const {
        destination,
        starts_at,
        ends_at,
        owner_name,
        owner_email,
        emails_to_invite,
      } = request.body

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new ClientError('Invalid trip start date')
      }

      if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
        throw new ClientError('Invalid trip end date')
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          participant: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },

                ...emails_to_invite.map((email) => ({
                  email,
                })),
              ],
            },
          },
        },
      })

      const formattedStartData = dayjs(starts_at).format('DD [de] MMMM')
      const formattedEndData = dayjs(ends_at).format('LL')

      const confirmTripLink = `http://${env.HOST}:${env.PORT}/trips/${trip.id}/confirm`

      const mail = await getMailClient()

      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'example@example.com',
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: `Confirme sua viagem para ${destination} em ${formattedStartData}`,
        html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartData}</strong> a <strong>${formattedEndData}</strong>.</p>
          <br>
          <p>Para confirmar sua viagem, clique no link abaixo:</p>
          <br>
          <p>
              <a href="${confirmTripLink}">Confirmar viagem</a>
          </p>   
          <br> 
          <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
        </div>
        `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return reply.status(201).send({ tripId: trip.id })
    },
  )
}
