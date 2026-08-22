using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Interfaces.Services
{
    public interface IAIProviderClient
    {
        Task<string> CompleteAsync(AIFeatureType featureType, string prompt, CancellationToken cancellationToken = default);
    }
}
