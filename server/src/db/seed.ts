// We need the Pool class from "pg" to connect to PostgreSQL and insert data.
import { Pool } from "pg";

// We need dotenv to load environment variables from the .env file.
import dotenv from "dotenv";

// Load the .env file so we can read DB_USER and DB_NAME.
dotenv.config();

// This is an array (a list) of joke objects that we want to insert into the database.
// Think of this like a shopping list — we're telling the program "here are 30 jokes to add."
// Each joke is an object (wrapped in { }) with properties like setup, punchline, category, etc.
const seedJokes = [
  {
    // The setup is the first part of the joke that sets up the punchline.
    setup: "I'm afraid for the calendar.",
    // The punchline is the funny part that comes after the setup.
    punchline: "Its days are numbered.",
    // The category helps organize jokes into groups (like chapters in a book).
    category: "puns",
    // Groan level of 8 out of 10 — pretty groan-worthy.
    groan_level: 8,
    // The fictional "dad" who submitted this joke.
    author: "Dad #1",
  },
  {
    setup: "What do you call a fake noodle?",
    punchline: "An impasta.",
    category: "puns",
    groan_level: 9,
    author: "Dad #2",
  },
  {
    setup: "Why don't scientists trust atoms?",
    punchline: "They make up everything.",
    category: "science",
    groan_level: 7,
    author: "Dad #3",
  },
  {
    setup: "I told my wife she was drawing her eyebrows too high.",
    punchline: "She looked surprised.",
    category: "classic",
    groan_level: 10,
    author: "Dad #4",
  },
  {
    setup: "What do you call a dog that does magic?",
    punchline: "A Labracadabrador.",
    category: "animals",
    groan_level: 9,
    author: "Dad #5",
  },
  {
    setup: "I used to hate facial hair.",
    punchline: "But then it grew on me.",
    category: "classic",
    groan_level: 8,
    author: "Dad #6",
  },
  {
    setup: "What do you call a bear with no teeth?",
    punchline: "A gummy bear.",
    category: "animals",
    groan_level: 7,
    author: "Dad #7",
  },
  {
    setup: "Why did the scarecrow win an award?",
    punchline: "He was outstanding in his field.",
    category: "classic",
    groan_level: 10,
    author: "Dad #8",
  },
  {
    setup: "What do you call a bear in the rain?",
    punchline: "A drizzly bear.",
    category: "animals",
    groan_level: 8,
    author: "Dad #9",
  },
  {
    setup: "I'm reading a book about anti-gravity.",
    punchline: "It's impossible to put down.",
    category: "science",
    groan_level: 9,
    author: "Dad #10",
  },
  {
    setup: "What did the ocean say to the beach?",
    punchline: "Nothing, it just waved.",
    category: "classic",
    groan_level: 10,
    author: "Dad #11",
  },
  {
    setup: "Why don't eggs tell jokes?",
    punchline: "They'd crack each other up.",
    category: "food",
    groan_level: 7,
    author: "Dad #12",
  },
  {
    setup: "I'm on a seafood diet.",
    punchline: "I see food and I eat it.",
    category: "food",
    groan_level: 9,
    author: "Dad #13",
  },
  {
    setup: "What do you call cheese that isn't yours?",
    punchline: "Nacho cheese.",
    category: "food",
    groan_level: 10,
    author: "Dad #14",
  },
  {
    setup: "I got fired from the calendar factory.",
    punchline: "All I did was take a day off.",
    category: "classic",
    groan_level: 8,
    author: "Dad #15",
  },
  {
    setup: "What's orange and sounds like a parrot?",
    punchline: "A carrot.",
    category: "food",
    groan_level: 7,
    author: "Dad #16",
  },
  {
    setup: "I have a joke about trickle-down economics.",
    punchline: "But 99% of you won't get it.",
    category: "smart",
    groan_level: 10,
    author: "Dad #17",
  },
  {
    setup: "What do you call a sleeping dinosaur?",
    punchline: "A dino-snore.",
    category: "animals",
    groan_level: 8,
    author: "Dad #18",
  },
  {
    setup: "I'm terrified of elevators.",
    punchline: "I'm going to start taking steps to avoid them.",
    category: "classic",
    groan_level: 9,
    author: "Dad #19",
  },
  {
    setup: "What do you call a cold dog sitting on a rabbit?",
    punchline: "A chili dog on a bunny.",
    category: "animals",
    groan_level: 10,
    author: "Dad #20",
  },
  {
    setup: "Parallel lines have so much in common.",
    punchline: "It's a shame they'll never meet.",
    category: "math",
    groan_level: 10,
    author: "Dad #21",
  },
  {
    setup: "My boss told me to have a good day.",
    punchline: "So I went home.",
    category: "work",
    groan_level: 9,
    author: "Dad #22",
  },
  {
    setup: "What's the best thing about Switzerland?",
    punchline: "I don't know, but the flag is a big plus.",
    category: "geography",
    groan_level: 10,
    author: "Dad #23",
  },
  {
    setup: "I invented a new word.",
    punchline: "Plagiarism.",
    category: "smart",
    groan_level: 10,
    author: "Dad #24",
  },
  {
    setup: "What do you call a group of 8 hobbits?",
    punchline: "A hobbyte.",
    category: "smart",
    groan_level: 8,
    author: "Dad #25",
  },
  {
    setup: "I asked the librarian if the library had any books about paranoia.",
    punchline: "She whispered, 'They're right behind you!'",
    category: "classic",
    groan_level: 9,
    author: "Dad #26",
  },
  {
    setup: "What's the difference between a well-dressed man on a bike and a poorly dressed man on a unicycle?",
    punchline: "Attire.",
    category: "smart",
    groan_level: 10,
    author: "Dad #27",
  },
  {
    setup: "I told a chemistry joke.",
    punchline: "There was no reaction.",
    category: "science",
    groan_level: 8,
    author: "Dad #28",
  },
  {
    setup: "What do you call a dinosaur that crashes their car?",
    punchline: "Tyrannosaurus Wrecks.",
    category: "animals",
    groan_level: 9,
    author: "Dad #29",
  },
  {
    setup: "I told my kids a joke about a broken pencil.",
    punchline: "Never mind, it's pointless.",
    category: "classic",
    groan_level: 10,
    author: "Dad #30",
  },
];

