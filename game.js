// ==========================================
// 🔥 KROCHLUPIC UP! — ЧАСТЬ 1 (ПЕРЕМЕННЫЕ) 🔥
// ==========================================
var $el = {};
function $(id) {
    if (!$el[id] || !$el[id].isConnected) {
        $el[id] = document.getElementById(id);
    }
    return $el[id];
}

var coins = 0;
var coinsPerClick = 1;
var totalEarned = 0;
var totalTaps = 0;
var totalPlayTime = 0;
var totalShardsEarned = 0;
var lastShardsForTracking = 0;
var crystals = 0;
var crystalsMax = 1000;
var shards = 0;
var goldenMultiplier = 1;
var goldenTimer = 0;
var unlocked = {};
var bloodMoonActive = false;
var bloodMoonTimer = 0;
var eventMultiplier = 1;
var eventTimer = 0;
var eventName = "";
var currentEventKey = "";
var crystalBoostMultiplier = 1;
var crystalBoostTimer = 0;
var crystalBoostName = "";
var usedPromos = {};
var logoClicks = 0;
var logoClickTimer = null;
var logoCooldown = 0;
var ownedItems = {};
var secretUnlocked = false;
var secretAutoClicker = false;
var secretClickerInterval = null;
var secretAutoClickerTimer = 0;
var depositUnlocked = false;
var depositLevel = 0;
var lastDepositTimeKey = "";
var generatorLevel = 1;
var generatorTimer = 180;
var lastClickTime = 0;
var GENERATOR_MAX_LEVEL = 50;
var GENERATOR_BASE_COST = 100;
var GENERATOR_COST_MULT = 1.5;
var GENERATOR_DURATION = 180;
var smileSkinUnlocked = false;
var smileSkinActive = false;
var lastDisplayedCoins = 0;
var lastShopUpdate = 0;
var BUY_UNLOCK_10 = 25;
var BUY_UNLOCK_25 = 100;
var chestsOpened = 0;
var personalBestCoins = 0;
var lastRecordCheck = 0;
var theftActive = false;
var theftTimer = 0;
var theftTickTimer = null;
var theftTotalLost = 0;
var lastTheftKey = "";
var THEFT_TICK_INTERVAL = 25;
var THEFT_DURATION = 600;
var THEFT_PERCENT = 0.01;
var theftRestored = false;
var UPGRADE_MAX_LEVEL = 699;
var UPGRADE_COST_MULT = 1.05;
var GLOBAL_UPGRADE_COST_MULT = 10;
var profile = { nickname: "", id: "", createdAt: 0 };
var tapTimestamps = [];
var tapViolations = [];
var TAP_LIMIT = 100;
var TAP_WINDOW = 1000;
var VIOLATION_WINDOW = 10000;
var VIOLATION_THRESHOLD = 3;
// === СИСТЕМА ЗАПИСОК И ОБУЧЕНИЯ ===
var notesUnlocked = {};
var note1Shown = false, note2Shown = false, note3Shown = false;
var note4Shown = false, note5Shown = false, note6Shown = false, note7Shown = false;
var tutorialActive = false, tutorialStep = 0;
var TUTORIAL_DONE_KEY = "clicker-tutorial-done-v1";
var TUTORIAL_STEPS = [
    "👆 Нажми на большую кнопку — получишь монеты",
    "🛒 Покупай улучшения в Магазине — доход идёт сам",
    "⚡ Прокачивай генератор, чтобы тапать чаще!",
    "🎁 Раз в час открывай Сундук — там кристаллы и осколки",
    "📜 Выполняй ежедневные Задания — обновляются каждый день",
    "🎨 Покупай Скины и заглядывай в Магазин за 💎",
    "🐾 На второй странице — Питомцы. Собирай и корми!",
    "🕵️ В игре есть немало секретных действий — попробуй их найти!"
];

// === УРОВНИ БАНКОВСКОГО ВКЛАДА ===
var DEPOSIT_LEVELS = [
    {level:1,cost:1000000000000000,emoji:"😭"},{level:2,cost:5000000000000000,emoji:"😢"},
    {level:3,cost:15000000000000000,emoji:"😟"},{level:4,cost:50000000000000000,emoji:"😐"},
    {level:5,cost:100000000000000000,emoji:"😕"},{level:6,cost:250000000000000000,emoji:"🙂"},
    {level:7,cost:500000000000000000,emoji:"😊"},{level:8,cost:1000000000000000000,emoji:"😄"},
    {level:9,cost:5000000000000000000,emoji:"😁"},{level:10,cost:15000000000000000000,emoji:"😂"},
    {level:11,cost:50000000000000000000,emoji:"🤣"},{level:12,cost:100000000000000000000,emoji:"😎"},
    {level:13,cost:500000000000000000000,emoji:"🥳"},{level:14,cost:1000000000000000000000,emoji:"😍"},
    {level:15,cost:5000000000000000000000,emoji:"🤩"},{level:16,cost:25000000000000000000000,emoji:"😻"},
    {level:17,cost:100000000000000000000000,emoji:"🥰"},{level:18,cost:500000000000000000000000,emoji:"😘"},
    {level:19,cost:1000000000000000000000000,emoji:"😇"},{level:20,cost:5000000000000000000000000,emoji:"🤑"},
    {level:21,cost:25000000000000000000000000,emoji:"👑"},{level:22,cost:100000000000000000000000000,emoji:"🌟"},
    {level:23,cost:500000000000000000000000000,emoji:"💫"},{level:24,cost:1000000000000000000000000000,emoji:"🌈"},
    {level:25,cost:5000000000000000000000000000,emoji:"✨"}
];
var DEPOSIT_DROP_INTERVAL = 30*60*1000, DEPOSIT_HUNGRY_RATE = 5000000;
var gulauActive = false, gulauTimer = 0;
// === НАСТРОЙКИ БОССОВ И ТРЕВОГИ ===
var bossActive = false, bossHP = 150, bossMaxHP = 150, bossTimeLeft = 45.0, bossTimerInterval = null, bossClickCooldown = 0, bossClickCount = 0, bossClickTimer = null, bossRewardClaimed = false;
var alarmTimeout = null, alarmActive = false, alarmClicks = 0, alarmSound = null, ALARM_TIME = 5*60*1000;
var rewardClaimed = false, rewardTabShown = false, noteShown = false;

// === АВТОКЛИКЕР ПАХАНА ===
var pahanUnlocked = false, pahanActive = false, pahanTimer = 0, pahanTickInterval = null, pahanTimerInterval = null;
var PAHAN_TAPS_PER_SEC = 2, PAHAN_REWARD_PER_TAP = 1e27, PAHAN_DURATION = 10;

// === СЕКТОРЫ КОЛЕСА ФОРТУНЫ ===
var WHEEL_SECTORS = [
    {type:"coins",value:0.05,label:"+5% 💰"},{type:"gems",value:15,label:"+15 💎"},
    {type:"shards",value:20,label:"+20 🌑"},{type:"coins",value:0.15,label:"+15% 💰"},
    {type:"empty",value:0,label:"Пусто ❌"},{type:"gems",value:30,label:"+30 💎"},
    {type:"coins",value:0.25,label:"+25% 💰"},{type:"shards",value:50,label:"+50 🌑"},
    {type:"negCoins",value:-0.15,label:"−15% 💰"},{type:"gems",value:50,label:"+50 💎"},
    {type:"negGems",value:-5,label:"−5 💎"},{type:"negShards",value:-10,label:"−10 🌑"}
];
var wheelSpinning = false, wheelFreeUsed = false, wheelPaidUsed = false, wheelLastResetDay = "";

// === ЕЖЕДНЕВНАЯ РУЛЕТКА ===
var DAILY_PRIZES = [
    {type:"coins",value:500,label:"💰 500"},{type:"coins",value:5000,label:"💰 5K"},
    {type:"gems",value:5,label:"💎 5"},{type:"gems",value:15,label:"💎 15"},
    {type:"shards",value:20,label:"🌑 20"},{type:"boost",value:1,label:"⚡ Буст"},
    {type:"gems",value:25,label:"💎 25"}
];
var dailySpinning = false, dailyLastUsed = "";

// === МИНИ-ИГРА НА 10 СЕКУНД ===
var minigameActive = false, minigameTaps = 0, minigameTimer = 10, minigameTimerInterval = null, minigameBest = 0;
var minigameLastUsed = 0;
var MINIGAME_COOLDOWN = 60*60*1000, MINIGAME_DURATION = 10;
// === ГЛОБАЛЬНЫЕ УЛУЧШЕНИЯ И БУСТЕРЫ ===
var globalUpgrades = {
    superClicker:{id:"superClicker",name:"🌟 Супер кликер",desc:"+1 к базовому клику за уровень",cost:1500,baseCost:1500,count:0,maxLevel:5,effect:"click",amount:1},
    bloodLuck:{id:"bloodLuck",name:"🩸 Кровавая удача",desc:"+1% к шансу кровавого осколка в Кровавую луну",cost:10000,baseCost:10000,count:0,maxLevel:5,effect:"bloodShard",amount:0.01},
    absoluteBoost:{id:"absoluteBoost",name:"🔱 Воля Абсолюта",desc:"+5% к прибыли от Абсолюта",cost:100000000000000000000,baseCost:100000000000000000000,count:0,maxLevel:5,effect:"absoluteMult",amount:0.05},
    genesisBoost:{id:"genesisBoost",name:"💠 Эхо Генезиса",desc:"+3% к прибыли от Генезиса",cost:1000000000000000000000,baseCost:1000000000000000000000,count:0,maxLevel:5,effect:"genesisMult",amount:0.03}
};

