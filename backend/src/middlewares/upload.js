const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
        cb(new Error('File harus berupa gambar'))
        }
        cb(null, true)
    },
})

module.exports = upload
