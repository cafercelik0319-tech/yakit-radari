
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
      elektrik: "Elektrik"
    };

    document.querySelector("#karsilastir .section-heading h2").textContent =
      names[selectedCategory] + " fiyatlarını karşılaştır";

    document.querySelector(".empty-state h3").textContent =
      names[selectedCategory] + " fiyat verileri hazırlanıyor";
  });
});

// Fiyatları göster butonu
searchButton.addEventListener("click", function () {
  const city = citySelect.value;

  if (!city) {
    alert("Lütfen önce bir şehir seçiniz.");
    return;
  }

  document.getElementById("karsilastir").scrollIntoView({
    behavior: "smooth"
  });

  document.querySelector(".empty-state h3").textContent =
    city + " için doğrulanmış fiyat verisi bekleniyor";
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