var BOOSTERS = {
    boost2:{id:"boost2",icon:"⚡",name:"Буст ×2",desc:"Множитель ×2 на 15 минут",duration:15*60,mult:2,storage:0},
    boost3:{id:"boost3",icon:"⚡",name:"Буст ×3",desc:"Множитель ×3 на 10 минут",duration:10*60,mult:3,storage:0},
    boost5:{id:"boost5",icon:"⚡",name:"Буст ×5",desc:"Множитель ×5 на 5 минут",duration:5*60,mult:5,storage:0}
};

var CRYSTAL_ITEMS = {
    coinsBag:{icon:"💰",name:"Мешок монет",desc:"1 час дохода монетами",cost:5},
    boost2:{icon:"⚡",name:"Буст ×2",desc:"Множитель ×2 на 15 минут → в хранилище",cost:10},
    boost3:{icon:"⚡",name:"Буст ×3",desc:"Множитель ×3 на 10 минут → в хранилище",cost:20},
    boost5:{icon:"⚡",name:"Буст ×5",desc:"Множитель ×5 на 5 минут → в хранилище",cost:35},
    chest:{icon:"🎁",name:"Мгновенный сундук",desc:"Сразу открывает сундук",cost:20},
    depositUp:{icon:"🏦",name:"+1 уровень вклада",desc:"Только если вклад куплен",cost:100}
};

// === ИГРОВЫЕ ТЕКСТУРНЫЕ ФОНЫ ===
var BACKGROUNDS = {
    base:{id:"base",name:"Базовый",cls:"",cost:0,owned:true},
    space:{id:"space",name:"🌌 Космос",cls:"bg-space",cost:25,particles:"stars",owned:false},
    flame:{id:"flame",name:"🔥 Пламя",cls:"bg-flame",cost:25,particles:"sparks",owned:false},
    ocean:{id:"ocean",name:"🌊 Океан",cls:"bg-ocean",cost:25,particles:"bubbles",owned:false},
    sakura:{id:"sakura",name:"🌸 Сакура",cls:"bg-sakura",cost:25,particles:"petals",owned:false},
    ice:{id:"ice",name:"❄️ Лёд",cls:"bg-ice",cost:25,particles:"snow",owned:false},
    bloodmoon:{id:"bloodmoon",name:"🌑 Кровавая луна",cls:"bg-bloodmoon",cost:25,particles:"pulse",owned:false},
    volcano:{id:"volcano",name:"🌋 Вулкан",cls:"bg-volcano",cost:25,particles:"lava",owned:false},
    nebula:{id:"nebula",name:"🌌 Туманность",cls:"bg-nebula",cost:25,particles:"nebula",owned:false}
};
var activeBg = "base";
var bgParticles = [];
var bgCanvas = null, bgCtx = null, bgAnimFrame = null, bgFrameCounter = 0;
var bgParallax = {x:0,y:0,targetX:0,targetY:0};
var _ufoState = {x:-100,y:100,speed:0.5,spawnAt:0,visible:false};
var _fishArray = [];
var _emberArray = [];
var _butterflyState = {x:0,y:0,angle:0,spawnAt:0};
var _lastBgFrame = 0;

var quests = [], questsDate = "", questsClaimed = 0;
var QUEST_TYPES = {
    taps_100:{icon:"👆",name:"Сделай 100 тапов",goal:100}
};
// === БАЗОВЫЕ УЛУЧШЕНИЯ МАГАЗИНА ===
var UPGRADES_DATA = [
    {id:"click_factory", name:"🏭 Клик-фабрика", cost:15, income:0.1, count:0},
    {id:"farm", name:"🌾 Ферма хомяков", cost:100, income:1, count:0},
    {id:"mine", name:"⛏️ Монетная шахта", cost:1100, income:8, count:0},
    {id:"factory", name:"🏢 Завод роботов", cost:12000, income:47, count:0},
    {id:"bank", name:"🏦 Золотой банк", cost:130000, income:260, count:0},
    {id:"super_clicker", name:"🚀 Супер кликер", cost:1400000, income:1400, count:0},
    {id:"crypto_farm", name:"🌐 Крипто ферма", cost:20000000, income:7800, count:0},
    {id:"quantum_pc", name:"💻 Квантовый ПК", cost:330000000, income:44000, count:0},
    {id:"space_station", name:"🛰️ Космостанция", cost:5400000000, income:260000, count:0},
    {id:"portal", name:"🌀 Портал бездны", cost:90000000000, income:1600000, count:0},
    {id:"time_machine", name:"⏳ Машина времени", cost:1600000000000, income:10000000, count:0},
    {id:"antimatter", name:"⚛️ Антиматерия", cost:28000000000000, income:65000000, count:0},
    {id:"singularity", name:"🕳️ Сингулярность", cost:520000000000000, income:430000000, count:0},
    {id:"infinity_core", name:"💎 Ядро бесконечности", cost:9900000000000000, income:2900000000, count:0},
    {id:"dark_energy", name:"🌌 Тёмная энергия", cost:180000000000000000, income:21000000000, count:0},
    {id:"matrix", name:"🕸️ Матрица кодов", cost:3500000000000000000, income:150000000000, count:0},
    {id:"multiverse", name:"🪐 Мультивселенная", cost:75000000000000000000, income:1100000000000, count:0},
    {id:"ether_core", name:"✨ Эфирное ядро", cost:1600000000000000000000, income:8500000000000, count:0},
    {id:"cosmic_mind", name:"🧠 Космический Разум", cost:38000000000000000000000, income:68000000000000, count:0},
    {id:"absolute", name:"🔱 Источник Абсолюта", cost:950000000000000000000000, income:560000000000000, count:0},
    {id:"creator_hand", name:"✍️ Длань Творца", cost:25000000000000000000000000, income:4800000000000000, count:0},
    {id:"chronos", name:"🪐 Око Хроноса", cost:680000000000000000000000000, income:42000000000000000, count:0},
    {id:"eternity", name:"♾️ Врата Вечности", cost:19000000000000000000000000000, income:380000000000000000, count:0},
    {id:"genesis", name:"💠 Генезис", cost:500000000000000000000000000000, income:3500000000000000000, count:0}
];

