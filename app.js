import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { doc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const pets = [
  { id: "kurumi", name: "クルミ", type: "カメ", icon: "🐢" },
  { id: "beardie-1", name: "ビアンカ", type: "フトアゴヒゲトカゲ", icon: "🦎" },
  { id: "beardie-2", name: "ベルーガ", type: "フトアゴヒゲトカゲ", icon: "🦎" },
  { id: "beardie-3", name: "アルバス", type: "フトアゴヒゲトカゲ", icon: "🦎" },
  { id: "crestie-1", name: "ジャガ", type: "クレステッドゲッコー", icon: "🦎" },
  { id: "crestie-2", name: "ダル", type: "クレステッドゲッコー", icon: "🦎" },
  { id: "crestie-3", name: "アンカー", type: "クレステッドゲッコー", icon: "🦎" },
  { id: "crestie-4", name: "ピメ", type: "クレステッドゲッコー", icon: "🦎" },
  { id: "african-fat-tail", name: "ニシアフ", type: "ニシアフリカトカゲモドキ", icon: "🦎" }
];

const firebaseConfig = {
  apiKey: "AIzaSyCEgYrIJsvOT_O9_jwsFEyDrE3eEm3V0cI",
  authDomain: "feedtrack-reptile.firebaseapp.com",
  projectId: "feedtrack-reptile",
  storageBucket: "feedtrack-reptile.firebasestorage.app",
  messagingSenderId: "1095574939571",
  appId: "1:1095574939571:web:ffbf5118859b1d40b38dc6"
};

const storageKey = "feedTrackDailyFeed";
const cleaningStorageKey = "feedTrackDailyCleaning";
const poopingStorageKey = "feedTrackDailyPooping";
const dayKey = new Date().toLocaleDateString("ja-JP");
const petIds = new Set(pets.map((pet) => pet.id));

function loadDailyPetIds(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved?.day === dayKey && Array.isArray(saved.pets) ? saved.pets.filter((id) => petIds.has(id)) : [];
  } catch {
    return [];
  }
}

let fedPets = loadDailyPetIds(storageKey);
let cleanedPets = loadDailyPetIds(cleaningStorageKey);
let poopedPets = loadDailyPetIds(poopingStorageKey);
let sharedDayRef;

function saveLocally() {
  localStorage.setItem(storageKey, JSON.stringify({ day: dayKey, pets: fedPets }));
  localStorage.setItem(cleaningStorageKey, JSON.stringify({ day: dayKey, pets: cleanedPets }));
  localStorage.setItem(poopingStorageKey, JSON.stringify({ day: dayKey, pets: poopedPets }));
}

function saveToCloud() {
  if (!sharedDayRef) return;
  setDoc(sharedDayRef, {
    day: dayKey,
    fedPets,
    cleanedPets,
    poopedPets,
    updatedAt: serverTimestamp()
  }).catch(() => {
    // 電波がないときも、このiPhoneには保存されるよ。
  });
}

function saveAll() {
  saveLocally();
  saveToCloud();
}

function render() {
  const list = document.getElementById("petList");
  list.innerHTML = pets.map((pet, index) => {
    const isFed = fedPets.includes(pet.id);
    const isCleaned = cleanedPets.includes(pet.id);
    const hasPooped = poopedPets.includes(pet.id);
    return `<article class="pet ${isFed ? "fed" : ""}" style="--pet-number:${index + 1}">
      <div class="pet-card-top"><span class="pet-number">PET ${String(index + 1).padStart(2, "0")}</span></div>
      <span class="pet-icon" aria-label="${pet.name}の写真スペース"><span>${pet.icon}</span><b>PHOTO</b></span>
      <div class="pet-info">
        <p class="pet-name">${pet.name}</p>
        <p class="pet-type">${pet.type}</p>
        <div class="pet-mini-stats"><span><small>きょうのごはん</small><strong>${isFed ? "済" : "まだ"}</strong></span><span><small>今日のお掃除</small><strong>${isCleaned ? "済み" : "まだ"}</strong></span><span><small>今日のフン</small><strong>${hasPooped ? "済み" : "まだ"}</strong></span></div>
        <p class="pet-status">${isFed ? "今日は、ごはんをあげました！" : "今日は、まだごはんをあげていません"}</p>
      </div>
      <div class="pet-actions">
        <button class="feed-button ${isFed ? "done" : ""}" type="button" data-action="feed" data-pet-id="${pet.id}">${isFed ? "✓ ごはん済み" : "＋ ごはんをあげた"}</button>
        <button class="clean-button ${isCleaned ? "done" : ""}" type="button" data-action="clean" data-pet-id="${pet.id}">${isCleaned ? "✓ お掃除済み" : "＋ お掃除した"}</button>
        <button class="poop-button ${hasPooped ? "done" : ""}" type="button" data-action="poop" data-pet-id="${pet.id}">${hasPooped ? "✓ フン済み" : "＋ フンした"}</button>
      </div>
    </article>`;
  }).join("");

  const count = fedPets.length;
  document.getElementById("fedCount").textContent = count;
  document.getElementById("progressBar").style.width = `${(count / pets.length) * 100}%`;
  document.getElementById("summaryMessage").textContent = count === 0 ? "まだごはんをあげていません" : count === pets.length ? "全員分、完了！ すごい！" : `あと ${pets.length - count} ひきです`;
}

function isPetIdList(value) {
  return Array.isArray(value) ? value.filter((id) => petIds.has(id)) : [];
}

async function startFamilySync() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await signInAnonymously(auth);

    const database = getFirestore(app);
    sharedDayRef = doc(database, "families", "feedtrack-home");

    onSnapshot(sharedDayRef, (snapshot) => {
      const saved = snapshot.data();
      if (!saved || saved.day !== dayKey) {
        fedPets = [];
        cleanedPets = [];
        poopedPets = [];
        saveLocally();
        saveToCloud();
        render();
        return;
      }

      fedPets = isPetIdList(saved.fedPets);
      cleanedPets = isPetIdList(saved.cleanedPets);
      poopedPets = isPetIdList(saved.poopedPets);
      saveLocally();
      render();
    });
  } catch {
    // 同期できないときも、今までどおりこの端末では使えるよ。
  }
}

document.getElementById("petList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-pet-id]");
  if (!button) return;

  const id = button.dataset.petId;
  if (button.dataset.action === "clean") {
    cleanedPets = cleanedPets.includes(id) ? cleanedPets.filter((petId) => petId !== id) : [...cleanedPets, id];
  } else if (button.dataset.action === "poop") {
    poopedPets = poopedPets.includes(id) ? poopedPets.filter((petId) => petId !== id) : [...poopedPets, id];
  } else {
    fedPets = fedPets.includes(id) ? fedPets.filter((petId) => petId !== id) : [...fedPets, id];
  }
  saveAll();
  render();
});

document.getElementById("resetToday").addEventListener("click", () => {
  if (!confirm("今日の『ごはん済み』『お掃除済み』『フン済み』を全部もどしますか？")) return;
  fedPets = [];
  cleanedPets = [];
  poopedPets = [];
  saveAll();
  render();
});

document.getElementById("today").textContent = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).format(new Date());
render();
startFamilySync();