// This function connects to the database and inserts all the seed jokes.
// "async" lets us use "await" inside to wait for database operations to finish.
async function seedDB(): Promise<void> {
  // Create a connection pool (a reusable group of database connections).
  const pool = new Pool({
    // The database username — read from .env or default to "postgres".
    user: process.env.DB_USER || "postgres",
    // Which database to connect to — read from .env or default to "dad_jokes".
    database: process.env.DB_NAME || "dad_jokes",
  });

  try {
    // First, delete all existing votes. We do this BEFORE deleting jokes because
    // the votes table has a foreign key linking to jokes — if we tried to delete
    // jokes first, it might fail because votes still reference them.
    // Think of it like: clean up the bookmarks before you tear out the pages.
    await pool.query("DELETE FROM votes");
    // Now delete all existing jokes. The table will be empty.
    await pool.query("DELETE FROM jokes");
    // Reset the "id counter" for the jokes table back to 1.
    // Without this, the next joke inserted would get id 31 (since we had 30 before).
    // "RESTART WITH 1" tells PostgreSQL to start counting from 1 again.
    await pool.query("ALTER SEQUENCE jokes_id_seq RESTART WITH 1");
    // Same thing for the votes table — reset its id counter back to 1.
    await pool.query("ALTER SEQUENCE votes_id_seq RESTART WITH 1");

    // Loop through each joke in our seedJokes array, one at a time.
    // "for...of" is a way to go through every item in a list.
    for (const joke of seedJokes) {
      // Generate a random number of upvotes between 0 and 199.
      // Math.random() gives a decimal between 0 and 1, multiply by 200 to get 0-199,
      // and Math.floor() rounds it down to a whole number.
      // This makes the seed data look more realistic — not every joke starts at 0 votes.
      const upvotes = Math.floor(Math.random() * 200);
      // Same idea, but for downvotes — between 0 and 29.
      const downvotes = Math.floor(Math.random() * 30);
      // This SQL inserts one joke into the jokes table.
      // $1, $2, $3, etc. are placeholders that get replaced by the values in the array below.
      // This is safer than building the string manually because it prevents SQL injection attacks.
      // "RETURNING *" would send back the inserted row, but we don't need it here.
      await pool.query(
        `INSERT INTO jokes (setup, punchline, category, groan_level, upvotes, downvotes, author)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          // $1 → the setup text
          joke.setup,
          // $2 → the punchline text
          joke.punchline,
          // $3 → the category
          joke.category,
          // $4 → the groan level
          joke.groan_level,
          // $5 → the randomly generated upvotes
          upvotes,
          // $6 → the randomly generated downvotes
          downvotes,
          // $7 → the author name
          joke.author,
        ]
      );
    }

    // Let the developer know how many jokes were inserted.
    console.log(`Seeded ${seedJokes.length} jokes into the database.`);
  } finally {
    // Always close the database connection when we're done, even if an error occurred.
    await pool.end();
  }
}

// Run the seedDB() function.
// ".then()" runs when seeding finishes successfully.
seedDB()
  .then(() => {
    // Print a success message.
    console.log("Seeding complete.");
    // Exit with code 0 (success).
    process.exit(0);
  })
  // ".catch()" runs if something goes wrong during seeding.
  .catch((err) => {
    // Print the error so the developer can debug it.
    console.error("Seeding failed:", err);
    // Exit with code 1 (failure).
    process.exit(1);
  });
