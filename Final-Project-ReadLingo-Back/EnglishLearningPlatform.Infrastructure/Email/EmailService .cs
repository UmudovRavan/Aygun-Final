using EnglishLearningPlatform.Application.Interfaces.Services;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.Email
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(
            string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.SmtpHost))
            {
                _logger.LogWarning(
                    "Email is not configured; skipping send to {Recipient} with subject \"{Subject}\".", to, subject);
                return;
            }
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            
            using var client = new MailKit.Net.Smtp.SmtpClient();
            try
            {
                await client.ConnectAsync(
                    _settings.SmtpHost,
                    _settings.SmtpPort,
                    _settings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None,
                    cancellationToken);

                if (!string.IsNullOrWhiteSpace(_settings.Username))
                    await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);

                await client.SendAsync(message, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Recipient}.", to);
                throw;
            }
            finally
            {
                if (client.IsConnected)
                    await client.DisconnectAsync(true, cancellationToken);
            }
        }
    }
}
