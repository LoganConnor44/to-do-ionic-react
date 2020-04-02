(this["webpackJsonpionic-five-react-to-list-app"]=this["webpackJsonpionic-five-react-to-list-app"]||[]).push([[26],{219:function(i,t,e){"use strict";e.r(t),e.d(t,"ion_loading",(function(){return g}));var n=e(3),o=e(46),r=e(11),a=(e(33),e(31)),s=e(37),c=e(308),d=e(309),l=function(i){var t=Object(a.a)(),e=Object(a.a)(),n=Object(a.a)();return e.addElement(i.querySelector("ion-backdrop")).fromTo("opacity",.01,.3),n.addElement(i.querySelector(".loading-wrapper")).keyframes([{offset:0,opacity:.01,transform:"scale(1.1)"},{offset:1,opacity:1,transform:"scale(1)"}]),t.addElement(i).easing("ease-in-out").duration(200).addAnimation([e,n])},u=function(i){var t=Object(a.a)(),e=Object(a.a)(),n=Object(a.a)();return e.addElement(i.querySelector("ion-backdrop")).fromTo("opacity",.3,0),n.addElement(i.querySelector(".loading-wrapper")).keyframes([{offset:0,opacity:.99,transform:"scale(1)"},{offset:1,opacity:0,transform:"scale(0.9)"}]),t.addElement(i).easing("ease-in-out").duration(200).addAnimation([e,n])},p=function(i){var t=Object(a.a)(),e=Object(a.a)(),n=Object(a.a)();return e.addElement(i.querySelector("ion-backdrop")).fromTo("opacity",.01,.32),n.addElement(i.querySelector(".loading-wrapper")).keyframes([{offset:0,opacity:.01,transform:"scale(1.1)"},{offset:1,opacity:1,transform:"scale(1)"}]),t.addElement(i).easing("ease-in-out").duration(200).addAnimation([e,n])},f=function(i){var t=Object(a.a)(),e=Object(a.a)(),n=Object(a.a)();return e.addElement(i.querySelector("ion-backdrop")).fromTo("opacity",.32,0),n.addElement(i.querySelector(".loading-wrapper")).keyframes([{offset:0,opacity:.99,transform:"scale(1)"},{offset:1,opacity:0,transform:"scale(0.9)"}]),t.addElement(i).easing("ease-in-out").duration(200).addAnimation([e,n])},g=function(){function i(i){var t=this;Object(o.l)(this,i),this.presented=!1,this.mode=Object(o.e)(this),this.keyboardClose=!0,this.duration=0,this.backdropDismiss=!1,this.showBackdrop=!0,this.translucent=!1,this.animated=!0,this.onBackdropTap=function(){t.dismiss(void 0,s.a)},Object(s.e)(this.el),this.didPresent=Object(o.d)(this,"ionLoadingDidPresent",7),this.willPresent=Object(o.d)(this,"ionLoadingWillPresent",7),this.willDismiss=Object(o.d)(this,"ionLoadingWillDismiss",7),this.didDismiss=Object(o.d)(this,"ionLoadingDidDismiss",7)}return i.prototype.componentWillLoad=function(){if(void 0===this.spinner){var i=Object(o.e)(this);this.spinner=r.b.get("loadingSpinner",r.b.get("spinner","ios"===i?"lines":"crescent"))}},i.prototype.present=function(){return Object(n.a)(this,void 0,void 0,(function(){var i=this;return Object(n.c)(this,(function(t){switch(t.label){case 0:return[4,Object(s.f)(this,"loadingEnter",l,p,void 0)];case 1:return t.sent(),this.duration>0&&(this.durationTimeout=setTimeout((function(){return i.dismiss()}),this.duration+10)),[2]}}))}))},i.prototype.dismiss=function(i,t){return this.durationTimeout&&clearTimeout(this.durationTimeout),Object(s.g)(this,i,t,"loadingLeave",u,f)},i.prototype.onDidDismiss=function(){return Object(s.h)(this.el,"ionLoadingDidDismiss")},i.prototype.onWillDismiss=function(){return Object(s.h)(this.el,"ionLoadingWillDismiss")},i.prototype.render=function(){var i,t=this.message,e=this.spinner,n=Object(o.e)(this);return Object(o.i)(o.a,{onIonBackdropTap:this.onBackdropTap,style:{zIndex:""+(4e4+this.overlayIndex)},class:Object.assign(Object.assign({},Object(c.b)(this.cssClass)),(i={},i[n]=!0,i["loading-translucent"]=this.translucent,i))},Object(o.i)("ion-backdrop",{visible:this.showBackdrop,tappable:this.backdropDismiss}),Object(o.i)("div",{class:"loading-wrapper",role:"dialog"},e&&Object(o.i)("div",{class:"loading-spinner"},Object(o.i)("ion-spinner",{name:e})),t&&Object(o.i)("div",{class:"loading-content",innerHTML:Object(d.a)(t)})))},Object.defineProperty(i.prototype,"el",{get:function(){return Object(o.f)(this)},enumerable:!0,configurable:!0}),Object.defineProperty(i,"style",{get:function(){return".sc-ion-loading-ios-h{--min-width:auto;--width:auto;--min-height:auto;--height:auto;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;position:fixed;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;font-family:var(--ion-font-family,inherit);contain:strict;-ms-touch-action:none;touch-action:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;z-index:1001}.overlay-hidden.sc-ion-loading-ios-h{display:none}.loading-wrapper.sc-ion-loading-ios{display:-ms-flexbox;display:flex;-ms-flex-align:inherit;align-items:inherit;-ms-flex-pack:inherit;justify-content:inherit;width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);background:var(--background);opacity:0;z-index:10}.spinner-bubbles.sc-ion-loading-ios, .spinner-circles.sc-ion-loading-ios, .spinner-crescent.sc-ion-loading-ios, .spinner-dots.sc-ion-loading-ios, .spinner-lines.sc-ion-loading-ios, .spinner-lines-small.sc-ion-loading-ios{color:var(--spinner-color)}.sc-ion-loading-ios-h{--background:var(--ion-overlay-background-color,var(--ion-color-step-100,#f9f9f9));--max-width:270px;--max-height:90%;--spinner-color:var(--ion-color-step-600,#666);color:var(--ion-text-color,#000);font-size:14px}.loading-wrapper.sc-ion-loading-ios{border-radius:8px;padding-left:34px;padding-right:34px;padding-top:24px;padding-bottom:24px}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){.loading-wrapper.sc-ion-loading-ios{padding-left:unset;padding-right:unset;-webkit-padding-start:34px;padding-inline-start:34px;-webkit-padding-end:34px;padding-inline-end:34px}}@supports ((-webkit-backdrop-filter:blur(0)) or (backdrop-filter:blur(0))){.loading-translucent.sc-ion-loading-ios-h .loading-wrapper.sc-ion-loading-ios{background-color:rgba(var(--ion-background-color-rgb,255,255,255),.8);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}}.loading-content.sc-ion-loading-ios{font-weight:700}.loading-spinner.sc-ion-loading-ios + .loading-content.sc-ion-loading-ios{margin-left:16px}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){.loading-spinner.sc-ion-loading-ios + .loading-content.sc-ion-loading-ios{margin-left:unset;-webkit-margin-start:16px;margin-inline-start:16px}}"},enumerable:!0,configurable:!0}),i}()},308:function(i,t,e){"use strict";e.d(t,"a",(function(){return r})),e.d(t,"b",(function(){return a})),e.d(t,"c",(function(){return o})),e.d(t,"d",(function(){return c}));var n=e(3),o=function(i,t){return null!==t.closest(i)},r=function(i){var t;return"string"===typeof i&&i.length>0?((t={"ion-color":!0})["ion-color-"+i]=!0,t):void 0},a=function(i){var t={};return function(i){return void 0!==i?(Array.isArray(i)?i:i.split(" ")).filter((function(i){return null!=i})).map((function(i){return i.trim()})).filter((function(i){return""!==i})):[]}(i).forEach((function(i){return t[i]=!0})),t},s=/^[a-z][a-z0-9+\-.]*:/,c=function(i,t,e){return Object(n.a)(void 0,void 0,void 0,(function(){var o;return Object(n.c)(this,(function(n){return null!=i&&"#"!==i[0]&&!s.test(i)&&(o=document.querySelector("ion-router"))?(null!=t&&t.preventDefault(),[2,o.push(i,e)]):[2,!1]}))}))}},309:function(i,t,e){"use strict";e.d(t,"a",(function(){return n}));var n=function(i){try{if("string"!==typeof i||""===i)return i;var t=document.createDocumentFragment(),e=document.createElement("div");t.appendChild(e),e.innerHTML=i,s.forEach((function(i){for(var e=t.querySelectorAll(i),n=e.length-1;n>=0;n--){var a=e[n];a.parentNode?a.parentNode.removeChild(a):t.removeChild(a);for(var s=r(a),c=0;c<s.length;c++)o(s[c])}}));for(var n=r(t),a=0;a<n.length;a++)o(n[a]);var c=document.createElement("div");c.appendChild(t);var d=c.querySelector("div");return null!==d?d.innerHTML:c.innerHTML}catch(l){return console.error(l),""}},o=function i(t){if(!t.nodeType||1===t.nodeType){for(var e=t.attributes.length-1;e>=0;e--){var n=t.attributes.item(e),o=n.name;if(a.includes(o.toLowerCase())){var s=n.value;null!=s&&s.toLowerCase().includes("javascript:")&&t.removeAttribute(o)}else t.removeAttribute(o)}var c=r(t);for(e=0;e<c.length;e++)i(c[e])}},r=function(i){return null!=i.children?i.children:i.childNodes},a=["class","id","href","src","name","slot"],s=["script","style","iframe","meta","link","object","embed"]}}]);
//# sourceMappingURL=26.20806696.chunk.js.map