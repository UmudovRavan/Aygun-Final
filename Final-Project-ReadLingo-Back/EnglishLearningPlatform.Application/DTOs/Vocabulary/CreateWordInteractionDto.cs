using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Vocabulary
{
    public class CreateWordInteractionDto
    {
        public Guid ChapterId { get; set; }

        public Guid? VocabularyId { get; set; }

        public string? Word { get; set; }

        public WordInteractionType InteractionType { get; set; }
    }
}
