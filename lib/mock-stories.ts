'use client'

import { StoryWithRelations, Chapter, Profile, Comment } from './types/database'
import { getUnsplashCover } from './unsplash'


// Genre definitions matching slugs
export const GENRES_LIST = [
  { id: '1', name: 'Action', slug: 'action', color: '#dc2626' },
  { id: '2', name: 'Adventure', slug: 'adventure', color: '#059669' },
  { id: '3', name: 'Contemporary', slug: 'contemporary', color: '#2563eb' },
  { id: '4', name: 'Drama', slug: 'drama', color: '#7c3aed' },
  { id: '5', name: 'Essay', slug: 'essay', color: '#4b5563' },
  { id: '6', name: 'Fan Fiction', slug: 'fan-fiction', color: '#db2777' },
  { id: '7', name: 'Fantasy', slug: 'fantasy', color: '#8b5cf6' },
  { id: '8', name: 'Historical Fiction', slug: 'historical-fiction', color: '#b45309' },
  { id: '9', name: 'Horror', slug: 'horror', color: '#18181b' },
  { id: '10', name: 'Humor', slug: 'humor', color: '#84cc16' },
  { id: '11', name: 'Memoir', slug: 'memoir', color: '#06b6d4' },
  { id: '12', name: 'Mystery', slug: 'mystery', color: '#0f172a' }
]

