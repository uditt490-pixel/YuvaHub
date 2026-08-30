import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, ExternalLink, Award, Clock } from 'lucide-react';

interface Credential {
    _id: string;
    badgeName: string;
    issuer: string;
    issueDate: string;
    proof: {
        type: string;
        proofValue: string;
    };
}

/**
 * VerifiableBadgeWallet displays a user's cryptographically signed badges,
 * allowing them to verify authenticity and export credentials as JSON-LD files.
 */
export const VerifiableBadgeWallet: React.FC = () => {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch - replace with actual API call to /api/credentials/wallet
        setTimeout(() => {
            setCredentials([
                {
                    _id: 'vc-1',
                    badgeName: 'React Expert',
                    issuer: 'did:web:yuvahub.com',
                    issueDate: '2023-10-15T10:00:00.000Z',
                    proof: { type: 'Ed25519Signature2020', proofValue: 'z3MvGX...8aB9' }
                },
                {
                    _id: 'vc-2',
                    badgeName: 'Hackathon Winner 2023',
                    issuer: 'did:web:yuvahub.com',
                    issueDate: '2023-11-20T14:30:00.000Z',
                    proof: { type: 'Ed25519Signature2020', proofValue: 'z4NwHY...9cC0' }
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleExport = (credentialId: string, badgeName: string) => {
        // In production, this would trigger a download from the API endpoint
        const mockData = { id: credentialId, badge: badgeName, verified: true };
        const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/ld+json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${badgeName.replace(/\s+/g, '-').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading wallet...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center mb-6">
                <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verifiable Credential Wallet</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cryptographically secure proof of your achievements.</p>
                </div>
            </div>

            {credentials.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Award className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-300">No verifiable credentials yet. Earn badges to populate your wallet!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {credentials.map((vc) => (
                        <div key={vc._id} className="p-5 bg-surface dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center">
                                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{vc.badgeName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-mono break-all">Issuer: {vc.issuer}</p>

                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                Issued: {new Date(vc.issueDate).toLocaleDateString()}
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => handleExport(vc._id, vc.badgeName)}
                                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export JSON-LD
                                </button>
                                <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Verify
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