// === ПРЕДМЕТЫ ЗА КРОВАТЫЕ ОСКОЛКИ ===
var SHARD_ITEMS_DATA = {
    blood_core: {name:"🩸 Кровавое ядро", desc:"+5% к доходу за уровень", cost:5, maxLevel:3, count:0, effect:"percent_boost", amount:0.05},
    lunar_lens: {name:"👁️ Лунная линза", desc:"+10% к шансу золотой монетки", cost:15, maxLevel:3, count:0, effect:"gold_coin_chance", amount:0.10},
    night_cloak: {name:"🧥 Плащ ночи", desc:"+15 мин к оффлайн доходу", cost:30, maxLevel:3, count:0, effect:"offline_time", amount:15},
    skull_crown: {name:"👑 Черепной венец", desc:"+10% к урону по Боссу", cost:60, maxLevel:3, count:0, effect:"boss_damage", amount:0.10},
    shadow_step: {name:"👣 Шаг тени", desc:"−5% к стоимости улучшений", cost:120, maxLevel:3, count:0, effect:"discount", amount:0.05},
    orb_life: {name:"🔮 Сфера жизни", desc:"+5% к сытости питомцев", cost:250, maxLevel:3, count:0, effect:"pet_satiety", amount:0.05},
    demon_wing: {name:"🪽 Крыло демона", desc:"+1% к крит-тапу монет", cost:500, maxLevel:3, count:0, effect:"crit_chance", amount:0.01},
    dark_touch: {name:"🕸️ Тёмное касание", desc:"+10 монет за тап базово", cost:1000, maxLevel:3, count:0, effect:"flat_click", amount:10},
    void_heart: {name:"🖤 Сердце бездны", desc:"+25% прибыли в Кровавую луну", cost:2500, maxLevel:3, count:0, effect:"blood_moon_mult", amount:0.25},
    eclipse_sign: {name:"🌘 Знамение Затмения", desc:"+1 кристаллов из сундука", cost:5000, maxLevel:3, count:0, effect:"chest_crystals", amount:1},
    hell_fire: {name:"🔥 Адское пламя", desc:"Удваивает бонус Кровавых осколков", cost:10000, maxLevel:1, count:0, effect:"shards_double_bonus", amount:1.0}
};
// === КАТАЛОГ ВСЕХ ДОСТИЖЕНИЙ ===
var ACHIEVEMENTS_DATA = [
    {id:"tap_100", title:"Первый шаг", desc:"Сделать 100 тапов", tier:"bronze", check:function(){return totalTaps>=100;}},
    {id:"tap_1000", title:"Уверенный кликер", desc:"Сделать 1 000 тапов", tier:"bronze", check:function(){return totalTaps>=1000;}},
    {id:"tap_5000", title:"Опытный палец", desc:"Сделать 5 000 тапов", tier:"silver", check:function(){return totalTaps>=5000;}},
    {id:"tap_25000", title:"Стахановец", desc:"Сделать 25 000 тапов", tier:"silver", check:function(){return totalTaps>=25000;}},
    {id:"tap_100000", title:"Бог Клика", desc:"Сделать 100 000 тапов", tier:"gold", check:function(){return totalTaps>=100000;}},
    {id:"earn_10k", title:"Малый бизнес", desc:"Заработать 10 000 монет", tier:"bronze", check:function(){return totalEarned>=10000;}},
    {id:"earn_1m", title:"Первый миллион", desc:"Заработать 1 000 000 монет", tier:"bronze", check:function(){return totalEarned>=1000000;}},
    {id:"earn_1b", title:"Богач", desc:"Заработать 1 000 000 000 монет", tier:"silver", check:function(){return totalEarned>=1000000000;}},
    {id:"earn_1t", title:"Олигарх", desc:"Заработать 1 000 000 000 000 монет", tier:"silver", check:function(){return totalEarned>=1000000000000;}},
    {id:"earn_1qa", title:"Властелин Экономики", desc:"Заработать 1 Qa монет", tier:"gold", check:function(){return totalEarned>=1e15;}},
    {id:"chest_10", title:"Кладоискатель", desc:"Открыть 10 сундуков", tier:"bronze", check:function(){return chestsOpened>=10;}},
    {id:"chest_50", title:"Хранитель Тайн", desc:"Открыть 50 сундуков", tier:"silver", check:function(){return chestsOpened>=50;}},
    {id:"generator_10", title:"Энергетик", desc:"Прокачать генератор до 10 уровня", tier:"bronze", check:function(){return generatorLevel>=10;}},
    {id:"generator_25", title:"Вечный двигатель", desc:"Прокачать генератор до 25 уровня", tier:"silver", check:function(){return generatorLevel>=25;}},
    {id:"generator_50", title:"Инженер Сингулярности", desc:"Прокачать генератор до 50 уровня", tier:"gold", check:function(){return generatorLevel>=50;}},
    {id:"deposit_1", title:"Инвестор", desc:"Открыть вклад в банке", tier:"bronze", check:function(){return depositLevel>=1;}},
    {id:"deposit_10", title:"Финансист", desc:"Прокачать вклад до 10 уровня", tier:"silver", check:function(){return depositLevel>=10;}},
    {id:"deposit_25", title:"Золотой Эмодзи", desc:"Максимальный 25 уровень вклада", tier:"gold", check:function(){return depositLevel>=25;}},
    {id:"shards_100", title:"Осколки Ночи", desc:"Собрать 100 Кровавых осколков", tier:"bronze", check:function(){return totalShardsEarned>=100;}},
    {id:"shards_1000", title:"Лорд Затмения", desc:"Собрать 1 000 Кровавых осколков", tier:"silver", check:function(){return totalShardsEarned>=1000;}},
    {id:"shards_5000", title:"Багровый Бог", desc:"Собрать 5 000 Кровавых осколков", tier:"gold", check:function(){return totalShardsEarned>=5000;}},
    {id:"time_1h", title:"Постоянный гость", desc:"Провести 1 час в игре", tier:"bronze", check:function(){return totalPlayTime>=3600;}},
    {id:"time_10h", title:"Зависимость", desc:"Провести 10 часов в игре", tier:"silver", check:function(){return totalPlayTime>=36000;}},
    {id:"time_24h", title:"Житель Крохлюпии", desc:"Провести 24 часа в игре", tier:"gold", check:function(){return totalPlayTime>=86400;}},
    {id:"clicker_67", title:"Мастер Взлома", desc:"Разблокировать автокликер 67", tier:"silver", check:function(){return secretUnlocked;}},
    {id:"boss_win", title:"Победитель Смайлов", desc:"Одержать верх над Боссом-Смайликом", tier:"silver", check:function(){return bossRewardClaimed;}},
    {id:"notes_all", title:"Хранитель Архивов", desc:"Найти все 7 скрытых записок", tier:"gold", check:function(){return Object.keys(notesUnlocked).length>=7;}}
];
// === АЛЬМАНАХ ПИТОМЦЕВ ===
var PET_TYPES = {
    penguin: {name: "Пингвинчик 🐧", rarity: "common", chance: 0.50, bonus: "coins", mult: 0.05, favFood: "berry"},
    cat: {name: "Котик 🐱", rarity: "rare", chance: 0.30, bonus: "coins", mult: 0.15, favFood: "banana"},
    dragon: {name: "Дракончик 🐉", rarity: "legendary", chance: 0.15, bonus: "click", mult: 0.50, favFood: "orange"},
    phoenix: {name: "Феникс 🐦‍🔥", rarity: "mystic", chance: 0.05, bonus: "shards", mult: 0.20, favFood: "orange"}
};
var PET_EGG_INCUBATE_TIME = 30 * 60 * 1000;

// === АУДИО-ДВИЖОК ===
var sounds = {};
var currentMusic = null;
function initAudio() {
    var tracks = ["click", "ui", "achievement", "music", "music2", "alarm", "chest", "boss", "eat"];
    tracks.forEach(function(t) {
        sounds[t] = new Audio("sounds/" + t + ".mp3");
    });
    sounds["music"].loop = true;
    sounds["music2"].loop = true;
}
function playSound(name) {
    if (typeof settings !== "undefined" && !settings.sounds) return;
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play().catch(function(e){});
    }
}

// === ЛОКАЛИЗАЦИЯ (ЯЗЫКОВОЙ МОДУЛЬ) ===
var currentLang = "RU";
var translations = {
    RU: {
        "alert_not_enough_coins": "❌ Недостаточно монет!",
        "alert_not_enough_crystals": "❌ Недостаточно кристаллов!",
        "msg_saved": "💾 Прогресс успешно сохранен!",
        "msg_cheater": "⚠️ Зафиксирована подозрительная скорость тапов! Клики временно заблокированы."
    },
    EN: {
        "alert_not_enough_coins": "❌ Not enough coins!",
        "alert_not_enough_crystals": "❌ Not enough crystals!",
        "msg_saved": "💾 Progress saved successfully!",
        "msg_cheater": "⚠️ Unusual tap speed detected! Clicks locked temporarily."
    }
};
function t(key) { return (translations[currentLang] && translations[currentLang][key]) || key; }

// === АНТИЧИТ СИСТЕМА И ОБРАБОТКА ТАПОВ ===
function checkAntiCheat() {
    var now = Date.now();
    tapTimestamps.push(now);
    tapTimestamps = tapTimestamps.filter(function(t) { return now - t < TAP_WINDOW; });
    if (tapTimestamps.length > TAP_LIMIT) {
        tapViolations.push(now);
        tapViolations = tapViolations.filter(function(t) { return now - t < VIOLATION_WINDOW; });
        if (tapViolations.length >= VIOLATION_THRESHOLD) {
            alert(t("msg_cheater"));
            return false;
        }
    }
    return true;
}

function handleMainTap(event) {
    if (!checkAntiCheat()) return;
    var now = Date.now();
    lastClickTime = now;
    
    var activeMultiplier = goldenMultiplier * eventMultiplier * crystalBoostMultiplier;
    var clickIncome = coinsPerClick * activeMultiplier;
    
    // Эффект Крит-тапа (10% шанс на х7 от Лунной Линзы и предметов)
    var critChance = 0.05 + (SHARD_ITEMS_DATA.demon_wing.count * SHARD_ITEMS_DATA.demon_wing.amount);
    if (Math.random() < critChance) {
        clickIncome *= 7;
        createFloatingText(event, "🔥 КРИТ х7!");
    }
    
    coins += clickIncome;
    totalEarned += clickIncome;
    totalTaps++;
    
    // Шанс выпадения Кровавого осколка во время Кровавой Луны
    if (bloodMoonActive) {
        var shardChance = 0.02 + (globalUpgrades.bloodLuck.count * globalUpgrades.bloodLuck.amount);
        if (Math.random() < shardChance) {
            shards++;
            totalShardsEarned++;
            createFloatingText(event, "🌑 +1 Осколок!");
        }
    }
    
    playSound("click");
    updateDisplay();
}

function createFloatingText(event, text) {
    var div = document.createElement("div");
    div.className = "floating-text-pop";
    div.innerText = text;
    
    var x = event.clientX || (event.touches && event.touches[0].clientX) || window.innerWidth / 2;
    var y = event.clientY || (event.touches && event.touches[0].clientY) || window.innerHeight / 2;
    
    div.style.left = x + "px";
    div.style.top = y + "px";
    document.body.appendChild(div);
    setTimeout(function() { div.remove(); }, 800);
}
// ==========================================
// 🔥 KROCHLUPIC UP! — ЧАСТЬ 12 (ЯДРО ИГРЫ) 🔥
// ==========================================

