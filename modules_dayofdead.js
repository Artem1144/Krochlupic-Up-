/* ==== Krochlupic Day of the Dead 2026 ==== */
(function(){
  "use strict";

  var EVENT_START = new Date("2026-11-01T00:00:00").getTime();
  var EVENT_END   = new Date("2026-11-02T06:00:00").getTime();
  var EGG_COOLDOWN = 3 * 60 * 60 * 1000;
  var DOD_KEY = "clicker-dod-state";
  var EGG_KEY = "clicker-dod-egg-last";

  function byId(id){ return document.getElementById(id); }
  function safeRemove(el){ if(el && el.parentNode) el.remove(); }

  function getState(){
    try { return JSON.parse(localStorage.getItem(DOD_KEY) || "{}"); } catch(e) { return {}; }
  }
  function saveState(s){
    try { localStorage.setItem(DOD_KEY, JSON.stringify(s)); } catch(e){}
  }
  var STATE = getState();

  function isEventActive(){
    var now = Date.now();
    return now >= EVENT_START && now < EVENT_END;
  }

  // Добавляем питомца в базу
  if(typeof PET_TYPES !== "undefined" && !PET_TYPES.dodGhost){
    PET_TYPES.dodGhost = {
      id: "dodGhost", emoji: "💀", name: "Дух Дня Мертвых",
      rarity: "limited", rarityLabel: "💀 Лимитированный",
      chance: 0, sellPrice: 9999,
      bonus: { income: 0.5, shardTap: 0.05, gemTap: 0.01 },
      deathMsg: "Твой Дух Дня Мертвых растворился в лучах утреннего солнца..."
    };
  }

  // Безопасный перехват дохода ×2
  setTimeout(function(){
    if(typeof window.getCPS === "function"){
      var origGetCPS = window.getCPS;
      window.getCPS = function(){
        try {
          var res = origGetCPS();
          if(isEventActive()) res *= 2;
          return res;
        } catch(e) { return 0; }
      };
    }
    if(typeof window.getClickValue === "function"){
      var origGetClick = window.getClickValue;
      window.getClickValue = function(){
        try {
          var res = origGetClick();
          if(isEventActive()) res *= 2;
          return res;
        } catch(e) { return 0; }
      };
    }
  }, 1500);

  function createUI(){
    if(!byId("dod-side-btn")){
      var btn = document.createElement("button");
      btn.id = "dod-side-btn";
      btn.innerHTML = "💀";
      btn.className = "hidden";
      btn.style.cssText = "position:fixed; left:15px; top:195px; width:50px; height:50px; border-radius:12px; border:none; background:linear-gradient(135deg,#7b1fa2,#e91e63); color:#fff; font-size:26px; cursor:pointer; box-shadow:0 4px 0 #4a148c; outline:none; display:flex; align-items:center; justify-content:center; padding:0; z-index:100; touch-action:manipulation;";
      btn.onclick = function(e){ 
        e.preventDefault(); 
        if(typeof playSound === "function") playSound("ui"); 
        openModal(); 
      };
      document.body.appendChild(btn);
    }

    if(!byId("modal-dod")){
      var modal = document.createElement("div");
      modal.id = "modal-dod";
      modal.className = "modal hidden";
      modal.innerHTML = 
        '<div class="modal-box" style="text-align:center; border:2px solid #e91e63; background:linear-gradient(180deg,#1a0e2e,#0a0518);">' +
          '<button class="modal-close" id="dod-close-btn">✕</button>' +
          '<h2 style="color:#e91e63; text-shadow:0 0 10px #7b1fa2;">💀 День Мертвых</h2>' +
          '<p style="color:#aaa; font-size:13px; margin-bottom:15px;">Событие активно до 2 ноября 06:00</p>' +
          '<div style="font-size:80px; margin:20px 0; cursor:pointer; transition:transform 0.2s;" id="dod-egg-visual">🥚</div>' +
          '<div id="dod-egg-status" style="color:#ffd54f; font-weight:bold; font-size:15px; margin-bottom:15px;"></div>' +
          '<p style="font-size:12px; color:#7a8aa8; line-height:1.4;">Шанс выбить Духа — 50%.<br>Яйцо доступно раз в 3 часа.</p>' +
        '</div>';
      document.body.appendChild(modal);

      // ЗАЩИТА ОТ БАГА: привязываем закрытие так, чтобы game.js не сломал его
      document.getElementById("dod-close-btn").addEventListener("click", function(){
        modal.classList.add("hidden");
        if(typeof syncScrollLock === "function") syncScrollLock();
      });
      modal.addEventListener("click", function(e) {
        if(e.target === modal) {
          modal.classList.add("hidden");
          if(typeof syncScrollLock === "function") syncScrollLock();
        }
      });
    }
  }

  function updateUI(){
    var btn = byId("dod-side-btn");
    if(!btn) return;

    if(isEventActive() && !STATE.ghostObtained){
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
      var m = byId("modal-dod");
      if(m && !m.classList.contains("hidden")) {
        m.classList.add("hidden");
        if(typeof syncScrollLock === "function") syncScrollLock();
      }
    }
  }

  function openModal(){
    var m = byId("modal-dod");
    if(!m) return;
    m.classList.remove("hidden");
    if(typeof syncScrollLock === "function") syncScrollLock();
    updateEggUI();
  }

  function updateEggUI(){
    var status = byId("dod-egg-status");
    var egg = byId("dod-egg-visual");
    if(!status || !egg) return;

    if(STATE.ghostObtained){
      status.textContent = "Ты уже нашел Духа!";
      status.style.color = "#4caf50";
      egg.textContent = "💀";
      egg.style.cursor = "default";
      egg.onclick = null;
      return;
    }

    var last = parseInt(localStorage.getItem(EGG_KEY) || "0", 10);
    var left = EGG_COOLDOWN - (Date.now() - last);

    if(left > 0){
      var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
      status.textContent = "⏳ Готов через " + m + "м " + s + "с";
      status.style.color = "#ff5252";
      egg.style.cursor = "not-allowed";
      egg.onclick = function(){ alert("⏳ Яйцо перезаряжается: " + m + "м " + s + "с"); };
    } else {
      status.textContent = "✨ Яйцо готово! Тапни по нему";
      status.style.color = "#ffd54f";
      egg.style.cursor = "pointer";
      egg.onclick = hatchEgg;
    }
  }

  function hatchEgg(){
    if(STATE.ghostObtained) return;
    var last = parseInt(localStorage.getItem(EGG_KEY) || "0", 10);
    if(Date.now() - last < EGG_COOLDOWN) return;

    if(typeof petTotalCount === "function" && petTotalCount() >= 5){
      alert("❌ Хранилище питомцев заполнено (5/5)!");
      return;
    }

    var egg = byId("dod-egg-visual");
    egg.style.transform = "scale(1.2) rotate(10deg)";
    setTimeout(function(){ egg.style.transform = "scale(1) rotate(0deg)"; }, 200);

    if(typeof playSound === "function") playSound("achievement");

    if(Math.random() < 0.5){
      STATE.ghostObtained = true;
      saveState(STATE);
      localStorage.setItem(EGG_KEY, Date.now().toString());
      
      if(typeof petsState !== "undefined" && typeof petGenerateId === "function"){
        petsState.storage.push({ id: petGenerateId(), type: "dodGhost" });
        if(typeof petRenderAll === "function") petRenderAll();
        if(typeof saveGame === "function") saveGame();
      }
      
      if(typeof vibrate === "function") vibrate(50);

      var p = document.createElement("div");
      p.className = "achievement-popup";
      p.style.background = "linear-gradient(135deg,#7b1fa2,#e91e63)";
      p.style.color = "#fff";
      p.textContent = "💀 Ты выбил Духа Дня Мертвых!";
      document.body.appendChild(p);
      setTimeout(function(){ safeRemove(p); }, 5000);

      updateEggUI();
      updateUI();
    } else {
      localStorage.setItem(EGG_KEY, Date.now().toString());
      alert("Пусто! Попробуй снова через 3 часа.");
      updateEggUI();
    }
  }

  function init(){
    createUI();
    updateUI();
    setInterval(function(){
      updateUI();
      var m = byId("modal-dod");
      if(m && !m.classList.contains("hidden")) updateEggUI();
    }, 1000);
    console.log("[DayOfTheDead] Модуль запущен");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 1000); });
  } else {
    setTimeout(init, 1000);
  }

})();
