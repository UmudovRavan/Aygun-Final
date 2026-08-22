using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Exceptions
{
    public class ValidationAppException : Exception
    {
        public IDictionary<string, string[]> Errors { get; }

        public ValidationAppException() : base("One or more validation failures have occurred.")
        {
            Errors = new Dictionary<string, string[]>();
        }

        public ValidationAppException(IDictionary<string, string[]> errors) : this()
        {
            Errors = errors;
        }
    }
}
