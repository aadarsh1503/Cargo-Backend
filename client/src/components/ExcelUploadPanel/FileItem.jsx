import React from 'react';
import { FiFile, FiCheckSquare, FiEdit, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const FileItem = ({ file, onProcess, onRename, onDelete, processingId, deletingId }) => {
  const isProcessing = processingId === file.id;
  const isDeleting = deletingId === file.id;
  
  const statusPill = {
    processed: 'bg-green-100 text-green-800',
    uploaded: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
  };

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
    <tr key={file.id} className="table-row-hover transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FiFile className="h-6 w-6 text-blue-500" />
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">{file.file_name}</div>
            <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-600">
              View Original
            </a>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {`${Math.round(file.file_size / 1024)} KB`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusPill[file.status]}`}>
          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {new Date(file.uploaded_at).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex  items-center gap-4">
          {/* <ActionButton
            onClick={() => onProcess(file.id)}
            icon={<FiCheckSquare size={16} />}
            text="Publish"
            disabled={file.status === 'processed'}
            isWorking={isProcessing}
            colorClass="text-green-600"
          /> */}
          <ActionButton
            onClick={() => onRename(file)}
            icon={<FiEdit size={16} />}
            text="Rename"
            disabled={isProcessing || isDeleting}
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