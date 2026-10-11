/* ==== Krochlupic Banners v1 ==== */
(function(){
  "use strict";
  function byId(id){ return document.getElementById(id); }

  var BANNERS = [
    { id:"novice",    name:"🥉 Новичок",          desc:"100 тапов",               check: function(){ return (typeof totalTaps!=="undefined" && totalTaps>=100); } },
    { id:"farmer",    name:"🌾 Фермер",           desc:"Заработать 1M монет",     check: function(){ return (typeof totalEarned!=="undefined" && totalEarned>=1e6); } },
    { id:"veteran",   name:"💠 Ветеран",          desc:"1T заработанных",         check: function(){ return (typeof totalEarned!=="undefined" && totalEarned>=1e12); } },
    { id:"master",    name:"👑 Мастер",           desc:"50 достижений",           check: function(){
      if(typeof unlocked==="undefined" || typeof achievements==="undefined") return false;
      var c=0; for(var k in unlocked){ if(k.charAt(0)!=="_" && unlocked[k]) c++; }
      return c>=50;
    } },
    { id:"legend",    name:"🌟 Легенда",          desc:"Топ-1 лидерборда",        check: function(){ return (typeof unlocked!=="undefined" && unlocked.leader_top1===true); } },
    { id:"absolute",  name:"🔱 Абсолют",          desc:"Абсолют 699 ур.",         check: function(){ return (typeof upgrades!=="undefined" && upgrades.absolute && upgrades.absolute.count>=699); } },
    { id:"genesis",   name:"💠 Генезис",          desc:"7 питомцев",              check: function(){ return (typeof petTotalCount==="function" && petTotalCount()>=7); } },
    { id:"bloodlord", name:"🩸 Кровавый Лорд",    desc:"10 побед в сорев.",       check: function(){ return (typeof unlocked!=="undefined" && (unlocked._compWins||0)>=10); } }
  ];

  var STORAGE_KEY = "clicker-active-banner";

  function unlockedList(){
    return BANNERS.filter(function(b){ try{ return b.check(); }catch(e){ return false; } });
  }
  function isUnlocked(id){
    var b = BANNERS.find(function(x){ return x.id===id; });
    if(!b) return false;
    try{ return b.check(); }catch(e){ return false; }
  }

  function getActive(){
    try{ return localStorage.getItem(STORAGE_KEY) || ""; }catch(e){ return ""; }
  }
  function setActive(id){
    try{
      if(id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    }catch(e){}
    render();
  }

  function render(){
    // Показ активного баннера в профиле
    var disp = byId("profile-banner-display");
    if(disp){
      var active = getActive();
      if(active && isUnlocked(active)){
        var b = BANNERS.find(function(x){ return x.id===active; });
        disp.textContent = b.name + " · " + b.desc;
        disp.className = "profile-banner-display banner-" + active;
        disp.classList.remove("hidden");
      } else {
        disp.classList.add("hidden");
      }
    }

    // Список баннеров
    var list = byId("banner-list");
    if(!list) return;
    list.innerHTML = "";
    BANNERS.forEach(function(b){
      var unlocked = isUnlocked(b.id);
      var active = (getActive()===b.id);
      var card = document.createElement("div");
      card.className = "banner-card banner-" + b.id + (active?" active":"") + (unlocked?"":" locked");
      card.innerHTML =
        '<div class="banner-card-preview banner-' + b.id + '">' + b.name + '</div>' +
        '<div class="banner-card-status">' + (active ? "✓ Выбран" : (unlocked ? "Нажми" : "🔒 " + b.desc)) + '</div>';
      if(unlocked){
        card.onclick = function(){
          if(active){ setActive(""); }
          else { setActive(b.id); }
        };
      }
      list.appendChild(card);
    });
  }

  function bind(){
    render();
    // Обновление раз в 5 сек (чтобы статусы подтягивались)
    setInterval(render, 5000);
    console.log("[banners v1] ready");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 900); });
  } else {
    setTimeout(bind, 900);
  }
  window.addEventListener("load", function(){ setTimeout(bind, 1800); });
})();
