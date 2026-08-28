export const clamp01=(n,d=0)=>{const x=Number(n);return Number.isFinite(x)?Math.max(0,Math.min(1,x)):d;};
export const unique=a=>[...new Set(a)];
