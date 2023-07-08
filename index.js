const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
var cors = require('cors');
app.use(cors({
    origin: '*'
}));

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
 

 

// create data / insert data
app.post('/api/tamu',upload.single('image'),(req, res) => {


    const data = { ...req.body };
    const id_book = req.body.id_book;
    const nama = req.body.nama;
    const tgl_ci = req.body.tgl_ci;
    const tgl_co = req.body.tgl_co;
    const ktp = req.body.ktp;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO tamu (id_book,nama,tgl_ci,tgl_co,ktp) values (?,?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ id_book,nama,tgl_ci,tgl_co,ktp], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const ktp =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO tamu (id_book,nama,tgl_ci,tgl_co,ktp) values (?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ id_book,nama,tgl_ci,tgl_co,ktp], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});




// read data / get data
app.get('/api/tamu', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM tamu';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/tamu/:id_book', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM tamu WHERE id_book = ?';
    const id_book = req.body.id_book;
    const nama = req.body.nama;
    const tgl_ci = req.body.tgl_ci;
    const tgl_co = req.body.tgl_co;
    const ktp = req.body.ktp;


    const queryUpdate = 'UPDATE tamu SET nama=?,tgl_ci=?,tgl_co=? WHERE id_book = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id_book, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama,tgl_ci,tgl_co, req.params.id_book], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/tamu/:id_book', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM tamu WHERE id_book = ?';
    const queryDelete = 'DELETE FROM tamu WHERE id_book = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id_book, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.id_book, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));