(function(){
  "use strict";
  function byId(id){ return document.getElementById(id); }
  function show(id){ var m=byId(id); if(m) m.classList.remove("hidden"); }
  function bind(){
    var cb=byId("clan-side-btn");
    if(cb) cb.onclick=function(e){ e.preventDefault(); show("modal-clans"); };
    var db=byId("dm-side-btn");
    if(db) db.onclick=function(e){ e.preventDefault(); show("modal-dm"); };
    var al=byId("almanac-btn");
    if(al) al.onclick=function(e){ e.preventDefault(); show("modal-almanac"); };
    console.log("[mod v1] bind OK");
  }
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(bind, 800); });
  } else {
    setTimeout(bind, 800);
  }
  window.addEventListener("load", function(){ setTimeout(bind, 1500); });
})();
