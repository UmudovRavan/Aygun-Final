using EnglishLearningPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Application.DTOs.Vocabulary
{
    public class WordInteractionDto
    {
        public Guid Id { get; set; }
        public Guid VocabularyId { get; set; }
        public WordInteractionType InteractionType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
