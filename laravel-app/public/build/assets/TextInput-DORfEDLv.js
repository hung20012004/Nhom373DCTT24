import{j as a,r as o}from"./app-DM5lWH7w.js";function i({message:t,className:e="",...r}){return t?a.jsx("p",{...r,className:"text-sm text-red-600 "+e,children:t}):null}function x({value:t,className:e="",children:r,...s}){return a.jsx("label",{...s,className:"block text-sm font-medium text-gray-700 "+e,children:t||r})}const d=o.forwardRef(function({type:e="text",className:r="",isFocused:s=!1,...c},f){const u=o.useRef(null);return o.useImperativeHandle(f,()=>({focus:()=>{var n;return(n=u.current)==null?void 0:n.focus()}})),o.useEffect(()=>{var n;s&&((n=u.current)==null||n.focus())},[s]),a.jsx("input",{...c,type:e,className:"rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 "+r,ref:u})});export{x as I,d as T,i as a};
