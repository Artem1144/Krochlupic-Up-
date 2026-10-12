/* ==== Krochlupic Admin Console v3 (без Хэллоуина) ==== */
(function(){
  "use strict";

  function byId(id){ return document.getElementById(id); }
  function fb(){
    if(typeof db!=="undefined" && db) return db;
    if(typeof firebase!=="undefined" && firebase.database) return firebase.database();
    return null;
  }
  function me(){ return (typeof profile!=="undefined" && profile && profile.id) || ""; }
  function myNick(){ return (typeof profile!=="undefined" && profile && profile.nickname) || "Аноним"; }
  function fmt(n){ if(typeof formatNumber==="function") return formatNumber(n); return String(Math.floor(n||0)); }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  }); }

  // ⚠️ СПИСОК АДМИНОВ
  var ADMIN_IDS = [
    "u_1790687044368_j0ic",   // G4SF — основной
    "u_1790687777315_g6nn",   // ZK89 / "Пппп"
    "u_1791714392411_ap6z"    // R2FT — новый
  ];

  var LOG_KEY = "clicker-admin-log";
  var activeBoost = null;
  var activeEvent = null;

  function isAdmin(){ return ADMIN_IDS.indexOf(me()) !== -1; }
  function promoUnlocked(){
    try{ if(localStorage.getItem("clicker-admin-unlocked")==="1") return true; }catch(e){}
    if(typeof adminState!=="undefined" && adminState && adminState.promoUnlocked) return true;
    return false;
  }
  function hasAccess(){ return isAdmin() || promoUnlocked(); }

  // ==== ЛОГ ====
  function addLog(text, kind){
    var arr=[];
    try{ arr=JSON.parse(localStorage.getItem(LOG_KEY)||"[]"); }catch(e){ arr=[]; }
    arr.unshift({ t: Date.now(), text: text, by: myNick(), kind: kind||"info" });
    if(arr.length>50) arr=arr.slice(0,50);
    try{ localStorage.setItem(LOG_KEY, JSON.stringify(arr)); }catch(e){}
    renderLog();
  }
  function renderLog(){
    var box=byId("admin-log"); if(!box) return;
    var arr=[];
    try{ arr=JSON.parse(localStorage.getItem(LOG_KEY)||"[]"); }catch(e){ arr=[]; }
    if(!arr.length){ box.innerHTML='<div class="admin-log-empty">История пуста</div>'; return; }
    box.innerHTML=arr.map(function(it){
      var d=new Date(it.t||0);
      var tm=("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);
      return '<div class="admin-log-item"><span class="time">'+tm+'</span>'+
        '<span class="cmd">'+esc(it.text)+'</span> '+
        '<span class="author">· '+esc(it.by)+'</span></div>';
    }).join("");
  }

  // ==== СТАТУС ====
  function renderStatus(){
    var b=byId("admin-status-boost"), e=byId("admin-status-event");
    if(b){
      if(activeBoost && activeBoost.active && activeBoost.endsAt>Date.now()){
        var s=Math.ceil((activeBoost.endsAt-Date.now())/1000);
        var m=Math.floor(s/60); s=s%60;
        b.textContent="×"+activeBoost.mult+" · "+m+":"+(s<10?"0":"")+s;
      } else { b.textContent="нет"; }
    }
    if(e){
      if(activeEvent && activeEvent.endsAt>Date.now()){
        var s2=Math.ceil((activeEvent.endsAt-Date.now())/1000);
        var m2=Math.floor(s2/60); s2=s2%60;
        e.textContent=activeEvent.name+" · "+m2+":"+(s2<10?"0":"")+s2;
      } else { e.textContent="нет"; }
    }
  }

  // ==== ПОДПИСКА ====
  function subscribeAdmin(){
    var d=fb(); if(!d) return;
    d.ref("admin/boost").on("value", function(s){
      activeBoost = s.val() || null; renderStatus();
    });
    d.ref("admin/events/current").on("value", function(s){
      activeEvent = s.val() || null; renderStatus();
    });
  }

  // ==== МНОЖИТЕЛИ ====
  function installMultiplier(){
    if(window.__adminMultInstalled) return;
    window.__adminMultInstalled = true;
    if(typeof window.getCPS === "function"){
      var o1 = window.getCPS;
      window.getCPS = function(){
        var v = o1(), m = 1;
        if(activeBoost && activeBoost.active && activeBoost.endsAt>Date.now()) m *= (activeBoost.mult||1);
        if(activeEvent && activeEvent.endsAt>Date.now()) m *= (activeEvent.mult||1);
        return v * m;
      };
    }
    if(typeof window.getClickValue === "function"){
      var o2 = window.getClickValue;
      window.getClickValue = function(){
        var v = o2(), m = 1;
        if(activeBoost && activeBoost.active && activeBoost.endsAt>Date.now()) m *= (activeBoost.mult||1);
        if(activeEvent && activeEvent.endsAt>Date.now()) m *= (activeEvent.mult||1);
        return v * m;
      };
    }
  }

  // ==== КОМАНДЫ ====
  function execCommand(raw){
    var out = byId("admin-cmd-result");
    if(out){ out.className="admin-result info"; out.textContent=""; }
    if(!hasAccess()){ if(out){ out.className="admin-result error"; out.textContent="❌ Нет доступа"; } return; }
    if(!raw || !raw.trim()) return;
    var parts = raw.trim().split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var d=fb();
    if(!d){ if(out){ out.className="admin-result error"; out.textContent="Firebase недоступен"; } return; }

    // HELP
    if(cmd==="help"){
      var help="📖 Команды:\n"+
        "help — список команд\n"+
        "status — состояние\n"+
        "boost <mult> <min> — глоб. буст\n"+
        "boost off — выключить буст\n"+
        "event <name> <mult> <min> — ивент\n"+
        "event off — выключить ивент\n"+
        "gift <amount> — подарок всем\n"+
        "message <text> — сообщение всем\n"+
        "history — история команд";
      if(out){ out.className="admin-result info"; out.textContent=help; }
      addLog("help");
      return;
    }

    // STATUS
    if(cmd==="status"){
      var lines=[];
      lines.push("UID: "+me());
      lines.push("Ник: "+myNick());
      lines.push("Роль: "+(isAdmin()?"👑 Админ":"пользователь"));
      lines.push("Промокод: "+(promoUnlocked()?"✅":"нет"));
      lines.push("Буст: "+(activeBoost&&activeBoost.active?"×"+activeBoost.mult:"—"));
      lines.push("Ивент: "+(activeEvent?activeEvent.name:"—"));
      if(out){ out.className="admin-result info"; out.textContent=lines.join("\n"); }
      addLog("status");
      return;
    }

    // BOOST
    if(cmd==="boost"){
      var arg = (parts[1]||"").toLowerCase();
      if(arg==="off"){
        d.ref("admin/boost").set({active:false, mult:1, endsAt:0, by:me(), byNick:myNick()});
        addLog("boost off");
        if(out){ out.className="admin-result success"; out.textContent="✅ Буст выключен"; }
        return;
      }
      var mult = parseFloat(parts[1]);
      var min = parseInt(parts[2],10);
      if(!mult || mult<=0 || !min || min<=0){
        if(out){ out.className="admin-result error"; out.textContent="❌ Синтаксис: boost <mult> <min>"; }
        return;
      }
      d.ref("admin/boost").set({active:true, mult:mult, endsAt:Date.now()+min*60*1000, by:me(), byNick:myNick()});
      addLog("boost ×"+mult+" на "+min+" мин", "success");
      if(out){ out.className="admin-result success"; out.textContent="⚡ Буст ×"+mult+" на "+min+" мин"; }
      return;
    }

    // EVENT
    if(cmd==="event"){
      var arg2 = (parts[1]||"").toLowerCase();
      if(arg2==="off"){
        d.ref("admin/events/current").remove();
        addLog("event off");
        if(out){ out.className="admin-result success"; out.textContent="✅ Ивент выключен"; }
        return;
      }
      var name = parts[1];
      var emult = parseFloat(parts[2])||1.5;
      var emin = parseInt(parts[3],10)||5;
      if(!name){
        if(out){ out.className="admin-result error"; out.textContent="❌ Синтаксис: event <name> <mult> <min>"; }
        return;
      }
      d.ref("admin/events/current").set({name:name, mult:emult, endsAt:Date.now()+emin*60*1000, by:me(), byNick:myNick()});
      addLog("event "+name+" ×"+emult+" на "+emin+" мин", "success");
      if(out){ out.className="admin-result success"; out.textContent="🎉 Ивент «"+name+"» ×"+emult+" на "+emin+" мин"; }
      return;
    }

    // GIFT
    if(cmd==="gift"){
      var amt = parseInt(parts[1],10);
      if(!amt || amt<=0){
        if(out){ out.className="admin-result error"; out.textContent="❌ Синтаксис: gift <amount>"; }
        return;
      }
      if(!confirm("Подарить "+amt+" монет всем игрокам?")) return;
      d.ref("users").once("value").then(function(s){
        var users = s.val() || {};
        var upd = {};
        Object.keys(users).forEach(function(uid){
          var cur = (users[uid] && users[uid].pendingCoins) || 0;
          upd["users/"+uid+"/pendingCoins"] = cur + amt;
        });
        d.ref().update(upd).then(function(){
          addLog("gift "+fmt(amt)+" всем", "success");
          if(out){ out.className="admin-result success"; out.textContent="🎁 Подарок "+fmt(amt)+" отправлен всем"; }
        });
      });
      return;
    }

    // MESSAGE
    if(cmd==="message"){
      var text = parts.slice(1).join(" ");
      if(!text){
        if(out){ out.className="admin-result error"; out.textContent="❌ Синтаксис: message <text>"; }
        return;
      }
      d.ref("admin/messages").push().set({text:text, by:me(), byNick:myNick(), ts:Date.now()});
      addLog("message: "+text, "success");
      if(out){ out.className="admin-result success"; out.textContent="📢 Сообщение отправлено"; }
      return;
    }

    // HISTORY
    if(cmd==="history"){
      renderLog();
      addLog("history");
      if(out){ out.className="admin-result info"; out.textContent="📜 История в блоке ниже"; }
      return;
    }

    if(out){ out.className="admin-result error"; out.textContent="❌ Неизвестная команда. Напиши help"; }
  }

  // ==== ОТКРЫТИЕ ====
  function openAdmin(){
    if(!hasAccess()){ alert("Нет доступа"); return; }
    var m=byId("modal-admin"); if(m) m.classList.remove("hidden");
    if(typeof syncScrollLock==="function") try{ syncScrollLock(); }catch(e){}
    renderStatus();
    renderLog();
  }
  function closeAdmin(){
    var m=byId("modal-admin"); if(m) m.classList.add("hidden");
    if(typeof syncScrollLock==="function") try{ syncScrollLock(); }catch(e){}
  }

  // ==== КНОПКА В НАСТРОЙКАХ ====
  function updateAdminBtn(){
    var ab=byId("admin-open-btn");
    if(!ab) return;
    if(hasAccess()){
      ab.classList.remove("hidden");
      ab.onclick=function(e){ e.preventDefault(); openAdmin(); };
    } else {
      ab.classList.add("hidden");
      ab.onclick=null;
    }
  }

  // ==== ПРИВЯЗКА ====
  function bind(){
    var exec=byId("admin-cmd-exec");
    var inp=byId("admin-cmd-input");
    if(exec) exec.onclick=function(){
      var v=inp?inp.value:"";
      execCommand(v);
      if(inp) inp.value="";
    };
    if(inp) inp.onkeydown=function(e){
      if(e.key==="Enter"){ execCommand(inp.value); inp.value=""; }
    };

    document.querySelectorAll(".admin-quick-btn").forEach(function(b){
      b.onclick=function(){
        var c=b.dataset.cmd;
        if(!c) return;
        if(inp) inp.value=c;
        execCommand(c);
        if(inp) inp.value="";
      };
    });

    var closeBtn=document.querySelector('[data-close="modal-admin"]');
    if(closeBtn) closeBtn.onclick=closeAdmin;

    updateAdminBtn();
    setInterval(updateAdminBtn, 2000);

    subscribeAdmin();
    installMultiplier();
    renderStatus();
    renderLog();
    console.log("[admin v3] OK. Админов:", ADMIN_IDS.length);
  }

  // ==== ПУБЛИЧНЫЕ ====
  window.adminOpen=openAdmin;
  window.adminClose=closeAdmin;
  window.adminSetup=function(){ updateAdminBtn(); };
  window.adminGetBoostMult=function(){
    var m=1;
    if(activeBoost && activeBoost.active && activeBoost.endsAt>Date.now()) m *= (activeBoost.mult||1);
    if(activeEvent && activeEvent.endsAt>Date.now()) m *= (activeEvent.mult||1);
    return m;
  };

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 1200); });
  } else { setTimeout(bind, 1200); }
  window.addEventListener("load", function(){ setTimeout(bind, 2200); });
})();