// === СИСТЕМА ПИТОМЦЕВ (ИНКУБАЦИЯ, КОРМЛЕНИЕ, ЖИЗНЬ) ===
var playerPets = {};
var activePetId = null;
var currentEgg = { status: "empty", startTime: 0 };

function buyPetEgg() {
    if (crystals < 65) return alert(t("alert_not_enough_crystals"));
    if (currentEgg.status !== "empty") return alert("У вас уже высиживается яйцо!");
    
    crystals -= 65;
    currentEgg.status = "incubating";
    currentEgg.startTime = Date.now();
    saveProgress();
    renderPetsUI();
}

function tickPetsEngine() {
    var now = Date.now();
    
    // Эволюция яйца
    if (currentEgg.status === "incubating") {
        var elapsed = now - currentEgg.startTime;
        if (elapsed >= PET_EGG_INCUBATE_TIME) {
            currentEgg.status = "ready";
            renderPetsUI();
        }
    }
    
    // Логика голода активного питомца
    if (activePetId && playerPets[activePetId]) {
        var pet = playerPets[activePetId];
        // Уменьшение сытости (Сфера жизни из магазина осколков замедляет голод)
        var hungerDrainMult = 1 - (SHARD_ITEMS_DATA.orb_life.count * SHARD_ITEMS_DATA.orb_life.amount);
        pet.hunger -= (0.01 * hungerDrainMult);
        
        if (pet.hunger <= 0) {
            pet.hunger = 0;
            // Если питомец полностью оголодал — он погибает
            delete playerPets[activePetId];
            activePetId = null;
            alert("⚠️ Твой активный питомец погиб от голода! Не забывай его кормить.");
        }
        _updateActivePetWidget();
    }
}

function hatchPetEgg() {
    if (currentEgg.status !== "ready") return;
    
    var rand = Math.random();
    var cumulative = 0;
    var chosenType = "penguin";
    
    // Расчет шансов выпадения из альманаха
    var keys = Object.keys(PET_TYPES);
    for (var i = 0; i < keys.length; i++) {
        cumulative += PET_TYPES[keys[i]].chance;
        if (rand <= cumulative) {
            chosenType = keys[i];
            break;
        }
    }
    
    var newPetId = "pet_" + Date.now() + "_" + Math.floor(Math.random()*1000);
    playerPets[newPetId] = {
        type: chosenType,
        name: PET_TYPES[chosenType].name,
        hunger: 100,
        level: 1
    };
    
    currentEgg.status = "empty";
    currentEgg.startTime = 0;
    
    alert("🎉 Из яйца вылупился: " + PET_TYPES[chosenType].name + " (" + PET_TYPES[chosenType].rarity.toUpperCase() + ")!");
    saveProgress();
    renderPetsUI();
}

function feedPet(foodType) {
    if (!activePetId || !playerPets[activePetId]) return alert("Сначала активируй питомца!");
    var pet = playerPets[activePetId];
    var pType = PET_TYPES[pet.type];
    
    var cost = foodType === "berry" ? 5 : (foodType === "banana" ? 10 : 20);
    var restore = foodType === "berry" ? 5 : (foodType === "banana" ? 10 : 20);
    
    // Любимая еда дает х2 к восстановлению сытости
    if (pType.favFood === foodType) restore *= 2;
    
    if (crystals < cost) return alert(t("alert_not_enough_crystals"));
    if (pet.hunger >= 100) return alert("Питомец уже полностью сыт!");
    
    crystals -= cost;
    pet.hunger = Math.min(100, pet.hunger + restore);
    playSound("eat");
    saveProgress();
}

function _updateActivePetWidget() {
    var widget = $("active-pet-hunger-bar");
    if (widget && activePetId && playerPets[activePetId]) {
        widget.style.width = playerPets[activePetId].hunger + "%";
    }
}

// === ДВИЖОК БАНКОВСКОГО ВКЛАДА (🏦 СМАЙЛИК) ===
function processDepositEngine() {
    if (depositLevel <= 0) return;
    var now = Date.now();
    var lastCheck = parseInt(localStorage.getItem(lastDepositTimeKey) || now);
    var elapsed = now - lastCheck;
    
    if (elapsed >= DEPOSIT_DROP_INTERVAL) {
        var dropsCount = Math.floor(elapsed / DEPOSIT_DROP_INTERVAL);
        // Каждые 30 минут уровень вклада падает, отнимая монеты (эффект голодного смайлика)
        var previousLevel = depositLevel;
        depositLevel = Math.max(1, depositLevel - dropsCount);
        
        var lostCoins = dropsCount * DEPOSIT_HUNGRY_RATE * previousLevel;
        coins = Math.max(0, coins - lostCoins);
        
        localStorage.setItem(lastDepositTimeKey, now - (elapsed % DEPOSIT_DROP_INTERVAL));
        updateDisplay();
    }
}

function upgradeDeposit() {
    var nextLevelData = DEPOSIT_LEVELS[depositLevel];
    if (!nextLevelData) return alert("У вас максимальный уровень вклада!");
    
    if (coins < nextLevelData.cost) return alert(t("alert_not_enough_coins"));
    
    coins -= nextLevelData.cost;
    depositLevel++;
    localStorage.setItem(lastDepositTimeKey, Date.now());
    playSound("ui");
    updateDisplay();
}

// === ЛОГИКА СУНДУКА И СЕКТОРОВ КОЛЕСА ФОРТУНЫ ===
function openFreeChest() {
    var rewardCoins = Math.floor(Math.random() * 1000) * (generatorLevel * 1.5);
    var rewardCrystals = Math.floor(Math.random() * 5) + 2 + SHARD_ITEMS_DATA.eclipse_sign.count;
    var rewardShards = Math.random() < 0.3 ? (Math.floor(Math.random() * 3) + 1) : 0;
    
    coins += rewardCoins;
    crystals = Math.min(crystalsMax, crystals + rewardCrystals);
    shards += rewardShards;
    totalShardsEarned += rewardShards;
    chestsOpened++;
    
    playSound("chest");
    alert("🎁 Из сундука получено:\n💰 Монеты: " + rewardCoins + "\n💎 Кристаллы: " + rewardCrystals + "\n🌑 Осколки: " + rewardShards);
    saveProgress();
    updateDisplay();
}

function spinWheelOfFortune(isPaid) {
    if (wheelSpinning) return;
    if (isPaid && crystals < 10) return alert(t("alert_not_enough_crystals"));
    
    wheelSpinning = true;
    if (isPaid) crystals -= 10;
    
    var sectorIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    var result = WHEEL_SECTORS[sectorIndex];
    
    setTimeout(function() {
        wheelSpinning = false;
        if (result.type === "coins") {
            var bonus = Math.floor(coins * result.value);
            coins += bonus;
        } else if (result.type === "gems") {
            crystals = Math.min(crystalsMax, crystals + result.value);
        } else if (result.type === "shards") {
            shards += result.value;
            totalShardsEarned += result.value;
        } else if (result.type === "negCoins") {
            coins = Math.max(0, coins + Math.floor(coins * result.value));
        }
        
        alert("🎡 Результат колеса фортуны: " + result.label);
        saveProgress();
        updateDisplay();
    }, 1500);
}
// =================================================================
// 🔥 KROCHLUPIC UP! — ЧАСТЬ 13 (ФИНАЛ: СЕТЕВЫЕ МОДУЛИ И ЗАПУСК) 🔥
// =================================================================

// === СИСТЕМА ДРУЗЕЙ ===
function setupFriendsUI() {
    if (!db || !profile.id) return;
    
    db.ref("friends/" + profile.id + "/list").on("value", function(snap) {
        var listEl = $("friends-search-result") || document.querySelector(".friends-list-container");
        if (!listEl) return;
        listEl.innerHTML = "";
        var data = snap.val() || {};
        var keys = Object.keys(data);
        
        if (keys.length === 0) {
            listEl.innerHTML = "<p class='clan-empty-msg'>У тебя пока нет друзей. Найди по ID!</p>";
            return;
        }
        
        keys.forEach(function(fId) {
            var item = document.createElement("div");
            item.className = "clan-card-row";
            getPlayerSafeNickname(fId, function(nick) {
                item.innerHTML = "<span>👤 " + nick + "</span>" +
                    "<div style='display:flex; gap:5px;'>" +
                    "<button class='clan-btn-primary' onclick='openDirectMessage(\"" + fId + "\")'>💬 ЛС</button>" +
                    "<button class='clan-btn-danger' style='background:#ff5252;' onclick='removeFriend(\"" + fId + "\")'>🗑️</button>" +
                    "</div>";
            });
            listEl.appendChild(item);
        });
    });

    db.ref("friends/" + profile.id + "/incoming").on("value", function(snap) {
        var incEl = document.getElementById("friends-incoming-box");
        if (!incEl) return;
        incEl.innerHTML = "";
        var data = snap.val() || {};
        var keys = Object.keys(data);
        
        keys.forEach(function(fromId) {
            var item = document.createElement("div");
            item.className = "clan-card-row";
            getPlayerSafeNickname(fromId, function(nick) {
                item.innerHTML = "<span>➕ " + nick + "</span>" +
                    "<div>" +
                    "<button class='clan-btn-primary' style='background:#4caf50; margin-right:5px;' onclick='acceptFriendRequest(\"" + fromId + "\")'>✅</button>" +
                    "<button class='clan-btn-danger' style='background:#ff5252;' onclick='rejectFriendRequest(\"" + fromId + "\")'>❌</button>" +
                    "</div>";
            });
            incEl.appendChild(item);
        });
    });
}

