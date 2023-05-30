import crypto from 'crypto'
import moment from 'moment'
import publicIP from 'ip'
import HTTP_STATUS from 'http-status-codes'
import { Request, Response } from 'express'

import { emailSchema, passwordSchema } from '@authFeatures/schemes/password'

import { environment } from '@root/environment'
import { joiValidation } from '@global/decorators/joi-validation.decorator'
import { BadRequestError } from '@global/helpers/error-handler'

import { authService } from '@service/db/auth.service'
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template'
import { emailQueue } from '@service/queues/email.queue'
import { IResetPasswordParams } from '@userFeatures/interfaces/user.interface'
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template'

export class Password {
  @joiValidation(emailSchema)
  public async createPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body

    const userExisted = await authService.getAuthUserByEmail(email)
    if (!userExisted) {
      throw new Error('Your email is not existed!')
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
    const randomCharacters: string = randomBytes.toString('hex')
    /* Valid on 1hours */
    const expirationTime = Date.now() + 60 * 60 * 1000
    await authService.updatePasswordToken(`${userExisted._id!}`, randomCharacters, expirationTime)

    /* Create an Email */
    const resetLink = `${environment.CLIENT_URL}/reset-password?token=${randomCharacters}`
    const template: string = forgotPasswordTemplate.passwordResetTemplate(userExisted.username!, resetLink)
    emailQueue.addEmailJobs('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset Your Password' })

    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email is sent' })
  }

  @joiValidation(passwordSchema)
  public async updatePassword(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body
    const { token } = req.params

    if (password !== confirmPassword) {
      throw new BadRequestError('Your password and confirmation password do not match!')
    }
    const userExisted = await authService.getAuthUserByPasswordToken(token)
    if (!userExisted) {
      throw new BadRequestError('Your token is invalid or expired!')
    }
    userExisted.password = password
    userExisted.passwordResetToken = undefined
    userExisted.passwordResetExpires = undefined
    await userExisted.save()

    /* Create an Email */
    const templateParams: IResetPasswordParams = {
      username: userExisted.username!,
      email: userExisted.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    }
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams)
    emailQueue.addEmailJobs('forgotPasswordEmail', {
      template,
      receiverEmail: userExisted.email!,
      subject: 'Password Reset Confirmation'
    })

    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated' })
  }
}
