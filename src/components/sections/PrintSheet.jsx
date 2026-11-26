import { WEEKDAY_EN, buildRotaSheet } from "../../lib/rotaSheet";

// 列印專用：門市原本的直式週表（螢幕上不顯示）
export function PrintSheet({ state }) {
  if (!state.result) return null;
  const sheet = buildRotaSheet(state);
  return (
    <div className="print-only rota-print">
      <h1>{sheet.title}</h1>
      {sheet.weeks.map((week) => (
        <table key={week.days[0].date}>
          <colgroup><col className="name-col" />{week.days.map((d) => <col key={d.date} />)}</colgroup>
          <thead>
            <tr className="peach"><th>Name</th>{WEEKDAY_EN.map((d) => <th key={d}>{d}</th>)}</tr>
            <tr className="peach"><th />{week.days.map((d) => <th key={d.date} className={!d.inMonth ? "dim" : d.red ? "red" : ""}>{d.label}</th>)}</tr>
          </thead>
          <tbody>
            <tr><td className="label">節日/活動</td>{week.events.map((e, i) => <td key={i}>{e}</td>)}</tr>
            {week.rows.map((row) => (
              <tr key={row.name} className="gray">
                <td className="name">{row.name}</td>
                {row.cells.map((c, i) => <td key={i} className={c.color || ""}>{c.text}</td>)}
              </tr>
            ))}
            {week.shortage && <tr className="short"><td className="label">缺額</td>{week.shortage.map((s, i) => <td key={i}>{s}</td>)}</tr>}
          </tbody>
        </table>
      ))}
    </div>
  );
}
