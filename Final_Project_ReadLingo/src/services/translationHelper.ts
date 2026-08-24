// Comprehensive English-Azerbaijani translation helper with multi-tier fallbacks and local cache

const BUILTIN_AZ_DICTIONARY: Record<string, { translation: string; partOfSpeech?: string; pronunciation?: string; example?: string }> = {
  utilizing: { translation: 'istifadə etmək, yararlanmaq', partOfSpeech: 'verb', pronunciation: '/ˈjuːtəlaɪzɪŋ/' },
  utilize: { translation: 'istifadə etmək, faydalanmaq', partOfSpeech: 'verb', pronunciation: '/ˈjuːtəlaɪz/' },
  use: { translation: 'istifadə etmək', partOfSpeech: 'verb', pronunciation: '/juːz/' },
  used: { translation: 'istifadə olunmuş', partOfSpeech: 'adjective', pronunciation: '/juːzd/' },
  using: { translation: 'istifadə edərək', partOfSpeech: 'verb', pronunciation: '/ˈjuːzɪŋ/' },
  adventure: { translation: 'macəra', partOfSpeech: 'noun', pronunciation: '/ədˈventʃər/' },
  journey: { translation: 'səyahət, yolçuluq', partOfSpeech: 'noun', pronunciation: '/ˈdʒɜːrni/' },
  discover: { translation: 'kəşf etmək', partOfSpeech: 'verb', pronunciation: '/dɪˈskʌvər/' },
  discovery: { translation: 'kəşf', partOfSpeech: 'noun', pronunciation: '/dɪˈskʌvəri/' },
  mysterious: { translation: 'sirli, müəmmalı', partOfSpeech: 'adjective', pronunciation: '/mɪˈstɪəriəs/' },
  mystery: { translation: 'sirr, sirli hadisə', partOfSpeech: 'noun', pronunciation: '/ˈmɪstəri/' },
  whispering: { translation: 'pıçıltı, pıçıldayan', partOfSpeech: 'verb', pronunciation: '/ˈwɪspərɪŋ/' },
  whisper: { translation: 'pıçıldamaq', partOfSpeech: 'verb', pronunciation: '/ˈwɪspər/' },
  ancient: { translation: 'qədim', partOfSpeech: 'adjective', pronunciation: '/ˈeɪnʃənt/' },
  unlocked: { translation: 'kilidi açılmış', partOfSpeech: 'adjective', pronunciation: '/ʌnˈlɒkt/' },
  unlock: { translation: 'kilidini açmaq', partOfSpeech: 'verb', pronunciation: '/ʌnˈlɒk/' },
  lighthouse: { translation: 'mayak', partOfSpeech: 'noun', pronunciation: '/ˈlaɪthaʊs/' },
  keeper: { translation: 'gözətçi, qoruyucu', partOfSpeech: 'noun', pronunciation: '/ˈkiːpər/' },
  bottle: { translation: 'şüşə, butulka', partOfSpeech: 'noun', pronunciation: '/ˈbɒtl/' },
  message: { translation: 'məktub, mesaj', partOfSpeech: 'noun', pronunciation: '/ˈmesɪdʒ/' },
  explore: { translation: 'araşdırmaq, kəşf etmək', partOfSpeech: 'verb', pronunciation: '/ɪkˈsplɔːr/' },
  explorer: { translation: 'tədqiqatçı, səyyah', partOfSpeech: 'noun', pronunciation: '/ɪkˈsplɔːrər/' },
  challenge: { translation: 'çətinlik, sınaq', partOfSpeech: 'noun', pronunciation: '/ˈtʃælɪndʒ/' },
  knowledge: { translation: 'bilik', partOfSpeech: 'noun', pronunciation: '/ˈnɒlɪdʒ/' },
  creature: { translation: 'məxluq, canlı', partOfSpeech: 'noun', pronunciation: '/ˈkriːtʃər/' },
  glance: { translation: 'nəzər salmaq, baxış', partOfSpeech: 'verb', pronunciation: '/ɡlɑːns/' },
  gently: { translation: 'zərifcə, asta', partOfSpeech: 'adverb', pronunciation: '/ˈdʒentli/' },
  courage: { translation: 'cəsarət, igidlik', partOfSpeech: 'noun', pronunciation: '/ˈkʌrɪdʒ/' },
  wander: { translation: 'dolaşmaq, gəzişmək', partOfSpeech: 'verb', pronunciation: '/ˈwɒndər/' },
  breeze: { translation: 'meh, sərin meh', partOfSpeech: 'noun', pronunciation: '/briːz/' },
  shadow: { translation: 'kölgə', partOfSpeech: 'noun', pronunciation: '/ˈʃædəʊ/' },
  treasure: { translation: 'xəzinə', partOfSpeech: 'noun', pronunciation: '/ˈtreʒər/' },
  marvelous: { translation: 'heyranedici, möhtəşəm', partOfSpeech: 'adjective', pronunciation: '/ˈmɑːvələs/' },
  scenery: { translation: 'mənzərə', partOfSpeech: 'noun', pronunciation: '/ˈsiːnəri/' },
  struggle: { translation: 'mübarizə aparmaq, çətinlik', partOfSpeech: 'verb', pronunciation: '/ˈstrʌɡl/' },
  achieve: { translation: 'nail olmaq, qazanmaq', partOfSpeech: 'verb', pronunciation: '/əˈtʃiːv/' },
  achievement: { translation: 'nailiyyət, uğur', partOfSpeech: 'noun', pronunciation: '/əˈtʃiːvmənt/' },
  success: { translation: 'uğur, müvəffəqiyyət', partOfSpeech: 'noun', pronunciation: '/səkˈses/' },
  develop: { translation: 'inkişaf etdirmək', partOfSpeech: 'verb', pronunciation: '/dɪˈveləp/' },
  imagine: { translation: 'təsəvvür etmək', partOfSpeech: 'verb', pronunciation: '/ɪˈmædʒɪn/' },
  imagination: { translation: 'təxəyyül', partOfSpeech: 'noun', pronunciation: '/ɪˌmædʒɪˈneɪʃn/' },
  create: { translation: 'yaratmaq', partOfSpeech: 'verb', pronunciation: '/kriˈeɪt/' },
  observe: { translation: 'müşahidə etmək', partOfSpeech: 'verb', pronunciation: '/əbˈzɜːv/' },
  gather: { translation: 'toplamaq, toplaşmaq', partOfSpeech: 'verb', pronunciation: '/ˈɡæðər/' },
  remember: { translation: 'xatırlamaq, yadda saxlamaq', partOfSpeech: 'verb', pronunciation: '/rɪˈmembər/' },
  practice: { translation: 'məşq etmək, təcrübə', partOfSpeech: 'verb', pronunciation: '/ˈpræktɪs/' },
  fluent: { translation: 'səlis', partOfSpeech: 'adjective', pronunciation: '/ˈfluːənt/' },
  skill: { translation: 'bacarıq, vərdiş', partOfSpeech: 'noun', pronunciation: '/skɪl/' },
  opportunity: { translation: 'imkan, fürsət', partOfSpeech: 'noun', pronunciation: '/ˌɒpəˈtjuːnəti/' },
  experience: { translation: 'təcrübə, hiss etmək', partOfSpeech: 'noun', pronunciation: '/ɪkˈspɪəriəns/' },
  valuable: { translation: 'dəyərli, qiymətli', partOfSpeech: 'adjective', pronunciation: '/ˈvæljuəbl/' },
  fascinating: { translation: 'böyüləyici, valehedici', partOfSpeech: 'adjective', pronunciation: '/ˈfæsɪneɪtɪŋ/' },
  essential: { translation: 'vacib, əsas, zəruri', partOfSpeech: 'adjective', pronunciation: '/ɪˈsenʃl/' },
  remarkable: { translation: 'görkəmli, diqqətəlayiq', partOfSpeech: 'adjective', pronunciation: '/rɪˈmɑːkəbl/' },
  strength: { translation: 'güc, qüvvət', partOfSpeech: 'noun', pronunciation: '/streŋθ/' },
  wisdom: { translation: 'müdriklik, ağıl', partOfSpeech: 'noun', pronunciation: '/ˈwɪzdəm/' },
  curious: { translation: 'maraqlanan, maraqlı', partOfSpeech: 'adjective', pronunciation: '/ˈkjʊəriəs/' },
  determine: { translation: 'müəyyən etmək, qərar vermək', partOfSpeech: 'verb', pronunciation: '/dɪˈtɜːmɪn/' },
  inspire: { translation: 'ilhamlandırmaq', partOfSpeech: 'verb', pronunciation: '/ɪnˈspaɪər/' },
  horizon: { translation: 'üfüq', partOfSpeech: 'noun', pronunciation: '/həˈraɪzn/' },
  destination: { translation: 'təyinat yeri, hədəf', partOfSpeech: 'noun', pronunciation: '/ˌdestɪˈneɪʃn/' },
  voyage: { translation: 'dəniz səyahəti, səfər', partOfSpeech: 'noun', pronunciation: '/ˈvɔɪɪdʒ/' },
  shelter: { translation: 'sığınacaq, qorumaq', partOfSpeech: 'noun', pronunciation: '/ˈʃeltər/' },
  pathway: { translation: 'cığır, yol', partOfSpeech: 'noun', pronunciation: '/ˈpɑːθweɪ/' },
  illuminate: { translation: 'işıqlandırmaq, aydınlatmaq', partOfSpeech: 'verb', pronunciation: '/ɪˈluːmɪneɪt/' },
  breathtaking: { translation: 'nəfəskəsici, füsunkar', partOfSpeech: 'adjective', pronunciation: '/ˈbreθteɪkɪŋ/' },
  uncover: { translation: 'üzə çıxarmaq, açmaq', partOfSpeech: 'verb', pronunciation: '/ʌnˈkʌvər/' },
  harbor: { translation: 'liman', partOfSpeech: 'noun', pronunciation: '/ˈhɑːbər/' },
  solitude: { translation: 'tənhalıq, xəlvət', partOfSpeech: 'noun', pronunciation: '/ˈsɒlətjuːd/' },
  beacon: { translation: 'mayak işığı, yolgöstərən', partOfSpeech: 'noun', pronunciation: '/ˈbiːkən/' },
  companion: { translation: 'yoldaş, həmsöhbət', partOfSpeech: 'noun', pronunciation: '/kəmˈpænjən/' },
  wilderness: { translation: 'vəhşi təbiət, kimsəsizlik', partOfSpeech: 'noun', pronunciation: '/ˈwɪldənəs/' },
  glimpse: { translation: 'ani baxış, ötəri görmək', partOfSpeech: 'noun', pronunciation: '/ɡlɪmps/' },
  legend: { translation: 'əfsanə, rəvayət', partOfSpeech: 'noun', pronunciation: '/ˈledʒənd/' },
  vibrant: { translation: 'canlı, parlaq', partOfSpeech: 'adjective', pronunciation: '/ˈvaɪbrənt/' },
  serene: { translation: 'sakit, dinc', partOfSpeech: 'adjective', pronunciation: '/səˈriːn/' },
  encounter: { translation: 'qarşılaşmaq, rast gəlmək', partOfSpeech: 'verb', pronunciation: '/ɪnˈkaʊntər/' },
  embrace: { translation: 'qucaqlamaq, qəbul etmək', partOfSpeech: 'verb', pronunciation: '/ɪmˈbreɪs/' },
  reflection: { translation: 'əks, düşüncə', partOfSpeech: 'noun', pronunciation: '/rɪˈflekʃn/' },
  endless: { translation: 'sonsuz, bitməz', partOfSpeech: 'adjective', pronunciation: '/ˈendləs/' },
  infinite: { translation: 'hüdudsuz, sonsuz', partOfSpeech: 'adjective', pronunciation: '/ˈɪnfɪnət/' },
  mystical: { translation: 'mistik, ecazkar', partOfSpeech: 'adjective', pronunciation: '/ˈmɪstɪkl/' },
  daring: { translation: 'cəsur, cəsarətli', partOfSpeech: 'adjective', pronunciation: '/ˈdeərɪŋ/' },
  splendid: { translation: 'möhtəşəm, əla', partOfSpeech: 'adjective', pronunciation: '/ˈsplendɪd/' },
  resilience: { translation: 'dözümlülük, elastiklik', partOfSpeech: 'noun', pronunciation: '/rɪˈzɪliəns/' },
  triumph: { translation: 'zəfər, böyük qələbə', partOfSpeech: 'noun', pronunciation: '/ˈtraɪʌmf/' },
  pursuit: { translation: 'ardınca getmə, axtarış', partOfSpeech: 'noun', pronunciation: '/pəˈsjuːt/' },
  captivate: { translation: 'valeh etmək, cəlb etmək', partOfSpeech: 'verb', pronunciation: '/ˈkæptɪveɪt/' },
  astonish: { translation: 'heyrətləndirmək, təəccübləndirmək', partOfSpeech: 'verb', pronunciation: '/əˈstɒnɪʃ/' },
  comprehension: { translation: 'anlama, qavrama', partOfSpeech: 'noun', pronunciation: '/ˌkɒmprɪˈhenʃn/' },
  vocabulary: { translation: 'lüğət, söz ehtiyatı', partOfSpeech: 'noun', pronunciation: '/vəˈkæbjələri/' },
  grammar: { translation: 'qrammatika', partOfSpeech: 'noun', pronunciation: '/ˈɡræmər/' },
  sentence: { translation: 'cümlə', partOfSpeech: 'noun', pronunciation: '/ˈsentəns/' },
  character: { translation: 'obraz, xarakter', partOfSpeech: 'noun', pronunciation: '/ˈkærəktər/' },
  chapter: { translation: 'fəsil, bölmə', partOfSpeech: 'noun', pronunciation: '/ˈtʃæptər/' },
  morning: { translation: 'səhər', partOfSpeech: 'noun', pronunciation: '/ˈmɔːnɪŋ/' },
  evening: { translation: 'axşam', partOfSpeech: 'noun', pronunciation: '/ˈiːvnɪŋ/' },
  forest: { translation: 'meşə', partOfSpeech: 'noun', pronunciation: '/ˈfɒrɪst/' },
  mountain: { translation: 'dağ', partOfSpeech: 'noun', pronunciation: '/ˈmaʊntən/' },
  river: { translation: 'çay', partOfSpeech: 'noun', pronunciation: '/ˈrɪvər/' },
  ocean: { translation: 'okean', partOfSpeech: 'noun', pronunciation: '/ˈəʊʃn/' },
  castle: { translation: 'qala, qəsr', partOfSpeech: 'noun', pronunciation: '/ˈkɑːsl/' },
  village: { translation: 'kənd', partOfSpeech: 'noun', pronunciation: '/ˈvɪlɪdʒ/' },
  secret: { translation: 'sirr, gizli', partOfSpeech: 'noun', pronunciation: '/ˈsiːkrət/' },
  travel: { translation: 'səyahət etmək', partOfSpeech: 'verb', pronunciation: '/ˈtrævl/' },
  freedom: { translation: 'azadlıq', partOfSpeech: 'noun', pronunciation: '/ˈfriːdəm/' },
  peaceful: { translation: 'dinc, sakit', partOfSpeech: 'adjective', pronunciation: '/ˈpiːsfl/' },
  powerful: { translation: 'güclü, qüdrətli', partOfSpeech: 'adjective', pronunciation: '/ˈpaʊəfl/' },
  protect: { translation: 'qorumaq, müdafiə etmək', partOfSpeech: 'verb', pronunciation: '/prəˈtekt/' },
  prepare: { translation: 'hazırlaşmaq, hazırlamaq', partOfSpeech: 'verb', pronunciation: '/prɪˈpeər/' },
  learn: { translation: 'öyrənmək', partOfSpeech: 'verb', pronunciation: '/lɜːn/' },
  understand: { translation: 'başa düşmək, anlamaq', partOfSpeech: 'verb', pronunciation: '/ˌʌndəˈstænd/' },
  listen: { translation: 'dinləmək, qulaq asmaq', partOfSpeech: 'verb', pronunciation: '/ˈlɪsn/' },
  speak: { translation: 'danışmaq', partOfSpeech: 'verb', pronunciation: '/spiːk/' },
  read: { translation: 'oxumaq', partOfSpeech: 'verb', pronunciation: '/riːd/' },
  write: { translation: 'yazmaq', partOfSpeech: 'verb', pronunciation: '/raɪt/' }
};

