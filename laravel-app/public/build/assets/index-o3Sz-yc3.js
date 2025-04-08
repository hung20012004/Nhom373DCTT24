import{c as h}from"./index-H22tECQ6.js";import{r as u}from"./app-DM5lWH7w.js";import{f as d}from"./index-v8iwHGUi.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=h("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);function S(r){const e=u.useRef({value:r,previous:r});return u.useMemo(()=>(e.current.value!==r&&(e.current.previous=e.current.value,e.current.value=r),e.current.previous),[r])}function y(r){const[e,o]=u.useState(void 0);return d(()=>{if(r){o({width:r.offsetWidth,height:r.offsetHeight});const f=new ResizeObserver(t=>{if(!Array.isArray(t)||!t.length)return;const c=t[0];let i,s;if("borderBoxSize"in c){const n=c.borderBoxSize,a=Array.isArray(n)?n[0]:n;i=a.inlineSize,s=a.blockSize}else i=r.offsetWidth,s=r.offsetHeight;o({width:i,height:s})});return f.observe(r,{box:"border-box"}),()=>f.unobserve(r)}else o(void 0)},[r]),e}export{p as C,y as a,S as u};
