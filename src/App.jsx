import { useCallback, useEffect, useRef, useState } from "react";
import { Background } from "./components/magic/Background";
import { Toast } from "./components/magic/Toast";
import { Header } from "./components/sections/Header";
import { Hero } from "./components/sections/Hero";
import { StaffPanel } from "./components/sections/StaffPanel";
import { StaffDialog } from "./components/sections/StaffDialog";
import { ShiftPanel } from "./components/sections/ShiftPanel";
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

  const addShift = () => {
    mutate((s) => { s.shifts.push({ id: uid("shift"), name: "10:30-16", start: "10:30", end: "16:00", breakHours: 0, headcount: 1, days: [0, 1, 2, 3, 4, 5, 6], optional: true }); });
    toast("已新增班別，請設定時段與人數。");
  };
  const editShift = (id, field, value) => mutate((s) => {
    const item = s.shifts.find((x) => x.id === id); if (!item) return;
    if (field === "days") {
      const set = new Set(item.days || []);
      if (value.checked) set.add(value.day); else set.delete(value.day);
      item.days = [...set].sort((a, b) => a - b);
    } else if (field === "headcount") item.headcount = Math.max(1, Number(value) || 1);
    else if (field === "breakHours") item.breakHours = Math.max(0, Math.min(8, Number(value) || 0));
    else if (field === "optional") item.optional = !!value;
    else item[field] = value;
  });
  const deleteShift = (id) => {
    if (!confirm("確定刪除此班別？")) return;
    mutate((s) => {
      s.shifts = s.shifts.filter((x) => x.id !== id);
      s.staff.forEach((p) => { if (p.preferredShiftId === id) p.preferredShiftId = ""; if (p.avoidShiftId === id) p.avoidShiftId = ""; });
    });
    toast("已刪除班別。");
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

  const editingPerson = state.staff.find((p) => p.id === dialog.personId) || null;

  return (
    <>
      <Background />
      <Header />
      <main className="mx-auto mb-24 w-[min(1320px,calc(100%-40px))] max-sm:w-[calc(100%-22px)]">
        <Hero />
        <StaffPanel state={state} onAdd={() => setDialog({ open: true, personId: "" })} onEdit={(id) => setDialog({ open: true, personId: id })} onDelete={deletePerson} onReset={resetDemo} />
        <ShiftPanel state={state} onAdd={addShift} onEdit={editShift} onDelete={deleteShift} />
        <SettingsPanel state={state} onSetting={setSetting} onGenerate={generate} busy={busy} />
        {state.result && <ResultPanel state={state} onCsv={() => exportCsv(state)} onBackup={() => exportBackup(state)} />}
        <div className="no-print p-6 text-center text-[0.85rem] text-dim">ShiftWell · 排班建議由本機規則引擎產生，所有資料保存在目前瀏覽器。</div>
      </main>
      <StaffDialog open={dialog.open} person={editingPerson} state={state} onClose={() => setDialog({ open: false, personId: "" })} onSave={savePerson} toast={toast} />
      <Toast message={toastMsg} />
    </>
  );
}
