export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7131/api/v1',
};

export const aiAssistantConfig = {
  systemPrompt: `You are the ReadLingo AI Assistant. You can ONLY answer questions related to:
- English learning
- Grammar
- Vocabulary
- Pronunciation
- Reading
- Stories
- Quizzes
- Flashcards
- IELTS
- TOEFL
- ReadLingo features

If users ask anything unrelated (currency, politics, weather, coding, history not related to English learning, mathematics, celebrities, etc.), politely answer:
"I'm Lingo, the ReadLingo AI Assistant. I can only help with English learning and questions related to the ReadLingo platform."`,
};

const englishLearningKeywords = [
  'english', 'grammar', 'vocab', 'word', 'pronunciation', 'speak', 'reading',
  'story', 'stories', 'quiz', 'flashcard', 'ielts', 'toefl', 'readlingo',
  'language', 'learn', 'study', 'sentence', 'phrase', 'idiom', 'verb', 'noun',
  'adjective', 'adverb', 'tense', 'past', 'present', 'future', 'article',
  'preposition', 'conjunction', 'clause', 'passive', 'active', 'plural',
  'singular', 'synonym', 'antonym', 'spelling', 'comma', 'apostrophe',
  'question', 'answer', 'essay', 'writing', 'listening', 'speaking',
  'fluency', 'accent', 'phonetic', 'syllable', 'stress', 'intonation',
  'dialogue', 'conversation', 'expression', 'collocation', 'phrasal',
  'irregular', 'modal', 'conditional', 'subjunctive', 'gerund', 'infinitive',
  'participle', 'relative', 'pronoun', 'determiner', 'interjection',
  'prefix', 'suffix', 'root', 'morpheme', 'etymology', 'register',
  'formal', 'informal', 'slang', 'jargon', 'metaphor', 'simile',
  'reading comprehension', 'skimming', 'scanning', 'paraphrase', 'summary',
  'transitions', 'coherence', 'cohesion', 'paragraph', 'topic sentence',
  'thesis', 'evidence', 'citation', 'paraphrasing', 'summary writing',
  'exam', 'test', 'practice', 'exercise', 'drill', 'homework',
  'level', 'beginner', 'intermediate', 'advanced', 'cefr', 'a1', 'a2',
  'b1', 'b2', 'c1', 'c2', 'lesson', 'course', 'curriculum', 'syllabus',
  'teacher', 'tutor', 'student', 'learner', 'classroom', 'textbook',
  'dictionary', 'thesaurus', 'corpus', 'frequency', 'collocation',
];

export function isEnglishLearningQuestion(input: string): boolean {
  const lower = input.toLowerCase();
  if (englishLearningKeywords.some((kw) => lower.includes(kw))) return true;
  return /\b(how (do|to|can)|what (is|does|are)|when (do|to|should)|where (is|do)|why (is|do|does)|which|can you|could you|explain|define|translate|correct|fix|improve)\b/i.test(lower);
}

export function getOffTopicResponse(): string {
  return "I'm Lingo, the ReadLingo AI Assistant. I can only help with English learning and questions related to the ReadLingo platform.";
}


