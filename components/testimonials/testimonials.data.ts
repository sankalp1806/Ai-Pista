// Define the structure so itis easy to add more testimonials
export type TweetReview = {
  name: string;
  username: string; // includes @
  body: string;
  img: string; // avatar URL
  href: string; // tweet URL
};

// Define the type which doesn't include the username
type TweetReviewWithoutUsername = Omit<TweetReview, "username">;

// Add as many different users/tweets as you like here
const reviewsWithoutUsername: TweetReviewWithoutUsername[] = [
  {
    name: "Prasenjit",
    body: "That's actually huge, best of luck in your journey :)",
    img: "https://pbs.twimg.com/profile_images/1925153197645307904/0paEJX5m_400x400.jpg",
    href: "https://x.com/Star_Knight12/status/1959299400162770973",
  },
  {
    name: "Jamil",
    body: "Not only the open source project but the heart as well !",
    img: "https://pbs.twimg.com/profile_images/1957317231249141760/Idf9-nNq_400x400.jpg",
    href: "https://x.com/jr_muj/status/1959346052626256351",
  },
  {
    name: "Ghost",
    body: `Damn bhai 
Lfggg ; ) 🔥🔥`,
    img: "https://pbs.twimg.com/profile_images/1959360588779274242/ERpuOpk__400x400.jpg",
    href: "https://x.com/GhostCoder_/status/1959297337031094403",
  },
  {
    name: "r84",
    body: "lesss goooo... 🌋",
    img: "https://pbs.twimg.com/profile_images/1960046651781111808/bM3MKLjo_400x400.jpg",
    href: "https://x.com/golok727/status/1959309199487234505",
  },
  {
    name: "Ishika",
    body: "😳 OMG....ur goat ✨🙌🏻",
    img: "https://pbs.twimg.com/profile_images/1950246889649295362/FBVF1DmX_400x400.jpg",
    href: "https://x.com/ishikainframe/status/1959293408641519719",
  },
  {
    name: "rejex visions",
    body: "THIS IS INSANE",
    img: "https://pbs.twimg.com/profile_images/1944272291933646848/QEasig9E_400x400.jpg",
    href: "https://x.com/rejex_visions/status/1959526414559944876",
  },
  {
    name: "D4rsh🦅",
    body: "lesssgo 🔥🔥🔥🔥",
    img: "https://pbs.twimg.com/profile_images/1930660147770376192/0T3izAad_400x400.jpg",
    href: "https://x.com/d4rsh_tw/status/1959281088229945623",
  },
  {
    name: "Runable",
    body: "We want to fund your project. Let's talk.",
    img: "https://pbs.twimg.com/profile_images/1937785255613829120/t4igWN98_400x400.jpg",
    href: "https://x.com/runable_hq/status/1959306812911689749",
  },
  {
    name: "Harsh Mehta",
    body: "Working perfectly",
    img: "https://pbs.twimg.com/profile_images/1949706364789436416/oH356Fm-_400x400.jpg",
    href: "https://x.com/harshh_m/status/1959291194166698414",
  },
  {
    name: "Saurabh Thakur",
    body: "best of luck bro...",
    img: "https://pbs.twimg.com/profile_images/1958119157016264704/IYtrjlZg_400x400.jpg",
    href: "https://x.com/thesupersaurabh/status/1959322216551821622",
  },
  {
    name: "Abhijeet Singh",
    body: "lfg ",
    img: "https://pbs.twimg.com/profile_images/1965848506351910912/Jcn_PA27_400x400.jpg",
    href: "https://x.com/AbhijeetWH/status/1959276363912822842",
  },
  {
    name: "XD",
    body: "👍",
    img: "https://pbs.twimg.com/profile_images/1947236956544565248/xTj9QgOa_400x400.jpg",
    href: "https://x.com/X1001D/status/1959925472860819588",
  },
  {
    name: "Healoriq AI",
    body: "Wow 😳 this is insane! Free GPT-5, Claude 4, Grok 3, plus unlimited image and audio generation? Until bankruptcy hits—count me in",
    img: "https://pbs.twimg.com/profile_images/1960956280182276096/svwwopha_400x400.jpg",
    href: "https://x.com/healoriq/status/1959895788428943552",
  },
  {
    name: "Ashish",
    body: "Crazy. This project is gonna change trajectory of your career ngl.",
    img: "https://pbs.twimg.com/profile_images/1938269217209425920/oVtJJTKY_400x400.jpg",
    href: "https://x.com/ashishguleria_/status/1959861706508923333",
  },
  {
    name: "ASD P",
    body: "good work, ✌️✌️",
    img: "https://pbs.twimg.com/profile_images/1955294885629612032/O1KFFtS6_400x400.jpg",
    href: "https://x.com/ashipati1/status/1959684926665797684",
  },
  {
    name: "Raj Breno",
    body: "Beautiful 😍",
    img: "https://pbs.twimg.com/profile_images/1768510887516917760/gfkRjWg7_400x400.jpg",
    href: "https://x.com/rajbreno/status/1959600955659538900",
  },
  {
    name: "丂卂几匚卄ㄖ Ꮆㄖᗆ几卄ㄖ",
    body: "This is crazy awesome 🤩",
    img: "https://pbs.twimg.com/profile_images/1943683859079364610/76K0H-3p_400x400.jpg",
    href: "https://x.com/sanchogodinho/status/1959564543325040947",
  },
  {
    name: "Rohan Rajpal 🪄",
    body: "Let's go!",
    img: "https://pbs.twimg.com/profile_images/1896652222588469248/6bQTxcHC_400x400.jpg",
    href: "https://x.com/rohanrajpal98/status/1959557071004991647",
  },
  {
    name: "jaidev",
    body: "Damn",
    img: "https://pbs.twimg.com/profile_images/1946776215253135362/yDwyk2lz_400x400.jpg",
    href: "https://x.com/jaidev_me/status/1959556171032850500",
  },
  {
    name: "Amaan",
    body: "Keep going man!!",
    img: "https://pbs.twimg.com/profile_images/1949888780326031360/oz4UuhRu_400x400.jpg",
    href: "https://x.com/TexAmaan239/status/1959551744633159819",
  },
  {
    name: "Harsh",
    body: "Lfg",
    img: "https://pbs.twimg.com/profile_images/1930674432055312384/tNqIl9vU_400x400.jpg",
    href: "https://x.com/geekyharsh_05/status/1959528933101384166",
  },
  {
    name: "Sujal Choudhari",
    body: "Did I ever say that I love the open source community?",
    img: "https://pbs.twimg.com/profile_images/1695640718209957888/XBBQtixh_400x400.jpg",
    href: "https://x.com/Sujal212004/status/1959527468509065692",
  },
  {
    name: "Debsourya Datta",
    body: "WTF! Unlimited image generation without login, how's it possible 🙂",
    img: "https://pbs.twimg.com/profile_images/1952037367994630144/9pa5DDlB_400x400.jpg",
    href: "https://x.com/debsourya005/status/1959513123041525773",
  },
  {
    name: "Sauham Vyas",
    body: "wow man, too big. You really are amazing",
    img: "https://pbs.twimg.com/profile_images/1908567713552711681/SQKMUqmj_400x400.jpg",
    href: "https://x.com/SauhamV/status/1959308253650997304",
  },
  {
    name: "Pushkaraj Kulkarni",
    body: "Whatt?? This is huge bro!",
    img: "https://pbs.twimg.com/profile_images/1956442768869597184/unRylWg0_400x400.jpg",
    href: "https://x.com/ThePushkaraj/status/1959305846086844747",
  },
  {
    name: "Kaveri Paglu",
    body: "dope",
    img: "https://pbs.twimg.com/profile_images/1930240842830069760/lMIupkn0_400x400.jpg",
    href: "https://x.com/RvddyGaru/status/1959305359069237443",
  },
  {
    name: "✰☄⋆𝔸𝕂˚₊· ͟͟͞͞➳❥",
    body: "This is just huge bro 🚀",
    img: "https://pbs.twimg.com/profile_images/1859904492667273216/mjs9h-kM_400x400.jpg",
    href: "https://x.com/busskarr_ak/status/1959303846234144887",
  },
  {
    name: "chirag",
    body: "dammm",
    img: "https://pbs.twimg.com/profile_images/1955843142168797186/IV9DAOY__400x400.jpg",
    href: "https://x.com/chirag_twts/status/1959302718864200066",
  },
  {
    name: "Satej Dhakane",
    body: "🔥🔥 great 👍",
    img: "https://pbs.twimg.com/profile_images/1894463235803287552/vlChRpl3_400x400.jpg",
    href: "https://x.com/SatejDhakane/status/1959295750225203383",
  },
  {
    name: "RKN",
    body: "Broooo thats crazyyyyyyyyy all the best",
    img: "https://pbs.twimg.com/profile_images/1942811114124832768/tz4lWzQt_400x400.jpg",
    href: "https://x.com/mebeingrkn/status/1959294011513946323",
  },
  {
    name: "Ranjeet Choudhary",
    body: "Bro seriously you are going to Rock Amazing work",
    img: "https://pbs.twimg.com/profile_images/1363469964120780802/s8aw-uUW_400x400.jpg",
    href: "https://x.com/Ranjeetch08/status/1959293145843179809",
  },
  {
    name: "Aman Shakya",
    body: "Humi: 'hold my free version.'🔥",
    img: "https://pbs.twimg.com/profile_images/1942252182117441536/TYAJgOg8_400x400.jpg",
    href: "https://x.com/AmanShakya0018/status/1959287826341560504",
  },
  {
    name: "Alok",
    body: "It’s great, good work.",
    img: "https://pbs.twimg.com/profile_images/1963294609125081088/JIbM5fTe_400x400.jpg",
    href: "https://x.com/thealokverse/status/1959285445122027803",
  },
  {
    name: "shobhit",
    body: "bro is doubling down, love it",
    img: "https://pbs.twimg.com/profile_images/1595381969990217728/WLhyEQ6C_400x400.jpg",
    href: "https://x.com/shbhtngpl/status/1959285085792076120",
  },
  {
    name: "Vishal ▲",
    body: "crazy update. 🔥",
    img: "https://pbs.twimg.com/profile_images/1941831739967483904/-53QrOpB_400x400.jpg",
    href: "https://x.com/iwantMBAm4/status/1959281289833365864",
  },
  {
    name: "☝🏻",
    body: "niceeeeeeeee",
    img: "https://pbs.twimg.com/profile_images/1851274859072126976/8PlkxT-6_400x400.jpg",
    href: "https://x.com/breathronaldo/status/1959374914118713746",
  },
  {
    name: "baitman",
    body: "Cooked the German grifter 🤣🙏",
    img: "https://pbs.twimg.com/profile_images/1755301444146941952/P5C4Qhf4_400x400.jpg",
    href: "https://x.com/spartacus_42069/status/1959367478846554392",
  },
  {
    name: "Anik Das",
    body: "This 🙏🏻 is it",
    img: "https://pbs.twimg.com/profile_images/1962507148308688896/gTSluiPi_400x400.jpg",
    href: "https://x.com/Dev_anik2003/status/1959346384835866703",
  },
  {
    name: "AS",
    body: "Bro I am hoping just one day to make a project that goes as viral as yours and feel that I have achieved something. And thanks to this AI Fiesta thing that I found you",
    img: "https://pbs.twimg.com/profile_images/1961418862525911043/um_csZ3P_400x400.jpg",
    href: "https://x.com/MAD_as_25/status/1959341901909221530",
  },
  {
    name: "divyraj.",
    body: "Thank you man, I promise I'll not ask stupid questions",
    img: "https://pbs.twimg.com/profile_images/1961139793724936195/JGDN6sJp_400x400.jpg",
    href: "https://x.com/divyraj0100/status/1959334287804924301",
  },
  {
    name: "#BanAmericanAppsInIndia",
    body: "🗣️🗣️🗣️🗣️🔥🔥🔥",
    img: "https://pbs.twimg.com/profile_images/1959158517148872704/GOm0INFB_400x400.jpg",
    href: "https://x.com/nyggachad/status/1959332290091245749",
  },
  {
    name: "Aditya Pattanayak",
    body: "Bruh....are u fr?? Hell YAAYYYYY",
    img: "https://pbs.twimg.com/profile_images/1925394018017677312/lK5dgLD5_400x400.jpg",
    href: "https://x.com/AdityaPat_/status/1959324524903817694",
  },
  {
    name: "Kushagra Wadhwa",
    body: "Raise money for it using buy me a coffee or something. You could make it profitable",
    img: "https://pbs.twimg.com/profile_images/1677162807266254849/-8XzQiYx_400x400.jpg",
    href: "https://x.com/Kushagraw12/status/1959318020289188099",
  },
  {
    name: "soumya",
    body: "crazy work",
    img: "https://pbs.twimg.com/profile_images/1957842672179376129/gZRduCEd_400x400.jpg",
    href: "https://x.com/Soumymaheshwri/status/1959313961842798603",
  },
  {
    name: "Arun",
    body: "(No text content)",
    img: "https://pbs.twimg.com/profile_images/1947577208249454595/EMGQJvwU_400x400.jpg",
    href: "https://x.com/hiarun01/status/1959279800964571503",
  },
  {
    name: "Apurba Mohapatra.",
    body: "bro its wonderfull",
    img: "https://pbs.twimg.com/profile_images/1708162645386567680/UYsW6U5R_400x400.jpg",
    href: "https://x.com/ApurbaMohaptra/status/1959279455404163474",
  },
];

export const reviews: TweetReview[] = reviewsWithoutUsername.map((review) => {
  const hrefPart = new URL(review.href).pathname.split("/");

  const username = hrefPart[1] ? `@${hrefPart[1]}` : "anon";

  return {
    ...review,
    username,
  };
});
