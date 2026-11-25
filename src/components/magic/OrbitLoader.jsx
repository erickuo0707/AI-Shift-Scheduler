// 參考 AIMRAN Library 的 loader：雙圈反向旋轉
export function OrbitLoader() {
  return (
    <span className="relative inline-block size-6" aria-hidden>
      <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-white/20 border-t-white" />
      <span className="absolute inset-[5px] animate-spin rounded-full border-[3px] border-transparent border-b-cyan-300 [animation-direction:reverse] [animation-duration:.7s]" />
    </span>
  );
}
