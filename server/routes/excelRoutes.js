// excelRoutes.js (FINAL VERSION WITHOUT STATUS, WITH DETAILED LOGGING)

const express = require('express');
const multer = require('multer');
const router = express.Router();

const imagekit = require('../config/imagekit');
const pool = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

console.log('✅ Excel routes file loaded (Version: No-Status, Verbose-Logging).');

// Helper function to create a consistent file object
const formatFileObject = (dbRow) => {
  if (!dbRow) {
    console.log('⚠️ formatFileObject received a null or undefined dbRow.');
    return null;
  }
  return {
    id: dbRow.id,
    fileName: dbRow.file_name,
    filePath: dbRow.file_url,
    fileSize: dbRow.file_size,
    uploadedAt: dbRow.uploaded_at
  };
};

// ROUTE: /api/excels/upload
router.post('/upload', protect, isAdmin, upload.single('excelFile'), async (req, res) => {
  const requestStartTime = Date.now();
  console.log(`--- [POST /upload] - Request Received at ${new Date(requestStartTime).toISOString()} ---`);
  
  try {
    // 1. Check file from Multer
    if (!req.file) {
      console.log('❌ [POST /upload] - Error: No file found in request (Multer did not process a file).');
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    console.log(`[POST /upload] - Step 1/5: File received. Original Name: "${req.file.originalname}", Size: ${req.file.size} bytes.`);

    // 2. Check user from auth middleware
    if (!req.user || !req.user.id) {
        console.log('❌ [POST /upload] - Error: User ID not found in request. Auth middleware might have failed.');
        return res.status(401).json({ message: 'Authentication failed, user data not found.' });
    }
    console.log(`[POST /upload] - Step 2/5: User authenticated. User ID: ${req.user.id}.`);

    // 3. Upload to ImageKit
    console.log('[POST /upload] - Step 3/5: Uploading file buffer to ImageKit...');
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: '/gvscargo/excels/',
      useUniqueFileName: true
    });
    console.log(`[POST /upload] - Step 4/5: Successfully uploaded to ImageKit. File ID: ${uploadResponse.fileId}`);

    // 4. Insert into Database
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
    console.log(`[POST /upload] - Database insert successful. New Record ID: ${result.insertId}`);

    // 5. Fetch and send back the new record
    const [rows] = await pool.execute('SELECT * FROM uploaded_excels WHERE id = ?', [result.insertId]);
    const formattedFile = formatFileObject(rows[0]);
    console.log(`[POST /upload] - Sending back formatted file object:`, formattedFile);
    
    const duration = Date.now() - requestStartTime;
    console.log(`--- [POST /upload] - Request Finished. Duration: ${duration}ms ---`);
    res.status(201).json(formattedFile);

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
      SELECT id, file_name, file_url, file_size, uploaded_at FROM uploaded_excels 
      ORDER BY uploaded_at DESC
    `;
    console.log('[GET /list] - Executing SQL to fetch all files...');
    const [filesFromDb] = await pool.execute(sql);
    console.log(`[GET /list] - Found ${filesFromDb.length} records in database.`);
    
    const formattedFiles = filesFromDb.map(formatFileObject);
    console.log('[GET /list] - Sending formatted file list to client.');
    res.json(formattedFiles);
  } catch (error) {
    console.error('❌ [GET /list] - LIST ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch file list.' });
  }
});


// ROUTE: /api/excels/rename/:id
router.put('/rename/:id', protect, isAdmin, async (req, res) => {
  console.log(`--- [PUT /rename/${req.params.id}] - Request Received ---`);
  try {
    const { id } = req.params;
    const { newName } = req.body;
    console.log(`[PUT /rename] - User ID ${req.user.id} is renaming file ID ${id} to "${newName}".`);

    if (!newName || newName.trim() === '') {
      console.log('❌ [PUT /rename] - Error: New name is empty or missing.');
      return res.status(400).json({ message: 'New name is required.' });
    }

    await pool.execute('UPDATE uploaded_excels SET file_name = ? WHERE id = ?', [newName.trim(), id]);
    console.log(`[PUT /rename] - Database record updated for file ID ${id}.`);

    const [rows] = await pool.execute('SELECT * FROM uploaded_excels WHERE id = ?', [id]);
    const formattedFile = formatFileObject(rows[0]);
    console.log(`[PUT /rename] - Sending back updated and formatted file object:`, formattedFile);
    res.json(formattedFile);
  } catch (error)
    {
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
    console.log(`[DELETE /delete] - User ID ${req.user.id} is attempting to delete file with DB ID ${id}.`);
    
    await connection.beginTransaction();
    console.log('[DELETE /delete] - Transaction started.');

    console.log(`[DELETE /delete] - Step 1/3: Finding ImageKit file ID for DB record ${id}...`);
    const [rows] = await connection.execute('SELECT file_id_imagekit FROM uploaded_excels WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      console.log(`❌ [DELETE /delete] - Error: File with ID ${id} not found in database. Rolling back.`);
      await connection.rollback();
      return res.status(404).json({ message: 'File not found.' });
    }
    
    const imagekitFileId = rows[0].file_id_imagekit;
    console.log(`[DELETE /delete] - Step 2/3: Found ImageKit file ID: ${imagekitFileId}. Deleting from ImageKit...`);
    await imagekit.deleteFile(imagekitFileId);
    console.log(`[DELETE /delete] - Successfully deleted from ImageKit.`);

    console.log(`[DELETE /delete] - Step 3/3: Deleting record from database...`);
    await connection.execute('DELETE FROM uploaded_excels WHERE id = ?', [id]);
    console.log(`[DELETE /delete] - Successfully deleted from database. Committing transaction...`);

    await connection.commit();
    console.log('--- [DELETE /delete] - Request Finished Successfully. ---');
    res.status(200).json({ message: 'File deleted successfully.', id });

  } catch (error) {
    console.log('❌ [DELETE /delete] - An error occurred. Rolling back transaction.');
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