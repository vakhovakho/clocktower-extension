(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();class i extends Error{}i.prototype.name="InvalidTokenError";function m(e){return decodeURIComponent(atob(e).replace(/(.)/g,(t,n)=>{let o=n.charCodeAt(0).toString(16).toUpperCase();return o.length<2&&(o="0"+o),"%"+o}))}function g(e){let t=e.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return m(t)}catch{return atob(t)}}function y(e,t){if(typeof e!="string")throw new i("Invalid token specified: must be a string");t||(t={});const n=t.header===!0?0:1,o=e.split(".")[n];if(typeof o!="string")throw new i(`Invalid token specified: missing part #${n+1}`);let r;try{r=g(o)}catch(a){throw new i(`Invalid token specified: invalid base64 for part #${n+1} (${a.message})`)}try{return JSON.parse(r)}catch(a){throw new i(`Invalid token specified: invalid json for part #${n+1} (${a.message})`)}}function c(e){wrapper.innerHTML="",wrapper.textContent=e,wrapper.classList.add("error"),state=initialState}const h="LOAD_STYLES",S="UNLOAD_STYLES";let d={PLAYER:"player",STORYTELLER:"storyteller",SPECTATOR:"spectator"},b={userId:null,userType:null,players:[],storytellers:[],spectators:[]},s=b,p=document.querySelector(".wrapper"),u=document.getElementById("style");chrome.storage.local.get(["styleLoaded"],function(e){e.styleLoaded&&(u.checked=!0)});u.addEventListener("change",function(){u.checked?(chrome.storage.local.set({styleLoaded:1}),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:h})})):(chrome.storage.local.set({styleLoaded:0}),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:S})}))});chrome.runtime.onMessage.addListener(function(e,t,n){console.log("localStorage change detected",e.data),e.gameEnded&&console.log("localStorage change detected",e.data)});f(function(){return{token:localStorage.getItem("token"),game:JSON.parse(localStorage.getItem("game")),players:JSON.parse(localStorage.getItem("players")),storytellers:JSON.parse(localStorage.getItem("storytellers")),playerNames:[...document.querySelectorAll(".nameplate span")].map(e=>e.textContent)}},function(e){L(e)});function L(e){let{token:t,game:n,players:o,storytellers:r,playerNames:a}=e;if(!t){c("You must be logged in to use this extension.");return}if(s.userId=y(t).id,s.game=n,s.players=o,s.storytellers=r,s.playerNames=a,o.find(l=>l.id===s.userId)?s.userType=d.PLAYER:r.find(l=>l.id===s.userId)&&(s.userType=d.STORYTELLER),!s.userType){c("You must be a player or storyteller to use this extension.");return}if(n.history[n.history.length-1].type!=="end"){c("The game must be over to use this extension.");return}if(localStorage.getItem("lastVote")&&Number(localStorage.getItem("lastVote"))>Date.now()-1e3*60*30){c("You can only use this extension once every 30 minutes.");return}w()}function w(){for(let t in s.players){let n=s.players[t],o=s.playerNames[t],r=document.createElement("div");r.classList.add("player");let a=document.createElement("label");a.setAttribute("for",n+t),a.textContent=o;let l=document.createElement("input");l.type="radio",l.setAttribute("name","vote"),l.id=n+t,r.appendChild(a),r.appendChild(l),p.appendChild(r)}let e=document.createElement("button");e.textContent="Submit",e.addEventListener("click",E),p.appendChild(e)}function E(){f(function(){let e={};for(let t=0;t<localStorage.length;t++){let n=localStorage.key(t),o=localStorage.getItem(n);(o.startsWith("{")||o.startsWith("["))&&(o=JSON.parse(o)),e[n]=o}return e},function(e){localStorage.setItem("lastVote",Date.now()),console.log(e)})}function f(e,t){chrome.tabs.query({active:!0,currentWindow:!0},function(n){const o=n[0];o&&(o.url.includes("online.bloodontheclocktower.com")?chrome.scripting.executeScript({target:{tabId:o.id},function:e},function(r){t&&t(r[0].result)}):c("You must be on the Blood on the Clocktower website to use this extension."))})}
