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

const storageKey = "feedTrackDailyFeed";
const dayKey = new Date().toLocaleDateString("ja-JP");

function loadFedPets() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved?.day === dayKey && Array.isArray(saved.pets) ? saved.pets : [];
  } catch { return []; }
}

let fedPets = loadFedPets();

function saveFedPets() {
  localStorage.setItem(storageKey, JSON.stringify({ day: dayKey, pets: fedPets }));
}

function render() {
  const list = document.getElementById("petList");
  list.innerHTML = pets.map((pet, index) => {
    const isFed = fedPets.includes(pet.id);
    return `<article class="pet ${isFed ? "fed" : ""}" style="--pet-number:${index + 1}">
      <div class="pet-card-top"><span class="pet-round-button" aria-hidden="true">☰</span><span class="pet-number">PET ${String(index + 1).padStart(2, "0")}</span><span class="pet-round-button" aria-hidden="true">♡</span></div>
      <span class="pet-icon" aria-label="${pet.name}の写真スペース"><span>${pet.icon}</span><b>PHOTO</b></span>
      <div class="pet-info">
        <p class="pet-name">${pet.name}</p>
        <p class="pet-type">${pet.type}</p>
        <div class="pet-mini-stats"><span><small>きょうのごはん</small><strong>${isFed ? "済" : "まだ"}</strong></span><span><small>体重</small><strong>記録なし</strong></span></div>
        <p class="pet-status">${isFed ? "今日は、ごはんをあげました！" : "今日は、まだごはんをあげていません"}</p>
      </div>
      <button class="feed-button ${isFed ? "done" : ""}" type="button" data-pet-id="${pet.id}">${isFed ? "✓ ごはん済み" : "＋ ごはんをあげた"}</button>
    </article>`;
  }).join("");

  const count = fedPets.length;
  document.getElementById("fedCount").textContent = count;
  document.getElementById("progressBar").style.width = `${(count / pets.length) * 100}%`;
  document.getElementById("summaryMessage").textContent = count === 0 ? "まだごはんをあげていません" : count === pets.length ? "全員分、完了！ すごい！" : `あと ${pets.length - count} ひきです`;
}

document.getElementById("petList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-pet-id]");
  if (!button) return;
  const id = button.dataset.petId;
  fedPets = fedPets.includes(id) ? fedPets.filter((petId) => petId !== id) : [...fedPets, id];
  saveFedPets();
  render();
});

document.getElementById("resetToday").addEventListener("click", () => {
  if (!confirm("今日の『ごはん済み』を全部もどしますか？")) return;
  fedPets = [];
  saveFedPets();
  render();
});

document.getElementById("today").textContent = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).format(new Date());
render();
