// Хранилище прогресса: localStorage + CloudStorage Telegram (если доступен)
'use strict';

const State = {
  key: 'driftzone_save_v1',
  data: null,

  fresh() {
    return {
      money: ECON.startMoney,
      garage: [],                    // [{uid, carId, parts:{slot:levelIdx}, paint:null, incomeAt:Date.now()}]
      garageSlots: ECON.garageStart,
      inventory: {},                 // 'engine|2' -> count (детали со склада)
      collection: {},                // carId -> true
      museum: [],                    // uid машин на витрине
      secretClaimed: {},             // страна -> true
      xp: 0, level: 1,
      fuel: RACE.fuelMax, fuelAt: Date.now(),       // общий бак
      carFuel: {},                   // uid -> {fuel, at} бак машины
      stats: { carCases:0, partCases:0, races:0, wins:0, merges:0, installs:0,
               incomeCollected:0, moneyEarned:ECON.startMoney, spent:0 },
      xpDay: { date:'', total:0 },
      daily: { lastDay:'', streak:0 },
      rewardCaseAt: 0,
      questsDone: {},
      lastRemoveAt: 0,               // перерыв 20 мин после снятия детали
      lastPartCaseAt: 0,             // кейсы деталей не чаще раза в 10 с
      uidSeq: 1,
    };
  },

  load() {
    let raw = localStorage.getItem(this.key);
    if (raw) { try { this.data = JSON.parse(raw); } catch(e){ this.data=null; } }
    if (!this.data || !this.data.garage) this.data = this.fresh();
    // миграция: добить недостающие поля
    const f = this.fresh();
    for (const k in f) if (!(k in this.data)) this.data[k] = f[k];
    return this.data;
  },

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
    // облако Telegram — best effort
    try {
      if (tg && tg.sendData) tg.sendData(JSON.stringify({ [this.key]: this.data }));
    } catch(e){}
  },

  reset() { this.data = this.fresh(); this.save(); },

  // ===== helpers =====
  addMoney(n) { this.data.money += n; if (n>0) this.data.stats.moneyEarned += n; this.save(); },
  spend(n) { if (this.data.money < n) return false; this.data.money -= n; this.data.stats.spent += n; return true; },
  newUid() { return this.data.uidSeq++; },
  garageFree() { return this.data.garage.length < this.data.garageSlots; },
  slotPrice(nthSlot) { // цена N-го места (7-е = 100К, далее ×2)
    return ECON.slotPrice7 * Math.pow(2, nthSlot - 7);
  },
};
