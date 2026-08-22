using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Exceptions
{
    public class RateLimitException : Exception
    {
        public RateLimitException(string message) : base(message)
        {
        }
    }
}
