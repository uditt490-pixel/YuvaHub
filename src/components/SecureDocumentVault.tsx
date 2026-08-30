import React, { useState, useEffect } from 'react';
import { FileText, Shield, Link as LinkIcon, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface Document {
    _id: string;
    originalFileName: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    redactionLog: any[];
    shareUrl?: string;
}

/**
 * SecureDocumentVault provides a UI for users to upload, monitor, and share
 * sensitive documents with automated PII redaction.
 */
export const SecureDocumentVault: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Mock fetch - replace with actual API call
        setTimeout(() => {
            setDocuments([
                { _id: '1', originalFileName: 'resume.pdf', status: 'completed', redactionLog: [{ field: 'email', redacted: true }] },
                { _id: '2', originalFileName: 'transcript.jpg', status: 'processing', redactionLog: [] },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        // Mock upload delay
        setTimeout(() => {
            setDocuments(prev => [{ _id: Date.now().toString(), originalFileName: 'new_document.pdf', status: 'pending', redactionLog: [] }, ...prev]);
            setUploading(false);
        }, 1500);
    };

    const handleShare = async (docId: string) => {
        // Mock share link generation
        const newDocs = documents.map(d =>
            d._id === docId ? { ...d, shareUrl: `https://yuvahub.com/shared/${Math.random().toString(36).substring(7)}` } : d
        );
        setDocuments(newDocs);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading vault...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secure Document Vault</h2>
            </div>

            {/* Upload Section */}
            <form onSubmit={handleUpload} className="mb-8 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center transition-colors">
                <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">Drag and drop your resume or transcript here, or click to browse.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Files are automatically scanned and PII is redacted before storage.</p>
                <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center mx-auto"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {uploading ? 'Uploading...' : 'Upload Securely'}
                </button>
            </form>

            {/* Document List */}
            <div className="space-y-4">
                {documents.map((doc) => (
                    <div key={doc._id} className="p-4 bg-surface dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center">
                            <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{doc.originalFileName}</p>
                                <div className="flex items-center mt-1">
                                    {doc.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500 mr-1" />}
                                    {doc.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-1" />}
                                    {doc.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />}
                                    <span className={`text-xs capitalize ${doc.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                                            doc.status === 'processing' ? 'text-blue-600 dark:text-blue-400' :
                                                'text-red-600 dark:text-red-400'
                                        }`}>
                                        {doc.status}
                                    </span>
                                    {doc.redactionLog.length > 0 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                            ({doc.redactionLog.length} items redacted)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {doc.status === 'completed' && (
                            <button
                                onClick={() => handleShare(doc._id)}
                                className="flex items-center px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                            >
                                <LinkIcon className="w-4 h-4 mr-1.5" />
                                {doc.shareUrl ? 'Copied!' : 'Generate Share Link'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