// Mock author templates
const MOCK_AUTHORS: Omit<Profile, 'id' | 'created_at' | 'updated_at'>[] = [
  { user_id: 'a1', username: 'elian_thorne', display_name: 'Elian Thorne', bio: 'High fantasy worldbuilder and tea enthusiast. Exploring ancient ruins in ink.', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop', role: 'author', is_verified: true, follower_count: 14200, following_count: 230, story_count: 5, total_read_count: 850000, website_url: null },
  { user_id: 'a2', username: 'lyra_stark', display_name: 'Lyra Stark', bio: 'Adventure writer, part-time explorer. Crafting tales of forgotten mountains.', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', role: 'author', is_verified: true, follower_count: 9800, following_count: 110, story_count: 4, total_read_count: 420000, website_url: null },
  { user_id: 'a3', username: 'kaelen_drake', display_name: 'Kaelen Drake', bio: 'Sci-fi and historical fiction storyteller. Obsessed with antique maps and telescopes.', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', role: 'author', is_verified: false, follower_count: 3100, following_count: 410, story_count: 3, total_read_count: 190000, website_url: null },
  { user_id: 'a4', username: 'cynthia_vane', display_name: 'Cynthia Vane', bio: 'Dark romance and psychological thriller author. Writing from a cozy cabin.', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', role: 'author', is_verified: true, follower_count: 25400, following_count: 500, story_count: 8, total_read_count: 1900000, website_url: null },
  { user_id: 'a5', username: 'garrett_cole', display_name: 'Garrett Cole', bio: 'Action & crime novelist. Ex-investigator turned writer.', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', role: 'author', is_verified: false, follower_count: 4500, following_count: 80, story_count: 2, total_read_count: 320000, website_url: null },
  { user_id: 'a6', username: 'serena_vance', display_name: 'Serena Vance', bio: 'YA contemporary writer. Capturing the beautiful chaos of growing up.', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', role: 'author', is_verified: true, follower_count: 18900, following_count: 350, story_count: 6, total_read_count: 1100000, website_url: null },
  { user_id: 'a7', username: 'arthur_blackwood', display_name: 'Arthur Blackwood', bio: 'Horror specialist. Whispering stories that keep you awake past midnight.', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop', role: 'author', is_verified: true, follower_count: 34000, following_count: 90, story_count: 12, total_read_count: 4500000, website_url: null },
  { user_id: 'a8', username: 'chloe_meadows', display_name: 'Chloe Meadows', bio: 'Cozy romance and slice-of-life humor. Believer in second chances and strong coffee.', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', role: 'author', is_verified: false, follower_count: 8300, following_count: 600, story_count: 4, total_read_count: 530000, website_url: null },
  { user_id: 'a9', username: 'raymond_vance', display_name: 'Raymond Vance', bio: 'Philosopher and essayist. Unpacking technology, art, and modern culture.', avatar_url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&h=150&fit=crop', role: 'author', is_verified: true, follower_count: 12100, following_count: 150, story_count: 7, total_read_count: 980000, website_url: null }
]

// Raw story details per genre template
const GENRE_STORIES_DATA: Record<string, { title: string; description: string; cover: string }[]> = {
  fantasy: [
    { title: "The Whispering Spire", description: "An ancient stone tower of forbidden magic begins calling out to a young, untrained apprentice, revealing secrets that could undo the kingdom.", cover: "https://images.pexels.com/photos/1183986/pexels-photo.jpg" },
    { title: "Wings of the Dawn", description: "The last known dragon-rider of the Sunken Isles sets off on a perilous voyage across dangerous seas to locate a legendary golden egg.", cover: "https://images.pexels.com/photos/2098007/pexels-photo.jpg" },
    { title: "Echoes of Eldoria", description: "A group of daring ruin-explorers accidentally activate a giant celestial engine, shifting gravity across the entire continent.", cover: "https://images.pexels.com/photos/2440856/pexels-photo.jpg" },
    { title: "The Rune Weaver", description: "In a city where spells are woven into fine silks, a girl discovers a corrupt plot within the Royal Guild that threatens her family.", cover: "https://images.pexels.com/photos/1231643/pexels-photo.jpg" },
    { title: "Shadow of the Moonstone", description: "A master thief attempts to steal a glowing moonstone from the high-security elven treasury, only to trigger an ancient curse.", cover: "https://images.pexels.com/photos/1271619/pexels-photo.jpg" },
    { title: "The Glass Kingdom", description: "A floating city built entirely of unbreakable glass begins to develop mysterious fractures after the birth of a royal heir.", cover: "https://images.pexels.com/photos/267961/pexels-photo.jpg" },
    { title: "Blade of the Eclipse", description: "A legendary sword forged in a solar eclipse will only unsheathe when the kingdom is in its darkest, most desperate hour.", cover: "https://images.pexels.com/photos/4588078/pexels-photo.jpg" },
    { title: "The Alchemist's Apprentice", description: "Trained in secret, an apprentice brews a forbidden potion that allows her to step directly into the memories of dead kings.", cover: "https://images.pexels.com/photos/4053336/pexels-photo.jpg" },
    { title: "Chronicles of the Windrider", description: "Captain Kaelen commands a wooden sky-ship charting the endless lightning storms of the mythical Upper Reach.", cover: "https://images.pexels.com/photos/355828/pexels-photo.jpg" },
    { title: "The Lost Sanctuary", description: "Deep within the Whispering Woods, three teenagers stumble upon the overgrown stone arches of the first magical order.", cover: "https://images.pexels.com/photos/235089/pexels-photo.jpg" }
  ],
  horror: [
    { title: "The Cellar Steps", description: "A family moves into a beautiful Victorian manor, only to discover a bricked-up door in the cellar that echoes with rhythmic scratching.", cover: "https://images.pexels.com/photos/279810/pexels-photo.jpg" },
    { title: "Shadows of Blackwood", description: "A local investigator enters a dense forest where the trees bleed dark sap and the sun never seems to rise.", cover: "https://images.pexels.com/photos/15286/pexels-photo.jpg" },
    { title: "The Portrait of Clara", description: "An antique portrait purchased at a flea market begins to subtly change expression, reflecting the fears of whoever looks at it.", cover: "https://images.pexels.com/photos/3358875/pexels-photo.jpg" },
    { title: "Whispers in the Walls", description: "A tenant in an old city apartment realizes the steam pipes are humming distinct human sighs in Morse code.", cover: "https://images.pexels.com/photos/325185/pexels-photo.jpg" },
    { title: "The Cold Room", description: "In an abandoned psychiatric ward, one room's temperature remains fixed at freezing, regardless of the scorching summer outside.", cover: "https://images.pexels.com/photos/1658487/pexels-photo.jpg" },
    { title: "The Hollow Lighthouse", description: "A lighthouse keeper discovers that the rotating beacon light is attracting shadows from the depths of the ocean rather than warning ships.", cover: "https://images.pexels.com/photos/220147/pexels-photo.jpg" },
    { title: "Beneath the Floorboards", description: "Renovating a century-old house reveals a hollow space under the floor containing a music box that plays on its own.", cover: "https://images.pexels.com/photos/5691655/pexels-photo.jpg" },
    { title: "The Mourning Village", description: "A traveler gets stranded in a remote town where residents hold elaborate funerals for citizens who are still alive.", cover: "https://images.pexels.com/photos/280222/pexels-photo.jpg" },
    { title: "Echoes in the Fog", description: "A mountain hiker realizes that a second set of heavy footsteps has been mimicking their pace in the dense, freezing fog.", cover: "https://images.pexels.com/photos/9754/pexels-photo.jpg" },
    { title: "Watcher in the Woods", description: "A nature photographer captures a tall, faceless figure in the background of every single photo, drawing closer with each frame.", cover: "https://images.pexels.com/photos/158028/pexels-photo.jpg" }
  ],
  mystery: [
    { title: "The Clockmaker's Alibi", description: "A wealthy clock collector is found dead inside a locked workshop, surrounded by dozens of clocks ticking in perfect unison.", cover: "https://images.pexels.com/photos/2182977/pexels-photo.jpg" },
    { title: "Red Ink", description: "A young literary editor receives an anonymous manuscript that details a real, unsolved local murder with terrifying precision.", cover: "https://images.pexels.com/photos/374074/pexels-photo.jpg" },
    { title: "The Silent Witness", description: "Detective Thomas solves crimes by studying the complex patterns of dust and debris left at crime scenes.", cover: "https://images.pexels.com/photos/289737/pexels-photo.jpg" },
    { title: "The Hollow Key", description: "A bronze key found hidden inside an antique globe fits no lock in the estate, leading to a path of hidden family secrets.", cover: "https://images.pexels.com/photos/42220/pexels-photo.jpg" },
    { title: "Echoes of the Gallow", description: "A persistent journalist uncovers a secret society operating behind the council of an exceptionally peaceful coastal town.", cover: "https://images.pexels.com/photos/1036808/pexels-photo.jpg" },
    { title: "The Cipher in the Attic", description: "Unlocking a coded diary from 1924 leads a young historian to a series of clues hidden in local historical monuments.", cover: "https://images.pexels.com/photos/1410224/pexels-photo.jpg" },
    { title: "Shadow of the Dagger", description: "A prominent museum curator is framed for the theft of an imperial dagger, forcing them to find the true thief.", cover: "https://images.pexels.com/photos/335393/pexels-photo.jpg" },
    { title: "The Crow's Invitation", description: "Ten strangers are invited to an isolated island mansion. When the host never arrives, they must solve a series of puzzles to leave.", cover: "https://images.pexels.com/photos/101808/pexels-photo.jpg" },
    { title: "Murder at Blackwood", description: "During a heavy snowstorm, a guest is killed at a family reunion, leaving Inspector Ross to question the deceitful relatives.", cover: "https://images.pexels.com/photos/3052361/pexels-photo.jpg" },
    { title: "The Crimson Ribbon", description: "A detective notices a thin red ribbon tied to the lampposts near three unrelated disappearances across London.", cover: "https://images.pexels.com/photos/635084/pexels-photo.jpg" }
  ],
  action: [
    { title: "Grid Lock", description: "An elite driver is forced into a high-stakes street race across Tokyo to recover a stolen database containing undercover agent files.", cover: "https://images.pexels.com/photos/3136673/pexels-photo.jpg" },
    { title: "Apex Protocol", description: "A betrayed special forces operative goes rogue, using his tactical training to dismantle the mercenary shadow group that framed him.", cover: "https://images.pexels.com/photos/163403/pexels-photo.jpg" },
    { title: "The Red Line", description: "A firefighter risk everything to rescue hostages trapped on the top floor of a high-tech skyscraper engulfed in chemical flames.", cover: "https://images.pexels.com/photos/270224/pexels-photo.jpg" },
    { title: "Echo Sector", description: "When a space station's defense grid goes offline, an engineer must fight through pirate boarders to reboot the core.", cover: "https://images.pexels.com/photos/2156/pexels-photo.jpg" },
    { title: "City of Ash", description: "A martial arts expert defends his neighborhood from a ruthless corporate syndicate attempting to burn down local businesses.", cover: "https://images.pexels.com/photos/220201/pexels-photo.jpg" },
    { title: "The Courier's Run", description: "Carrying a life-saving serum, a runner must sprint through a war-torn urban ruin while evading high-tech tracking drones.", cover: "https://images.pexels.com/photos/1618269/pexels-photo.jpg" },
    { title: "Vanguard Hunt", description: "A veteran tracker is hired to capture an escaped test subject in a dense, hostile swamp, only to find the subject is highly intelligent.", cover: "https://images.pexels.com/photos/709552/pexels-photo.jpg" },
    { title: "Iron Reign", description: "Piloting a damaged defense mech, a soldier stands as the final line of defense against an invading armored column.", cover: "https://images.pexels.com/photos/3861958/pexels-photo.jpg" },
    { title: "Midnight Strike", description: "A high-octane heist story of a crew planning to hijack an armored train carrying gold reserves through the Alps.", cover: "https://images.pexels.com/photos/325200/pexels-photo.jpg" },
    { title: "Zero Gravity", description: "Astronauts aboard a collapsing orbital ring must coordinate a desperate escape before the station enters Earth's atmosphere.", cover: "https://images.pexels.com/photos/41006/pexels-photo.jpg" }
  ],
  adventure: [
    { title: "The Lost Codex", description: "A young cartographer discovers an ancient map hidden in a library book, pointing to the lost tombs of Alexandria's architects.", cover: "https://images.pexels.com/photos/259972/pexels-photo.jpg" },
    { title: "Peak of the Gods", description: "Daring mountaineers attempt to scale a Himalayan peak that is permanently shrouded in mysterious, violent storms.", cover: "https://images.pexels.com/photos/9754/pexels-photo.jpg" },
    { title: "The Desert's Edge", description: "A desert guide leads a rescue expedition into an uncharted dune sea, stumbling upon ruins uncovered by a recent sandstorm.", cover: "https://images.pexels.com/photos/1001435/pexels-photo.jpg" },
    { title: "River of Serpents", description: "A team of researchers rafts down a dangerous, uncharted Amazonian tributary in search of a plant that can cure any illness.", cover: "https://images.pexels.com/photos/709552/pexels-photo.jpg" },
    { title: "The Ice Highway", description: "After a plane crash, a pilot and a scientist must walk across 200 miles of barren Arctic ice to reach the nearest radio outpost.", cover: "https://images.pexels.com/photos/300857/pexels-photo.jpg" },
    { title: "Canyons of Gold", description: "A treasure hunter competes against a ruthless mercenary organization to find a hoard of Aztec gold in a maze-like canyon.", cover: "https://images.pexels.com/photos/33044/pexels-photo.jpg" },
    { title: "Island of the Winds", description: "Shipwrecked on a volcanic island, a marine biologist must navigate collapsing caverns and geysers to find a way back home.", cover: "https://images.pexels.com/photos/3608056/pexels-photo.jpg" },
    { title: "Skyward Voyage", description: "A historical hot-air balloon expedition blown off-course lands in a hidden, isolated valley where prehistoric creatures survive.", cover: "https://images.pexels.com/photos/355828/pexels-photo.jpg" },
    { title: "Jungle of Whispers", description: "Two siblings search the Cambodian jungles for their missing archaeologist parents, following clues left in old letters.", cover: "https://images.pexels.com/photos/15286/pexels-photo.jpg" },
    { title: "The Nomad's Trail", description: "A young traveler journeys across the vast Mongolian steppes on horseback, learning ancient survival techniques from nomadic tribes.", cover: "https://images.pexels.com/photos/1072179/pexels-photo.jpg" }
  ],
  contemporary: [
    { title: "Late Night Shifts", description: "Three college graduates working entry-level jobs in New York City lean on each other to survive the corporate grind and relationship drama.", cover: "https://images.pexels.com/photos/3184291/pexels-photo.jpg" },
    { title: "The Shared Kitchen", description: "In a crowded London apartment building, five roommates from completely different backgrounds connect over home-cooked Sunday dinners.", cover: "https://images.pexels.com/photos/3184360/pexels-photo.jpg" },
    { title: "Coffee & Commutes", description: "A routine commuter begins exchanging handwritten notes in the margins of newspaper crosswords with a mysterious passenger.", cover: "https://images.pexels.com/photos/313690/pexels-photo.jpg" },
    { title: "Echoes of the City", description: "A street photographer capturing the shifting faces of a gentrifying Chicago neighborhood accidentally documents a turning point in a stranger's life.", cover: "https://images.pexels.com/photos/1484794/pexels-photo.jpg" },
    { title: "The Startup Dream", description: "Two software engineers in Silicon Valley risk their life savings to launch a social app, testing their friendship under high pressure.", cover: "https://images.pexels.com/photos/3861958/pexels-photo.jpg" },
    { title: "Greenhouse Effects", description: "A community garden in an urban food desert becomes a battleground and a sanctuary for local families fighting redevelopment.", cover: "https://images.pexels.com/photos/1072179/pexels-photo.jpg" },
    { title: "The Art of Moving On", description: "A successful art gallery owner returns to her small hometown in Maine to rebuild her life and reconnect with her estranged brother.", cover: "https://images.pexels.com/photos/220453/pexels-photo.jpg" },
    { title: "Corner Bakery", description: "A traditional baker struggles to keep his shop afloat against a trendy franchise, finding support in loyal neighborhood customers.", cover: "https://images.pexels.com/photos/2062426/pexels-photo.jpg" },
    { title: "A New Chapter", description: "A forty-year-old mother decides to go back to law school, navigating lecture halls filled with students half her age.", cover: "https://images.pexels.com/photos/3747468/pexels-photo.jpg" },
    { title: "Suburban Summer", description: "A group of high school seniors spend their final summer together before going to separate universities across the country.", cover: "https://images.pexels.com/photos/1000435/pexels-photo.jpg" }
  ],
  drama: [
    { title: "The Broken Glass", description: "A tense family dinner turns into a legal battle when the patriarch uncovers a corporate secret that could ruin their reputation.", cover: "https://images.pexels.com/photos/3184360/pexels-photo.jpg" },
    { title: "Fading Echoes", description: "A mother diagnosed with early-onset dementia and her estranged daughter attempt to heal past wounds before memories fade.", cover: "https://images.pexels.com/photos/3768131/pexels-photo.jpg" },
    { title: "The Final Act", description: "An legendary theater actor struggles to memorize lines for his final Broadway appearance while dealing with his failing health.", cover: "https://images.pexels.com/photos/267569/pexels-photo.jpg" },
    { title: "House of Cards", description: "Two ambitious politicians in Washington D.C. enter a marriage of convenience to secure a seat, only to turn into rivals.", cover: "https://images.pexels.com/photos/3184291/pexels-photo.jpg" },
    { title: "Silence Between Us", description: "A married couple struggles to rebuild their relationship after a tragic accident silences their cozy household.", cover: "https://images.pexels.com/photos/313690/pexels-photo.jpg" },
    { title: "Shadows of the Past", description: "A young lawyer is forced to defend the man who destroyed her father's career, uncovering a web of local conspiracy.", cover: "https://images.pexels.com/photos/289737/pexels-photo.jpg" },
    { title: "The Audition", description: "A talented ballerina pushes her body to dangerous limits to secure the lead role in a highly competitive Swan Lake production.", cover: "https://images.pexels.com/photos/1484794/pexels-photo.jpg" },
    { title: "Bonds of Blood", description: "When a family-run construction company faces bankruptcy, three siblings clash over whether to sell their ancestral land.", cover: "https://images.pexels.com/photos/3747468/pexels-photo.jpg" },
    { title: "Fallen Angels", description: "A disgraced pop star flees the paparazzi to a remote Irish village, attempting to find her voice and write music again.", cover: "https://images.pexels.com/photos/220453/pexels-photo.jpg" },
    { title: "The Last Goodbye", description: "Two childhood friends who grew apart meet at a funeral, forced to confront the secrets that separated them years ago.", cover: "https://images.pexels.com/photos/3768131/pexels-photo.jpg" }
  ],
  essay: [
    { title: "The Digital Cage", description: "An in-depth critique of how modern social media algorithms reshape human attention, empathy, and social structures.", cover: "https://images.pexels.com/photos/374074/pexels-photo.jpg" },
    { title: "Philosophy of the Common Man", description: "Applying ancient Stoic and Zen philosophies to survive the stress, anxiety, and pace of modern urban office environments.", cover: "https://images.pexels.com/photos/289737/pexels-photo.jpg" },
    { title: "The Art of Solitude", description: "A cultural exploration of the value of silence and isolation in a world that demands constant digital connectedness.", cover: "https://images.pexels.com/photos/1036808/pexels-photo.jpg" },
    { title: "Language of the Streets", description: "How urban street art, slang, and architectural choices serve as silent resistance against corporate city planning.", cover: "https://images.pexels.com/photos/1484794/pexels-photo.jpg" },
    { title: "The Future of Labor", description: "An analysis of automation, remote work trends, and the psychological impact of decoupling survival from physical labor.", cover: "https://images.pexels.com/photos/3861958/pexels-photo.jpg" },
    { title: "The Creative Spark", description: "Examining why traditional school systems often suppress creative curiosity and how to reclaim self-directed learning.", cover: "https://images.pexels.com/photos/267569/pexels-photo.jpg" },
    { title: "Ethics of Artificial Minds", description: "A philosophical examination of the moral status of artificial intelligence and the risk of automated human bias.", cover: "https://images.pexels.com/photos/2156/pexels-photo.jpg" },
    { title: "The City and the Sea", description: "An environmental essay tracing the historical relationship between major port cities and ocean ecosystems.", cover: "https://images.pexels.com/photos/300857/pexels-photo.jpg" },
    { title: "Mind Over Machine", description: "How eastern philosophy regarding mindfulness can help users detach from digital addiction and screen exhaustion.", cover: "https://images.pexels.com/photos/313690/pexels-photo.jpg" },
    { title: "The Inevitable Shift", description: "How grassroots cultural changes scale up to trigger massive shifts in political and social structures.", cover: "https://images.pexels.com/photos/3184360/pexels-photo.jpg" }
  ],
  "fan-fiction": [
    { title: "Academy of Sorcery", description: "In a hidden academy of magic, a student from a non-magical family discovers a chamber containing a sentient spellbook.", cover: "https://images.pexels.com/photos/1183986/pexels-photo.jpg" },
    { title: "The Ring of Destiny", description: "An original story set in a fantasy universe where a lone ranger must escort a dark, heavy artifact to a volcano to destroy it.", cover: "https://images.pexels.com/photos/4588078/pexels-photo.jpg" },
    { title: "Tales from the Bounty Hunter", description: "A lone space hunter tracks a highly valuable target across desert planets, only to discover the target is an innocent child.", cover: "https://images.pexels.com/photos/2156/pexels-photo.jpg" },
    { title: "The Baker Street Detective", description: "A consulting detective and his loyal doctor friend solve a murder mystery involving a cipher found in a London bank.", cover: "https://images.pexels.com/photos/2182977/pexels-photo.jpg" },
    { title: "Shadow of the Vigilante", description: "In a dark, rain-slicked city, a wealthy businessman wears a mask at night to fight corrupt police and gang syndicates.", cover: "https://images.pexels.com/photos/325185/pexels-photo.jpg" },
    { title: "Grid Warrior", description: "A computer program acquires consciousness and must navigate a high-stakes digital arena to escape into the internet.", cover: "https://images.pexels.com/photos/3861958/pexels-photo.jpg" },
    { title: "The Iron Heart", description: "An inventor builds a high-tech armored suit in his garage to defend his city from industrial espionage drones.", cover: "https://images.pexels.com/photos/270224/pexels-photo.jpg" },
    { title: "Wasteland Wanderers", description: "Emerging from a underground bunker 100 years after a war, a survivor searches the ruins of Boston for his family.", cover: "https://images.pexels.com/photos/220201/pexels-photo.jpg" },
    { title: "Spells & Swords", description: "A mutated monster hunter accepts a contract to rid a village of a beast, only to uncover a royal conspiracy.", cover: "https://images.pexels.com/photos/709552/pexels-photo.jpg" },
    { title: "The Matrix Reborn", description: "A cubicle worker starts noticing glowing green digital code leaking from television screens, revealing a simulated reality.", cover: "https://images.pexels.com/photos/313690/pexels-photo.jpg" }
  ],
  "historical-fiction": [
    { title: "Shield of Rome", description: "A veteran Roman centurion faces political betrayal and freezing conditions at the snowy borders of Britannia.", cover: "https://images.pexels.com/photos/4588078/pexels-photo.jpg" },
    { title: "Scribes of Alexandria", description: "A librarian risks her life to hide ancient scrolls from a fanatical group attempting to burn down the Great Library.", cover: "https://images.pexels.com/photos/1036808/pexels-photo.jpg" },
    { title: "The Queen's Spymaster", description: "A court clerk in Elizabethan London is drafted into a secret spy network to intercept letters plotting against the crown.", cover: "https://images.pexels.com/photos/101808/pexels-photo.jpg" },
    { title: "Banners in the Wind", description: "A young squire during the Hundred Years' War must carry his fallen knight's banner back to safety through enemy lines.", cover: "https://images.pexels.com/photos/33044/pexels-photo.jpg" },
    { title: "The Silk Road Merchant", description: "Following the hazardous caravan routes, a Venetian merchant travels through Central Asia, documenting lost cultures.", cover: "https://images.pexels.com/photos/1001435/pexels-photo.jpg" },
    { title: "Emperor's Call", description: "A peasant family is drafted to construct the Great Wall, detailing the harsh conditions and architectural triumphs.", cover: "https://images.pexels.com/photos/235089/pexels-photo.jpg" },
    { title: "Red Rose of Lancaster", description: "A young noblewoman navigates court intrigues and military threats during the violent Wars of the Roses.", cover: "https://images.pexels.com/photos/279810/pexels-photo.jpg" },
    { title: "The Viking's Hearth", description: "A Norse family coordinates their daily survival and voyages of exploration from a small fjord in 9th-century Norway.", cover: "https://images.pexels.com/photos/300857/pexels-photo.jpg" },
    { title: "Shadow of the Guillotine", description: "A Parisian pamphleteer writes critiques of the nobility, only to find himself targeted during the Reign of Terror.", cover: "https://images.pexels.com/photos/1484794/pexels-photo.jpg" },
    { title: "The Pharaoh's Architect", description: "Designers of the tombs in the Valley of the Kings compete for royal favor while keeping secret chambers hidden.", cover: "https://images.pexels.com/photos/2440856/pexels-photo.jpg" }
  ],
  humor: [
    { title: "Cat Who Cried Wolf", description: "A house cat masterminds a series of complex house heists to steal premium canned salmon from the high kitchen shelf.", cover: "https://images.pexels.com/photos/1183986/pexels-photo.jpg" },
    { title: "My Boss is a Vampire", description: "A hilarious office comedy about a regular manager who is convinced his CEO is a vampire, despite him just being eccentric.", cover: "https://images.pexels.com/photos/3184291/pexels-photo.jpg" },
    { title: "Don't Press the Button", description: "A clumsy laboratory assistant keeps accidentally triggering minor scientific anomalies, like reverse gravity in the breakroom.", cover: "https://images.pexels.com/photos/3861958/pexels-photo.jpg" },
    { title: "The Worst Vacation Ever", description: "A family's cross-country road trip to a theme park turns into a series of funny disasters involving maps, motel pools, and flat tires.", cover: "https://images.pexels.com/photos/1000435/pexels-photo.jpg" },
    { title: "Cooking Disasters", description: "An aspiring home chef writes a funny diary detailing his attempts to prepare gourmet French meals with disastrous results.", cover: "https://images.pexels.com/photos/2062426/pexels-photo.jpg" },
    { title: "Supermarket Heist", description: "Three elderly residents hatch a funny plot to steal the final pumpkin pie from the supermarket on Thanksgiving Eve.", cover: "https://images.pexels.com/photos/3184360/pexels-photo.jpg" },
    { title: "Diary of a Dog", description: "A golden retriever keeps a secret journal documenting the confusing, hilarious behaviors of his human family.", cover: "https://images.pexels.com/photos/1072179/pexels-photo.jpg" },
    { title: "The Clumsy Wizard", description: "A wizard whose spells always backfire finds a job in a circus, using his failed magic to entertain children.", cover: "https://images.pexels.com/photos/1231643/pexels-photo.jpg" },
    { title: "Office Shenanigans", description: "A compilation of the funny pranks, awkward meetings, and bizarre email threads in a typical corporate paper company.", cover: "https://images.pexels.com/photos/313690/pexels-photo.jpg" },
    { title: "The Accidental Tourist", description: "A traveler with no sense of direction gets lost in various European cities, finding himself in funny local festivals.", cover: "https://images.pexels.com/photos/259972/pexels-photo.jpg" }
  ],
  memoir: [
    { title: "Chasing Light", description: "A blind photographer writes an inspiring memoir about how she learns to capture the world through texture, sound, and thermal cues.", cover: "https://images.pexels.com/photos/220453/pexels-photo.jpg" },
    { title: "Long Walk Home", description: "A personal account of a backpacker walking across the Pacific Crest Trail to recover from a major life crisis.", cover: "https://images.pexels.com/photos/300857/pexels-photo.jpg" },
    { title: "Under the Olive Tree", description: "Reflections on growing up in a tiny, wind-swept Greek fishing village, and the recipes and stories passed down by the author's grandmother.", cover: "https://images.pexels.com/photos/1072179/pexels-photo.jpg" },
    { title: "My Life in Chapters", description: "An autobiographical account of a librarian who spent forty years cataloging books while witnessing changing urban neighborhoods.", cover: "https://images.pexels.com/photos/267569/pexels-photo.jpg" },
    { title: "The Mountain Inside Me", description: "An inspiring memoir of a climber who survived being trapped in a canyon, exploring the limits of human endurance.", cover: "https://images.pexels.com/photos/9754/pexels-photo.jpg" },
    { title: "Notes from a Small Island", description: "A travel writer documents his funny, warm interactions with local bed-and-breakfast owners across Great Britain.", cover: "https://images.pexels.com/photos/259972/pexels-photo.jpg" },
    { title: "A Writer's Diary", description: "An intimate look into the daily journals, creative blocks, and personal triumphs of a novelist working over three decades.", cover: "https://images.pexels.com/photos/374074/pexels-photo.jpg" },
    { title: "The Sun and Her Flowers", description: "Poetic reflections on healing, immigrant family roots, and finding self-acceptance after years of self-doubt.", cover: "https://images.pexels.com/photos/3768131/pexels-photo.jpg" },
    { title: "Stitches of Time", description: "A fashion designer recounts her journey from a penniless tailor's helper to running an independent studio in Paris.", cover: "https://images.pexels.com/photos/1181686/pexels-photo.jpg" },
    { title: "Finding Quiet", description: "A former corporate executive shares how he abandoned the rat race to study mindfulness in a remote Buddhist monastery.", cover: "https://images.pexels.com/photos/313690/pexels-photo.jpg" }
  ]
}

// Generate full list of 120 unique stories
export function getMockStories(genreSlug?: string | null): StoryWithRelations[] {
  const storiesList: StoryWithRelations[] = []
  
  // Determine which genres to process
  const genresToProcess = genreSlug 
    ? GENRES_LIST.filter(g => g.slug === genreSlug)
    : GENRES_LIST

  genresToProcess.forEach((genreInfo, gIndex) => {
    const rawStories = GENRE_STORIES_DATA[genreInfo.slug] || GENRE_STORIES_DATA.fantasy // fallback to fantasy
    
    rawStories.forEach((raw, sIndex) => {
      // Deterministic mapping to authors
      const authorIndex = (gIndex * 7 + sIndex) % MOCK_AUTHORS.length
      const authorTemplate = MOCK_AUTHORS[authorIndex]
      const author: Profile = {
        ...authorTemplate,
        id: `author-${authorTemplate.user_id}`,
        created_at: new Date(2025, 0, 1).toISOString(),
        updated_at: new Date(2026, 6, 10).toISOString()
      }

      const id = `mock-${genreInfo.slug}-${sIndex + 1}`
      const wordCount = 12000 + (sIndex * 8500)
      const chapterCount = 8 + (sIndex % 5) * 3 // 8 to 20 chapters
      const rating = 4.2 + (sIndex % 9) * 0.1 // 4.2 to 5.0
      
      const story: StoryWithRelations = {
        id,
        user_id: author.id,
        title: raw.title,
        description: raw.description,
        cover_url: getUnsplashCover(id, 400, 600),
        status: sIndex % 3 === 0 ? 'draft' : 'published', // we only display 'published' in the list
        language: 'en',
        age_rating: sIndex % 4 === 0 ? 'mature' : 'everyone',
        content_warnings: sIndex % 5 === 0 ? ['Violence'] : [],
        view_count: 5200 + (sIndex * 7420),
        read_count: 1200 + (sIndex * 3110),
        like_count: 240 + (sIndex * 615),
        comment_count: 12 + (sIndex * 15),
        bookmark_count: 85 + (sIndex * 110),
        chapter_count: chapterCount,
        word_count: wordCount,
        is_featured: sIndex === 0 || sIndex === 3,
        is_completed: sIndex % 2 === 0,
        published_at: new Date(2026, 1, 10 + sIndex).toISOString(),
        created_at: new Date(2026, 0, 5).toISOString(),
        updated_at: new Date(2026, 6, 9).toISOString(),
        author: author,
        genres: [{ id: genreInfo.id, name: genreInfo.name, slug: genreInfo.slug, description: null, icon: null, color: genreInfo.color, story_count: 10, created_at: '' }],
        tags: [genreInfo.slug, 'cozy', 'popular']
      }

      // We only return 'published' in lists to match the filter in app/stories/page.tsx
      story.status = 'published'

      storiesList.push(story)
    })
  })

  return storiesList
}

// Generate detailed chapters, reviews, and comments for a single mock story
export function getDetailedMockStory(id: string): {
  story: StoryWithRelations
  chapters: Chapter[]
  comments: Comment[]
  reviews: { id: string; author: string; avatar: string; rating: number; text: string; date: string }[]
} | null {
  const allStories = getMockStories()
  const foundStory = allStories.find(s => s.id === id)
  if (!foundStory) return null

  // Generate chapters
  const chapters: Chapter[] = Array.from({ length: foundStory.chapter_count }, (_, index) => {
    const chapterNum = index + 1
    return {
      id: `chapter-${id}-${chapterNum}`,
      story_id: id,
      title: `Chapter ${chapterNum}: ${getChapterTitle(foundStory.genres[0].slug, chapterNum)}`,
      content: `This is a sample chapter text for "${foundStory.title}". The ink flows across the parchment as the story develops. In this chapter, the core conflicts begin to reveal themselves. Deep secrets are unearthed and long-standing alliances are put to the test. The characters navigate their surroundings with caution, knowing that any false step could lead to disaster. The prose flows with literary elegance, painting a detailed picture of the environments, the emotional stakes, and the magical or physical challenges ahead. Word by word, the parchment captures their journey.`,
      chapter_number: chapterNum,
      status: 'published',
      word_count: Math.floor(1200 + Math.sin(chapterNum) * 300),
      view_count: Math.max(100, Math.floor(foundStory.view_count * (1 - index * 0.05))),
      read_count: Math.max(80, Math.floor(foundStory.read_count * (1 - index * 0.06))),
      comment_count: Math.max(1, Math.floor(foundStory.comment_count / (index + 1))),
      published_at: new Date(2026, 2, chapterNum).toISOString(),
      created_at: new Date(2026, 2, chapterNum).toISOString(),
      updated_at: new Date(2026, 2, chapterNum).toISOString()
    }
  })

  // Generate comments
  const comments: Comment[] = [
    { id: `c-1`, user_id: 'u1', chapter_id: `chapter-${id}-1`, parent_id: null, content: "Wow, this is incredibly well-written. The descriptions of the environment are so vivid!", like_count: 14, is_edited: false, is_hidden: false, created_at: new Date(2026, 6, 1).toISOString(), updated_at: new Date(2026, 6, 1).toISOString() },
    { id: `c-2`, user_id: 'u2', chapter_id: `chapter-${id}-1`, parent_id: null, content: "I love the pacing here. Slow burn but absolutely worth it. Subscribing for more chapters!", like_count: 8, is_edited: false, is_hidden: false, created_at: new Date(2026, 6, 3).toISOString(), updated_at: new Date(2026, 6, 3).toISOString() },
    { id: `c-3`, user_id: 'u3', chapter_id: `chapter-${id}-1`, parent_id: null, content: "The character design is top-notch. Can't wait to see how they handle the upcoming conflicts.", like_count: 5, is_edited: false, is_hidden: false, created_at: new Date(2026, 6, 5).toISOString(), updated_at: new Date(2026, 6, 5).toISOString() }
  ]

  // Generate reviews
  const reviews = [
    { id: 'r1', author: 'Clara_reads', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo.jpg?w=80', rating: 5, text: "An absolute masterpiece. The prose is beautiful and the worldbuilding feels extremely lived-in.", date: 'June 20, 2026' },
    { id: 'r2', author: 'NovelExplorer', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo.jpg?w=80', rating: 4, text: "Excellent character arcs and solid pacing. Highly recommend this to anyone who appreciates literary craftsmanship.", date: 'July 2, 2026' }
  ]

  return {
    story: foundStory,
    chapters,
    comments,
    reviews
  }
}

// Chapter title helper to make everything feel completely unique
function getChapterTitle(genre: string, num: number): string {
  const fantasyTitles = ["The Calling", "Echoes of the Past", "First Light", "The Forgotten Path", "Broken Runes", "The High Scribes", "Into the Storm", "The Ancient Hearth", "Wings of Shadow", "Eldoria Awakens"]
  const horrorTitles = ["The Scratching", "Dark Trails", "The Red Tree", "Sighs in the Dark", "Frostbite", "Deep Currents", "Hidden Whispers", "The Mourning Cloak", "Double Steps", "Faceless Shadows"]
  const mysteryTitles = ["Locked Rooms", "Confessions of Ink", "Patterns of Dust", "The Hidden Key", "Quiet Councils", "Coded Monologue", "Curator's Trap", "No Host Arrived", "In the Blizzards", "Thin Ribbons"]
  
  const list = genre === 'fantasy' ? fantasyTitles : genre === 'horror' ? horrorTitles : mysteryTitles
  return list[(num - 1) % list.length] || `The Unfolding Scroll Part ${num}`
}

export interface MockReadingLog {
  id: string
  username: string
  avatar_url: string
  chapter_title: string
  progress_percent: number
  time_spent_minutes: number
  last_active: string
}

export function getMockReadingLogs(storyId: string): MockReadingLog[] {
  const story = getMockStories().find(s => s.id === storyId)
  const genreSlug = story?.genres[0]?.slug || 'fantasy'
  
  const readers = [
    { username: 'clara_reads', avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo.jpg?w=80' },
    { username: 'novel_explorer', avatar_url: 'https://images.pexels.com/photos/1516680/pexels-photo.jpg?w=80' },
    { username: 'bookworm99', avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo.jpg?w=80' },
    { username: 'story_lover', avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo.jpg?w=80' },
    { username: 'cozy_reader', avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo.jpg?w=80' },
    { username: 'ink_heart', avatar_url: 'https://images.pexels.com/photos/912278/pexels-photo.jpg?w=80' },
    { username: 'reading_owl', avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo.jpg?w=80' },
    { username: 'lit_fanatic', avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo.jpg?w=80' }
  ]

  return readers.map((reader, index) => {
    const chapterNum = (index % 3) + 1
    const progress = index === 0 ? 100 : Math.floor(30 + ((index * 8.5) % 70))
    const timeSpent = Math.floor(4 + (index * 3.7) + (progress * 0.1))
    
    return {
      id: `log-${storyId}-${index}`,
      username: reader.username,
      avatar_url: reader.avatar_url,
      chapter_title: `Chapter ${chapterNum}: ${getChapterTitle(genreSlug, chapterNum)}`,
      progress_percent: progress,
      time_spent_minutes: timeSpent,
      last_active: `${index + 2} minutes ago`
    }
  })
}
