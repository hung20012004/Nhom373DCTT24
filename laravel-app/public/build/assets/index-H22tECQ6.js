import{r as s,j as u}from"./app-DM5lWH7w.js";import{a as g}from"./utils-De8wPBUk.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),p=(...e)=>e.filter((r,t,n)=>!!r&&r.trim()!==""&&n.indexOf(r)===t).join(" ").trim();/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=s.forwardRef(({color:e="currentColor",size:r=24,strokeWidth:t=2,absoluteStrokeWidth:n,className:o="",children:l,iconNode:i,...a},c)=>s.createElement("svg",{ref:c,...w,width:r,height:r,stroke:e,strokeWidth:n?Number(t)*24/Number(r):t,className:p("lucide",o),...a},[...i.map(([d,m])=>s.createElement(d,m)),...Array.isArray(l)?l:[l]]));/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=(e,r)=>{const t=s.forwardRef(({className:n,...o},l)=>s.createElement(y,{ref:l,iconNode:r,className:p(`lucide-${h(e)}`,n),...o}));return t.displayName=`${e}`,t};var C=s.forwardRef((e,r)=>{const{children:t,...n}=e,o=s.Children.toArray(t),l=o.find(b);if(l){const i=l.props.children,a=o.map(c=>c===l?s.Children.count(i)>1?s.Children.only(null):s.isValidElement(i)?i.props.children:null:c);return u.jsx(f,{...n,ref:r,children:s.isValidElement(i)?s.cloneElement(i,void 0,a):null})}return u.jsx(f,{...n,ref:r,children:t})});C.displayName="Slot";var f=s.forwardRef((e,r)=>{const{children:t,...n}=e;if(s.isValidElement(t)){const o=x(t);return s.cloneElement(t,{...j(n,t.props),ref:r?g(r,o):o})}return s.Children.count(t)>1?s.Children.only(null):null});f.displayName="SlotClone";var E=({children:e})=>u.jsx(u.Fragment,{children:e});function b(e){return s.isValidElement(e)&&e.type===E}function j(e,r){const t={...r};for(const n in r){const o=e[n],l=r[n];/^on[A-Z]/.test(n)?o&&l?t[n]=(...a)=>{l(...a),o(...a)}:o&&(t[n]=o):n==="style"?t[n]={...o,...l}:n==="className"&&(t[n]=[o,l].filter(Boolean).join(" "))}return{...e,...t}}function x(e){var n,o;let r=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,t=r&&"isReactWarning"in r&&r.isReactWarning;return t?e.ref:(r=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,t=r&&"isReactWarning"in r&&r.isReactWarning,t?e.props.ref:e.props.ref||e.ref)}export{C as S,A as c};
