using System;
using System.Text.RegularExpressions;

namespace EnglishLearningPlatform.Application.Common
{
    public static class JsonCleaner
    {
        public static string Clean(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            var trimmed = input.Trim();

            // Extract content inside ```json ... ``` or ``` ... ```
            var match = Regex.Match(trimmed, @"```(?:json)?\s*([\s\S]*?)\s*```", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return match.Groups[1].Value.Trim();
            }

            // If it starts with { or [, find first and last bracket
            var firstBrace = trimmed.IndexOf('{');
            var firstBracket = trimmed.IndexOf('[');

            if (firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket))
            {
                var lastBrace = trimmed.LastIndexOf('}');
                if (lastBrace > firstBrace)
                {
                    return trimmed.Substring(firstBrace, lastBrace - firstBrace + 1);
                }
            }
            else if (firstBracket >= 0)
            {
                var lastBracket = trimmed.LastIndexOf(']');
                if (lastBracket > firstBracket)
                {
                    return trimmed.Substring(firstBracket, lastBracket - firstBracket + 1);
                }
            }

            return trimmed;
        }
    }
}