function _socialDoSearch(query) {
    if (!db || !query.trim()) return;
    var out = $("friends-search-result");
    if (!out) return;
    out.innerHTML = "<p class='clan-empty-msg'>Поиск...</p>";

    db.ref("shortIds/" + query.trim()).once("value").then(function(snap) {
        var targetUid = snap.val();
        if (!targetUid) {
            out.innerHTML = "<p class='clan-empty-msg'>Игрок не найден</p>";
            return;
        }
        getPlayerSafeNickname(targetUid, function(nick) {
            out.innerHTML = "<div class='clan-card-row'>" +
                "<span>👤 " + nick + " (" + query.trim() + ")</span>" +
                "<button class='clan-btn-primary' onclick='sendFriendRequestDirect(\"" + targetUid + "\")'>Добавить</button>" +
                "</div>";
        });
    });
}

function sendFriendRequestDirect(targetUid) {
    if (targetUid === profile.id) return alert("Нельзя добавить себя!");
    var updates = {};
    updates["friends/" + profile.id + "/outgoing/" + targetUid] = true;
    updates["friends/" + targetUid + "/incoming/" + profile.id] = true;
    db.ref().update(updates).then(function() { alert("Заявка отправлена!"); });
}

function acceptFriendRequest(fromId) {
    var updates = {};
    updates["friends/" + profile.id + "/incoming/" + fromId] = null;
    updates["friends/" + fromId + "/outgoing/" + profile.id] = null;
    updates["friends/" + profile.id + "/list/" + fromId] = true;
    updates["friends/" + fromId + "/list/" + profile.id] = true;
    db.ref().update(updates);
}

function rejectFriendRequest(fromId) {
    var updates = {};
    updates["friends/" + profile.id + "/incoming/" + fromId] = null;
    updates["friends/" + fromId + "/outgoing/" + profile.id] = null;
    db.ref().update(updates);
}

function removeFriend(friendId) {
    if (!confirm("Удалить из друзей?")) return;
    var updates = {};
    updates["friends/" + profile.id + "/list/" + friendId] = null;
    updates["friends/" + friendId + "/list/" + profile.id] = null;
    db.ref().update(updates);
}

// === МОДУЛЬ КЛАНОВ И КЛАНОВОГО ЧАТА ===
function clanSetupUI() {
    if (!db || !profile.id) return;
    
    db.ref("users/" + profile.id + "/clanId").on("value", function(snap) {
        var userClanId = snap.val();
        if (!userClanId) {
            if ($("no-clan-view")) $("no-clan-view").style.display = "block";
            if ($("active-clan-view")) $("active-clan-view").style.display = "none";
            _loadClansList();
        } else {
            if ($("no-clan-view")) $("no-clan-view").style.display = "none";
            if ($("active-clan-view")) $("active-clan-view").style.display = "block";
            _loadCurrentClan(userClanId);
        }
    });
}

function clanCreate(name, tag, desc, type, callback) {
    if (!db || crystals < 500) return callback(false);
    var cleanTag = tag.toUpperCase().trim();
    
    var newClanRef = db.ref("clans").push();
    var clanId = newClanRef.key;
    
    var updates = {};
    updates["clans/" + clanId] = { name: name, tag: cleanTag, description: desc, type: type, ownerId: profile.id, invested: 0, level: 1 };
    updates["clans/" + clanId + "/members/" + profile.id] = { role: "owner", joinedAt: firebase.database.ServerValue.TIMESTAMP };
    updates["clanTags/" + cleanTag] = clanId;
    updates["users/" + profile.id + "/clanId"] = clanId;
    
    db.ref().update(updates).then(function() {
        crystals -= 500;
        callback(true);
    }).catch(function() { callback(false); });
}

function _loadClansList() {
    db.ref("clans").limitToFirst(10).once("value").then(function(snap) {
        var out = $("clan-search-results");
        if (!out) return;
        out.innerHTML = "";
        snap.forEach(function(child) {
            var c = child.val();
            var id = child.key;
            var row = document.createElement("div");
            row.className = "clan-list-card";
            row.innerHTML = "<h4>[" + c.tag + "] " + c.name + "</h4><button class='clan-btn-primary' onclick='clanJoin(\"" + id + "\")'>Вступить</button>";
            out.appendChild(row);
        });
    });
}

function clanJoin(clanId) {
    var updates = {};
    updates["users/" + profile.id + "/clanId"] = clanId;
    updates["clans/" + clanId + "/members/" + profile.id] = { role: "member", joinedAt: firebase.database.ServerValue.TIMESTAMP };
    db.ref().update(updates);
}

