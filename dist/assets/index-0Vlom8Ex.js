(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function o(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(r){if(r.ep)return;r.ep=!0;const a=o(r);fetch(r.href,a)}})();class d extends Error{}d.prototype.name="InvalidTokenError";function L(e){return decodeURIComponent(atob(e).replace(/(.)/g,(n,o)=>{let t=o.charCodeAt(0).toString(16).toUpperCase();return t.length<2&&(t="0"+t),"%"+t}))}function I(e){let n=e.replace(/-/g,"+").replace(/_/g,"/");switch(n.length%4){case 0:break;case 2:n+="==";break;case 3:n+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return L(n)}catch{return atob(n)}}function k(e,n){if(typeof e!="string")throw new d("Invalid token specified: must be a string");n||(n={});const o=n.header===!0?0:1,t=e.split(".")[o];if(typeof t!="string")throw new d(`Invalid token specified: missing part #${o+1}`);let r;try{r=I(t)}catch(a){throw new d(`Invalid token specified: invalid base64 for part #${o+1} (${a.message})`)}try{return JSON.parse(r)}catch(a){throw new d(`Invalid token specified: invalid json for part #${o+1} (${a.message})`)}}const O="LOAD_STYLES",A="UNLOAD_STYLES",T="STORE_ACCESS_TOKEN",w="REMOVE_ACCESS_TOKEN",y="https://api.clocktower.ge/v1/";let v={PLAYER:"player",STORYTELLER:"storyteller",SPECTATOR:"spectator"},C={game:null,session:null,bocToken:null,bocId:null,userType:null,players:[],storytellers:[],spectators:[]},s=C,i=document.querySelector(".wrapper"),g=document.getElementById("style"),u=document.getElementById("translate"),m=document.getElementById("background");chrome.storage.local.get(["styleLoaded"],function(e){e.styleLoaded&&(g.checked=!0)});chrome.storage.local.get(["translate"],function(e){e.translate&&(u.checked=!0)});chrome.storage.local.get(["background"],function(e){e.background&&(m.checked=!0)});g.addEventListener("change",function(){g.checked?(chrome.storage.local.set({styleLoaded:1}),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:O})})):(chrome.storage.local.set({styleLoaded:0}),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:A})}))});u.addEventListener("change",function(){chrome.storage.local.set({translate:Number(u.checked)}),chrome.runtime.sendMessage({translate:u.checked})});m.addEventListener("change",function(){chrome.storage.local.set({background:Number(m.checked)}),m.checked?f(function(){localStorage.setItem("background","https://api.clocktower.ge/v1/background"),window.location.reload()}):f(function(){localStorage.removeItem("background"),window.location.reload()})});chrome.runtime.onMessage.addListener(function(e,n,o){console.log("localStorage change detected",e.data),e.gameEnded&&console.log("localStorage change detected",e.data)});f(function(){return{token:localStorage.getItem("token"),game:JSON.parse(localStorage.getItem("game")),players:JSON.parse(localStorage.getItem("players")),storytellers:JSON.parse(localStorage.getItem("storytellers")),session:localStorage.getItem("session"),playerNames:[...document.querySelectorAll(".nameplate span")].map(e=>e.textContent)}},function(e){N(e)});function N(e){let{token:n,game:o,players:t,storytellers:r,session:a,playerNames:c}=e;if(!n){S("You must be logged in to rate players.");return}s.bocToken=n,s.bocId=k(n).id,s.game=o,s.players=t,s.session=a,s.storytellers=r,s.playerNames=c,t.find(l=>l.id===s.bocId)?s.userType=v.PLAYER:r.find(l=>l.id===s.bocId)&&(s.userType=v.STORYTELLER),x()?E():b()}function x(){let e=localStorage.getItem("accessToken");if(e){if(e==="undefined")return localStorage.removeItem("accessToken"),!1;if(k(e).exp>Date.now())return!0;localStorage.removeItem("accessToken")}return!1}function b(){i.innerHTML="";let e=document.createElement("div");e.classList.add("auth-container");let n=document.createElement("div"),o=document.createElement("label");o.textContent="username",o.for="username";let t=document.createElement("input");t.setAttribute("name","username"),t.setAttribute("id","username"),n.appendChild(o),n.appendChild(t);let r=document.createElement("div"),a=document.createElement("label");a.textContent="password",a.for="password";let c=document.createElement("input");c.setAttribute("type","password"),c.setAttribute("name","password"),c.setAttribute("id","password"),r.appendChild(a),r.appendChild(c);let l=document.createElement("div"),p=document.createElement("button");p.textContent="Login";let h=document.createElement("button");h.textContent="Register",l.appendChild(p),l.appendChild(h),e.appendChild(n),e.appendChild(r),e.appendChild(l),i.appendChild(e),p.addEventListener("click",()=>R(t.value,c.value,s.bocId)),h.addEventListener("click",()=>_(t.value,c.value,s.bocId))}function R(e,n,o){fetch(y+"auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:n,bocId:o})}).then(t=>t.json()).then(t=>{if(t.status==="fail")throw new Error(t.message);localStorage.setItem("accessToken",t.accessToken),chrome.tabs.query({active:!0,currentWindow:!0},function(r){chrome.tabs.sendMessage(r[0].id,{action:T,token:t.accessToken})}),E()}).catch(t=>{alert("Error: "+t.message)})}function _(e,n,o){fetch(y+"auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:n,bocId:o})}).then(t=>t.json()).then(t=>{if(t.status==="fail")throw new Error(t.message);localStorage.setItem("accessToken",t.accessToken),chrome.tabs.query({active:!0,currentWindow:!0},function(r){chrome.tabs.sendMessage(r[0].id,{action:T,token:t.accessToken})}),E()}).catch(t=>{alert("Error: "+t.message)})}function M(e,n){return fetch(y+"vote",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"JWT "+localStorage.getItem("accessToken")||""},body:JSON.stringify({gameId:e,receiverId:n})}).then(o=>(o.ok||(o.status===401||o.status===403?(localStorage.removeItem("accessToken"),chrome.tabs.query({active:!0,currentWindow:!0},function(t){chrome.tabs.sendMessage(t[0].id,{action:w})}),b()):console.log(o)),o.json())).then(o=>{if(o.status==="fail")throw new Error(o.message);alert("Vote sent")}).catch(o=>{alert("Error: "+o.message)})}function P(){localStorage.removeItem("accessToken"),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:w})}),b()}function E(){if(i.innerHTML="",!s.userType){S("You must be a player or storyteller to rate players.");return}let e=document.createElement("span");e.classList.add("logout"),e.textContent="Logout",e.addEventListener("click",P),i.appendChild(e);for(let o in s.players){let t=s.players[o].id,r=s.playerNames[o],a=document.createElement("div");a.classList.add("player");let c=document.createElement("label");c.setAttribute("for",t+"_"+o),c.textContent=r;let l=document.createElement("input");l.type="radio",l.setAttribute("name","vote"),l.value=t,l.id=t+"_"+o,a.appendChild(c),a.appendChild(l),i.appendChild(a)}let n=document.createElement("button");n.textContent="Rate",n.addEventListener("click",Y),i.appendChild(n)}function Y(){let e=document.querySelector('input[name="vote"]:checked');if(!e){alert("Please select a player to vote");return}let n=e.value;M(D(s.game,s.session),n).then(()=>{i.querySelector("button").disabled=!0})}function D(e,n){return(Array.isArray(e.history[0])?e.history[0][0]:e.history[0]).time+":"+n}function f(e,n){chrome.tabs.query({active:!0,currentWindow:!0},function(o){const t=o[0];t&&(t.url.includes("botc.app")?chrome.scripting.executeScript({target:{tabId:t.id},function:e},function(r){n&&n(r[0].result)}):S("You must be on the Blood on the Clocktower website to use this extension."))})}function S(e){i.innerHTML="",i.textContent=e,i.classList.add("error"),s=C}
