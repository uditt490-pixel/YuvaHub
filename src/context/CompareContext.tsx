import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Opportunity } from '../components/OpportunityCard';

interface CompareContextType {
    compareQueue: Opportunity[];
    addToCompare: (opp: Opportunity) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isComparing: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
    const [compareQueue, setCompareQueue] = useState<Opportunity[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('yuvahub-compare-queue');
        if (saved) {
            try {
                setCompareQueue(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading compare queue", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('yuvahub-compare-queue', JSON.stringify(compareQueue));
    }, [compareQueue]);

    const addToCompare = (opp: Opportunity) => {
        setCompareQueue(prev => {
            if (prev.length >= 4) {
                alert("You can only compare up to 4 opportunities at a time.");
                return prev;
            }
            if (prev.find(item => item.id === opp.id)) return prev;
            return [...prev, opp];
        });
    };

    const removeFromCompare = (id: string) => {
        setCompareQueue(prev => prev.filter(opp => opp.id !== id));
    };

    const clearCompare = () => {
        setCompareQueue([]);
    };

    const isComparing = (id: string) => {
        return compareQueue.some(opp => opp.id === id);
    };

    return (
        <CompareContext.Provider value={{ compareQueue, addToCompare, removeFromCompare, clearCompare, isComparing }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};
