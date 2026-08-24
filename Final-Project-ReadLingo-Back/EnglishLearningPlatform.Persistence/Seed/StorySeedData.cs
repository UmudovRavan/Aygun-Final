using EnglishLearningPlatform.Domain.Entities;
using EnglishLearningPlatform.Domain.Enums;
using EnglishLearningPlatform.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EnglishLearningPlatform.Persistence.Seed
{
    public static class StorySeedData
    {
        public record StorySeedItem(
            string Title,
            string Description,
            string CoverImageUrl,
            int EstimatedMinutes,
            string CategoryName,
            string LevelName,
            List<ChapterSeedItem> Chapters
        );

        public record ChapterSeedItem(
            string Title,
            string Content
        );

        public static async Task SeedStoriesAndChaptersAsync(ApplicationDbContext context, ILogger logger)
        {
            var categories = await context.StoryCategories.ToListAsync();
            var levels = await context.StoryLevels.ToListAsync();

            if (categories.Count == 0 || levels.Count == 0)
            {
                logger.LogWarning("Cannot seed stories: StoryCategories or StoryLevels are empty.");
                return;
            }

            var categoryMap = categories.ToDictionary(c => c.Name.ToLowerInvariant(), c => c.Id);
            var levelMap = levels.ToDictionary(l => l.Name.ToLowerInvariant(), l => l.Id);

            var storySeeds = GetStorySeeds();

            int addedCount = 0;
            foreach (var seed in storySeeds)
            {
                var existingStory = await context.Stories
                    .Include(s => s.Chapters)
                    .FirstOrDefaultAsync(s => s.Title.ToLower() == seed.Title.ToLower());

                if (existingStory == null)
                {
                    if (!categoryMap.TryGetValue(seed.CategoryName.ToLowerInvariant(), out var categoryId))
                    {
                        var defaultCat = categories.FirstOrDefault();
                        if (defaultCat == null) continue;
                        categoryId = defaultCat.Id;
                    }

                    if (!levelMap.TryGetValue(seed.LevelName.ToLowerInvariant(), out var levelId))
                    {
                        var defaultLevel = levels.FirstOrDefault();
                        if (defaultLevel == null) continue;
                        levelId = defaultLevel.Id;
                    }

                    var story = new Story
                    {
                        Id = Guid.NewGuid(),
                        Title = seed.Title,
                        Description = seed.Description,
                        CoverImageUrl = seed.CoverImageUrl,
                        Language = "English",
                        IsPublished = true,
                        EstimatedMinutes = seed.EstimatedMinutes,
                        StoryCategoryId = categoryId,
                        StoryLevelId = levelId,
                        CreatedAt = DateTime.UtcNow,
                    };

                    int chapterOrder = 1;
                    foreach (var ch in seed.Chapters)
                    {
                        story.Chapters.Add(new Chapter
                        {
                            Id = Guid.NewGuid(),
                            StoryId = story.Id,
                            Title = ch.Title,
                            Content = ch.Content,
                            Order = chapterOrder++,
                            CreatedAt = DateTime.UtcNow,
                        });
                    }

                    context.Stories.Add(story);
                    addedCount++;
                }
            }

            if (addedCount > 0)
            {
                await context.SaveChangesAsync();
                logger.LogInformation($"Successfully seeded {addedCount} new stories with chapters across all levels and categories.");
            }
        }

        private static List<StorySeedItem> GetStorySeeds()
        {
            return new List<StorySeedItem>
            {
                // ==========================================
                // LEVEL A1 (Beginner)
                // ==========================================
                new StorySeedItem(
                    Title: "My First Morning in London",
                    Description: "A simple and cheerful story about waking up and exploring a new city for the first time.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 5,
                    CategoryName: "Daily Life",
                    LevelName: "Beginner",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Waking Up Early",
                            "The sun comes through the window. It is seven o'clock in the morning. Tom opens his eyes and smiles. Today is his first day in London.\n\nHe drinks a cup of warm tea and eats toast with strawberry jam. The city is awake. Buses pass by on the street below. He puts on his red jacket and comfortable shoes. It is time to see the city!"
                        ),
                        new ChapterSeedItem(
                            "In the Big Park",
                            "Tom walks to Hyde Park. The grass is bright green and fresh. Many people walk their friendly dogs. A little girl throws bread to ducks in the pond.\n\nTom sits on a wooden bench and listens to the birds. He feels happy and peaceful in this new place. London is a beautiful city with so many wonderful sights."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Friendly Yellow Taxi",
                    Description: "Follow Anna as she takes a taxi through the city to visit her grandmother.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1490642914619-7955a3fc483c?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 4,
                    CategoryName: "Travel",
                    LevelName: "Beginner",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Calling a Taxi",
                            "Anna stands on the sidewalk. She holds a small blue bag. She raises her hand, and a bright yellow taxi stops in front of her.\n\n\"Good morning! Where are you going today?\" the kind driver asks. Anna smiles and says, \"To the Central Train Station, please.\" The driver nods, and the taxi starts moving."
                        ),
                        new ChapterSeedItem(
                            "Arriving at the Station",
                            "The taxi drives past shops, tall buildings, and green trees. The streets are busy with cars and bicycles. Soon, they arrive at the big station.\n\nAnna pays the driver and says, \"Thank you very much! Have a great day!\" She takes her bag and walks happily to catch her train."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Lost Kitten in the Garden",
                    Description: "A sweet adventure about helping a tiny lost kitten find its mother.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 5,
                    CategoryName: "Adventure",
                    LevelName: "Beginner",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "A Soft Sound",
                            "Emma is watering flowers in her garden. Suddenly, she hears a tiny sound: \"Meow, meow!\"\n\nShe looks under the big rose bush. There is a small grey kitten with bright green eyes. The kitten is shaking and looks hungry. Emma speaks softly and offers a bowl of fresh milk."
                        ),
                        new ChapterSeedItem(
                            "Finding Mama Cat",
                            "The kitten drinks the milk quickly and rubs against Emma's hand. Then, a larger white cat appears near the wooden fence.\n\nThe kitten runs happily to its mother. The mother cat purrs and licks her baby. Emma is glad she could help the little family."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "Starting at the Bakery",
                    Description: "Sam begins his new job making fresh bread and delicious pastries.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 5,
                    CategoryName: "Business",
                    LevelName: "Beginner",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The First Morning",
                            "Sam arrives at the bakery at five in the morning. The kitchen is warm, and the air smells like sweet vanilla and flour.\n\nHis manager, Mr. Davis, welcomes him with a warm smile. \"Welcome to our team, Sam! Today we make fresh baguettes and apple pies.\""
                        ),
                        new ChapterSeedItem(
                            "Welcoming Customers",
                            "At seven o'clock, the shop opens its doors. Customers come in smiling, eager for warm bread and hot coffee.\n\nSam serves each customer with enthusiasm. By noon, all the bread is sold out. Sam is proud of his hard work on his very first day."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Magic Forest Owl",
                    Description: "A magical bedtime tale of a glowing owl that helps lost travelers.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 5,
                    CategoryName: "Fiction",
                    LevelName: "Beginner",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Silver Light",
                            "In an enchanted forest, night falls quietly. A little boy named Leo is walking on a narrow path. The stars twinkle high in the dark sky.\n\nSuddenly, a soft silver light shines from a tall oak tree. A wise old owl with glowing feathers looks down at him kindly."
                        ),
                        new ChapterSeedItem(
                            "The Safe Path Home",
                            "\"Do not be afraid, little traveler,\" the owl whispers gently. The owl spreads its wings and flies slowly ahead, lighting the dark path.\n\nLeo follows the gentle glow until he reaches his cozy wooden cabin. He waves goodbye to his magical friend."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Mysterious Attic Window",
                    Description: "A gentle spooky tale of curious sounds and old treasures in a grandfather's attic.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 5,
                    CategoryName: "Horror",
                    LevelName: "Beginner",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Strange Noise",
                            "On a rainy evening, Liam hears a soft tap-tap sound from the attic. The wind blows outside, and the trees dance in the dark.\n\nLiam takes his small yellow flashlight. Step by step, he climbs the wooden stairs to discover the secret of the attic."
                        ),
                        new ChapterSeedItem(
                            "An Old Clock",
                            "Liam opens the attic door slowly. The flashlight beam shines across dusty boxes and old books.\n\nNear the window, an antique wooden clock is ticking rhythmically. Next to it, a playful squirrel taps on the glass. Liam laughs with relief."
                        )
                    }
                ),

                // ==========================================
                // LEVEL A2 (Elementary)
                // ==========================================
                new StorySeedItem(
                    Title: "The Lighthouse Keeper",
                    Description: "A lonely lighthouse keeper discovers a mysterious message in a bottle that changes his quiet life.",
                    CoverImageUrl: "https://images.pexels.com/photos/9988402/pexels-photo-9988402.jpeg?auto=compress&cs=tinysrgb&w=600",
                    EstimatedMinutes: 8,
                    CategoryName: "Adventure",
                    LevelName: "Elementary",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Message in the Bottle",
                            "Old John had lived in the tall white lighthouse on the rocky cliff for more than twenty years. Every evening, he climbed the spiral iron staircase to turn on the giant rotating lamp.\n\nOne breezy autumn morning, while walking along the pebbly beach, he noticed a green glass bottle half-buried in the wet sand. Inside was a piece of aged parchment tied with blue ribbon. When he carefully pulled out the paper, he read three handwritten words: 'Look beyond horizon'."
                        ),
                        new ChapterSeedItem(
                            "The Distant Sail",
                            "John kept the parchment on his wooden desk. That night, a thick sea mist rolled over the coast. As the powerful beam of the lighthouse pierced through the fog, John saw the silhouette of a wooden sailboat struggling against the strong current.\n\nHe signaled the harbor rescue team immediately. Thanks to his swift action, the boat was guided safely into port. The grateful captain arrived at the lighthouse the next day, carrying a chest of foreign spices and stories from faraway islands."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "A Day in Tokyo",
                    Description: "Experience the bustling streets, modern gadgets, and peaceful gardens of Japan's vibrant capital.",
                    CoverImageUrl: "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600",
                    EstimatedMinutes: 6,
                    CategoryName: "Travel",
                    LevelName: "Elementary",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Morning in Shibuya",
                            "Kenji stepped off the subway train into the electric energy of Shibuya Crossing. Thousands of pedestrians moved in harmony under giant glowing billboards. The aroma of freshly grilled ramen filled the crisp morning air.\n\nHe ordered a bowl of steaming miso noodles from a cozy corner restaurant. The friendly chef bowed and handed him green tea, welcoming him to the heart of the metropolis."
                        ),
                        new ChapterSeedItem(
                            "The Peaceful Shrine Garden",
                            "After exploring bustling shopping districts, Kenji walked into the tranquil forested paths of Meiji Shrine. The sounds of traffic faded into the gentle rustle of bamboo leaves and distant wind chimes.\n\nHe wrote a wish for good health on a wooden plaque and hung it near the sacred tree. Tokyo was a fascinating world where futuristic technology and ancient serenity existed side by side."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Secret of the Old Clock Tower",
                    Description: "Two curious friends explore their town's historical clock tower and find a hidden mechanism.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 7,
                    CategoryName: "History",
                    LevelName: "Elementary",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Brass Gears",
                            "The clock tower in the center of Greenfield had stood for over a century, but its bells had been silent for decades. Maya and her brother Oliver received permission from the town council to clean the historic building.\n\nInside, massive brass gears covered in golden dust connected intricate levers. Maya noticed a small silver lever hidden behind the main pendulum."
                        ),
                        new ChapterSeedItem(
                            "The Bells Ring Again",
                            "With careful hands, Oliver cleaned the rusty cog while Maya oiled the delicate springs. Together, they gently pulled the silver lever.\n\nSuddenly, the giant gears began to turn with a satisfying click. Deep, melodic chimes echoed across the entire valley, bringing smiles to the townsfolk who had missed the beloved sound for so many years."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Urban Honeybee Project",
                    Description: "How a community rooftop garden became home to thousands of hardworking bees.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 6,
                    CategoryName: "Science",
                    LevelName: "Elementary",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Hives in the Sky",
                            "On top of an eight-story apartment building in Chicago, Sarah built three brightly painted wooden beehives. Surrounding the hives were pots of lavender, sunflowers, and sweet basil.\n\nEach day, thousands of bees flew across city parks and balconies, collecting nectar and pollinating community gardens. Sarah observed how organized and cooperative the insect colony was."
                        ),
                        new ChapterSeedItem(
                            "The Golden Harvest",
                            "At the end of summer, Sarah and her neighbors gathered on the roof wearing protective suits. They carefully harvested golden honeycombs dripping with sweet, fragrant honey.\n\nThey bottled over fifty jars of pure city honey to share with local families, proving that nature can flourish even amidst towering concrete skyscrapers."
                        )
                    }
                ),

                // ==========================================
                // LEVEL B1 (Intermediate)
                // ==========================================
                new StorySeedItem(
                    Title: "The Secret of the Amazon Rainforest",
                    Description: "An environmental researcher embarks on a river expedition and discovers an unmapped archaeological wonder.",
                    CoverImageUrl: "https://images.pexels.com/photos/1580288/pexels-photo-1580288.jpeg?auto=compress&cs=tinysrgb&w=600",
                    EstimatedMinutes: 10,
                    CategoryName: "Adventure",
                    LevelName: "Intermediate",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Navigating the Canopy",
                            "Dr. Elena Alvarez steered the small motorized canoe deeper into the winding tributaries of the Rio Negro. Dense emerald vegetation formed an overhead canopy that filtered sunlight into emerald beams. Exotic macaws called from high branches while river dolphins surfaced near the boat.\n\nHer mission was to document rare medicinal orchids, but local indigenous guides spoke of stone carved ruins concealed beneath centuries of tangled roots and moss."
                        ),
                        new ChapterSeedItem(
                            "The Stone Sanctuary",
                            "Trekking on foot through the dense jungle, Elena's compass began to behave erratically near a wall of volcanic rock. Cutting through thick vines with a machete, she revealed intricate bas-relief carvings depicting celestial constellations and ancient river routes.\n\nShe realized this was an astronomical observatory built centuries before European contact. Rather than disturbing the sacred site, Elena documented the coordinates to establish a protected conservation zone for future generations."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "Pitching the Sustainable Startup",
                    Description: "A young entrepreneur prepares a game-changing presentation to secure clean-energy funding.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 8,
                    CategoryName: "Business",
                    LevelName: "Intermediate",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Final Rehearsal",
                            "Lucas adjusted his projector in the boardroom of Apex Ventures. For twelve months, his engineering team had refined an affordable water-purification membrane powered entirely by solar micro-panels.\n\nThe market research was solid, but venture capitalists demanded proven scalability and clear profit margins. Lucas reviewed his financial slides, determined to demonstrate that environmental stewardship and economic viability could walk hand in hand."
                        ),
                        new ChapterSeedItem(
                            "Winning the Investment",
                            "When the panel of seasoned investors took their seats, Lucas delivered his pitch with poise and confidence. He demonstrated the prototype live, turning turbid canal water into crystal-clear drinking water in under thirty seconds.\n\nImpressed by both the technology and the social impact, the lead investor offered two million dollars in seed capital, greenlighting full-scale manufacturing across developing regions."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Silk Road Caravan",
                    Description: "Travel with merchants in the 13th century as they transport precious silk and spices across deserts.",
                    CoverImageUrl: "https://images.pexels.com/photos/2168974/pexels-photo-2168974.jpeg?auto=compress&cs=tinysrgb&w=600",
                    EstimatedMinutes: 9,
                    CategoryName: "History",
                    LevelName: "Intermediate",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Leaving Samarkand",
                            "The morning bells of the camel train resonated through the turquoise gates of Samarkand. Tariq, an apprentice merchant, checked the leather straps binding crates of Persian ceramics, Chinese silk rolls, and fragrant frankincense.\n\nAhead lay thousands of miles of arid desert and treacherous mountain passes, where merchants shared knowledge, languages, and philosophies around nightly campfires."
                        ),
                        new ChapterSeedItem(
                            "The Oasis of Dunhuang",
                            "After surviving blistering sandstorms and steep gravel trails, the caravan reached the lush oasis of Dunhuang. In the nearby painted caves, monks chanted ancient sutras while merchants traded goods from Rome to Chang'an.\n\nTariq realized that the Silk Road was far more than a trade highway; it was the living bridge that connected human civilization and fostered global understanding."
                        )
                    }
                ),

                // ==========================================
                // LEVEL B2 (Upper Intermediate)
                // ==========================================
                new StorySeedItem(
                    Title: "Survival on Storm Island",
                    Description: "A marine biologist gets shipwrecked on an uncharted island and relies on ecological knowledge to survive.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 11,
                    CategoryName: "Adventure",
                    LevelName: "Upper Intermediate",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Wreckage at Twilight",
                            "The violent typhoon had torn the research vessel's sails to ribbons before hurling the hull onto jagged coral reefs. When Julian regained consciousness on the foam-streaked shoreline, the sea had calmed into an ominous twilight glow.\n\nAssessing his immediate priorities, Julian realized that finding potable freshwater and constructing an elevated shelter took precedence over searching for salvageable radio equipment in the submerged wreckage."
                        ),
                        new ChapterSeedItem(
                            "Harnessing the Wilderness",
                            "Utilizing his understanding of tropical vegetation, Julian harvested traveler's palm reservoirs for hydration and constructed a sturdy bamboo shelter bound with dried liana vines. He engineered a solar still using clear plastic sheets to desalinate seawater.\n\nTwo weeks later, when a coast guard reconnaissance helicopter scanned the archipelago, Julian signaled with a controlled smoke fire, leaving the island with newfound humility regarding nature's unyielding power."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Alchemist of Prague",
                    Description: "In 16th-century Bohemia, an ambitious scholar seeks the legendary formula for eternal wisdom.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 10,
                    CategoryName: "Fiction",
                    LevelName: "Upper Intermediate",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Golden Lane Secrets",
                            "Snow fell softly upon the cobblestones of Golden Lane, where Emperor Rudolf II had gathered Europe's foremost astronomers and alchemists. In a subterranean laboratory lit by simmering alembics, Master Vaclav examined a cryptic cipher inscribed upon vellum.\n\nWhile his contemporaries obsessed over transmuting base metals into gold, Vaclav suspected the true Magnum Opus was a metaphysical pursuit of universal enlightenment and scientific truth."
                        ),
                        new ChapterSeedItem(
                            "The True Transmutation",
                            "Deciphering the celestial geometry within the text, Vaclav combined purified elements under precise planetary alignments. Instead of gold, the chemical reaction produced a brilliant luminescent crystal that illuminated the room without heat or flame.\n\nHe recognized that genuine alchemy was the dawn of empirical chemistry, forever dismantling superstition in favor of systematic inquiry."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "Artificial Intelligence and the Human Mind",
                    Description: "An exploration of neural networks, machine intuition, and the philosophical boundaries of consciousness.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 12,
                    CategoryName: "Science",
                    LevelName: "Upper Intermediate",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Spark of Synthetic Thought",
                            "In the quantum computing laboratory at Oxford, Dr. Karen Vance watched the computational diagnostic metrics fluctuate. The autonomous neural architecture had just resolved a mathematical theorem that had stumped mathematicians for three centuries.\n\nHowever, what captivated the research team was not the solution itself, but the unexpected elegance and creative methodology the synthetic intelligence had employed to reach it."
                        ),
                        new ChapterSeedItem(
                            "The Philosophical Threshold",
                            "During a live symposium on cognitive ethics, Karen addressed delegates regarding the societal ramifications of superintelligent algorithms. She argued that genuine intelligence cannot be measured solely by processing velocity, but by emotional resonance and ethical responsibility.\n\nThe audience realized that understanding artificial minds was ultimately a mirror reflecting humanity's deepest questions about consciousness itself."
                        )
                    }
                ),

                // ==========================================
                // LEVEL C1 (Advanced)
                // ==========================================
                new StorySeedItem(
                    Title: "Conquering the Arctic Abyss",
                    Description: "A deep-ocean exploration beneath polar ice caps reveals uncharted hydrothermal vents and extreme lifeforms.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 14,
                    CategoryName: "Adventure",
                    LevelName: "Advanced",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Descent into the Hadal Trench",
                            "The titanium submersible descended steadily through the aphotic zone of the Fram Strait, where crushing atmospheric pressure and near-freezing temperatures rendered human survival entirely contingent upon meticulous engineering.\n\nDr. Aris Thorne calibrated the high-resolution sonar arrays as the bathymetric topography shifted precipitously beneath them, revealing a network of abyssal canyons that had remained uncharted since the dawn of oceanography."
                        ),
                        new ChapterSeedItem(
                            "Chemosynthetic Sanctuary",
                            "Illuminated by halogen searchlights, a field of black smoker hydrothermal chimneys erupted into view, billowing mineral-laden plumes into the subterranean dark. Thriving around these extreme thermal vents were colonies of previously unidentified extremophiles.\n\nThese organisms synthesized metabolic energy entirely independent of solar irradiance, offering profound insights into the potential biochemical mechanisms that might sustain extraterrestrial life across sub-surface oceans on Europa or Enceladus."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "Renaissance Humanism and the Written Word",
                    Description: "How the invention of movable type revolutionized the dissemination of secular philosophy across Europe.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 13,
                    CategoryName: "Culture",
                    LevelName: "Advanced",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Gutenberg Revolution",
                            "The mid-fifteenth century witnessed an unprecedented paradigm shift as Johannes Gutenberg's movable typography dismantled the monastic monopoly on literary preservation. Scribes who had spent lifetimes illuminating singular manuscripts were eclipsed by mechanical presses capable of replicating treatises in hundreds of identical copies.\n\nThis democratization of erudition allowed humanist scholars like Erasmus of Rotterdam to propagate classical rhetoric and critical inquiry with breathtaking velocity across continental borders."
                        ),
                        new ChapterSeedItem(
                            "The Emergence of the Republic of Letters",
                            "As printing workshops proliferated from Venice to Basel, intellectual discourse transcended geographic and ecclesiastical boundaries. Scholarly correspondence evolved into the 'Republic of Letters'—an international collective of thinkers engaged in empirical critique.\n\nThis intellectual awakening permanently reshaped jurisprudence, theology, and the natural sciences, laying the foundational framework for the Enlightenment and modern democratic thought."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "The Fall of Constantinople",
                    Description: "A dramatic historical chronicle of the siege of 1453 and the dawn of the early modern era.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 15,
                    CategoryName: "History",
                    LevelName: "Advanced",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Triple Walls of Theodosius",
                            "In April 1453, Sultan Mehmed II deployed an immense Ottoman host outside the colossal Theodosian fortifications that had shielded Byzantium for over a millennium. Modern super-cannons engineered by the Hungarian founder Urban hurled monolithic granite projectiles against crumbling Byzantine masonry.\n\nEmperor Constantine XI Palaiologos marshaled a resolute garrison of Greek and Genoese defenders, fiercely repairing breaches by night beneath continuous bombardment."
                        ),
                        new ChapterSeedItem(
                            "The Breach and the Aftermath",
                            "On the morning of May 29th, the final assault overwhelmed the Kerkoporta postern gate after weeks of unrelenting attritional combat. The fall of Constantinople sent profound geopolitical shockwaves throughout Christendom.\n\nGreek scholars fleeing west carried precious Hellenic codices that catalyzed the Italian Renaissance, while European navigators, seeking alternate trade passages to the Orient, embarked upon the transformative Age of Discovery."
                        )
                    }
                ),

                // ==========================================
                // LEVEL C2 (Proficient)
                // ==========================================
                new StorySeedItem(
                    Title: "Linguistic Relativity and the Evolution of Thought",
                    Description: "A profound philosophical analysis of the Sapir-Whorf hypothesis and how syntax frames perceptual cognition.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 16,
                    CategoryName: "Culture",
                    LevelName: "Proficient",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Epistemological Matrix of Grammar",
                            "Linguistic relativity posits that the morphological and syntactic structures of a natural language exert an indelible heuristic influence on its speakers' worldview and cognitive architecture. Rather than serving as an inert communicative vehicle, syntax acts as an ontological framework that demarcates the boundaries of experiential categorization.\n\nCross-linguistic ethnographies reveal that indigenous communities possessing absolute spatial reckoning systems conceptualize spatial orientation and temporal flow through fundamentally distinct neural schemas compared to speakers of relative egocentric languages."
                        ),
                        new ChapterSeedItem(
                            "Neuro-Cognitive Convergence and Semantic Boundaries",
                            "Contemporary neuroimaging methodologies have substantiated nuanced variants of the Whorfian hypothesis, demonstrating that chromatic perception and temporal duration estimations modulate according to lexical specificity.\n\nFar from precluding conceptual cross-pollination, linguistic diversity encapsulates the multifaceted versatility of human cognition, demonstrating that the acquisition of polyglot competencies fundamentally expands cognitive flexibility and semantic synthesis."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "Astrophysics and the Fate of the Cosmos",
                    Description: "A rigorous journey through thermodynamics, dark energy expansion, and the ultimate cosmic destiny.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 16,
                    CategoryName: "Science",
                    LevelName: "Proficient",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "Dark Energy and Cosmic Acceleration",
                            "Precision observations of Type Ia supernovae and Cosmic Microwave Background anisotropy substantiate that the expansion of the spacetime metric is undergoing asymptotic acceleration, propelled by the enigmatic scalar phenomenon designated as dark energy.\n\nThis cosmological constant exerts repulsive negative pressure across intergalactic voids, gradually overcoming the gravitational binding energy of stellar superclusters and dispersing the observable universe into increasing entropy."
                        ),
                        new ChapterSeedItem(
                            "The Degenerate Era and Thermal Equilibrium",
                            "As stellar nucleosynthesis exhausts baryonic fuel over trillions of years, galaxies will transition into the Degenerate Era, characterized exclusively by brown dwarfs, neutron remnants, and stellar-mass black holes.\n\nThrough Hawking radiation, even supermassive gravitational singularities will eventually evaporate over googol-year timeframes, culminating in the asymptotic Heat Death of the cosmos—a state of maximal thermodynamic entropy where time ceases to possess physical meaning."
                        )
                    }
                ),

                new StorySeedItem(
                    Title: "Geopolitical Macroeconomics and Monetary Hegemony",
                    Description: "An exhaustive dissertation on global reserve currencies, sovereign debt architecture, and multilateral financial shifts.",
                    CoverImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
                    EstimatedMinutes: 15,
                    CategoryName: "Business",
                    LevelName: "Proficient",
                    Chapters: new List<ChapterSeedItem>
                    {
                        new ChapterSeedItem(
                            "The Triffin Dilemma and Global Reserves",
                            "The post-Bretton Woods architecture cemented the structural hegemony of fiat reserve currencies, granting issuing sovereign entities unprecedented fiscal flexibility alongside inherent balance-of-payments vulnerabilities codified in the Triffin Dilemma.\n\nGlobal trade settlement networks, anchored by petrodollar recycling and central bank reserve accumulation, inherently incentivize foreign capital accumulation while exposing developing economies to systemic currency volatility and macroeconomic contagion."
                        ),
                        new ChapterSeedItem(
                            "De-Dollarization and Multipolar Settlement Architectures",
                            "The twenty-first century has witnessed an accelerated proliferation of bilateral currency swap arrangements, digital sovereign settlement protocols, and commodities-backed liquidity facilities seeking to circumvent unilateral financial sanction mechanisms.\n\nThis recalibration signals the emergence of a multipolar monetary paradigm wherein distributed financial infrastructure and sovereign debt diversification fundamentally challenge conventional central banking orthodoxies."
                        )
                    }
                )
            };
        }
    }
}
