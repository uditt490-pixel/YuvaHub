import mongoose, { Schema, Document } from 'mongoose';

export interface IVerifiableCredential extends Document {
    userId: mongoose.Types.ObjectId;
    badgeName: string;
    issuer: string;
    issueDate: Date;
    credentialSubject: Record<string, any>;
    proof: {
        type: string;
        created: string;
        verificationMethod: string;
        proofPurpose: string;
        proofValue: string;
    };
    status: 'active' | 'revoked';
    createdAt: Date;
    updatedAt: Date;
}

const proofSchema = new Schema({
    type: { type: String, required: true, default: 'Ed25519Signature2020' },
    created: { type: String, required: true },
    verificationMethod: { type: String, required: true },
    proofPurpose: { type: String, required: true, default: 'assertionMethod' },
    proofValue: { type: String, required: true },
});

const verifiableCredentialSchema = new Schema<IVerifiableCredential>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        badgeName: { type: String, required: true },
        issuer: { type: String, required: true, default: 'did:web:yuvahub.com' },
        issueDate: { type: Date, required: true, default: Date.now },
        credentialSubject: { type: Schema.Types.Mixed, required: true },
        proof: { type: proofSchema, required: true },
        status: { type: String, enum: ['active', 'revoked'], default: 'active' },
    },
    { timestamps: true }
);

export const VerifiableCredential = mongoose.model<IVerifiableCredential>('VerifiableCredential', verifiableCredentialSchema);
