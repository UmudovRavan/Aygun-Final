using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Responses
{
    public class Result<T> : Result
    {
        public T? Value { get; }

        private Result(bool isSuccess, T? value, string error, string message)
            : base(isSuccess, error, message)
        {
            Value = value;
        }

        public static Result<T> Success(T value) => new(true, value, string.Empty, string.Empty);

        public static Result<T> Success(T value, string message) => new(true, value, string.Empty, message);

        public static new Result<T> Failure(string error) => new(false, default, error, string.Empty);
    }
}
