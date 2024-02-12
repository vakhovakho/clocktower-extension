(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&t(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(r){if(r.ep)return;r.ep=!0;const a=o(r);fetch(r.href,a)}})();class d extends Error{}d.prototype.name="InvalidTokenError";function L(e){return decodeURIComponent(atob(e).replace(/(.)/g,(n,o)=>{let t=o.charCodeAt(0).toString(16).toUpperCase();return t.length<2&&(t="0"+t),"%"+t}))}function w(e){let n=e.replace(/-/g,"+").replace(/_/g,"/");switch(n.length%4){case 0:break;case 2:n+="==";break;case 3:n+="=";break;default:throw new Error("base64 string is not of the correct length")}try{return L(n)}catch{return atob(n)}}function v(e,n){if(typeof e!="string")throw new d("Invalid token specified: must be a string");n||(n={});const o=n.header===!0?0:1,t=e.split(".")[o];if(typeof t!="string")throw new d(`Invalid token specified: missing part #${o+1}`);let r;try{r=w(t)}catch(a){throw new d(`Invalid token specified: invalid base64 for part #${o+1} (${a.message})`)}try{return JSON.parse(r)}catch(a){throw new d(`Invalid token specified: invalid json for part #${o+1} (${a.message})`)}}const T="LOAD_STYLES",I="UNLOAD_STYLES",y="http://localhost:8000/v1/";let h={PLAYER:"player",STORYTELLER:"storyteller",SPECTATOR:"spectator"},b={loggedIn:!1,bocToken:null,bocId:null,userType:null,players:[],storytellers:[],spectators:[]},l=b,i=document.querySelector(".wrapper"),g=document.getElementById("style");chrome.storage.local.get(["styleLoaded"],function(e){e.styleLoaded&&(g.checked=!0)});g.addEventListener("change",function(){g.checked?(chrome.storage.local.set({styleLoaded:1}),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:T})})):(chrome.storage.local.set({styleLoaded:0}),chrome.tabs.query({active:!0,currentWindow:!0},function(e){chrome.tabs.sendMessage(e[0].id,{action:I})}))});chrome.runtime.onMessage.addListener(function(e,n,o){console.log("localStorage change detected",e.data),e.gameEnded&&console.log("localStorage change detected",e.data)});E(function(){return{token:localStorage.getItem("token"),game:JSON.parse(localStorage.getItem("game")),players:JSON.parse(localStorage.getItem("players")),storytellers:JSON.parse(localStorage.getItem("storytellers")),playerNames:[...document.querySelectorAll(".nameplate span")].map(e=>e.textContent)}},function(e){C(e)});function C(e){let{token:n,game:o,players:t,storytellers:r,playerNames:a}=e;if(!n){u("You must be logged in to rate players.");return}let s=localStorage.getItem("accessToken");if(l.loggedIn=!!s,l.bocToken=n,l.bocId=v(n).id,l.game=o,l.players=t,l.storytellers=r,l.playerNames=a,t.find(c=>c.id===l.bocId)?l.userType=h.PLAYER:r.find(c=>c.id===l.bocId)&&(l.userType=h.STORYTELLER),!l.userType){u("You must be a player or storyteller to rate players.");return}if(o.history[o.history.length-1].type!=="end"){u("The game must be over to rate players.");return}if(localStorage.getItem("lastVote")&&Number(localStorage.getItem("lastVote"))>Date.now()-1e3*60*30){u("You can rate players once in every 30 minutes.");return}s?f():S()}function S(){i.innerHTML="";let e=document.createElement("div");e.classList.add("auth-container");let n=document.createElement("div"),o=document.createElement("label");o.textContent="username",o.for="username";let t=document.createElement("input");t.setAttribute("name","username"),t.setAttribute("id","username"),n.appendChild(o),n.appendChild(t);let r=document.createElement("div"),a=document.createElement("label");a.textContent="password",a.for="password";let s=document.createElement("input");s.setAttribute("type","password"),s.setAttribute("name","password"),s.setAttribute("id","password"),r.appendChild(a),r.appendChild(s);let c=document.createElement("div"),p=document.createElement("button");p.textContent="Login";let m=document.createElement("button");m.textContent="Register",c.appendChild(p),c.appendChild(m),e.appendChild(n),e.appendChild(r),e.appendChild(c),i.appendChild(e),p.addEventListener("click",()=>k(t.value,s.value,l.bocId)),m.addEventListener("click",()=>O(t.value,s.value,l.bocId))}function k(e,n,o){fetch(y+"auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:n,bocId:o})}).then(t=>(t.ok||alert("something went wrong"),t.json())).then(t=>{localStorage.setItem("accessToken",t.accessToken),f()}).catch(t=>{alert("something went wrong: "+t.message)})}function O(e,n,o){fetch(y+"auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:n,bocId:o})}).then(t=>(t.ok||alert("something went wrong"),t.json())).then(t=>{f(),localStorage.setItem("accessToken",t.accessToken)}).catch(t=>{alert("something went wrong: "+t.message)})}function A(){localStorage.removeItem("accessToken"),S()}function f(){i.innerHTML="";let e=document.createElement("span");e.classList.add("logout"),e.textContent="Logout",e.addEventListener("click",A),i.appendChild(e);for(let o in l.players){let t=l.players[o],r=l.playerNames[o],a=document.createElement("div");a.classList.add("player");let s=document.createElement("label");s.setAttribute("for",t+o),s.textContent=r;let c=document.createElement("input");c.type="radio",c.setAttribute("name","vote"),c.id=t+o,a.appendChild(s),a.appendChild(c),i.appendChild(a)}let n=document.createElement("button");n.textContent="Submit",n.addEventListener("click",N),i.appendChild(n)}function N(){E(function(){let e={};for(let n=0;n<localStorage.length;n++){let o=localStorage.key(n),t=localStorage.getItem(o);(t.startsWith("{")||t.startsWith("["))&&(t=JSON.parse(t)),e[o]=t}return e},function(e){localStorage.setItem("lastVote",Date.now()),console.log(e)})}function E(e,n){chrome.tabs.query({active:!0,currentWindow:!0},function(o){const t=o[0];t&&(t.url.includes("online.bloodontheclocktower.com")?chrome.scripting.executeScript({target:{tabId:t.id},function:e},function(r){n&&n(r[0].result)}):u("You must be on the Blood on the Clocktower website to use this extension."))})}function u(e){i.innerHTML="",i.textContent=e,i.classList.add("error"),l=b}
