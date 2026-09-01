import React, { useState } from 'react';
import axios from 'axios';

interface UploadStepProps {
  onData: (data: any) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await axios.post('/api/v1/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onData(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="border border-gray-300 rounded p-2 w-64"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`px-6 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Analyzing…' : 'Analyze Resume'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default UploadStep;
