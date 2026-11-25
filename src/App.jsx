import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "./components/ui/Toast";
import { Header } from "./components/sections/Header";
import { Hero } from "./components/sections/Hero";
import { StaffPanel } from "./components/sections/StaffPanel";
import { StaffDialog } from "./components/sections/StaffDialog";
import { SettingsPanel } from "./components/sections/SettingsPanel";
import { ResultPanel } from "./components/sections/ResultPanel";
import { createEngine, demoState, exportBackup, exportCsv, loadState, offRequestLimit, persist, uid } from "./lib/scheduler";

export default function App() {
  const [state, setState] = useState(loadState);
  const [toastMsg, setToastMsg] = useState(null);
  const [dialog, setDialog] = useState({ open: false, personId: "" });
  const [busy, setBusy] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const toastTimer = useRef(null);

  const toast = useCallback((text) => {
    setToastMsg({ id: Date.now() + Math.random(), text });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  useEffect(() => { if (!persist(state)) toast("瀏覽器無法儲存資料，請匯出備份。"); }, [state, toast]);

  // 修改資料並讓舊的排班結果失效（同原版 invalidateResult）
  const mutate = (fn) => setState((prev) => { const next = structuredClone(prev); fn(next); next.result = null; return next; });

  const savePerson = (data) => {
    const id = dialog.personId;
    const month = state.settings.month;
    const existing = state.staff.find((p) => p.id === id);
    const isNew = !existing;
    mutate((s) => {
      const availabilityByMonth = { ...(existing?.availabilityByMonth || {}) };
      const requestedOffByMonth = { ...(existing?.requestedOffByMonth || {}) };
      const preferredOffByMonth = { ...(existing?.preferredOffByMonth || {}) };
      if (data.type === "正職") { requestedOffByMonth[month] = data.mustOff; preferredOffByMonth[month] = data.preferredOff; }
      else availabilityByMonth[month] = data.available;
      const person = { id: id || uid("person"), name: data.name, type: data.type, availabilityByMonth, requestedOffByMonth, preferredOffByMonth, allowedShiftIds: data.allowedShiftIds, lead: data.lead, maxHours: data.maxHours, preferredShiftId: data.preferredShiftId, avoidShiftId: data.avoidShiftId };
      const idx = s.staff.findIndex((p) => p.id === person.id);
      if (idx < 0) s.staff.push(person); else s.staff[idx] = person;
    });
    setDialog({ open: false, personId: "" });
    const over = data.type === "正職" && data.mustOff.length + data.preferredOff.length > offRequestLimit(month);
    toast(over ? "已儲存；正職休假需求超過本月建議天數，請先與主管協調。" : isNew ? "已新增人員。" : "已更新人員。");
  };

  const deletePerson = (person) => {
    if (!confirm("確定刪除「" + person.name + "」？")) return;
    mutate((s) => { s.staff = s.staff.filter((p) => p.id !== person.id); });
    toast("已刪除人員。");
  };

  const resetDemo = () => {
    if (!confirm("重設後會以示範人員和班別取代目前資料。確定重設嗎？")) return;
    setState(demoState());
    toast("已載入示範資料。");
  };

  const setSetting = (key, value) => mutate((s) => {
    if (key === "month") s.settings.month = value || s.settings.month;
    if (key === "minRestHours") s.settings.minRestHours = Math.min(24, Math.max(0, Number(value) || 0));
    if (key === "maxConsecutiveDays") s.settings.maxConsecutiveDays = Math.min(7, Math.max(1, Number(value) || 1));
    if (key === "extendToFullDay") s.settings.extendToFullDay = !!value;
    if (key === "holidays") {
      s.settings.holidaysByMonth = { ...(s.settings.holidaysByMonth || {}) };
      if (value === null) delete s.settings.holidaysByMonth[s.settings.month];
      else s.settings.holidaysByMonth[s.settings.month] = value;
    }
  });

  const generate = () => {
    // 先讓正在編輯的欄位 blur 寫回，再於下一個 tick 用最新 state 計算
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setBusy(true);
    setTimeout(() => {
      const current = stateRef.current;
      const { error, result } = createEngine(current).createSchedule();
      if (error) { setBusy(false); toast(error); return; }
      setState((prev) => ({ ...prev, result }));
      setBusy(false);
      setTimeout(() => document.getElementById("resultSection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }, 650);
  };

  const monthsWithData = new Set();
  state.staff.forEach((p) => [p.availabilityByMonth, p.requestedOffByMonth, p.preferredOffByMonth].forEach((byMonth) => {
    Object.entries(byMonth || {}).forEach(([m, list]) => { if (Array.isArray(list) && list.length) monthsWithData.add(m); });
  }));

  const editingPerson = state.staff.find((p) => p.id === dialog.personId) || null;

  return (
    <>
      <Header month={state.settings.month} onMonth={(m) => setSetting("month", m)} monthsWithData={monthsWithData} />
      <main className="mx-auto mb-24 w-[min(1320px,calc(100%-40px))] max-sm:w-[calc(100%-22px)]">
        <Hero />
        <StaffPanel state={state} onAdd={() => setDialog({ open: true, personId: "" })} onEdit={(id) => setDialog({ open: true, personId: id })} onDelete={deletePerson} onReset={resetDemo} />
        <SettingsPanel state={state} onSetting={setSetting} onGenerate={generate} busy={busy} monthsWithData={monthsWithData} />
        {state.result && <ResultPanel state={state} onCsv={() => exportCsv(state)} onBackup={() => exportBackup(state)} />}
        <div className="no-print p-6 text-center text-[0.85rem] text-dim">ShiftWell · 排班建議由本機規則引擎產生，所有資料保存在目前瀏覽器。</div>
      </main>
      <StaffDialog open={dialog.open} person={editingPerson} state={state} onClose={() => setDialog({ open: false, personId: "" })} onSave={savePerson} toast={toast} />
      <Toast message={toastMsg} />
    </>
  );
}
