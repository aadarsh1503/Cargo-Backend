const express = require('express');
const multer = require('multer');
const router = express.Router();

const imagekit = require('../config/imagekit');
const pool = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Using memoryStorage to handle file buffer for cloud upload
const upload = multer({ storage: multer.memoryStorage() });

console.log('✅ Excel routes file loaded.');

// ROUTE: /api/excels/upload
router.post('/upload', protect, isAdmin, upload.single('excelFile'), async (req, res) => {
  console.log('--- [POST /upload] - Request Received ---');
  
  try {
    // 1. Check if the file exists in the request
    if (!req.file) {
      console.log('❌ [POST /upload] - Error: No file found in request.');
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    console.log(`[POST /upload] - Step 1/5: File received. Original Name: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // 2. Check if user information is available from the 'protect' middleware
    if (!req.user || !req.user.id) {
        console.log('❌ [POST /upload] - Error: User not authenticated or user ID missing. Auth middleware might have failed.');
        return res.status(401).json({ message: 'Authentication failed, user data not found.' });
    }
    console.log(`[POST /upload] - Step 2/5: User authenticated. User ID: ${req.user.id}`);

    // 3. Uploading to ImageKit
    console.log('[POST /upload] - Step 3/5: Attempting to upload to ImageKit...');
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: '/gvscargo/excels/',
      useUniqueFileName: true
    });
    console.log(`[POST /upload] - Step 4/5: Successfully uploaded to ImageKit. File ID: ${uploadResponse.fileId}, URL: ${uploadResponse.url}`);

    // 4. Inserting file metadata into the database
    const sql = `
      INSERT INTO uploaded_excels (file_name, file_url, file_id_imagekit, file_size, user_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    console.log('[POST /upload] - Step 5/5: Executing SQL to insert file metadata...');
    const [result] = await pool.execute(sql, [
      req.file.originalname, 
      uploadResponse.url, 
      uploadResponse.fileId,
      req.file.size, 
      req.user.id
    ]);
    console.log(`[POST /upload] - Database insert successful. Insert ID: ${result.insertId}`);

    // 5. Fetching the newly inserted record to send back to the client
    const [rows] = await pool.execute('SELECT * FROM uploaded_excels WHERE id = ?', [result.insertId]);
    console.log('[POST /upload] - Successfully fetched new record. Sending response to client.');
    
    // IMPORTANT: The frontend expects a specific structure. Make sure this matches.
    // The error `Cannot read properties of null (reading 'charAt')` happens when the response is not a valid object,
    // or a key (like file_name) is null. `rows[0]` should be a valid object here.
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
    const sql = `
      SELECT 
        id, 
        file_name, 
        file_url, 
        file_size, 
        status, 
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

// ROUTE: /api/excels/process/:id
router.post('/process/:id', protect, isAdmin, async (req, res) => {
  console.log(`--- [POST /process/${req.params.id}] - Request Received ---`);
  try {
    const { id } = req.params;
    console.log(`[POST /process] - User ID ${req.user.id} is processing file ID ${id}.`);
    
    await pool.execute(
      'UPDATE uploaded_excels SET status = "processed", processed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    console.log(`[POST /process] - Database updated for file ID ${id}.`);

    const [rows] = await pool.execute('SELECT * FROM uploaded_excels WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(`❌ [POST /process] - PROCESSING ERROR for file ID ${req.params.id}:`, error);
    await pool.execute('UPDATE uploaded_excels SET status = "failed" WHERE id = ?', [req.params.id]);
    res.status(500).json({ message: 'Failed to process file.' });
  }
});

// ROUTE: /api/excels/rename/:id
router.put('/rename/:id', protect, isAdmin, async (req, res) => {
  console.log(`--- [PUT /rename/${req.params.id}] - Request Received ---`);
  try {
    const { id } = req.params;
    const { newName } = req.body;
    console.log(`[PUT /rename] - User ID ${req.user.id} is renaming file ID ${id} to "${newName}".`);

    if (!newName) {
      console.log('❌ [PUT /rename] - Error: New name is missing.');
      return res.status(400).json({ message: 'New name is required.' });
    }

    await pool.execute('UPDATE uploaded_excels SET file_name = ? WHERE id = ?', [newName, id]);
    console.log(`[PUT /rename] - Database updated for file ID ${id}.`);

    const [rows] = await pool.execute('SELECT * FROM uploaded_excels WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(`❌ [PUT /rename] - RENAME ERROR for file ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to rename file.' });
  }
});

// ROUTE: /api/excels/delete/:id
router.delete('/delete/:id', protect, isAdmin, async (req, res) => {
  console.log(`--- [DELETE /delete/${req.params.id}] - Request Received ---`);
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    console.log(`[DELETE /delete] - User ID ${req.user.id} is deleting file ID ${id}.`);
    await connection.beginTransaction();

    console.log(`[DELETE /delete] - Finding ImageKit file ID for DB record ${id}...`);
    const [rows] = await connection.execute('SELECT file_id_imagekit FROM uploaded_excels WHERE id = ?', [id]);
    if (rows.length === 0) {
      console.log(`❌ [DELETE /delete] - Error: File with ID ${id} not found in database.`);
      await connection.rollback();
      return res.status(440).json({ message: 'File not found.' });
    }
    
    const imagekitFileId = rows[0].file_id_imagekit;
    console.log(`[DELETE /delete] - Found ImageKit file ID: ${imagekitFileId}. Deleting from ImageKit...`);
    await imagekit.deleteFile(imagekitFileId);
    console.log(`[DELETE /delete] - Deleted from ImageKit. Now deleting from database...`);

    await connection.execute('DELETE FROM uploaded_excels WHERE id = ?', [id]);
    console.log(`[DELETE /delete] - Deleted from database. Committing transaction.`);

    await connection.commit();
    res.status(200).json({ message: 'File deleted successfully.', id });
  } catch (error) {
    await connection.rollback();
    console.error(`❌ [DELETE /delete] - DELETE ERROR for file ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete file.' });
  } finally {
      if (connection) {
        console.log(`[DELETE /delete] - Releasing database connection.`);
        connection.release();
      }
  }
});

module.exports = router;