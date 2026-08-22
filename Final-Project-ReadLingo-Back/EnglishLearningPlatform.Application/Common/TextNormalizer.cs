using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.Common
{
    public static class TextNormalizer
    {
        public static string Normalize(string rawWord)
        {
            if (string.IsNullOrWhiteSpace(rawWord))
                return string.Empty;

            var trimmed = rawWord.Trim().ToLowerInvariant();
            var chars = trimmed.ToCharArray();
            var start = 0;
            var end = chars.Length - 1;

            while (start <= end && !char.IsLetter(chars[start]))
                start++;

            while (end >= start && !char.IsLetter(chars[end]))
                end--;

            if (start > end)
                return string.Empty;

            var core = trimmed.Substring(start, end - start + 1);

            var sb = new System.Text.StringBuilder(core.Length);
            foreach (var c in core)
            {
                if (char.IsLetter(c) || c == '\'')
                    sb.Append(c);
            }

            return sb.ToString();
        }
    }
}
