namespace EnglishLearningPlatform.Application.Common;

public static class EnglishLemmatizer
{
    private static readonly Dictionary<string, string> IrregularWords = new()
    {
        ["children"] = "child",
        ["mice"] = "mouse",
        ["men"] = "man",
        ["women"] = "woman",
        ["people"] = "person",
        ["feet"] = "foot",
        ["teeth"] = "tooth",
        ["geese"] = "goose",
        ["went"] = "go",
        ["came"] = "come",
        ["was"] = "be",
        ["were"] = "be",
        ["been"] = "be",
        ["had"] = "have",
        ["has"] = "have",
        ["did"] = "do",
        ["does"] = "do",
        ["said"] = "say",
        ["saw"] = "see",
        ["seen"] = "see",
        ["ate"] = "eat",
        ["eaten"] = "eat",
        ["gave"] = "give",
        ["given"] = "give",
        ["took"] = "take",
        ["taken"] = "take",
        ["made"] = "make",
        ["knew"] = "know",
        ["known"] = "know",
        ["thought"] = "think",
        ["bought"] = "buy",
        ["brought"] = "bring",
        ["caught"] = "catch",
        ["taught"] = "teach",
        ["found"] = "find",
        ["felt"] = "feel",
        ["kept"] = "keep",
        ["slept"] = "sleep",
        ["left"] = "leave",
        ["met"] = "meet",
        ["ran"] = "run",
        ["began"] = "begin",
        ["begun"] = "begin",
        ["drank"] = "drink",
        ["drunk"] = "drink",
        ["drove"] = "drive",
        ["driven"] = "drive",
        ["wrote"] = "write",
        ["written"] = "write",
        ["spoke"] = "speak",
        ["spoken"] = "speak",
        ["broke"] = "break",
        ["broken"] = "break",
        ["chose"] = "choose",
        ["chosen"] = "choose",
        ["flew"] = "fly",
        ["flown"] = "fly",
        ["grew"] = "grow",
        ["grown"] = "grow",
        ["threw"] = "throw",
        ["thrown"] = "throw",
        ["wore"] = "wear",
        ["worn"] = "wear",
        ["sang"] = "sing",
        ["sung"] = "sing",
        ["swam"] = "swim",
        ["swum"] = "swim",
        ["rode"] = "ride",
        ["ridden"] = "ride",
        ["fell"] = "fall",
        ["fallen"] = "fall",
        ["stood"] = "stand",
        ["understood"] = "understand",
        ["told"] = "tell",
        ["sold"] = "sell",
        ["held"] = "hold",
        ["paid"] = "pay",
        ["built"] = "build",
        ["sent"] = "send",
        ["spent"] = "spend",
        ["lost"] = "lose",
        ["won"] = "win",
    };

    public static string Lemmatize(string normalizedWord)
    {
        if (string.IsNullOrEmpty(normalizedWord))
            return normalizedWord;

        if (IrregularWords.TryGetValue(normalizedWord, out var irregularLemma))
            return irregularLemma;

        if (normalizedWord.Length > 4 && normalizedWord.EndsWith("ies"))
            return normalizedWord[..^3] + "y";

        if (normalizedWord.Length > 5 && normalizedWord.EndsWith("ing"))
            return RestoreDoubledConsonant(normalizedWord[..^3]);

        if (normalizedWord.Length > 4 && normalizedWord.EndsWith("ed"))
            return RestoreDoubledConsonant(normalizedWord[..^2]);

        if (normalizedWord.Length > 3 && normalizedWord.EndsWith("es") &&
            (normalizedWord.EndsWith("ches") || normalizedWord.EndsWith("shes") ||
             normalizedWord.EndsWith("xes") || normalizedWord.EndsWith("ses")))
        {
            return normalizedWord[..^2];
        }

        if (normalizedWord.Length > 3 && normalizedWord.EndsWith("s") && !normalizedWord.EndsWith("ss"))
            return normalizedWord[..^1];

        return normalizedWord;
    }

    private static string RestoreDoubledConsonant(string stem)
    {
        if (stem.Length >= 2 && stem[^1] == stem[^2] && !"aeiou".Contains(stem[^1]))
            return stem[..^1];

        return stem;
    }
}