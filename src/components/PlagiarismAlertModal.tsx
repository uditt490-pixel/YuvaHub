import React, { useState } from 'react';
import { AlertTriangle, X, FileText, CheckCircle, ShieldAlert } from 'lucide-react';

interface PlagiarismAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    similarityScore: number;
    matchedSourceText: string;
    onConfirmSubmit: () => void;
    onCancel: () => void;
}

/**
 * PlagiarismAlertModal warns users of high similarity before submission
 * and provides moderators with a side-by-side comparison view.
 */
export const PlagiarismAlertModal: React.FC<PlagiarismAlertModalProps> = ({
    isOpen,
    onClose,
    similarityScore,
    matchedSourceText,
    onConfirmSubmit,
    onCancel,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const isHighRisk = similarityScore > 85;
    const isMediumRisk = similarityScore > 60 && similarityScore <= 85;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        onConfirmSubmit();
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isHighRisk ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                        'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}>
                    <div className="flex items-center">
                        {isHighRisk ? (
                            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
                        )}
                        <h2 className={`text-xl font-bold ${isHighRisk ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'
                            }`}>
                            Similarity Detected
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className={`w-5 h-5 ${isHighRisk ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                            }`} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            Our automated system detected that your content is <span className="font-bold">{similarityScore.toFixed(1)}%</span> similar to existing content on the platform.
                        </p>
                        {isHighRisk ? (
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                This exceeds our 85% threshold. Posting this may result in your content being flagged for moderator review or automatically rejected.
                            </p>
                        ) : (
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                                This is within the acceptable range, but please ensure you are properly citing sources if applicable.
                            </p>
                        )}
                    </div>

                    {/* Comparison View */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-3">
                            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Matched Source Preview</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                            "{matchedSourceText}"
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Edit My Post
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors flex items-center justify-center ${isHighRisk
                                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                                }`}
                        >
                            {isSubmitting ? (
                                'Processing...'
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {isHighRisk ? 'Submit for Review Anyway' : 'Post Anyway'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
