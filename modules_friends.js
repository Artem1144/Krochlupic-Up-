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
