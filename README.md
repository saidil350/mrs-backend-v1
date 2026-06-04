# MRS CRM

Custom CRM untuk lead website MRS. Aplikasi ini memisahkan lead management dari Payload CMS.

## Local Setup

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run user:create -- "Admin MRS" "admin@mrs.local" "change-me" "admin"
npm run dev
```

Dashboard berjalan di `http://localhost:3002`.

## Public Lead API

```http
POST /api/leads
Authorization: Bearer <PUBLIC_LEAD_SECRET>
Content-Type: application/json
```

Payload:

```json
{
  "name": "Budi",
  "phone": "08123456789",
  "email": "budi@mail.com",
  "company": "PT Contoh",
  "message": "Saya tertarik produk plastik",
  "sourcePage": "kontak",
  "sourceUrl": "https://mrs.amanahapp.run/kontak"
}
```

## Migrasi Lead Lama

```bash
CMS_URL=https://cms.mrs.amanahapp.run \
CMS_API_TOKEN=<payload_api_token> \
DATABASE_URL=<crm_database_url> \
npm run leads:migrate-from-cms
```

Setelah migrasi terverifikasi, collection `Leads` dinonaktifkan dari konfigurasi Payload CMS.
