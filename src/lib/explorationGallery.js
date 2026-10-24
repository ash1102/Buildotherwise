import { ENCOUNTER_CARDS } from "./moduleOne";

/**
 * Module 2 Exploration Gallery (M2-L1). The 12 categories are the Module 1 Discovery
 * Cards (same ids and titles). Each category opens a set of specific possibilities.
 *
 * Every possibility has:
 *   what     What is it?
 *   explore  What could you explore? (questions)
 *   tryIt    How could you try it? Each tagged with an approach: do, observe, ask, investigate.
 *            Every possibility includes at least one way that needs no money, travel,
 *            equipment, contacts, or experience.
 *   lead     Where could it lead? Possibilities, not recommendations or predictions.
 *   note     Optional safety or access note.
 *
 * The listed directions under Human Behavior, Repair & Restore, and Community Projects are
 * Ashley's wording. All other text is DRAFT (Claude) for Ashley's review.
 */

const RAW = {
  repair: [
    {
      title: "Learn how something mechanical works",
      what: "Many everyday objects (door hinges, bike brakes, staplers, can openers) work through a few simple parts: levers, springs, gears, and screws. Understanding them makes the world feel less mysterious and repairs less intimidating.",
      explore: [
        "Which simple machines are hiding in objects you use every day?",
        "What does each part do, and what happens when one fails?",
        "Why are some things designed to be easy to fix and others not?",
      ],
      tryIt: [
        ["observe", "Watch a stapler, door latch, or bike brake while it works, and name each moving part."],
        ["investigate", "Find a diagram of an everyday object (library books on “how things work” are common) and match it to the real thing."],
        ["ask", "Ask someone who does maintenance or fixes bikes what breaks most often, and why."],
      ],
      lead: ["Bicycle or appliance repair", "Maintenance and facilities work", "Engineering courses", "Helping at a community repair event"],
    },
    {
      title: "Investigate how to diagnose a common problem",
      what: "Good repair starts before any tool comes out. Technicians notice the symptom, guess at a cause, and test the guess. The same reasoning works for a running toilet, a dead charger, or a slow computer.",
      explore: [
        "What’s the difference between a symptom and a cause?",
        "How do experienced people narrow down the possibilities quickly?",
        "When is it safe to try a fix, and when should you stop?",
      ],
      tryIt: [
        ["do", "Pick something around you that isn’t working right. Write the symptom, one possible cause, and one safe check."],
        ["observe", "Watch a free troubleshooting video and note each test they run before replacing anything."],
        ["ask", "Ask someone who fixes things: “How do you figure out what’s wrong before you fix it?”"],
      ],
      lead: ["Automotive, appliance, or computer repair", "IT help desk work", "Troubleshooting skills that help in almost any job"],
      note: "Don’t open anything electrical or plugged in.",
    },
    {
      title: "Explore furniture restoration",
      what: "Restoring furniture means working out how a piece was built, what’s damaged, and how to repair it while keeping its character. It mixes patience, hand skills, and a little history.",
      explore: [
        "How can you tell how a piece was put together?",
        "What’s the difference between restoring, refinishing, and upcycling?",
        "Why do some people choose repair over replacement?",
      ],
      tryIt: [
        ["observe", "Look closely at a chair or table you already have. Are the legs attached with glue, screws, or joints?"],
        ["investigate", "Find a free video or library book on basic wood joints, then spot one at home."],
        ["ask", "Ask at a thrift or secondhand store what happens to furniture that comes in damaged."],
      ],
      lead: ["Woodworking and upholstery", "Secondhand and resale work", "Selling restored pieces", "Volunteering with reuse programs"],
    },
    {
      title: "Discover how electronics are repaired",
      what: "Phones, speakers, and game controllers can often be repaired instead of thrown away: a cracked screen, a worn battery, a loose charging port. Electronics repair combines careful observation with knowing which jobs are safe for a beginner.",
      explore: [
        "Which parts of a device wear out first?",
        "Why are some devices much harder to repair than others? (This is part of the “right to repair” debate.)",
        "What safety risks do batteries and power supplies carry?",
      ],
      tryIt: [
        ["investigate", "Look up a free repair guide for a device you own and see what’s inside. No need to open yours."],
        ["observe", "Watch a repair video for a common problem and note the tools and precautions used."],
        ["ask", "Ask staff at a phone repair counter which repairs they do most."],
      ],
      lead: ["Phone and computer repair", "Electronics courses", "Community repair events", "Right-to-repair advocacy"],
      note: "Don’t open devices with batteries or anything plugged in.",
    },
    {
      title: "Learn what different technical trades involve",
      what: "Electricians, plumbers, heating and cooling technicians, mechanics, and welders solve practical problems every day. Many trades are learned through apprenticeships or programs that combine paid work with training.",
      explore: [
        "What does an ordinary day in a trade actually look like?",
        "How do people enter a trade, and how long does training take?",
        "Which trades involve more problem-solving, physical work, or talking with customers?",
      ],
      tryIt: [
        ["investigate", "Read a free occupation profile for one trade. The U.S. Bureau of Labor Statistics’ Occupational Outlook Handbook describes duties and training."],
        ["ask", "Ask a tradesperson, or someone at a job or workforce center, how people usually get started."],
        ["observe", "Watch a “day in the life” video made by someone in a trade."],
      ],
      lead: ["Apprenticeships", "Community college or workforce programs", "Trade work", "Running a service business someday, if that ever appeals"],
    },
  ],
  design: [
    {
      title: "Make information easier to understand",
      what: "Designers organize words and images so people can find what they need quickly, on signs, forms, menus, and websites. Good design often goes unnoticed. Confusing design gets noticed fast.",
      explore: [
        "What do your eyes land on first, and why?",
        "Why are some forms and signs so confusing?",
        "How do designers test whether something works for real people?",
      ],
      tryIt: [
        ["do", "Take a flyer, bill, or form you already have. Look for five seconds, write what you noticed first, and sketch one improvement."],
        ["observe", "Compare a few signs somewhere you already go. Which one did you understand fastest?"],
        ["ask", "Ask someone who makes flyers for a group or business how they decide what goes at the top."],
      ],
      lead: ["Graphic design", "Communications work", "Helping a community group with its materials", "Design courses"],
    },
    {
      title: "Design a space that works better",
      what: "The way a room, waiting area, or store is arranged shapes how people move, wait, and feel. Interior designers, space planners, and accessibility specialists think about this on purpose.",
      explore: [
        "How does a layout change how people behave?",
        "What makes a space feel welcoming or stressful?",
        "Who is a space easy or hard for: people using wheelchairs, parents with strollers, children?",
      ],
      tryIt: [
        ["observe", "In a public space you already visit, notice where people go, where they wait, and where they get stuck."],
        ["do", "Sketch one room you use and mark one change that would make it easier to use."],
        ["investigate", "Look up “universal design” and find one example around you."],
      ],
      lead: ["Interior design", "Accessibility work", "Event and venue planning", "Facilities or retail operations"],
    },
    {
      title: "Create a learning experience",
      what: "Teaching isn’t only explaining. People who design workshops, museum exhibits, and tutorials think about what learners already know, what they’ll do, and how they’ll practice.",
      explore: [
        "What made a time you learned something actually stick?",
        "Why do hands-on activities help many people learn?",
        "How can you tell whether someone has really understood?",
      ],
      tryIt: [
        ["do", "Teach someone a small thing you know (a recipe step, a card game, a phone shortcut) and notice where they get confused."],
        ["observe", "Watch a free how-to video and note what the teacher does to keep it clear."],
        ["ask", "Ask a teacher, coach, or trainer how they plan a session."],
      ],
      lead: ["Teaching, tutoring, or coaching", "Training roles at work", "Instructional design", "Leading community workshops"],
    },
    {
      title: "Plan an event people enjoy",
      what: "Event design covers the details guests rarely notice: timing, flow, food, accessibility, and how people feel when they arrive and when they leave.",
      explore: [
        "What makes people feel welcome at a gathering?",
        "What usually goes wrong, and how do planners prevent it?",
        "How do events differ when they’re for celebrating, learning, or community?",
      ],
      tryIt: [
        ["observe", "At the next gathering you attend anyway, notice how arrival, seating, and timing were handled."],
        ["do", "Sketch a plan for a small, free gathering: who, where, and what happens first. You don’t need to hold it."],
        ["ask", "Ask someone who organizes events what they always check beforehand."],
      ],
      lead: ["Event coordination", "Hospitality", "Community organizing", "Volunteer coordination"],
    },
    {
      title: "Explore user experience (UX) design",
      what: "UX designers study how people use apps, websites, and services, then make them easier to use. Much of the work is watching real people and asking good questions.",
      explore: [
        "Why do some apps feel easy and others frustrating?",
        "How do designers find out what users actually need?",
        "What’s the difference between what people say they do and what they actually do?",
      ],
      tryIt: [
        ["investigate", "Pick an app you use and list three things that confuse you, and why."],
        ["observe", "With their permission, watch someone use an app or website for a simple task and note where they hesitate."],
        ["ask", "Ask a friend which app they find easiest to use, and why."],
      ],
      lead: ["UX research and design", "Customer support and product feedback roles", "Technology courses", "Improving services at work"],
    },
  ],
  community: [
    {
      title: "Investigate a challenge affecting a neighborhood",
      what: "Every neighborhood has issues people talk about: traffic, trash, a closed store, not enough for kids to do. Investigating one means separating what you’ve heard from what’s actually happening, and who it affects.",
      explore: [
        "Who does this challenge affect most, and how?",
        "What has already been tried?",
        "Who has the responsibility or power to change it?",
      ],
      tryIt: [
        ["observe", "Spend a few minutes noticing the issue firsthand, and write down only what you actually see."],
        ["ask", "Ask two neighbors what they think causes it. Listen for differences."],
        ["investigate", "Check local news or a public meeting agenda (often free online or at the library) for past discussion."],
      ],
      lead: ["Neighborhood associations", "Local government", "Journalism", "Advocacy and nonprofit work"],
    },
    {
      title: "Learn how community organizations operate",
      what: "Food pantries, youth programs, tenant groups, and mutual aid networks run on volunteers, donations, and a lot of coordination. Seeing how they work reveals skills that are useful anywhere.",
      explore: [
        "Where do the money, supplies, and time come from?",
        "Which roles do volunteers fill, and which need paid staff?",
        "How do organizations decide who they serve?",
      ],
      tryIt: [
        ["investigate", "Read the “About” page or annual report of a local organization."],
        ["ask", "Call or message to ask what a first-time volunteer actually does."],
        ["observe", "If it’s open to the public, notice how a distribution or event runs."],
      ],
      lead: ["Volunteering", "Nonprofit work", "Serving on a committee or board", "Starting a small program"],
    },
    {
      title: "Explore organizing a small gathering or activity",
      what: "A walking group, a skill swap, a clean-up morning: small gatherings start with someone deciding to invite people. Organizing builds planning, communication, and follow-through.",
      explore: [
        "What do people around you wish existed?",
        "What’s the smallest version that could work?",
        "What makes people show up, and come back?",
      ],
      tryIt: [
        ["ask", "Ask three people what kind of free gathering they would actually attend."],
        ["investigate", "Find out where free community space exists. Libraries and parks often have rooms or areas."],
        ["do", "Draft a one-paragraph invitation. You don’t have to send it."],
      ],
      lead: ["Community organizing", "Event planning", "Facilitation", "Social enterprise, if that ever appeals"],
    },
    {
      title: "Interview someone involved in a local initiative",
      what: "The people behind local projects (a community garden, a youth league, a free clinic) carry knowledge you won’t find online: how it started, what nearly stopped it, and what they would do differently.",
      explore: [
        "How did the project begin?",
        "What do the people involved actually spend their time on?",
        "What do they wish more people understood?",
      ],
      tryIt: [
        ["investigate", "Read their public page first, so your questions can go deeper."],
        ["ask", "Request a short conversation with someone involved and bring three questions."],
        ["observe", "Attend a public event they hold and notice who takes part."],
      ],
      lead: ["Journalism and storytelling", "Research", "Volunteering", "Getting to know people doing local work"],
    },
    {
      title: "Examine how communities share resources",
      what: "Tool libraries, little free pantries, ride shares, babysitting swaps: communities find many ways to share what they have. Understanding these systems shows how cooperation works in practice.",
      explore: [
        "What do people around you already share informally?",
        "What makes sharing work, and what makes it fall apart?",
        "How do people build enough trust to share?",
      ],
      tryIt: [
        ["observe", "Notice the informal sharing that already happens among neighbors, family, or coworkers."],
        ["investigate", "Look for a tool library, seed library, or sharing group near you and read how it works."],
        ["ask", "Ask an older relative or neighbor how sharing worked where they grew up."],
      ],
      lead: ["Cooperatives and mutual aid", "Community economics", "Sustainability projects", "Starting a sharing project"],
    },
  ],
  nature: [
    {
      title: "Observe plants closely",
      what: "Botany starts with careful looking: leaf shapes, how plants lean toward light, what grows in cracks in the sidewalk. Noticing details is a scientific skill anyone can practice.",
      explore: [
        "Why do plants in the same place look so different?",
        "How do plants respond to light, water, and crowding?",
        "Which plants grow where no one planted them?",
      ],
      tryIt: [
        ["observe", "Look closely at one plant, indoors, outside, or through a window. Write three details and one question."],
        ["investigate", "Use a library field guide or a free plant-identification app to learn its name."],
        ["do", "Sprout a dried bean from your kitchen in a damp paper towel and check it each day."],
      ],
      lead: ["Gardening", "Horticulture and landscaping", "Environmental science", "Community gardens"],
    },
    {
      title: "Watch animal behavior",
      what: "Birds, insects, squirrels, and pets all show patterns: when they eat, how they communicate, how they avoid danger. Animal behavior research begins exactly this way, by watching and recording.",
      explore: [
        "Which patterns repeat at certain times of day?",
        "How do animals communicate with each other?",
        "How do animals adapt to cities and people?",
      ],
      tryIt: [
        ["observe", "Watch birds, insects, or a pet for ten minutes. Write what they do before guessing why."],
        ["investigate", "Look up one behavior you noticed and see what scientists think explains it."],
        ["ask", "Ask a pet owner, farmer, or park worker what animal behavior surprised them."],
      ],
      lead: ["Animal care", "Veterinary or wildlife work", "Citizen science projects", "Nature education"],
    },
    {
      title: "Investigate a local ecosystem",
      what: "A park, a creek, or a vacant lot is an ecosystem: living things connected through food, water, shelter, and soil. Studying one shows how a change in one place ripples through the rest.",
      explore: [
        "What lives here, and what does each thing depend on?",
        "How has this place changed over time?",
        "Which human activities affect it most?",
      ],
      tryIt: [
        ["observe", "In a green space you can reach, or the view from a window, list every living thing you notice in one small area."],
        ["investigate", "Look up the history of that place. What was there fifty years ago?"],
        ["ask", "Ask a longtime resident, gardener, or park worker what has changed."],
      ],
      lead: ["Environmental science", "Conservation and park work", "Urban planning", "Restoration volunteering"],
    },
    {
      title: "Take part in citizen science",
      what: "Ordinary people contribute real data to scientific research by counting birds, recording weather, or noting when plants bloom. Many projects are free and need no experience.",
      explore: [
        "How can observations from many people help scientists?",
        "What makes data trustworthy?",
        "Which questions are researchers trying to answer?",
      ],
      tryIt: [
        ["investigate", "Browse a citizen science directory (for example, SciStarter or iNaturalist) and find a project that fits where you live."],
        ["observe", "Make one careful observation and write it down, whether or not you submit it."],
        ["ask", "Ask a librarian or science teacher whether they know of local projects."],
      ],
      lead: ["Science and research", "Data collection work", "Environmental advocacy", "Teaching science"],
      note: "Some projects use a phone app. Writing observations on paper works too.",
    },
    {
      title: "Explore growing food",
      what: "Growing food, even in a cup on a windowsill, connects you to soil, seasons, and patience. Urban farms and community gardens bring growing into cities.",
      explore: [
        "What do plants need in order to produce food?",
        "How do seasons and local climate shape what grows?",
        "How do community gardens decide who grows what?",
      ],
      tryIt: [
        ["do", "Regrow a green onion or lettuce base in a glass of water on a windowsill."],
        ["observe", "If one is nearby, visit a community garden during open hours and notice what’s planted."],
        ["ask", "Ask someone who gardens what they wish they had known in their first year."],
      ],
      lead: ["Urban agriculture", "Landscaping", "Food access work", "Selling produce or plants"],
    },
  ],
  sound: [
    {
      title: "Explore rhythm",
      what: "Rhythm is the pattern of sounds and silences in time. It’s in music, speech, footsteps, and machines. You don’t need an instrument to explore it.",
      explore: [
        "Why do some rhythms make people want to move?",
        "How do different musical traditions use rhythm?",
        "What happens when you shift where the beat falls?",
      ],
      tryIt: [
        ["do", "Tap the rhythm of a song you know, then change one part of it."],
        ["observe", "Listen for rhythms around you (a washing machine, traffic, rain) and copy one."],
        ["investigate", "Look up one rhythm tradition, such as clave patterns or marching drumline cadences."],
      ],
      lead: ["Drumming and percussion", "Dance", "Music production", "Music therapy, with training"],
    },
    {
      title: "Learn how sound is recorded",
      what: "Recording captures sound so it can be shaped and shared. Podcasters, audio engineers, and musicians all think about microphones, rooms, and background noise.",
      explore: [
        "Why does the same voice sound different in different rooms?",
        "What’s the difference between recording and mixing?",
        "How do people make good recordings at home?",
      ],
      tryIt: [
        ["do", "Record your voice on a phone in two different places, like a closet and a kitchen, and compare them."],
        ["observe", "Watch a free video on home recording basics."],
        ["ask", "Ask someone who makes podcasts or music how they record."],
      ],
      lead: ["Audio engineering", "Podcasting", "Running sound for events or services", "Video production"],
    },
    {
      title: "Explore how songs are written",
      what: "Songwriters combine melody, words, and structure (verse, chorus, bridge). Many begin by humming ideas into a phone long before they touch an instrument.",
      explore: [
        "How do songs repeat ideas without getting boring?",
        "Which comes first for different writers: the words or the melody?",
        "How does a song tell a story?",
      ],
      tryIt: [
        ["investigate", "Pick a song you know and map its structure. Where are the verses and the chorus?"],
        ["do", "Write four lines about something from your week, or hum a short melody."],
        ["ask", "Ask someone who writes songs or poems how they start."],
      ],
      lead: ["Songwriting", "Poetry and spoken word", "Music collaboration", "Worship or community music"],
    },
    {
      title: "Discover the science of sound",
      what: "Sound is vibration traveling through air, water, or solid objects. The science explains why guitars are hollow, why some rooms echo, and how hearing works.",
      explore: [
        "Why do bigger objects usually make lower sounds?",
        "How do echoes and room acoustics work?",
        "How does the ear turn vibration into sound?",
      ],
      tryIt: [
        ["do", "Fill a few glasses with different amounts of water, tap them gently, and compare the pitches."],
        ["observe", "Notice which rooms you spend time in echo, which sound muffled, and what might cause the difference."],
        ["investigate", "Look up why concert halls are shaped the way they are."],
      ],
      lead: ["Acoustics", "Audiology and hearing health", "Instrument making", "Physics and engineering"],
    },
    {
      title: "Explore music in community life",
      what: "Music brings people together in choirs, services, block parties, and cultural celebrations. It carries history and identity from one generation to the next.",
      explore: [
        "What role does music play in your family or culture?",
        "How do community music groups welcome beginners?",
        "How has a style of music changed over time?",
      ],
      tryIt: [
        ["ask", "Ask an older relative or neighbor about the music they grew up with."],
        ["observe", "Go to a free performance, rehearsal, or service where music is part of it."],
        ["investigate", "Look up the history of a style of music you like."],
      ],
      lead: ["Choirs and community bands", "Cultural programming", "Teaching music", "Recording oral histories"],
    },
  ],
  making: [
    {
      title: "Sketch and design objects",
      what: "Most made things start as a sketch. Drawing an object from different angles helps you understand its shape, how it’s built, and how you might change it.",
      explore: [
        "How do designers turn an idea into a plan?",
        "What does drawing help you notice that looking alone doesn’t?",
        "How do small changes affect how useful something is?",
      ],
      tryIt: [
        ["do", "Sketch an everyday object from three angles. Paper and pencil are enough."],
        ["observe", "Watch a free video of a product designer sketching."],
        ["investigate", "Look at one object and work out how many separate parts it’s made from."],
      ],
      lead: ["Product and industrial design", "Drafting", "Art", "Making things to give or sell"],
    },
    {
      title: "Work with fabric and fiber",
      what: "Sewing, mending, knitting, and crochet turn simple materials into useful things. Mending in particular saves money and is a skill passed down in many families.",
      explore: [
        "How are different fabrics made?",
        "Which simple mending repair makes the biggest difference?",
        "How do fiber traditions differ across cultures?",
      ],
      tryIt: [
        ["do", "Sew a loose button back on, or mend a small tear, with a needle and thread you already have."],
        ["observe", "Look closely at the seams of a piece of clothing and work out how it was put together."],
        ["ask", "Ask someone who sews or knits how they learned."],
      ],
      lead: ["Tailoring and alterations", "Fashion and costume work", "Fiber arts", "Teaching a craft"],
    },
    {
      title: "Build with found materials",
      what: "Cardboard, bottles, scraps of wood: people build furniture, toys, models, and art from what others throw away. It’s a low-cost way to practice making and problem-solving.",
      explore: [
        "What can ordinary materials do that you wouldn’t expect?",
        "How do you make something sturdy out of weak materials?",
        "Why do designers build quick rough versions before final ones?",
      ],
      tryIt: [
        ["do", "Build a small object, like a phone stand or a box, from cardboard and tape."],
        ["observe", "Watch a cardboard building or upcycling video."],
        ["investigate", "Find out whether your library or a community center offers free making space or materials."],
      ],
      lead: ["Prototyping", "Set and prop building", "Sustainability work", "Running making activities for kids"],
    },
    {
      title: "Explore woodworking",
      what: "Woodworking ranges from carving a spoon to building cabinets. It teaches measuring, patience, and how materials behave.",
      explore: [
        "How do wood joints hold together without nails?",
        "Why do woodworkers pay attention to grain direction?",
        "Which safety habits do experienced makers never skip?",
      ],
      tryIt: [
        ["observe", "Watch a free beginner woodworking video and list the tools and safety steps."],
        ["ask", "Ask someone who builds things what their first project was."],
        ["investigate", "Find out whether a library, community center, or school offers free shop time or classes."],
      ],
      lead: ["Carpentry", "Furniture and cabinet making", "Construction trades", "Selling handmade work"],
      note: "Use power tools only with instruction and supervision.",
    },
    {
      title: "Learn how makers share and sell their work",
      what: "Some people turn making into a side project: selling at markets, taking custom orders, or teaching workshops. Others make things only for themselves. Both are real outcomes.",
      explore: [
        "What does it take to make something for someone else?",
        "How do makers decide what to charge?",
        "What’s the difference between a hobby and a side business?",
      ],
      tryIt: [
        ["observe", "Visit a free craft fair or market and notice what’s made and how it’s displayed."],
        ["investigate", "Look at how handmade items are described and priced online."],
        ["ask", "Ask a maker how they decided whether to sell their work."],
      ],
      lead: ["A craft business", "Teaching workshops", "Working in a shop or studio", "Keeping making as a personal outlet"],
    },
  ],
  behavior: [
    {
      title: "Explore why people make certain decisions",
      what: "People don’t always choose the way they say they will. Behavioral science studies how habits, emotions, mental shortcuts, and surroundings shape decisions.",
      explore: [
        "Why do people choose differently when the same options are described differently?",
        "How do stress and hurry affect choices?",
        "Why do pre-selected options (defaults) matter so much?",
      ],
      tryIt: [
        ["observe", "Notice which items a store places near the register, and think about why."],
        ["investigate", "Read a short, reputable article on common decision-making biases."],
        ["ask", "Ask two people how they made a recent decision and compare their reasons."],
      ],
      lead: ["Psychology", "Marketing", "Public policy", "Designing better services"],
    },
    {
      title: "Learn what motivates people",
      what: "Motivation is about why people start, keep going, or stop. Researchers distinguish between doing something because you value it and doing it because of pressure or rewards.",
      explore: [
        "What keeps people going when something is hard?",
        "Why do rewards sometimes backfire?",
        "How do coaches, teachers, and supervisors encourage people?",
      ],
      tryIt: [
        ["observe", "Notice what keeps you going on a task you don’t enjoy."],
        ["investigate", "Look up self-determination theory, one well-known theory of motivation, and find the three needs it describes."],
        ["ask", "Ask someone who coaches, teaches, or supervises how they encourage people."],
      ],
      lead: ["Coaching", "Teaching", "Human resources", "Counseling or social work, with training"],
    },
    {
      title: "Investigate how habits develop",
      what: "Habits form when an action repeats in the same situation until it becomes automatic. Understanding cues, routines, and rewards helps explain why habits are hard to start and hard to stop.",
      explore: [
        "What cue starts one of your everyday routines?",
        "Why are some habits easier to build than others?",
        "How do surroundings make habits easier or harder?",
      ],
      tryIt: [
        ["investigate", "Read about how habits form, then observe one everyday routine and name its cue."],
        ["do", "Notice one small routine of your own for three days."],
        ["ask", "Ask someone how they built or broke a habit."],
      ],
      lead: ["Health and wellness work", "Behavioral research", "Product design", "Coaching"],
    },
    {
      title: "Discover what psychology-related roles involve",
      what: "Psychology-related work includes counselors, social workers, researchers, case managers, human resources staff, and peer support specialists. Training paths and daily work vary a lot.",
      explore: [
        "What’s the difference between a psychologist, a counselor, and a social worker?",
        "Which roles involve research, and which involve direct support?",
        "What training does each role require?",
      ],
      tryIt: [
        ["investigate", "Read and compare occupation profiles for two roles. The Bureau of Labor Statistics’ Occupational Outlook Handbook is free."],
        ["ask", "Ask someone in a helping role what a typical day looks like."],
        ["observe", "Watch a “day in the life” video from someone in one of these roles."],
      ],
      lead: ["College or certificate programs", "Peer support work", "Human services", "Research assistant roles"],
    },
    {
      title: "Explore how environments influence behavior",
      what: "Lighting, noise, crowding, and layout change how people act: how fast they walk, how long they stay, how they treat each other. Researchers and designers study this on purpose.",
      explore: [
        "What makes a place feel rushed or relaxed?",
        "Why do some places invite people to stay longer?",
        "How do small changes, like signs or seating, shift behavior?",
      ],
      tryIt: [
        ["observe", "Spend ten minutes in a public place you already visit and note how people move and where they stop."],
        ["do", "Change one thing in your own space (light, layout, or noise) and notice any difference."],
        ["investigate", "Look up one study on how surroundings affect behavior."],
      ],
      lead: ["Environmental psychology", "Architecture and planning", "Retail and hospitality", "Workplace design"],
    },
  ],
  food: [
    {
      title: "Experiment with flavor",
      what: "Cooks balance salt, sourness, sweetness, bitterness, and richness. A small adjustment, like a squeeze of lemon or a pinch of salt, can change a whole dish.",
      explore: [
        "Why can a little salt make sweet things taste sweeter?",
        "How do different cuisines balance flavors?",
        "What happens when you change one ingredient at a time?",
      ],
      tryIt: [
        ["do", "Taste something you’re already making, change one thing (salt, acid, or sweetness), and taste again."],
        ["observe", "Watch a free cooking video and note when the cook tastes and adjusts."],
        ["ask", "Ask a family cook how they know when something tastes right."],
      ],
      lead: ["Cooking and food service", "Recipe development", "Culinary programs", "Food businesses"],
    },
    {
      title: "Explore food traditions and culture",
      what: "Food carries history: migration, trade, family memory, and celebration. Many dishes tell a story about where people came from and what they had to work with.",
      explore: [
        "Which dishes in your family have a story?",
        "How does a dish change when it moves to a new place?",
        "Which foods are tied to particular celebrations?",
      ],
      tryIt: [
        ["ask", "Ask an older relative or neighbor about a dish they grew up with and how it was made."],
        ["investigate", "Research the history of one food you eat often."],
        ["observe", "Visit a market with foods from a culture that’s new to you and notice what’s there."],
      ],
      lead: ["Food writing and history", "Community cookbooks", "Cultural events", "Restaurant work"],
    },
    {
      title: "Discover the science of cooking",
      what: "Cooking is chemistry: heat changes proteins, yeast makes gas, sugar browns. Understanding why a recipe works makes it easier to adapt.",
      explore: [
        "Why does bread rise?",
        "Why does browning add flavor?",
        "What does baking soda actually do?",
      ],
      tryIt: [
        ["do", "Mix a little baking soda with vinegar or lemon juice, then look up how that reaction helps baking."],
        ["investigate", "Look up why onions turn sweet when cooked slowly."],
        ["observe", "Next time you cook, watch closely for the moment food changes color and texture."],
      ],
      lead: ["Food science", "Baking", "Nutrition education", "Teaching science through food"],
    },
    {
      title: "Explore how food reaches people",
      what: "Food travels through farms, trucks, warehouses, stores, pantries, and kitchens. Every step involves people, timing, and decisions about what gets wasted.",
      explore: [
        "How far did something on your table travel?",
        "Why is so much food wasted?",
        "How do food banks and pantries get their supplies?",
      ],
      tryIt: [
        ["investigate", "Pick one food and trace where it most likely came from."],
        ["observe", "Notice how a grocery store rotates or discounts items close to their date."],
        ["ask", "Ask a food pantry volunteer how food arrives and where it goes."],
      ],
      lead: ["Logistics", "Food access and nonprofit work", "Grocery or restaurant operations", "Food policy"],
    },
    {
      title: "Learn what food work involves",
      what: "Food work includes cooks, bakers, caterers, food truck operators, nutrition educators, and inspectors. The pace, skills, and hours vary widely.",
      explore: [
        "What does a shift in a kitchen actually look like?",
        "Which food jobs call for creativity, and which call for precision?",
        "How do people get started with little experience?",
      ],
      tryIt: [
        ["ask", "Ask someone who works in a restaurant, bakery, or cafeteria what surprised them about the work."],
        ["investigate", "Look up what a basic food-handler safety course covers."],
        ["observe", "Watch a “day in the life” video from a cook or baker."],
      ],
      lead: ["Kitchen jobs", "Catering", "Selling food where local rules allow", "Culinary training"],
    },
  ],
  tech: [
    {
      title: "Learn how everyday technology works",
      what: "Phones, Wi-Fi, maps, and microwaves can feel like magic, but each runs on ideas that can be understood. Knowing how they work makes technology less intimidating.",
      explore: [
        "How does your phone know where you are?",
        "How does Wi-Fi send information through the air?",
        "What actually happens when you delete something?",
      ],
      tryIt: [
        ["investigate", "Pick one device you use and look up how it works. Library books and free videos explain this for beginners."],
        ["do", "Explore your phone’s settings and find three things you didn’t know it could do."],
        ["ask", "Ask someone who works with technology what they wish everyone understood."],
      ],
      lead: ["IT support", "Electronics", "Technology courses", "Helping others with technology"],
    },
    {
      title: "Try a little coding",
      what: "Code is a set of instructions a computer follows exactly. Free beginner tools let you make something move or respond within minutes, with no experience.",
      explore: [
        "Why do computers follow instructions exactly, even wrong ones?",
        "What kinds of problems can a few lines of code solve?",
        "Why do programmers spend so much time finding and fixing mistakes?",
      ],
      tryIt: [
        ["do", "Try a free beginner coding activity, such as Scratch or Hour of Code, on a phone, home computer, or library computer."],
        ["observe", "Watch someone explain a simple program step by step."],
        ["ask", "Ask someone who codes how they learned."],
      ],
      lead: ["Software development", "Web design", "Data work", "Automating tasks in any job"],
    },
    {
      title: "Explore how inventions happen",
      what: "Most inventions improve something that already exists. Inventors notice a problem, try versions, and learn from what fails.",
      explore: [
        "What everyday problem annoys you enough to want to fix it?",
        "How many attempts do inventions usually take?",
        "How do inventors protect or share their ideas?",
      ],
      tryIt: [
        ["do", "Pick a small everyday annoyance and sketch two possible fixes."],
        ["investigate", "Read the story behind an everyday invention, like the safety pin, the paper clip, or hook-and-loop fasteners."],
        ["ask", "Ask someone who has improved a tool or process at work how they came up with it."],
      ],
      lead: ["Engineering", "Product design", "Makerspaces", "Entrepreneurship, if that appeals"],
    },
    {
      title: "Investigate artificial intelligence",
      what: "AI tools can write, sort images, and answer questions, but they make mistakes and reflect the data they learned from. Understanding their strengths and limits is becoming a basic skill.",
      explore: [
        "How does an AI tool produce an answer?",
        "Where do AI tools tend to get things wrong?",
        "How are people using AI at work, and what concerns does it raise?",
      ],
      tryIt: [
        ["do", "Ask a free AI tool a question you already know the answer to, and check whether it’s right."],
        ["investigate", "Read a beginner’s explanation of how AI tools learn from data."],
        ["ask", "Ask someone whether AI has changed their work, and how."],
      ],
      lead: ["Technology and data roles", "Teaching digital skills", "Using AI tools in any job", "Ethics and policy discussions"],
    },
    {
      title: "Explore helping people with technology",
      what: "Many people need help with phones, computers, and online forms. Tech support staff, digital navigators, and library technology helpers make technology usable for more people.",
      explore: [
        "What makes technology hard for some people?",
        "How do you explain something technical without jargon?",
        "What is the “digital divide”?",
      ],
      tryIt: [
        ["do", "Help someone with one technology task and notice what confused them."],
        ["observe", "Notice what questions people ask at a library computer area."],
        ["investigate", "Look up whether there are digital navigator or tech help programs in your area."],
      ],
      lead: ["IT help desk work", "Teaching digital skills", "Customer support", "Library and community technology programs"],
    },
  ],
  stories: [
    {
      title: "Explore how stories are structured",
      what: "Many stories share a basic shape: someone wants something, something gets in the way, and something changes. Recognizing that shape helps you tell your own.",
      explore: [
        "What keeps you reading or watching?",
        "How do stories build tension?",
        "How do different cultures tell stories differently?",
      ],
      tryIt: [
        ["investigate", "Map the beginning, turning point, and ending of a movie or show you like."],
        ["do", "Write five sentences telling a small story from your week."],
        ["ask", "Ask someone known for telling good stories how they keep people listening."],
      ],
      lead: ["Writing", "Screenwriting", "Marketing", "Teaching"],
    },
    {
      title: "Explore photography and visual storytelling",
      what: "A photo tells a story through what’s inside the frame and what’s left out. Photographers think about light, angle, and timing.",
      explore: [
        "How does the angle change how a subject feels?",
        "What makes a photo memorable?",
        "How do photojournalists decide what to show?",
      ],
      tryIt: [
        ["do", "Take three photos of the same object from different angles and compare how each one feels. Any phone camera works."],
        ["observe", "Study a news photo and describe the story it tells."],
        ["investigate", "Look up basic composition ideas, such as the rule of thirds."],
      ],
      lead: ["Photography", "Social media work", "Journalism", "Documenting community events"],
    },
    {
      title: "Discover how news is made",
      what: "Journalists gather facts, check sources, and decide what’s important enough to report. Understanding the process helps you judge what you read and hear.",
      explore: [
        "How do reporters check whether information is true?",
        "Why do two outlets cover the same story differently?",
        "What makes a source trustworthy?",
      ],
      tryIt: [
        ["investigate", "Compare how two news sources cover the same story."],
        ["do", "Write a short, factual account of something that happened near you, using only what you saw."],
        ["ask", "Ask someone who works in media how stories get chosen."],
      ],
      lead: ["Journalism", "Community newsletters", "Research", "Teaching media literacy"],
    },
    {
      title: "Explore podcasts and audio storytelling",
      what: "Podcasts tell stories through voice, sound, and conversation. Many started with one person and a phone.",
      explore: [
        "What makes a voice easy to listen to?",
        "How are interviews edited into stories?",
        "How do podcasts find listeners?",
      ],
      tryIt: [
        ["observe", "Listen to one episode and notice how it opens and keeps your attention."],
        ["do", "Record a two-minute story or conversation on your phone, just for yourself."],
        ["investigate", "Look up how a podcast you like is made."],
      ],
      lead: ["Podcasting", "Radio", "Audio editing", "Interviewing and oral history"],
    },
    {
      title: "Preserve family and community stories",
      what: "Oral history records people’s memories in their own words. Families, museums, and community groups use it to keep history that isn’t written down anywhere else.",
      explore: [
        "Whose stories around you haven’t been recorded?",
        "How do you ask questions that bring memories out?",
        "How are oral histories kept and shared respectfully?",
      ],
      tryIt: [
        ["ask", "With their permission, ask a relative or neighbor to tell you about one memory."],
        ["investigate", "Look at an oral history collection. Many libraries share them for free."],
        ["do", "Write down a family story you’ve heard more than once."],
      ],
      lead: ["Library and archive work", "Museum work", "Documentary making", "Community history projects"],
    },
  ],
  systems: [
    {
      title: "Understand how a system works",
      what: "A system is a set of parts that work together: a bus network, a school schedule, a kitchen during a dinner rush. Systems thinking means looking at the connections, not only the pieces.",
      explore: [
        "What happens to the rest when one part changes?",
        "Where do bottlenecks form?",
        "Why do some problems come back after being “fixed”?",
      ],
      tryIt: [
        ["observe", "Pick a system you already use (a bus route, a store checkout, a household routine) and write out its steps."],
        ["investigate", "Find where it slows down and list possible reasons."],
        ["ask", "Ask someone who runs part of a system what causes the most delays."],
      ],
      lead: ["Operations and logistics", "Project management", "Engineering", "Planning"],
    },
    {
      title: "Improve a process",
      what: "Many jobs involve making work smoother: fewer steps, less waiting, fewer mistakes. Process improvement starts with watching how things actually happen, not how they’re supposed to.",
      explore: [
        "Which steps add value, and which are just waiting?",
        "Why do people work around official procedures?",
        "How can you tell whether a change is actually better?",
      ],
      tryIt: [
        ["do", "Time one routine task, change one step, and time it again."],
        ["observe", "Notice where people wait in line somewhere you already go, and why."],
        ["ask", "Ask someone at work which step they would remove if they could."],
      ],
      lead: ["Operations", "Quality improvement", "Management", "Business process roles"],
    },
    {
      title: "Explore how cities are planned",
      what: "City planners help decide where housing, roads, parks, and businesses go. Those decisions shape commutes, safety, and who can afford to live where.",
      explore: [
        "Why are some neighborhoods easy to walk and others not?",
        "How do zoning rules shape a city?",
        "Who gets a say in planning decisions?",
      ],
      tryIt: [
        ["observe", "Notice where sidewalks, bus stops, and stores are, or aren’t, along a route you already travel."],
        ["investigate", "Look up your city’s planning department or zoning map."],
        ["do", "Sketch a simple map of your block and mark one thing you would add or change."],
      ],
      lead: ["Urban planning", "Transportation", "Community advocacy", "Local government"],
    },
    {
      title: "Solve puzzles and logic problems",
      what: "Logic puzzles exercise the same skills used in programming, engineering, and troubleshooting: breaking a problem down, testing ideas, and checking assumptions.",
      explore: [
        "What strategies help when you’re stuck?",
        "How do you know an answer is actually correct?",
        "Why do some people enjoy puzzles that frustrate others?",
      ],
      tryIt: [
        ["do", "Try a free logic puzzle (sudoku, a nonogram, or a riddle) and notice your strategy."],
        ["observe", "Watch someone explain how they solve a puzzle step by step."],
        ["investigate", "Look up the story of a famous historical puzzle."],
      ],
      lead: ["Programming", "Analysis and data work", "Engineering", "Game design"],
    },
    {
      title: "Investigate how money flows",
      what: "Households, small businesses, and governments all track money coming in and going out. Understanding the flow helps people make decisions and spot problems.",
      explore: [
        "Why do prices change?",
        "How do small businesses keep track of their costs?",
        "How do public budgets decide what gets funded?",
      ],
      tryIt: [
        ["investigate", "Pick one product you buy and look up what affects its price."],
        ["ask", "Ask a small business owner which cost surprised them most."],
        ["observe", "Watch a recording of a public budget meeting, or read a one-page summary of a local budget."],
      ],
      lead: ["Bookkeeping and accounting", "Financial coaching", "Nonprofit budgeting", "Running a business, if that appeals"],
    },
  ],
  movement: [
    {
      title: "Explore dance",
      what: "Dance includes many styles: social, cultural, competitive, and freestyle. It combines rhythm, memory, and expression, and can be done alone or with others.",
      explore: [
        "How do different dance traditions use the body?",
        "How do dancers remember choreography?",
        "What role does dance play in celebrations?",
      ],
      tryIt: [
        ["do", "Follow a free beginner dance video at home for a few minutes, at whatever pace suits your body."],
        ["observe", "Watch a dance style you’ve never seen and describe what stands out."],
        ["ask", "Ask someone who dances how they learned."],
      ],
      lead: ["Dance classes", "Teaching", "Performance", "Fitness instruction"],
    },
    {
      title: "Learn how the body moves",
      what: "Kinesiology studies how muscles, bones, and joints work together. It explains posture, strength, injury, and why some movements feel easy and others hard.",
      explore: [
        "Which muscles work together when you walk or lift?",
        "Why does posture affect comfort?",
        "How does the body adapt with practice?",
      ],
      tryIt: [
        ["investigate", "Look up how one joint, such as the knee or shoulder, works."],
        ["observe", "Notice how people move while doing everyday tasks, and what differs between them."],
        ["ask", "Ask a physical therapist, trainer, or coach what people often misunderstand about movement."],
      ],
      lead: ["Physical therapy and athletic training", "Fitness work", "Occupational therapy", "Sports coaching"],
    },
    {
      title: "Explore performance and theater",
      what: "Performing means communicating with an audience through voice, body, and timing. Community theater, improv, and spoken word often welcome beginners.",
      explore: [
        "How do performers handle nerves?",
        "What makes a performance believable?",
        "How does improv teach listening?",
      ],
      tryIt: [
        ["observe", "Watch a free local performance, open mic, or recorded play."],
        ["do", "Read a short poem or monologue aloud to yourself, two different ways."],
        ["ask", "Ask someone who performs how they prepare."],
      ],
      lead: ["Community theater", "Public speaking", "Acting", "Teaching or leading groups"],
    },
    {
      title: "Discover movement for well-being",
      what: "Walking, stretching, tai chi, and yoga are some of the ways people use movement for health, stress relief, and connection. Many communities offer free or low-cost groups.",
      explore: [
        "How does movement affect mood and energy?",
        "Why do group activities help people keep going?",
        "How can movement be adapted for different bodies and abilities?",
      ],
      tryIt: [
        ["do", "Take a short walk or a gentle stretch, and notice how you feel before and after."],
        ["investigate", "Find out what free movement groups exist nearby. Parks and recreation departments often list them."],
        ["ask", "Ask someone who leads a group why people keep coming back."],
      ],
      lead: ["Fitness and wellness instruction", "Recreation programs", "Health coaching", "Community groups"],
      note: "Move within your own limits.",
    },
    {
      title: "Explore sports and coaching",
      what: "Coaching involves teaching skills, building teamwork, and helping people improve. Many youth leagues rely on volunteer coaches.",
      explore: [
        "What makes a good coach?",
        "How do teams build trust?",
        "How do athletes practice in order to improve?",
      ],
      tryIt: [
        ["observe", "Watch a youth or amateur game, in person or recorded, and notice what the coach does."],
        ["ask", "Ask a coach how they plan a practice."],
        ["investigate", "Find out how volunteers get involved with local leagues."],
      ],
      lead: ["Coaching", "Youth programs", "Recreation work", "Sports management"],
    },
  ],
};

export const CATEGORIES = ENCOUNTER_CARDS.map((card) => ({
  id: card.id,
  title: card.title,
  description: card.description,
  icon: card.icon,
  alt: card.alt,
  possibilities: (RAW[card.id] || []).map((item, index) => ({
    ...item,
    id: `${card.id}-${index + 1}`,
    categoryId: card.id,
    tryIt: item.tryIt.map(([method, text]) => ({ method, text })),
  })),
}));

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((category) => [category.id, category]));

const POSSIBILITY_BY_ID = Object.fromEntries(
  CATEGORIES.flatMap((category) => category.possibilities.map((item) => [item.id, item]))
);

export function possibilityById(id) {
  return POSSIBILITY_BY_ID[String(id || "")] || null;
}
