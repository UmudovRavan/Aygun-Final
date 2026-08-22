using EnglishLearningPlatform.Domain.Common;
using EnglishLearningPlatform.Domain.Enums;

namespace EnglishLearningPlatform.Domain.Entities;

public class Flashcard : AuditableEntity
{
    public FlashcardStatus Status { get; set; } = FlashcardStatus.New;
    public DateTime? NextReviewDate { get; set; }
    public int ReviewCount { get; set; }
    public int CorrectCount { get; set; }
    public int IncorrectCount { get; set; }

    public Guid AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

  
    public Guid? VocabularyId { get; set; }
    public Vocabulary? Vocabulary { get; set; }

    
    public Guid? WordTranslationId { get; set; }
    public WordTranslation? WordTranslation { get; set; }
}