using EnglishLearningPlatform.Application.DTOs.Subscription;
using EnglishLearningPlatform.Application.Interfaces.Services;
using EnglishLearningPlatform.Infrastructure.Configuration;
using Microsoft.Extensions.Options;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Infrastructure.Services
{
    public class StripeProviderClient : IStripeProviderClient
    {
        private readonly StripeSettings _settings;
        private readonly StripeClient _client;

        public StripeProviderClient(IOptions<StripeSettings> settings)
        {
            _settings = settings.Value;
            _client = new StripeClient(_settings.SecretKey);
        }

        public async Task<string> GetOrCreateCustomerAsync(string email, string? existingCustomerId, CancellationToken cancellationToken = default)
        {
            var customerService = new CustomerService(_client);

            if (!string.IsNullOrEmpty(existingCustomerId))
            {
                try
                {
                    var existingCustomer = await customerService.GetAsync(existingCustomerId, cancellationToken: cancellationToken);
                    if (existingCustomer != null && existingCustomer.Deleted != true)
                    {
                        return existingCustomer.Id;
                    }
                }
                catch (StripeException)
                {
                    
                }
            }

            var options = new CustomerCreateOptions
            {
                Email = email,
                Metadata = new Dictionary<string, string>
                {
                    { "Email", email }
                }
            };

            var customer = await customerService.CreateAsync(options, cancellationToken: cancellationToken);
            return customer.Id;
        }

        public async Task<CheckoutSessionResponseDto> CreateCheckoutSessionAsync(
            string stripeCustomerId, string priceId, string successUrl, string cancelUrl, CancellationToken cancellationToken = default)
        {
            bool isPremium = priceId.Contains("Premium", StringComparison.OrdinalIgnoreCase)
                             || priceId.Contains("1U70CA", StringComparison.OrdinalIgnoreCase);

            long amountInCents = isPremium ? 699 : 399;
            string planName = isPremium ? "ReadLingo Premium Plan" : "ReadLingo Pro Plan";
            string tierName = isPremium ? "Premium" : "Pro";

            var options = new Stripe.Checkout.SessionCreateOptions
            {
                Customer = stripeCustomerId,
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
                {
                    new Stripe.Checkout.SessionLineItemOptions
                    {
                        PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                        {
                            Currency = "usd",
                            UnitAmount = amountInCents,
                            Recurring = new Stripe.Checkout.SessionLineItemPriceDataRecurringOptions
                            {
                                Interval = "month",
                            },
                            ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                            {
                                Name = planName,
                                Description = isPremium
                                    ? "Unlimited 24/7 AI Tutor, Story Generator, Unlimited Hearts"
                                    : "50 Daily AI Messages, Unlimited Hearts & Stories",
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "subscription",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Metadata = new Dictionary<string, string>
                {
                    { "Tier", tierName },
                    { "PriceId", priceId }
                },
                SubscriptionData = new Stripe.Checkout.SessionSubscriptionDataOptions
                {
                    Metadata = new Dictionary<string, string>
                    {
                        { "Tier", tierName },
                        { "PriceId", priceId }
                    }
                }
            };

            var service = new Stripe.Checkout.SessionService(_client);
            var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

            return new CheckoutSessionResponseDto
            {
                CheckoutUrl = session.Url,
                SessionId = session.Id
            };
        }

        public async Task CancelSubscriptionAsync(string stripeSubscriptionId, CancellationToken cancellationToken = default)
        {
            var service = new SubscriptionService(_client);
            var options = new SubscriptionUpdateOptions
            {
                CancelAtPeriodEnd = true
            };
            await service.UpdateAsync(stripeSubscriptionId, options, cancellationToken: cancellationToken);
        }

        public async Task<StripeWebhookEventDto?> GetSessionAsync(string sessionId, CancellationToken cancellationToken = default)
        {
            try
            {
                var service = new Stripe.Checkout.SessionService(_client);
                var session = await service.GetAsync(sessionId, new Stripe.Checkout.SessionGetOptions
                {
                    Expand = new List<string> { "subscription", "line_items" }
                }, cancellationToken: cancellationToken);

                if (session == null) return null;

                var priceId = session.Metadata?.GetValueOrDefault("PriceId") 
                              ?? session.LineItems?.Data?.FirstOrDefault()?.Price?.Id;

                var subId = session.SubscriptionId ?? (session.Subscription as Stripe.Subscription)?.Id;

                return new StripeWebhookEventDto
                {
                    EventType = "checkout.session.completed",
                    StripeCustomerId = session.CustomerId,
                    StripeSubscriptionId = subId,
                    StripeSessionId = session.Id,
                    CustomerEmail = session.CustomerDetails?.Email ?? session.Metadata?.GetValueOrDefault("Email"),
                    StripePriceId = priceId,
                    StripeStatus = session.PaymentStatus == "paid" || session.Status == "complete" ? "active" : session.Status,
                    CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1),
                    Metadata = session.Metadata,
                };
            }
            catch
            {
                return null;
            }
        }

        public StripeWebhookEventDto ParseWebhookEvent(string requestBody, string stripeSignatureHeader)
        {
            var stripeEvent = EventUtility.ConstructEvent(
                requestBody,
                stripeSignatureHeader,
                _settings.WebhookSecret
            );

            var dto = new StripeWebhookEventDto
            {
                EventType = stripeEvent.Type
            };

            if (stripeEvent.Data.Object is Stripe.Checkout.Session session)
            {
                dto.StripeCustomerId = session.CustomerId;
                dto.StripeSubscriptionId = session.SubscriptionId;
                dto.StripeSessionId = session.Id;
                dto.CustomerEmail = session.CustomerDetails?.Email ?? session.Metadata?.GetValueOrDefault("Email");
                dto.StripePriceId = session.Metadata?.GetValueOrDefault("PriceId");
            }
            else if (stripeEvent.Data.Object is Stripe.Subscription subscription)
            {
                dto.StripeCustomerId = subscription.CustomerId;
                dto.StripeSubscriptionId = subscription.Id;
                dto.StripeStatus = subscription.Status;
                
                var firstItem = subscription.Items?.Data?.FirstOrDefault();
                if (firstItem != null)
                {
                    dto.CurrentPeriodEnd = firstItem.CurrentPeriodEnd;
                    dto.StripePriceId = firstItem.Price?.Id;
                }
            }
            else if (stripeEvent.Data.Object is Stripe.Invoice invoice)
            {
                dto.StripeCustomerId = invoice.CustomerId;
                dto.StripeSubscriptionId = invoice.Parent?.SubscriptionDetails?.SubscriptionId ?? invoice.Lines?.Data?.FirstOrDefault()?.SubscriptionId;
                dto.StripeStatus = invoice.Status;
                
                var lineItem = invoice.Lines?.Data?.FirstOrDefault();
                if (lineItem != null)
                {
                    dto.StripePriceId = lineItem.Pricing?.PriceDetails?.PriceId;
                    
                    var period = lineItem.Period;
                    if (period != null)
                    {
                        dto.CurrentPeriodEnd = period.End;
                    }
                }
            }

            return dto;
        }
    }
}
