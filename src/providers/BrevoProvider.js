const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (emailReceiver, customSubject, customHtmlContent) => {
  // Khởi tạo sendSmtpEmail
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // Tài khoản gửi email
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Những tài khoản nhận mail
  sendSmtpEmail.to = [{ email: emailReceiver }]

  // Tiêu đề email
  sendSmtpEmail.subject = customSubject

  // Nội dung email
  sendSmtpEmail.htmlContent = customHtmlContent

  // Gọi hành động gửi email
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}