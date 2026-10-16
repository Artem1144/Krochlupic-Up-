/* ==== Krochlupic Halloween 2026 — Полный модуль ==== */
(function(){
  "use strict";

  var HALLOWEEN_DEBUG = true;
  var DATE_PASS_START   = new Date("2026-10-23T08:30:00").getTime();
  var DATE_GIFTS_START  = new Date("2026-10-24T08:30:00").getTime();
  var DATE_END          = new Date("2026-11-03T00:00:00").getTime();

  var FLASH_CHANCE = 0.005;
  var NIGHT_START_H = 21;
  var NIGHT_END_H   = 3;
  var MSK_OFFSET    = 3 * 60;
  var SPOOKY_PET_CHANCE = 0.045;
  var H_KEY = "clicker-halloween-state";

  // ==== ПАСС ====
  var PASS_LEVELS = [
    { need: 15,   label: "💎 50 кристаллов",           reward: "gems50" },
    { need: 25,   label: "💰 Доход за 1 час",          reward: "coinHour" },
    { need: 50,   label: "🌑 500 осколков",            reward: "shards500" },
    { need: 100,  label: "🍬 150 конфет",              reward: "candies150" },
    { need: 250,  label: "⚡ 3× Буст ×5",              reward: "boost3" },
    { need: 500,  label: "🎃 Скин на кнопку «Тыква»",  reward: "skinPumpkin" },
    { need: 1000, label: "🍬 500 + 💎 100 + 🌑 1500",  reward: "mega" }
  ];

  // ==== ПОДАРКИ ====
  var GIFT_DAYS = [
    { day: 1, label: "🍬 200 конфет",                        reward: "candies200" },
    { day: 2, label: "💎 20 кристаллов",                     reward: "gems20" },
    { day: 3, label: "🌑 150 кровавых осколков",             reward: "shards150" },
    { day: 4, label: "⚡ 3 бустера ×5",                       reward: "boost3" },
    { day: 5, label: "🏮 100 фонарей",                       reward: "flash100" },
    { day: 6, label: "🍬 250 конфет + 🎁 3 сундука",         reward: "candies250chest3" },
    { day: 7, label: "🏅 Баннер «Сладость или гадость»",      reward: "bannerHalloween" }
  ];

  // ==== КОТЁЛ ====
  var RECIPES = [
    { id:"magic", icon:"🟣", name:"Магия",  desc:"+25% к CPS",           category:"income", cost:{ gems:5,  candies:100 }, duration: 15*60, effect:{ income:0.25 } },
    { id:"dark",  icon:"⚫", name:"Тьма",   desc:"+30% к тапу",          category:"tap",    cost:{ shards:10, candies:150 }, duration: 10*60, effect:{ tap:0.30 } },
    { id:"blood", icon:"🔴", name:"Кровь",  desc:"+2% шанс крита",       category:"crit",   cost:{ gems:3,  candies:200 }, duration: 20*60, effect:{ crit:0.02 } },
    { id:"luck",  icon:"🟢", name:"Удача",  desc:"+50% шанс фонариков",  category:"flash",  cost:{ candies:250 }, duration: 10*60, effect:{ flash:0.50 } },
    { id:"rain",  icon:"🟡", name:"Дождь",  desc:"+50% к осколкам",      category:"shards", cost:{ candies:300 }, duration: 15*60, effect:{ shards:0.50 } }
  ];

  // ==== ГЛОБАЛ ====
  var GLOBAL_LEVELS = [
    { need: 1000,  icon: "🎁", label: "3 сундука",              reward: "chest3" },
    { need: 2500,  icon: "💎", label: "50 кристаллов",          reward: "gems50" },
    { need: 5000,  icon: "🎁", label: "3 сундука",              reward: "chest3" },
    { need: 7500,  icon: "🥚", label: "Яйцо питомца",           reward: "petEgg" },
    { need: 9000,  icon: "⭐", label: "250 опыта питомцев",     reward: "petXP250" },
    { need: 12000, icon: "🖼️", label: "Фон «Ужасные ужасы»",    reward: "bgHorror" },
    { need: 15000, icon: "🎁", label: "5 сундуков",             reward: "chest5" },
    { need: 18000, icon: "🌑", label: "750 осколков",           reward: "shards750" },
    { need: 20000, icon: "✨", label: "Эффект тапа «Призраки»",  reward: "tapGhosts" },
    { need: 25000, icon: "🏅", label: "Баннер «Порождение ночи»", reward: "bannerNight" }
  ];
  var GLOBAL_KEY = "halloween2026/global";

  // ==== СУНДУК КОНФЕТ ====
  var CANDY_CHEST_KEY = "clicker-candy-chest-last";
  var CANDY_CHEST_COOLDOWN = 60 * 60 * 1000;
  var CANDY_CHEST_MIN = 5;
  var CANDY_CHEST_MAX = 30;

  // ==== ДОМ ====
  var HOUSE_KEY = "clicker-house-last";
  var HOUSE_COOLDOWN = 3 * 60 * 60 * 1000;
  var HOUSE_SAFE = 100;
  var HOUSE_MIN = 50;
  var HOUSE_MAX = 125;

  // ==== СОСТОЯНИЕ ====
  function loadState(){
    try{
      var s = JSON.parse(localStorage.getItem(H_KEY) || "{}");
      return {
        flashlights: s.flashlights || 0,
        candies: s.candies || 0,
        claimedPass: s.claimedPass || {},
        claimedGifts: s.claimedGifts || {},
        hasSpookyPet: s.hasSpookyPet || false,
        hasPumpkinSkin: s.hasPumpkinSkin || false,
        hasBanner: s.hasBanner || false,
        hasBannerNight: s.hasBannerNight || false,
        hasTapGhostsEffect: s.hasTapGhostsEffect || false,
        nightQuests: s.nightQuests || null,
        potions: s.potions || {},
        globalDeposited: s.globalDeposited || 0
      };
    }catch(e){
      return {
        flashlights:0, candies:0, claimedPass:{}, claimedGifts:{},
        hasSpookyPet:false, hasPumpkinSkin:false, hasBanner:false,
        hasBannerNight:false, hasTapGhostsEffect:false,
        nightQuests:null, potions:{},
        globalDeposited:0
      };
    }
  }
  function saveState(s){ try{ localStorage.setItem(H_KEY, JSON.stringify(s)); }catch(e){} }
  var STATE = loadState();

  // ==== МИГРАЦИЯ: старые конфеты не идут в глобал автоматически ====
  (function migrateGlobal(){
    try{
      var raw = localStorage.getItem(H_KEY);
      if(!raw) return;
      var s = JSON.parse(raw);
      if(typeof s.globalDeposited === "undefined"){
        s.globalDeposited = s.candies || 0;
        localStorage.setItem(H_KEY, JSON.stringify(s));
        STATE.globalDeposited = s.globalDeposited;
      }
    }catch(e){}
  })();

  // ==== ВРЕМЯ ====
  function mskNow(){
    var d = new Date();
    return new Date(d.getTime() + (d.getTimezoneOffset() + MSK_OFFSET) * 60000);
  }
  function isNightActive(){
    if(HALLOWEEN_DEBUG) return true;
    var h = mskNow().getHours();
    return h >= NIGHT_START_H || h < NIGHT_END_H;
  }
  function msUntilNightEnd(){
    var m = mskNow();
    var nowSec = m.getHours()*3600 + m.getMinutes()*60 + m.getSeconds();
    var endSec = NIGHT_END_H * 3600;
    if(m.getHours() >= NIGHT_START_H) return (24*3600 - nowSec) + endSec;
    return endSec - nowSec;
  }
  function msUntilNightStart(){
    var m = mskNow();
    var nowSec = m.getHours()*3600 + m.getMinutes()*60 + m.getSeconds();
    return NIGHT_START_H * 3600 - nowSec;
  }
  function fmtHHMMSS(ms){
    if(ms < 0) ms = 0;
    var t = Math.floor(ms/1000);
    var h = Math.floor(t/3600); t %= 3600;
    var m = Math.floor(t/60); var s = t%60;
    return (h<10?"0":"")+h+":"+(m<10?"0":"")+m+":"+(s<10?"0":"")+s;
  }
  function isPassActive(){
    if(HALLOWEEN_DEBUG) return true;
    var t = Date.now();
    return t >= DATE_PASS_START && t < DATE_END;
  }
  function isGiftsActive(){
    if(HALLOWEEN_DEBUG) return true;
    var t = Date.now();
    return t >= DATE_GIFTS_START && t < DATE_END;
  }
  function isEventActive(){ return isPassActive() || isGiftsActive(); }
  function isGiftDayAvailable(dayNum){
    if(HALLOWEEN_DEBUG) return true;
    if(!isGiftsActive()) return false;
    var startForDay = DATE_GIFTS_START + (dayNum - 1) * 24*60*60*1000;
    return Date.now() >= startForDay;
  }
  function getNightKey(){
    var m = mskNow();
    var d = new Date(m.getTime());
    if(d.getHours() < NIGHT_END_H) d.setDate(d.getDate() - 1);
    return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
  }

  // ==== УТИЛИТЫ ====
  function byId(id){ return document.getElementById(id); }
  function show(id){ var m=byId(id); if(m) m.classList.remove("hidden"); }
  function fmt(n){ if(typeof formatNumber==="function") return formatNumber(n); return String(Math.floor(n||0)); }

  // ==== UI ====
  function updateCandiesUI(){
    var el = byId("candies-info"), val = byId("candies");
    if(!el || !val) return;
    if(!isEventActive() && STATE.candies === 0){ el.classList.add("hidden"); return; }
    val.textContent = STATE.candies;
    el.classList.remove("hidden");
  }
  function updateSideBtn(){
    var b = byId("halloween-side-btn");
    if(!b) return;
    if(isEventActive()) b.classList.remove("hidden");
    else b.classList.add("hidden");
  }
  function updateBannerFlag(){
    window.__halloweenBanner = !!STATE.hasBanner;
    window.__halloweenBannerNight = !!STATE.hasBannerNight;
    window.__hwTapGhostsEffect = !!STATE.hasTapGhostsEffect;
  }

  // ==== ФОНАРИКИ ====
  function hookTap(){
    var btn = byId("click-btn");
    if(!btn || btn.__hwHooked) return;
    btn.__hwHooked = true;
    btn.addEventListener("click", function(){
      if(!isPassActive()) return;
      var bonus = 0;
      if(typeof window.__hwPotionFlash === "number") bonus = window.__hwPotionFlash;
      var chance = FLASH_CHANCE * (isNightActive() ? 2 : 1) * (1 + bonus);
      if(Math.random() < chance){
        STATE.flashlights++;
        saveState(STATE);
        popFlash();
        var m = byId("modal-halloween");
        if(m && !m.classList.contains("hidden")) renderPass();
      }
    }, {passive:true});
  }
  function popFlash(){
    var btn = byId("click-btn");
    if(!btn) return;
    var rect = btn.getBoundingClientRect();
    var el = document.createElement("div");
    el.textContent = "🏮 +1";
    el.style.cssText =
      "position:fixed;left:" + (rect.left + rect.width/2) + "px;top:" + rect.top + "px;"+
      "transform:translate(-50%,-50%);font-size:26px;font-weight:bold;"+
      "color:#ffab40;text-shadow:0 0 12px #ff6f00,0 2px 6px rgba(0,0,0,.9);"+
      "pointer-events:none;z-index:99999;transition:all 1.2s ease-out;";
    document.body.appendChild(el);
    requestAnimationFrame(function(){
      el.style.top = (rect.top - 120) + "px";
      el.style.opacity = "0";
    });
    setTimeout(function(){ el.remove(); }, 1300);
    if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
  }

  // ==== ПИТОМЕЦ ====
  function hookPetRoll(){
    if(window.__hwPetRollHooked) return;
    window.__hwPetRollHooked = true;
    window.__hwRollType = function(){
      if(!isPassActive()) return null;
      if(Math.random() < SPOOKY_PET_CHANCE){
        STATE.hasSpookyPet = true; saveState(STATE);
        return "spookyPet";
      }
      return null;
    };
  }
  function tickCritBonus(){
    var bonus = 0;
    if(typeof petsState !== "undefined" && petsState.active && petsState.active.type === "spookyPet" && petsState.hunger > 0){
      bonus = 0.015;
    }
    window.halloweenCritBonus = bonus;
  }

  // ==== ПАСС ====
  function grantPassReward(rewardId){
    var ok = true;
    try{
      if(rewardId === "gems50"){
        if(typeof addCrystals === "function") addCrystals(50); else ok = false;
      } else if(rewardId === "coinHour"){
        var cps = (typeof getCPS === "function") ? getCPS() : 0;
        var gain = Math.max(1000, Math.floor(cps * 3600));
        if(typeof coins !== "undefined") coins += gain;
        if(typeof totalEarned !== "undefined") totalEarned += gain;
      } else if(rewardId === "shards500"){
        if(typeof shards !== "undefined") shards += 500;
      } else if(rewardId === "candies150"){
        STATE.candies += 150; saveState(STATE);
      } else if(rewardId === "boost3"){
        if(typeof BOOSTERS !== "undefined" && BOOSTERS.boost5){
          BOOSTERS.boost5.storage = (BOOSTERS.boost5.storage || 0) + 3;
          var pb1 = document.createElement("div");
          pb1.className = "achievement-popup";
          pb1.style.background = "linear-gradient(135deg,#7b1fa2,#c2185b)";
          pb1.style.color = "#fff";
          pb1.textContent = "⚡ 3 бустера ×5 добавлено в хранилище!";
          document.body.appendChild(pb1);
          setTimeout(function(){ pb1.remove(); }, 4000);
        } else { ok = false; }
      } else if(rewardId === "skinPumpkin"){
        STATE.hasPumpkinSkin = true; saveState(STATE);
        if(typeof skins !== "undefined" && skins.pumpkin){
          skins.pumpkin.owned = true;
          if(typeof saveSkins === "function") saveSkins();
          if(typeof renderSkins === "function"){ try{ renderSkins(); }catch(e){} }
        }
      } else if(rewardId === "mega"){
        STATE.candies += 500; saveState(STATE);
        if(typeof addCrystals === "function") addCrystals(100);
        if(typeof shards !== "undefined") shards += 1500;
      } else { ok = false; }
    }catch(e){ ok = false; }
    if(ok){
      if(typeof updateUI === "function"){ try{ updateUI(); }catch(e){} }
      if(typeof saveGame === "function"){ try{ saveGame(); }catch(e){} }
      if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
      updateCandiesUI();
    }
    return ok;
  }
  function claimLevel(idx){
    var lvl = PASS_LEVELS[idx];
    if(!lvl) return;
    if(STATE.claimedPass[lvl.need]) return;
    if(STATE.flashlights < lvl.need) return;
    if(grantPassReward(lvl.reward)){
      STATE.claimedPass[lvl.need] = true;
      saveState(STATE);
      renderPass();
    }
  }
  function renderPass(){
    var pane = byId("halloween-pane-pass");
    if(!pane) return;
    var html = '<div style="text-align:center;margin-bottom:14px;">'+
      '<div style="font-size:38px">🏮</div>'+
      '<div style="font-size:22px;font-weight:bold;color:#ffab40;text-shadow:0 0 10px rgba(255,111,0,.6)">'+STATE.flashlights+'</div>'+
      '<div style="font-size:12px;color:#aaa;margin-top:4px">фонариков собрано</div>'+
    '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    PASS_LEVELS.forEach(function(lvl, idx){
      var claimed = !!STATE.claimedPass[lvl.need];
      var canClaim = !claimed && STATE.flashlights >= lvl.need;
      var pct = Math.min(100, Math.round((STATE.flashlights / lvl.need) * 100));
      var barColor = claimed ? "#4caf50" : (canClaim ? "#ff6f00" : "#7b1fa2");
      var btn;
      if(claimed){
        btn = '<div style="color:#4caf50;font-weight:bold;font-size:12px;padding:8px 10px;background:#0e1a30;border-radius:8px">✅ Получено</div>';
      } else if(canClaim){
        btn = '<button data-hwclaim="'+idx+'" style="background:linear-gradient(135deg,#ff6f00,#7b1fa2);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-weight:bold;font-size:13px;cursor:pointer;box-shadow:0 3px 0 #4a148c">Забрать</button>';
      } else {
        btn = '<div style="color:#7a8aa8;font-size:12px;padding:8px 10px">'+lvl.need+' 🏮</div>';
      }
      html += '<div style="background:#0e1a30;border:1px solid #253a5c;border-radius:10px;padding:10px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'+
          '<div style="flex:1;min-width:0">'+
            '<div style="font-size:12px;color:#ffd54f;font-weight:bold">🏮 '+lvl.need+'</div>'+
            '<div style="font-size:13px;color:#e0e0e0;margin-top:2px">'+lvl.label+'</div>'+
            '<div style="height:6px;background:#1a2540;border-radius:3px;margin-top:6px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+barColor+';transition:width .3s"></div></div>'+
          '</div>'+
          '<div style="flex-shrink:0">'+btn+'</div>'+
        '</div>'+
      '</div>';
    });
    html += '</div>';
    pane.innerHTML = html;
    pane.querySelectorAll("[data-hwclaim]").forEach(function(b){
      b.onclick = function(){ claimLevel(parseInt(b.dataset.hwclaim,10)); };
    });
  }

  // ==== ПОДАРКИ ====
  function grantGiftReward(rewardId){
    var ok = true;
    try{
      if(rewardId === "candies200"){
        STATE.candies += 200; saveState(STATE);
      } else if(rewardId === "gems20"){
        if(typeof addCrystals === "function") addCrystals(20); else ok = false;
      } else if(rewardId === "shards150"){
        if(typeof shards !== "undefined") shards += 150;
      } else if(rewardId === "boost3"){
        if(typeof BOOSTERS !== "undefined" && BOOSTERS.boost5){
          BOOSTERS.boost5.storage = (BOOSTERS.boost5.storage || 0) + 3;
          var pb2 = document.createElement("div");
          pb2.className = "achievement-popup";
          pb2.style.background = "linear-gradient(135deg,#7b1fa2,#c2185b)";
          pb2.style.color = "#fff";
          pb2.textContent = "⚡ 3 бустера ×5 добавлено в хранилище!";
          document.body.appendChild(pb2);
          setTimeout(function(){ pb2.remove(); }, 4000);
        } else { ok = false; }
      } else if(rewardId === "flash100"){
        STATE.flashlights += 100; saveState(STATE);
      } else if(rewardId === "candies250chest3"){
        STATE.candies += 250; saveState(STATE);
        var summaryC = 0, summaryCoins = 0, summarySh = 0;
        for(var i=0;i<3;i++){
          var r = (typeof getChestRewards === "function") ? getChestRewards() : {coins:500,crystals:5,shards:15,booster:"boost2"};
          summaryC += r.crystals;
          summaryCoins += r.coins;
          summarySh += r.shards;
          if(typeof addCrystals === "function") addCrystals(r.crystals);
          if(typeof coins !== "undefined") coins += r.coins;
          if(typeof totalEarned !== "undefined") totalEarned += r.coins;
          if(typeof shards !== "undefined") shards += r.shards;
          if(r.booster && typeof addBoosterToStorage === "function") addBoosterToStorage(r.booster);
        }
        var ps = document.createElement("div");
        ps.className = "achievement-popup";
        ps.style.background = "linear-gradient(135deg,#ff6f00,#ffd54f)";
        ps.style.color = "#1a1a2e";
        ps.textContent = "🎁 3 сундука: +" + summaryC + "💎 +" + fmt(summaryCoins) + "💰 +" + summarySh + "🌑";
        document.body.appendChild(ps);
        setTimeout(function(){ ps.remove(); }, 4500);
      } else if(rewardId === "bannerHalloween"){
        STATE.hasBanner = true; saveState(STATE);
        updateBannerFlag();
        if(typeof renderBannerList === "function"){ try{ renderBannerList(); }catch(e){} }
      } else { ok = false; }
    }catch(e){ ok = false; }
    if(ok){
      if(typeof updateUI === "function"){ try{ updateUI(); }catch(e){} }
      if(typeof saveGame === "function"){ try{ saveGame(); }catch(e){} }
      if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
      updateCandiesUI();
    }
    return ok;
  }
  function claimGift(day){
    var gift = null;
    for(var i=0;i<GIFT_DAYS.length;i++){ if(GIFT_DAYS[i].day === day){ gift = GIFT_DAYS[i]; break; } }
    if(!gift) return;
    if(STATE.claimedGifts[day]) return;
    if(!isGiftDayAvailable(day)) return;
    if(grantGiftReward(gift.reward)){
      STATE.claimedGifts[day] = true;
      saveState(STATE);
      renderGifts();
    }
  }
  function claimAllGifts(){
    var any = false;
    GIFT_DAYS.forEach(function(g){
      if(!STATE.claimedGifts[g.day] && isGiftDayAvailable(g.day)){
        if(grantGiftReward(g.reward)){
          STATE.claimedGifts[g.day] = true;
          any = true;
        }
      }
    });
    if(any){ saveState(STATE); renderGifts(); }
    else alert("Нет доступных подарков");
  }
  function renderGifts(){
    var pane = byId("halloween-pane-gifts");
    if(!pane) return;
    var totalUnclaimed = GIFT_DAYS.filter(function(g){
      return !STATE.claimedGifts[g.day] && isGiftDayAvailable(g.day);
    }).length;
    var html = '<div style="background:#0e1a30;border:1px solid #ff6f00;border-radius:10px;padding:12px;text-align:center;margin-bottom:12px">'+
      '<div style="font-size:14px;color:#ffab40;font-weight:bold;margin-bottom:6px">🎁 Неделя подарков</div>'+
      '<div style="font-size:12px;color:#aaa;margin-bottom:10px">Забрать можно позже — все сразу</div>'+
      (totalUnclaimed > 0
        ? '<button data-hwall="1" style="background:linear-gradient(135deg,#2e7d32,#4caf50);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;font-size:14px;cursor:pointer;box-shadow:0 3px 0 #1b5e20">Забрать все ('+totalUnclaimed+')</button>'
        : '<div style="color:#7a8aa8;font-size:13px">Все подарки собраны</div>'
      )+
    '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    GIFT_DAYS.forEach(function(g){
      var claimed = !!STATE.claimedGifts[g.day];
      var available = isGiftDayAvailable(g.day);
      var btn;
      if(claimed){
        btn = '<div style="color:#4caf50;font-weight:bold;font-size:12px;padding:8px 10px;background:#0e1a30;border-radius:8px">✅</div>';
      } else if(available){
        btn = '<button data-hwgift="'+g.day+'" style="background:linear-gradient(135deg,#ff6f00,#7b1fa2);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-weight:bold;font-size:13px;cursor:pointer;box-shadow:0 3px 0 #4a148c">Забрать</button>';
      } else {
        btn = '<div style="color:#7a8aa8;font-size:12px;padding:8px 10px">🔒</div>';
      }
      html += '<div style="background:#0e1a30;border:1px solid #253a5c;border-radius:10px;padding:10px;display:flex;justify-content:space-between;align-items:center;gap:10px">'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-size:12px;color:#ffd54f;font-weight:bold">📅 День '+g.day+'</div>'+
          '<div style="font-size:13px;color:#e0e0e0;margin-top:2px">'+g.label+'</div>'+
        '</div>'+
        '<div style="flex-shrink:0">'+btn+'</div>'+
      '</div>';
    });
    html += '</div>';
    pane.innerHTML = html;
    pane.querySelectorAll("[data-hwgift]").forEach(function(b){
      b.onclick = function(){ claimGift(parseInt(b.dataset.hwgift,10)); };
    });
    pane.querySelectorAll("[data-hwall]").forEach(function(b){
      b.onclick = claimAllGifts;
    });
  }

  // ==== НОЧЬ + КВЕСТЫ ====
  var NIGHT_QUESTS = { ghosts: { need: 3 }, bats: { need: 5 }, taps: { need: 500 } };
  var NIGHT_QUEST_TOTAL_REWARD = 25;

  function getQuestState(){
    if(!STATE.nightQuests || typeof STATE.nightQuests !== "object"){
      STATE.nightQuests = { ghosts: 0, bats: 0, taps: 0, claimed: false, date: getNightKey() };
    }
    return STATE.nightQuests;
  }
  function resetNightQuestsIfNeeded(){
    var q = getQuestState();
    var key = getNightKey();
    if(q.date !== key){
      STATE.nightQuests = { ghosts: 0, bats: 0, taps: 0, claimed: false, date: key };
      saveState(STATE);
    }
  }
  function updateNightQuestStatus(){
    var q = getQuestState();
    var el = byId("night-quest-status");
    if(!el) return;
    if(!isNightActive()){
      el.textContent = "недоступны"; el.style.color = ""; el.style.cursor = ""; el.onclick = null;
      return;
    }
    if(q.claimed){
      el.textContent = "✅ получено"; el.style.color = "#4caf50"; el.style.cursor = ""; el.onclick = null;
      return;
    }
    var done = q.ghosts >= NIGHT_QUESTS.ghosts.need && q.bats >= NIGHT_QUESTS.bats.need && q.taps >= NIGHT_QUESTS.taps.need;
    if(done){
      el.textContent = "🎁 забрать +25💎"; el.style.color = "#ffd54f"; el.style.cursor = "pointer"; el.onclick = claimNightQuest;
    } else {
      el.textContent = "👻" + q.ghosts + "/" + NIGHT_QUESTS.ghosts.need + " 🦇" + q.bats + "/" + NIGHT_QUESTS.bats.need + " 👆" + q.taps + "/" + NIGHT_QUESTS.taps.need;
      el.style.color = ""; el.style.cursor = ""; el.onclick = null;
    }
  }
  function claimNightQuest(){
    var q = getQuestState();
    if(q.claimed) return;
    var done = q.ghosts >= NIGHT_QUESTS.ghosts.need && q.bats >= NIGHT_QUESTS.bats.need && q.taps >= NIGHT_QUESTS.taps.need;
    if(!done) return;
    if(typeof addCrystals === "function") addCrystals(NIGHT_QUEST_TOTAL_REWARD);
    q.claimed = true;
    saveState(STATE);
    updateNightQuestStatus();
    if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
    var popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.textContent = "🌙 Ночное задание выполнено! +" + NIGHT_QUEST_TOTAL_REWARD + " 💎";
    document.body.appendChild(popup);
    setTimeout(function(){ popup.remove(); }, 4000);
  }
  function renderNight(){
    var st = byId("night-status"), stT = byId("night-status-text"), stI = byId("night-status-icon"),
        fc = byId("night-flash-chance"), gs = byId("night-ghost-status"),
        bs = byId("night-bat-status");
    if(!st) return;
    var night = isNightActive();
    if(night){
      st.classList.add("night-active");
      if(stI) stI.textContent = "🌕";
      if(stT) stT.textContent = "Ночь активна — до конца " + fmtHHMMSS(msUntilNightEnd());
      if(fc) fc.textContent = "1% (×2)";
      if(gs) gs.textContent = "раз в 5–10 мин";
      if(bs) bs.textContent = "раз в 3–7 мин";
    } else {
      st.classList.remove("night-active");
      if(stI) stI.textContent = "🌙";
      if(stT) stT.textContent = "Ночь спит — старт через " + fmtHHMMSS(msUntilNightStart());
      if(fc) fc.textContent = "0.5%";
      if(gs) gs.textContent = "спит";
      if(bs) bs.textContent = "спит";
    }
    updateNightQuestStatus();
  }

  // ==== ПРИЗРАКИ И МЫШИ ====
  var GHOST_MIN_MS = 5*60*1000, GHOST_MAX_MS = 10*60*1000, GHOST_LIFE_MS = 12*1000;
  var BAT_MIN_MS = 3*60*1000, BAT_MAX_MS = 7*60*1000, BAT_FLY_MS = 9*1000;
  var GOLDEN_BAT_CHANCE = 0.12;

  function spawnFloatingReward(x, y, text, color){
    var el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = "position:fixed;left:"+x+"px;top:"+y+"px;"+
      "transform:translate(-50%,-50%);font-size:22px;font-weight:bold;"+
      "color:"+(color||"#ffd54f")+";text-shadow:0 0 12px currentColor,0 2px 6px rgba(0,0,0,.9);"+
      "pointer-events:none;z-index:99999;transition:all 1.3s ease-out;";
    document.body.appendChild(el);
    requestAnimationFrame(function(){
      el.style.top = (y - 120) + "px";
      el.style.opacity = "0";
    });
    setTimeout(function(){ el.remove(); }, 1400);
  }
  function onGhostClick(el){
    if(!isNightActive()) return;
    var q = getQuestState();
    var fl = 1 + Math.floor(Math.random()*3);
    STATE.flashlights += fl;
    q.ghosts++;
    var candyDrop = Math.random() < 0.40;
    if(candyDrop){ STATE.candies += 5; }
    saveState(STATE);
    var r = el.getBoundingClientRect();
    spawnFloatingReward(r.left + r.width/2, r.top + r.height/2, "🏮 +"+fl, "#ffab40");
    if(candyDrop) spawnFloatingReward(r.left + r.width/2, r.top + r.height/2 - 30, "🍬 +5", "#ffd54f");
    if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
    updateCandiesUI();
    var m = byId("modal-halloween");
    if(m && !m.classList.contains("hidden")){ renderPass(); }
    el.remove();
    updateNightQuestStatus();
  }
  function onBatClick(el, isGolden){
    if(!isNightActive()) return;
    var q = getQuestState();
    var fl = isGolden ? 5 : 1;
    STATE.flashlights += fl;
    q.bats++;
    var candyAmt = isGolden ? 50 : 5;
    var candyDrop = isGolden || Math.random() < 0.50;
    if(candyDrop){ STATE.candies += candyAmt; }
    saveState(STATE);
    var r = el.getBoundingClientRect();
    spawnFloatingReward(r.left + r.width/2, r.top + r.height/2, "🏮 +"+fl, "#ffab40");
    if(candyDrop) spawnFloatingReward(r.left + r.width/2, r.top + r.height/2 - 30, "🍬 +"+candyAmt, "#ffd54f");
    if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
    updateCandiesUI();
    var m = byId("modal-halloween");
    if(m && !m.classList.contains("hidden")){ renderPass(); }
    el.remove();
    updateNightQuestStatus();
  }
  function spawnGhost(){
    if(!isNightActive()) return;
    if(document.querySelector(".hw-creature.ghost")) return;
    var el = document.createElement("div");
    el.className = "hw-creature ghost";
    el.textContent = "👻";
    var W = window.innerWidth, H = window.innerHeight;
    el.style.left = (Math.random() * (W - 100) + 20) + "px";
    el.style.top = (Math.random() * (H * 0.6) + H * 0.15) + "px";
    el.onclick = function(e){ e.stopPropagation(); onGhostClick(el); };
    el.addEventListener("touchstart", function(e){ e.preventDefault(); onGhostClick(el); }, {passive:false});
    document.body.appendChild(el);
    setTimeout(function(){
      if(el.parentNode){
        el.style.opacity = "0";
        setTimeout(function(){ if(el.parentNode) el.remove(); }, 400);
      }
    }, GHOST_LIFE_MS);
  }
  function spawnBat(){
    if(!isNightActive()) return;
    var isGolden = Math.random() < GOLDEN_BAT_CHANCE;
    var el = document.createElement("div");
    el.className = "hw-creature bat" + (isGolden ? " golden-bat" : "");
    el.textContent = isGolden ? "🦇✨" : "🦇";
    var W = window.innerWidth, H = window.innerHeight;
    var y = Math.random() * (H * 0.5) + H * 0.15;
    var fromLeft = Math.random() < 0.5;
    el.style.top = y + "px";
    el.style.left = fromLeft ? "-80px" : (W + 80) + "px";
    el.onclick = function(e){ e.stopPropagation(); onBatClick(el, isGolden); };
    el.addEventListener("touchstart", function(e){ e.preventDefault(); onBatClick(el, isGolden); }, {passive:false});
    document.body.appendChild(el);
    var speedFactor = isGolden ? 0.65 : 1;
    var dur = (BAT_FLY_MS * speedFactor);
    var startT = performance.now();
    function flyAnim(now){
      if(!el.parentNode) return;
      var t = (now - startT) / dur;
      if(t >= 1){ el.remove(); return; }
      var curX = fromLeft ? (-80 + t * (W + 160)) : (W + 80 - t * (W + 160));
      el.style.left = curX + "px";
      requestAnimationFrame(flyAnim);
    }
    requestAnimationFrame(flyAnim);
  }
  function startCreatureScheduler(){
    resetNightQuestsIfNeeded();
    function scheduleGhost(){
      var delay = GHOST_MIN_MS + Math.random() * (GHOST_MAX_MS - GHOST_MIN_MS);
      setTimeout(function(){ if(isNightActive()) spawnGhost(); scheduleGhost(); }, delay);
    }
    function scheduleBat(){
      var delay = BAT_MIN_MS + Math.random() * (BAT_MAX_MS - BAT_MIN_MS);
      setTimeout(function(){ if(isNightActive()) spawnBat(); scheduleBat(); }, delay);
    }
    scheduleGhost();
    scheduleBat();
    setInterval(function(){ resetNightQuestsIfNeeded(); updateNightQuestStatus(); }, 5000);
  }
  (function hookTapsForQuest(){
    var btn = byId("click-btn");
    if(!btn || btn.__hwQuestHooked) return;
    btn.__hwQuestHooked = true;
    btn.addEventListener("click", function(){
      if(!isNightActive()) return;
      var q = getQuestState();
      q.taps++;
      saveState(STATE);
      updateNightQuestStatus();
    }, {passive:true});
  })();

  // ==== КОТЁЛ ====
  function getActivePotions(){
    if(!STATE.potions || typeof STATE.potions !== "object") STATE.potions = {};
    var now = Date.now();
    var changed = false;
    Object.keys(STATE.potions).forEach(function(rid){
      if(STATE.potions[rid].endsAt <= now){ delete STATE.potions[rid]; changed = true; }
    });
    if(changed) saveState(STATE);
    return STATE.potions;
  }
  function getPotionBonus(category){
    var potions = getActivePotions();
    var total = 0;
    RECIPES.forEach(function(r){
      if(r.category !== category) return;
      if(!potions[r.id]) return;
      if(r.effect.income) total += r.effect.income;
      if(r.effect.tap) total += r.effect.tap;
      if(r.effect.crit) total += r.effect.crit;
      if(r.effect.flash) total += r.effect.flash;
      if(r.effect.shards) total += r.effect.shards;
    });
    return total;
  }
  function publishPotionBonuses(){
    window.__hwPotionIncome = getPotionBonus("income");
    window.__hwPotionTap     = getPotionBonus("tap");
    window.__hwPotionCrit    = getPotionBonus("crit");
    window.__hwPotionFlash   = getPotionBonus("flash");
    window.__hwPotionShards  = getPotionBonus("shards");
  }
  function checkRecipeCost(recipe){
    if(!recipe.cost) return { ok:false, reason:"❌ Неверный рецепт" };
    if(recipe.cost.gems && (typeof crystals === "undefined" || crystals < recipe.cost.gems)){
      return { ok:false, reason:"❌ Нужно " + recipe.cost.gems + " 💎 (у тебя: " + (typeof crystals!=="undefined"?crystals:0) + ")" };
    }
    if(recipe.cost.shards && (typeof shards === "undefined" || shards < recipe.cost.shards)){
      return { ok:false, reason:"❌ Нужно " + recipe.cost.shards + " 🌑 (у тебя: " + (typeof shards!=="undefined"?shards:0) + ")" };
    }
    if(recipe.cost.candies && STATE.candies < recipe.cost.candies){
      return { ok:false, reason:"❌ Нужно " + recipe.cost.candies + " 🍬 (у тебя: " + STATE.candies + ")" };
    }
    return { ok:true };
  }
  function payRecipeCost(recipe){
    if(recipe.cost.gems && typeof crystals !== "undefined") crystals -= recipe.cost.gems;
    if(recipe.cost.shards && typeof shards !== "undefined") shards -= recipe.cost.shards;
    if(recipe.cost.candies) STATE.candies -= recipe.cost.candies;
    saveState(STATE);
  }
  function brewPotion(recipeId){
    var recipe = null;
    for(var i=0;i<RECIPES.length;i++){ if(RECIPES[i].id === recipeId){ recipe = RECIPES[i]; break; } }
    if(!recipe) return;
    var check = checkRecipeCost(recipe);
    if(!check.ok){ alert(check.reason); return; }
    var potions = getActivePotions();
    var conflict = null;
    for(var j=0;j<RECIPES.length;j++){
      var r = RECIPES[j];
      if(r.category === recipe.category && r.id !== recipe.id && potions[r.id]){ conflict = r; break; }
    }
    if(conflict){ alert("⚠️ Уже активно зелье категории «" + recipe.category + "»:\n" + conflict.icon + " " + conflict.name); return; }
    payRecipeCost(recipe);
    STATE.potions[recipe.id] = { endsAt: Date.now() + recipe.duration * 1000 };
    saveState(STATE);
    publishPotionBonuses();
    if(typeof updateUI === "function") try{ updateUI(); }catch(e){}
    if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
    if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
    renderCauldron();
    var popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.style.background = "linear-gradient(135deg,#7b1fa2,#ff6f00)";
    popup.style.color = "#fff";
    popup.textContent = recipe.icon + " Сварено: " + recipe.name;
    document.body.appendChild(popup);
    setTimeout(function(){ popup.remove(); }, 3000);
  }
  function renderCauldron(){
    var pane = byId("halloween-pane-cauldron");
    if(!pane) return;
    var potions = getActivePotions();
    var activeIds = Object.keys(potions);
    var now = Date.now();
    var html = '<div style="text-align:center;margin-bottom:12px">' +
      '<div style="font-size:38px">🧪</div>' +
      '<div style="font-size:13px;color:#ffab40;font-weight:bold">Ведьмин котёл</div>' +
      '<div style="font-size:11px;color:#aaa;margin-top:2px">Вари зелья из ингредиентов</div>' +
    '</div>';
    if(activeIds.length){
      html += '<div class="hw-potion-active"><div class="hw-potion-active-title">✨ Активные зелья</div>';
      activeIds.forEach(function(rid){
        var r = null;
        for(var i=0;i<RECIPES.length;i++){ if(RECIPES[i].id === rid){ r = RECIPES[i]; break; } }
        if(!r) return;
        var left = Math.max(0, Math.floor((potions[rid].endsAt - now) / 1000));
        var m = Math.floor(left / 60), s = left % 60;
        html += '<div class="hw-potion-active-item"><span>' + r.icon + " " + r.name + ' <small style="color:#aaa">' + r.desc + '</small></span><b>' + m + ":" + (s < 10 ? "0" : "") + s + '</b></div>';
      });
      html += "</div>";
    }
    html += '<div class="hw-cauldron-recipes">';
    RECIPES.forEach(function(r){
      var check = checkRecipeCost(r);
      var isActive = !!potions[r.id];
      var conflict = null;
      for(var k=0;k<RECIPES.length;k++){
        var x = RECIPES[k];
        if(x.category === r.category && x.id !== r.id && potions[x.id]){ conflict = x; break; }
      }
      var costParts = [];
      if(r.cost.gems)    costParts.push(r.cost.gems + " 💎");
      if(r.cost.shards)  costParts.push(r.cost.shards + " 🌑");
      if(r.cost.candies) costParts.push(r.cost.candies + " 🍬");
      var btnClass = "hw-recipe-btn";
      if(isActive) btnClass += " active";
      var btnText = isActive ? "⏳ Активно" : (conflict ? "🔒 Занято" : (check.ok ? "🧪 Сварить" : "Не хватает"));
      var btnDisabled = isActive || conflict || !check.ok;
      html += '<div class="hw-recipe">' +
        '<div class="hw-recipe-icon">' + r.icon + '</div>' +
        '<div class="hw-recipe-info">' +
          '<div class="hw-recipe-name">' + r.name + '</div>' +
          '<div class="hw-recipe-effect">' + r.desc + '</div>' +
          '<div class="hw-recipe-recipe">Рецепт: ' + costParts.join(" + ") + ' · ' + (r.duration / 60) + ' мин</div>' +
        '</div>' +
        '<button class="' + btnClass + '" data-brew="' + r.id + '"' + (btnDisabled ? " disabled" : "") + '>' + btnText + '</button>' +
      '</div>';
    });
    html += "</div>";
    pane.innerHTML = html;
    pane.querySelectorAll("[data-brew]").forEach(function(b){
      b.onclick = function(){ brewPotion(b.dataset.brew); };
    });
  }
  setInterval(function(){
    var pane = byId("halloween-pane-cauldron");
    if(pane && !pane.classList.contains("hidden")) renderCauldron();
    publishPotionBonuses();
  }, 1000);

  // ==== ГЛОБАЛ ====
  var globalRef = null;
  var globalState = { total: 0, myContribution: 0, myClaims: {}, lastPush: 0 };

  function pushCandiesToGlobal(amount){
    if(!amount || amount <= 0) return;
    var d = (typeof db !== "undefined" && db) ? db : null;
    if(!d) return;
    var uid = (typeof profile !== "undefined" && profile && profile.id) ? profile.id : "";
    if(!uid) return;
    d.ref(GLOBAL_KEY + "/total").transaction(function(cur){ return (cur || 0) + amount; }).catch(function(){});
    d.ref(GLOBAL_KEY + "/contributors/" + uid).transaction(function(cur){
      cur = cur || { nick: (profile.nickname || "Аноним"), candies: 0 };
      cur.nick = profile.nickname || "Аноним";
      cur.candies = (cur.candies || 0) + amount;
      cur.ts = Date.now();
      return cur;
    }).catch(function(){});
    globalState.myContribution += amount;
    globalState.lastPush = Date.now();
  }

  // ==== РУЧНОЕ ВЛОЖЕНИЕ В ГЛОБАЛ ====
  function depositToGlobal(){
    var uid = (typeof profile !== "undefined" && profile && profile.id) ? profile.id : "";
    if(!uid){ alert("❌ Сначала задай ник в профиле!"); return; }
    var d = (typeof db !== "undefined" && db) ? db : null;
    if(!d){ alert("❌ Firebase не подключён"); return; }

    var cur = STATE.candies || 0;
    var already = STATE.globalDeposited || 0;
    var delta = cur - already;

    if(delta <= 0){
      alert("❌ Нечего вкладывать — новых конфет нет.");
      return;
    }

    pushCandiesToGlobal(delta);
    STATE.globalDeposited = cur;
    saveState(STATE);

    if(typeof updateUI === "function") try{ updateUI(); }catch(e){}
    if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
    if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }

    var popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.style.background = "linear-gradient(135deg,#7b1fa2,#ff6f00)";
    popup.style.color = "#fff";
    popup.textContent = "🌍 +" + delta + " 🍬 в общий счёт!";
    document.body.appendChild(popup);
    setTimeout(function(){ popup.remove(); }, 4000);

    var pane = byId("halloween-pane-global");
    if(pane && !pane.classList.contains("hidden")) renderGlobalEvent();
  }
  window.depositToGlobal = depositToGlobal;

  function subscribeGlobal(){
    var d = (typeof db !== "undefined" && db) ? db : null;
    if(!d) return;
    var uid = (typeof profile !== "undefined" && profile && profile.id) ? profile.id : "";
    if(globalRef) globalRef.off();
    globalRef = d.ref(GLOBAL_KEY);
    globalRef.on("value", function(s){
      var data = s.val() || {};
      globalState.total = data.total || 0;
      var contribs = data.contributors || {};
      globalState.myContribution = (uid && contribs[uid]) ? (contribs[uid].candies || 0) : 0;
      var pane = byId("halloween-pane-global");
      if(pane && !pane.classList.contains("hidden")) renderGlobalEvent();
    });
    if(uid){
      d.ref(GLOBAL_KEY + "/claims/" + uid).on("value", function(s){
        globalState.myClaims = s.val() || {};
        var pane = byId("halloween-pane-global");
        if(pane && !pane.classList.contains("hidden")) renderGlobalEvent();
      });
    }
  }
  function isLevelReached(level){ return globalState.total >= level.need; }
  function grantGlobalReward(rewardId){
    var ok = true;
    try{
      if(rewardId === "chest3" || rewardId === "chest5"){
        var count = rewardId === "chest5" ? 5 : 3;
        var sumC = 0, sumCoins = 0, sumSh = 0;
        for(var i=0;i<count;i++){
          var r = (typeof getChestRewards === "function") ? getChestRewards() : {coins:500,crystals:5,shards:15,booster:"boost2"};
          sumC += r.crystals; sumCoins += r.coins; sumSh += r.shards;
          if(typeof addCrystals === "function") addCrystals(r.crystals);
          if(typeof coins !== "undefined") coins += r.coins;
          if(typeof totalEarned !== "undefined") totalEarned += r.coins;
          if(typeof shards !== "undefined") shards += r.shards;
          if(r.booster && typeof addBoosterToStorage === "function") addBoosterToStorage(r.booster);
        }
        var ps = document.createElement("div");
        ps.className = "achievement-popup";
        ps.style.background = "linear-gradient(135deg,#7b1fa2,#ff6f00)";
        ps.style.color = "#fff";
        ps.textContent = "🎁 " + count + " сундуков: +" + sumC + "💎 +" + fmt(sumCoins) + "💰 +" + sumSh + "🌑";
        document.body.appendChild(ps);
        setTimeout(function(){ ps.remove(); }, 4500);
      } else if(rewardId === "gems50"){
        if(typeof addCrystals === "function") addCrystals(50); else ok = false;
      } else if(rewardId === "petEgg"){
        if(typeof petsState !== "undefined" && petsState){
          if(typeof petTotalCount === "function" && petTotalCount() >= 5){ ok = false; }
          else {
            petsState.nest = { stage: "ready_hatch", startedAt: Date.now(), taps: 0, type: (typeof petRollType === "function" ? petRollType() : "hamster") };
            if(typeof petRenderAll === "function") try{ petRenderAll(); }catch(e){}
          }
        } else { ok = false; }
      } else if(rewardId === "petXP250"){
        if(typeof petsState !== "undefined" && petsState){
          petsState.xp = (petsState.xp || 0) + 250;
          if(typeof petRenderTopBar === "function") try{ petRenderTopBar(); }catch(e){}
        } else { ok = false; }
      } else if(rewardId === "bgHorror"){
        if(typeof BACKGROUNDS !== "undefined"){
          if(!BACKGROUNDS.horror) BACKGROUNDS.horror = { id:"horror", name:"🩸 Ужасные ужасы", cls:"bg-horror", cost:0, particles:null, owned:true };
          else BACKGROUNDS.horror.owned = true;
        }
        if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
        if(typeof renderBackgrounds === "function") try{ renderBackgrounds(); }catch(e){}
      } else if(rewardId === "shards750"){
        if(typeof shards !== "undefined") shards += 750; else ok = false;
      } else if(rewardId === "tapGhosts"){
        window.__hwTapGhostsEffect = true;
        STATE.hasTapGhostsEffect = true;
        saveState(STATE);
      } else if(rewardId === "bannerNight"){
        window.__halloweenBannerNight = true;
        STATE.hasBannerNight = true;
        saveState(STATE);
        if(typeof renderBannerList === "function") try{ renderBannerList(); }catch(e){}
      } else { ok = false; }
    }catch(e){ ok = false; }
    if(ok){
      if(typeof updateUI === "function") try{ updateUI(); }catch(e){}
      if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
      if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
    }
    return ok;
  }
  function claimGlobalLevel(idx){
    var lvl = GLOBAL_LEVELS[idx];
    if(!lvl) return;
    if(globalState.myClaims[idx]) return;
    if(!isLevelReached(lvl)) return;
    var uid = (typeof profile !== "undefined" && profile && profile.id) ? profile.id : "";
    if(!uid) return;
    var d = (typeof db !== "undefined" && db) ? db : null;
    if(!d) return;
    if(!grantGlobalReward(lvl.reward)){ alert("❌ Не удалось получить награду (хранилище питомцев может быть заполнено)"); return; }
    d.ref(GLOBAL_KEY + "/claims/" + uid + "/" + idx).set(true);
    globalState.myClaims[idx] = true;
    renderGlobalEvent();
    var popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.style.background = "linear-gradient(135deg,#7b1fa2,#ff6f00)";
    popup.style.color = "#fff";
    popup.textContent = "🌍 " + lvl.icon + " " + lvl.label;
    document.body.appendChild(popup);
    setTimeout(function(){ popup.remove(); }, 4000);
  }

  // ==== СУНДУК КОНФЕТ ====
  function getCandyChestLeft(){
    var last = 0;
    try{ last = parseInt(localStorage.getItem(CANDY_CHEST_KEY) || "0", 10); }catch(e){}
    var left = CANDY_CHEST_COOLDOWN - (Date.now() - last);
    return left > 0 ? left : 0;
  }
  function fmtChestTime(ms){
    if(ms <= 0) return "";
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60); s = s % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function openCandyChest(){
    var left = getCandyChestLeft();
    if(left > 0){
      var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
      alert("⏳ Сундук перезаряжается: " + m + "м " + s + "с");
      return;
    }
    var reward = CANDY_CHEST_MIN + Math.floor(Math.random() * (CANDY_CHEST_MAX - CANDY_CHEST_MIN + 1));
    STATE.candies += reward;
    saveState(STATE);
    try{ localStorage.setItem(CANDY_CHEST_KEY, Date.now().toString()); }catch(e){}
    if(typeof updateUI === "function") try{ updateUI(); }catch(e){}
    if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
    if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
    updateCandiesUI();
    renderGlobalEvent();
    var popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.style.background = "linear-gradient(135deg,#ff6f00,#ffd54f)";
    popup.style.color = "#1a1a2e";
    popup.textContent = "🎁 +" + reward + " 🍬 из сундука!";
    document.body.appendChild(popup);
    setTimeout(function(){ popup.remove(); }, 4000);
  }
  setInterval(function(){
    var el = byId("hw-candy-chest-timer");
    if(!el) return;
    var left = getCandyChestLeft();
    var btn = byId("hw-candy-chest-btn");
    if(left > 0){
      el.textContent = "⏳ Готов через " + fmtChestTime(left);
      if(btn){ btn.disabled = true; btn.textContent = "🎁 Открыть сундук"; }
    } else {
      el.textContent = "✨ Сундук готов!";
      if(btn){ btn.disabled = false; btn.textContent = "🎁 Открыть сундук"; }
    }
  }, 1000);

  // ==== РЕНДЕР ГЛОБАЛА ====
  function renderGlobalEvent(){
    var pane = byId("halloween-pane-global");
    if(!pane) return;
    var total = globalState.total;
    var myContrib = globalState.myContribution;
    var curLvl = 0;
    for(var i=0;i<GLOBAL_LEVELS.length;i++){ if(total >= GLOBAL_LEVELS[i].need) curLvl = i + 1; }
    var nextLvl = GLOBAL_LEVELS[Math.min(curLvl, GLOBAL_LEVELS.length - 1)];
    var prevNeed = curLvl > 0 ? GLOBAL_LEVELS[curLvl - 1].need : 0;
    var nextNeed = nextLvl.need;
    var pct = 0;
    if(nextNeed > prevNeed) pct = Math.min(100, Math.round(((total - prevNeed) / (nextNeed - prevNeed)) * 100));
    else pct = 100;
    if(curLvl >= GLOBAL_LEVELS.length) pct = 100;

    var html = '<div class="hw-global-header">'+
      '<div class="hw-global-title">🌍 ОБЩИЙ СБОР КОНФЕТ</div>'+
      '<div class="hw-global-total">🍬 ' + fmt(total) + ' / ' + fmt(25000) + '<small>Собрали все игроки вместе</small></div>'+
      '<div class="hw-global-progress"><div class="hw-global-progress-fill" style="width:'+pct+'%"></div></div>'+
      '<div class="hw-global-progress-text">До уровня ' + (curLvl + 1) + ': ' + fmt(Math.max(0, nextNeed - total)) + ' 🍬</div>'+
    '</div>';
    html += '<div class="hw-global-levels">';
    GLOBAL_LEVELS.forEach(function(lvl, idx){
      var reached = isLevelReached(lvl);
      var claimed = !!globalState.myClaims[idx];
      var cls = "hw-global-level";
      if(claimed) cls += " claimed";
      else if(reached) cls += " reached";
      var btn;
      if(claimed) btn = '<button class="hw-global-level-btn claimed" disabled>✅ Получено</button>';
      else if(reached) btn = '<button class="hw-global-level-btn" data-gclaim="'+idx+'">🎁 Забрать</button>';
      else btn = '<button class="hw-global-level-btn" disabled>🔒 ' + fmt(lvl.need) + '</button>';
      html += '<div class="'+cls+'">'+
        '<div class="hw-global-level-info">'+
          '<div class="hw-global-level-need">'+lvl.icon+' '+fmt(lvl.need)+' 🍬</div>'+
          '<div class="hw-global-level-reward">'+lvl.label+'</div>'+
        '</div>'+
        btn +
      '</div>';
    });
    html += '</div>';
    html += '<div class="hw-global-contrib">Мой вклад: <b>'+fmt(myContrib)+' 🍬</b></div>';

    // Кнопка «Вложить в глобал»
    var curCandies = STATE.candies || 0;
    var deposited = STATE.globalDeposited || 0;
    var delta = Math.max(0, curCandies - deposited);
    var canDeposit = delta > 0;
    var depositBtnText = canDeposit
      ? '📥 Вложить ' + delta + ' 🍬 в общий счёт'
      : '📥 Нечего вкладывать';
    var depositBtnDisabled = canDeposit ? '' : ' disabled';

    html += '<div class="hw-candy-chest" style="border-color:#7b1fa2">'+
      '<div class="hw-candy-chest-title" style="color:#c9a0ff">🌍 Вложить в общий счёт</div>'+
      '<div class="hw-candy-chest-sub">Конфеты <b>не списываются</b> — их можно тратить на зелья</div>'+
      '<button id="hw-deposit-btn" class="hw-candy-chest-btn" style="background:linear-gradient(135deg,#7b1fa2,#e91e63)"'+depositBtnDisabled+'>'+
        depositBtnText +
      '</button>'+
      '<div class="hw-candy-chest-timer" style="color:#c9a0ff">Уже вложено: ' + fmt(deposited) + ' 🍬</div>'+
    '</div>';

    // Сундук
    var chestLeft = getCandyChestLeft();
    var chestDisabled = chestLeft > 0 ? " disabled" : "";
    var chestTimer = chestLeft > 0 ? ("⏳ Готов через " + fmtChestTime(chestLeft)) : "✨ Сундук готов!";
    html += '<div class="hw-candy-chest">'+
      '<div class="hw-candy-chest-title">🎁 Сундук конфет</div>'+
      '<div class="hw-candy-chest-sub">Раз в час — '+CANDY_CHEST_MIN+'–'+CANDY_CHEST_MAX+' 🍬</div>'+
      '<button id="hw-candy-chest-btn" class="hw-candy-chest-btn"'+chestDisabled+'>🎁 Открыть сундук</button>'+
      '<div id="hw-candy-chest-timer" class="hw-candy-chest-timer">'+chestTimer+'</div>'+
    '</div>';

    pane.innerHTML = html;
    pane.querySelectorAll("[data-gclaim]").forEach(function(b){
      b.onclick = function(){ claimGlobalLevel(parseInt(b.dataset.gclaim, 10)); };
    });
    var chestBtn = byId("hw-candy-chest-btn");
    if(chestBtn) chestBtn.onclick = openCandyChest;
    var depositBtn = byId("hw-deposit-btn");
    if(depositBtn) depositBtn.onclick = depositToGlobal;
  }

  // ==== ДОМ ====
  function getHouseLeft(){
    var last = 0;
    try{ last = parseInt(localStorage.getItem(HOUSE_KEY) || "0", 10); }catch(e){}
    var left = HOUSE_COOLDOWN - (Date.now() - last);
    return left > 0 ? left : 0;
  }
  function fmtHouseTime(ms){
    if(ms <= 0) return "";
    var t = Math.floor(ms / 1000);
    var h = Math.floor(t / 3600); t %= 3600;
    var m = Math.floor(t / 60); var s = t % 60;
    return (h>0?h+"ч ":"") + (m<10?"0":"") + m + "м " + (s<10?"0":"") + s + "с";
  }
  function knockHouse(){
    var left = getHouseLeft();
    if(left > 0){
      alert("⏳ Дверь откроется через " + fmtHouseTime(left));
      return;
    }
    var person = byId("hw-house-person");
    var dialog = byId("hw-house-dialog");
    var scene = byId("hw-house-scene");
    if(person) person.classList.add("show");
    if(scene) scene.classList.add("knocking");
    if(typeof playSound === "function"){ try{ playSound("ui"); }catch(e){} }
    setTimeout(function(){
      if(dialog) dialog.classList.remove("hidden");
      renderHouseDialog();
    }, 600);
  }
  function renderHouseDialog(){
    var dialog = byId("hw-house-dialog");
    if(!dialog) return;
    dialog.innerHTML =
      '<div class="hw-house-dialog-title">🧟 Незнакомец открыл дверь</div>' +
      '<div class="hw-house-dialog-text">— «Сладость или гадость?»<br>Выбирай, что возьмёшь:</div>' +
      '<div class="hw-house-dialog-btns">' +
        '<button class="hw-house-btn safe" id="hw-house-safe">🍬 100 конфет (точно)</button>' +
        '<button class="hw-house-btn risky" id="hw-house-risky">🎲 50–125 (рандом)</button>' +
      '</div>';
    var safeBtn = byId("hw-house-safe");
    var riskyBtn = byId("hw-house-risky");
    if(safeBtn) safeBtn.onclick = function(){ chooseHouse("safe"); };
    if(riskyBtn) riskyBtn.onclick = function(){ chooseHouse("risky"); };
  }
  function chooseHouse(mode){
    var left = getHouseLeft();
    if(left > 0) return;
    var reward = 0;
    if(mode === "safe"){
      reward = HOUSE_SAFE;
    } else {
      reward = HOUSE_MIN + Math.floor(Math.random() * (HOUSE_MAX - HOUSE_MIN + 1));
    }
    STATE.candies += reward;
    saveState(STATE);
    try{ localStorage.setItem(HOUSE_KEY, Date.now().toString()); }catch(e){}
    if(typeof updateUI === "function") try{ updateUI(); }catch(e){}
    if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
    if(typeof playSound === "function"){ try{ playSound("achievement"); }catch(e){} }
    updateCandiesUI();

    var dialog = byId("hw-house-dialog");
    var person = byId("hw-house-person");
    var scene = byId("hw-house-scene");
    if(dialog) dialog.classList.add("hidden");
    setTimeout(function(){
      if(person) person.classList.remove("show");
      if(scene) scene.classList.remove("knocking");
    }, 400);

    var popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.style.background = "linear-gradient(135deg,#ff6f00,#ffd54f)";
    popup.style.color = "#1a1a2e";
    popup.textContent = "🍬 +" + reward + " конфет!";
    document.body.appendChild(popup);
    setTimeout(function(){ popup.remove(); }, 4000);

    renderHouse();
  }
  function renderHouse(){
    var pane = byId("halloween-pane-house");
    if(!pane) return;
    var left = getHouseLeft();
    var isKnockable = left <= 0;

    var starsHtml = "";
    for(var i=0;i<12;i++){
      var top = Math.random()*80 + 10;
      var leftP = Math.random()*90 + 5;
      var delay = (Math.random()*3).toFixed(2);
      starsHtml += '<div class="hw-house-star" style="top:'+top+'%;left:'+leftP+'%;animation-delay:'+delay+'s"></div>';
    }

    var html =
      '<div class="hw-house-scene" id="hw-house-scene">' +
        '<div class="hw-house-moon">🌕</div>' +
        '<div class="hw-house-stars">' + starsHtml + '</div>' +
        '<div class="hw-house-build">' +
          '<div class="hw-house-roof"></div>' +
          '<div class="hw-house-body">' +
            '<div class="hw-house-window left"></div>' +
            '<div class="hw-house-window right"></div>' +
            '<div class="hw-house-door ' + (isKnockable ? 'knockable' : 'locked') + '" id="hw-house-door"></div>' +
          '</div>' +
        '</div>' +
        '<div class="hw-house-person" id="hw-house-person">🧟</div>' +
      '</div>' +
      (isKnockable
        ? '<div class="hw-house-hint">Стукни по двери — раз в 3 часа</div>' +
          '<div class="hw-house-timer" id="hw-house-timer">✨ Готово!</div>'
        : '<div class="hw-house-hint">Отдохни, приходи позже</div>' +
          '<div class="hw-house-timer" id="hw-house-timer">⏳ Откроется через ' + fmtHouseTime(left) + '</div>'
      ) +
      '<div id="hw-house-dialog" class="hw-house-dialog hidden" style="margin-top:12px"></div>';

    pane.innerHTML = html;
    var door = byId("hw-house-door");
    if(door) door.onclick = knockHouse;
  }
  setInterval(function(){
    var pane = byId("halloween-pane-house");
    if(!pane || pane.classList.contains("hidden")) return;
    var timer = byId("hw-house-timer");
    var door = byId("hw-house-door");
    if(!timer) return;
    var left = getHouseLeft();
    if(left <= 0){
      timer.textContent = "✨ Готово!";
      if(door){ door.classList.add("knockable"); door.classList.remove("locked"); }
    } else {
      timer.textContent = "⏳ Откроется через " + fmtHouseTime(left);
      if(door){ door.classList.remove("knockable"); door.classList.add("locked"); }
    }
  }, 1000);

  window.knockHouse = knockHouse;
  window.renderHouse = renderHouse;

  // ==== МОДАЛКА ====
  function bindModal(){
    document.querySelectorAll(".halloween-tab").forEach(function(tb){
      if(tb.__hwB) return; tb.__hwB = true;
      tb.onclick = function(){
        document.querySelectorAll(".halloween-tab").forEach(function(x){ x.classList.remove("active"); });
        tb.classList.add("active");
        var pane = tb.dataset.htab;
        document.querySelectorAll(".halloween-pane").forEach(function(p){ p.classList.add("hidden"); });
        var pv = byId("halloween-pane-" + pane);
        if(pv) pv.classList.remove("hidden");
        if(pane === "pass") renderPass();
        if(pane === "gifts") renderGifts();
        if(pane === "night") renderNight();
        if(pane === "global") renderGlobalEvent();
        if(pane === "cauldron") renderCauldron();
        if(pane === "house") renderHouse();
      };
    });
  }
  function openHalloween(){
    if(!isEventActive()){ alert("🎃 Хэллоуин-ивент неактивен\n\nСтарт: 23 октября 08:30"); return; }
    show("modal-halloween");
    if(typeof syncScrollLock === "function"){ try{ syncScrollLock(); }catch(e){} }
    renderPass();
    renderGifts();
    renderNight();
    renderCauldron();
    renderGlobalEvent();
    renderHouse();
  }
  function bindSideBtn(){
    var b = byId("halloween-side-btn");
    if(!b || b.__hwB) return;
    b.__hwB = true;
    b.onclick = function(e){
      e.preventDefault();
      if(typeof playSound === "function"){ try{ playSound("ui"); }catch(e){} }
      openHalloween();
    };
  }

  // ==== ЗАПУСК ====
  function start(){
    hookTap();
    hookPetRoll();
    bindModal();
    bindSideBtn();
    updateSideBtn();
    updateCandiesUI();
    updateBannerFlag();
    startCreatureScheduler();
    updateNightQuestStatus();
    publishPotionBonuses();
    setTimeout(subscribeGlobal, 3000);
    console.log("[halloween] Полный модуль запущен");
  }

  // ==== ЭКСПОРТ ====
  window.spawnGhost = spawnGhost;
  window.spawnBat = spawnBat;
  window.claimNightQuest = claimNightQuest;
  window.openHalloween = openHalloween;
  window.brewPotion = brewPotion;
  window.renderCauldron = renderCauldron;
  window.renderGlobalEvent = renderGlobalEvent;
  window.pushCandiesToGlobal = pushCandiesToGlobal;
  window.openCandyChest = openCandyChest;
  window.halloweenState = STATE;

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(start, 1200); });
  } else { setTimeout(start, 1200); }
  window.addEventListener("load", function(){ setTimeout(start, 2000); });

  setInterval(function(){
    updateSideBtn();
    updateCandiesUI();
    tickCritBonus();
  }, 2000);
})();
