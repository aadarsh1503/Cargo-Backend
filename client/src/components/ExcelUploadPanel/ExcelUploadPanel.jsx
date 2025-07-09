import React, { useState, useEffect, useCallback } from 'react';
import * as api from './excelService';

import FileList from './FileList';
import Modal from './Modal';
// ✨ Icons for Message Box and Logout Button
import { FiCheckCircle, FiXCircle, FiLogOut } from 'react-icons/fi'; 
import FileUploadForm from './FileUploadForm';
import "./e.css";

// ✨ Step 1: Accept the 'onLogout' prop from App.jsx
const ExcelUploadPanel = ({ onLogout }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState(null);
  const [newName, setNewName] = useState('');

  const clearMessage = () => setTimeout(() => setMessage({ text: '', type: '' }), 4000);

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getFiles();
      setFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessage({ text: 'Error fetching files.', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
      clearMessage();
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);
  
  const handleUpload = useCallback(async (file) => {
    setIsUploading(true);
    try {
      const response = await api.uploadFile(file);
      setFiles(prevFiles => [response.data, ...prevFiles]);
      setMessage({ text: 'File uploaded successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Upload failed.', type: 'error' });
    } finally {
      setIsUploading(false);
      clearMessage();
    }
  }, []);

  const handleProcess = useCallback(async (id) => {
    setProcessingId(id);
    try {
      const response = await api.processFile(id);
      setFiles(files => files.map(f => f.id === id ? response.data : f));
      setMessage({ text: 'File published successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Processing failed.', type: 'error' });
    } finally {
      setProcessingId(null);
      clearMessage();
    }
  }, []);
  
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this file permanently?')) {
      setDeletingId(id);
      try {
        await api.deleteFile(id);
        setFiles(files => files.filter(f => f.id !== id));
        setMessage({ text: 'File deleted successfully!', type: 'success' });
      } catch (error) {
        setMessage({ text: error.response?.data?.message || 'Deletion failed.', type: 'error' });
      } finally {
        setDeletingId(null);
        clearMessage();
      }
    }
  }, []);

  const openRenameModal = (file) => {
    setFileToRename(file);
    setNewName(file.file_name);
    setIsModalOpen(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!fileToRename || !newName.trim()) return;

    try {
      const response = await api.renameFile(fileToRename.id, newName.trim());
      setFiles(files => files.map(f => f.id === fileToRename.id ? response.data : f));
      setMessage({ text: 'File renamed successfully!', type: 'success' });
      setIsModalOpen(false);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Rename failed.', type: 'error' });
    } finally {
      clearMessage();
    }
  };

  return (
    <div className="panel-container font-noto-serif">
        {/* ✨ Step 2: Create a header section for title and logout button */}
        <div className="panel-header">
            <div>
                <h1 className="page-heading text-gradient-heading font-noto-serif">File Management</h1>
                <p className="page-subheading font-noto-serif">Upload, publish, and manage your Excel data sheets.</p>
            </div>
            {/* ✨ Step 3: Add the logout button and connect it to the onLogout function */}
            <button onClick={onLogout} className="btn-logout">
                <FiLogOut size={18} />
                <span>Logout</span>
            </button>
        </div>

        {message.text && (
            <div className={`message-box ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
                {message.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                {message.text}
            </div>
        )}
        
        <div className="panel-glass font-noto-serif">
            <h2 className="panel-title">Upload New Sheet</h2>
            <FileUploadForm onUpload={handleUpload} isUploading={isUploading} />
        </div>

        <div className="panel-glass">
            <h2 className="panel-title">Uploaded Files Repository</h2>
            <FileList 
                files={files}
                isLoading={isLoading}
                // onProcess={handleProcess}
                onRename={openRenameModal}
                onDelete={handleDelete}
                // processingId={processingId}
                deletingId={deletingId}
            />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Rename File">
            <form onSubmit={handleRename}>
                <label htmlFor="newName" className="modal-form-label">New File Name</label>
                <input
                    type="text"
                    id="newName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="modal-form-input"
                    autoFocus
                />
                <div className="modal-actions">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    </div>
  );
};

export default ExcelUploadPanel;