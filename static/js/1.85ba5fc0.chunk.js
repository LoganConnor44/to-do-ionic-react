(this["webpackJsonpto-do-ionic-react"]=this["webpackJsonpto-do-ionic-react"]||[]).push([[1],{322:function(t,n,o){"use strict";o.r(n),o.d(n,"startFocusVisible",(function(){return i}));var e=["Tab","ArrowDown","Space","Escape"," ","Shift","Enter","ArrowLeft","ArrowRight","ArrowUp"],i=function(){var t=[],n=!0,o=document,i=function(n){t.forEach((function(t){return t.classList.remove("ion-focused")})),n.forEach((function(t){return t.classList.add("ion-focused")})),t=n},c=function(){n=!1,i([])};o.addEventListener("keydown",(function(t){(n=e.includes(t.key))||i([])})),o.addEventListener("focusin",(function(t){if(n&&t.composedPath){var o=t.composedPath().filter((function(t){return!!t.classList&&t.classList.contains("ion-focusable")}));i(o)}})),o.addEventListener("focusout",(function(){o.activeElement===o.body&&i([])})),o.addEventListener("touchstart",c),o.addEventListener("mousedown",c)}}}]);
//# sourceMappingURL=1.85ba5fc0.chunk.js.map