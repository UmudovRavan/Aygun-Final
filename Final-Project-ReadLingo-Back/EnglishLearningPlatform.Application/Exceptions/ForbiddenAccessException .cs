using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Exceptions
{

    public class ForbiddenAccessException : Exception
    {
        public ForbiddenAccessException() : base("You are not authorized to perform this action.")
        {
        }

        public ForbiddenAccessException(string message) : base(message)
        {
        }
    }
}
