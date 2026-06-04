import pg from "pg";
const pool = new pg.Pool({ connectionString: "postgresql://postgres:admin123@localhost:5432/lms_cms" });

async function upsert(key, data) {
  await pool.query(
    `UPDATE cms_globals SET data = $1::jsonb, updated_at = now() WHERE key = $2`,
    [JSON.stringify(data), key]
  );
  console.log(`  ✅ ${key} (${JSON.stringify(data).length} chars)`);
}

async function run() {
  console.log("Seeding globals...\n");

  // ─── CTA ─────────────────────────────────────────
  await upsert("cta", {
    headline: "Siap Bertumbuh Bersama MRS?",
    body_text: "Mulai kemitraan strategis dengan kepastian kualitas Halgreen™, total support, dan program MOP yang membawa keberkahan bagi bisnis Anda.",
    primary_cta: { label: "Ajukan Kemitraan", href: "/kontak" },
    secondary_cta: { label: "Lihat Program Mitra", href: "/program-mitra" },
    contact_info: {
      company_name: "Makmur Raya Sejahtera",
      tagline: "Halal-Green, Quality & Total Support",
      whatsapp: "6281234567890",
      email: "sales.demo@mrs-packaging.test",
      address: "Jl. Pertanian No.22, Area Sawah, Pondok, Kec. Babadan, Kabupaten Ponorogo, Jawa Timur 63491"
    },
    footer_text: "Makmur Raya Sejahtera (MRS) | Provider Kemasan Plastik Halgreen™ | Program Mitra MOP"
  });

  // ─── LOCATIONS ─────────────────────────────────────
  await upsert("locations", {
    locations: [
      {
        label: "Kantor Pusat & Pabrik",
        city: "Ponorogo",
        address: "Jl. Pertanian No.22, Area Sawah, Pondok, Kec. Babadan, Kabupaten Ponorogo, Jawa Timur 63491",
        description: "Kantor pusat dan pabrik utama MRS. Pusat produksi kemasan plastik berstandar Halgreen™.",
        phone: "+62 (21) 5555-1020",
        maps_url: "https://www.google.com/maps?q=Jl.+Pertanian+No.22+Ponorogo",
        is_primary: true
      },
      {
        label: "Area Distribusi",
        city: "Surabaya",
        address: "Kawasan Industri Surabaya, Jawa Timur",
        description: "Pusat distribusi untuk wilayah Jawa Timur dan Indonesia Timur.",
        phone: "+62 (21) 5555-1021",
        maps_url: "https://www.google.com/maps?q=Surabaya+Jawa+Timur",
        is_primary: false
      },
      {
        label: "Representatif",
        city: "Jakarta",
        address: "Wilayah Jabodetabek, DKI Jakarta",
        description: "Perwakilan untuk koordinasi mitra di wilayah Jabodetabek dan Indonesia Barat.",
        phone: "+62 (21) 5555-1022",
        maps_url: "https://www.google.com/maps?q=Jakarta",
        is_primary: false
      }
    ]
  });

  // ─── STATS ─────────────────────────────────────────
  await upsert("stats", {
    items: [
      { value: "20+", suffix: " Tahun", label: "Pengalaman Industri", icon: "calendar" },
      { value: "500", suffix: "+", label: "Mitra Distributor", icon: "users" },
      { value: "30", suffix: "+ Provinsi", label: "Jangkauan Distribusi", icon: "map-pin" },
      { value: "100", suffix: "+", label: "Variasi Produk", icon: "package" }
    ]
  });

  // ─── BENEFIT ANALYSIS ──────────────────────────────
  await upsert("benefit_analysis", {
    eyebrow: "Brand Essentials | Benefit Analysis",
    headline: "Benefit Analysis",
    subheadline: "Memahami manfaat fungsional dan emosional yang MRS hadirkan bagi setiap mitra distributor.",
    functional_benefits_title: "FUNCTIONAL BENEFITS",
    functional_benefits_description: "Manfaat nyata yang langsung dirasakan dalam operasional bisnis mitra.",
    functional_benefits: [
      { text: "Konsistensi kualitas kemasan berstandar Halgreen™ — minim retur dan komplain", id: "fb-1" },
      { text: "Ketepatan waktu pengiriman yang terukur dan dapat diprediksi", id: "fb-2" },
      { text: "Variasi produk lengkap untuk memenuhi kebutuhan berbagai segmen pasar", id: "fb-3" },
      { text: "Proses produksi higienis dan terstandarisasi sesuai regulasi food grade", id: "fb-4" },
      { text: "Harga kompetitif dengan skema margin yang adil bagi distributor", id: "fb-5" }
    ],
    emotional_benefits_title: "EMOTIONAL BENEFITS",
    emotional_benefits_description: "Nilai yang dirasakan secara mendalam oleh mitra dalam setiap interaksi.",
    emotional_benefits: [
      { title: "Ketenangan Bisnis", description: "Rasa aman dan tenang karena kualitas dan pasokan terjaga konsisten.", icon: "shield", id: "eb-1" },
      { title: "Kepercayaan Diri", description: "Distributor merasa bangga dan percaya diri menjual produk berstandar Halgreen™.", icon: "star", id: "eb-2" },
      { title: "Keberkahan", description: "Kemitraan yang selaras dengan prinsip syariat membawa keberkahan dalam bisnis.", icon: "heart", id: "eb-3" },
      { title: "Sense of Belonging", description: "Merasa menjadi bagian dari ekosistem MOP yang saling mendukung pertumbuhan.", icon: "users", id: "eb-4" }
    ]
  });

  // ─── BRAND PYRAMID ─────────────────────────────────
  await upsert("brand_pyramid", {
    eyebrow: "Brand Essentials | Brand Pyramid",
    headline: "Brand Pyramid MRS",
    subheadline: "Piramida Brand MRS mencerminkan fondasi kokoh menuju kemitraan yang membawa kemakmuran dan keberkahan.",
    levels: [
      { level_name: "Apex — Brand Essence", content: "Wasilah Kemakmuran & Keberkahan — MRS menjadi perantara kebaikan yang membawa pertumbuhan bisnis berkelanjutan bagi mitra distributor.", id: "pyr-1" },
      { level_name: "Identity — Core Values", content: "Halgreen™ (Halal + Green), Total Support, dan Amanah — tiga pilar identitas yang membedakan MRS dari kompetitor.", id: "pyr-2" },
      { level_name: "Relevance — Emotional Benefits", content: "Ketenangan bisnis, kepercayaan diri menjual, dan keberkahan dalam setiap transaksi kemitraan.", id: "pyr-3" },
      { level_name: "Presence — Functional Benefits", content: "Kualitas kemasan konsisten, pengiriman tepat waktu, harga kompetitif, dan variasi produk lengkap.", id: "pyr-4" }
    ]
  });

  // ─── TARGET MARKET ─────────────────────────────────
  await upsert("target_market", {
    eyebrow: "Brand Essentials | STP Analysis",
    headline: "Segmentation · Targeting · Positioning",
    subheadline: "Analisis STP membantu MRS fokus melayani mitra distributor yang paling selaras dengan visi kemitraan.",
    segmentation_items: [
      { text: "Distributor kemasan plastik skala menengah-besar di Indonesia", id: "seg-1" },
      { text: "Bisnis yang melayani industri makanan & minuman (F&B)", id: "seg-2" },
      { text: "Distributor yang mengutamakan kehalalan dan kualitas produk", id: "seg-3" },
      { text: "Pelaku usaha yang mencari kemitraan jangka panjang, bukan sekadar transaksi", id: "seg-4" }
    ],
    targeting_items: [
      { text: "Distributor aktif di 30+ provinsi Indonesia", id: "tgt-1" },
      { text: "Mitra yang menghargai standar Halgreen™ dan siap naik kelas", id: "tgt-2" },
      { text: "Pelaku bisnis yang menginginkan kepastian pasokan dan kualitas", id: "tgt-3" },
      { text: "Distributor yang selaras dengan prinsip kemitraan berbasis syariat", id: "tgt-4" }
    ],
    positioning_items: [
      { text: "Provider kemasan plastik Halgreen™ — bukan sekadar pemasok komoditas", id: "pos-1" },
      { text: "Mitra strategis pertumbuhan bisnis dengan total support dan program MOP", id: "pos-2" },
      { text: "Kemitraan yang membawa keberkahan, kemakmuran, dan pertumbuhan berkelanjutan", id: "pos-3" },
      { text: "Standar halal-green yang menjadi pembeda utama di industri", id: "pos-4" }
    ],
    cta_label: "Pelajari Program MOP",
    cta_href: "/program-mitra"
  });

  // ─── POSITIONING ───────────────────────────────────
  await upsert("positioning", {
    eyebrow: "Brand Essentials | Positioning",
    headline: "Brand Positioning MRS",
    subheadline: "Positioning yang membedakan MRS di pasar kemasan plastik Indonesia.",
    elements: [
      { step: "01", title: "Target Market", content: "Distributor kemasan plastik di Indonesia yang mengutamakan pertumbuhan dan profitabilitas bisnis.", is_highlighted: true, id: "elm-1" },
      { step: "02", title: "Brand For", content: "CV Makmur Raya Sejahtera (MRS) adalah provider kemasan plastik Halgreen™ yang memposisikan diri lebih dari sekadar penyedia komoditas — melainkan mitra strategis pertumbuhan bisnis Anda.", is_highlighted: false, id: "elm-2" },
      { step: "03", title: "Point of Differentiation", content: "Standar Halgreen™ (Halal + Green), layanan Total Support dengan respons cepat, dan program MOP yang membangun kemitraan jangka panjang — bukan hubungan jual-beli putus.", is_highlighted: true, id: "elm-3" },
      { step: "04", title: "Positioning Statement", content: "Menjadi wasilah kemakmuran & keberkahan melalui konsistensi kualitas kemasan, operasional bisnis yang adil & selaras syariat, serta dedikasi pada program upgrade mitra MOP.", is_highlighted: false, id: "elm-4" }
    ],
    reasons_to_believe: [
      { text: "Konsistensi Halgreen™ — standar kualitas yang terukur dan terjaga", id: "rtb-1" },
      { text: "Layanan Total Support — fast response, transparansi, dan pendampingan", id: "rtb-2" },
      { text: "Standar syariat transparan — operasional yang selaras prinsip Islam", id: "rtb-3" },
      { text: "Program MOP — ekosistem kemitraan anti jual-beli putus", id: "rtb-4" },
      { text: "Skema margin yang adil & pendampingan naik kelas bagi distributor", id: "rtb-5" }
    ]
  });

  // ─── Verify ────────────────────────────────────────
  console.log("\n=== HASIL UPDATE ===");
  const result = await pool.query("SELECT key, length(data::text) as size FROM cms_globals ORDER BY key");
  result.rows.forEach(r => {
    const icon = r.size > 100 ? "✅" : "❌";
    console.log(`  ${icon} ${r.key} -> ${r.size} chars`);
  });

  await pool.end();
  console.log("\nDone!");
}

run().catch(e => { console.error(e.message); process.exit(1); });
