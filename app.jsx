const { useState, useEffect, useMemo, useCallback } = React;

/* ============================== DESIGN TOKENS ============================== */
const COLORS = {
  paper: "#F5ECD7",
  paperDeep: "#EFE2C2",
  ink: "#2A1D14",
  inkSoft: "#5A4A3A",
  chili: "#A63A2A",
  chiliDeep: "#8A2E20",
  turmeric: "#C98A2E",
  curry: "#4C6B3A",
  line: "#D8C7A1",
  white: "#FFFBF2",
};

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Karla:wght@400;500;600;700&display=swap');";

/* ============================== SEED DATA ============================== */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SEASONS = ["winter", "summer", "monsoon"];

function getCurrentSeason() {
  const m = new Date().getMonth() + 1; // 1-12
  if (m >= 3 && m <= 6) return "summer";
  if (m >= 7 && m <= 9) return "monsoon";
  return "winter";
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function daysBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ingredient: id, name, unit (g|ml|piece|bunch), category, staple
const ING = [
  { id: "rice", name: "Rice", unit: "g", category: "grain" },
  { id: "wheat_flour", name: "Wheat flour (atta)", unit: "g", category: "grain", staple: true },
  { id: "besan", name: "Besan (gram flour)", unit: "g", category: "grain" },
  { id: "poha", name: "Poha (flattened rice)", unit: "g", category: "grain" },
  { id: "rava", name: "Rava (sooji)", unit: "g", category: "grain" },
  { id: "bread", name: "Bread", unit: "piece", category: "grain" },
  { id: "moong_dal", name: "Moong dal", unit: "g", category: "dal" },
  { id: "urad_dal", name: "Urad dal", unit: "g", category: "dal" },
  { id: "masoor_dal", name: "Masoor dal", unit: "g", category: "dal" },
  { id: "toor_dal", name: "Toor dal", unit: "g", category: "dal" },
  { id: "chana_dal", name: "Chana dal", unit: "g", category: "dal" },
  { id: "rajma", name: "Rajma", unit: "g", category: "dal" },
  { id: "sprouts", name: "Mixed sprouts", unit: "g", category: "dal" },
  { id: "roasted_chana", name: "Roasted chana", unit: "g", category: "dal", staple: true },
  { id: "curd", name: "Curd (dahi)", unit: "ml", category: "dairy" },
  { id: "paneer", name: "Paneer", unit: "g", category: "dairy" },
  { id: "milk", name: "Milk", unit: "ml", category: "dairy" },
  { id: "ghee", name: "Ghee", unit: "ml", category: "dairy", staple: true },
  { id: "tomato", name: "Tomato", unit: "g", category: "vegetable" },
  { id: "potato", name: "Potato", unit: "g", category: "vegetable" },
  { id: "bhindi", name: "Bhindi (okra)", unit: "g", category: "vegetable", season: ["summer", "monsoon"] },
  { id: "gobi", name: "Cauliflower", unit: "g", category: "vegetable", season: ["winter"] },
  { id: "lauki", name: "Lauki (bottle gourd)", unit: "g", category: "vegetable", season: ["summer", "monsoon"] },
  { id: "guvar", name: "Guvar fali", unit: "g", category: "vegetable", season: ["summer"] },
  { id: "palak", name: "Palak (spinach)", unit: "g", category: "vegetable", season: ["winter"] },
  { id: "methi", name: "Methi leaves", unit: "g", category: "vegetable", season: ["winter"] },
  { id: "peas", name: "Green peas", unit: "g", category: "vegetable", season: ["winter"] },
  { id: "cucumber", name: "Cucumber", unit: "g", category: "vegetable" },
  { id: "carrot", name: "Carrot", unit: "g", category: "vegetable", season: ["winter"] },
  { id: "beans", name: "French beans", unit: "g", category: "vegetable" },
  { id: "capsicum", name: "Capsicum", unit: "g", category: "vegetable" },
  { id: "corn", name: "Corn kernels", unit: "g", category: "vegetable", season: ["summer", "monsoon"] },
  { id: "tinda", name: "Tinda", unit: "g", category: "vegetable", season: ["summer"] },
  { id: "coriander_leaves", name: "Coriander leaves", unit: "bunch", category: "vegetable" },
  { id: "curry_leaves", name: "Curry leaves", unit: "bunch", category: "vegetable" },
  { id: "coconut", name: "Fresh coconut (grated)", unit: "g", category: "vegetable" },
  { id: "hing", name: "Hing (asafoetida)", unit: "g", category: "spice", staple: true },
  { id: "jeera", name: "Jeera (cumin seeds)", unit: "g", category: "spice", staple: true },
  { id: "oil", name: "Cooking oil", unit: "ml", category: "oil", staple: true },
];

const ING_BY_ID = Object.fromEntries(ING.map((i) => [i.id, i]));

// recipe: id, name, course, cuisine, flavourBase, ingredients[{id,qty}] (qty at servesAdults=2),
// effort(low|medium|high), oilLevel(low|medium|high|fried), seasonOk([...]|'all'),
// kidFriendly, travelsWell, repeatGapDays, steps[]
const SEED_RECIPES = [
  // ---- breakfast ----
  r("brk_poha", "Poha", "breakfast", "generic", "hing_jeera",
    [i("poha", 200), i("potato", 100), i("peas", 50), i("oil", 15)],
    "low", "low", "all", true, true, 7,
    ["Soak poha 5 min, drain.", "Temper jeera + hing in oil.", "Add potato, peas, cook 5 min.", "Mix in poha, salt, coriander."]),
  r("brk_upma", "Vegetable Upma", "breakfast", "south", "hing_jeera",
    [i("rava", 200), i("carrot", 50), i("peas", 50), i("oil", 15)],
    "low", "low", "all", true, true, 7,
    ["Roast rava dry till aromatic.", "Temper jeera+hing, add veg, water.", "Stir in rava, cook covered 5 min."]),
  r("brk_besan_cheela", "Besan Cheela", "breakfast", "generic", "besan",
    [i("besan", 200), i("curd", 50), i("oil", 20)],
    "low", "medium", "all", true, true, 7,
    ["Whisk besan with water to batter.", "Pour thin on tawa, cook both sides with a little oil."]),
  r("brk_moong_cheela", "Moong Dal Cheela", "breakfast", "generic", "hing_jeera",
    [i("moong_dal", 200), i("oil", 20)],
    "medium", "medium", "all", true, true, 7,
    ["Soak & grind moong dal to batter.", "Season with hing, jeera, salt.", "Cook thin on tawa like a dosa."]),

  // ---- kid tiffin ----
  r("tif_aloo_paratha", "Aloo Paratha", "tiffin", "north", "hing_jeera",
    [i("wheat_flour", 150), i("potato", 150), i("ghee", 15)],
    "medium", "medium", "all", true, true, 7,
    ["Mash spiced boiled potato.", "Stuff in dough, roll, roast with ghee."]),
  r("tif_curd_rice_box", "Curd Rice Box", "tiffin", "south", "curd",
    [i("rice", 150), i("curd", 150), i("curry_leaves", 1)],
    "low", "low", "all", true, true, 7,
    ["Mash cooked rice with curd, milk.", "Temper curry leaves + jeera on top."]),
  r("tif_veg_cutlet", "Vegetable Cutlet (baked)", "tiffin", "generic", "hing_jeera",
    [i("potato", 150), i("peas", 50), i("carrot", 50), i("oil", 10)],
    "medium", "medium", "all", true, true, 10,
    ["Mash boiled veg with spices.", "Shape into cutlets, shallow-roast on tawa."]),
  r("tif_paneer_roti_roll", "Paneer Stuffed Roti", "tiffin", "north", "hing_jeera",
    [i("wheat_flour", 150), i("paneer", 100), i("oil", 10)],
    "medium", "medium", "all", true, true, 10,
    ["Crumble & spice paneer.", "Stuff in dough, roll, roast."]),
  r("tif_idli", "Steamed Idli", "tiffin", "south", "hing_jeera",
    [i("urad_dal", 100), i("rice", 200)],
    "medium", "low", "all", true, true, 10,
    ["Soak & grind urad dal + rice, ferment overnight.", "Steam in idli moulds 12 min."]),
  r("tif_veg_sandwich", "Grilled Vegetable Sandwich", "tiffin", "generic", "hing_jeera",
    [i("bread", 4), i("capsicum", 50), i("tomato", 50), i("oil", 10)],
    "low", "low", "all", true, true, 10,
    ["Layer sliced veg between bread.", "Grill or tawa-toast lightly with a little oil."]),
  r("tif_corn_chaat", "Boiled Corn Chaat", "tiffin", "generic", "hing_jeera",
    [i("corn", 150)],
    "low", "low", ["summer", "monsoon"], true, true, 7,
    ["Boil corn kernels till tender.", "Toss with lemon, chaat masala, coriander."]),
  r("tif_rava_toast", "Rava Toast", "tiffin", "south", "hing_jeera",
    [i("bread", 4), i("rava", 100), i("curd", 50), i("oil", 10)],
    "low", "medium", "all", true, true, 10,
    ["Make a thin rava-curd batter.", "Dip bread slices, shallow-fry lightly on tawa."]),

  // ---- sabzi dry ----
  r("sab_bhindi", "Bhindi Fry", "sabzi_dry", "north", "hing_jeera",
    [i("bhindi", 300), i("oil", 20)],
    "medium", "medium", ["summer", "monsoon"], true, false, 10,
    ["Slice bhindi, pat dry.", "Cook uncovered on medium flame with hing-jeera till non-sticky."]),
  r("sab_gobi_aloo", "Gobi Aloo", "sabzi_dry", "north", "hing_jeera",
    [i("gobi", 200), i("potato", 150), i("oil", 15)],
    "medium", "medium", ["winter"], true, false, 10,
    ["Temper jeera+hing.", "Add chopped gobi & potato, cover-cook till soft."]),
  r("sab_lauki", "Lauki Sabzi", "sabzi_dry", "generic", "hing_jeera",
    [i("lauki", 300), i("oil", 10)],
    "low", "low", ["summer", "monsoon"], true, false, 7,
    ["Peel & dice lauki.", "Cook with hing-jeera tempering, light water, till soft."]),
  r("sab_guvar", "Guvar Fali", "sabzi_dry", "rajasthani", "hing_jeera",
    [i("guvar", 250), i("oil", 15)],
    "medium", "medium", ["summer"], false, false, 10,
    ["Stringy guvar, chop fine.", "Cook slow with hing-jeera till tender."]),
  r("sab_palak", "Palak Sabzi (dry)", "sabzi_dry", "north", "hing_jeera",
    [i("palak", 300), i("oil", 10)],
    "low", "low", ["winter"], true, false, 7,
    ["Wash & chop palak.", "Wilt down with hing-jeera tempering, no extra water."]),
  r("sab_methi_aloo", "Methi Aloo", "sabzi_dry", "north", "hing_jeera",
    [i("methi", 200), i("potato", 150), i("oil", 15)],
    "medium", "medium", ["winter"], false, false, 10,
    ["Chop methi finely, squeeze bitterness with salt.", "Cook with potato and light tempering."]),
  r("sab_capsicum_besan", "Capsicum Besan Sabzi", "sabzi_dry", "north", "besan",
    [i("capsicum", 250), i("besan", 30), i("oil", 15)],
    "medium", "medium", "all", false, false, 10,
    ["Slice capsicum, cook with hing-jeera till soft.", "Sprinkle roasted besan, toss well."]),
  r("sab_carrot_beans", "Carrot Beans Sabzi", "sabzi_dry", "generic", "hing_jeera",
    [i("carrot", 150), i("beans", 150), i("oil", 10)],
    "low", "low", ["winter"], true, false, 10,
    ["Finely chop carrot & beans.", "Cook with hing-jeera tempering till just tender."]),
  r("sab_tinda", "Tinda Sabzi", "sabzi_dry", "generic", "hing_jeera",
    [i("tinda", 300), i("oil", 10)],
    "low", "low", ["summer"], false, false, 10,
    ["Peel & dice tinda.", "Cook with hing-jeera tempering, light water, till soft."]),

  // ---- sabzi gravy ----
  r("sab_mixveg_tomato", "Mixed Veg (tomato base)", "sabzi_gravy", "north", "tomato",
    [i("tomato", 200), i("carrot", 100), i("beans", 100), i("peas", 50), i("oil", 15)],
    "medium", "medium", "all", true, false, 10,
    ["Puree tomato for base.", "Cook mixed veg in tomato gravy with hing-jeera."]),
  r("sab_kadhi", "Curd Kadhi", "sabzi_gravy", "generic", "curd",
    [i("curd", 300), i("besan", 40), i("oil", 10)],
    "medium", "low", "all", true, false, 10,
    ["Whisk curd with besan, water.", "Simmer slowly with hing-jeera tempering till thick."]),
  r("sab_gatte", "Besan Gatte Curry", "sabzi_gravy", "rajasthani", "besan",
    [i("besan", 200), i("curd", 150), i("oil", 15)],
    "high", "medium", "all", false, false, 14,
    ["Steam besan rolls (gatte), slice.", "Simmer in curd-besan gravy."]),
  r("sab_tomato_paneer", "Tomato Paneer (low oil)", "sabzi_gravy", "north", "tomato",
    [i("paneer", 200), i("tomato", 250), i("oil", 15)],
    "medium", "medium", "all", true, false, 10,
    ["Simmer tomato puree with hing-jeera.", "Add paneer cubes, cook 5 min, don't overcook."]),
  r("sab_veg_kurma", "Vegetable Kurma (coconut)", "sabzi_gravy", "south", "coconut",
    [i("carrot", 100), i("beans", 100), i("peas", 50), i("coconut", 50), i("oil", 10)],
    "medium", "low", "all", true, false, 10,
    ["Cook mixed veg till tender.", "Grind coconut to a light paste, simmer veg in it with hing-jeera."]),

  // ---- dal ----
  r("dal_moong", "Moong Dal Tadka", "dal", "generic", "hing_jeera",
    [i("moong_dal", 200), i("tomato", 100), i("oil", 10)],
    "low", "low", "all", true, false, 3,
    ["Pressure cook dal with turmeric.", "Temper hing-jeera-tomato, pour over dal."]),
  r("dal_toor", "Toor Dal", "dal", "generic", "hing_jeera",
    [i("toor_dal", 200), i("tomato", 100), i("oil", 10)],
    "low", "low", "all", true, false, 3,
    ["Pressure cook toor dal.", "Simple hing-jeera tempering, tomato for tang."]),
  r("dal_chana", "Chana Dal", "dal", "generic", "hing_jeera",
    [i("chana_dal", 200), i("tomato", 100), i("oil", 10)],
    "medium", "low", "all", true, false, 4,
    ["Soak & pressure cook chana dal.", "Temper hing-jeera, simmer with tomato."]),
  r("dal_rajma", "Rajma (no-onion)", "dal", "north", "tomato",
    [i("rajma", 200), i("tomato", 200), i("oil", 15)],
    "high", "medium", "all", true, false, 14,
    ["Soak rajma overnight, pressure cook well.", "Simmer in tomato-hing gravy till thick."]),
  r("dal_masoor", "Masoor Dal", "dal", "generic", "hing_jeera",
    [i("masoor_dal", 200), i("tomato", 100), i("oil", 10)],
    "low", "low", "all", true, false, 3,
    ["Pressure cook masoor dal till soft.", "Temper hing-jeera-tomato, pour over dal."]),

  // ---- grain ----
  r("grn_rice", "Steamed Rice", "grain", "generic", "hing_jeera",
    [i("rice", 200)], "low", "low", "all", true, false, 1,
    ["Wash rice, cook 2:1 water ratio till fluffy."]),
  r("grn_roti", "Roti", "grain", "generic", "hing_jeera",
    [i("wheat_flour", 200)], "low", "low", "all", true, true, 1,
    ["Knead soft dough, rest 15 min.", "Roll thin, roast on tawa, puff on flame."]),
  r("grn_jeera_rice", "Jeera Rice", "grain", "north", "hing_jeera",
    [i("rice", 200), i("ghee", 10)], "low", "low", "all", true, false, 3,
    ["Temper jeera in ghee.", "Add soaked rice + water, cook till done."]),
  r("grn_missi_roti", "Missi Roti", "grain", "north", "besan",
    [i("wheat_flour", 150), i("besan", 50), i("oil", 10)],
    "medium", "low", "all", true, true, 3,
    ["Knead wheat flour with besan, spices.", "Roll and roast on tawa with a little oil."]),

  // ---- one pot ----
  r("op_khichdi", "Khichdi", "one_pot", "generic", "hing_jeera",
    [i("rice", 150), i("moong_dal", 100), i("oil", 10)],
    "low", "low", "all", true, false, 7,
    ["Pressure cook rice+dal together with turmeric.", "Top with ghee-hing-jeera tempering."]),
  r("op_pulao", "Vegetable Pulao (no-onion)", "one_pot", "north", "hing_jeera",
    [i("rice", 200), i("carrot", 50), i("peas", 50), i("beans", 50), i("ghee", 15)],
    "medium", "medium", "all", true, false, 10,
    ["Sauté veg in ghee with whole spices.", "Add rice + water, cook covered till done."]),
  r("op_veg_khichdi", "Vegetable Khichdi", "one_pot", "generic", "hing_jeera",
    [i("rice", 150), i("moong_dal", 100), i("carrot", 50), i("peas", 50), i("oil", 10)],
    "low", "low", "all", true, false, 7,
    ["Pressure cook rice, dal and chopped veg together with turmeric.", "Top with a light ghee-hing-jeera tempering."]),

  // ---- south indian ----
  r("sth_sambar", "Sambar", "south", "south", "tomato",
    [i("toor_dal", 150), i("tomato", 150), i("beans", 100), i("curry_leaves", 1), i("oil", 10)],
    "medium", "low", "all", true, false, 10,
    ["Cook toor dal soft.", "Add tamarind, veg, sambar masala, simmer.", "Temper curry leaves + hing."]),
  r("sth_rasam", "Rasam", "south", "south", "tomato",
    [i("tomato", 150), i("toor_dal", 50), i("curry_leaves", 1)],
    "low", "low", "all", true, false, 10,
    ["Boil tomato with tamarind, rasam powder.", "Add cooked dal water, simmer thin.", "Temper curry leaves."]),
  r("sth_curd_rice", "Curd Rice", "south", "south", "curd",
    [i("rice", 200), i("curd", 200), i("curry_leaves", 1)],
    "low", "low", "all", true, true, 10,
    ["Mash cooked rice with curd & milk.", "Temper mustard-curry leaves, mix in."]),
  r("sth_poriyal", "Vegetable Poriyal", "south", "south", "coconut",
    [i("beans", 200), i("coconut", 50), i("oil", 10)],
    "medium", "low", "all", true, false, 10,
    ["Chop veg fine, steam-cook.", "Toss with grated coconut & light tempering."]),

  // ---- snack ----
  r("snk_roasted_chana", "Roasted Chana Chaat", "snack", "generic", "hing_jeera",
    [i("roasted_chana", 150), i("tomato", 50), i("cucumber", 50)],
    "low", "low", "all", true, true, 7,
    ["Mix roasted chana with chopped veg, chaat masala, lemon."]),
  r("snk_sprouts_chaat", "Sprouts Chaat", "snack", "generic", "hing_jeera",
    [i("sprouts", 200), i("tomato", 50), i("cucumber", 50)],
    "low", "low", "all", true, true, 7,
    ["Steam sprouts lightly.", "Toss with chopped veg, lemon, chaat masala."]),

  // ---- accompaniment ----
  r("acc_raita", "Cucumber Raita", "accompaniment", "generic", "curd",
    [i("curd", 200), i("cucumber", 100)], "low", "low", "all", true, false, 2,
    ["Grate cucumber, mix into whisked curd with roasted jeera powder."]),
  r("acc_curd", "Plain Curd", "accompaniment", "generic", "curd",
    [i("curd", 200)], "low", "low", "all", true, false, 1, ["Serve chilled curd."]),
  r("acc_kachumber", "Kachumber Salad", "accompaniment", "generic", "hing_jeera",
    [i("cucumber", 100), i("tomato", 100), i("carrot", 50)], "low", "low", "all", true, true, 2,
    ["Dice all veg finely, toss with lemon and salt."]),
  r("acc_boondi_raita", "Boondi Raita", "accompaniment", "generic", "curd",
    [i("curd", 200), i("besan", 30), i("oil", 10)], "medium", "medium", "all", true, false, 7,
    ["Fry small besan boondi lightly.", "Soak in water, squeeze, mix into whisked curd with roasted jeera."]),
];

function i(id, qty) {
  return { id, qty };
}
function r(id, name, course, cuisine, flavourBase, ingredients, effort, oilLevel, seasonOk, kidFriendly, travelsWell, repeatGapDays, steps) {
  return { id, name, course, cuisine, flavourBase, ingredients, effort, oilLevel, seasonOk, kidFriendly, travelsWell, repeatGapDays, steps, servesAdults: 2 };
}

const RECIPE_BY_ID = Object.fromEntries(SEED_RECIPES.map((r) => [r.id, r]));

// Small dish visual. No hotlinked internet photos here on purpose — they'd be
// copyrighted, and links break over time. Emoji is a reliable, offline-safe
// default. If you want real photos later, drop a file named "<recipe id>.jpg"
// into an /images folder next to this app — DishIcon will use it automatically
// and only fall back to the emoji if that file doesn't exist.
const RECIPE_EMOJI = {
  brk_poha: "🍚",
  brk_upma: "🥣",
  brk_besan_cheela: "🫓",
  brk_moong_cheela: "🫓",
  tif_aloo_paratha: "🫓",
  tif_curd_rice_box: "🍚",
  tif_veg_cutlet: "🥔",
  tif_paneer_roti_roll: "🧀",
  tif_idli: "⚪",
  tif_veg_sandwich: "🥪",
  tif_corn_chaat: "🌽",
  tif_rava_toast: "🍞",
  sab_bhindi: "🥘",
  sab_gobi_aloo: "🥦",
  sab_lauki: "🥘",
  sab_guvar: "🥘",
  sab_palak: "🥬",
  sab_methi_aloo: "🥘",
  sab_capsicum_besan: "🫑",
  sab_carrot_beans: "🥕",
  sab_tinda: "🥘",
  sab_mixveg_tomato: "🍅",
  sab_kadhi: "🥣",
  sab_gatte: "🍛",
  sab_tomato_paneer: "🧀",
  sab_veg_kurma: "🥥",
  dal_moong: "🍛",
  dal_toor: "🍛",
  dal_chana: "🍛",
  dal_rajma: "🫘",
  dal_masoor: "🍛",
  grn_rice: "🍚",
  grn_roti: "🫓",
  grn_jeera_rice: "🍚",
  grn_missi_roti: "🫓",
  op_khichdi: "🍲",
  op_pulao: "🍛",
  op_veg_khichdi: "🍲",
  sth_sambar: "🍲",
  sth_rasam: "🥣",
  sth_curd_rice: "🍚",
  sth_poriyal: "🥗",
  snk_roasted_chana: "🥜",
  snk_sprouts_chaat: "🌱",
  acc_raita: "🥒",
  acc_curd: "🥛",
  acc_kachumber: "🥗",
  acc_boondi_raita: "🥣",
};
const COURSE_EMOJI = {
  breakfast: "🍽️",
  tiffin: "🍱",
  sabzi_dry: "🥘",
  sabzi_gravy: "🍛",
  dal: "🍛",
  grain: "🫓",
  one_pot: "🍲",
  south: "🍚",
  snack: "🥜",
  accompaniment: "🥗",
};

function getDishEmoji(rec) {
  return RECIPE_EMOJI[rec.id] || COURSE_EMOJI[rec.course] || "🍽️";
}

// meal slot templates. Each slot lists which "course groups" it needs, in order.
// A course group is an array of acceptable courses (generator picks ONE recipe per group).
function slotTemplates(dayIndex) {
  const isWeekday = dayIndex <= 4; // Mon-Fri
  const slots = [
    {
      key: "breakfast",
      label: isWeekday ? "Breakfast + Kid Tiffin" : "Breakfast",
      groups: [["breakfast", "tiffin"]],
    },
    { key: "lunch", label: "Lunch", groups: [["sabzi_dry", "sabzi_gravy"], ["dal"], ["grain"], ["accompaniment"]] },
    { key: "dinner", label: "Dinner", groups: [["sabzi_gravy", "one_pot"], ["grain"], ["accompaniment"]] },
  ];
  return slots;
}

/* ============================== GENERATOR ============================== */

function scaleQty(qty, adults, kids, kidFactor) {
  const multiplier = (adults + kids * kidFactor) / 2; // base recipe serves 2 adults
  return qty * multiplier;
}

function generateWeek({ recipes, season, oilCapPerWeek = 3, southIndianTarget = [1, 2], usageHistory, existingPlan, lockedKeys, weekStartDate }) {
  const plan = {}; // day -> slotKey -> recipeId
  // working copy of "last used date" that updates AS we assign meals, so gap rules
  // apply correctly both within this week and across weeks — no separate "used this
  // week" hard block, since staples like rice/roti/dal are meant to repeat often.
  const lastUsed = { ...usageHistory };
  let southCount = 0;
  let highOilCount = 0;
  const lastTwoFlavourBases = [];
  const warnings = [];

  const gapDaysFor = (rec, thisDate) => {
    const lastUsedDateStr = lastUsed[rec.id];
    if (!lastUsedDateStr) return Infinity;
    return daysBetween(thisDate, new Date(lastUsedDateStr));
  };

  for (let d = 0; d < 7; d++) {
    plan[d] = {};
    const templates = slotTemplates(d);
    const thisDate = addDays(weekStartDate, d);
    for (const slot of templates) {
      const key = `${d}_${slot.key}`;
      if (lockedKeys.has(key) && existingPlan?.[d]?.[slot.key]) {
        const rid = existingPlan[d][slot.key];
        plan[d][slot.key] = rid;
        lastUsed[rid] = toISODate(thisDate);
        continue;
      }

      const chosenForSlot = [];
      const usedInThisSlot = new Set(); // avoid e.g. same recipe filling two groups of one meal
      let primaryCourse = null; // the main dish of this meal (first group picked)
      for (const group of slot.groups) {
        // A one-pot dish (khichdi, pulao) already IS the grain+dal+veg combo —
        // pairing it with a separate roti/rice, or a separate dal, would double up.
        const isRedundantWithOnePot = primaryCourse === "one_pot" && group.length === 1 && (group[0] === "grain" || group[0] === "dal");
        if (isRedundantWithOnePot) continue;

        const isWeekday = d <= 4;
        const baseFilter = (rec) => {
          if (!group.includes(rec.course)) return false;
          if (usedInThisSlot.has(rec.id)) return false;
          if (slot.key === "breakfast" && isWeekday && (!rec.travelsWell || !rec.kidFriendly)) return false;
          return true;
        };

        let candidates = recipes.filter(
          (rec) => baseFilter(rec) && (rec.seasonOk === "all" || rec.seasonOk.includes(season)) && !(isWeekday && rec.effort === "high") && gapDaysFor(rec, thisDate) >= rec.repeatGapDays
        );

        if (candidates.length === 0) {
          // relax rotation gap first
          candidates = recipes.filter((rec) => baseFilter(rec) && (rec.seasonOk === "all" || rec.seasonOk.includes(season)));
        }
        if (candidates.length === 0) {
          // relax season next
          candidates = recipes.filter((rec) => baseFilter(rec));
        }
        if (candidates.length === 0) {
          warnings.push(`Not enough recipes tagged for "${group.join("/")}" — add more to the Recipes tab.`);
          continue;
        }

        // score: prefer recipes not used recently, within oil/cuisine/flavour rules
        const scored = candidates.map((rec) => {
          let score = 0;
          const gap = gapDaysFor(rec, thisDate);
          score += Math.min(isFinite(gap) ? gap : 30, 30) * 0.3; // longer since last use = better
          if (rec.oilLevel === "high" || rec.oilLevel === "fried") {
            if (highOilCount >= oilCapPerWeek) score -= 5;
          }
          if (rec.oilLevel === "fried" && isWeekday) score -= 3;
          if (rec.cuisine === "south") {
            if (southCount < southIndianTarget[0]) score += 2;
            if (southCount >= southIndianTarget[1]) score -= 4;
          }
          if (lastTwoFlavourBases.includes(rec.flavourBase)) score -= 1;
          else score += 1;
          score += Math.random() * 1.5; // jitter
          return { rec, score };
        });
        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, Math.min(5, scored.length));
        const pick = top[Math.floor(Math.random() * top.length)].rec;

        if (primaryCourse === null) primaryCourse = pick.course;
        chosenForSlot.push(pick.id);
        usedInThisSlot.add(pick.id);
        lastUsed[pick.id] = toISODate(thisDate);
        if (pick.oilLevel === "high" || pick.oilLevel === "fried") highOilCount++;
        if (pick.cuisine === "south") southCount++;
        lastTwoFlavourBases.push(pick.flavourBase);
        if (lastTwoFlavourBases.length > 2) lastTwoFlavourBases.shift();
      }
      plan[d][slot.key] = chosenForSlot.length === 1 ? chosenForSlot[0] : chosenForSlot;
    }
  }

  return { plan, warnings, history: lastUsed };
}

