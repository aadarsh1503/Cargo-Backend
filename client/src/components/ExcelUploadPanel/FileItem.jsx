// FileItem.jsx

import React from 'react';
import { FiFile, FiEdit, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const FileItem = ({ file, onRename, onDelete, deletingId }) => {
  // isProcessing and statusPill are no longer needed
  const isDeleting = deletingId === file.id;

  // ... (ActionButton component remains the same) ...
  const ActionButton = ({ onClick, icon, text, disabled, colorClass, isWorking }) => (
    <button
      onClick={onClick}
      disabled={disabled || isWorking}
      className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        disabled ? 'text-gray-400' : `${colorClass} hover:opacity-80`
      }`}
    >
      {isWorking ? <FiRefreshCw className="animate-spin-fast" /> : icon}
      <span>{text}</span>
    </button>
  );

  return (
    // The key is now on the top-level element returned by map
    <tr className="table-row-hover transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FiFile className="h-6 w-6 text-blue-500" />
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">{file.file_name || 'Unnamed File'}</div>
            <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-600">
              View Original
            </a>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {/* Added a check for file_size to prevent crash if it's missing */}
        {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'N/A'}
      </td>
      
      {/* ===== STATUS COLUMN POORI TARAH HATA DIYA GAYA HAI ===== */}
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {/* Added a check for uploaded_at */}
        {file.uploaded_at ? new Date(file.uploaded_at).toLocaleString() : 'Just now'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-4">
          <ActionButton
            onClick={() => onRename(file)}
            icon={<FiEdit size={16} />}
            text="Rename"
            disabled={isDeleting} // isProcessing removed
            colorClass="text-yellow-600"
          />
          <ActionButton
            onClick={() => onDelete(file.id)}
            icon={<FiTrash2 size={16} />}
            text="Delete"
            isWorking={isDeleting}
            colorClass="text-red-600"
          />
        </div>
      </td>
    </tr>
  );
};

export default FileItem;