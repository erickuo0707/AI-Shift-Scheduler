import { Panel } from "../Panel";
import { CommitInput } from "../CommitInput";
import { ShimmerButton } from "../magic/ShimmerButton";
import { OrbitLoader } from "../magic/OrbitLoader";
import { IconCalendar, IconSparkles } from "../Icons";

export function SettingsPanel({ state, onSetting, onGenerate, busy }) {
  const st = state.settings;
  return (
    <Panel
      className="no-print"
      icon={<IconCalendar />}
      title="排班期間與休息規則"
      sub="硬性規則不會被偏好分數覆蓋；條件不足時會保留缺額並說明原因。"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="label">排班月份</span>
          <input className="input" type="month" value={st.month} onChange={(e) => e.target.value && onSetting("month", e.target.value)} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label">兩班最少休息（小時）</span>
          <CommitInput type="number" min={0} max={24} step={0.5} value={st.minRestHours} onCommit={(v) => onSetting("minRestHours", v)} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label">連續工作日上限</span>
          <CommitInput type="number" min={1} max={7} step={1} value={st.maxConsecutiveDays} onCommit={(v) => onSetting("maxConsecutiveDays", v)} />
        </label>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-dashed border-white/10 pt-7">
        <p className="m-0 max-w-[680px] text-[0.88rem] leading-relaxed text-dim">
          排班會先遵守指定月份可上班日期、每週工時上限、最少休息與連續工作日上限，再平衡人員相對工時負擔，並考量班別偏好與晚班接早班風險。規則可依你的工作場所調整。
        </p>
        <ShimmerButton onClick={onGenerate} disabled={busy} className="text-[1.2rem] max-sm:w-full">
          {busy ? <><OrbitLoader /> 排班運算中…</> : <><IconSparkles /> 生成建議班表</>}
        </ShimmerButton>
      </div>
    </Panel>
  );
}
