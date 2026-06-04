import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const pool = new pg.Pool({ connectionString });

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

try {
  const { rows: check } = await pool.query("SELECT count(*)::int AS cnt FROM leads");
  console.log(`Current leads: ${check[0].cnt}`);

  // Ambil user IDs yang sudah ada
  const { rows: users } = await pool.query("SELECT id, role FROM crm_users");
  const admins = users.filter(u => u.role === "admin").map(u => u.id);
  const sales = users.filter(u => u.role === "sales").map(u => u.id);
  const allUsers = [...admins, ...sales];
  console.log("Users found:", users.length);

  await pool.query("BEGIN");

  // ── Data master ────────────────────────────────────────────
  const companies = [
    { name: "PT Maju Jaya Packaging", contact: "Budi Pratama", phone: "081234567001", email: "budi@majujaya.co.id" },
    { name: "PT Tekstil Indo", contact: "Siti Rahayu", phone: "081234567002", email: "siti@tekstilindo.com" },
    { name: "Fresh Food Indonesia", contact: "Andi Wijaya", phone: "081234567003", email: "andi@freshfood.id" },
    { name: "Cosmetic Lab Indonesia", contact: "Dewi Lestari", phone: "081234567004", email: "dewi@cosmeticlab.id" },
    { name: "PT Gudang Pro", contact: "Rudi Hartono", phone: "081234567005", email: "rudi@gudangpro.co.id" },
    { name: "Organik Farm", contact: "Maya Putri", phone: "081234567006", email: "maya@organikfarm.id" },
    { name: "PT Berkah Mandiri", contact: "Irwan Surya", phone: "081234567007", email: "irwan@berkahmandiri.com" },
    { name: "Pharma Health", contact: "Hendra Gunawan", phone: "081234567008", email: "hendra@pharmahealth.co.id" },
    { name: "Beverage Indo", contact: "Lina Susanti", phone: "081234567009", email: "lina@beverageindo.com" },
    { name: "PT Solusi Packaging", contact: "Tono Sulistyo", phone: "081234567010", email: "procurement@solusipack.id" },
    { name: "MiniMarket Nusantara", contact: "Agus Setiawan", phone: "081234567011", email: "agus@minimarket.id" },
    { name: "PT Nusantara Food", contact: "Rina Marlina", phone: "081234567012", email: "buyer@nusantarafood.co.id" },
    { name: "Green Earth Indonesia", contact: "Fina Wulandari", phone: "081234567013", email: "fina@greenearth.id" },
    { name: "Retail Max", contact: "Bambang Suryanto", phone: "081234567014", email: "bambang@retailmax.co.id" },
    { name: "PT Cipta Karya", contact: "Dian Permana", phone: "081234567015", email: "info@ciptakarya.com" },
    { name: "Auto Supply Indonesia", contact: "Joko Prabowo", phone: "081234567016", email: "joko@autosupply.id" },
    { name: "PT Global Export", contact: "Kevin Tanoto", phone: "081234567017", email: "export@globalx.co.id" },
    { name: "Beauty Shop Indonesia", contact: "Sarah Amelia", phone: "081234567018", email: "sarah@beautyshop.id" },
    { name: "PT Indah Kiat", contact: "Mega Safitri", phone: "081234567019", email: "purchase@indahkiat.com" },
    { name: "Herba Life Indonesia", contact: "Yuni Astuti", phone: "081234567020", email: "yuni@herballife.id" },
    { name: "PT Karya Bersama", contact: "Wahyu Hidayat", phone: "081234567021", email: "ops@karyabersama.co.id" },
    { name: "Snack King", contact: "Dian Purnama", phone: "081234567022", email: "dian@snackking.id" },
    { name: "Chem Pro Indonesia", contact: "Reza Firmansyah", phone: "081234567023", email: "reza@chempro.id" },
    { name: "Coffee Lab", contact: "Nita Sari", phone: "081234567024", email: "nita@coffeelab.id" },
    { name: "PT Sinar Abadi", contact: "Eko Prasetyo", phone: "081234567025", email: "eko@sinarabadi.co.id" },
    { name: "Kopi Nusantara", contact: "Arief Budiman", phone: "081234567026", email: "arief@kopinusantara.id" },
    { name: "PT Plastik Maju", contact: "Surya Dharma", phone: "081234567027", email: "surya@plastikmaju.com" },
    { name: "Food Junction", contact: "Linda Wijaya", phone: "081234567028", email: "linda@foodjunction.id" },
    { name: "PT Eco Packaging", contact: "Ratna Dewi", phone: "081234567029", email: "ratna@ecopackaging.id" },
    { name: "SkinCare Lab", contact: "Putri Handayani", phone: "081234567030", email: "putri@skincarelab.id" },
    { name: "PT Logistik Prima", contact: "Hadi Nugroho", phone: "081234567031", email: "hadi@logistikprima.co.id" },
    { name: "Tani Makmur", contact: "Sugeng Wibowo", phone: "081234567032", email: "sugeng@tanimakmur.id" },
    { name: "PT Konstruksi Mandiri", contact: "Asep Sunandar", phone: "081234567033", email: "asep@konstrukmandiri.com" },
    { name: "Baby Care Indonesia", contact: "Indah Permata", phone: "081234567034", email: "indah@babycare.id" },
    { name: "PT Metal Works", contact: "Fajar Ramadhan", phone: "081234567035", email: "fajar@metalworks.co.id" },
    { name: "Digital Print Co.", contact: "Nadia Kusuma", phone: "081234567036", email: "nadia@digitalprint.id" },
    { name: "PT Kimia Utama", contact: "Bagus Setiadi", phone: "081234567037", email: "bagus@kimiautama.com" },
    { name: "Restoran Padang Jaya", contact: "Rizal Minang", phone: "081234567038", email: "rizal@padangjaya.id" },
    { name: "PT Furniture Kita", contact: "Yoga Mahendra", phone: "081234567039", email: "yoga@furniturekita.co.id" },
    { name: "Halal Market", contact: "Ahmad Ridwan", phone: "081234567040", email: "ahmad@halalmarket.id" },
    { name: "PT Elektronik Jaya", contact: "Vicky Ananda", phone: "081234567041", email: "vicky@elektronikjaya.com" },
    { name: "Susu Nusantara", contact: "Dwi Ratnasari", phone: "081234567042", email: "dwi@susunusantara.id" },
    { name: "PT Batik Premium", contact: "Citra Ayu", phone: "081234567043", email: "citra@batikpremium.co.id" },
    { name: "Sport Nutrition ID", contact: "Doni Saputra", phone: "081234567044", email: "doni@sportnutrition.id" },
    { name: "PT Roti Bahagia", contact: "Mira Anggraeni", phone: "081234567045", email: "mira@rotibahagia.com" },
    { name: "Clean Energy Indonesia", contact: "Bayu Aditya", phone: "081234567046", email: "bayu@cleanenergy.id" },
    { name: "PT Rubber Tech", contact: "Gilang Permana", phone: "081234567047", email: "gilang@rubbertech.co.id" },
    { name: "Toko Buku Grama", contact: "Lintang Kirana", phone: "081234567048", email: "lintang@tokobukugrama.id" },
    { name: "PT Petrokimia Indo", contact: "Oscar Wijaya", phone: "081234567049", email: "oscar@petrokimiaindo.com" },
    { name: "Aquafarm Indonesia", contact: "Samudra Putra", phone: "081234567050", email: "samudra@aquafarm.id" },
  ];

  const sourcePages = [
    "Halaman Kontak",
    "Halaman Produk",
    "Halaman Utama",
    "Halaman Layanan",
    "Halaman Proyek",
    "Halaman Tentang Kami",
  ];

  const messages = [
    "Tertarik dengan kemasan food-grade untuk produk kami.",
    "Butuh solusi packaging untuk line produksi baru.",
    "Minta quotasi untuk kemasan frozen food.",
    "Mau tahu opsi packaging ramah lingkungan.",
    "Cari supplier kemasan industri untuk skala besar.",
    "Tertarik packaging biodegradable untuk produk kami.",
    "Need custom packaging solution untuk export market.",
    "Butuh kemasan pharmaceutical grade.",
    "Minta sample cup dan botol plastik.",
    "Diskusi kontrak tahunan untuk supply kemasan.",
    "Butuh kantong belanja custom dengan logo brand.",
    "Order kemasan snack dalam jumlah besar.",
    "Partner untuk packaging berkelanjutan.",
    "Cari kemasan plastik untuk retail chain.",
    "Tolong kirimkan catalog packaging industri.",
    "Butuh packaging untuk spare part otomotif.",
    "Ingin kerjasama untuk packaging ekspor.",
    "Bisa kirim sample ke alamat kantor?",
    "Negosiasi harga packaging corrugated.",
    "Tertarik kemasan dengan desain custom.",
    "Minta proposal untuk packaging F&B line baru.",
    "Butuh packaging kopi untuk 10 outlet.",
    "Cari kemasan kosmetik premium.",
    "Butuh pouch standing untuk produk herbal.",
    "Minta info packaging untuk produk bayi.",
    "Tertarik dengan kemasan vacuum seal.",
    "Cari supplier label stiker custom.",
    "Butuh packaging makanan frozen.",
    "Tertarik karton box custom print.",
    "Minta penawaran packaging industri.",
  ];

  const statuses = ["new", "contacted", "qualified", "proposal_sent", "won", "lost", "rejected"];
  // Distribusi: banyak di new, makin sedikit ke bawah, won cukup banyak
  const statusWeights = [14, 12, 10, 8, 12, 8, 4]; // total ~68 leads

  // ── Generate leads tersebar di 14 hari ──────────────────────
  const now = new Date();
  const leadsToInsert = [];

  // Pastikan setiap hari punya minimal 2-5 leads untuk tren chart
  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const leadsPerDay = randomInt(3, 7);
    for (let j = 0; j < leadsPerDay; j++) {
      const comp = randomItem(companies);
      const hour = randomInt(7, 20);
      const minute = randomInt(0, 59);

      // Pilih status berdasarkan bobot
      const totalWeight = statusWeights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;
      let status = statuses[0];
      for (let k = 0; k < statuses.length; k++) {
        rand -= statusWeights[k];
        if (rand <= 0) { status = statuses[k]; break; }
      }

      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - dayOffset);
      createdAt.setHours(hour, minute, 0, 0);

      leadsToInsert.push({
        name: comp.contact,
        phone: comp.phone,
        email: comp.email,
        company: comp.name,
        message: randomItem(messages),
        sourcePage: randomItem(sourcePages),
        status,
        assignedTo: randomItem(allUsers),
        createdAt,
      });
    }
  }

  // ── Insert leads ────────────────────────────────────────────
  const insertedLeads = [];
  for (const lead of leadsToInsert) {
    const result = await pool.query(
      `INSERT INTO leads (name, phone, email, company, message, source_page, source_url, status, assigned_to, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, $8, $9, $9) RETURNING id, status, created_at`,
      [lead.name, lead.phone, lead.email, lead.company, lead.message, lead.sourcePage, lead.status, lead.assignedTo, lead.createdAt.toISOString()],
    );
    insertedLeads.push({ id: result.rows[0].id, status: lead.status, createdAt: lead.createdAt });
  }
  console.log(`Inserted ${insertedLeads.length} leads`);

  // ── Insert activities untuk setiap lead ─────────────────────
  const statusFlow = ["new", "contacted", "qualified", "proposal_sent", "won"];
  const lostFlow = ["new", "contacted", "qualified", "proposal_sent", "lost"];
  const rejectedFlow = ["new", "contacted", "rejected"];
  const allFlows = { won: statusFlow, lost: lostFlow, rejected: rejectedFlow };

  const contactBodies = [
    "Sudah dihubungi via WhatsApp.",
    "Ditelepon, ada di sini.",
    "Dikirim email follow up.",
    "Chat WhatsApp terkait kebutuhan packaging.",
    "Kontak via telepon siang tadi.",
  ];
  const qualifiedBodies = [
    "Lead memenuhi kualifikasi, lanjut ke proposal.",
    "Kebutuhan clear, siap proposal.",
    "Budget dan timeline cocok.",
    "Spesifikasi sudah dikonfirmasi.",
    "Kualifikasi teknis terpenuhi.",
  ];
  const proposalBodies = [
    "Proposal sudah dikirim via email.",
    "Presentasi penawaran selesai.",
    "Quotation terkirim, menunggu review.",
    "Diskusi harga selesai, tunggu keputusan.",
    "Proposal revisi sudah dikirim.",
  ];
  const wonBodies = [
    "Deal! Client setuju dengan penawaran.",
    "PO diterima, lanjut produksi.",
    "Kontrak ditandatangani.",
    "Pembayaran DP sudah masuk.",
    "Win! Kerjasama resmi dimulai.",
  ];
  const lostBodies = [
    "Client memutuskan tidak lanjut.",
    "Kompetitor dipilih, harga lebih murah.",
    "Timeline tidak cocok.",
    "Budget dipotong, project ditunda.",
    "Tidak ada respons setelah 3x follow up.",
  ];
  const rejectedBodies = [
    "Budget tidak cocok.",
    "Spesifikasi tidak bisa dipenuhi.",
    "Area layanan tidak terjangkau.",
    "Lead tidak valid.",
  ];
  const noteBodies = [
    "Follow up minggu depan.",
    "Menunggu konfirmasi dari procurement.",
    "Client minta sample warna baru.",
    "Koordinasi dengan tim produksi.",
    "Diskusi harga volume besar.",
    "Jadwalkan meeting Jumat.",
    "Kirim brosur terbaru.",
    "Update progress ke management.",
    "Cek ketersediaan stok bahan.",
    "Konfirmasi ulang jumlah order.",
  ];

  let activityCount = 0;

  for (const lead of insertedLeads) {
    const userId = randomItem(allUsers);
    const flow = allFlows[lead.status] || [lead.status];

    // lead_created
    await pool.query(
      `INSERT INTO lead_activities (lead_id, user_id, type, body, to_status, created_at)
       VALUES ($1, $2, 'lead_created', 'Lead baru masuk dari website.', 'new', $3)`,
      [lead.id, userId, lead.createdAt.toISOString()],
    );
    activityCount++;

    // Aktivitas sesuai flow status
    const currentFlowIdx = flow.indexOf(lead.status);

    for (let i = 1; i <= currentFlowIdx; i++) {
      const prevStatus = flow[i - 1];
      const currStatus = flow[i];
      const hoursOffset = i * randomInt(4, 24);
      const actTime = new Date(lead.createdAt.getTime() + hoursOffset * 3600000);

      let body;
      if (currStatus === "contacted") body = randomItem(contactBodies);
      else if (currStatus === "qualified") body = randomItem(qualifiedBodies);
      else if (currStatus === "proposal_sent") body = randomItem(proposalBodies);
      else if (currStatus === "won") body = randomItem(wonBodies);
      else if (currStatus === "lost") body = randomItem(lostBodies);
      else if (currStatus === "rejected") body = randomItem(rejectedBodies);
      else body = `Status diubah ke ${currStatus}.`;

      await pool.query(
        `INSERT INTO lead_activities (lead_id, user_id, type, body, from_status, to_status, created_at)
         VALUES ($1, $2, 'status_change', $3, $4, $5, $6)`,
        [lead.id, randomItem(allUsers), body, prevStatus, currStatus, actTime.toISOString()],
      );
      activityCount++;
    }

    // Tambah 1-3 note random
    const noteCount = randomInt(1, 3);
    for (let n = 0; n < noteCount; n++) {
      const noteOffset = randomInt(1, 72);
      const noteTime = new Date(lead.createdAt.getTime() + noteOffset * 3600000);

      await pool.query(
        `INSERT INTO lead_activities (lead_id, user_id, type, body, created_at)
         VALUES ($1, $2, 'note', $3, $4)`,
        [lead.id, randomItem(allUsers), randomItem(noteBodies), noteTime.toISOString()],
      );
      activityCount++;
    }
  }

  console.log(`Inserted ${activityCount} activities`);
  await pool.query("COMMIT");

  // ── Summary ────────────────────────────────────────────────
  const summary = await pool.query("SELECT status, count(*)::int AS cnt FROM leads GROUP BY status ORDER BY status");
  console.log("\nFinal pipeline:", summary.rows);

  const srcSummary = await pool.query("SELECT COALESCE(source_page,'Lainnya') AS src, count(*)::int AS cnt FROM leads GROUP BY source_page ORDER BY cnt DESC");
  console.log("Sources:", srcSummary.rows);

  const totalLeads = await pool.query("SELECT count(*)::int AS t FROM leads");
  const totalAct = await pool.query("SELECT count(*)::int AS t FROM lead_activities");
  console.log(`\nTotal: ${totalLeads.rows[0].t} leads, ${totalAct.rows[0].t} activities`);

} catch (err) {
  await pool.query("ROLLBACK").catch(() => {});
  console.error("Seed failed:", err);
  process.exit(1);
} finally {
  await pool.end();
}
