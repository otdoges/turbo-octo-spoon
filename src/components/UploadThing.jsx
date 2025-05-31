import React, { useState } from 'react';
import { generateClientDropzoneAccept, useUploadThing } from "@uploadthing/react";

// UploadThing component that can be used for client-side uploads
export const UploadThing = ({ onUploadComplete, onUploadError }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      setUploading(false);
      setFiles([]);
      // Call the callback with the upload result
      if (onUploadComplete && res?.[0]) {
        onUploadComplete(res[0]);
      }
    },
    onUploadError: (error) => {
      setUploading(false);
      // Call the error callback
      if (onUploadError) {
        onUploadError(error);
      }
    },
  });
  
  // Generate file accept string based on permitted file types
  const fileTypes = permittedFileInfo?.config ? Object.keys(permittedFileInfo.config) : [];
  const acceptString = generateClientDropzoneAccept(fileTypes);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFiles([selectedFile]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;
    
    setUploading(true);
    await startUpload(files);
  };
  
  return (
    <div className="uploadthing-wrapper p-4 border border-gray-200 rounded-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center justify-center w-full">
          <label 
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              {permittedFileInfo?.config?.image && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Images (max: {permittedFileInfo.config.image.maxFileSize})
                </p>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
              accept={acceptString}
              disabled={uploading}
            />
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm truncate max-w-xs">{files[0].name}</span>
            <button 
              type="button" 
              onClick={() => setFiles([])} 
              className="text-red-500 hover:text-red-700"
              disabled={uploading}
            >
              Remove
            </button>
          </div>
        )}
        
        <button 
          type="submit" 
          className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={files.length === 0 || uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadThing; 