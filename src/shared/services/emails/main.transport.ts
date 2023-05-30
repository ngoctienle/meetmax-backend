import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import Logger from 'bunyan'
import sendGridMail from '@sendgrid/mail'

import { environment } from '@root/environment'

import { BadRequestError } from '@root/shared/globals/helpers/error-handler'

interface IMailOptions {
  from: string
  to: string
  subject: string
  html: string
}

const log: Logger = environment.createLogger('mailOptions')
sendGridMail.setApiKey(environment.SENDGRID_API_KEY!)

export class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (environment.NODE_ENV === 'test' || environment.NODE_ENV === 'development') {
      this.developmentEmailSender(receiverEmail, subject, body)
    } else {
      this.productionEmailSender(receiverEmail, subject, body)
    }
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: environment.SENDER_EMAIL,
        pass: environment.SENDER_EMAIL_PASSWORD
      }
    })

    const mailOptions: IMailOptions = {
      from: `Meetmax App <${environment.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    }

    try {
      await transporter.sendMail(mailOptions)
      log.info('Development email sent successfully')
    } catch (error) {
      log.error('Error sending email', error)
      throw new BadRequestError('Error sending email')
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from: environment.SENDER_EMAIL!,
      to: receiverEmail,
      subject,
      html: body
    }

    try {
      await sendGridMail.send(mailOptions)
      log.info('Production email sent successfully')
    } catch (error) {
      log.error('Error sending email', error)
      throw new BadRequestError('Error sending email')
    }
  }
}

export const mailTransport: MailTransport = new MailTransport()
