const express = require('express');
const multer = require('multer');
const router = express.Router();

const imagekit = require('../config/imagekit');
const pool = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// -------------------------------------------------------------------
// ✨ THE FIX: The global protection middleware below has been REMOVED.
// router.use(protect, isAdmin); 
// Now, we will apply protection to each route individually.
// -------------------------------------------------------------------


// ✅ SECURE ROUTE: Requires a logged-in admin to upload.
router.post('/upload', protect, isAdmin, upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: '/gvscargo/excels/',
      useUniqueFileName: true
    });

    const sql = `
      INSERT INTO uploaded_excels (file_name, file_url, file_id_imagekit, file_size, user_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      req.file.originalname, 
      uploadResponse.url, 
      uploadResponse.fileId,
      req.file.size, 
      req.user.id
    ]);

    const [rows] = await pool.execute('SELECT * FROM uploaded_excels WHERE id = ?', [result.insertId]);
    
    res.status(201).json(rows[0]);

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
});

// ✅ PUBLIC ROUTE: This route is now open and does not require authentication.
// Perfect for your gvscargo.com public page.
router.get('/list', async (req, res) => {
  try {
    // We add file_id as 'id', file_name as 'fileName', and file_url as 'filePath'
    // to match what the frontend component expects.
    const sql = `
      SELECT 
        id, 
        file_name as fileName, 
        file_url as filePath, 
        file_size as fileSize, 
        status, 
        uploaded_at as uploadedAt
      FROM uploaded_excels 
      ORDER BY uploaded_at DESC
    `;
    const [files] = await pool.execute(sql);
    res.json(files);
  } catch (error) {
    console.error('List Error:', error);
    res.status(500).json({ message: 'Failed to fetch file list.' });
  }
});

// ✅ SECURE ROUTE: Requires a logged-in admin to process.
router.post('/process/:id', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE uploaded_excels SET status = "processed", processed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    const [rows] = await pool.execute('SELECT * FROM uploaded_excels WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Processing Error:', error);
    await pool.execute('UPDATE uploaded_excels SET status = "failed" WHERE id = ?', [req.params.id]);
    res.status(500).json({ message: 'Failed to process file.' });
  }
});

// ✅ SECURE ROUTE: Requires a logged-in admin to rename.
router.put('/rename/:id', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({ message: 'New name is required.' });
    }

    await pool.execute('UPDATE uploaded_excels SET file_name = ? WHERE id = ?', [newName, id]);

    const [rows] = await pool.execute('SELECT * FROM uploaded_excels WHERE id = ?', [id]);
    res.json(rows[0]);

  } catch (error) {
    console.error('Rename Error:', error);
    res.status(500).json({ message: 'Failed to rename file.' });
  }
});

// ✅ SECURE ROUTE: Requires a logged-in admin to delete.
router.delete('/delete/:id', protect, isAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const [rows] = await connection.execute('SELECT file_id_imagekit FROM uploaded_excels WHERE id = ?', [id]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'File not found.' });
    }
    
    const imagekitFileId = rows[0].file_id_imagekit;
    await imagekit.deleteFile(imagekitFileId);

    await connection.execute('DELETE FROM uploaded_excels WHERE id = ?', [id]);

    await connection.commit();
    res.status(200).json({ message: 'File deleted successfully.', id });

  } catch (error) {
    await connection.rollback();
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Failed to delete file.' });
  } finally {
      if (connection) connection.release();
  }
});

module.exports = router;