function flattenPlanRecipeIds(plan) {
  const ids = [];
  for (const d of Object.keys(plan)) {
    for (const slotKey of Object.keys(plan[d])) {
      const v = plan[d][slotKey];
      if (Array.isArray(v)) ids.push(...v);
      else ids.push(v);
    }
  }
  return ids;
}

function buildGroceryList({ plan, recipes, adults, kids, kidFactor }) {
  const totals = {}; // ingredientId -> qty
  const ids = flattenPlanRecipeIds(plan);
  for (const rid of ids) {
    const rec = RECIPE_BY_ID_LOOKUP(recipes, rid);
    if (!rec) continue;
    for (const ing of rec.ingredients) {
      const ingredient = ING_BY_ID[ing.id];
      if (!ingredient || ingredient.category === "spice" || ingredient.category === "oil") continue;
      const scaled = scaleQty(ing.qty, adults, kids, kidFactor);
      totals[ing.id] = (totals[ing.id] || 0) + scaled;
    }
  }
  const groups = { "Sabzi mandi": [], Kirana: [], Dairy: [], Other: [] };
  for (const [id, qty] of Object.entries(totals)) {
    const ingredient = ING_BY_ID[id];
    if (!ingredient) continue;
    let group = "Other";
    if (ingredient.category === "vegetable") group = "Sabzi mandi";
    else if (ingredient.category === "grain" || ingredient.category === "dal") group = "Kirana";
    else if (ingredient.category === "dairy") group = "Dairy";
    groups[group].push({ id, name: ingredient.name, qty: Math.round(qty), unit: ingredient.unit });
  }
  for (const g of Object.keys(groups)) groups[g].sort((a, b) => a.name.localeCompare(b.name));
  return groups;
}

