// FileList.jsx

import React from 'react';
import FileItem from './FileItem';
import { FiRefreshCw, FiInbox } from 'react-icons/fi';

const FileList = ({ files, isLoading, onRename, onDelete, deletingId }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <FiRefreshCw className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <FiInbox size={48} className="mx-auto text-gray-300" />
        <h3 className="mt-2 text-lg font-medium text-gray-800">No Files Found</h3>
        <p className="mt-1 text-sm text-gray-500">Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full file-table">
        <thead className="bg-transparent">
          <tr>
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">File Details</th>
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
            
            {/* ===== STATUS HEADER HATA DIYA GAYA HAI ===== */}
            
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded At</th>
            <th className="px-6 pb-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <FileItem
              key={file.id} // Yeh abhi bhi theek hai, hum 'file.id' ko null aane se rokenge
              file={file}
              // onProcess={onProcess} // Hata diya
              onRename={onRename}
              onDelete={onDelete}
              // processingId={processingId} // Hata diya
              deletingId={deletingId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;