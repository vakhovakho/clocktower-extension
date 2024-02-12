(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))e(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&e(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function e(r){if(r.ep)return;r.ep=!0;const a=o(r);fetch(r.href,a)}})();class d extends Error{}d.prototype.name="InvalidTokenError";function E(t){return decodeURIComponent(atob(t).replace(/(.)/g,(n,o)=>{let e=o.charCodeAt(0).toString(16).toUpperCase();return e.length<2&&(e="0"+e),"%"+e}))}function S(t){let n=t.replace(/-/g,"+").replace(/_/g,"/");switch(n.length%4){case 0:break;case 2:n+="==";break;case 3:n+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return E(n)}catch{return atob(n)}}function v(t,n){if(typeof t!="string")throw new d("Invalid token specified: must be a string");n||(n={});const o=n.header===!0?0:1,e=t.split(".")[o];if(typeof e!="string")throw new d(`Invalid token specified: missing part #${o+1}`);let r;try{r=S(e)}catch(a){throw new d(`Invalid token specified: invalid base64 for part #${o+1} (${a.message})`)}try{return JSON.parse(r)}catch(a){throw new d(`Invalid token specified: invalid json for part #${o+1} (${a.message})`)}}const L="LOAD_STYLES",T="UNLOAD_STYLES",h="http://localhost:8000/v1/";let b={PLAYER:"player",STORYTELLER:"storyteller",SPECTATOR:"spectator"},w={loggedIn:!1,bocToken:null,bocId:null,userType:null,players:[],storytellers:[],spectators:[]},l=w,i=document.querySelector(".wrapper"),g=document.getElementById("style");chrome.storage.local.get(["styleLoaded"],function(t){t.styleLoaded&&(g.checked=!0)});g.addEventListener("change",function(){g.checked?(chrome.storage.local.set({styleLoaded:1}),chrome.tabs.query({active:!0,currentWindow:!0},function(t){chrome.tabs.sendMessage(t[0].id,{action:L})})):(chrome.storage.local.set({styleLoaded:0}),chrome.tabs.query({active:!0,currentWindow:!0},function(t){chrome.tabs.sendMessage(t[0].id,{action:T})}))});chrome.runtime.onMessage.addListener(function(t,n,o){console.log("localStorage change detected",t.data),t.gameEnded&&console.log("localStorage change detected",t.data)});x(function(){return{token:localStorage.getItem("token"),game:JSON.parse(localStorage.getItem("game")),players:JSON.parse(localStorage.getItem("players")),storytellers:JSON.parse(localStorage.getItem("storytellers")),playerNames:[...document.querySelectorAll(".nameplate span")].map(t=>t.textContent)}},function(t){I(t)});function I(t){let{token:n,game:o,players:e,storytellers:r,playerNames:a}=t;if(!n){u("You must be logged in to rate players.");return}let s=localStorage.getItem("accessToken");if(l.loggedIn=!!s,l.bocToken=n,l.bocId=v(n).id,l.game=o,l.players=e,l.storytellers=r,l.playerNames=a,e.find(c=>c.id===l.bocId)?l.userType=b.PLAYER:r.find(c=>c.id===l.bocId)&&(l.userType=b.STORYTELLER),!l.userType){u("You must be a player or storyteller to rate players.");return}if(o.history[o.history.length-1].type!=="end"){u("The game must be over to rate players.");return}if(localStorage.getItem("lastVote")&&Number(localStorage.getItem("lastVote"))>Date.now()-1e3*60*30){u("You can rate players once in every 30 minutes.");return}s?y():f()}function f(){i.innerHTML="";let t=document.createElement("div");t.classList.add("auth-container");let n=document.createElement("div"),o=document.createElement("label");o.textContent="username",o.for="username";let e=document.createElement("input");e.setAttribute("name","username"),e.setAttribute("id","username"),n.appendChild(o),n.appendChild(e);let r=document.createElement("div"),a=document.createElement("label");a.textContent="password",a.for="password";let s=document.createElement("input");s.setAttribute("type","password"),s.setAttribute("name","password"),s.setAttribute("id","password"),r.appendChild(a),r.appendChild(s);let c=document.createElement("div"),p=document.createElement("button");p.textContent="Login";let m=document.createElement("button");m.textContent="Register",c.appendChild(p),c.appendChild(m),t.appendChild(n),t.appendChild(r),t.appendChild(c),i.appendChild(t),p.addEventListener("click",()=>C(e.value,s.value,l.bocId)),m.addEventListener("click",()=>k(e.value,s.value,l.bocId))}function C(t,n,o){fetch(h+"auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:n,bocId:o})}).then(e=>(e.ok||alert("something went wrong"),e.json())).then(e=>{localStorage.setItem("accessToken",e.accessToken),y()}).catch(e=>{alert("something went wrong: "+e.message)})}function k(t,n,o){fetch(h+"auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:n,bocId:o})}).then(e=>(e.ok||alert("something went wrong"),e.json())).then(e=>{y(),localStorage.setItem("accessToken",e.accessToken)}).catch(e=>{alert("something went wrong: "+e.message)})}function O(t,n,o){fetch(h+"vote",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"JWT "+localStorage.getItem("accessToken")||""},body:JSON.stringify({senderId:t,senderStatus:n,receiverId:o})}).then(e=>{if(!e.ok)throw(e.status===401||e.status===403)&&(localStorage.removeItem("accessToken"),f()),new Error("Something went wrong");return e.json()}).then(e=>{if(e.status==="error")throw new Error(e.message);alert("Vote sent")}).catch(e=>{alert("Error: "+e.message)})}function A(){localStorage.removeItem("accessToken"),f()}function y(){i.innerHTML="";let t=document.createElement("span");t.classList.add("logout"),t.textContent="Logout",t.addEventListener("click",A),i.appendChild(t);for(let o in l.players){let e=l.players[o].id,r=l.playerNames[o],a=document.createElement("div");a.classList.add("player");let s=document.createElement("label");s.setAttribute("for",e+"_"+o),s.textContent=r;let c=document.createElement("input");c.type="radio",c.setAttribute("name","vote"),c.value=e,c.id=e+"_"+o,a.appendChild(s),a.appendChild(c),i.appendChild(a)}let n=document.createElement("button");n.textContent="Rate",n.addEventListener("click",N),i.appendChild(n)}function N(){let t=document.querySelector('input[name="vote"]:checked');if(!t){alert("Please select a player to vote");return}let n=t.value;O(l.bocId,l.userType,n)}function x(t,n){chrome.tabs.query({active:!0,currentWindow:!0},function(o){const e=o[0];e&&(e.url.includes("online.bloodontheclocktower.com")?chrome.scripting.executeScript({target:{tabId:e.id},function:t},function(r){n&&n(r[0].result)}):u("You must be on the Blood on the Clocktower website to use this extension."))})}function u(t){i.innerHTML="",i.textContent=t,i.classList.add("error"),l=w}