function clanSendChat(text) {
    if (!text.trim()) return;
    db.ref("users/" + profile.id + "/clanId").once("value").then(function(snap) {
        var cId = snap.val();
        if (!cId) return;
        db.ref("clans/" + cId + "/chat").push().set({
            senderId: profile.id,
            text: text.trim(),
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    });
}

function _loadCurrentClan(clanId) {
    db.ref("clans/" + clanId).on("value", function(snap) {
        var c = snap.val();
        if (!c) return;
        var title = document.getElementById("clan-info-title");
        if (title) title.innerText = "[" + c.tag + "] " + c.name;
        
        var mList = $("clan-members-list");
        if (mList && c.members) {
            mList.innerHTML = "";
            Object.keys(c.members).forEach(function(mId) {
                var row = document.createElement("div");
                row.className = "clan-member-row";
                getPlayerSafeNickname(mId, function(nick) {
                    row.innerHTML = "<span>👤 " + nick + "</span> <span class='clan-role-badge'>" + c.members[mId].role + "</span>";
                });
                mList.appendChild(row);
            });
        }
    });

    db.ref("clans/" + clanId + "/chat").limitToLast(40).on("value", function(snap) {
        var box = $("clan-chat-box");
        if (!box) return;
        box.innerHTML = "";
        snap.forEach(function(msgChild) {
            var m = msgChild.val();
            var div = document.createElement("div");
            div.className = "clan-chat-msg";
            getPlayerSafeNickname(m.senderId, function(nick) {
                div.innerHTML = "<b>" + nick + ":</b> " + m.text;
            });
            box.appendChild(div);
        });
        box.scrollTop = box.scrollHeight;
    });
}

// === МОДУЛЬ ЛИЧНЫХ СООБЩЕНИЙ (ЛС) ===
var currentChatPartnerId = null;
function openDirectMessage(partnerId) {
    currentChatPartnerId = partnerId;
    var dmModal = $("direct-messages-modal") || document.getElementById("dm-modal");
    if (dmModal) dmModal.style.display = "flex";
    
    var chatId = profile.id < partnerId ? profile.id + "_" + partnerId : partnerId + "_" + profile.id;
    db.ref("chats/" + chatId).orderByChild("timestamp").limitToLast(50).on("value", function(snap) {
        var box = $("dm-messages-box");
        if (!box) return;
        box.innerHTML = "";
        snap.forEach(function(child) {
            var m = child.val();
            var d = document.createElement("div");
            d.className = m.senderId === profile.id ? "msg msg-own" : "msg msg-partner";
            getPlayerSafeNickname(m.senderId, function(nick) {
                d.innerHTML = "<b>" + nick + ":</b> " + m.text;
            });
            box.appendChild(d);
        });
        box.scrollTop = box.scrollHeight;
    });
}

function dmSend(text) {
    if (!text.trim() || !currentChatPartnerId) return;
// =================================================================// 🔥 KROCHLUPIC UP! — ЧАСТЬ 13 (ФИНАЛ: СЕТЕВЫЕ МОДУЛИ И ЗАПУСК) 🔥// =================================================================
// === СИСТЕМА ДРУЗЕЙ ===function setupFriendsUI() {
    if (!db || !profile.id) return;
    
    db.ref("friends/" + profile.id + "/list").on("value", function(snap) {
        var listEl = $("friends-search-result") || document.querySelector(".friends-list-container");
        if (!listEl) return;
        listEl.innerHTML = "";
        var data = snap.val() || {};
        var keys = Object.keys(data);
        
        if (keys.length === 0) {
            listEl.innerHTML = "<p class='clan-empty-msg'>У тебя пока нет друзей. Найди по ID!</p>";
            return;
        }
        
        keys.forEach(function(fId) {
            var item = document.createElement("div");
            item.className = "clan-card-row";
            getPlayerSafeNickname(fId, function(nick) {
                item.innerHTML = "<span>👤 " + nick + "</span>" +
                    "<div style='display:flex; gap:5px;'>" +
                    "<button class='clan-btn-primary' onclick='openDirectMessage(\"" + fId + "\")'>💬 ЛС</button>" +
                    "<button class='clan-btn-danger' style='background:#ff5252;' onclick='removeFriend(\"" + fId + "\")'>🗑️</button>" +
                    "</div>";
            });
            listEl.appendChild(item);
        });
    });

    db.ref("friends/" + profile.id + "/incoming").on("value", function(snap) {
        var incEl = document.getElementById("friends-incoming-box");
        if (!incEl) return;
        incEl.innerHTML = "";
        var data = snap.val() || {};
        var keys = Object.keys(data);
        
        keys.forEach(function(fromId) {
            var item = document.createElement("div");
            item.className = "clan-card-row";
            getPlayerSafeNickname(fromId, function(nick) {
                item.innerHTML = "<span>➕ " + nick + "</span>" +
                    "<div>" +
                    "<button class='clan-btn-primary' style='background:#4caf50; margin-right:5px;' onclick='acceptFriendRequest(\"" + fromId + "\")'>✅</button>" +
                    "<button class='clan-btn-danger' style='background:#ff5252;' onclick='rejectFriendRequest(\"" + fromId + "\")'>❌</button>" +
                    "</div>";
            });
            incEl.appendChild(item);
        });
    });
}
function _socialDoSearch(query) {
    if (!db || !query.trim()) return;
    var out = $("friends-search-result");
    if (!out) return;
    out.innerHTML = "<p class='clan-empty-msg'>Поиск...</p>";

    db.ref("shortIds/" + query.trim()).once("value").then(function(snap) {
        var targetUid = snap.val();
        if (!targetUid) {
            out.innerHTML = "<p class='clan-empty-msg'>Игрок не найден</p>";
            return;
        }
        getPlayerSafeNickname(targetUid, function(nick) {
            out.innerHTML = "<div class='clan-card-row'>" +
                "<span>👤 " + nick + " (" + query.trim() + ")</span>" +
                "<button class='clan-btn-primary' onclick='sendFriendRequestDirect(\"" + targetUid + "\")'>Добавить</button>" +
                "</div>";
        });
    });
}
function sendFriendRequestDirect(targetUid) {
    if (targetUid === profile.id) return alert("Нельзя добавить себя!");
    var updates = {};
    updates["friends/" + profile.id + "/outgoing/" + targetUid] = true;
    updates["friends/" + targetUid + "/incoming/" + profile.id] = true;
    db.ref().update(updates).then(function() { alert("Заявка отправлена!"); });
}
function acceptFriendRequest(fromId) {
    var updates = {};
    updates["friends/" + profile.id + "/incoming/" + fromId] = null;
    updates["friends/" + fromId + "/outgoing/" + profile.id] = null;
    updates["friends/" + profile.id + "/list/" + fromId] = true;
    updates["friends/" + fromId + "/list/" + profile.id] = true;
    db.ref().update(updates);
}
function rejectFriendRequest(fromId) {
    var updates = {};
    updates["friends/" + profile.id + "/incoming/" + fromId] = null;
    updates["friends/" + fromId + "/outgoing/" + profile.id] = null;
    db.ref().update(updates);
}
function removeFriend(friendId) {
    if (!confirm("Удалить из друзей?")) return;
    var updates = {};
    updates["friends/" + profile.id + "/list/" + friendId] = null;
    updates["friends/" + friendId + "/list/" + profile.id] = null;
    db.ref().update(updates);
}
// === МОДУЛЬ КЛАНОВ И КЛАНОВОГО ЧАТА ===function clanSetupUI() {
    if (!db || !profile.id) return;
    
    db.ref("users/" + profile.id + "/clanId").on("value", function(snap) {
        var userClanId = snap.val();
        if (!userClanId) {
            if ($("no-clan-view")) $("no-clan-view").style.display = "block";
            if ($("active-clan-view")) $("active-clan-view").style.display = "none";
            _loadClansList();
        } else {
            if ($("no-clan-view")) $("no-clan-view").style.display = "none";
            if ($("active-clan-view")) $("active-clan-view").style.display = "block";
            _loadCurrentClan(userClanId);
        }
    });
}
function clanCreate(name, tag, desc, type, callback) {
    if (!db || crystals < 500) return callback(false);
    var cleanTag = tag.toUpperCase().trim();
    
    var newClanRef = db.ref("clans").push();
    var clanId = newClanRef.key;
    
    var updates = {};
    updates["clans/" + clanId] = { name: name, tag: cleanTag, description: desc, type: type, ownerId: profile.id, invested: 0, level: 1 };
    updates["clans/" + clanId + "/members/" + profile.id] = { role: "owner", joinedAt: firebase.database.ServerValue.TIMESTAMP };
    updates["clanTags/" + cleanTag] = clanId;
    updates["users/" + profile.id + "/clanId"] = clanId;
    
    db.ref().update(updates).then(function() {
        crystals -= 500;
        callback(true);
    }).catch(function() { callback(false); });
}
function _loadClansList() {
    db.ref("clans").limitToFirst(10).once("value").then(function(snap) {
        var out = $("clan-search-results");
        if (!out) return;
        out.innerHTML = "";
        snap.forEach(function(child) {
            var c = child.val();
            var id = child.key;
            var row = document.createElement("div");
            row.className = "clan-list-card";
            row.innerHTML = "<h4>[" + c.tag + "] " + c.name + "</h4><button class='clan-btn-primary' onclick='clanJoin(\"" + id + "\")'>Вступить</button>";
            out.appendChild(row);
        });
    });
}
function clanJoin(clanId) {
    var updates = {};
    updates["users/" + profile.id + "/clanId"] = clanId;
    updates["clans/" + clanId + "/members/" + profile.id] = { role: "member", joinedAt: firebase.database.ServerValue.TIMESTAMP };
    db.ref().update(updates);
}
function clanSendChat(text) {
    if (!text.trim()) return;
    db.ref("users/" + profile.id + "/clanId").once("value").then(function(snap) {
        var cId = snap.val();
        if (!cId) return;
        db.ref("clans/" + cId + "/chat").push().set({
            senderId: profile.id,
            text: text.trim(),
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    });
}
function _loadCurrentClan(clanId) {
    db.ref("clans/" + clanId).on("value", function(snap) {
        var c = snap.val();
        if (!c) return;
        var title = document.getElementById("clan-info-title");
        if (title) title.innerText = "[" + c.tag + "] " + c.name;
        
        var mList = $("clan-members-list");
        if (mList && c.members) {
            mList.innerHTML = "";
            Object.keys(c.members).forEach(function(mId) {
                var row = document.createElement("div");
                row.className = "clan-member-row";
                getPlayerSafeNickname(mId, function(nick) {
                    row.innerHTML = "<span>👤 " + nick + "</span> <span class='clan-role-badge'>" + c.members[mId].role + "</span>";
                });
                mList.appendChild(row);
            });
        }
    });

    db.ref("clans/" + clanId + "/chat").limitToLast(40).on("value", function(snap) {
        var box = $("clan-chat-box");
        if (!box) return;
        box.innerHTML = "";
        snap.forEach(function(msgChild) {
            var m = msgChild.val();
            var div = document.createElement("div");
            div.className = "clan-chat-msg";
            getPlayerSafeNickname(m.senderId, function(nick) {
                div.innerHTML = "<b>" + nick + ":</b> " + m.text;
            });
            box.appendChild(div);
        });
        box.scrollTop = box.scrollHeight;
    });
}
// === МОДУЛЬ ЛИЧНЫХ СООБЩЕНИЙ (ЛС) ===var currentChatPartnerId = null;function openDirectMessage(partnerId) {
    currentChatPartnerId = partnerId;
    var dmModal = $("direct-messages-modal") || document.getElementById("dm-modal");
    if (dmModal) dmModal.style.display = "flex";
    
    var chatId = profile.id < partnerId ? profile.id + "_" + partnerId : partnerId + "_" + profile.id;
    db.ref("chats/" + chatId).orderByChild("timestamp").limitToLast(50).on("value", function(snap) {
        var box = $("dm-messages-box");
        if (!box) return;
        box.innerHTML = "";
        snap.forEach(function(child) {
            var m = child.val();
            var d = document.createElement("div");
            d.className = m.senderId === profile.id ? "msg msg-own" : "msg msg-partner";
            getPlayerSafeNickname(m.senderId, function(nick) {
                d.innerHTML = "<b>" + nick + ":</b> " + m.text;
            });
            box.appendChild(d);
        });
        box.scrollTop = box.scrollHeight;
    });
}
function dmSend(text) {
    if (!text.trim() || !currentChatPartnerId) return;

var chatId = profile.id < currentChatPartnerId ? profile.id + "" + currentChatPartnerId : currentChatPartnerId + "" + profile.id;
db.ref("chats/" + chatId).push().set({
senderId: profile.id,
text: text.trim(),
timestamp: firebase.database.ServerValue.TIMESTAMP
});
}
// === РИТМ-ДВИЖОК МИНИ-ИГРЫ [FNF](https://www.google.com/search?q=fnf&kgmid=/g/11r1h0grrd) ===
var fnfActive = false, fnfScore = 0, fnfCombo = 0;
function fnfOpen() {
var overlay = $("fnf-overlay");
if (overlay) {
overlay.style.display = "flex";
overlay.style.height = "100dvh";
}
}
function startFnfBattle() {
if (fnfActive) return;
fnfActive = true;
fnfScore = 0; fnfCombo = 0;
if (typeof playSound === "function") playSound("boss");
var engine = setInterval(function() {
if (!fnfActive || !$("fnf-overlay") || $("fnf-overlay").style.display === "none") {
clearInterval(engine);
return;
}
var track = Math.floor(Math.random() * 4);
_spawnArrowOnTrack(track);
}, 550);
}
function _spawnArrowOnTrack(trackId) {
var track = $("fnf-track-" + trackId);
if (!track) return;
var arrow = document.createElement("div");
arrow.className = "fnf-falling-arrow";
track.appendChild(arrow);
var top = 0;
var anim = setInterval(function() {
if (!fnfActive) { clearInterval(anim); arrow.remove(); return; }
top += 6;
arrow.style.top = top + "px";
if (top > 420) {
clearInterval(anim);
arrow.remove();
fnfCombo = 0;
_updateFnfUI();
}
}, 20);
arrow.dataset.loopId = anim;
}
function triggerFnfHit(trackId) {
var track = $("fnf-track-" + trackId);
if (!track) return;
var arrows = track.getElementsByClassName("fnf-falling-arrow");
if (arrows.length > 0) {
var arrow = arrows[0];
var top = parseInt(arrow.style.top || 0);
if (top >= 310 && top <= 390) {
fnfScore += 15 + fnfCombo;
fnfCombo++;
} else {
fnfCombo = 0;
}
clearInterval(parseInt(arrow.dataset.loopId));
arrow.remove();
_updateFnfUI();
}
}
function _updateFnfUI() {
if ($("fnf-score-display")) $("fnf-score-display").innerText = "🎵 " + fnfScore;
if ($("fnf-combo-display")) $("fnf-combo-display").innerText = "🔥 " + fnfCombo;
}
// === РЫНОК АУКЦИОНА ===
function auctionSetupTabs() { _loadAuctionData(); }
function _loadAuctionData() {
if (!db) return;
db.ref("auction/lots").once("value").then(function(snap) {
var m = $("auction-market-list");
if (!m) return; m.innerHTML = "";
snap.forEach(function(child) {
var l = child.val();
var card = document.createElement("div");
card.className = "auction-lot-card";
card.innerHTML = "🐾 " + l.petName + "Цена: 💰 " + l.price + "Купить";
m.appendChild(card);
});
});
}
function buyAuctionLot(lotId, price) {
if (coins < price) return alert("Недостаточно монет!");
db.ref("auction/lots/" + lotId).once("value").then(function(snap) {
if (!snap.exists()) return alert("Лот уже продан!");
coins -= price;
var updates = {};
updates["auction/lots/" + lotId] = null;
updates["users/" + profile.id + "/pets/" + snap.val().petId] = { name: snap.val().petName, hunger: 100 };
db.ref().update(updates).then(function() { _loadAuctionData(); });
});
}
// === АДМИН-ПАНЕЛЬ ===
var ADMIN_IDS = ["u_1790687044368_j0ic", "u_1790687777315_g6nn"];
function adminSetup() { console.log("Консоль администратора Krochlupic Up активна."); }
// === ЛОКАЛЬНОЕ СОХРАНЕНИЕ / ЗАГРУЗКА PROGRESS ===
function saveProgress() {
var state = {
coins: coins,
crystals: crystals,
shards: shards,
totalTaps: totalTaps,
totalEarned: totalEarned,
depositLevel: depositLevel,
generatorLevel: generatorLevel
};
localStorage.setItem("krochlupic_save_v226", JSON.stringify(state));
}
function loadProgress() {
var localData = localStorage.getItem("krochlupic_save_v226");
if (localData) {
var state = JSON.parse(localData);
coins = state.coins || 0;
crystals = state.crystals || 0;
shards = state.shards || 0;
totalTaps = state.totalTaps || 0;
totalEarned = state.totalEarned || 0;
depositLevel = state.depositLevel || 0;
generatorLevel = state.generatorLevel || 1;
}
}
function updateDisplay() {
if ($("coins-display")) $("coins-display").innerText = Math.floor(coins) + " монет";
if ($("crystals-display")) $("crystals-display").innerText = crystals;
if ($("shards-display")) $("shards-display").innerText = shards;
}
// === ГЛОБАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ И ЗАПУСК ДВИЖКА ===
function init() {
loadProgress();
initAudio();
updateDisplay();
// Принудительная регистрация профиля на Firebase при первом запуске
if (db && profile.id) {
db.ref("users/" + profile.id).set({
nickname: profile.nickname || "Игрок_" + profile.id.substring(2, 7),
lastSeen: firebase.database.ServerValue.TIMESTAMP
});
}
setupFriendsUI();
clanSetupUI();
adminSetup();
// Основной игровой луп (1 раз в секунду)
setInterval(function() {
totalPlayTime++;
tickPetsEngine();
processDepositEngine();
if (totalPlayTime % 30 === 0) saveProgress(); // Автосохранение каждые 30 секунд
}, 1000);
console.log("🚀 Игровой движок Krochlupic Up! v226 успешно запущен!");
}
// Привязка глобального жизненного цикла
window.setupFriendsUI = setupFriendsUI;
window.clanSetupUI = clanSetupUI;
window.fnfOpen = fnfOpen;
window.startFnfBattle = startFnfBattle;
window.triggerFnfHit = triggerFnfHit;
window.auctionSetupTabs = auctionSetupTabs;
window.adminSetup = adminSetup;
// Точка старта PWA приложения
document.addEventListener("DOMContentLoaded", init);
// === 1. ОТОБРАЖЕНИЕ МАГАЗИНА УЛУЧШЕНИЙ ===
function renderShop() {
    var container = $("upgrades-list-container") || document.querySelector(".upgrades-list");
    if (!container) return;
    container.innerHTML = "";

    UPGRADES_DATA.forEach(function(upg, index) {
        var card = document.createElement("div");
        card.className = "upgrade-card";
        
        // Расчет стоимости с учетом инфляции и скидки от Тёмного касания
        var discount = 1 - (SHARD_ITEMS_DATA.shadow_step.count * SHARD_ITEMS_DATA.shadow_step.amount);
        var currentCost = Math.floor(upg.cost * Math.pow(UPGRADE_COST_MULT, upg.count) * discount);

        card.innerHTML = "<div class='upgrade-info'>" +
            "<h5>" + upg.name + " <span class='upgrade-count'>[" + upg.count + "]</span></h5>" +
            "<p>Доход: +" + (upg.income * eventMultiplier).toFixed(1) + "/сек</p>" +
            "</div>" +
            "<button class='buy-btn' data-index='" + index + "'>💰 " + formatNumber(currentCost) + "</button>";

        // Привязка события покупки напрямую к кнопке
        card.querySelector(".buy-btn").addEventListener("click", function() {
            buyUpgrade(index);
        });

        container.appendChild(card);
    });
}

function buyUpgrade(index) {
    var upg = UPGRADES_DATA[index];
    var discount = 1 - (SHARD_ITEMS_DATA.shadow_step.count * SHARD_ITEMS_DATA.shadow_step.amount);
    var currentCost = Math.floor(upg.cost * Math.pow(UPGRADE_COST_MULT, upg.count) * discount);

    if (coins < currentCost) return alert(t("alert_not_enough_coins"));
    if (upg.count >= UPGRADE_MAX_LEVEL) return alert("Достигнут максимальный уровень улучшения!");

    coins -= currentCost;
    upg.count++;
    
    // Пересчет монет в секунду
    recalculateCPS();
    renderShop();
    updateDisplay();
    saveProgress();
}

function recalculateCPS() {
    var baseCPS = 0;
    UPGRADES_DATA.forEach(function(upg) {
        baseCPS += upg.income * upg.count;
    });

    // Добавление бонусов от предметов за осколки (Кровавое ядро)
    var percentBonus = 1 + (SHARD_ITEMS_DATA.blood_core.count * SHARD_ITEMS_DATA.blood_core.amount);
    coinsPerSecond = baseCPS * eventMultiplier * percentBonus;
}

// === 2. ОТОБРАЖЕНИЕ МАГАЗИНА ПРЕДМЕТОВ ЗА КРИСТАЛЛЫ ===
function renderCrystalShop() {
    var container = $("crystal-items-container");
    if (!container) return;
    container.innerHTML = "";

    Object.keys(CRYSTAL_ITEMS).forEach(function(key) {
        var item = CRYSTAL_ITEMS[key];
        var div = document.createElement("div");
        div.className = "crystal-item-card";
        div.innerHTML = "<div class='item-icon'>" + item.icon + "</div>" +
            "<h4>" + item.name + "</h4>" +
            "<p>" + item.desc + "</p>" +
            "<button onclick='buyCrystalItem(\"" + key + "\")'>💎 " + item.cost + "</button>";
        container.appendChild(div);
    });
}

function buyCrystalItem(itemKey) {
    var item = CRYSTAL_ITEMS[itemKey];
    if (crystals < item.cost) return alert(t("alert_not_enough_crystals"));

    crystals -= item.cost;
    
    if (itemKey === "coinsBag") {
        coins += (coinsPerSecond * 3600) || 5000;
    } else if (itemKey === "chest") {
        openFreeChest();
    } else if (itemKey === "depositUp") {
        if (depositLevel > 0 && depositLevel < 25) depositLevel++;
    } else if (BOOSTERS[itemKey]) {
        BOOSTERS[itemKey].storage++;
    }

    renderCrystalShop();
    updateDisplay();
    saveProgress();
}
// === 3. ОТОБРАЖЕНИЕ ДОСТИЖЕНИЙ ===
function renderAchievements() {
    var container = $("achievements-grid-list");
    if (!container) return;
    container.innerHTML = "";

    ACHIEVEMENTS_DATA.forEach(function(ach) {
        var card = document.createElement("div");
        var isUnlocked = unlocked[ach.id] ? true : false;
        card.className = "ach-card " + ach.tier + (isUnlocked ? " ach-unlocked" : " ach-locked");
        
        card.innerHTML = "<h5>" + (isUnlocked ? "🏆 " : "🔒 ") + ach.title + "</h5>" +
            "<p>" + ach.desc + "</p>" +
            "<span class='tier-badge'>" + ach.tier.toUpperCase() + "</span>";
        container.appendChild(card);
    });
}

function checkAchievementsUnlock() {
    ACHIEVEMENTS_DATA.forEach(function(ach) {
        if (!unlocked[ach.id] && ach.check()) {
            unlocked[ach.id] = true;
            crystals = Math.min(crystalsMax, crystals + (ach.tier === "bronze" ? 1 : (ach.tier === "silver" ? 3 : 5)));
            createSystemNotification("🏆 Достижение разблокировано: " + ach.title);
            playSound("achievement");
            saveProgress();
        }
    });
}

function createSystemNotification(text) {
    var box = $("system-notifications-overlay");
    if (!box) return;
    var alertDiv = document.createElement("div");
    alertDiv.className = "sys-alert-toast";
    alertDiv.innerText = text;
    box.appendChild(alertDiv);
    setTimeout(function() { alertDiv.remove(); }, 4000);
}

// === 4. ОТОБРАЖЕНИЕ ПИТОМЦЕВ В АЛЬМАНАХЕ ===
function renderPetsUI() {
    var eggBtn = $("buy-egg-btn-text");
    if (eggBtn) {
        if (currentEgg.status === "empty") eggBtn.innerText = "🥚 Купить яйцо — 65 💎";
        else if (currentEgg.status === "incubating") eggBtn.innerText = "⏳ Высиживание...";
        else if (currentEgg.status === "ready") eggBtn.innerText = "🐣 Нажми, чтобы забрать питомца!";
    }

    var storageContainer = $("pets-storage-list");
    if (!storageContainer) return;
    storageContainer.innerHTML = "";

    var petKeys = Object.keys(playerPets);
    if (petKeys.length === 0) {
        storageContainer.innerHTML = "<p class='empty-info'>В хранилище пусто (0 / 5)</p>";
        return;
    }

    petKeys.forEach(function(pId) {
        var pet = playerPets[pId];
        var div = document.createElement("div");
        div.className = "pet-storage-card" + (activePetId === pId ? " active-pet-border" : "");
        div.innerHTML = "🤖 <b>" + pet.name + "</b><br>" +
            "🍽️ Сытость: " + Math.floor(pet.hunger) + "%<br>" +
            "<div class='pet-card-actions'>" +
            "<button onclick='activatePet(\"" + pId + "\")'>" + (activePetId === pId ? "Убрать" : "Вызвать") + "</button>" +
            "<button onclick='feedPet(\"berry\")'>🍓</button>" +
            "<button onclick='feedPet(\"banana\")'>🍌</button>" +
            "</div>";
        storageContainer.appendChild(div);
    });
}

function activatePet(petId) {
    if (activePetId === petId) {
        activePetId = null;
    } else {
        activePetId = petId;
    }
    renderPetsUI();
    saveProgress();
}
// === 5. ВСПОРМОГАТЕЛЬНЫЙ ФОРМАТТЕР БОЛЬШИХ ЧИСЕЛ ===
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return "0";
    if (num < 1000) return num.toFixed(0);
    
    var suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    var i = Math.floor(Math.log10(num) / 3);
    
    if (i >= suffixes.length) return num.toExponential(2);
    
    var formatted = (num / Math.pow(10, i * 3)).toFixed(2);
    return formatted + suffixes[i];
}

// === 6. ЛОГИКА НАВИГАЦИИ (ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК И МЕНЮ) ===
function setupNavigation() {
    // Главные вкладки (Магазин, Достижения, Скины и т.д.)
    document.querySelectorAll(".clan-tab, .menu-tab-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            var targetTab = btn.dataset.tab;
            if (!targetTab) return;

            // Выключение активных классов кнопок
            document.querySelectorAll(".clan-tab, .menu-tab-btn").forEach(function(b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");

            // Скрытие всех экранов и отображение целевого
            document.querySelectorAll(".tab-panel-view, .clan-pane").forEach(function(panel) {
                panel.classList.add("hidden");
                panel.style.display = "none";
            });

            var activePanel = $(targetTab) || document.querySelector("." + targetTab);
            if (activePanel) {
                activePanel.classList.remove("hidden");
                activePanel.style.display = "block";
            }

            // Вызов специфического рендеринга при переходе во вкладку
            if (targetTab === "tab-shop") renderShop();
            if (targetTab === "tab-achievements") renderAchievements();
            if (targetTab === "tab-crystal-shop") renderCrystalShop();
            if (targetTab === "tab-pets") renderPetsUI();
            if (targetTab === "tab-friends") setupFriendsUI();
            if (targetTab === "tab-clans") clanSetupUI();
        });
    });
}

