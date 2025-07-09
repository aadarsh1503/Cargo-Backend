const express = require('express');
const multer = require('multer');
const router = express.Router();

const imagekit = require('../config/imagekit');
const pool = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

console.log('✅ Excel routes file loaded. (Version without Status)');

// ROUTE: /api/excels/upload
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
    console.error('❌ [POST /upload] - FATAL UPLOAD ERROR:', error);
    res.status(500).json({ message: 'Server error during file upload.', error: error.message });
  }
});

// ROUTE: /api/excels/list
router.get('/list', async (req, res) => {
  console.log('--- [GET /list] - Request Received ---');
  try {
    // 'status' column SELECT query se hata diya gaya hai
    const sql = `
      SELECT 
        id, 
        file_name, 
        file_url, 
        file_size, 
        uploaded_at
      FROM uploaded_excels 
      ORDER BY uploaded_at DESC
    `;
    console.log('[GET /list] - Executing SQL to fetch all files...');
    const [files] = await pool.execute(sql);
    console.log(`[GET /list] - Found ${files.length} files. Sending to client.`);
    res.json(files);
  } catch (error) {
    console.error('❌ [GET /list] - LIST ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch file list.' });
  }
});

// The '/process' route has been removed as it is no longer needed.

// ROUTE: /api/excels/rename/:id
router.put('/rename/:id', protect, isAdmin, async (req, res) => {
  // (This route had no changes, it remains the same)
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
    console.error(`❌ [PUT /rename] - RENAME ERROR for file ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to rename file.' });
  }
});

// ROUTE: /api/excels/delete/:id
router.delete('/delete/:id', protect, isAdmin, async (req, res) => {
    // (This route had no changes, it remains the same)
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
      console.error(`❌ [DELETE /delete] - DELETE ERROR for file ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete file.' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;