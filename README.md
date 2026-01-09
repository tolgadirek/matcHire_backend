# 🔙 matcHire Backend API

**matcHire** ekosisteminin sunucu tarafıdır. Veritabanı yönetimi, kimlik doğrulama (Auth), dosya işlemleri ve AI servisi ile Frontend arasındaki köprüyü kuran ana API servisidir.

![Node.js](https://img.shields.io/badge/Node.js-v18-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![Prisma](https://img.shields.io/badge/ORM-Prisma-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

## 🚀 Temel Özellikler

- **🔐 Güvenli Kimlik Doğrulama:**
  - JWT (JSON Web Token) tabanlı oturum yönetimi.
  - BCrypt ile şifrelenmiş parola saklama.
- **👥 Rol Tabanlı Erişim Kontrolü (RBAC):**
  - **İşveren (Employer):** İş ilanı oluşturma, düzenleme, silme ve başvuran CV'leri görüntüleme.
  - **İş Arayan (Seeker):** Kendi profilini yönetme ve sistemin sunduğu eksik yetkinlik analizlerini görme.
- **📂 Gelişmiş Dosya Yönetimi:**
  - `Multer` ile PDF formatındaki CV'leri yükleme.
  - Türkçe karakter içeren dosya isimlerini (UTF-8) bozmadan disk üzerinde saklama.
- **🔗 AI Entegrasyonu:**
  - Python AI servisine proxy görevi görerek analiz isteklerini iletir ve sonuçları işler.
- **🗄️ Veri Tutarlılığı:**
  - Prisma ORM ile MongoDB üzerinde tip güvenli veritabanı işlemleri.

## 📂 Proje Yapısı

- matcHire_backend/
  - `controllers/` : İş mantığı (Auth, CV, Job, Similarity)
  - `middlewares/` : Yetkilendirme (Auth) ve Dosya Yükleme (Multer) kontrolleri
  - `prisma/` : Veritabanı şeması (schema.prisma)
  - `routes/` : API endpoint tanımları
  - `utils/` : Logger ve yardımcı fonksiyonlar
  - `index.js` : Sunucu giriş noktası
  - `.env` : Çevre değişkenleri
  - `.gitignore`

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1️⃣ Repoyu Klonlayın

```bash
git clone https://github.com/tolgadirek/matcHire_backend.git
cd matcHire_backend
```

### 2️⃣ Bağımlılıkları Yükleyin

```bash
npm install
```

### 3️⃣ Çevre Değişkenlerini Ayarlayın (.env)

Ana dizinde .env adında bir dosya oluşturun ve aşağıdaki değerleri kendi sisteminize göre doldurun:

```bash
DATABASE_URL="mongo db bağlantınız"
SECRET_TOKEN="Oluşturacağınız secret key"
```

### 4️⃣ Prisma İstemcisini Oluşturun

Veritabanı şemasını senkronize etmek için:

```bash
npx prisma generate
```

### 5️⃣ Sunucuyu Başlatın

```bash
npm run dev
```

#### 🔗 İlgili Repolar

Tam çalışan bir sistem için aşağıdaki servislerin de ayakta olması gerekir:

🧠 AI Service: [matchire_ai](https://github.com/tolgadirek/matcHire_ai)

💻 Frontend: [matcHire_frontend](https://github.com/Jessitoii/matcHire_frontend)

## 👥 Ekip Üyeleri

| İsim Soyisim       | GitHub Profili                                 |
| :----------------- | :--------------------------------------------- |
| **Tolga Direk**    | [@tolgadirek](https://github.com/tolgadirek)   |
| **Alper Can Özer** | [@Jessitoii](https://github.com/Jessitoii) |