function openModalWindow(modalId) {
    var modal = $(modalId);
    if (modal) {
        modal.style.display = "flex";
        modal.classList.remove("hidden");
    }
}

function closeModalWindow(modalId) {
    var modal = $(modalId);
    if (modal) {
        modal.style.display = "none";
        modal.classList.add("hidden");
    }
}
// === 7. ГРАФИЧЕСКИЙ ДВИЖОК ЭФФЕКТОВ ЗАДНЕГО ПЛАНА (CANVAS) ===
function initBgCanvas() {
    bgCanvas = $("background-render-canvas") || document.createElement("canvas");
    if (!bgCanvas) return;
    
    bgCanvas.style.position = "fixed";
    bgCanvas.style.top = "0";
    bgCanvas.style.left = "0";
    bgCanvas.style.width = "100%";
    bgCanvas.style.height = "100%";
    bgCanvas.style.zIndex = "-1";
    bgCanvas.style.pointerEvents = "none";
    
    if (!bgCanvas.parentElement) document.body.appendChild(bgCanvas);
    bgCtx = bgCanvas.getContext("2d");
    
    window.addEventListener("resize", resizeBgCanvas);
    resizeBgCanvas();
    startBgAnimationLoop();
}

function resizeBgCanvas() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}

function applySelectedBackground(bgKey) {
    if (!BACKGROUNDS[bgKey] || !BACKGROUNDS[bgKey].owned) return;
    
    activeBg = bgKey;
    var bgData = BACKGROUNDS[bgKey];
    
    // Сброс старых классов стилей с тега body
    Object.keys(BACKGROUNDS).forEach(function(k) {
        if (BACKGROUNDS[k].cls) document.body.classList.remove(BACKGROUNDS[k].cls);
    });
    
    if (bgData.cls) document.body.classList.add(bgData.cls);
    
    // Перегенерация массива частиц под новую тему
    bgParticles = [];
    var maxParticles = settings.lessParticles ? 15 : 45;
    
    for (var i = 0; i < maxParticles; i++) {
        bgParticles.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            radius: Math.random() * 3 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            alpha: Math.random()
        });
    }
}

