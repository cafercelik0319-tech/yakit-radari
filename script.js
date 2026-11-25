
const citySelect = document.getElementById("citySelect");
const districtSelect = document.getElementById("districtSelect");
const searchButton = document.getElementById("searchButton");
const categoryCards = document.querySelectorAll(".category-card");
const brandSelect = document.getElementById("brandSelect");
const sortSelect = document.getElementById("sortSelect");

let selectedCategory = "benzin";
let chargingMap = null;

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
const cityIds = {};

// 81 ili API'den otomatik yükle
async function loadCities() {
  citySelect.disabled = true;
  citySelect.innerHTML =
    '<option value="">Şehirler yükleniyor...</option>';

  try {
    const response = await fetch(
      "https://yakit-radari-api.cafercelik0319.workers.dev/api/cities"
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Şehirler alınamadı.");
    }

    citySelect.innerHTML =
      '<option value="">Şehir seçiniz</option>';

    data.cities.forEach(city => {
      cityIds[city.name] = city.plate_code;

      const option = document.createElement("option");
      option.value = city.name;
      option.textContent = city.name;

      citySelect.appendChild(option);
    });

    console.log("Yüklenen şehir sayısı:", data.count);

  } catch (error) {
    citySelect.innerHTML =
      '<option value="">Şehirler yüklenemedi</option>';

    console.error(error);
  } finally {
    citySelect.disabled = false;
  }
}

loadCities();
// Şehir değiştiğinde ilçeleri D1 veritabanından getir
citySelect.addEventListener("change", async function () {
  const city = this.value;
  const cityCode = cityIds[city];

  districtSelect.innerHTML =
    '<option value="">İlçeler yükleniyor...</option>';
  districtSelect.disabled = true;

  if (!city || !cityCode) {
    districtSelect.innerHTML =
      '<option value="">Önce şehir seçiniz</option>';
    districtSelect.disabled = false;
    return;
  }

  try {
    const districts = await getChargingDistricts(cityCode);

    districtSelect.innerHTML =
      '<option value="">Tüm ilçeler</option>';

    districts.forEach(district => {
      const option = document.createElement("option");
      option.value = district.id;
      option.textContent = district.name;
      districtSelect.appendChild(option);
    });

  } catch (error) {
    districtSelect.innerHTML =
      '<option value="">İlçeler alınamadı</option>';
    console.error("İlçe yükleme hatası:", error);
  } finally {
    districtSelect.disabled = false;
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
    // Elektrik kategorisinde gerçek şarj istasyonlarını getir
if (selectedCategory === "elektrik") {
  const cityCode = cityIds[city];
  const districtId = districtSelect.value;

 const cityCode = cityIds[city];
const districtId = districtSelect.value;

console.log("Şehir:", city, "Kod:", cityCode);
console.log("İlçe:", districtSelect.options[districtSelect.selectedIndex]?.text);
console.log("İlçe ID:", districtId);

const stationParams = new URLSearchParams();
stationParams.set("city", String(cityCode));

if (districtId !== "") {
  stationParams.set("district", String(districtId));
}

console.log("Gönderilen API adresi:",
  "https://yakit-radari-api.cafercelik0319.workers.dev/api/charging-stations?" +
  stationParams.toString()
);

const stationResponse = await fetch(
  "https://yakit-radari-api.cafercelik0319.workers.dev/api/charging-stations?" +
  stationParams.toString()
);

const stationData = await stationResponse.json();

  if (!stationResponse.ok || !stationData.success) {
    throw new Error("Şarj istasyonları alınamadı.");
  }

  const stationHtml = stationData.stations.map(station => `
    <div class="price-card">
      <div class="price-card-top">
        <strong>${station.station_name || station.operator}</strong>
        <span>${station.district}</span>
      </div>
      <h3>${station.brand || station.operator}</h3>
      <p>${station.address || "Adres bilgisi bulunmuyor"}</p>
      <p>DC soket sayısı: ${station.dc_socket_count || 0}</p>
      <p>DC güç: ${station.dc_power_summary || "Belirtilmemiş"}</p>
    </div>
  `).join("");

  results.insertAdjacentHTML("beforeend", `
  <div class="station-results">
    <h3>Şarj İstasyonları (${stationData.count})</h3>

    <div
      id="chargingMap"
      style="width:100%; height:420px; border-radius:14px; margin:16px 0;"
    ></div>

    <div class="price-results-grid">
      ${stationHtml || "<p>Bu ilçede istasyon bulunamadı.</p>"}
    </div>
  </div>
`);
  // Önceki haritayı temizle
if (chargingMap) {
  chargingMap.remove();
  chargingMap = null;
}

const validStations = stationData.stations.filter(station => {
  const lat = Number(station.latitude);
  const lng = Number(station.longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    station.latitude !== null &&
    station.longitude !== null &&
    station.latitude !== "" &&
    station.longitude !== ""
  );
});

const mapElement = document.getElementById("chargingMap");

if (validStations.length > 0 && window.L && mapElement) {
  chargingMap = L.map("chargingMap");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap katkıda bulunanlar"
  }).addTo(chargingMap);

  const bounds = [];

  validStations.forEach(station => {
    const lat = Number(station.latitude);
    const lng = Number(station.longitude);

    const marker = L.marker([lat, lng]).addTo(chargingMap);

    const popup = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = station.station_name || station.operator || "Şarj istasyonu";

    const brand = document.createElement("p");
    brand.textContent = station.brand || station.operator || "";

    const power = document.createElement("p");
    power.textContent = "DC güç: " + (station.dc_power_summary || "Belirtilmemiş");

    popup.append(title, brand, power);
    marker.bindPopup(popup);

    bounds.push([lat, lng]);
  });

  chargingMap.fitBounds(bounds, { padding: [30, 30] });

  setTimeout(() => chargingMap.invalidateSize(), 100);
} else if (mapElement) {
  mapElement.innerHTML =
    '<p style="padding:20px;">Bu istasyonlar için harita koordinatı bulunamadı.</p>';
}
}

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


// Marka değişince fiyatları yeniden getir
brandSelect.addEventListener("change", function () {
  if (citySelect.value) {
    searchButton.click();
  }
});

// Sıralama değişince fiyatları yeniden sırala
sortSelect.addEventListener("change", function () {
  if (citySelect.value) {
    searchButton.click();
  }
});

console.log("Yakıt Radarı hazır.");
console.log("Seçili kategori:", selectedCategory);

async function getChargingDistricts(cityId) {
  const response = await fetch(
    `https://yakit-radari-api.cafercelik0319.workers.dev/api/districts?city=${cityId}`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error("İlçe bilgileri alınamadı.");
  }

  return data.districts;
}
