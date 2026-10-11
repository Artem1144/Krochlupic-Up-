/* ==== Krochlupic Modules v2 ==== */
(function(){
  "use strict";

  function byId(id){ return document.getElementById(id); }
  function show(id){ var m=byId(id); if(m){ m.classList.remove("hidden"); } }
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
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  }); }
  function fmt(n){
    if(typeof formatNumber === "function") return formatNumber(n);
    n = Math.floor(n);
    if(n<1000) return String(n);
    if(n<1e6) return (n/1e3).toFixed(1)+"K";
    if(n<1e9) return (n/1e6).toFixed(2)+"M";
    if(n<1e12) return (n/1e9).toFixed(2)+"B";
    return (n/1e12).toFixed(2)+"T";
  }

  // Уровни клана (порог / бонус)
  var CLAN_LEVELS = [
    { lvl:1, need:0,        bonus:0    },
    { lvl:2, need:50000,    bonus:0.01 },
    { lvl:3, need:500000,   bonus:0.02 },
    { lvl:4, need:5000000,  bonus:0.03 },
    { lvl:5, need:50000000, bonus:0.05 }
  ];
  function getClanLevelInfo(invested){
    var cur = CLAN_LEVELS[0];
    for(var i=0;i<CLAN_LEVELS.length;i++){
      if(invested >= CLAN_LEVELS[i].need) cur = CLAN_LEVELS[i];
    }
    var nxt = null;
    for(var j=0;j<CLAN_LEVELS.length;j++){
      if(CLAN_LEVELS[j].lvl === cur.lvl + 1){ nxt = CLAN_LEVELS[j]; break; }
    }
    return { current: cur, next: nxt };
  }

  function openClan(){
    show("modal-clans");
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

      var cRef = d.ref("clans/"+cid);
      cRef.off();
      cRef.on("value", function(cs){
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

        // ==== УРОВЕНЬ КЛАНА + ВЛОЖЕНО ====
        var invested = c.invested || 0;
        var info = getClanLevelInfo(invested);
        set("clan-level-value", info.current.lvl + " / 5");
        set("clan-level-invested", fmt(invested));
        if(info.next){
          set("clan-level-next", fmt(info.next.need));
          var fill = byId("clan-level-fill");
          if(fill){
            var prevNeed = info.current.need;
            var span = info.next.need - prevNeed;
            var pct = span > 0 ? ((invested - prevNeed) / span) * 100 : 0;
            fill.style.width = Math.min(100, Math.max(0, pct)) + "%";
          }
        } else {
          set("clan-level-next", fmt(invested));
          var fill2 = byId("clan-level-fill");
          if(fill2) fill2.style.width = "100%";
        }
        var bonusPct = Math.round(info.current.bonus * 100);
        set("clan-level-bonus", "+" + bonusPct + "%");

        // ==== УЧАСТНИКИ + ОНЛАЙН ====
        var list=byId("clan-members-list");
        if(list){
          list.innerHTML="";
          var ids=Object.keys(c.members||{});
          if(!ids.length){
            list.innerHTML='<p class="clan-empty-msg">Нет участников</p>';
          } else {
            ids.forEach(function(uid){
              var m=c.members[uid]||{};
              var nm=m.nickname || uid.slice(0,10);
              var rt={owner:"👑 Владелец", officer:"🛡 Офицер", member:"👤 Участник"}[m.role]||"👤 Участник";
              var row=document.createElement("div");
              row.className="clan-member-row";
              row.dataset.uid=uid;
              row.innerHTML='<div class="clan-member-status" style="color:#888">●</div>'+
                '<div class="clan-member-info">'+
                  '<div class="clan-member-name">'+esc(nm)+(uid===me?' <span style="color:#4fc3f7">(ты)</span>':'')+'</div>'+
                  '<div class="clan-member-role">'+rt+' <span class="clan-member-online" style="font-size:11px;color:#888">…</span></div>'+
                '</div>';
              list.appendChild(row);
              // Онлайн-статус по lastSeen
              d.ref("users/"+uid+"/lastSeen").once("value").then(function(us){
                var lastSeen = us.val() || 0;
                var diff = Math.floor((Date.now() - lastSeen) / 1000);
                var dot = row.querySelector(".clan-member-status");
                var onl = row.querySelector(".clan-member-online");
                if(!dot || !onl) return;
                if(diff < 90){
                  dot.style.color = "#4caf50";
                  onl.textContent = "🟢 в сети";
                  onl.style.color = "#4caf50";
                } else if(diff < 600){
                  dot.style.color = "#ffd54f";
                  onl.textContent = "🟡 отошёл";
                  onl.style.color = "#ffd54f";
                } else {
                  dot.style.color = "#888";
                  onl.textContent = "⚪ оффлайн";
                  onl.style.color = "#888";
                }
              });
            });
          }
        }

        // ==== ЧАТ ====
        var chatRef = d.ref("clans/"+cid+"/chat");
        chatRef.off();
        chatRef.limitToLast(50).on("value", function(chatSnap){
          var box=byId("clan-chat-messages");
          if(!box) return;
          var msgs=chatSnap.val()||{};
          var keys=Object.keys(msgs).sort(function(a,b){ return (msgs[a].ts||0)-(msgs[b].ts||0); });
          if(!keys.length){ box.innerHTML='<p class="clan-empty-msg">Чат пуст</p>'; return; }
          box.innerHTML=keys.map(function(k){
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

  // ==== ПОИСК КЛАНОВ ====
  function searchClans(){
    var inp=byId("clan-search-input"), out=byId("clan-search-results");
    if(!inp || !out) return;
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
          '<div class="clan-card-info"><div class="clan-card-name">'+esc(x.d.name||"—")+'</div>'+
          '<div class="clan-card-meta">'+mc+'/10 · '+(x.d.type==="open"?"🔓":"🔒")+'</div></div></div>'+
          '<button class="clan-primary-btn" style="margin-top:8px" data-join="'+x.id+'">🚪 Вступить</button></div>';
      }).join("");
      out.querySelectorAll("[data-join]").forEach(function(b){
        b.onclick=function(){
          var cid=b.dataset.join, d2=fb(), m2=myId();
          if(!d2||!m2) return;
          d2.ref("users/"+m2+"/clanId").set(cid);
          d2.ref("clans/"+cid+"/members/"+m2).set({
            role:"member", nickname:myNick(), joinedAt:Date.now()
          });
          b.textContent="✅ Вступил";
          setTimeout(refreshClan, 400);
        };
      });
    }).catch(function(e){ out.innerHTML='<p class="clan-empty-msg" style="color:#ff5252">'+e.message+'</p>'; });
  }

  // ==== ЧАТ: ОТПРАВКА ====
  function sendChat(){
    var inp=byId("clan-chat-input");
    if(!inp) return;
    var txt=inp.value.trim();
    if(!txt) return;
    var d=fb(), me=myId();
    if(!d || !me) return;
    d.ref("users/"+me+"/clanId").once("value").then(function(s){
      var cid=s.val();
      if(!cid){ alert("Ты не в клане"); return; }
      d.ref("clans/"+cid+"/chat").push().set({
        author: myNick(),
        authorId: me,
        text: txt,
        ts: Date.now()
      }).then(function(){ inp.value=""; });
    });
  }

  // ==== ВКЛАД ====
  function investClan(amount){
    var d=fb(), me=myId();
    if(!d || !me) return;
    if(typeof coins === "undefined") return;
    if(amount === "custom"){
      var v=prompt("Сколько монет вложить?");
      if(!v) return;
      amount = parseInt(v,10);
      if(!amount || amount<=0) return;
    }
    if(amount <= 0) return;
    if(coins < amount){ alert("Недостаточно монет"); return; }
    d.ref("users/"+me+"/clanId").once("value").then(function(s){
      var cid=s.val();
      if(!cid){ alert("Ты не в клане"); return; }
      d.ref("clans/"+cid+"/invested").transaction(function(cur){
        return (cur || 0) + amount;
      }).then(function(){
        coins -= amount;
        if(typeof updateUI === "function") try{ updateUI(); }catch(e){}
        if(typeof saveGame === "function") try{ saveGame(); }catch(e){}
      });
    });
  }

  // ==== ПРИВЯЗКА ====
  function bind(){
    var cb=byId("clan-side-btn");
    if(cb) cb.onclick=function(e){ e.preventDefault(); openClan(); };
    var db2=byId("dm-side-btn");
    if(db2) db2.onclick=function(e){ e.preventDefault(); show("modal-dm"); };
    var al=byId("almanac-btn");
    if(al) al.onclick=function(e){ e.preventDefault(); show("modal-almanac"); };

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
    document.querySelectorAll("[data-ctab-jump]").forEach(function(b){
      b.onclick=function(){
        var t=b.dataset.ctabJump;
        document.querySelectorAll(".clan-tab").forEach(function(x){ x.classList.toggle("active", x.dataset.ctab===t); });
        document.querySelectorAll(".clan-pane").forEach(function(p){ p.classList.add("hidden"); });
        var pv=byId("clan-pane-"+t);
        if(pv) pv.classList.remove("hidden");
      };
    });

    var chS=byId("clan-chat-send");
    if(chS) chS.onclick=sendChat;
    var chIn=byId("clan-chat-input");
    if(chIn) chIn.onkeydown=function(e){ if(e.key==="Enter") sendChat(); };

    document.querySelectorAll(".clan-invest-btn").forEach(function(b){
      b.onclick=function(){
        var v=b.dataset.invest;
        if(v === "custom") investClan("custom");
        else investClan(parseInt(v,10) || 0);
      };
    });

    var cs=byId("clan-search-btn");
    if(cs) cs.onclick=searchClans;
    var csi=byId("clan-search-input");
    if(csi) csi.onkeydown=function(e){ if(e.key==="Enter") searchClans(); };

    console.log("[modules v2] bind OK");
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 800); });
  } else {
    setTimeout(bind, 800);
  }
  window.addEventListener("load", function(){ setTimeout(bind, 1500); });
})();
/* ==== Krochlupic Auction v1 ==== */
(function(){
  "use strict";
  function byId(id){ return document.getElementById(id); }
  function fb(){ if(typeof db!=="undefined"&&db) return db; if(typeof firebase!=="undefined"&&firebase.database) return firebase.database(); return null; }
  function me(){ return (typeof profile!=="undefined"&&profile&&profile.id)||""; }
  function myNick(){ return (typeof profile!=="undefined"&&profile&&profile.nickname)||"Аноним"; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function fmt(n){ if(typeof formatNumber==="function") return formatNumber(n); return String(Math.floor(n||0)); }

  var MY_LOTS={}, MARKET_LOTS={}, CURRENT_FILTER="all", PICKED_PET=null;

  function petEmoji(t){ return (typeof PET_TYPES!=="undefined"&&PET_TYPES[t]) ? PET_TYPES[t].emoji : "🐾"; }
  function petName(t){ return (typeof PET_TYPES!=="undefined"&&PET_TYPES[t]) ? PET_TYPES[t].name : t; }
  function petRar(t){ return (typeof PET_TYPES!=="undefined"&&PET_TYPES[t]) ? PET_TYPES[t].rarity : "common"; }
  function petRarLabel(t){ return (typeof PET_TYPES!=="undefined"&&PET_TYPES[t]) ? PET_TYPES[t].rarityLabel : "🟢 Обычный"; }

  function renderLot(lot, mine){
    var emoji=petEmoji(lot.petType), name=petName(lot.petType);
    var rar=petRar(lot.petType), rarLabel=petRarLabel(lot.petType);
    var cls="auction-card rarity-"+rar+(mine?" mine":"");
    var h='<div class="'+cls+'" data-lot="'+lot.id+'">'+
      '<div class="auction-card-emoji">'+emoji+'</div>'+
      '<div class="auction-card-info">'+
        '<div class="auction-card-name">'+esc(name)+'</div>'+
        '<div class="auction-card-rarity '+rar+'">'+rarLabel+'</div>'+
        '<div class="auction-card-seller">'+esc(lot.sellerNick||"?")+'</div>'+
      '</div>'+
      '<div class="auction-card-price">'+fmt(lot.price)+' 💰<small>комиссия 5%</small></div>';
    if(mine) h+='<button class="auction-card-cancel" data-cancel="'+lot.id+'">✖ Снять</button>';
    else h+='<button class="auction-card-buy" data-buy="'+lot.id+'">💰 Купить</button>';
    return h+'</div>';
  }

  function renderMy(){
    var list=byId("auction-my-list"); if(!list) return;
    list.innerHTML="";
    var ids=Object.keys(MY_LOTS);
    if(!ids.length){ list.innerHTML='<p class="auction-empty">У тебя нет активных лотов</p>'; return; }
    ids.forEach(function(id){ list.innerHTML += renderLot(MY_LOTS[id], true); });
    list.querySelectorAll("[data-cancel]").forEach(function(b){ b.onclick=function(){ cancelLot(b.dataset.cancel); }; });
  }

  function renderMarket(){
    var list=byId("auction-market-list"); if(!list) return;
    list.innerHTML="";
    var ids=Object.keys(MARKET_LOTS).filter(function(id){
      if(CURRENT_FILTER==="all") return true;
      return petRar(MARKET_LOTS[id].petType)===CURRENT_FILTER;
    });
    if(!ids.length){ list.innerHTML='<p class="auction-empty">Лотов нет</p>'; return; }
    ids.forEach(function(id){ list.innerHTML += renderLot(MARKET_LOTS[id], false); });
    list.querySelectorAll("[data-buy]").forEach(function(b){ b.onclick=function(){ buyLot(b.dataset.buy); }; });
  }

  function loadLots(){
    var d=fb(), uid=me();
    if(!d||!uid) return;
    d.ref("auction/lots").on("value", function(s){
      var all=s.val()||{};
      MY_LOTS={}; MARKET_LOTS={};
      Object.keys(all).forEach(function(id){
        var lot=all[id];
        if(!lot||lot.status!=="open") return;
        lot.id=id;
        if(lot.sellerId===uid) MY_LOTS[id]=lot; else MARKET_LOTS[id]=lot;
      });
      renderMy(); renderMarket();
    });
  }

  function openCreate(){
    PICKED_PET=null;
    var picker=byId("auction-pet-picker"); if(!picker) return;
    picker.innerHTML="";
    var st=(typeof petsState!=="undefined"&&petsState.storage)||[];
    if(!st.length){ picker.innerHTML='<p class="auction-empty">В хранилище нет питомцев</p>'; }
    else {
      st.forEach(function(pet){
        if(pet.tempExpiresAt) return;
        var row=document.createElement("div");
        row.className="auction-pet-option";
        row.innerHTML='<div class="auction-pet-option-emoji">'+petEmoji(pet.type)+'</div>'+
          '<div class="auction-pet-option-info">'+
          '<div class="auction-pet-option-name">'+esc(petName(pet.type))+'</div>'+
          '<div class="auction-pet-option-rarity">'+petRarLabel(pet.type)+'</div></div>';
        row.onclick=function(){
          picker.querySelectorAll(".auction-pet-option").forEach(function(x){ x.classList.remove("active"); });
          row.classList.add("active"); PICKED_PET=pet;
        };
        picker.appendChild(row);
      });
    }
    var pi=byId("auction-price-input"); if(pi) pi.value="";
    var err=byId("auction-create-error"); if(err) err.textContent="";
    var m=byId("modal-auction-create"); if(m) m.classList.remove("hidden");
    if(typeof syncScrollLock==="function") try{ syncScrollLock(); }catch(e){}
  }

  function submitLot(){
    var d=fb(), uid=me(); if(!d||!uid) return;
    var err=byId("auction-create-error"); if(err) err.textContent="";
    if(!PICKED_PET){ if(err) err.textContent="Выбери питомца"; return; }
    var pi=byId("auction-price-input"), pu=byId("auction-price-unit");
    var num=parseInt(pi?pi.value:"",10), unit=parseInt(pu?pu.value:"1",10)||1;
    var price=num*unit;
    if(!price||price<=0){ if(err) err.textContent="Введи цену > 0"; return; }
    if(typeof petsState==="undefined") return;
    var idx=petsState.storage.findIndex(function(p){ return p.id===PICKED_PET.id; });
    if(idx===-1){ if(err) err.textContent="Питомец не найден"; return; }
    var pet=petsState.storage[idx];
    var ref=d.ref("auction/lots").push();
    ref.set({
      sellerId: uid, sellerNick: myNick(),
      petType: pet.type, price: price, ts: Date.now(), status: "open"
    }).then(function(){
      petsState.storage.splice(idx,1);
      if(typeof petRenderAll==="function") try{ petRenderAll(); }catch(e){}
      if(typeof saveGame==="function") try{ saveGame(); }catch(e){}
      var m=byId("modal-auction-create"); if(m) m.classList.add("hidden");
      alert("✅ Лот выставлен за "+fmt(price)+" монет");
    }).catch(function(e){ if(err) err.textContent="Ошибка: "+e.message; });
  }

  function buyLot(lotId){
    var d=fb(), uid=me(); if(!d||!uid) return;
    d.ref("auction/lots/"+lotId).once("value").then(function(s){
      var lot=s.val();
      if(!lot||lot.status!=="open"){ alert("Лот уже продан"); return; }
      if(lot.sellerId===uid){ alert("Это твой лот"); return; }
      if(typeof coins==="undefined"||coins<lot.price){ alert("Недостаточно монет"); return; }
      if(typeof petTotalCount==="function"&&petTotalCount()>=5){ alert("Хранилище заполнено"); return; }
      if(!confirm("Купить "+petName(lot.petType)+" за "+fmt(lot.price)+" 💰?")) return;

      d.ref("auction/lots/"+lotId).transaction(function(cur){
        if(!cur||cur.status!=="open") return;
        cur.status="sold"; cur.buyerId=uid; cur.buyerNick=myNick(); cur.soldAt=Date.now();
        return cur;
      }).then(function(res){
        if(!res.committed){ alert("Кто-то опередил"); return; }
        coins -= lot.price;
        if(typeof petsState!=="undefined"){
          petsState.storage.push({ id:(typeof petGenerateId==="function"?petGenerateId():Date.now()), type:lot.petType });
        }
        var share=Math.floor(lot.price*0.95);
        d.ref("users/"+lot.sellerId+"/pendingCoins").transaction(function(c){ return (c||0)+share; });
        if(typeof updateUI==="function") try{ updateUI(); }catch(e){}
        if(typeof petRenderAll==="function") try{ petRenderAll(); }catch(e){}
        if(typeof saveGame==="function") try{ saveGame(); }catch(e){}
        alert("✅ Куплено: "+petName(lot.petType));
      });
    });
  }

  function cancelLot(lotId){
    var d=fb(), uid=me(); if(!d||!uid) return;
    if(!confirm("Снять лот и вернуть питомца?")) return;
    d.ref("auction/lots/"+lotId).once("value").then(function(s){
      var lot=s.val();
      if(!lot||lot.sellerId!==uid||lot.status!=="open"){ alert("Нельзя снять"); return; }
      if(typeof petTotalCount==="function"&&petTotalCount()>=5){ alert("Хранилище заполнено"); return; }
      if(typeof petsState!=="undefined"){
        petsState.storage.push({ id:(typeof petGenerateId==="function"?petGenerateId():Date.now()), type:lot.petType });
      }
      d.ref("auction/lots/"+lotId).remove().then(function(){
        if(typeof petRenderAll==="function") try{ petRenderAll(); }catch(e){}
        if(typeof saveGame==="function") try{ saveGame(); }catch(e){}
      });
    });
  }

  function processPending(){
    var d=fb(), uid=me(); if(!d||!uid) return;
    d.ref("users/"+uid+"/pendingCoins").once("value").then(function(s){
      var a=s.val()||0;
      if(a>0&&typeof coins!=="undefined"){
        coins+=a; if(typeof totalEarned!=="undefined") totalEarned+=a;
        d.ref("users/"+uid+"/pendingCoins").remove();
        if(typeof updateUI==="function") try{ updateUI(); }catch(e){}
        if(typeof saveGame==="function") try{ saveGame(); }catch(e){}
        alert("💰 Получено "+fmt(a)+" монет с продажи");
      }
    });
  }

  function bindTabs(){
    var mt=byId("auction-my-btn"), mk=byId("auction-market-btn");
    if(mt) mt.onclick=function(){
      document.querySelectorAll(".auction-tab-btn").forEach(function(x){ x.classList.remove("active"); });
      mt.classList.add("active");
      var p1=byId("auction-my-pane"), p2=byId("auction-market-pane");
      if(p1) p1.classList.remove("hidden");
      if(p2) p2.classList.add("hidden");
    };
    if(mk) mk.onclick=function(){
      document.querySelectorAll(".auction-tab-btn").forEach(function(x){ x.classList.remove("active"); });
      mk.classList.add("active");
      var p1=byId("auction-my-pane"), p2=byId("auction-market-pane");
      if(p1) p1.classList.add("hidden");
      if(p2) p2.classList.remove("hidden");
    };
    document.querySelectorAll(".auction-filter").forEach(function(b){
      b.onclick=function(){
        document.querySelectorAll(".auction-filter").forEach(function(x){ x.classList.remove("active"); });
        b.classList.add("active"); CURRENT_FILTER=b.dataset.af||"all"; renderMarket();
      };
    });
  }

  function bind(){
    bindTabs();
    var cb=byId("auction-create-btn"); if(cb) cb.onclick=openCreate;
    var sub=byId("auction-create-submit"); if(sub) sub.onclick=submitLot;
    var can=byId("auction-create-cancel"); if(can) can.onclick=function(){
      var m=byId("modal-auction-create"); if(m) m.classList.add("hidden");
    };
    loadLots();
    setTimeout(processPending, 2500);
    console.log("[auction v1] OK");
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 900); });
  } else { setTimeout(bind, 900); }
  window.addEventListener("load", function(){ setTimeout(bind, 1800); });
})();