function startBgAnimationLoop() {
    if (!bgCtx || !bgCanvas) return;
    
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Логика отрисовки эффектов в зависимости от выбранного фона
    if (activeBg === "space") {
        bgCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
        bgParticles.forEach(function(p) {
            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            bgCtx.fill();
            
            p.y += p.speedY * 0.5;
            if (p.y > bgCanvas.height) p.y = 0;
        });
    } else if (activeBg === "flame") {
        bgParticles.forEach(function(p) {
            bgCtx.fillStyle = "rgba(255, 69, 0, " + p.alpha + ")";
            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
            bgCtx.fill();
            
            p.y -= Math.abs(p.speedY) * 1.2;
            if (p.y < 0) {
                p.y = bgCanvas.height;
                p.x = Math.random() * bgCanvas.width;
            }
        });
    } else if (activeBg === "ocean") {
        bgCtx.strokeStyle = "rgba(0, 191, 255, 0.4)";
        bgParticles.forEach(function(p) {
            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
            bgCtx.stroke();
            
            p.y -= Math.abs(p.speedY) * 0.4;
            p.x += Math.sin(p.y / 30) * 0.5;
            if (p.y < 0) p.y = bgCanvas.height;
        });
    }
    
    bgAnimFrame = requestAnimationFrame(startBgAnimationLoop);
}
