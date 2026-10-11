/* ==== Krochlupic Friends v1 ==== */
(function(){
  "use strict";

  function byId(id){ return document.getElementById(id); }
  function show(id){ var m=byId(id); if(m) m.classList.remove("hidden"); }
  function hide(id){ var m=byId(id); if(m) m.classList.add("hidden"); }
  function fb(){
    if(typeof db!=="undefined" && db) return db;
    if(typeof firebase!=="undefined" && firebase.database) return firebase.database();
    return null;
  }
  function me(){ return (typeof profile!=="undefined" && profile && profile.id) || ""; }
  function myNick(){ return (typeof profile!=="undefined" && profile && profile.nickname) || ""; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  }); }
  function ts(){ return Date.now(); }
  function chatKey(a,b){ return a<b ? (a+"__"+b) : (b+"__"+a); }

  // Публикация своего профиля в /users
  function publishMe(){
    var d=fb(), uid=me();
    if(!d || !uid) return;
    d.ref("users/"+uid).update({
      nickname: myNick(),
      lastSeen: ts()
    });
    // shortId на основе uid (простой хеш)
    var code = shortIdFromUid(uid);
    d.ref("users/"+uid+"/shortId").set(code);
    d.ref("shortIds/"+code).set(uid);
  }

  function shortIdFromUid(uid){
    if(!uid) return "----";
    var h=0; for(var i=0;i<uid.length;i++) h=(h*31 + uid.charCodeAt(i))|0;
    var abc="ABCDEFGHJKMNPQRSTUVWXYZ23456789", s="", v=Math.abs(h);
    for(var k=0;k<4;k++){ s+=abc[v%abc.length]; v=Math.floor(v/abc.length); }
    return s;
  }

  function statusText(lastSeen){
    if(!lastSeen) return "⚪ оффлайн";
    var d = Math.floor((Date.now()-lastSeen)/1000);
    if(d<90) return "🟢 в сети";
    if(d<600) return "🟡 недавно";
    return "⚪ был давно";
  }

  // ============ ДРУЗЬЯ ============
  function openFriends(){
    show("modal-friends");
    var el=byId("friends-my-id");
    if(el) el.textContent = (myNick() || "Игрок") + "#" + shortIdFromUid(me());
    publishMe();
    subscribeFriends();
    renderFriendList();
    renderIncoming();
    renderOutgoing();
    renderRating();
  }

  var friendsRef=null, incomingRef=null, outgoingRef=null;
  function subscribeFriends(){
    var d=fb(), uid=me();
    if(!d || !uid) return;
    if(friendsRef) friendsRef.off();
    if(incomingRef) incomingRef.off();
    if(outgoingRef) outgoingRef.off();

    friendsRef = d.ref("friends/"+uid+"/list");
    friendsRef.on("value", function(s){
      window.__FRIENDS_LIST = s.val() || {};
      // Обновляем lastSeen друзей
      var ids = Object.keys(window.__FRIENDS_LIST);
      var done = 0;
      if(!ids.length){ renderFriendList(); return; }
      ids.forEach(function(fid){
        d.ref("users/"+fid+"/lastSeen").once("value").then(function(us){
          if(window.__FRIENDS_LIST[fid]){
            window.__FRIENDS_LIST[fid].lastSeen = us.val() || 0;
          }
          done++;
          if(done === ids.length) renderFriendList();
        }).catch(function(){ done++; if(done === ids.length) renderFriendList(); });
      });
    });

    incomingRef = d.ref("friends/"+uid+"/incoming");
    incomingRef.on("value", function(s){
      window.__FRIENDS_IN = s.val() || {};
      renderIncoming();
    });

    outgoingRef = d.ref("friends/"+uid+"/outgoing");
    outgoingRef.on("value", function(s){
      window.__FRIENDS_OUT = s.val() || {};
      renderOutgoing();
    });
  }

  function renderFriendList(){
    var list=byId("friends-list"), empty=byId("friends-list-empty"), cnt=byId("friends-count");
    if(!list) return;
    list.innerHTML="";
    var ids = Object.keys(window.__FRIENDS_LIST || {});
    if(cnt) cnt.textContent = ids.length;
    if(!ids.length){ if(empty) empty.classList.remove("hidden"); return; }
    if(empty) empty.classList.add("hidden");
    ids.forEach(function(fid){
      var info = window.__FRIENDS_LIST[fid] || {};
      var nick = info.nickname || info.nick || fid.slice(0,10);
      var row = document.createElement("div");
      row.className = "friend-row";
      row.innerHTML =
        '<div class="friend-status-dot">'+statusText(info.lastSeen).slice(0,2)+'</div>'+
        '<div class="friend-info">'+
          '<div class="friend-name">'+esc(nick)+'</div>'+
          '<div class="friend-status-text">'+statusText(info.lastSeen)+'</div>'+
        '</div>'+
        '<button class="friend-action-btn chat" data-chat="'+fid+'">💬</button>'+
        '<button class="friend-action-btn gift" data-gift="'+fid+'">🎁</button>'+
        '<button class="friend-action-btn decline" data-del="'+fid+'">✖</button>';
      list.appendChild(row);
    });
    list.querySelectorAll("[data-chat]").forEach(function(b){ b.onclick=function(){
      var fid = b.dataset.chat;
      var nick = (window.__FRIENDS_LIST[fid]||{}).nickname || fid.slice(0,10);
      openDm(fid, nick);
    }; });
    list.querySelectorAll("[data-gift]").forEach(function(b){ b.onclick=function(){
      sendGift(b.dataset.gift);
    }; });
    list.querySelectorAll("[data-del]").forEach(function(b){ b.onclick=function(){
      var fid = b.dataset.del;
      if(!confirm("Удалить из друзей?")) return;
      var d = fb(), uid = me();
      if(!d || !uid) return;
      d.ref("friends/"+uid+"/list/"+fid).remove();
      d.ref("friends/"+fid+"/list/"+uid).remove();
    }; });
  }

  function renderIncoming(){
    var list=byId("friends-incoming-list"), empty=byId("friends-incoming-empty");
    var badge=byId("friends-req-badge");
    if(!list) return;
    list.innerHTML="";
    var ids = Object.keys(window.__FRIENDS_IN || {});
    if(badge){
      if(ids.length){ badge.textContent=ids.length; badge.classList.remove("hidden"); }
      else badge.classList.add("hidden");
    }
    if(!ids.length){ if(empty) empty.classList.remove("hidden"); return; }
    if(empty) empty.classList.add("hidden");
    ids.forEach(function(fid){
      var info = window.__FRIENDS_IN[fid] || {};
      var nick = info.nickname || fid.slice(0,10);
      var row = document.createElement("div");
      row.className = "friend-row";
      row.innerHTML =
        '<div class="friend-info">'+
          '<div class="friend-name">'+esc(nick)+'</div>'+
        '</div>'+
        '<button class="friend-action-btn accept" data-ok="'+fid+'">✓</button>'+
        '<button class="friend-action-btn decline" data-no="'+fid+'">✕</button>';
      list.appendChild(row);
    });
    list.querySelectorAll("[data-ok]").forEach(function(b){ b.onclick=function(){
      acceptFriend(b.dataset.ok);
    }; });
    list.querySelectorAll("[data-no]").forEach(function(b){ b.onclick=function(){
      declineFriend(b.dataset.no);
    }; });
  }

  function renderOutgoing(){
    var list=byId("friends-outgoing-list"), empty=byId("friends-outgoing-empty");
    if(!list) return;
    list.innerHTML="";
    var ids = Object.keys(window.__FRIENDS_OUT || {});
    if(!ids.length){ if(empty) empty.classList.remove("hidden"); return; }
    if(empty) empty.classList.add("hidden");
    ids.forEach(function(fid){
      var info = window.__FRIENDS_OUT[fid] || {};
      var nick = info.nickname || fid.slice(0,10);
      var row = document.createElement("div");
      row.className = "friend-row";
      row.innerHTML =
        '<div class="friend-info">'+
          '<div class="friend-name">'+esc(nick)+'</div>'+
          '<div class="friend-status-text">⏳ ожидание</div>'+
        '</div>';
      list.appendChild(row);
    });
  }

  function acceptFriend(fid){
    var d=fb(), uid=me();
    if(!d || !uid) return;
    var info = (window.__FRIENDS_IN[fid]||{});
    d.ref("friends/"+uid+"/list/"+fid).set({
      nickname: info.nickname || "Друг",
      addedAt: ts()
    });
    d.ref("friends/"+fid+"/list/"+uid).set({
      nickname: myNick(),
      addedAt: ts()
    });
    d.ref("friends/"+uid+"/incoming/"+fid).remove();
    d.ref("friends/"+fid+"/outgoing/"+uid).remove();
  }

  function declineFriend(fid){
    var d=fb(), uid=me();
    if(!d || !uid) return;
    d.ref("friends/"+uid+"/incoming/"+fid).remove();
    d.ref("friends/"+fid+"/outgoing/"+uid).remove();
  }

  // ============ ПОИСК ДРУЗЕЙ ============
  function searchFriends(){
    var inp = byId("friends-search-input"), out = byId("friends-search-result");
    if(!inp || !out) return;
    var q = inp.value.trim();
    if(!q){ out.innerHTML='<p class="friends-empty">Введи ник или ID</p>'; return; }
    var d = fb(), uid = me();
    if(!d){ out.innerHTML='<p class="friends-empty" style="color:#ff5252">Firebase недоступен</p>'; return; }
    out.innerHTML = '<p class="friends-empty">Поиск...</p>';

    // Поддержка формата Ник#CODE
    var codeMatch = q.match(/#([A-Z0-9]{4})$/i);
    if(codeMatch){
      var code = codeMatch[1].toUpperCase();
      d.ref("shortIds/"+code).once("value").then(function(s){
        var fid = s.val();
        if(!fid || fid===uid){ out.innerHTML='<p class="friends-empty">Не найдено</p>'; return; }
        d.ref("users/"+fid).once("value").then(function(us){
          var u = us.val() || {};
          renderSearchResult(out, fid, u.nickname || "Игрок");
        });
      });
      return;
    }

    // Поиск по нику
    d.ref("users").once("value").then(function(snap){
      var users = snap.val() || {}, found = [];
      var ql = q.toLowerCase();
      Object.keys(users).forEach(function(u){
        if(u===uid) return;
        var n = String(users[u].nickname || "").toLowerCase();
        if(n.indexOf(ql) !== -1) found.push({id:u, nick:users[u].nickname || "Игрок"});
      });
      if(!found.length){ out.innerHTML='<p class="friends-empty" style="color:#ff5252">Не найдено</p>'; return; }
      out.innerHTML = found.map(function(u){
        return '<div class="friend-row">'+
          '<div class="friend-info"><div class="friend-name">'+esc(u.nick)+'</div></div>'+
          '<button class="friend-action-btn accept" data-add="'+u.id+'">➕</button>'+
        '</div>';
      }).join("");
      out.querySelectorAll("[data-add]").forEach(function(b){ b.onclick=function(){
        sendRequest(b.dataset.add);
      }; });
    });
  }

  function renderSearchResult(out, fid, nick){
    out.innerHTML =
      '<div class="friend-row">'+
        '<div class="friend-info"><div class="friend-name">'+esc(nick)+'</div></div>'+
        '<button class="friend-action-btn accept" data-add="'+fid+'">➕</button>'+
      '</div>';
    out.querySelector("[data-add]").onclick = function(){ sendRequest(fid); };
  }

  function sendRequest(fid){
    var d=fb(), uid=me();
    if(!d || !uid || !fid) return;
    d.ref("friends/"+fid+"/incoming/"+uid).set({
      nickname: myNick(), ts: ts()
    });
    d.ref("friends/"+uid+"/outgoing/"+fid).set({
      nickname: "Отправлено", ts: ts()
    });
    alert("✅ Заявка отправлена");
  }

  // ============ ЛС ============
  var dmRef=null, dmPartner=null, dmNick="";

  function openDm(fid, nick){
    dmPartner = fid;
    dmNick = nick;
    show("modal-dm");
    var n = byId("dm-name"); if(n) n.textContent = nick;
    var a = byId("dm-avatar"); if(a) a.textContent = "👤";
    var s = byId("dm-status"); if(s) s.textContent = "...";
    var d = fb(), uid = me();
    if(!d || !uid) return;
    d.ref("users/"+fid+"/lastSeen").once("value").then(function(us){
      if(s) s.textContent = statusText(us.val());
    });
    if(dmRef) dmRef.off();
    dmRef = d.ref("dms/"+chatKey(uid, fid)).limitToLast(100);
    dmRef.on("value", function(snap){
      var data = snap.val() || {};
      renderDm(data);
    });
  }

  function renderDm(data){
    var box = byId("dm-messages");
    if(!box) return;
    var keys = Object.keys(data).sort(function(a,b){ return (data[a].ts||0)-(data[b].ts||0); });
    if(!keys.length){ box.innerHTML='<p class="dm-empty">Пока пусто. Напиши первым!</p>'; return; }
    var uid = me();
    box.innerHTML = keys.map(function(k){
      var m = data[k] || {};
      var own = (m.from === uid);
      var dt = new Date(m.ts || 0);
      var tm = ("0"+dt.getHours()).slice(-2)+":"+("0"+dt.getMinutes()).slice(-2);
      return '<div class="dm-msg'+(own?" mine":"")+'">'+
        '<div class="dm-msg-author">'+esc(m.nick || "Аноним")+'</div>'+
        '<div class="dm-msg-text">'+esc(m.text || "")+'</div>'+
        '<div class="dm-msg-time">'+tm+'</div></div>';
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function sendDm(){
    var inp = byId("dm-input");
    if(!inp) return;
    var txt = inp.value.trim();
    if(!txt) return;
    var d = fb(), uid = me();
    if(!d || !uid || !dmPartner) return;
    d.ref("dms/"+chatKey(uid, dmPartner)).push().set({
      from: uid,
      nick: myNick(),
      text: txt,
      ts: ts()
    }).then(function(){ inp.value=""; });
  }

  // ============ ПОДАРКИ ============
  function sendGift(fid){
    var d = fb(), uid = me();
    if(!d || !uid) return;
    if(typeof coins === "undefined") return;
    if(coins < 100){ alert("Нужно минимум 100 монет"); return; }
    var key = "gift_"+uid+"_"+fid+"_"+new Date().toISOString().slice(0,10);
    try{
      if(localStorage.getItem(key)){ alert("🎁 Ты уже дарил сегодня этому другу!"); return; }
    }catch(e){}
    if(!confirm("Подарить 100 монет другу?")) return;
    coins -= 100;
    if(typeof updateUI === "function") try{ updateUI(); }catch(e){}
    if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
    d.ref("gifts/"+fid).push().set({
      from: uid,
      fromNick: myNick(),
      amount: 100,
      ts: ts()
    });
    try{ localStorage.setItem(key, "1"); }catch(e){}
    alert("✅ Подарок отправлен");
  }

  function processGifts(){
    var d = fb(), uid = me();
    if(!d || !uid) return;
    d.ref("gifts/"+uid).once("value").then(function(s){
      var gifts = s.val() || {};
      var total = 0, senders = [];
      Object.keys(gifts).forEach(function(k){
        var g = gifts[k] || {};
        total += g.amount || 0;
        senders.push(g.fromNick || "Друг");
        d.ref("gifts/"+uid+"/"+k).remove();
      });
      if(total > 0){
        if(typeof coins !== "undefined") coins += total;
        if(typeof updateUI === "function") try{ updateUI(); }catch(e){}
        if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
        alert("🎁 Получено " + total + " монет от: " + senders.join(", "));
      }
    });
  }

  // ============ РЕЙТИНГ ДРУЗЕЙ ============
  function renderRating(){
    var list = byId("friends-rating-list");
    if(!list) return;
    var d = fb(), uid = me();
    if(!d || !uid) return;
    list.innerHTML = '<p class="friends-empty">Загрузка...</p>';
    var ids = Object.keys(window.__FRIENDS_LIST || {});
    ids.push(uid);
    var arr = [];
    var pending = ids.length;
    if(!pending){ list.innerHTML = '<p class="friends-empty">Нет друзей</p>'; return; }
    ids.forEach(function(fid){
      d.ref("users/"+fid).once("value").then(function(s){
        var u = s.val() || {};
        var totalEarned = 0;
        // Забираем totalEarned из leaderboard если есть
        d.ref("leaderboard/"+fid).once("value").then(function(ls){
          var l = ls.val() || {};
          arr.push({
            id: fid,
            nick: u.nickname || (fid===uid ? "Я" : fid.slice(0,10)),
            score: l.score || 0
          });
          pending--;
          if(pending === 0){
            arr.sort(function(a,b){ return b.score - a.score; });
            var medals = ["🥇","🥈","🥉"];
            list.innerHTML = arr.map(function(p, i){
              var m = i<3 ? medals[i] : (i+1);
              var cls = i<3 ? " rank-"+(i+1) : "";
              return '<div class="friend-rating-row'+cls+'">'+
                '<div class="friend-rating-rank">'+m+'</div>'+
                '<div class="friend-rating-info"><div class="friend-rating-name">'+esc(p.nick)+'</div></div>'+
                '<div class="friend-rating-score">'+(typeof formatNumber==="function"?formatNumber(p.score):p.score)+'</div>'+
              '</div>';
            }).join("");
          }
        });
      }).catch(function(){ pending--; if(pending===0) list.innerHTML = '<p class="friends-empty">Ошибка</p>'; });
    });
  }

  // ============ ВКЛАДКИ ДРУЗЕЙ ============
  function bindTabs(){
    document.querySelectorAll(".friends-tab").forEach(function(tb){
      tb.onclick = function(){
        document.querySelectorAll(".friends-tab").forEach(function(x){ x.classList.remove("active"); });
        tb.classList.add("active");
        var pane = tb.dataset.ftab;
        document.querySelectorAll(".friends-pane").forEach(function(p){ p.classList.add("hidden"); });
        var pv = byId("friends-pane-"+pane);
        if(pv) pv.classList.remove("hidden");
        if(pane === "rating") renderRating();
      };
    });
  }

  // ============ ПРИВЯЗКА ============
  function bind(){
    // Верхняя кнопка Друзья
    document.querySelectorAll('.tab-btn[data-tab="friends"]').forEach(function(b){
      b.onclick = function(){ openFriends(); };
    });

    // Вкладки
    bindTabs();

    // Копировать ID
    var cp = byId("friends-copy-id");
    if(cp) cp.onclick = function(){
      var el = byId("friends-my-id");
      if(!el) return;
      var txt = el.textContent;
      try{ navigator.clipboard.writeText(txt); alert("📋 "+txt); }
      catch(e){ prompt("Скопируй:", txt); }
    };

    // Поиск
    var sb = byId("friends-search-btn");
    var si = byId("friends-search-input");
    if(sb) sb.onclick = searchFriends;
    if(si) si.onkeydown = function(e){ if(e.key==="Enter") searchFriends(); };

    // ЛС
    var dS = byId("dm-send");
    var dI = byId("dm-input");
    if(dS) dS.onclick = sendDm;
    if(dI) dI.onkeydown = function(e){ if(e.key==="Enter") sendDm(); };
    if(dI) dI.addEventListener("input", function(){
      var c = byId("dm-counter");
      if(c) c.textContent = dI.value.length + "/120";
    });

    // Боковая кнопка ЛС
    var dbBtn = byId("dm-side-btn");
    if(dbBtn) dbBtn.onclick = function(e){
      e.preventDefault();
      var list = Object.keys(window.__FRIENDS_LIST || {});
      if(!list.length){ alert("Сначала добавь друзей"); return; }
      var fid = list[0];
      var nick = (window.__FRIENDS_LIST[fid]||{}).nickname || fid.slice(0,10);
      openDm(fid, nick);
    };

    // Heartbeat — обновляем lastSeen
    setInterval(function(){
      var d = fb(), uid = me();
      if(d && uid) d.ref("users/"+uid+"/lastSeen").set(ts());
    }, 30000);

    // Обработка подарков
    setTimeout(processGifts, 2000);

    console.log("[friends v1] bind OK");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 800); });
  } else {
    setTimeout(bind, 800);
  }
  window.addEventListener("load", function(){ setTimeout(bind, 1500); });
})();
/* ==== Krochlupic Admin Console v1 ==== */
(function(){
  "use strict";
  function byId(id){ return document.getElementById(id); }
  function fb(){ if(typeof db!=="undefined"&&db) return db; if(typeof firebase!=="undefined"&&firebase.database) return firebase.database(); return null; }
  function me(){ return (typeof profile!=="undefined"&&profile&&profile.id)||""; }
  function myNick(){ return (typeof profile!=="undefined"&&profile&&profile.nickname)||"Аноним"; }
  function fmt(n){ if(typeof formatNumber==="function") return formatNumber(n); return String(Math.floor(n||0)); }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  var ADMIN_IDS = ["u_1790687044368_j0ic", "u_1790687777315_g6nn"];
  var LOG_KEY = "clicker-admin-log";
  var activeBoost = null;
  var activeEvent = null;

  function isAdmin(){ return ADMIN_IDS.indexOf(me()) !== -1; }
  function promoUnlocked(){
    try{
      if(localStorage.getItem("clicker-admin-unlocked")==="1") return true;
    }catch(e){}
    if(typeof adminState!=="undefined" && adminState && adminState.promoUnlocked) return true;
    return false;
  }
  function hasAccess(){ return isAdmin() || promoUnlocked(); }

  // ===== ЛОГ =====
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

  // ===== UI СТАТУСА =====
  function renderStatus(){
    var b=byId("admin-status-boost"), e=byId("admin-status-event");
    if(b){
      if(activeBoost && activeBoost.active && activeBoost.endsAt>Date.now()){
        var s=Math.ceil((activeBoost.endsAt-Date.now())/1000);
        var m=Math.floor(s/60); s=s%60;
        b.textContent="×"+activeBoost.mult+" · "+m+":"+(s<10?"0":"")+s;
      } else {
        b.textContent="нет";
      }
    }
    if(e){
      if(activeEvent && activeEvent.endsAt>Date.now()){
        var s2=Math.ceil((activeEvent.endsAt-Date.now())/1000);
        var m2=Math.floor(s2/60); s2=s2%60;
        e.textContent=activeEvent.name+" · "+m2+":"+(s2<10?"0":"")+s2;
      } else {
        e.textContent="нет";
      }
    }
  }

  // ===== ПОДПИСКА НА FIREBASE =====
  function subscribeAdmin(){
    var d=fb(); if(!d) return;
    d.ref("admin/boost").on("value", function(s){
      activeBoost = s.val() || null;
      renderStatus();
    });
    d.ref("admin/events/current").on("value", function(s){
      activeEvent = s.val() || null;
      renderStatus();
    });
  }

  // ===== ОБЁРТКА getCPS / getClickValue =====
  function installMultiplier(){
    if(window.__adminMultInstalled) return;
    window.__adminMultInstalled = true;
    if(typeof window.getCPS === "function"){
      var o1 = window.getCPS;
      window.getCPS = function(){
        var v = o1();
        var m = 1;
        if(activeBoost && activeBoost.active && activeBoost.endsAt>Date.now()) m *= (activeBoost.mult||1);
        if(activeEvent && activeEvent.endsAt>Date.now()) m *= (activeEvent.mult||1);
        return v * m;
      };
    }
    if(typeof window.getClickValue === "function"){
      var o2 = window.getClickValue;
      window.getClickValue = function(){
        var v = o2();
        var m = 1;
        if(activeBoost && activeBoost.active && activeBoost.endsAt>Date.now()) m *= (activeBoost.mult||1);
        if(activeEvent && activeEvent.endsAt>Date.now()) m *= (activeEvent.mult||1);
        return v * m;
      };
    }
  }

  // ===== КОМАНДЫ =====
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
        "help — этот список\n"+
        "status — моё состояние\n"+
        "boost <mult> <min> — глобальный буст\n"+
        "boost off — выключить буст\n"+
        "event <name> <mult> <min> — ивент\n"+
        "event off — выключить ивент\n"+
        "gift <amount> — подарок всем игрокам\n"+
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
        if(out){ out.className="admin-result error"; out.textContent="❌ Синтаксис: boost <mult> <min> или boost off"; }
        return;
      }
      var endsAt = Date.now() + min*60*1000;
      d.ref("admin/boost").set({active:true, mult:mult, endsAt:endsAt, by:me(), byNick:myNick()});
      addLog("boost ×"+mult+" на "+min+" мин", "success");
      if(out){ out.className="admin-result success"; out.textContent="⚡ Буст ×"+mult+" активен на "+min+" мин"; }
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
      var eendsAt = Date.now() + emin*60*1000;
      d.ref("admin/events/current").set({
        name:name, mult:emult, endsAt:eendsAt,
        by:me(), byNick:myNick()
      });
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
      if(!confirm("Отправить подарок " + amt + " монет всем игрокам?")) return;
      d.ref("users").once("value").then(function(s){
        var users = s.val() || {};
        var upd = {};
        Object.keys(users).forEach(function(uid){
          var cur = users[uid] && users[uid].pendingCoins || 0;
          upd["users/"+uid+"/pendingCoins"] = cur + amt;
        });
        d.ref().update(upd).then(function(){
          addLog("gift "+fmt(amt)+" всем", "success");
          if(out){ out.className="admin-result success"; out.textContent="🎁 Подарок "+fmt(amt)+" отправлен всем игрокам"; }
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
      d.ref("admin/messages").push().set({
        text:text, by:me(), byNick:myNick(), ts:Date.now()
      });
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

  // ===== ОТКРЫТИЕ =====
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

  // ===== ПРИВЯЗКА =====
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

    // Кнопка "Дополнительные настройки" в Настройках
    var advBtn=byId("advanced-btn");
    if(advBtn){
      // Переопределяем onclick
      advBtn.onclick=function(e){
        e.preventDefault();
        if(hasAccess()){
          advBtn.textContent="👑 Админ-консоль";
          openAdmin();
        } else {
          advBtn.textContent="🔧 Дополнительные настройки";
          // По умолчанию — открыть Кликер 67 (если функция есть)
          if(typeof openSecretMenu==="function") try{ openSecretMenu(); }catch(err){}
          else alert("Секретный раздел");
        }
      };
      // Обновить текст сразу, если доступ есть
      if(hasAccess()) advBtn.textContent="👑 Админ-консоль";
    }

    subscribeAdmin();
    installMultiplier();
    renderStatus();
    renderLog();
    console.log("[admin v1] OK");
  }

  // Публичные функции
  window.adminOpen=openAdmin;
  window.adminClose=closeAdmin;
  window.adminSetup=function(){
    // Заглушка, которая вызывается при вводе промокода
    var advBtn=byId("advanced-btn");
    if(advBtn && hasAccess()) advBtn.textContent="👑 Админ-консоль";
  };
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
/* ==== Krochlupic Global Events Banner v1 ==== */
(function(){
  "use strict";
  function byId(id){ return document.getElementById(id); }
  function fb(){ if(typeof db!=="undefined"&&db) return db; if(typeof firebase!=="undefined"&&firebase.database) return firebase.database(); return null; }

  var activeBoost = null;
  var activeEvent = null;
  var tickInterval = null;

  function getOrCreateBanner(){
    var b = byId("global-event-banner");
    if(b) return b;
    b = document.createElement("div");
    b.id = "global-event-banner";
    b.style.cssText =
      "position:fixed;top:0;left:0;right:0;"+
      "padding:8px 12px;font-size:13px;font-weight:bold;color:#fff;"+
      "text-align:center;z-index:9998;display:none;"+
      "box-shadow:0 2px 10px rgba(0,0,0,.5);"+
      "font-family:sans-serif;pointer-events:none;"+
      "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"+
      "text-shadow:0 1px 3px rgba(0,0,0,.7);";
    document.body.appendChild(b);
    return b;
  }

  function fmtTime(ms){
    if(ms<=0) return "0:00";
    var s = Math.ceil(ms/1000);
    var m = Math.floor(s/60); s = s%60;
    return m+":"+(s<10?"0":"")+s;
  }

  function render(){
    var b = getOrCreateBanner();
    var now = Date.now();
    var parts = [];

    if(activeBoost && activeBoost.active && activeBoost.endsAt > now){
      parts.push("⚡ БУСТ ×" + activeBoost.mult + " · " + fmtTime(activeBoost.endsAt - now));
    }
    if(activeEvent && activeEvent.endsAt > now){
      parts.push("🎉 " + activeEvent.name + " ×" + activeEvent.mult + " · " + fmtTime(activeEvent.endsAt - now));
    }

    if(!parts.length){
      b.style.display = "none";
      return;
    }

    b.textContent = parts.join("   |   ");
    b.style.display = "block";

    // Цвет градиента: если только буст — фиолетовый, если ивент — оранжевый
    if(activeEvent && activeEvent.endsAt > now){
      b.style.background = "linear-gradient(90deg,#7b1fa2,#e91e63,#ff5722)";
    } else if(activeBoost && activeBoost.active && activeBoost.endsAt > now){
      b.style.background = "linear-gradient(90deg,#4a148c,#7b1fa2)";
    }
  }

  function subscribe(){
    var d = fb();
    if(!d){ setTimeout(subscribe, 1000); return; }
    d.ref("admin/boost").on("value", function(s){
      activeBoost = s.val() || null;
      render();
    });
    d.ref("admin/events/current").on("value", function(s){
      activeEvent = s.val() || null;
      render();
    });
  }

  function start(){
    subscribe();
    if(tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(render, 500);
    console.log("[globalevents v1] OK");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(start, 1500); });
  } else { setTimeout(start, 1500); }
  window.addEventListener("load", function(){ setTimeout(start, 2500); });
})();
