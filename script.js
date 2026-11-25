
const citySelect = document.getElementById("citySelect");
const districtSelect = document.getElementById("districtSelect");
const searchButton = document.getElementById("searchButton");
const categoryCards = document.querySelectorAll(".category-card");
const brandSelect = document.getElementById("brandSelect");
const sortSelect = document.getElementById("sortSelect");

let selectedCategory = "benzin";

// Şehir ve ilçe altyapısı
const districts = {
  "İstanbul": [
    "Adalar", "Arnavutköy", "Ataşehir", "Avcılar",
    "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir",
    "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
    "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy",
    "Esenler", "Esenyurt", "Eyüpsultan", "Fatih",
    "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane",
    "Kartal", "Küçükçekmece", "Maltepe", "Pendik",
    "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli",
    "Sultangazi", "Şile", "Şişli", "Tuzla",
    "Ümraniye", "Üsküdar", "Zeytinburnu"
  ],
  "Ankara": [
    "Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı",
    "Çankaya", "Çubuk", "Elmadağ", "Etimesgut",
    "Gölbaşı", "Keçiören", "Mamak", "Polatlı",
    "Pursaklar", "Sincan", "Yenimahalle"
  ],
  "İzmir": [
    "Aliağa", "Balçova", "Bayraklı", "Bornova",
    "Buca", "Çeşme", "Çiğli", "Gaziemir",
    "Karabağlar", "Karşıyaka", "Konak", "Menemen",
    "Seferihisar", "Torbalı", "Urla"
  ],
  "Bursa": [
    "Gemlik", "Gürsu", "İnegöl", "İznik",
    "Karacabey", "Mudanya", "Mustafakemalpaşa",
    "Nilüfer", "Osmangazi", "Yıldırım"
  ],
  "Antalya": [
    "Aksu", "Alanya", "Döşemealtı", "Finike",
    "Kepez", "Konyaaltı", "Manavgat", "Muratpaşa",
    "Serik"
  ],
  "Muğla": [
    "Bodrum", "Dalaman", "Datça", "Fethiye",
    "Köyceğiz", "Marmaris", "Milas", "Ortaca",
    "Seydikemer"
  ]
};
const cityIds = {
  "İstanbul": 34,
  "Ankara": 6,
  "İzmir": 35,
  "Bursa": 16,
  "Antalya": 7,
  "Muğla": 48
};
// Şehir değiştiğinde ilçeleri getir
citySelect.addEventListener("change", function () {
  const city = this.value;

  districtSelect.innerHTML = '<option value="">Tüm ilçeler</option>';

  if (districts[city]) {
    districts[city].forEach(district => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }

  if (city) {
    document.querySelector(".empty-state h3").textContent =
      city + " fiyatları için veri bekleniyor";
  }
});

// Kategori seçimi

categoryCards.forEach(card => {
  card.addEventListener("click", function () {
    categoryCards.forEach(item => item.classList.remove("active"));

    this.classList.add("active");

    selectedCategory = this.dataset.category;

    const names = {
      benzin: "Benzin",
      motorin: "Motorin",
      lpg: "LPG",
      elektrik: "Hızlı Şarj"
    };

    document.querySelector("#karsilastir .section-heading h2").textContent =
      names[selectedCategory] + " fiyatlarını karşılaştır";

    if (citySelect.value) {
      searchButton.click();
    } else {
      document.getElementById("priceResults").innerHTML = `
        <div class="empty-state">
          <span>📡</span>
          <h3>${names[selectedCategory]} fiyatlarını görmek için şehir seçiniz</h3>
          <p>Önce bir şehir seçip fiyatları karşılaştırınız.</p>
        </div>
      `;
    }
  });
});


// Fiyatları göster butonu

// Fiyatları API'den çek ve göster
searchButton.addEventListener("click", async function () {
  const city = citySelect.value;
  const district = districtSelect.value;
  const brand = brandSelect.value;

  if (!city) {
    alert("Lütfen önce bir şehir seçiniz.");
    return;
  }

  document.getElementById("karsilastir").scrollIntoView({
    behavior: "smooth"
  });

  const results = document.getElementById("priceResults");

  results.innerHTML = `
    <div class="empty-state">
      <span>⏳</span>
      <h3>Fiyatlar getiriliyor...</h3>
      <p>Güncel kaynak kontrol ediliyor.</p>
    </div>
  `;

  try {
    const params = new URLSearchParams({
      city: city,
      category: selectedCategory
    });

    if (district) params.set("district", district);
    if (brand) params.set("brand", brand);

    const apiUrl =
      "https://yakit-radari-api.cafercelik0319.workers.dev/api/prices?" +
      params.toString();

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Fiyatlar alınamadı.");
    }

    if (!data.prices || data.prices.length === 0) {
      results.innerHTML = `
        <div class="empty-state">
          <span>📡</span>
          <h3>Henüz fiyat verisi bulunmuyor</h3>
          <p>${data.message || "Bu seçim için doğrulanmış fiyat kaynağı bağlı değil."}</p>
        </div>
      `;
      return;
    }

    let prices = [...data.prices];

    if (sortSelect.value === "desc") {
      prices.sort((a, b) => b.price - a.price);
    } else {
      prices.sort((a, b) => a.price - b.price);
    }

    results.innerHTML = `
      <div class="price-results-grid">
        ${prices.map(item => `
          <div class="price-card">
            <div class="price-card-top">
              <strong>${item.brand}</strong>
              <span>${item.region}</span>
            </div>
            <h3>${item.category === "elektrik" ? "HIZLI ŞARJ (DC)" : item.category.toLocaleUpperCase("tr-TR")}</h3>
           <div class="price-value">
  ${item.display_price || Number(item.price).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}
  <small>₺ / ${item.unit.replace("TL/", "")}</small>
</div>
<p>${item.city} · KDV dahil</p>
${item.tariff_date ? `<small>Tarife tarihi: ${item.tariff_date}</small>` : ""}
        `).join("")}
      </div>
    <p class="source-note">
  Kaynak: ${data.source} · ${
    selectedCategory === "elektrik"
      ? "Halka açık DC şarj operatörlerinin tarifeleridir. Fiyatlar istasyon, soket gücü ve üyelik koşullarına göre değişebilir."
      : "Bölgesel yayımlanan akaryakıt fiyatlarıdır. İstasyon pompa fiyatı garantisi değildir."
  }
</p>
    `;

  } catch (error) {
    results.innerHTML = `
      <div class="empty-state">
        <span>⚠️</span>
        <h3>Fiyatlar alınamadı</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
});


// Sıralama ve marka filtreleri
brandSelect.addEventListener("change", function () {
  console.log("Marka filtresi:", this.value);
});

sortSelect.addEventListener("change", function () {
  console.log("Fiyat sıralaması:", this.value);
});

console.log("Yakıt Radarı hazır.");
console.log("Seçili kategori:", selectedCategory);
