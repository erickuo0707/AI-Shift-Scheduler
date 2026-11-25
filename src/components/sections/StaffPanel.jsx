import { Panel } from "../Panel";
import { IconPlus, IconRefresh, IconUsers } from "../Icons";
import { personAvailabilityDates, personMustOffDates, personPreferredOffDates } from "../../lib/scheduler";

export function StaffPanel({ state, onAdd, onEdit, onDelete, onReset }) {
  const month = state.settings.month;
  const monthLabel = month.replace("-", "年") + "月";
  const shiftName = (id) => { const s = state.shifts.find((x) => x.id === id); return s ? s.name : ""; };
  const day = (d) => Number(d.slice(-2));
  return (
    <Panel
      className="no-print"
      icon={<IconUsers />}
      title="人員與個人需求"
      sub="設定指定月份可上班日期、每週最高工時與班別偏好，不需要填寫健康或敏感資訊。"
      actions={<>
        <button className="btn" onClick={onReset}><IconRefresh />重設示範資料</button>
        <button className="btn btn-primary" onClick={onAdd}><IconPlus />新增人員</button>
      </>}
    >
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>人員</th><th>類型</th><th>指定月份需求</th><th>每週工時上限</th><th>可排班別／偏好</th><th>操作</th></tr></thead>
          <tbody>
            {!state.staff.length && (
              <tr><td colSpan={6}><div className="p-9 text-center text-dim">尚未新增人員。請先建立團隊名單。</div></td></tr>
            )}
            {state.staff.map((p) => {
              let summary;
              if (p.type === "正職") {
                const must = personMustOffDates(p, month).map(day).join("、");
                const prefer = personPreferredOffDates(p, month).map(day).join("、");
                summary = [must ? "必休 X：" + must : "", prefer ? "希望休 △：" + prefer : ""].filter(Boolean).join("；") || "尚未標休假需求";
              } else {
                const available = personAvailabilityDates(p, month).map(day).join("、");
                summary = available ? monthLabel + " 可上：" + available : "尚未勾選可上班日";
              }
              const allowedNames = (Array.isArray(p.allowedShiftIds) ? p.allowedShiftIds : state.shifts.map((s) => s.id)).map(shiftName).filter(Boolean);
              const prefs = [
                <span key="c" className="tag tag-soft">可排 {allowedNames.join("、") || "無可用班別"}</span>,
                p.preferredShiftId && <span key="p" className="tag">偏好 {shiftName(p.preferredShiftId) || "已刪除班別"}</span>,
                p.avoidShiftId && <span key="a" className="tag tag-soft">避開 {shiftName(p.avoidShiftId) || "已刪除班別"}</span>,
              ].filter(Boolean);
              return (
                <tr key={p.id}>
                  <td><span className="whitespace-nowrap text-[1rem] font-extrabold text-white">{p.name}</span></td>
                  <td><span className={p.type === "正職" ? "tag" : "tag tag-cyan"}>{p.type}</span></td>
                  <td className="text-[#c9cdf0]">{summary}</td>
                  <td className="whitespace-nowrap">{p.maxHours} 小時／週</td>
                  <td>{prefs.length ? prefs : <span className="text-[0.85rem] text-dim">未設定</span>}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => onEdit(p.id)}>編輯</button>
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(p)}>刪除</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
