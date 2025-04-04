# Laporan Implementasi CI/CD pada API 

## 1. Pendahuluan
**Dokumentasi ini menjelaskan proses implementasi Continuous Integration dan Continuous Deployment (CI/CD) untuk API Health Check menggunakan Docker dan GitHub Actions yang dideploy pada VPS Azure.**

## 2. Arsitektur Sistem
- **Platform**          : Azure VPS
- **Bahasa Pemrograman**: Node.js dengan Express
- **CI/CD Pipeline**    : GitHub Actions
- **Containerization**  : Docker
- **Endpoint Publik**   : http://20.232.141.186:3000/health

## 3. Proses Implementasi CI/CD pada API
### 3.1. Pembuatan API dengan Node.js
Saya memulai dengan membuat API sederhana menggunakan Node.js dan Express. API ini memiliki endpoint `/health` yang mengembalikan status server beserta uptime-nya. 
```sh
app.get('/health', (req, res) => {
  const uptimeInSeconds = Math.floor((Date.now() - startTime) / 1000);
  const uptimeFormatted = new Date(uptimeInSeconds * 1000).toISOString().substr(11, 8); // HH:mm:ss

  res.json({
    nama: 'Dustin Felix',
    nrp: '5025231046',
    status: 'UP',
    timestamp: moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
    uptime: `${uptimeFormatted}`,
  });
});
```
Setelah pembuatan API, saya menjalankan dan mengujinya di **localhost** untuk memastikan bahwa aplikasi berjalan dengan benar.

### 3.2. Pembuatan Image Docker
Setelah API berjalan dengan baik, saya membuat **Dockerfile** untuk mengemas aplikasi ke dalam container. Saya melakukan build image secara manual menggunakan perintah:
```sh
docker build -t delix07/api-health:latest
```
Kemudian, saya menjalankan container dengan:
```sh
docker run -p 3000:3000 delix07/api-health:latest
```
Setelah berhasi;, saya mengupload image ke docker hub sebelum digunakan di VPS.

### 3.3. Setup VPS
Saya menggunakan layanan VPS dari Azure dan membuat Virtual Machine berbasis Linux (Ubuntu 20.04 LTS) melalui portal Azure. 
<img src="https://github.com/user-attachments/assets/467fc5d7-74db-4c32-8234-bd073ef842b3" width="500">

Setelah VM dibuat, saya mengkonfigurasi akses SSH dan mengatur firewall agar port 3000 dapat diakses secara publik:
```sh
sudo ufw allow 3000/tcp
```
Kemudian, saya masuk ke server melalui SSH dan menarik image dari Docker Hub:
```sh
docker pull delix07/api-health:latest
```
Lalu, saya menjalankan container di server VPS:
```sh
docker run -d -p 3000:3000 --name api-health delix07/api-health:latest
```

### 3.4. Proses Deployment menggunakan GitHub Actions
Saya membuat workflow dalam file `.github/workflows/deploy.yml` yang secara otomatis membangun dan mendorong image terbaru ke Docker Hub setiap kali ada perubahan pada branch main. Ini adalah workflow dari tugas `build and deploy` :

- Step 1: 
  ```sh
   - name: Checkout repository
     uses: actions/checkout@v3
  ```
  Mengambil kode terbaru dari repository GitHub.
  
- Step 2:
  ```sh
   - name: Login to Docker Hub
     run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
  ```
  Mengautentikasi ke Docker Hub menggunakan secrets dari GitHub.

- Step 3:
  ```sh
  - name: Build and push Docker image
    run: |
      docker build -t delix07/api-health:latest .
      docker push delix07/api-health:latest
  ```
  -  Build docker image dari kode terbaru.
  -  Push docker image ke Docker Hub agar bisa digunakan di VPS.

- Step 4:
  ```sh
  - name: Deploy to VPS
  uses: appleboy/ssh-action@v0.1.10
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USERNAME }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script:
      docker pull delix07/api-health:latest
      docker stop api-health || true
      docker rm api-health || true
      docker run -d -p 3000:3000 --name api-health delix07/api-health:latest
  ```
  - Login ke VPS via SSH menggunakan action `appleboy/ssh-action`.
  - Menarik image terbaru dari Docker Hub.
  - Menghentikan dan menghapus container lama, jika ada.
  - Menjalankan container baru dengan versi terbaru dari aplikasi.

## 4.Output dan Hasil Implementasi
### 4.1. Respon API
Setelah deployment berhasil, API dapat diakses melalui endpoint publik:
URL: `http://20.232.141.186:3000/health`
Respon JSON yang dikembalikan oleh API adalah:

<img src="https://github.com/user-attachments/assets/0e6bfee1-6a7f-40b2-9f90-021163488b39" width="400">

- **status**: UP menunjukkan server dalam kondisi berjalan.
- **timestamp** : menunjukkan waktu terbaru API diakses dalam zona waktu Asia/Jakarta.
- **uptime** : menunjukkan lama waktu server berjalan sejak start.

### 4.2. Hasil Deployment Otomatis
Setiap kali ada perubahan kode yang didorong ke branch main, GitHub Actions akan:
  1. Membangun ulang image Docker dan mengunggahnya ke Docker Hub.
  2. Menjalankan deployment otomatis ke VPS Azure.
  3. Mengganti container lama dengan versi terbaru dari API.
<img src="https://github.com/user-attachments/assets/954f3f79-efa8-4efe-be8a-11622921b917" width="1200">

## 5.Kesimpulan
Dengan memanfaatkan kombinasi Node.js, Docker, GitHub Actions, dan VPS Azure, proses CI/CD untuk API Health Check dapat diimplementasikan secara efektif dan efisien. Proses ini memungkinkan otomatisasi penuh dari tahap pembangunan hingga deployment aplikasi, sehingga mengurangi potensi kesalahan manual dan mempercepat waktu rilis. Sistem yang dibangun dapat berjalan stabil dengan versi terbaru yang selalu diperbarui secara otomatis setiap kali terdapat perubahan pada repository. Hal ini mendukung praktik DevOps modern dan meningkatkan keandalan serta produktivitas pengembangan aplikasi.
  
