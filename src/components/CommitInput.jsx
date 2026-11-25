import { useEffect, useState } from "react";

// 輸入時只改本地值，離開欄位或按 Enter 才寫回（對應原本的 change 事件）
export function CommitInput({ value, onCommit, className = "input", ...props }) {
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => { setDraft(value ?? ""); }, [value]);
  const commit = () => { if (String(draft) !== String(value ?? "")) onCommit(draft); };
  return (
    <input
      {...props}
      className={className}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
    />
  );
}
