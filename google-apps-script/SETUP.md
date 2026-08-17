# Menghubungkan Grocerie ke Google Sheets

1. Buka Google Sheet **Grocerie Database**.
2. Pilih **Extensions → Apps Script**.
3. Hapus isi editor, lalu salin seluruh isi `Code.gs` dari folder ini.
4. Ganti `GANTI_DENGAN_KODE_RAHASIA_ANDA` dengan kode rahasia buatan Anda.
5. Pilih **Deploy → New deployment → Web app**.
6. Atur **Execute as: Me** dan **Who has access: Anyone**, lalu deploy dan izinkan akses.
7. Salin URL Web App yang berakhiran `/exec`.
8. Buat file `.env` mengikuti `.env.example`, lalu masukkan URL dan kode rahasia yang sama.
9. Jalankan ulang `npm run dev`.

Local Storage tetap digunakan sebagai cadangan jika koneksi Google gagal.