function RECIPE_BY_ID_LOOKUP(recipes, id) {
  return recipes.find((r) => r.id === id);
}

function formatQty(qty, unit) {
  if (unit === "g") return qty >= 1000 ? `${(qty / 1000).toFixed(1)} kg` : `${qty} g`;
  if (unit === "ml") return qty >= 1000 ? `${(qty / 1000).toFixed(1)} L` : `${qty} ml`;
  if (unit === "bunch") return `${Math.max(1, Math.round(qty))} bunch`;
  return `${Math.max(1, Math.round(qty))} pc`;
}

/* ============================== STORAGE HELPERS ============================== */

const STORAGE_KEYS = {
  recipes: "mealplanner:recipes",
  plan: "mealplanner:plan",
  household: "mealplanner:household",
  history: "mealplanner:history",
  locks: "mealplanner:locks",
};

async function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* storage unavailable or corrupt value */
  }
  return fallback;
}
async function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* best effort — e.g. storage full or blocked */
  }
}

/* ============================== UI ============================== */

function MealPlanner() {
  const [recipes, setRecipes] = useState(SEED_RECIPES);
  const [household, setHousehold] = useState({ adults: 2, kids: 1, kidFactor: 0.5 });
  const [plan, setPlan] = useState(null);
  const [usageHistory, setUsageHistory] = useState({}); // recipeId -> ISO date it was last scheduled
  const [lockedKeys, setLockedKeys] = useState(new Set());
  const [tab, setTab] = useState("today");
  const [todayIdx, setTodayIdx] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [loaded, setLoaded] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [toast, setToast] = useState(null);
  const season = getCurrentSeason();

  useEffect(() => {
    (async () => {
      const [r, h, p, hist, locks] = await Promise.all([
        loadStorage(STORAGE_KEYS.recipes, SEED_RECIPES),
        loadStorage(STORAGE_KEYS.household, { adults: 2, kids: 1, kidFactor: 0.5 }),
        loadStorage(STORAGE_KEYS.plan, null),
        loadStorage(STORAGE_KEYS.history, {}),
        loadStorage(STORAGE_KEYS.locks, []),
      ]);
      setRecipes(r);
      setHousehold(h);
      setPlan(p);
      setUsageHistory(hist);
      setLockedKeys(new Set(locks));
      setLoaded(true);
    })();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const doGenerate = useCallback(
    (keepLocks) => {
      const weekStartDate = getMonday(new Date());
      const { plan: newPlan, warnings: w, history: newHistory } = generateWeek({
        recipes,
        season,
        usageHistory,
        existingPlan: keepLocks ? plan : null,
        lockedKeys: keepLocks ? lockedKeys : new Set(),
        weekStartDate,
      });
      setPlan(newPlan);
      setWarnings(w);
      setUsageHistory(newHistory);
      saveStorage(STORAGE_KEYS.plan, newPlan);
      saveStorage(STORAGE_KEYS.history, newHistory);
      showToast("Week generated");
    },
    [recipes, season, usageHistory, plan, lockedKeys, showToast]
  );

  useEffect(() => {
    if (loaded && !plan) doGenerate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  useEffect(() => {
    if (loaded) saveStorage(STORAGE_KEYS.household, household);
  }, [household, loaded]);

  const toggleLock = (day, slotKey) => {
    const key = `${day}_${slotKey}`;
    const next = new Set(lockedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setLockedKeys(next);
    saveStorage(STORAGE_KEYS.locks, Array.from(next));
  };

  const swapMeal = (day, slotKey) => {
    const templates = slotTemplates(day);
    const slot = templates.find((s) => s.key === slotKey);
    if (!slot) return;
    const groupIdx = 0; // swap the primary component
    const group = slot.groups[groupIdx];
    const currentVal = plan[day][slotKey];
    const currentIds = Array.isArray(currentVal) ? currentVal : [currentVal];
    const currentPrimary = currentIds[0];
    const candidates = recipes.filter(
      (rec) =>
        group.includes(rec.course) &&
        rec.id !== currentPrimary &&
        (rec.seasonOk === "all" || rec.seasonOk.includes(season)) &&
        !(slotKey === "breakfast" && day <= 4 && (!rec.travelsWell || !rec.kidFriendly))
    );
    if (candidates.length === 0) {
      showToast("No alternative recipe available for this slot");
      return;
    }
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const newIds = [pick.id, ...currentIds.slice(1)];
    const newPlan = { ...plan, [day]: { ...plan[day], [slotKey]: newIds.length === 1 ? newIds[0] : newIds } };
    setPlan(newPlan);
    saveStorage(STORAGE_KEYS.plan, newPlan);
    showToast(`Swapped to ${pick.name}`);
  };

  const groceryGroups = useMemo(() => {
    if (!plan) return null;
    return buildGroceryList({ plan, recipes, adults: household.adults, kids: household.kids, kidFactor: household.kidFactor });
  }, [plan, recipes, household]);

  if (!loaded || !plan) {
    return (
      <div style={{ fontFamily: "Karla, sans-serif", padding: 40, textAlign: "center", color: COLORS.ink }}>
        <style>{FONT_IMPORT}</style>
        Loading your kitchen…
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Karla', sans-serif",
        background: COLORS.paper,
        minHeight: "100vh",
        color: COLORS.ink,
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        button { font-family: 'Karla', sans-serif; cursor: pointer; }
        h1, h2, h3, .serif { font-family: 'Lora', serif; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <Header season={season} household={household} setHousehold={setHousehold} onRegenerate={() => doGenerate(true)} />

      {warnings.length > 0 && (
        <div style={{ background: "#F6E1D2", borderBottom: `1px solid ${COLORS.line}`, padding: "10px 16px", fontSize: 13, color: COLORS.chiliDeep }}>
          {warnings.map((w, idx) => (
            <div key={idx}>⚠ {w}</div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
        {tab === "today" && (
          <TodayView
            plan={plan}
            recipes={recipes}
            dayIdx={todayIdx}
            setDayIdx={setTodayIdx}
            onSwap={swapMeal}
            lockedKeys={lockedKeys}
            onToggleLock={toggleLock}
            household={household}
          />
        )}
        {tab === "week" && (
          <WeekView plan={plan} recipes={recipes} onSwap={swapMeal} lockedKeys={lockedKeys} onToggleLock={toggleLock} household={household} />
        )}
        {tab === "list" && <ListView groups={groceryGroups} />}
        {tab === "recipes" && <RecipesView recipes={recipes} setRecipes={(r) => { setRecipes(r); saveStorage(STORAGE_KEYS.recipes, r); }} />}
      </div>

      <TabBar tab={tab} setTab={setTab} />

      {toast && (
        <div
          style={{
            position: "absolute",
            bottom: 74,
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.ink,
            color: COLORS.white,
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function Header({ season, household, setHousehold, onRegenerate }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: COLORS.ink, color: COLORS.white, padding: "18px 16px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Ghar ka Khana</h1>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2, textTransform: "capitalize" }}>{season} · no onion/garlic · low oil</div>
        </div>
        <button
          onClick={onRegenerate}
          style={{ background: COLORS.chili, color: COLORS.white, border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600 }}
        >
          New week
        </button>
      </div>
      <button
        onClick={() => setOpen(!open)}
        style={{ marginTop: 10, background: "transparent", border: `1px solid ${COLORS.turmeric}`, color: COLORS.turmeric, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}
      >
        {household.adults} adults · {household.kids} kids {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <NumberField label="Adults" value={household.adults} onChange={(v) => setHousehold({ ...household, adults: v })} />
          <NumberField label="Kids" value={household.kids} onChange={(v) => setHousehold({ ...household, kids: v })} />
          <NumberField
            label="Kid portion factor"
            step={0.1}
            value={household.kidFactor}
            onChange={(v) => setHousehold({ ...household, kidFactor: v })}
          />
        </div>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1 }) {
  return (
    <label style={{ fontSize: 11, opacity: 0.85, display: "flex", flexDirection: "column", gap: 3 }}>
      {label}
      <input
        type="number"
        step={step}
        min={0}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{ width: 64, padding: "4px 6px", borderRadius: 6, border: "none", fontSize: 13 }}
      />
    </label>
  );
}

function TabBar({ tab, setTab }) {
  const items = [
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },
    { key: "list", label: "List" },
    { key: "recipes", label: "Recipes" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        borderTop: `1px solid ${COLORS.line}`,
        background: COLORS.white,
      }}
    >
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => setTab(it.key)}
          style={{
            flex: 1,
            padding: "12px 0",
            border: "none",
            background: "transparent",
            color: tab === it.key ? COLORS.chili : COLORS.inkSoft,
            fontWeight: tab === it.key ? 700 : 500,
            fontSize: 13,
            borderTop: tab === it.key ? `2px solid ${COLORS.chili}` : "2px solid transparent",
            marginTop: -1,
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function recipeIdsForSlot(val) {
  return Array.isArray(val) ? val : [val];
}

function MealCard({ label, recipeIds, recipes, onSwap, locked, onToggleLock, household }) {
  const recs = recipeIds.map((id) => RECIPE_BY_ID_LOOKUP(recipes, id)).filter(Boolean);
  if (recs.length === 0) return null;
  return (
    <div
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 600 }}>{label}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={onToggleLock}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 16,
              color: locked ? COLORS.turmeric : COLORS.line,
            }}
            title={locked ? "Locked" : "Lock this meal"}
          >
            {locked ? "🔒" : "🔓"}
          </button>
        </div>
      </div>
      {recs.map((rec) => {
        const basicIngredients = rec.ingredients
          .map((ing) => ({ ing, meta: ING_BY_ID[ing.id] }))
          .filter(({ meta }) => meta && meta.category !== "spice" && meta.category !== "oil");
        return (
          <div key={rec.id} style={{ marginBottom: 10, display: "flex", gap: 10 }}>
            <DishIcon rec={rec} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 17, fontWeight: 600 }}>
                {rec.name}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, marginBottom: 6, flexWrap: "wrap" }}>
                <Tag>{rec.effort} effort</Tag>
                <Tag>{rec.oilLevel} oil</Tag>
                {rec.kidFriendly && <Tag color={COLORS.curry}>kid-friendly</Tag>}
              </div>
              {basicIngredients.length > 0 && (
                <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
                  <strong style={{ color: COLORS.ink }}>Need: </strong>
                  {basicIngredients
                    .map(({ ing, meta }) => {
                      const qty = household ? scaleQty(ing.qty, household.adults, household.kids, household.kidFactor) : ing.qty;
                      return `${meta.name} (${formatQty(qty, meta.unit)})`;
                    })
                    .join(", ")}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {!locked && (
        <button
          onClick={onSwap}
          style={{
            marginTop: 8,
            background: "transparent",
            border: `1px solid ${COLORS.chili}`,
            color: COLORS.chili,
            borderRadius: 8,
            padding: "5px 10px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Swap
        </button>
      )}
    </div>
  );
}

function Tag({ children, color }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 20,
        background: COLORS.paperDeep,
        color: color || COLORS.inkSoft,
        border: `1px solid ${COLORS.line}`,
      }}
    >
      {children}
    </span>
  );
}

function DishIcon({ rec, size = 44 }) {
  const [failed, setFailed] = useState(false);
  const emoji = getDishEmoji(rec);
  const wrapStyle = {
    width: size,
    height: size,
    borderRadius: 10,
    border: `1px solid ${COLORS.line}`,
    flexShrink: 0,
    background: COLORS.paperDeep,
  };
  if (failed) {
    return (
      <div style={{ ...wrapStyle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5 }}>
        {emoji}
      </div>
    );
  }
  return (
    <img
      src={`images/${rec.id}.jpg`}
      alt={rec.name}
      onError={() => setFailed(true)}
      style={{ ...wrapStyle, objectFit: "cover" }}
    />
  );
}

function TodayView({ plan, recipes, dayIdx, setDayIdx, onSwap, lockedKeys, onToggleLock, household }) {
  const templates = slotTemplates(dayIdx);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }}>
        {DAYS.map((d, idx) => (
          <button
            key={d}
            onClick={() => setDayIdx(idx)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: `1px solid ${idx === dayIdx ? COLORS.chili : COLORS.line}`,
              background: idx === dayIdx ? COLORS.chili : "transparent",
              color: idx === dayIdx ? COLORS.white : COLORS.inkSoft,
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {d}
          </button>
        ))}
      </div>
      {templates.map((slot) => (
        <MealCard
          key={slot.key}
          label={slot.label}
          recipeIds={recipeIdsForSlot(plan[dayIdx][slot.key])}
          recipes={recipes}
          onSwap={() => onSwap(dayIdx, slot.key)}
          locked={lockedKeys.has(`${dayIdx}_${slot.key}`)}
          onToggleLock={() => onToggleLock(dayIdx, slot.key)}
          household={household}
        />
      ))}
    </div>
  );
}

function WeekView({ plan, recipes, onSwap, lockedKeys, onToggleLock, household }) {
  return (
    <div style={{ padding: 16 }}>
      {DAYS.map((d, dayIdx) => {
        const templates = slotTemplates(dayIdx);
        return (
          <div key={d} style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, color: COLORS.chiliDeep }}>{d}</h3>
            {templates.map((slot) => (
              <MealCard
                key={slot.key}
                label={slot.label}
                recipeIds={recipeIdsForSlot(plan[dayIdx][slot.key])}
                recipes={recipes}
                onSwap={() => onSwap(dayIdx, slot.key)}
                locked={lockedKeys.has(`${dayIdx}_${slot.key}`)}
                onToggleLock={() => onToggleLock(dayIdx, slot.key)}
                household={household}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ListView({ groups }) {
  const [checked, setChecked] = useState({});
  if (!groups) return null;
  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const asText = () => {
    let out = "Grocery list — this week\n\n";
    for (const [group, items] of Object.entries(groups)) {
      if (items.length === 0) continue;
      out += `${group}\n`;
      for (const it of items) out += `- ${it.name}: ${formatQty(it.qty, it.unit)}\n`;
      out += "\n";
    }
    return out;
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(asText());
    } catch (e) {
      /* clipboard may be unavailable */
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>This week's list</h2>
        <button
          onClick={copyText}
          style={{ background: COLORS.chili, color: COLORS.white, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600 }}
        >
          Copy for WhatsApp
        </button>
      </div>
      {Object.entries(groups).map(([group, items]) =>
        items.length === 0 ? null : (
          <div key={group} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.inkSoft, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {group}
            </div>
            {items.map((it) => (
              <div
                key={it.id}
                onClick={() => toggle(it.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: `1px solid ${COLORS.line}`,
                  textDecoration: checked[it.id] ? "line-through" : "none",
                  color: checked[it.id] ? COLORS.inkSoft : COLORS.ink,
                }}
              >
                <span>{it.name}</span>
                <span>{formatQty(it.qty, it.unit)}</span>
              </div>
            ))}
          </div>
        )
      )}
      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 12 }}>
        Spices and oil aren't listed here — check your pantry stock separately.
      </div>
    </div>
  );
}

function RecipesView({ recipes, setRecipes }) {
  const [filterCourse, setFilterCourse] = useState("all");
  const courses = ["all", ...Array.from(new Set(recipes.map((r) => r.course)))];
  const filtered = filterCourse === "all" ? recipes : recipes.filter((r) => r.course === filterCourse);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Recipe database ({recipes.length})</h2>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14 }}>
        {courses.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCourse(c)}
            style={{
              padding: "5px 10px",
              borderRadius: 16,
              border: `1px solid ${filterCourse === c ? COLORS.chili : COLORS.line}`,
              background: filterCourse === c ? COLORS.chili : "transparent",
              color: filterCourse === c ? COLORS.white : COLORS.inkSoft,
              fontSize: 12,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {c.replace("_", " ")}
          </button>
        ))}
      </div>
      {filtered.map((rec) => (
        <details
          key={rec.id}
          style={{ background: COLORS.white, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 10, marginBottom: 8 }}
        >
          <summary className="serif" style={{ fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <DishIcon rec={rec} size={32} />
            {rec.name}
          </summary>
          <div style={{ display: "flex", gap: 6, margin: "8px 0", flexWrap: "wrap" }}>
            <Tag>{rec.course.replace("_", " ")}</Tag>
            <Tag>{rec.cuisine}</Tag>
            <Tag>{rec.effort} effort</Tag>
            <Tag>{rec.oilLevel} oil</Tag>
            {rec.kidFriendly && <Tag color={COLORS.curry}>kid-friendly</Tag>}
            {rec.travelsWell && <Tag color={COLORS.turmeric}>travels well</Tag>}
          </div>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            <strong>Ingredients</strong> (serves 2 adults):{" "}
            {rec.ingredients.map((ing) => `${ING_BY_ID[ing.id]?.name || ing.id} ${formatQty(ing.qty, ING_BY_ID[ing.id]?.unit || "g")}`).join(", ")}
          </div>
          <ol style={{ fontSize: 13, paddingLeft: 18, margin: 0 }}>
            {rec.steps.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
        </details>
      ))}
      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 10 }}>
        This is a starter set of {recipes.length} recipes. Add your family's real recipes to improve rotation variety — editing UI is a natural next step for v2.
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MealPlanner />);
