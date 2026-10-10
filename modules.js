/* ==== Krochlupic Modules v1 ==== */
(function(){
  "use strict";

  function byId(id){ return document.getElementById(id); }
  function show(id){ var m=byId(id); if(m){ m.classList.remove("hidden"); } }
  function hide(id){ var m=byId(id); if(m){ m.classList.add("hidden"); } }
  function fb(){
    if(typeof db!=="undefined" && db) return db;
    if(typeof firebase!=="undefined" && firebase.database) return firebase.database();
    return null;
  }
  function myId(){
    if(typeof profile!=="undefined" && profile && profile.id) return profile.id;
    return "";
  }
  function myNick(){
    if(typeof profile!=="undefined" && profile && profile.nickname) return profile.nickname;
    return "Аноним";
  }
  function sound(n){ if(typeof playSound==="function"){ try{ playSound(n); }catch(e){} } }
  function lock(){ if(typeof syncScrollLock==="function"){ try{ syncScrollLock(); }catch(e){} } }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  }); }

  /* ============ КЛАН ============ */
  function openClan(){
    show("modal-clans"); lock();
    refreshClan();
  }

  function refreshClan(){
    var d=fb(), me=myId();
    if(!d || !me) return;
    var noClan=byId("clan-no-clan");
    var myInfo=byId("clan-my-info");
    d.ref("users/"+me+"/clanId").once("value").then(function(s){
      var cid=s.val();
      if(!cid){
        if(noClan) noClan.classList.remove("hidden");
        if(myInfo) myInfo.classList.add("hidden");
        return;
      }
      if(noClan) noClan.classList.add("hidden");
      if(myInfo) myInfo.classList.remove("hidden");
      d.ref("clans/"+cid).on("value", function(cs){
        var c=cs.val()||{};
        var set=function(id,v){ var e=byId(id); if(e) e.textContent=v; };
        set("clan-my-tag", c.tag||"?");
        set("clan-my-name", c.name||"—");
        set("clan-my-type", c.type==="open"?"🔓 Открытый":"🔒 Закрытый");
        set("clan-my-desc", c.description||"Описание");
        var mc=c.members?Object.keys(c.members).length:0;
        set("clan-my-count", mc+" / 10");
        var role=(c.members && c.members[me]) ? c.members[me].role : "member";
        var roleTxt={owner:"👑 Владелец", officer:"🛡 Офицер", member:"👤 Участник"}[role]||"👤 Участник";
        set("clan-my-role", roleTxt);

        // Участники
        var list=byId("clan-members-list");
        if(list){
          list.innerHTML="";
          Object.keys(c.members||{}).forEach(function(uid){
            var m=c.members[uid]||{};
            var nm=m.nickname || uid.slice(0,10);
            var rt={owner:"👑 Владелец", officer:"🛡 Офицер", member:"👤 Участник"}[m.role]||"👤";
            var row=document.createElement("div");
            row.className="clan-member-row";
            row.innerHTML='<div class="clan-member-status" style="color:#4caf50">●</div>'+
              '<div class="clan-member-info">'+
              '<div class="clan-member-name">'+esc(nm)+(uid===me?' <span style="color:#4fc3f7">(ты)</span>':'')+'</div>'+
              '<div class="clan-member-role">'+rt+'</div></div>';
            list.appendChild(row);
          });
        }

        // Чат
        d.ref("clans/"+cid+"/chat").limitToLast(50).on("value", function(chatSnap){
          var box=byId("clan-chat-messages");
          if(!box) return;
          var msgs=chatSnap.val()||{};
          var ids=Object.keys(msgs).sort(function(a,b){ return (msgs[a].ts||0)-(msgs[b].ts||0); });
          if(!ids.length){ box.innerHTML='<p class="clan-empty-msg">Чат пуст</p>'; return; }
          box.innerHTML=ids.map(function(k){
            var m=msgs[k]||{};
            var mine=(m.authorId===me);
            var dt=new Date(m.ts||0);
            var tm=("0"+dt.getHours()).slice(-2)+":"+("0"+dt.getMinutes()).slice(-2);
            return '<div class="clan-chat-msg'+(mine?" own":"")+'">'+
              '<div class="clan-chat-author'+(mine?" mine":"")+'">'+esc(m.author||"Аноним")+'</div>'+
              '<div class="clan-chat-text">'+esc(m.text||"")+'</div>'+
              '<div class="clan-chat-time">'+tm+'</div></div>';
          }).join("");
          box.scrollTop=box.scrollHeight;
        });
      });
    });
  }

  function createClan(){
    var name=byId("clan-create-name"), tag=byId("clan-create-tag"),
        desc=byId("clan-create-desc"), err=byId("clan-create-error"),
        type=document.querySelector('input[name="clan-type"]:checked');
    var n=name?name.value.trim():"", t=tag?tag.value.trim().toUpperCase():"";
    var dsc=desc?desc.value.trim():"", tp=type?type.value:"open";
    if(err) err.textContent="";
    if(n.length<3||n.length>20){ if(err) err.textContent="Название: 3-20 символов"; return; }
    if(!/^[A-Z]{2,4}$/.test(t)){ if(err) err.textContent="Тег: 2-4 латинские буквы"; return; }
    var d=fb(), me=myId();
    if(!d||!me){ if(err) err.textContent="Firebase не подключён"; return; }
    if(typeof crystals!=="undefined" && crystals<500){ if(err) err.textContent="Нужно 500 💎"; return; }

    var ref=d.ref("clans").push();
    var cid=ref.key;
    var upd={};
    upd["clans/"+cid]={ name:n, tag:t, description:dsc, type:tp,
      ownerId:me, invested:0, level:1, createdAt:Date.now() };
    upd["clans/"+cid+"/members/"+me]={ role:"owner", nickname:myNick(), joinedAt:Date.now() };
    upd["clanTags/"+t]=cid;
    upd["users/"+me+"/clanId"]=cid;

    d.ref().update(upd).then(function(){
      if(typeof crystals!=="undefined") crystals-=500;
      if(typeof updateUI==="function") try{ updateUI(); }catch(e){}
      if(typeof saveGame==="function") try{ saveGame(); }catch(e){}
      if(err) err.textContent="✅ Клан создан!";
      // Переключаем на "Мой клан"
      document.querySelectorAll(".clan-tab").forEach(function(x){
        x.classList.toggle("active", x.dataset.ctab==="my");
      });
      document.querySelectorAll(".clan-pane").forEach(function(p){ p.classList.add("hidden"); });
      show("clan-pane-my");
      setTimeout(refreshClan, 400);
    }).catch(function(e){ if(err) err.textContent="Ошибка: "+e.message; });
  }

  function searchClans(){
    var inp=byId("clan-search-input"), out=byId("clan-search-results");
    if(!inp||!out) return;
    var q=inp.value.trim().toLowerCase();
    if(!q){ out.innerHTML='<p class="clan-empty-msg">Введи название или тег</p>'; return; }
    var d=fb();
    if(!d){ out.innerHTML='<p class="clan-empty-msg">Firebase недоступен</p>'; return; }
    out.innerHTML='<p class="clan-empty-msg">Поиск...</p>';
    d.ref("clans").once("value").then(function(s){
      var c=s.val()||{}, found=[];
      for(var k in c){
        var nm=String(c[k].name||"").toLowerCase();
        var tg=String(c[k].tag||"").toLowerCase();
        if(nm.indexOf(q)!==-1 || tg.indexOf(q)!==-1) found.push({id:k, d:c[k]});
      }
      if(!found.length){ out.innerHTML='<p class="clan-empty-msg">Не найдено</p>'; return; }
      out.innerHTML=found.map(function(x){
        var mc=x.d.members?Object.keys(x.d.members).length:0;
        return '<div class="clan-card"><div class="clan-card-row">'+
          '<div class="clan-card-tag">'+esc(x.d.tag||"?")+'</div>'+
          '<div class="clan-card-info">'+
          '<div class="clan-card-name">'+esc(x.d.name||"—")+'</div>'+
          '<div class="clan-card-meta">'+mc+'/10 · '+(x.d.type==="open"?"🔓":"🔒")+'</div>'+
          '</div></div>'+
          '<button class="clan-primary-btn" style="margin-top:8px" data-join="'+x.id+'">🚪 Вступить</button></div>';
      }).join("");
      out.querySelectorAll("[data-join]").forEach(function(b){
        b.onclick=function(){
          var cid=b.dataset.join, d2=fb(), me=myId();
          if(!d2||!me) return;
          d2.ref("users/"+me+"/clanId").set(cid);
          d2.ref("clans/"+cid+"/members/"+me).set({
            role:"member", nickname:myNick(), joinedAt:Date.now()
          });
          b.textContent="✅ Вступил";
          setTimeout(refreshClan, 400);
        };
      });
    }).catch(function(e){ out.innerHTML='<p class="clan-empty-msg" style="color:#ff5252">'+e.message+'</p>'; });
  }

  function sendClanChat(){
    var inp=byId("clan-chat-input");
    if(!inp) return;
    var v=inp.value.trim();
    if(!v) return;
    var d=fb(), me=myId();
    if(!d||!me) return;
    d.ref("users/"+me+"/clanId").once("value").then(function(s){
      var cid=s.val();
      if(!cid){ alert("Ты не в клане"); return; }
      d.ref("clans/"+cid+"/chat").push().set({
        author:myNick(), authorId:me, text:v, ts:Date.now()
      }).then(function(){ inp.value=""; });
    });
  }

  /* ============ ДРУЗЬЯ ============ */
  function openFriends(){
    show("modal-friends"); lock();
  }

  function searchFriends(){
    var inp=byId("friends-search-input"), out=byId("friends-search-result");
    if(!inp||!out) return;
    var q=inp.value.trim().toLowerCase();
    if(!q){ out.innerHTML='<p class="friends-empty">Введи ник</p>'; return; }
    var d=fb(), me=myId();
    if(!d){ out.innerHTML='<p class="friends-empty" style="color:#ff5252">Firebase недоступен</p>'; return; }
    out.innerHTML='<p class="friends-empty">Поиск...</p>';
    d.ref("users").once("value").then(function(snap){
      var users=snap.val()||{}, found=[];
      Object.keys(users).forEach(function(u){
        if(u===me) return;
        var n=String(users[u].nickname||"").toLowerCase();
        if(n.indexOf(q)!==-1) found.push({id:u, nick:users[u].nickname});
      });
      if(!found.length){ out.innerHTML='<p class="friends-empty" style="color:#ff5252">Не найдено</p>'; return; }
      out.innerHTML=found.map(function(u){
        return '<div class="friend-row"><div class="friend-info">'+
          '<div class="friend-name">'+esc(u.nick)+'</div></div>'+
          '<button class="friend-action-btn accept" data-add="'+u.id+'">➕</button></div>';
      }).join("");
      out.querySelectorAll("[data-add]").forEach(function(b){
        b.onclick=function(){
          var fid=b.dataset.add, d2=fb(), m2=myId();
          if(!d2||!m2) return;
          d2.ref("friends/"+fid+"/incoming/"+m2).set({
            nickname:myNick(), ts:Date.now()
          });
          d2.ref("friends/"+m2+"/outgoing/"+fid).set({
            nickname:myNick(), ts:Date.now()
          });
          b.textContent="⏳";
        };
      });
    }).catch(function(e){ out.innerHTML='<p class="friends-empty" style="color:#ff5252">'+e.message+'</p>'; });
  }

  /* ============ ПРИВЯЗКА ОБРАБОТЧИКОВ ============ */
  function bind(){
    // Боковые кнопки
    var cb=byId("clan-side-btn");
    if(cb) cb.onclick=function(e){ e.preventDefault(); sound("ui"); openClan(); };

    var db_btn=byId("dm-side-btn");
    if(db_btn) db_btn.onclick=function(e){ e.preventDefault(); sound("ui"); show("modal-dm"); lock(); };

    var al=byId("almanac-btn");
    if(al) al.onclick=function(e){
      e.preventDefault(); show("modal-almanac"); lock();
    };

    // Верхняя кнопка Друзья
    document.querySelectorAll('.tab-btn[data-tab="friends"]').forEach(function(b){
      b.onclick=function(){ sound("ui"); openFriends(); };
    });

    // Вкладки друзей
    document.querySelectorAll(".friends-tab").forEach(function(tb){
      tb.onclick=function(){
        document.querySelectorAll(".friends-tab").forEach(function(x){ x.classList.remove("active"); });
        tb.classList.add("active");
        var pane=tb.dataset.ftab;
        document.querySelectorAll(".friends-pane").forEach(function(p){ p.classList.add("hidden"); });
        var pv=byId("friends-pane-"+pane);
        if(pv) pv.classList.remove("hidden");
      };
    });

    // Копировать свой ID
    var cp=byId("friends-copy-id");
    if(cp) cp.onclick=function(){
      var el=byId("friends-my-id");
      if(!el) return;
      var txt=el.textContent;
      try{ navigator.clipboard.writeText(txt); alert("📋 "+txt); }
      catch(e){ prompt("Скопируй:", txt); }
    };

    // Поиск друзей
    var fs=byId("friends-search-btn");
    if(fs) fs.onclick=searchFriends;

    // Вкладки клана
    document.querySelectorAll(".clan-tab").forEach(function(tb){
      tb.onclick=function(){
        document.querySelectorAll(".clan-tab").forEach(function(x){ x.classList.remove("active"); });
        tb.classList.add("active");
        var pane=tb.dataset.ctab;
        document.querySelectorAll(".clan-pane").forEach(function(p){ p.classList.add("hidden"); });
        var pv=byId("clan-pane-"+pane);
        if(pv) pv.classList.remove("hidden");
      };
    });

    // Кнопки "Создать/Найти" на пустом экране
    document.querySelectorAll("[data-ctab-jump]").forEach(function(b){
      b.onclick=function(){
        var t=b.dataset.ctabJump;
        document.querySelectorAll(".clan-tab").forEach(function(x){ x.classList.toggle("active", x.dataset.ctab===t); });
        document.querySelectorAll(".clan-pane").forEach(function(p){ p.classList.add("hidden"); });
        var pv=byId("clan-pane-"+t);
        if(pv) pv.classList.remove("hidden");
      };
    });

    // Sub-вкладки клана
    document.querySelectorAll(".clan-subtab").forEach(function(tb){
      tb.onclick=function(){
        document.querySelectorAll(".clan-subtab").forEach(function(x){ x.classList.remove("active"); });
        tb.classList.add("active");
        var pane=tb.dataset.cstab;
        document.querySelectorAll(".clan-subpane").forEach(function(p){ p.classList.add("hidden"); });
        var pv=byId("clan-sub-"+pane);
        if(pv) pv.classList.remove("hidden");
      };
    });

    // Создать клан
    var cc=byId("clan-create-submit");
    if(cc) cc.onclick=createClan;

    // Поиск клана
    var cs=byId("clan-search-btn");
    if(cs) cs.onclick=searchClans;

    // Чат клана
    var chS=byId("clan-chat-send");
    if(chS) chS.onclick=sendClanChat;

    // Мой ID в профиле друзей
    var myIdEl=byId("friends-my-id");
    if(myIdEl) myIdEl.textContent=myNick();
  }

  /* ============ ЗАПУСК ============ */
  function start(){
    try{ bind(); }catch(e){ console.error("[modules] bind:", e); }
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(start, 800); });
  } else {
    setTimeout(start, 800);
  }
  // Перебиндить на всякий случай, если элементы появились позже
  window.addEventListener("load", function(){ setTimeout(start, 1500); });

})();
