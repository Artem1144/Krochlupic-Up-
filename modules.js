/* ==== Krochlupic Modules v1 ==== */
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
      d.ref("clans/"+cid).once("value").then(function(cs){
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

  function bind(){
    var cb=byId("clan-side-btn");
    if(cb) cb.onclick=function(e){ e.preventDefault(); openClan(); };
    var db2=byId("dm-side-btn");
    if(db2) db2.onclick=function(e){ e.preventDefault(); show("modal-dm"); };
    var al=byId("almanac-btn");
    if(al) al.onclick=function(e){ e.preventDefault(); show("modal-almanac"); };

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

    console.log("[modules v1] bind OK");
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 800); });
  } else {
    setTimeout(bind, 800);
  }
  window.addEventListener("load", function(){ setTimeout(bind, 1500); });
})();
