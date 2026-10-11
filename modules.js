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
/* ==== Krochlupic Competitions v1 ==== */
(function(){
  "use strict";
  function byId(id){ return document.getElementById(id); }
  function fb(){ if(typeof db!=="undefined"&&db) return db; if(typeof firebase!=="undefined"&&firebase.database) return firebase.database(); return null; }
  function me(){ return (typeof profile!=="undefined"&&profile&&profile.id)||""; }
  function myNick(){ return (typeof profile!=="undefined"&&profile&&profile.nickname)||"Аноним"; }
  function fmt(n){ if(typeof formatNumber==="function") return formatNumber(n); return String(Math.floor(n||0)); }

  var roomCode=null, myRole=null, compRef=null, roomData=null;
  var myTaps=0, tickTimer=null, tapPushTimer=null, isTapping=false, duration=10;

  function genCode(){
    var abc="ABCDEFGHJKMNPQRSTUVWXYZ23456789", s="";
    for(var i=0;i<4;i++) s+=abc[Math.floor(Math.random()*abc.length)];
    return s;
  }

  function openRoom(code, role){
    roomCode=code; myRole=role; myTaps=0;
    var mMain=byId("comp-main"), mWait=byId("comp-waiting");
    if(role==="host"){
      if(mMain) mMain.classList.add("hidden");
      if(mWait) mWait.classList.remove("hidden");
      var rc=byId("comp-room-code"); if(rc) rc.textContent=code;
    }
    var d=fb(); if(!d) return;
    if(compRef) compRef.off();
    compRef=d.ref("competitions/"+code);
    compRef.on("value", function(s){
      var data=s.val();
      if(!data){ leave(); return; }
      roomData=data;
      onRoom(data);
    });
  }

  function onRoom(data){
    if(myRole==="host"&&data.status==="waiting"&&data.guest){
      fb().ref("competitions/"+roomCode).update({
        status:"playing",
        startedAt: Date.now()+3000
      });
    }
    if(data.status==="playing" && !tickTimer){
      var mWait=byId("comp-waiting"); if(mWait) mWait.classList.add("hidden");
      var mMain=byId("comp-main"); if(mMain) mMain.classList.add("hidden");
      var mm=byId("modal-competition"); if(mm) mm.classList.remove("hidden");
      var mn=byId("comp-me-name"); if(mn) mn.textContent=myNick();
      var on=byId("comp-opp-name");
      if(on) on.textContent=(myRole==="host"?data.guestNick:data.hostNick)||"???";
      startTicking(data);
    }
    if(data.status==="finished") showResult(data);
  }

  function startTicking(data){
    var dur=data.duration||10;
    var startAt=data.startedAt||Date.now();
    var btn=byId("comp-tap-btn"); if(btn) btn.disabled=true;
    isTapping=false;
    var started=false;

    tickTimer=setInterval(function(){
      var el=(Date.now()-startAt)/1000;
      if(el<0){
        var cd=byId("comp-countdown"), cn=byId("comp-countdown-num");
        if(cd) cd.classList.remove("hidden");
        if(cn) cn.textContent=Math.ceil(-el);
        return;
      }
      if(!started){
        started=true; isTapping=true;
        var cd2=byId("comp-countdown"); if(cd2) cd2.classList.add("hidden");
        if(btn) btn.disabled=false;
      }
      var rem=Math.max(0,dur-el);
      var tm=byId("comp-timer"); if(tm) tm.textContent=rem.toFixed(1);
      if(rem<=0){
        clearInterval(tickTimer); tickTimer=null; isTapping=false;
        if(btn) btn.disabled=true;
        if(myRole==="host"&&roomData&&roomData.status==="playing") finalize();
      }
    },100);

    if(tapPushTimer) clearInterval(tapPushTimer);
    tapPushTimer=setInterval(function(){
      if(!roomCode||!myRole) return;
      var d=fb(); if(!d) return;
      var f=(myRole==="host")?"hostScore":"guestScore";
      d.ref("competitions/"+roomCode+"/"+f).set(myTaps);
    },500);
  }

  function finalize(){
    var d=fb(); if(!d||!roomCode) return;
    d.ref("competitions/"+roomCode).once("value").then(function(s){
      var data=s.val()||{};
      var hs=data.hostScore||0, gs=data.guestScore||0;
      var winner=null;
      if(hs>gs) winner=data.host; else if(gs>hs) winner=data.guest;
      d.ref("competitions/"+roomCode).update({
        status:"finished", winner:winner, finishedAt:Date.now()
      });
    });
  }

  function showResult(data){
    isTapping=false;
    if(tickTimer){ clearInterval(tickTimer); tickTimer=null; }
    if(tapPushTimer){ clearInterval(tapPushTimer); tapPushTimer=null; }
    if(compRef){ compRef.off(); compRef=null; }

    var hs=data.hostScore||0, gs=data.guestScore||0;
    var myS=(myRole==="host")?hs:gs, opS=(myRole==="host")?gs:hs;
    var title="🤝 НИЧЬЯ", cls="tie", delta=0;
    if(myS>opS){ title="🏆 ПОБЕДА!"; cls="win"; delta=Math.floor(coins*0.01); }
    else if(myS<opS){ title="💀 ПОРАЖЕНИЕ"; cls="lose"; delta=-Math.floor(coins*0.01); }

    var t=byId("comp-result-title"), x=byId("comp-result-text"), r=byId("comp-result");
    if(t){ t.textContent=title; t.className="comp-result-title "+cls; }
    if(x) x.textContent="Твои тапы: "+myS+"\nСоперник: "+opS+
      (delta>0?"\n\n💰 +"+fmt(delta):delta<0?"\n\n💸 "+fmt(delta):"");
    if(r) r.classList.remove("hidden");

    if(delta!==0&&typeof coins!=="undefined"){
      coins+=delta; if(delta>0&&typeof totalEarned!=="undefined") totalEarned+=delta;
      if(typeof updateUI==="function") try{ updateUI(); }catch(e){}
      if(typeof saveGame==="function") try{ saveGame(); }catch(e){}
    }
    if(myS>opS&&typeof unlocked!=="undefined"){
      unlocked._compWins=(unlocked._compWins||0)+1;
    }
  }

  function leave(){
    if(tickTimer){ clearInterval(tickTimer); tickTimer=null; }
    if(tapPushTimer){ clearInterval(tapPushTimer); tapPushTimer=null; }
    if(compRef){ compRef.off(); compRef=null; }
    isTapping=false;
    if(roomCode&&myRole==="host"){
      var d=fb(); if(d) d.ref("competitions/"+roomCode).remove();
    }
    roomCode=null; myRole=null; roomData=null;
    var mm=byId("modal-competition"); if(mm) mm.classList.add("hidden");
    var mMain=byId("comp-main"); if(mMain) mMain.classList.remove("hidden");
    var mWait=byId("comp-waiting"); if(mWait) mWait.classList.add("hidden");
    var r=byId("comp-result"); if(r) r.classList.add("hidden");
    var cd=byId("comp-countdown"); if(cd) cd.classList.add("hidden");
  }

  function createRoom(){
    var d=fb(), uid=me(); if(!d||!uid) return;
    var code=genCode();
    d.ref("competitions/"+code).set({
      host:uid, hostNick:myNick(), guest:null, guestNick:null,
      duration:duration, status:"waiting", startedAt:0,
      hostScore:0, guestScore:0, createdAt:Date.now()
    }).then(function(){ openRoom(code,"host"); });
  }

  function joinRoom(code){
    var d=fb(), uid=me(); if(!d||!uid) return;
    code=(code||"").toUpperCase().trim();
    if(code.length!==4){ alert("Код 4 символа"); return; }
    d.ref("competitions/"+code).once("value").then(function(s){
      var r=s.val();
      if(!r){ alert("Комната не найдена"); return; }
      if(r.host===uid){ alert("Это твоя комната"); return; }
      if(r.guest&&r.guest!==uid){ alert("Комната занята"); return; }
      if(r.status!=="waiting"){ alert("Игра уже идёт"); return; }
      d.ref("competitions/"+code).update({
        guest:uid, guestNick:myNick()
      }).then(function(){ openRoom(code,"guest"); });
    });
  }

  function quickPlay(){
    var d=fb(); if(!d){ alert("Firebase недоступен"); return; }
    d.ref("competitions").once("value").then(function(s){
      var all=s.val()||{}, uid=me(), found=null;
      Object.keys(all).forEach(function(c){
        var r=all[c];
        if(r&&r.status==="waiting"&&r.host!==uid&&!r.guest) found=c;
      });
      if(found) joinRoom(found);
      else alert("Нет свободных комнат. Создай свою и жди друга.");
    });
  }

  function onTap(){
    if(!isTapping) return;
    myTaps++;
    var el=byId("comp-me-taps"); if(el) el.textContent=myTaps;
    if(typeof vibrate==="function") try{ vibrate(5); }catch(e){}
  }

  function bind(){
    var q=byId("comp-quick-btn"); if(q) q.onclick=quickPlay;
    var c=byId("comp-create-btn"); if(c) c.onclick=createRoom;
    var j=byId("comp-join-btn"); if(j) j.onclick=function(){
      var i=byId("comp-code-input"); joinRoom(i?i.value:"");
    };
    var cc=byId("comp-copy-code"); if(cc) cc.onclick=function(){
      var r=byId("comp-room-code"); if(!r) return;
      try{ navigator.clipboard.writeText(r.textContent); }catch(e){}
      alert("📋 "+r.textContent);
    };
    var cn=byId("comp-cancel-btn"); if(cn) cn.onclick=leave;
    var tb=byId("comp-tap-btn"); if(tb) tb.onclick=onTap;
    var lv=byId("comp-leave-btn"); if(lv) lv.onclick=leave;
    var rc=byId("comp-result-close"); if(rc) rc.onclick=leave;

    document.querySelectorAll(".comp-dur-btn").forEach(function(b){
      b.onclick=function(){
        document.querySelectorAll(".comp-dur-btn").forEach(function(x){ x.classList.remove("active"); });
        b.classList.add("active"); duration=parseInt(b.dataset.dur,10)||10;
      };
    });

    console.log("[comp v1] OK");
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 900); });
  } else { setTimeout(bind, 900); }
  window.addEventListener("load", function(){ setTimeout(bind, 1800); });
})();
/* ==== Krochlupic Season v1 ==== */
(function(){
  "use strict";
  function byId(id){ return document.getElementById(id); }
  function fb(){ if(typeof db!=="undefined"&&db) return db; if(typeof firebase!=="undefined"&&firebase.database) return firebase.database(); return null; }
  function me(){ return (typeof profile!=="undefined"&&profile&&profile.id)||""; }
  function myNick(){ return (typeof profile!=="undefined"&&profile&&profile.nickname)||"Аноним"; }
  function fmt(n){ if(typeof formatNumber==="function") return formatNumber(n); return String(Math.floor(n||0)); }

  function seasonId(){
    var d=new Date();
    return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2);
  }
  function daysLeft(){
    var d=new Date();
    var end=new Date(d.getFullYear(), d.getMonth()+1, 1);
    return Math.ceil((end-d)/(24*60*60*1000));
  }

  function pushScore(){
    var d=fb(), uid=me(); if(!d||!uid) return;
    var score=(typeof totalEarned!=="undefined")?totalEarned:0;
    d.ref("seasons/"+seasonId()+"/"+uid).set({
      nickname:myNick(), score:score, ts:Date.now()
    });
  }

  function updateHeader(){
    var sc=byId("season-score"), tl=byId("season-time-left");
    if(sc) sc.textContent=fmt((typeof totalEarned!=="undefined")?totalEarned:0);
    if(tl) tl.textContent=daysLeft()+" д";
  }

  function bind(){
    updateHeader();
    pushScore();
    setInterval(updateHeader, 5000);
    setInterval(pushScore, 60000);
    console.log("[season v1] OK");
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 1500); });
  } else { setTimeout(bind, 1500); }
})();
/* ==== Krochlupic FNF v1 ==== */
(function(){
  "use strict";
  function byId(id){ return document.getElementById(id); }
  function fb(){ if(typeof db!=="undefined"&&db) return db; if(typeof firebase!=="undefined"&&firebase.database) return firebase.database(); return null; }
  function fmt(n){ if(typeof formatNumber==="function") return formatNumber(n); return String(Math.floor(n||0)); }

  // Настройки игры
  var BPM = 120;             // скорость музыки
  var BEATS_PER_ARROW = 1;   // через сколько бит летит стрелка
  var FALL_TIME = 1.8;       // сколько секунд стрелка летит до линии (сек)
  var DURATION = 60;         // длительность битвы (сек)
  var HIT_WINDOW = 0.18;     // окно попадания (сек) — чем меньше, тем строже
  var MAX_HP = 50;
  var DIRS = ["left","up","down","right"];
  var SYM = { left:"◀", up:"▲", down:"▼", right:"▶" };

  // Состояние
  var running = false;
  var hp = MAX_HP;
  var score = 0;
  var combo = 0;
  var maxCombo = 0;
  var misses = 0;
  var timeLeft = 0;
  var arrows = [];           // {dir, spawnAt, hitY}
  var rafId = null;
  var lastTick = 0;
  var nextSpawnAt = 0;
  var lastPlayedAt = 0;
  var COOLDOWN_MS = 5*60*1000;
  var LANE_X = { left:0.12, up:0.37, down:0.62, right:0.87 };
  var HIT_LINE_Y = 0.78;

  function cf(){
    try{ return JSON.parse(localStorage.getItem("clicker-settings")||"{}"); }catch(e){ return {}; }
  }

  function canPlay(){
    var last=parseInt(localStorage.getItem("fnfLastPlayed")||"0",10);
    return Date.now() - last >= COOLDOWN_MS;
  }
  function cooldownLeft(){
    var last=parseInt(localStorage.getItem("fnfLastPlayed")||"0",10);
    var left=COOLDOWN_MS - (Date.now()-last);
    return left>0 ? left : 0;
  }
  function updateCooldownUI(){
    var el=byId("fnf-cooldown"); if(!el) return;
    if(canPlay()){ el.textContent=""; return; }
    var s=Math.ceil(cooldownLeft()/1000);
    var m=Math.floor(s/60); s=s%60;
    el.textContent="⏳ Следующая битва через "+m+":"+(s<10?"0":"")+s;
  }

  function openFnf(){
    var ov=byId("fnf-overlay"); if(!ov) return;
    ov.classList.remove("hidden");
    if(typeof syncScrollLock==="function") try{ syncScrollLock(); }catch(e){}
    resetUI();
    updateCooldownUI();
    var sb=byId("fnf-start-block"); if(sb) sb.classList.remove("hidden");
    var r=byId("fnf-result"); if(r) r.classList.add("hidden");
    var btn=byId("fnf-start-btn"); if(btn) btn.disabled=!canPlay();
  }

  function closeFnf(){
    if(running) stop(false);
    var ov=byId("fnf-overlay"); if(ov) ov.classList.add("hidden");
    if(typeof syncScrollLock==="function") try{ syncScrollLock(); }catch(e){}
  }

  function resetUI(){
    hp=MAX_HP; score=0; combo=0; maxCombo=0; misses=0; arrows=[];
    var h=byId("fnf-hp"); if(h) h.textContent=hp+" / "+MAX_HP;
    var s=byId("fnf-score"); if(s) s.textContent="0";
    var c=byId("fnf-combo"); if(c) c.textContent="0×";
    var m=byId("fnf-miss"); if(m) m.textContent="0";
    var t=byId("fnf-time-left"); if(t) t.textContent=DURATION.toFixed(1);
    var z=byId("fnf-zone"); if(z) z.innerHTML="";
  }

  function startFnf(){
    if(!canPlay()){ alert("Слишком рано"); return; }
    running=true;
    resetUI();
    lastPlayedAt=Date.now();
    try{ localStorage.setItem("fnfLastPlayed", lastPlayedAt.toString()); }catch(e){}
    timeLeft=DURATION;
    lastTick=performance.now();
    nextSpawnAt=lastTick+800;
    var sb=byId("fnf-start-block"); if(sb) sb.classList.add("hidden");
    var r=byId("fnf-result"); if(r) r.classList.add("hidden");
    var btn=byId("fnf-start-btn"); if(btn) btn.disabled=true;
    if(typeof playSound==="function") try{ playSound("ui"); }catch(e){}
    if(rafId) cancelAnimationFrame(rafId);
    rafId=requestAnimationFrame(tick);
  }

  function stop(showResult){
    running=false;
    if(rafId){ cancelAnimationFrame(rafId); rafId=null; }
    var z=byId("fnf-zone"); if(z) z.innerHTML="";
    if(showResult) showResultScreen();
    var sb=byId("fnf-start-block"); if(sb) sb.classList.remove("hidden");
    var btn=byId("fnf-start-btn"); if(btn) btn.disabled=!canPlay();
    updateCooldownUI();
  }

  function tick(now){
    if(!running) return;
    var dt=(now-lastTick)/1000;
    lastTick=now;
    timeLeft-=dt;
    if(timeLeft<=0){ timeLeft=0; updateHUD(); stop(true); return; }

    // Спавн стрелок
    var beatMs = 60000 / BPM * BEATS_PER_ARROW;
    if(now >= nextSpawnAt){
      var dir = DIRS[Math.floor(Math.random()*4)];
      arrows.push({ dir:dir, spawnAt:now });
      nextSpawnAt = now + beatMs;
    }

    // Проверяем промахи (стрелка улетела ниже)
    var fallMs = FALL_TIME * 1000;
    var toKeep = [];
    for(var i=0;i<arrows.length;i++){
      var a=arrows[i];
      var age = now - a.spawnAt;
      if(age > fallMs + HIT_WINDOW*1000){
        // промах
        misses++;
        combo=0;
        hp--;
        if(typeof playSound==="function") try{ playSound("ui"); }catch(e){}
        if(hp<=0){ updateHUD(); lose(); return; }
      } else {
        toKeep.push(a);
      }
    }
    arrows=toKeep;

    drawArrows(now);
    updateHUD();
    rafId=requestAnimationFrame(tick);
  }

  function drawArrows(now){
    var zone=byId("fnf-zone"); if(!zone) return;
    var fallMs = FALL_TIME*1000;
    var W = zone.clientWidth || 300;
    var H = zone.clientHeight || 400;
    var html="";
    for(var i=0;i<arrows.length;i++){
      var a=arrows[i];
      var age = now - a.spawnAt;
      var pct = age / fallMs;
      var top = pct * HIT_LINE_Y * 100;
      var left = (LANE_X[a.dir]*100);
      var col = "#c9a0ff";
      html += '<div style="position:absolute;left:'+left+'%;top:'+top+'%;transform:translate(-50%,-50%);font-size:36px;color:'+col+';text-shadow:0 0 12px rgba(201,160,255,.9);pointer-events:none">'+SYM[a.dir]+'</div>';
    }
    zone.innerHTML=html;
  }

  function updateHUD(){
    var h=byId("fnf-hp"); if(h) h.textContent=Math.max(0,hp)+" / "+MAX_HP;
    var s=byId("fnf-score"); if(s) s.textContent=score;
    var c=byId("fnf-combo"); if(c) c.textContent=combo+"×";
    var m=byId("fnf-miss"); if(m) m.textContent=misses;
    var t=byId("fnf-time-left"); if(t) t.textContent=timeLeft.toFixed(1);
  }

  function pressLane(dir){
    if(!running) return;
    var now = performance.now();
    var fallMs = FALL_TIME*1000;
    var best=null, bestD=9999;
    for(var i=0;i<arrows.length;i++){
      var a=arrows[i];
      if(a.dir!==dir) continue;
      var age = now - a.spawnAt;
      var d = Math.abs(age - fallMs);
      if(d < bestD){ bestD=d; best=a; }
    }
    var el = document.querySelector('.fnf-arrow-btn[data-fnf-dir="'+dir+'"]');
    if(best && bestD <= HIT_WINDOW*1000){
      // попадание
      arrows = arrows.filter(function(x){ return x!==best; });
      combo++; if(combo>maxCombo) maxCombo=combo;
      var pts = 10 + Math.min(30, combo*2);
      score += pts;
      if(el){ el.classList.add("hit"); setTimeout(function(){ el.classList.remove("hit"); }, 120); }
      if(typeof vibrate==="function") try{ vibrate(10); }catch(e){}
      if(typeof playSound==="function") try{ playSound("click"); }catch(e){}
    } else {
      // промах по нажатию
      combo=0;
      hp--;
      if(el){ el.classList.add("miss"); setTimeout(function(){ el.classList.remove("miss"); }, 150); }
      if(typeof playSound==="function") try{ playSound("ui"); }catch(e){}
      if(hp<=0){ updateHUD(); lose(); return; }
    }
    updateHUD();
  }

  function win(){
    running=false;
    if(rafId){ cancelAnimationFrame(rafId); rafId=null; }
    var d=fb();
    var rewards=[];
    var rw_coins = Math.max(500, Math.floor(score*50));
    rewards.push("🪙 +"+fmt(rw_coins)+" монет");
    if(typeof coins!=="undefined"){ coins+=rw_coins; if(typeof totalEarned!=="undefined") totalEarned+=rw_coins; }
    var rw_gems = Math.min(20, Math.floor(score/40));
    if(rw_gems>0){ if(typeof addCrystals==="function") try{ addCrystals(rw_gems); }catch(e){}
      rewards.push("💎 +"+rw_gems+" кристаллов"); }
    var rw_shards = Math.min(15, Math.floor(maxCombo/3));
    if(rw_shards>0){ if(typeof shards!=="undefined") shards+=rw_shards;
      rewards.push("🌑 +"+rw_shards+" осколков"); }
    if(misses===0 && typeof unlocked!=="undefined"){
      unlocked._fnfPerfect=true;
    }
    if(typeof updateUI==="function") try{ updateUI(); }catch(e){}
    if(typeof saveGame==="function") try{ saveGame(); }catch(e){}
    showResult("win","🏆 ПОБЕДА!",
      "Ты продержался до конца!\n\n🎵 Счёт: "+score+
      "\n🔥 Макс. комбо: "+maxCombo+"×"+
      "\n❌ Промахи: "+misses+
      "\n\nНаграды:\n"+rewards.join("\n"));
  }

  function lose(){
    running=false;
    if(rafId){ cancelAnimationFrame(rafId); rafId=null; }
    if(typeof playSound==="function") try{ playSound("ui"); }catch(e){}
    showResult("lose","💀 ПОРАЖЕНИЕ",
      "Крохлюпик победил...\n\n🎵 Счёт: "+score+
      "\n🔥 Макс. комбо: "+maxCombo+"×"+
      "\n❌ Промахи: "+misses);
  }

  function showResult(kind, title, text){
    var t=byId("fnf-result-title"), x=byId("fnf-result-text"), r=byId("fnf-result");
    if(t){ t.textContent=title; t.className=kind; }
    if(x) x.textContent=text;
    if(r) r.classList.remove("hidden");
    var sb=byId("fnf-start-block"); if(sb) sb.classList.add("hidden");
    var btn=byId("fnf-start-btn"); if(btn) btn.disabled=!canPlay();
    updateCooldownUI();
  }

  function bind(){
    var btn=byId("fnf-btn");
    if(btn) btn.onclick=function(){ if(typeof playSound==="function") try{ playSound("ui"); }catch(e){} openFnf(); };
    var start=byId("fnf-start-btn"); if(start) start.onclick=startFnf;
    var close=byId("fnf-close"); if(close) close.onclick=closeFnf;
    var rc=byId("fnf-result-close"); if(rc) rc.onclick=function(){ closeFnf(); };

    document.querySelectorAll(".fnf-arrow-btn").forEach(function(b){
      var dir=b.dataset.fnfDir;
      if(!dir) return;
      b.addEventListener("touchstart", function(e){ e.preventDefault(); pressLane(dir); }, {passive:false});
      b.addEventListener("mousedown", function(e){ e.preventDefault(); pressLane(dir); });
    });

    // Клавиатура для тестов
    document.addEventListener("keydown", function(e){
      if(!running) return;
      if(e.key==="ArrowLeft") pressLane("left");
      if(e.key==="ArrowUp") pressLane("up");
      if(e.key==="ArrowDown") pressLane("down");
      if(e.key==="ArrowRight") pressLane("right");
    });

    updateCooldownUI();
    console.log("[fnf v1] OK");
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 1000); });
  } else { setTimeout(bind, 1000); }
  window.addEventListener("load", function(){ setTimeout(bind, 2000); });
})();
