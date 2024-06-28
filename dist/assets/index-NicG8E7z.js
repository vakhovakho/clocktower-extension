(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function r(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(n){if(n.ep)return;n.ep=!0;const s=r(n);fetch(n.href,s)}})();class u extends Error{}u.prototype.name="InvalidTokenError";function N(e){return decodeURIComponent(atob(e).replace(/(.)/g,(o,r)=>{let t=r.charCodeAt(0).toString(16).toUpperCase();return t.length<2&&(t="0"+t),"%"+t}))}function x(e){let o=e.replace(/-/g,"+").replace(/_/g,"/");switch(o.length%4){case 0:break;case 2:o+="==";break;case 3:o+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return N(o)}catch{return atob(o)}}function h(e,o){if(typeof e!="string")throw new u("Invalid token specified: must be a string");o||(o={});const r=o.header===!0?0:1,t=e.split(".")[r];if(typeof t!="string")throw new u(`Invalid token specified: missing part #${r+1}`);let n;try{n=x(t)}catch(s){throw new u(`Invalid token specified: invalid base64 for part #${r+1} (${s.message})`)}try{return JSON.parse(n)}catch(s){throw new u(`Invalid token specified: invalid json for part #${r+1} (${s.message})`)}}const R="LOAD_STYLES",M="UNLOAD_STYLES",w="STORE_ACCESS_TOKEN",C="REMOVE_ACCESS_TOKEN",m="https://api.clocktower.ge/v1/";let v={PLAYER:"player",STORYTELLER:"storyteller",SPECTATOR:"spectator"},I={game:null,session:null,bocToken:null,bocId:null,userType:null,players:[],storytellers:[],spectators:[],reportedUsers:[],isModerator:!1},a=I,d=document.querySelector(".wrapper"),E=document.getElementById("style"),p=document.getElementById("translate"),g=document.getElementById("background"),S=document.querySelector(".controls");S.style.display="none";chrome.storage.local.get(["styleLoaded"],function(e){e.styleLoaded&&(E.checked=!0)});chrome.storage.local.get(["translate"],function(e){e.translate&&(p.checked=!0)});chrome.storage.local.get(["background"],function(e){e.background&&(g.checked=!0)});E.addEventListener("change",L);p.addEventListener("change",k);g.addEventListener("change",P);chrome.runtime.onMessage.addListener(function(e,o,r){console.log("localStorage change detected",e.data),e.gameEnded&&console.log("localStorage change detected",e.data)});f(function(){return{token:localStorage.getItem("token"),game:JSON.parse(localStorage.getItem("game")),players:JSON.parse(localStorage.getItem("players")),storytellers:JSON.parse(localStorage.getItem("storytellers")),session:localStorage.getItem("session"),playerNames:[...document.querySelectorAll(".nameplate span")].map(e=>e.textContent)}},function(e){_(e)});function _(e){let{token:o,game:r,players:t,storytellers:n,session:s,playerNames:c}=e;if(!o){T("You must be logged in to rate players.");return}a.bocToken=o,a.bocId=h(o).id,a.game=r,a.players=t,a.session=s,a.storytellers=n,a.playerNames=c,localStorage.getItem("accessToken")&&(a.isModerator=h(localStorage.getItem("accessToken")).moderator,a.isModerator&&A()),t.find(l=>l.id===a.bocId)?a.userType=v.PLAYER:n.find(l=>l.id===a.bocId)&&(a.userType=v.STORYTELLER),Y()?y():O()}function L(){E.checked?(chrome.storage.local.set({styleLoaded:1}),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:R})})):(chrome.storage.local.set({styleLoaded:0}),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:M})}))}function k(){chrome.storage.local.set({translate:Number(p.checked)}),chrome.runtime.sendMessage({translate:p.checked},()=>{f(function(){window.location.reload()})})}function P(){chrome.storage.local.set({background:Number(g.checked)}),g.checked?f(function(){localStorage.setItem("background","https://api.clocktower.ge/v1/background"),window.location.reload()}):f(function(){localStorage.removeItem("background"),window.location.reload()})}function Y(){let e=localStorage.getItem("accessToken");if(e){if(e==="undefined")return localStorage.removeItem("accessToken"),!1;if(h(e).exp>Date.now())return!0;localStorage.removeItem("accessToken")}return!1}function O(){S.style.display="none",d.innerHTML="";let e=document.createElement("div");e.classList.add("auth-container");let o=document.createElement("div"),r=document.createElement("label");r.textContent="username",r.for="username";let t=document.createElement("input");t.setAttribute("name","username"),t.setAttribute("id","username"),o.appendChild(r),o.appendChild(t);let n=document.createElement("div"),s=document.createElement("label");s.textContent="password",s.for="password";let c=document.createElement("input");c.setAttribute("type","password"),c.setAttribute("name","password"),c.setAttribute("id","password"),n.appendChild(s),n.appendChild(c);let l=document.createElement("div"),i=document.createElement("button");i.textContent="Login";let b=document.createElement("button");b.textContent="Register",l.appendChild(i),l.appendChild(b),e.appendChild(o),e.appendChild(n),e.appendChild(l),d.appendChild(e),i.addEventListener("click",()=>j(t.value,c.value,a.bocId)),b.addEventListener("click",()=>D(t.value,c.value,a.bocId))}function j(e,o,r){fetch(m+"auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:o,bocId:r})}).then(t=>t.json()).then(t=>{if(t.status==="fail")throw new Error(t.message);localStorage.setItem("accessToken",t.accessToken),a.isModerator=h(t.accessToken).moderator,a.isModerator&&A(),chrome.tabs.query({active:!0,currentWindow:!0},function(n){chrome.tabs.sendMessage(n[0].id,{action:w,token:t.accessToken})}),L(),k(),y()}).catch(t=>{alert("Error: "+t.message)})}function D(e,o,r){fetch(m+"auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:o,bocId:r})}).then(t=>t.json()).then(t=>{if(t.status==="fail")throw new Error(t.message);localStorage.setItem("accessToken",t.accessToken),chrome.tabs.query({active:!0,currentWindow:!0},function(n){chrome.tabs.sendMessage(n[0].id,{action:w,token:t.accessToken})}),y()}).catch(t=>{alert("Error: "+t.message)})}function U(e,o){return fetch(m+"vote",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"JWT "+localStorage.getItem("accessToken")||""},body:JSON.stringify({gameId:e,receiverId:o})}).then(r=>(r.ok||(r.status===401||r.status===403?(localStorage.removeItem("accessToken"),chrome.tabs.query({active:!0,currentWindow:!0},function(t){chrome.tabs.sendMessage(t[0].id,{action:C})}),O()):console.log(r)),r.json())).then(r=>{if(r.status==="fail")throw new Error(r.message);alert("Vote sent")}).catch(r=>{alert("Error: "+r.message)})}function q(){localStorage.removeItem("accessToken"),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:C}),p.checked=!1,k()})}function y(){S.style.display="block",d.innerHTML="";let e=document.createElement("span");if(e.classList.add("logout"),e.textContent="Logout",e.addEventListener("click",q),d.appendChild(e),!a.userType){T("You must be a player or storyteller to rate players.");return}for(let r in a.players){let t=a.players[r].id,n=a.playerNames[r],s=document.createElement("div");s.classList.add("player");let c=document.createElement("label");c.setAttribute("for",t+"_"+r),c.textContent=n,a.reportedUsers.find(i=>i===t)&&(c.style.color="red");let l=document.createElement("input");if(l.type="radio",l.setAttribute("name","vote"),l.value=t,l.id=t+"_"+r,s.appendChild(c),s.appendChild(l),console.log(a),a.isModerator){let i=document.createElement("button");i.textContent="Report",i.addEventListener("click",()=>J(t)),s.appendChild(i)}d.appendChild(s)}let o=document.createElement("button");o.textContent="Rate",o.addEventListener("click",W),d.appendChild(o)}function J(e){let o=prompt("Please enter the reason for reporting this player","");o===null||o===""||fetch(m+"report",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"JWT "+localStorage.getItem("accessToken")||""},body:JSON.stringify({reportedUserBocId:e,session:a.session,reason:o})}).then(r=>(r.ok||alert("Error: "+r.statusText),r.json())).then(r=>{if(r.status!=="success")throw new Error(r.message);alert("Report Sent")}).catch(r=>{alert("Error: "+r.message)})}function A(){fetch(m+"report/get-all",{method:"GET",headers:{"Content-Type":"application/json",Authorization:"JWT "+localStorage.getItem("accessToken")||""}}).then(e=>(e.ok||alert("Error: "+e.statusText),e.json())).then(e=>{if(e.status!=="success")throw new Error(e.message);a.reportedUsers=e.data,y()}).catch(e=>{alert("Error: "+e.message)})}function W(){let e=document.querySelector('input[name="vote"]:checked');if(!e){alert("Please select a player to vote");return}let o=e.value;U(B(a.game,a.session),o).then(()=>{d.querySelector("button").disabled=!0})}function B(e,o){return(Array.isArray(e.history[0])?e.history[0][0]:e.history[0]).time+":"+o}function f(e,o){chrome.tabs.query({active:!0,currentWindow:!0},function(r){const t=r[0];t&&(t.url.includes("botc.app")?chrome.scripting.executeScript({target:{tabId:t.id},function:e},function(n){o&&o(n[0].result)}):T("You must be on the Blood on the Clocktower website to use this extension."))})}function T(e){let o=document.createElement("div");o.textContent=e,d.appendChild(o),o.classList.add("error"),a=I}
