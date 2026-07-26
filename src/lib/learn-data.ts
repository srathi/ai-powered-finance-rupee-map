export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface KeyConcept {
  icon: string;
  title: string;
  description: string;
}

export interface ContentBlock {
  type: "story" | "concept" | "fun-fact" | "activity";
  title?: string;
  body: string;
}

export interface Lesson {
  slug: string;
  title: string;
  number: number;
  objectives: string[];
  content: ContentBlock[];
  concepts: KeyConcept[];
  quiz: QuizQuestion[];
}

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  ageRange: string;
  emoji: string;
  color: string;
  badgeName: string;
  lessons: Lesson[];
}

export const courses: Course[] = [
  {
    slug: "money-basics",
    title: "Money Basics",
    subtitle: "How money works — saving, spending, banks, and compounding",
    ageRange: "Ages 5–10",
    emoji: "🐷",
    color: "from-amber-500/20 to-orange-500/20",
    badgeName: "Money Basics Champion",
    lessons: [
      {
        slug: "what-is-money",
        title: "What is Money?",
        number: 1,
        objectives: [
          "Understand why people invented money",
          "Spot different forms of money: coins, notes, and digital",
          "Learn the three jobs money does",
        ],
        content: [
          {
            type: "story",
            title: "A Long, Long Time Ago…",
            body: "Before money existed, people had to *trade* things. If Aanya had extra mangoes and wanted a football, she had to find someone who had a football AND wanted mangoes. Tricky, right?\n\nTo make life easier, humans invented **money** — something almost everyone agrees has value. Now Aanya could sell her mangoes for money, then use that money to buy a football. Easy!",
          },
          {
            type: "story",
            title: "Money in Different Shapes",
            body: "Today, money comes in three shapes:\n\n🪙 **Coins** — round metal money (like ₹1, ₹2, ₹5, ₹10)\n📄 **Paper notes** — colourful paper money (like ₹10, ₹20, ₹50, ₹100, ₹500)\n📱 **Digital money** — money that lives in your phone (UPI, bank apps)\n\nThey all do the same job — let people trade without swapping stuff!",
          },
          {
            type: "fun-fact",
            title: "Did You Know?",
            body: "The ₹500 note has Mahatma Gandhi on it. The ₹10 coin has the Lion Capital of Ashoka — India's national emblem. Every note has a different colour so you can tell them apart quickly!",
          },
        ],
        concepts: [
          {
            icon: "🛒",
            title: "It Pays for Things",
            description: "You give money, you get stuff. That's the basic deal!",
          },
          {
            icon: "🏦",
            title: "It Stores Value",
            description: "Keep your money safe today, spend it next month or next year.",
          },
          {
            icon: "📏",
            title: "It Measures Value",
            description: "A pencil costs ₹10, a bicycle costs ₹5,000 — so a bicycle is worth 500 pencils!",
          },
        ],
        quiz: [
          {
            question: "Why did people invent money?",
            options: [
              "To make shops colourful",
              "To make swapping things easier",
              "So wallets could be popular",
              "Because trees stopped growing",
            ],
            correctIndex: 1,
            explanation: "Money made trading much easier! Instead of finding someone who has exactly what you want AND wants what you have, you just use money.",
          },
          {
            question: "Which of these is NOT one of the three jobs of money?",
            options: [
              "It pays for things",
              "It stores value",
              "It cooks your dinner",
              "It measures value",
            ],
            correctIndex: 2,
            explanation: "Money can't cook! But it does three important jobs: paying for things, storing value, and measuring how much something is worth.",
          },
          {
            question: "Which of these is digital money?",
            options: [
              "A ₹10 coin",
              "A ₹500 note",
              "Money in a UPI app",
              "A chocolate wrapper",
            ],
            correctIndex: 2,
            explanation: "Digital money lives on your phone or computer — like UPI payments, PhonePe, Google Pay, or bank apps. It's still real money, just not paper or coins!",
          },
          {
            question: "What does 'stores value' mean?",
            options: [
              "Money can hold flowers",
              "You can save money now and spend it later",
              "Money can keep your food fresh",
              "Money grows on trees",
            ],
            correctIndex: 1,
            explanation: "Money stores value means if you don't spend it today, you can save it and use it tomorrow, next week, or even next year!",
          },
        ],
      },
      {
        slug: "saving-vs-spending",
        title: "Saving vs Spending",
        number: 2,
        objectives: [
          "Learn the difference between saving and spending",
          "Understand why saving is important",
          "Discover fun ways to save money",
        ],
        content: [
          {
            type: "story",
            title: "Aanya's Pocket Money Dilemma",
            body: "Every Saturday, Aanya gets ₹100 as pocket money. She loves buying stickers, ice cream, and small toys. But she also wants a ₹500 art kit.\n\nIf she spends all ₹100 every week, she'll never have enough for the art kit. But if she saves ₹50 each week, after 10 weeks — that's ₹500!\n\n**Saving** means keeping money for later instead of spending it right now. **Spending** means using money to buy things.",
          },
          {
            type: "story",
            title: "The Piggy Bank Power",
            body: "Aanya's grandma gave her a piggy bank 🐷. Every time Aanya saved money, she dropped it in. After a few weeks, it was heavy and full!\n\nThe fun part? She could shake it and hear the coins clinking. That sound meant she was getting closer to her art kit.\n\n**Tip:** You don't need a real piggy bank. A jar, a box, or even an envelope can work!",
          },
          {
            type: "fun-fact",
            title: "The 50-30-20 Rule",
            body: "Some grown-ups use a simple rule for their money:\n\n• **50%** for things they *need* (food, rent, school fees)\n• **30%** for things they *want* (toys, movies, treats)\n• **20%** for *saving* (for big goals or emergencies)\n\nYou can try a kid version: save at least ₹10 out of every ₹50 you get!",
          },
        ],
        concepts: [
          {
            icon: "🐷",
            title: "Saving = Growing",
            description: "Every coin you save is a step closer to something bigger you really want.",
          },
          {
            icon: "🛒",
            title: "Spending = Enjoying",
            description: "Spending is fine! Just make sure you're buying things that really matter to you.",
          },
          {
            icon: "⚖️",
            title: "Balance is Key",
            description: "Save too much and you never have fun. Spend too much and you never reach big goals.",
          },
        ],
        quiz: [
          {
            question: "Aanya gets ₹100 per week. If she saves ₹50 each week, how much will she have after 6 weeks?",
            options: ["₹200", "₹300", "₹500", "₹600"],
            correctIndex: 1,
            explanation: "₹50 × 6 weeks = ₹300! That's almost enough for her art kit.",
          },
          {
            question: "What is the main difference between saving and spending?",
            options: [
              "Saving is for rich people only",
              "Spending is always bad",
              "Saving keeps money for later, spending uses it now",
              "They are the same thing",
            ],
            correctIndex: 2,
            explanation: "Saving means keeping money for the future. Spending means using it right now. Both are important!",
          },
          {
            question: "Which of these is a good way to save?",
            options: [
              "Spending all your money at once",
              "Putting coins in a piggy bank",
              "Lending money to everyone",
              "Throwing money away",
            ],
            correctIndex: 1,
            explanation: "A piggy bank, jar, or box is a great way to save! You can watch your money grow over time.",
          },
          {
            question: "In the 50-30-20 rule, what percentage should you save?",
            options: ["50%", "30%", "20%", "10%"],
            correctIndex: 2,
            explanation: "The 50-30-20 rule says save 20% of your money. That's 20 paise out of every rupee!",
          },
        ],
      },
      {
        slug: "how-banks-work",
        title: "How do Banks Work?",
        number: 3,
        objectives: [
          "Learn what a bank does with your money",
          "Understand why banks are safe places to keep money",
          "Discover how banks earn money",
        ],
        content: [
          {
            type: "story",
            title: "Kabir's Bank Visit",
            body: "Kabir went to the bank with his dad. He saw a big building with counters, computers, and a safe door that looked like a movie vault.\n\n\"Where does my money go?\" Kabir asked.\n\nHis dad smiled. \"When you deposit money in a bank, the bank keeps it safe for you. And here's the cool part — the bank also *lends* some of that money to other people. Those people pay the bank back with a little extra called **interest**.\"\n\n\"So my money helps other people?\" Kabir asked.\n\n\"Yes! And the bank pays YOU a little extra too for letting them hold your money.\"",
          },
          {
            type: "story",
            title: "Why Keep Money in a Bank?",
            body: "Imagine keeping ₹5,000 under your mattress. What could happen?\n\n🐕 Your dog might chew it\n💧 It could get wet and ruined\n🔥 There could be a fire\n😴 You might forget where you put it\n\nBut in a bank? It's locked in a vault, counted carefully, and protected. Plus, banks in India are regulated by the **RBI** (Reserve Bank of India) — the boss of all banks!",
          },
          {
            type: "fun-fact",
            title: "India's RBI",
            body: "The Reserve Bank of India (RBI) makes sure all banks play fair. If a bank goes broke, there's a special rule that protects your money up to ₹5,00,000! That's why banks are the safest place to keep your savings.",
          },
        ],
        concepts: [
          {
            icon: "🏦",
            title: "Deposits",
            description: "You put money in the bank. They keep it safe and give you a passbook or app to track it.",
          },
          {
            icon: "💰",
            title: "Interest",
            description: "The bank pays you a small reward for keeping your money with them. Your money grows!",
          },
          {
            icon: "🔒",
            title: "Safety",
            description: "Banks have vaults, guards, and RBI rules to protect your money from theft or loss.",
          },
        ],
        quiz: [
          {
            question: "What does a bank do with the money you deposit?",
            options: [
              "Eats it",
              "Keeps it safe and lends some to others",
              "Throws it in the river",
              "Burns it",
            ],
            correctIndex: 1,
            explanation: "Banks keep your money safe AND lend some of it to other people (like someone buying a house). The borrowers pay the bank back with interest.",
          },
          {
            question: "What is 'interest'?",
            options: [
              "A type of bank building",
              "Money the bank pays you for keeping your savings there",
              "A bank employee",
              "A type of coin",
            ],
            correctIndex: 1,
            explanation: "Interest is a small reward the bank gives you for letting them hold your money. It's like rent — but instead of charging you, they pay YOU!",
          },
          {
            question: "Why is a bank safer than keeping money under your bed?",
            options: [
              "Banks have more colourful walls",
              "Banks have vaults, guards, and RBI protection",
              "Banks give you free toys",
              "Banks are closer to your house",
            ],
            correctIndex: 1,
            explanation: "Banks have thick vault doors, security guards, and are protected by the RBI. Your money is much safer there than at home!",
          },
          {
            question: "What does RBI stand for?",
            options: [
              "Really Big India",
              "Reserve Bank of India",
              "Rupee Bank Interest",
              "Royal Banking Institution",
            ],
            correctIndex: 1,
            explanation: "RBI = Reserve Bank of India. It's the boss of all banks in India and makes sure they follow the rules to keep your money safe!",
          },
        ],
      },
      {
        slug: "magic-of-compounding",
        title: "The Magic of Compounding",
        number: 4,
        objectives: [
          "Understand how compounding makes money grow faster",
          "Learn the chessboard rice grains story",
          "See why starting early matters",
        ],
        content: [
          {
            type: "story",
            title: "The Chessboard Rice Story",
            body: "A long time ago, a smart mathematician invented chess. The king was so impressed that he said, \"Name your reward!\"\n\nThe mathematician said, \"Just give me rice. Put 1 grain on the first square of the chessboard, 2 on the second, 4 on the third, 8 on the fourth — doubling each time.\"\n\nThe king laughed — that seemed like a tiny amount! But by the time he reached the 20th square, he needed over a million grains. By square 64, he'd need more rice than exists in the whole world!\n\nThat's the power of **compounding** — when your money grows, and then the growth grows too!",
          },
          {
            type: "story",
            title: "Money Compounding Example",
            body: "Let's say you put ₹100 in a bank that pays 10% interest each year.\n\n**Year 1:** ₹100 + ₹10 = ₹110\n**Year 2:** ₹110 + ₹11 = ₹121\n**Year 3:** ₹121 + ₹12.10 = ₹133.10\n\nSee what happened? In Year 2, you earned ₹11 instead of ₹10 — because you earned interest on your interest too!\n\nAfter 10 years, your ₹100 becomes ₹259. After 20 years, it becomes ₹673. After 30 years? ₹1,745! Your money grew 17x without doing anything extra!",
          },
          {
            type: "fun-fact",
            title: "The Early Bird Wins!",
            body: "Riya starts saving ₹100/month at age 10. Rohan starts saving ₹200/month at age 20. Both stop at age 60.\n\nRiya invested for 50 years. Rohan invested for 40 years.\n\nEven though Rohan saved TWICE as much per month, Riya ends up with MORE money because she started earlier and let compounding work longer!",
          },
        ],
        concepts: [
          {
            icon: "🌱",
            title: "Plant a Seed",
            description: "Your initial money is like a seed. Interest is like water and sunlight — it helps it grow.",
          },
          {
            icon: "🔄",
            title: "Growth on Growth",
            description: "After a while, you earn interest on your interest. That's what makes it magical!",
          },
          {
            icon: "⏰",
            title: "Time is Power",
            description: "The longer you wait, the more compounding works. Starting early is the biggest advantage.",
          },
        ],
        quiz: [
          {
            question: "You put ₹100 in a bank at 10% interest. How much do you have after 2 years?",
            options: ["₹110", "₹120", "₹121", "₹130"],
            correctIndex: 2,
            explanation: "Year 1: ₹100 + ₹10 = ₹110. Year 2: ₹110 + ₹11 = ₹121. You earned ₹11 in Year 2 because you earned interest on your interest!",
          },
          {
            question: "What makes compounding so powerful?",
            options: [
              "Banks give free gifts",
              "You earn interest on your interest",
              "Money gets heavier",
              "You get more banknotes",
            ],
            correctIndex: 1,
            explanation: "Compounding means you earn interest not just on your original money, but also on the interest you've already earned. It snowballs!",
          },
          {
            question: "Who will likely have more money at age 60?",
            options: [
              "Riya, who starts saving ₹100/month at age 10",
              "Rohan, who starts saving ₹200/month at age 20",
              "Both will have the same amount",
              "Neither will have any money",
            ],
            correctIndex: 0,
            explanation: "Riya! Even though she saves less per month, she started 10 years earlier. Those extra years of compounding make a HUGE difference.",
          },
          {
            question: "In the chessboard story, what happened to the rice amount?",
            options: [
              "It stayed the same",
              "It decreased each square",
              "It doubled each square",
              "It tripled each square",
            ],
            correctIndex: 2,
            explanation: "The rice doubled on each square — 1, 2, 4, 8, 16, 32… By the end, it was more rice than exists in the world! That's compounding in action.",
          },
        ],
      },
      {
        slug: "goals-and-plans",
        title: "Goals and Making Plans",
        number: 5,
        objectives: [
          "Learn how to set a savings goal",
          "Break big goals into small steps",
          "Make a simple saving plan",
        ],
        content: [
          {
            type: "story",
            title: "Kabir's Bicycle Dream",
            body: "Kabir wants a bicycle. A really cool one — it costs ₹3,000.\n\nHe gets ₹200 pocket money each month. If he spends it all, he'll never get the bicycle. But if he makes a plan?\n\n**Step 1:** Set the goal — ₹3,000 for the bicycle\n**Step 2:** Check the timeline — save ₹150/month → 20 months\n**Step 3:** Cut small things — skip one ice cream per month (saves ₹20), skip one movie (saves ₹50)\n**Step 4:** Track progress — draw a thermometer chart and colour it as you save!\n\nNow Kabir has a plan. He knows exactly how long it will take and what he needs to do.",
          },
          {
            type: "story",
            title: "The Goal Thermometer",
            body: "Draw a big thermometer on paper. Write ₹3,000 at the top and ₹0 at the bottom. Divide it into sections of ₹300 each.\n\nEvery time you save ₹300, colour in one section! Watching the thermometer fill up feels amazing.\n\n**Pro tip:** Put the thermometer on your wall where you see it every day. It keeps you motivated!",
          },
          {
            type: "fun-fact",
            title: "S.M.A.R.T. Goals",
            body: "Grown-ups use a trick called S.M.A.R.T. goals:\n\n**S** — Specific (\"I want a bicycle\" not \"I want stuff\")\n**M** — Measurable (\"₹3,000\" not \"a lot\")\n**A** — Achievable (can you actually save that much?)\n**R** — Realistic (do you need it?)\n**T** — Time-bound (\"in 20 months\" not \"someday\")\n\nYou can use this for anything — a bicycle, a game, a trip, or even a charity donation!",
          },
        ],
        concepts: [
          {
            icon: "🎯",
            title: "Pick Your Goal",
            description: "Choose something specific you really want. Write it down and put a price on it.",
          },
          {
            icon: "📐",
            title: "Break It Down",
            description: "Big goals feel scary. Break them into small monthly or weekly savings targets.",
          },
          {
            icon: "📊",
            title: "Track Progress",
            description: "Use a thermometer chart, jar, or app to see how close you are. It keeps you going!",
          },
        ],
        quiz: [
          {
            question: "Kabir wants a ₹3,000 bicycle and saves ₹150/month. How long will it take?",
            options: ["10 months", "15 months", "20 months", "30 months"],
            correctIndex: 2,
            explanation: "₹3,000 ÷ ₹150 per month = 20 months. That's less than 2 years of patient saving!",
          },
          {
            question: "What is a 'goal thermometer'?",
            options: [
              "A thermometer that measures your body temperature",
              "A chart that shows how close you are to your savings goal",
              "A type of bank account",
              "A special kind of money",
            ],
            correctIndex: 1,
            explanation: "A goal thermometer is a drawing you colour in as you save. It shows your progress visually and keeps you motivated!",
          },
          {
            question: "What does S.M.A.R.T. stand for in goal setting?",
            options: [
              "Simple, Moving, Awesome, Ready, Timely",
              "Specific, Measurable, Achievable, Realistic, Time-bound",
              "Smart, Money, Account, Record, Track",
              "Saving, Managing, Allocating, Returning, Transferring",
            ],
            correctIndex: 1,
            explanation: "S.M.A.R.T. = Specific, Measurable, Achievable, Realistic, Time-bound. It helps you set goals you can actually reach!",
          },
          {
            question: "Why is breaking a big goal into small steps helpful?",
            options: [
              "It makes the goal cheaper",
              "It feels less scary and easier to start",
              "It means you don't have to save",
              "Banks require it",
            ],
            correctIndex: 1,
            explanation: "\"Save ₹3,000\" sounds scary. \"Save ₹150 this month\" sounds totally doable! Small steps make big goals achievable.",
          },
        ],
      },
    ],
  },
  {
    slug: "smart-money-habits",
    title: "Smart Money Habits",
    subtitle: "Budgeting, shopping, sharing, and staying safe with digital money",
    ageRange: "Ages 8–12",
    emoji: "🧠",
    color: "from-emerald-500/20 to-teal-500/20",
    badgeName: "Smart Spender Badge",
    lessons: [
      {
        slug: "needs-vs-wants",
        title: "Needs vs Wants",
        number: 1,
        objectives: [
          "Tell the difference between needs and wants",
          "Learn to prioritise spending",
          "Understand that both needs and wants are okay",
        ],
        content: [
          {
            type: "story",
            title: "The School Canteen Test",
            body: "It's lunchtime at school. Aanya has ₹50. She's hungry.\n\nIn the canteen, she sees:\n🍎 An apple — ₹10 (she needs food!)\n🍫 A chocolate bar — ₹20 (she wants it!)\n🥤 A cold drink — ₹15 (she wants it too!)\n🥪 A sandwich — ₹25 (she needs lunch!)\n\nIf she buys the apple + sandwich, she eats well for ₹35 and saves ₹15. If she buys chocolate + cold drink, she's still hungry AND has only ₹15 left.\n\n**Needs** are things you MUST have (food, water, clothes, shelter). **Wants** are things you'd LIKE to have (toys, treats, games).",
          },
          {
            type: "story",
            title: "The Two Jars Trick",
            body: "Aanya labels two jars:\n**Jar 1: NEEDS** (coloured blue)\n**Jar 2: WANTS** (coloured pink)\n\nEvery time she gets pocket money, she puts ₹30 in the Needs jar and ₹20 in the Wants jar. When she needs school supplies or a warm jacket, she uses the blue jar. For movies or treats, she uses the pink jar.\n\nThis way, she never runs out of money for important things!",
          },
          {
            type: "fun-fact",
            title: "Tricky Wants",
            body: "Sometimes things FEEL like needs but are actually wants.\n\n• \"I NEED the latest phone\" — nope, that's a want. Your old phone still works!\n• \"I NEED new shoes\" — yes, if your old ones are torn\n• \"I NEED ice cream\" — nope, that's definitely a want!\n\nThe trick is to ask: \"What happens if I DON'T get this?\" If nothing bad happens, it's a want.",
          },
        ],
        concepts: [
          {
            icon: "🍞",
            title: "Needs = Must-Haves",
            description: "Food, water, clothes, shelter, school fees. You can't live without these!",
          },
          {
            icon: "🎮",
            title: "Wants = Nice-to-Haves",
            description: "Toys, treats, gadgets, outings. They're fun but not essential for survival.",
          },
          {
            icon: "⚖️",
            title: "Both Are Okay",
            description: "You don't have to cut out all wants. Just make sure needs are covered first!",
          },
        ],
        quiz: [
          {
            question: "You have ₹100 and need a school notebook (₹40) and want a comic book (₹60). What should you buy first?",
            options: [
              "Comic book — it's more fun",
              "School notebook — it's a need",
              "Buy both",
              "Buy neither",
            ],
            correctIndex: 1,
            explanation: "The notebook is a need (you need it for school). If you have money left after that, you can consider the comic book!",
          },
          {
            question: "Which of these is a WANT?",
            options: [
              "A winter jacket when it's cold",
              "A smartphone game",
              "Lunch at school",
              "Water to drink",
            ],
            correctIndex: 1,
            explanation: "A smartphone game is a want — it's fun but not necessary for survival. The jacket (if cold), lunch, and water are all needs!",
          },
          {
            question: "\"I NEED the latest PlayStation\" — is this a need or a want?",
            options: [
              "Need — everyone has one",
              "Want — your old console still works",
              "Need — games are important",
              "Neither — it's a waste",
            ],
            correctIndex: 1,
            explanation: "It's a want! Ask yourself: \"What happens if I don't get it?\" If you can still play games, watch movies, and have fun, it's a want.",
          },
          {
            question: "What is the 'Two Jars Trick'?",
            options: [
              "A way to cook food",
              "A method to sort money into needs and wants",
              "A game you play at school",
              "A type of bank account",
            ],
            correctIndex: 1,
            explanation: "Label two jars — one for needs, one for wants. Every time you get money, split it between them. This way you always have money for important things!",
          },
        ],
      },
      {
        slug: "budgeting-pocket-money",
        title: "Budgeting Your Pocket Money",
        number: 2,
        objectives: [
          "Learn what a budget is",
          "Track where your money goes",
          "Make a simple weekly budget",
        ],
        content: [
          {
            type: "story",
            title: "Where Did My Money Go?",
            body: "Kabir gets ₹200 every week. By Friday, it's always gone. He can't figure out where!\n\nAanya suggests: \"Let's write down every rupee you spend this week.\"\n\n**Monday:** Canteen snack — ₹30\n**Tuesday:** Stickers — ₹20\n**Wednesday:** Bus fare — ₹10, Chips — ₹15\n**Thursday:** Pen — ₹10, Chocolate — ₹15\n**Friday:** Ice cream — ₹25, Pencil — ₹10\n\n**Total spent: ₹135**\n**Money left: ₹65**\n\nWait — Kabir thought he spent everything, but he actually has ₹65 left! The problem wasn't spending — it was *not knowing* where the money went.",
          },
          {
            type: "story",
            title: "The Envelope Method",
            body: "Aanya shows Kabir a cool trick:\n\nOn Saturday (pocket money day), Kabir writes on 5 envelopes:\n\n🍽️ **Canteen food** — ₹80\n🚌 **Transport** — ₹30\n🎨 **School supplies** — ₹30\n🎮 **Fun stuff** — ₹40\n💾 **Savings** — ₹20\n\nEvery time he spends, he takes money from the right envelope. When an envelope is empty, he stops spending in that category!\n\nBy the end of the week, he knows EXACTLY where every rupee went.",
          },
          {
            type: "fun-fact",
            title: "The 30-Day Rule",
            body: "Want something expensive? Wait 30 days before buying it.\n\nIf after 30 days you still want it AND you have the money — go for it!\n\nMost of the time, you'll realize you don't actually want it that much anymore. This simple trick saves grown-ups (and kids!) from a LOT of impulse purchases.",
          },
        ],
        concepts: [
          {
            icon: "📝",
            title: "Track Everything",
            description: "Write down every rupee you spend. You'll be surprised where it goes!",
          },
          {
            icon: "✉️",
            title: "Envelope Method",
            description: "Put money in envelopes labelled by category. When it's empty, stop spending in that area.",
          },
          {
            icon: "📅",
            title: "30-Day Rule",
            description: "Want something? Wait 30 days. If you still want it, buy it. Most wants fade away!",
          },
        ],
        quiz: [
          {
            question: "Kabir spent ₹135 out of ₹200. How much was left?",
            options: ["₹55", "₹65", "₹75", "₹85"],
            correctIndex: 1,
            explanation: "₹200 - ₹135 = ₹65! Kabir actually had money left over — he just didn't know where it went because he wasn't tracking.",
          },
          {
            question: "What is the envelope method?",
            options: [
              "A way to send money by post",
              "Putting money in labelled envelopes to control spending",
              "A type of bank account",
              "A way to hide money from friends",
            ],
            correctIndex: 1,
            explanation: "Label envelopes by category (food, fun, savings), put money in each one. When an envelope is empty, you can't spend more in that category!",
          },
          {
            question: "You want a ₹500 game. What does the 30-day rule suggest?",
            options: [
              "Buy it immediately",
              "Wait 30 days, then decide if you still want it",
              "Ask your friends to buy it",
              "Forget about it forever",
            ],
            correctIndex: 1,
            explanation: "Wait 30 days! If you still want it after a month AND have the money, go for it. Most wants fade away in a few days.",
          },
          {
            question: "Why is tracking your spending important?",
            options: [
              "It makes you famous",
              "It helps you see where your money goes",
              "It's required by law",
              "It makes money grow faster",
            ],
            correctIndex: 1,
            explanation: "When you write down every purchase, you see patterns — maybe you spend too much on snacks and not enough on savings!",
          },
        ],
      },
      {
        slug: "sharing-and-giving",
        title: "Sharing and Giving Back",
        number: 3,
        objectives: [
          "Learn why sharing money feels good",
          "Understand charity and helping others",
          "Make a plan to give a little",
        ],
        content: [
          {
            type: "story",
            title: "Aanya's Charity Jar",
            body: "Aanya noticed something at school — her friend Priya didn't always have lunch. Priya's family was going through a tough time.\n\nAanya felt bad. She wanted to help, but she was just a kid with pocket money. What could she do?\n\nHer mom said, \"You don't need to be rich to give. Even ₹5 a day can buy someone a meal.\"\n\nSo Aanya started a **giving jar**. Every week, she put ₹10 in it. After a month, she had ₹40 — enough to buy Priya lunch for a whole week!",
          },
          {
            type: "story",
            title: "The Joy of Giving",
            body: "When Aanya bought Priya lunch, something amazing happened. Priya smiled. And Aanya felt something warm in her heart.\n\n\"It felt better to give than to buy myself something,\" Aanya told her mom.\n\nThat's the secret of giving — it makes BOTH people happy. The person receiving help feels cared for, and the person giving feels proud and kind.\n\nEven small acts count:\n• Donate old books to a library\n• Give ₹10 to a food bank\n• Help a younger student with homework (that's giving your time!)",
          },
          {
            type: "fun-fact",
            title: "Giving in India",
            body: "India has a long tradition of giving. It's called **daan** (दान) in Hindi.\n\nIn ancient India, kings and common people alike would give food, clothes, and money to those in need. Many temples and gurudwaras still serve free meals every day — that's called **langar**.\n\nEven today, India is one of the most generous countries in the world. People give during festivals, disasters, and just because they want to help!",
          },
        ],
        concepts: [
          {
            icon: "💝",
            title: "Small Acts Matter",
            description: "You don't need millions to help. ₹5, a book, or even a smile can change someone's day.",
          },
          {
            icon: "😊",
            title: "Giving Feels Good",
            description: "Science shows that giving to others makes YOU happier too. It's a win-win!",
          },
          {
            icon: "🌏",
            title: "India's Giving Tradition",
            description: "From daan to langar, India has always valued sharing with those in need.",
          },
        ],
        quiz: [
          {
            question: "Why did Aanya start a giving jar?",
            options: [
              "Her mom told her to",
              "She wanted to help her friend Priya",
              "She wanted to be famous",
              "She had too much money",
            ],
            correctIndex: 1,
            explanation: "Aanya saw her friend Priya struggling and wanted to help. Even though she was just a kid with pocket money, she found a way to make a difference!",
          },
          {
            question: "What is 'daan'?",
            options: [
              "A type of bank account",
              "The Indian tradition of giving to those in need",
              "A festival of lights",
              "A kind of food",
            ],
            correctIndex: 1,
            explanation: "Daan (दान) means giving or charity. It's a beautiful Indian tradition of sharing with people who need help.",
          },
          {
            question: "Aanya gave ₹10/week for 4 weeks. How much did she donate?",
            options: ["₹10", "₹20", "₹30", "₹40"],
            correctIndex: 3,
            explanation: "₹10 × 4 weeks = ₹40. That's enough for a week of school lunches for Priya!",
          },
          {
            question: "What is 'langar'?",
            options: [
              "A type of savings account",
              "Free meals served at gurudwaras for everyone",
              "A charity school",
              "A Indian festival",
            ],
            correctIndex: 1,
            explanation: "Langar is the tradition of serving free meals at gurudwaras. Everyone is welcome — rich or poor, young or old!",
          },
        ],
      },
      {
        slug: "shopping-smart",
        title: "Shopping Smart",
        number: 4,
        objectives: [
          "Learn to compare prices before buying",
          "Understand what 'value for money' means",
          "Spot impulse buys and avoid them",
        ],
        content: [
          {
            type: "story",
            title: "The Great Chip Comparison",
            body: "Kabir wants to buy chips. At the shop, he sees:\n\n🅰️ Brand A: ₹20 for 50g\n🅱️ Brand B: ₹15 for 40g\n🅲 Brand C: ₹30 for 100g\n\nWhich is the best deal? Let's do the math:\n\n• Brand A: ₹20 ÷ 50g = ₹0.40 per gram\n• Brand B: ₹15 ÷ 40g = ₹0.375 per gram\n• Brand C: ₹30 ÷ 100g = ₹0.30 per gram\n\nBrand C gives you the most chips for your money! This is called **unit pricing** — comparing the cost per gram, per piece, or per litre.",
          },
          {
            type: "story",
            title: "The Impulse Trap",
            body: "At the checkout counter, there are chocolates, small toys, and stickers. Kabir didn't plan to buy any of these, but they look so tempting!\n\nThis is called an **impulse buy** — buying something you didn't plan to buy, just because it caught your eye.\n\nShops put these items near the checkout on purpose! They know kids will grab them.\n\n**The trick:** Before buying anything not on your list, ask yourself:\n1. Do I really need this?\n2. Would I still want it tomorrow?\n3. Is there something better I could buy with this money?",
          },
          {
            type: "fun-fact",
            title: "The 10-for-10 Rule",
            body: "Before you buy something, ask: \"Is this worth 10 of something else?\"\n\nA ₹50 toy is worth 5 ice creams, or 2 comic books, or 10 pencils. Is the toy REALLY better than all those?\n\nSometimes yes! Sometimes no! But at least you're making a conscious choice instead of buying on impulse.",
          },
        ],
        concepts: [
          {
            icon: "🔍",
            title: "Unit Pricing",
            description: "Compare cost per gram, per piece, or per litre. The bigger pack isn't always cheaper!",
          },
          {
            icon: "⚡",
            title: "Impulse Buys",
            description: "Those items near the checkout? They're placed there to tempt you. Stick to your list!",
          },
          {
            icon: "🤔",
            title: "Think Before You Buy",
            description: "Ask: Do I need it? Would I want it tomorrow? Is there something better to spend on?",
          },
        ],
        quiz: [
          {
            question: "Brand A: ₹20/50g, Brand B: ₹15/40g, Brand C: ₹30/100g. Which is the best value?",
            options: ["Brand A", "Brand B", "Brand C", "They're all the same"],
            correctIndex: 2,
            explanation: "Brand C costs ₹0.30 per gram — the cheapest! Always compare unit prices, not just the sticker price.",
          },
          {
            question: "What is an 'impulse buy'?",
            options: [
              "Buying something you planned to buy",
              "Buying something you didn't plan to, just because it caught your eye",
              "Buying something on sale",
              "Buying something for someone else",
            ],
            correctIndex: 1,
            explanation: "An impulse buy is when you grab something just because it's there — like chocolates at the checkout counter. It wasn't on your list!",
          },
          {
            question: "A ₹50 toy is worth 5 ice creams. What is this thinking technique called?",
            options: [
              "The 10-for-10 Rule",
              "The Unit Price Method",
              "The Value Comparison",
              "The Impulse Check",
            ],
            correctIndex: 0,
            explanation: "The 10-for-10 Rule: Is this thing worth 10 of something else? It helps you compare what you're giving up for a purchase.",
          },
          {
            question: "Why do shops put chocolates near the checkout?",
            options: [
              "They're lazy",
              "To tempt you into impulse buys",
              "They ran out of shelf space",
              "It keeps the chocolates fresh",
            ],
            correctIndex: 1,
            explanation: "Shops know that when you're waiting in line, you'll see those items and think \"I want that!\" It's a sneaky trick to get you to spend more!",
          },
        ],
      },
      {
        slug: "digital-money-safety",
        title: "Digital Money and Staying Safe",
        number: 5,
        objectives: [
          "Learn how UPI and phone payments work",
          "Understand the basics of online safety",
          "Know what to do if something goes wrong",
        ],
        content: [
          {
            type: "story",
            title: "Kabir's First UPI Payment",
            body: "Kabir watched his dad tap his phone at a shop. No cash, no card — just a quick beep!\n\n\"How did that work?\" Kabir asked.\n\n\"It's called **UPI** — Unified Payments Interface. My phone is connected to my bank account. When I tap, the money moves from my account to the shop's account. Instantly!\"\n\n\"Is it safe?\" Kabir wondered.\n\n\"Very safe — if you follow the rules. UPI needs a PIN or fingerprint to approve each payment. Nobody can steal from you without that.\"",
          },
          {
            type: "story",
            title: "The 5 Safety Rules",
            body: "Kabir's dad taught him 5 rules for digital money:\n\n🔒 **Rule 1: Never share your UPI PIN** — not even with friends or family\n📱 **Rule 2: Don't click unknown links** — they might be scams\n🚫 **Rule 3: Never pay someone you don't know** — if it sounds too good to be true, it is\n✅ **Rule 4: Check before you pay** — always verify the amount and recipient\n🆘 **Rule 5: Tell an adult if something goes wrong** — they can help fix it\n\n\"And remember,\" his dad said, \"real companies will never call asking for your PIN or password.\"",
          },
          {
            type: "fun-fact",
            title: "UPI: India's Pride",
            body: "India's UPI system is used by over 300 million people! It processes billions of transactions every month.\n\nOther countries are amazed by how easy and fast UPI is. Many countries want to copy India's system.\n\nSo next time you tap to pay, remember — you're using one of the coolest payment systems in the world! 🇮🇳",
          },
        ],
        concepts: [
          {
            icon: "📱",
            title: "How UPI Works",
            description: "Your phone connects to your bank. Tap to pay, and money moves instantly to the seller.",
          },
          {
            icon: "🔐",
            title: "Protect Your PIN",
            description: "Never share your UPI PIN. Not with friends. Not on the phone. Not even with family.",
          },
          {
            icon: "⚠️",
            title: "Spot Scams",
            description: "\"You won a prize!\" or \"Send me your PIN\" — these are always scams. Don't fall for them!",
          },
        ],
        quiz: [
          {
            question: "What does UPI stand for?",
            options: [
              "Universal Payment Interface",
              "Unified Payments Interface",
              "Ultra Pay Instantly",
              "United Phone Income",
            ],
            correctIndex: 1,
            explanation: "UPI = Unified Payments Interface. It's India's amazing system that lets you pay anyone instantly using just your phone!",
          },
          {
            question: "Someone calls and says \"I'm from your bank, tell me your UPI PIN.\" What should you do?",
            options: [
              "Give them the PIN — they're from the bank",
              "Hang up — this is a scam",
              "Give them a fake PIN",
              "Ask them to call back later",
            ],
            correctIndex: 1,
            explanation: "NEVER share your PIN with anyone — even if they say they're from the bank. Real banks will NEVER ask for your PIN over the phone!",
          },
          {
            question: "Which of these is a scam red flag?",
            options: [
              "A shop asking you to tap your phone to pay",
              "A message saying \"You won ₹10,000! Click here!\"",
              "Your dad asking you to pay the bill",
              "A friend asking to borrow money",
            ],
            correctIndex: 1,
            explanation: "\"You won a prize!\" messages are almost always scams. If it sounds too good to be true, it is!",
          },
          {
            question: "What should you do if a UPI payment goes wrong?",
            options: [
              "Do nothing — money is gone forever",
              "Tell an adult right away — they can help",
              "Try to hack the system",
              "Blame your friends",
            ],
            correctIndex: 1,
            explanation: "Tell an adult! Banks have ways to fix mistakes. The sooner you report it, the better the chances of getting your money back.",
          },
        ],
      },
    ],
  },
  {
    slug: "money-in-real-world",
    title: "Money in the Real World",
    subtitle: "Investing, business, taxes, loans, and careers explained simply",
    ageRange: "Ages 10–15",
    emoji: "🌍",
    color: "from-blue-500/20 to-purple-500/20",
    badgeName: "Money Smart Graduate",
    lessons: [
      {
        slug: "what-is-investing",
        title: "What is Investing?",
        number: 1,
        objectives: [
          "Learn what investing means",
          "Understand the difference between saving and investing",
          "See how investing grows your money over time",
        ],
        content: [
          {
            type: "story",
            title: "The Mango Tree Analogy",
            body: "Grandpa gives Aanya a mango seed. \"Plant this,\" he says.\n\nAanya plants it and waters it every day. After a year, it's a small tree. After 3 years, it has flowers. After 5 years — delicious mangoes! And every year after that, MORE mangoes.\n\n\"Investing money is like planting a tree,\" Grandpa says. \"You plant a small seed today, and with patience, it grows into something that gives you fruit forever.\"\n\n**Investing** means putting your money into something that can grow over time — like stocks, mutual funds, or a business.",
          },
          {
            type: "story",
            title: "Saving vs Investing",
            body: "Saving and investing are cousins — similar but different:\n\n**Saving** 🏦\n• Put money in a bank\n• Safe and steady\n• Earns a little interest (3-7%)\n• Great for short-term goals\n\n**Investing** 📈\n• Buy stocks, mutual funds, or assets\n• Has some risk (values go up AND down)\n• Can earn much more (10-15% average)\n• Great for long-term goals (5+ years)\n\n**The golden rule:** Save for emergencies. Invest for the future.",
          },
          {
            type: "fun-fact",
            title: "Power of Investing ₹500/Month",
            body: "If you invest just ₹500 per month starting at age 15, and earn an average 12% per year:\n\n• By age 25: ₹1,16,000 (you put in ₹60,000)\n• By age 35: ₹3,50,000 (you put in ₹1,20,000)\n• By age 45: ₹9,50,000 (you put in ₹1,80,000)\n• By age 55: ₹25,00,000 (you put in ₹2,40,000)\n\nYou put in ₹2.4 lakh and got ₹25 lakh back! That's compounding + investing working together!",
          },
        ],
        concepts: [
          {
            icon: "🌱",
            title: "Plant a Seed",
            description: "Your money is the seed. Investing is planting it. With time and care, it grows into a tree.",
          },
          {
            icon: "📊",
            title: "Risk & Reward",
            description: "Investing has risk — values go up and down. But over time, good investments tend to grow.",
          },
          {
            icon: "⏳",
            title: "Patience Pays",
            description: "Investing works best over years and decades. The longer you wait, the more you earn.",
          },
        ],
        quiz: [
          {
            question: "What is investing?",
            options: [
              "Putting money under your mattress",
              "Putting money into something that can grow over time",
              "Spending money on things you don't need",
              "Lending money to friends",
            ],
            correctIndex: 1,
            explanation: "Investing means putting your money into things like stocks, mutual funds, or businesses that can grow and earn more money over time.",
          },
          {
            question: "What is the main difference between saving and investing?",
            options: [
              "There is no difference",
              "Saving is safe but earns less; investing has risk but can earn more",
              "Investing is always better than saving",
              "Saving is only for adults",
            ],
            correctIndex: 1,
            explanation: "Saving is safe (bank) but earns little. Investing has risk (values fluctuate) but can earn much more over time.",
          },
          {
            question: "You invest ₹500/month at 12% per year. How much do you have after 40 years?",
            options: [
              "₹2,40,000",
              "₹5,00,000",
              "₹25,00,000",
              "₹1,00,00,000",
            ],
            correctIndex: 2,
            explanation: "About ₹25 lakh! You only put in ₹2.4 lakh, but compounding grew it over 10x! That's the magic of long-term investing.",
          },
          {
            question: "When is investing better than saving?",
            options: [
              "When you need money next week",
              "When you won't need the money for 5+ years",
              "When you want to buy candy",
              "Never — saving is always better",
            ],
            correctIndex: 1,
            explanation: "Investing works best for long-term goals (5+ years). For money you'll need soon, keep it in a savings account.",
          },
        ],
      },
      {
        slug: "starting-small-business",
        title: "Starting a Small Business",
        number: 2,
        objectives: [
          "Understand what a business is",
          "Learn the basics: revenue, costs, and profit",
          "See how kids can start their own mini-business",
        ],
        content: [
          {
            type: "story",
            title: "Kabir's Lemonade Stand",
            body: "Kabir had an idea — sell lemonade at the park!\n\n**His costs:**\n🍋 Lemons — ₹20\n🍬 Sugar — ₹10\n🥤 Cups — ₹15\n📋 Poster — ₹5\n**Total cost: ₹50**\n\nHe set up his stand and sold 10 cups at ₹10 each.\n**Revenue: ₹100**\n\n**Profit = Revenue - Costs**\n₹100 - ₹50 = ₹50 profit!\n\nKabir was a businessman! He took a risk (spending ₹50), worked hard (making lemonade), and earned more than he started with.",
          },
          {
            type: "story",
            title: "Revenue ≠ Profit",
            body: "This is the trickiest thing about business:\n\n**Revenue** = All the money you receive (₹100)\n**Costs** = What you spent to make the product (₹50)\n**Profit** = What's left (₹50)\n\nMany kids think \"I sold ₹100, so I made ₹100!\" Nope — you need to subtract costs first.\n\nEven big companies track this:\n• Reliance's revenue is ₹8 lakh crore\n• But their costs are ₹7 lakh crore\n• So their profit is ₹1 lakh crore\n\nRevenue sounds huge, but profit is what really matters!",
          },
          {
            type: "fun-fact",
            title: "Kid Businesses That Worked",
            body: "Some famous businesses started with kids:\n\n• **Mozart** composed music at age 5 and got paid for performances\n• **Mark Zuckerberg** started coding at 10 and built Facebook at 19\n• **Falguni Nayar** (Nykaa) started her beauty business at 50 — but she dreamed about it for decades!\n\nIn India, many kids start businesses during Diwali — selling diyas, crackers, or rangoli designs. It's a great way to learn!",
          },
        ],
        concepts: [
          {
            icon: "💰",
            title: "Revenue",
            description: "All the money people pay you. Sounds impressive, but it's not all profit!",
          },
          {
            icon: "🧾",
            title: "Costs",
            description: "What you spend to make or buy what you sell. Subtract this from revenue.",
          },
          {
            icon: "📈",
            title: "Profit",
            description: "Revenue minus costs. This is the money YOU keep. This is what matters!",
          },
        ],
        quiz: [
          {
            question: "Kabir spent ₹50 to make lemonade and sold it for ₹100. What is his profit?",
            options: ["₹100", "₹150", "₹50", "₹25"],
            correctIndex: 2,
            explanation: "Profit = Revenue - Costs = ₹100 - ₹50 = ₹50. Kabir earned ₹50 for his work!",
          },
          {
            question: "What is 'revenue'?",
            options: [
              "The money you keep after costs",
              "All the money people pay you before subtracting costs",
              "The cost of making a product",
              "Money you borrow from a bank",
            ],
            correctIndex: 1,
            explanation: "Revenue is the total money coming in. You still need to subtract costs to find your actual profit!",
          },
          {
            question: "Why is it important to know the difference between revenue and profit?",
            options: [
              "It's not important",
              "Because revenue looks big but profit is what you actually keep",
              "Because businesses don't need to track money",
              "Because revenue is always bigger than profit",
            ],
            correctIndex: 1,
            explanation: "A business might have huge revenue but tiny profit (or even a loss!). Profit is what really matters for the business owner.",
          },
          {
            question: "What costs might a lemonade stand have?",
            options: [
              "Only the cups",
              "Lemons, sugar, cups, poster, table",
              "No costs — lemonade is free",
              "Only the table",
            ],
            correctIndex: 1,
            explanation: "Everything you spend to make and sell your product is a cost — ingredients, packaging, advertising, even the table you use!",
          },
        ],
      },
      {
        slug: "taxes-why-we-pay",
        title: "Taxes: Why We Pay Them",
        number: 3,
        objectives: [
          "Learn what taxes are",
          "Understand where tax money goes",
          "See why everyone needs to pay their share",
        ],
        content: [
          {
            type: "story",
            title: "The Magic Road",
            body: "Aanya wondered: \"Who builds the roads? Who runs the schools? Who puts out fires?\"\n\n\"Taxes,\" her mom said.\n\n**Taxes** are money that everyone pays to the government. The government uses this money to build and maintain things that everyone uses:\n\n🛣️ Roads and bridges\n🏫 Government schools\n🏥 Government hospitals\n👮 Police and fire stations\n💡 Street lights\n📚 Libraries\n\nIt's like everyone puts money in a big jar, and the government uses it to take care of the country!",
          },
          {
            type: "story",
            title: "Types of Taxes",
            body: "There are two main types of taxes:\n\n**Income Tax** 💼\nWhen grown-ups earn money, they give a percentage to the government. If someone earns ₹10 lakh per year, they might pay about ₹1 lakh in tax.\n\n**GST (Goods & Services Tax)** 🛒\nWhen you buy things, a small tax is added. If a toy costs ₹100, you might pay ₹118 (including 18% GST). The extra ₹18 goes to the government.\n\n\"But why do I pay GST?\" Aanya asked.\n\n\"Because the government uses that money to make the roads you drive on, the schools you learn in, and the hospitals that keep everyone healthy.\"",
          },
          {
            type: "fun-fact",
            title: "Where Does Tax Money Go?",
            body: "Here's approximately how the Indian government spends tax money:\n\n• 🛡️ Defence (army, navy) — 13%\n• 🏗️ Infrastructure (roads, bridges) — 17%\n• 📚 Education — 10%\n• 🏥 Health — 5%\n• 🌾 Agriculture subsidies — 8%\n• 💰 Interest on loans — 20%\n• 🏛️ Running the government — 9%\n• 🎁 Social welfare — 18%\n\nEvery rupee of tax is accounted for. It's YOUR money being used for YOUR country!",
          },
        ],
        concepts: [
          {
            icon: "🏛️",
            title: "Taxes = National Dues",
            description: "Everyone pays a share so the government can build roads, schools, hospitals, and more.",
          },
          {
            icon: "💳",
            title: "Income Tax vs GST",
            description: "Income tax is on what you earn. GST is on what you buy. Both fund public services.",
          },
          {
            icon: "🤝",
            title: "Everyone Contributes",
            description: "Taxes work because everyone pays their fair share. It's how a society takes care of itself.",
          },
        ],
        quiz: [
          {
            question: "What are taxes used for?",
            options: [
              "Making the government rich",
              "Building roads, schools, hospitals, and public services",
              "Buying toys for politicians",
              "Nothing — taxes are wasted",
            ],
            correctIndex: 1,
            explanation: "Taxes fund everything public — roads, schools, hospitals, police, fire stations, street lights, and more!",
          },
          {
            question: "What is GST?",
            options: [
              "A type of income tax",
              "A tax added when you buy things",
              "A bank account type",
              "A government salary",
            ],
            correctIndex: 1,
            explanation: "GST (Goods & Services Tax) is added to the price of things you buy. It's included in the MRP on most products.",
          },
          {
            question: "If a shirt costs ₹500 and GST is 18%, how much do you pay in total?",
            options: ["₹500", "₹518", "₹580", "₹590"],
            correctIndex: 3,
            explanation: "₹500 + 18% of ₹500 = ₹500 + ₹90 = ₹590. The ₹90 goes to the government as GST.",
          },
          {
            question: "Why is it fair for everyone to pay taxes?",
            options: [
              "It's not fair — rich people should pay more",
              "Everyone uses public services, so everyone should contribute",
              "Only men should pay taxes",
              "Kids don't need to care about taxes",
            ],
            correctIndex: 1,
            explanation: "Everyone uses roads, schools, and hospitals. Taxes ensure everyone contributes to keeping these services running!",
          },
        ],
      },
      {
        slug: "loans-and-borrowing",
        title: "Loans and Borrowing",
        number: 4,
        objectives: [
          "Learn what a loan is",
          "Understand interest on loans (you pay it back!)",
          "Know when borrowing makes sense and when it doesn't",
        ],
        content: [
          {
            type: "story",
            title: "Aanya's Bike Loan",
            body: "Aanya wants a bicycle that costs ₹5,000. She only has ₹3,000 saved.\n\n\"Can I borrow ₹2,000 from you?\" she asks her dad.\n\n\"Sure! But remember, when you borrow money, you usually pay back a little extra. That extra is called **interest** — it's the cost of borrowing.\"\n\nHer dad lends her ₹2,000 at 10% interest.\nAfter a year, Aanya pays back: ₹2,000 + ₹200 interest = ₹2,200.\n\nThe ₹200 is the price Aanya paid for borrowing the money. Banks do the same thing — but they charge MORE interest!",
          },
          {
            type: "story",
            title: "Good Debt vs Bad Debt",
            body: "Not all borrowing is the same:\n\n**Good Debt** ✅\n• Education loan — helps you earn more later\n• Home loan — you need a place to live\n• Business loan — can help you earn money\n\n**Bad Debt** ❌\n• Borrowing to buy a phone you can't afford\n• Borrowing to play games or gamble\n• Borrowing to impress friends\n\nThe rule of thumb: If the loan helps you earn MORE money or learn a valuable skill, it might be good debt. If it's just for fun, it's probably bad debt.",
          },
          {
            type: "fun-fact",
            title: "India's Interest Rates",
            body: "Here's what different loans cost in India:\n\n• 🏠 Home loan: 8-9% per year\n• 🎓 Education loan: 10-12% per year\n• 🚗 Car loan: 8-10% per year\n• 💳 Credit card: 30-40% per year!\n\nCredit cards are the MOST expensive way to borrow! That's why it's best to pay the full amount every month. Never just pay the minimum!",
          },
        ],
        concepts: [
          {
            icon: "🤝",
            title: "A Loan is a Deal",
            description: "You borrow money now and promise to pay it back later — with interest.",
          },
          {
            icon: "💸",
            title: "Interest is the Cost",
            description: "Interest is what you pay for the privilege of borrowing. The longer you take, the more you pay.",
          },
          {
            icon: "✅",
            title: "Good Debt vs Bad Debt",
            description: "Borrowing for education or a home can be smart. Borrowing for fun stuff is risky.",
          },
        ],
        quiz: [
          {
            question: "You borrow ₹1,000 at 10% interest. How much do you pay back after 1 year?",
            options: ["₹1,000", "₹1,050", "₹1,100", "₹1,200"],
            correctIndex: 2,
            explanation: "₹1,000 + 10% of ₹1,000 = ₹1,000 + ₹100 = ₹1,100. The extra ₹100 is the interest — the cost of borrowing!",
          },
          {
            question: "Which is an example of 'good debt'?",
            options: [
              "Borrowing to buy the latest phone",
              "Borrowing for education that helps you earn more",
              "Borrowing to impress your friends",
              "Borrowing to play online games",
            ],
            correctIndex: 1,
            explanation: "Education loans can be good debt because they help you learn skills that lead to higher income in the future!",
          },
          {
            question: "Why are credit cards the most expensive way to borrow?",
            options: [
              "They charge 30-40% interest per year",
              "They are free to use",
              "They only work in rich countries",
              "They don't charge any interest",
            ],
            correctIndex: 0,
            explanation: "Credit cards charge 30-40% interest per year! That's why you should always pay the full amount, not just the minimum.",
          },
          {
            question: "Aanya borrows ₹2,000 at 10% for 2 years. How much interest does she pay?",
            options: ["₹100", "₹200", "₹400", "₹420"],
            correctIndex: 2,
            explanation: "₹2,000 × 10% × 2 years = ₹400. She pays back ₹2,400 total. The longer you borrow, the more interest you pay!",
          },
        ],
      },
      {
        slug: "careers-and-earning",
        title: "Careers and Earning Money",
        number: 5,
        objectives: [
          "Learn how people earn money",
          "Understand salary vs hourly pay",
          "Explore how skills and education lead to better jobs",
        ],
        content: [
          {
            type: "story",
            title: "Career Day at School",
            body: "It was Career Day at Aanya's school. Different professionals came to talk:\n\n👩‍⚕️ **Dr. Meera** — \"I'm a doctor. I studied for 10 years after school. I earn ₹15 lakh per year, but I work long hours and love helping people.\"\n\n👨‍💻 **Raj** — \"I'm a software engineer. I code apps and websites. I earn ₹12 lakh per year. I can work from home!\"\n\n👩‍🍳 **Priya** — \"I'm a chef. I run a restaurant. Some months I earn ₹2 lakh, some months ₹5 lakh. It varies!\"\n\n🧹 **Sanjay** — \"I'm a government sweeper. I earn ₹25,000 per year. It's honest work and I'm proud of it.\"\n\nAanya learned: different jobs, different pay, different hours. But ALL work is important!",
          },
          {
            type: "story",
            title: "How Salary Works",
            body: "Most grown-ups get a **salary** — a fixed amount paid every month.\n\nBut not all of it goes to their pocket:\n\n**Gross Salary** (what the company says they pay): ₹50,000/month\nMinus **Income Tax**: -₹3,000\nMinus **EPF** (retirement savings): -₹1,800\nMinus **Health insurance**: -₹500\n\n**Take-home salary**: ₹44,700/month\n\nThat's why your parents sometimes say \"I earn ₹50,000\" but only have ₹44,700 to spend. The deductions go to taxes and savings!",
          },
          {
            type: "fun-fact",
            title: "Future Jobs",
            body: "Many of today's coolest jobs didn't exist 20 years ago:\n\n🤖 AI Engineer — builds smart robots\n📱 App Developer — creates phone apps\n🎮 Game Designer — makes video games\n📊 Data Scientist — finds patterns in big data\n🌱 Sustainability Consultant — helps companies go green\n🚀 Space Entrepreneur — yes, private space travel!\n\nThe jobs of the future will need creativity, problem-solving, and tech skills. What would YOU like to do?",
          },
        ],
        concepts: [
          {
            icon: "💼",
            title: "Salary = Monthly Pay",
            description: "Most people get a fixed amount each month. But taxes and savings come out before you get it.",
          },
          {
            icon: "🎓",
            title: "Skills = Opportunity",
            description: "More skills and education usually mean more job options and higher pay.",
          },
          {
            icon: "🚀",
            title: "Future Careers",
            description: "New jobs are being created all the time. Learn skills now that will matter in 10 years!",
          },
        ],
        quiz: [
          {
            question: "Dr. Meera earns ₹15 lakh/year. What is her approximate monthly salary?",
            options: ["₹15,000", "₹50,000", "₹1,25,000", "₹15,00,000"],
            correctIndex: 2,
            explanation: "₹15,00,000 ÷ 12 months = ₹1,25,000 per month. That's before taxes and deductions!",
          },
          {
            question: "What is 'take-home salary'?",
            options: [
              "The salary you get before any deductions",
              "The salary you actually receive after taxes and deductions",
              "The salary your company advertises",
              "The salary of government workers",
            ],
            correctIndex: 1,
            explanation: "Take-home salary is what you actually receive after income tax, EPF, and insurance are deducted. It's less than the gross salary!",
          },
          {
            question: "Why do different jobs pay different amounts?",
            options: [
              "It's random",
              "Based on skills needed, education required, and market demand",
              "Government decides all salaries",
              "Rich people get paid more",
            ],
            correctIndex: 1,
            explanation: "Salaries depend on how many people can do the job, how much training it needs, and how much value it creates.",
          },
          {
            question: "Which of these jobs didn't exist 20 years ago?",
            options: ["Doctor", "Teacher", "AI Engineer", "Chef"],
            correctIndex: 2,
            explanation: "AI Engineer is a brand-new career! Technology keeps creating new jobs that didn't exist before.",
          },
        ],
      },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getLesson(
  courseSlug: string,
  lessonSlug: string
): { course: Course; lesson: Lesson; lessonIndex: number } | undefined {
  const course = getCourse(courseSlug);
  if (!course) return undefined;
  const lessonIndex = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIndex === -1) return undefined;
  return { course, lesson: course.lessons[lessonIndex], lessonIndex };
}

export function getNextLesson(
  courseSlug: string,
  lessonSlug: string
): { courseSlug: string; lessonSlug: string } | null {
  const course = getCourse(courseSlug);
  if (!course) return null;
  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return null;
  if (idx < course.lessons.length - 1) {
    return {
      courseSlug: course.slug,
      lessonSlug: course.lessons[idx + 1].slug,
    };
  }
  const courseIdx = courses.findIndex((c) => c.slug === courseSlug);
  if (courseIdx < courses.length - 1) {
    const nextCourse = courses[courseIdx + 1];
    return {
      courseSlug: nextCourse.slug,
      lessonSlug: nextCourse.lessons[0].slug,
    };
  }
  return null;
}

export function getPrevLesson(
  courseSlug: string,
  lessonSlug: string
): { courseSlug: string; lessonSlug: string } | null {
  const course = getCourse(courseSlug);
  if (!course) return null;
  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return null;
  if (idx > 0) {
    return {
      courseSlug: course.slug,
      lessonSlug: course.lessons[idx - 1].slug,
    };
  }
  const courseIdx = courses.findIndex((c) => c.slug === courseSlug);
  if (courseIdx > 0) {
    const prevCourse = courses[courseIdx - 1];
    return {
      courseSlug: prevCourse.slug,
      lessonSlug: prevCourse.lessons[prevCourse.lessons.length - 1].slug,
    };
  }
  return null;
}
