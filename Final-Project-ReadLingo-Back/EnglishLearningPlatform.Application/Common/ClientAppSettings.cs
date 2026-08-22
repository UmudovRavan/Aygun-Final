using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Common
{
    public class ClientAppSettings
    {
        public const string SectionName = "ClientApp";

        public string BaseUrl { get; set; } = "https://app.englishlearningplatform.example";
        public string EmailConfirmationPath { get; set; } = "/confirm-email";
        public string ResetPasswordPath { get; set; } = "/reset-password";
    }
}
