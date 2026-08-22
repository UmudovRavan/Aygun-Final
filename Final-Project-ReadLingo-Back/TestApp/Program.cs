using System;
using System.Reflection;

namespace TestApp
{
    class Program
    {
        static void Main(string[] args)
        {
            PrintProperties(typeof(Stripe.InvoiceParent), "Stripe.InvoiceParent");
            
            var prop = typeof(Stripe.InvoiceParent).GetProperty("SubscriptionDetails");
            if (prop != null)
            {
                PrintProperties(prop.PropertyType, prop.PropertyType.FullName);
            }
        }

        static void PrintProperties(Type type, string name)
        {
            Console.WriteLine($"=== {name} Properties ===");
            var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (var prop in properties)
            {
                Console.WriteLine($"{prop.Name} ({prop.PropertyType.Name})");
            }
            Console.WriteLine();
        }
    }
}
