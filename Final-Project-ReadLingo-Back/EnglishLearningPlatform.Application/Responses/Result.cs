using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Responses
{
    public class Result
    {
        public bool IsSuccess { get; }

        public bool IsFailure => !IsSuccess;

        public string Error { get; } = string.Empty;

        public string Message { get; } = string.Empty;

        protected Result(bool isSuccess, string error, string message)
        {
            if (isSuccess && !string.IsNullOrEmpty(error))
                throw new InvalidOperationException("A successful result cannot contain an error.");

            if (!isSuccess && string.IsNullOrEmpty(error))
                throw new InvalidOperationException("A failed result must contain an error.");

            IsSuccess = isSuccess;
            Error = error;
            Message = message;
        }

        public static Result Success() => new(true, string.Empty, string.Empty);

        public static Result Success(string message) => new(true, string.Empty, message);

        public static Result Failure(string error) => new(false, error, string.Empty);
    }
}