export async function translateWordToAz(rawWord: string): Promise<string> {
  const word = rawWord.trim().toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
  if (!word) return '';

  // 1. Check in-memory built-in dictionary
  if (BUILTIN_AZ_DICTIONARY[word]?.translation) {
    return BUILTIN_AZ_DICTIONARY[word].translation;
  }

  // 2. Check localStorage cache
  const cached = localStorage.getItem(`readlingo_trans_${word}`);
  if (cached && cached.toLowerCase() !== word) {
    return cached;
  }

  // 3. Try Google Translate single API (fast & accurate free endpoint)
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=az&dt=t&q=${encodeURIComponent(word)}`;
    const res = await fetch(gUrl);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.[0]?.[0]?.[0];
      if (translated && typeof translated === 'string' && translated.trim().toLowerCase() !== word) {
        const cleanTrans = translated.trim().toLowerCase();
        localStorage.setItem(`readlingo_trans_${word}`, cleanTrans);
        return cleanTrans;
      }
    }
  } catch {
    // ignore
  }

  // 4. Try MyMemory API fallback
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|az`;
    const res = await fetch(mmUrl);
    if (res.ok) {
      const data = await res.json();
      const azText = data?.responseData?.translatedText;
      if (azText && typeof azText === 'string' && azText.trim().toLowerCase() !== word) {
        const cleanTrans = azText.trim().toLowerCase();
        localStorage.setItem(`readlingo_trans_${word}`, cleanTrans);
        return cleanTrans;
      }
    }
  } catch {
    // ignore
  }

  return BUILTIN_AZ_DICTIONARY[word]?.translation || '';
}

export function getDictionaryMetadata(rawWord: string) {
  const word = rawWord.trim().toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
  return BUILTIN_AZ_DICTIONARY[word] || null;
}
