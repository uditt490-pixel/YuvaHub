import React, { useState, useEffect } from 'react';
import { FileText, Star, Trash2, Edit3, Upload, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ResumeItem } from '../../types';

export default function ResumeVersionManager() {
  const { user, profile, setProfile } = useAppContext();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [customUploadName, setCustomUploadName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchResumes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.png', '.jpeg', '.jpg'];
    if (!allowed.includes(fileExt)) {
      setErrorMsg("Unsupported file type. Only .pdf, .png, and .jpeg are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = await user.getIdToken();
      let uploadData: any;

      try {
        const sigRes = await fetch('/api/storage/signature', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ fileType: 'resume', extension: fileExt })
        });

        if (sigRes.ok) {
          const sigData = await sigRes.json();
          if (!sigData.isDummy) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('api_key', sigData.apiKey);
            uploadFormData.append('timestamp', sigData.timestamp.toString());
            uploadFormData.append('signature', sigData.signature);
            uploadFormData.append('folder', sigData.folder);
            if (sigData.allowed_formats) {
              uploadFormData.append('allowed_formats', sigData.allowed_formats);
            }

            const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`;
            const uploadRes = await fetch(uploadUrl, {
              method: 'POST',
              body: uploadFormData
            });

            if (uploadRes.ok) {
              uploadData = await uploadRes.json();
            }
          }
        }
      } catch {
        // Fallback to local upload
      }

      if (!uploadData) {
        const localFormData = new FormData();
        localFormData.append('file', file);
        const localRes = await fetch('/api/storage/upload-local', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: localFormData
        });

        if (!localRes.ok) {
          throw new Error("File upload failed.");
        }
        uploadData = await localRes.json();
      }

      const displayName = customUploadName.trim() || file.name;

      const createRes = await fetch('/api/v1/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName,
          originalFileName: file.name,
          fileUrl: uploadData.secure_url,
          publicId: uploadData.public_id || ''
        })
      });

      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save resume record.");
      }

      const createData = await createRes.json();
      setSuccessMsg(`Resume "${displayName}" uploaded successfully.`);
      setCustomUploadName('');
      
      // Update profile context if resume was marked default
      if (createData.resume?.isDefault && profile) {
        setProfile({
          ...profile,
          resumeUrl: createData.resume.fileUrl,
          resumePublicId: createData.resume.publicId
        });
      }

      await fetchResumes();
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleSetDefault = async (resume: ResumeItem) => {
    if (!user || resume.isDefault) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/v1/resumes/${resume.id}/default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`"${resume.displayName}" set as default resume.`);
        if (profile) {
          setProfile({
            ...profile,
            resumeUrl: data.resume.fileUrl,
            resumePublicId: data.resume.publicId
          });
        }
        await fetchResumes();
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || "Failed to set default resume.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error setting default resume.");
    }
  };

  const handleRename = async (id: string) => {
    if (!user || !editName.trim()) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/v1/resumes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ displayName: editName.trim() })
      });

      if (res.ok) {
        setSuccessMsg("Resume renamed successfully.");
        setEditingId(null);
        setEditName('');
        await fetchResumes();
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || "Failed to rename resume.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error renaming resume.");
    }
  };

  const handleDelete = async (resume: ResumeItem) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete "${resume.displayName}"?`)) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/v1/resumes/${resume.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSuccessMsg(`Resume "${resume.displayName}" deleted.`);
        await fetchResumes();
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || "Failed to delete resume.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error deleting resume.");
    }
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Resume Version History
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Manage multiple resumes and assign your primary default resume.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Custom Name (Optional)"
            className="clean-input text-xs p-2.5 w-44 hidden md:block"
            value={customUploadName}
            onChange={(e) => setCustomUploadName(e.target.value)}
          />
          <label className="cursor-pointer text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-none">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload New Resume"}
            <input
              type="file"
              accept=".pdf, image/png, image/jpeg"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500 animate-pulse">
          Loading resume versions...
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No resumes uploaded yet</p>
          <p className="text-xs text-gray-500 mt-1">Upload your first resume version to set your default profile resume.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                resume.isDefault
                  ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {editingId === resume.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="clean-input text-xs p-1.5 w-48 font-semibold"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleRename(resume.id)}
                        className="text-xs font-semibold bg-blue-600 text-white px-2.5 py-1 rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditName(''); }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h4 className="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
                      {resume.displayName}
                      <button
                        onClick={() => { setEditingId(resume.id); setEditName(resume.displayName); }}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Rename resume"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </h4>
                  )}

                  {resume.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      <Star className="w-3 h-3 fill-blue-700 text-blue-700" /> Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  <span className="truncate max-w-[200px]" title={resume.originalFileName}>
                    File: {resume.originalFileName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" /> Uploaded: {formatDate(resume.uploadedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                >
                  Preview <ExternalLink className="w-3 h-3" />
                </a>

                {!resume.isDefault && (
                  <button
                    onClick={() => handleSetDefault(resume)}
                    className="text-xs font-semibold bg-white hover:bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-300 transition-colors flex items-center gap-1"
                  >
                    <Star className="w-3 h-3 text-blue-600" /> Make Default
                  </button>
                )}

                <button
                  onClick={() => handleDelete(resume)}
                  className="text-xs font-semibold text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                  title="Delete resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
