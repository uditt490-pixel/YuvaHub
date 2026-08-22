import React, { useState } from 'react';
import { ResourceTemplate } from '../../types/provisioning';
import { ProvisioningService } from '../../services/ProvisioningService';
import { Plus, Check, LayoutGrid } from 'lucide-react';

interface ResourceCatalogProps {
    templates: ResourceTemplate[];
    onDeployed: () => void;
}

export const ResourceCatalog: React.FC<ResourceCatalogProps> = ({ templates, onDeployed }) => {
    const [deployingId, setDeployingId] = useState<string | null>(null);

    const handleDeploy = async (templateId: string, region: string) => {
        setDeployingId(templateId);
        await ProvisioningService.deployResource(templateId, region);
        setDeployingId(null);
        onDeployed();
    };

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <LayoutGrid className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">Resource Catalog</h3>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                    {templates.map(tpl => (
                        <div key={tpl.templateId} className="flex flex-col xl:flex-row justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-colors group">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-slate-800">{tpl.displayName}</h4>
                                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-black uppercase text-slate-500 shadow-sm">{tpl.type}</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{tpl.description}</p>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Est: <span className="font-bold text-slate-900">${tpl.baseHourlyCost.toFixed(3)} / hr</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-end gap-2 shrink-0">
                                <select className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-700 shadow-sm">
                                    {tpl.availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <button
                                    onClick={() => handleDeploy(tpl.templateId, tpl.availableRegions[0])}
                                    disabled={deployingId !== null}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {deployingId === tpl.templateId ? (
                                        <><div className="animate-spin h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full" /> Initializing</>
                                    ) : (
                                        <><Plus className="h-4 w-4" /> Provision Node</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
