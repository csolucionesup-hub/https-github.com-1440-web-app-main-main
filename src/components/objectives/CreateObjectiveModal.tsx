import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { EntityStatus, Objective } from '../../types';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    objectiveToEdit?: Objective;
}

export const CreateObjectiveModal = ({ isOpen, onClose, projectId, objectiveToEdit }: Props) => {
    const { addObjective, updateObjective, goals, projects } = useAppStore();

    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [internalProjectId, setInternalProjectId] = useState(projectId || '');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [period, setPeriod] = useState<'quarterly' | 'bimonthly' | 'monthly'>('monthly');
    const [status, setStatus] = useState<EntityStatus>('active');

    const filteredProjects = React.useMemo(() => {
        if (!selectedGoalId) return [];
        return projects.filter(p => p.goalId === selectedGoalId);
    }, [projects, selectedGoalId]);

    React.useEffect(() => {
        if (objectiveToEdit && isOpen) {
            setTitle(objectiveToEdit.title);
            setDescription(objectiveToEdit.description || '');
            setPeriod(objectiveToEdit.period);
            setStatus(objectiveToEdit.status);
            
            // Find parent goal
            const parentProj = projects.find(p => p.id === objectiveToEdit.projectId);
            if (parentProj) {
                setSelectedGoalId(parentProj.goalId);
                setInternalProjectId(objectiveToEdit.projectId);
            }
        } else if (isOpen) {
            setTitle('');
            setDescription('');
            setPeriod('monthly');
            setStatus('active');
            
            if (projectId) {
                const parentProj = projects.find(p => p.id === projectId);
                if (parentProj) {
                    setSelectedGoalId(parentProj.goalId);
                    setInternalProjectId(projectId);
                }
            } else {
                setSelectedGoalId('');
                setInternalProjectId('');
            }
        }
    }, [objectiveToEdit, isOpen, projectId, projects]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalProjectId = internalProjectId || projectId;
        if (title.trim() && finalProjectId) {
            if (objectiveToEdit) {
                updateObjective(objectiveToEdit.id, {
                    title: title.trim(),
                    description: description.trim(),
                    period,
                    status,
                    projectId: finalProjectId
                });
            } else {
                addObjective({
                    projectId: finalProjectId,
                    title: title.trim(),
                    description: description.trim(),
                    period,
                });
            }
            onClose();
        };
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass w-full max-w-lg rounded-2xl p-5 border border-indigo-500/20 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold font-heading mb-6">
                    {objectiveToEdit ? 'Editar Objetivo' : 'Crear Nuevo Objetivo'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">1. Meta</label>
                            <select
                                value={selectedGoalId}
                                onChange={(e) => {
                                    setSelectedGoalId(e.target.value);
                                    setInternalProjectId('');
                                }}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="">Selecciona meta</option>
                                {goals.map(g => (
                                    <option key={g.id} value={g.id}>{g.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">2. Proyecto</label>
                            <select
                                value={internalProjectId}
                                onChange={(e) => setInternalProjectId(e.target.value)}
                                disabled={!selectedGoalId}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                            >
                                <option value="">{selectedGoalId ? 'Selecciona proyecto' : 'Elige meta'}</option>
                                {filteredProjects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Título del Objetivo</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                            placeholder="Ej: Finalizar diseño de la app"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-20"
                            placeholder="Detalles sobre este objetivo..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Periodo</label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="monthly" className="bg-slate-900 text-white">Mensual</option>
                                <option value="bimonthly" className="bg-slate-900 text-white">Bimestral</option>
                                <option value="quarterly" className="bg-slate-900 text-white">Trimestral</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Estado</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="active" className="bg-slate-900 text-white">Activo</option>
                                <option value="pending" className="bg-slate-900 text-white">Pendiente</option>
                                <option value="paused" className="bg-slate-900 text-white">Pausado</option>
                                {objectiveToEdit && <option value="completed" className="bg-emerald-900 text-emerald-100">Completado</option>}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-5 py-2.5 text-sm rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        >
                            {objectiveToEdit ? 'Guardar Cambios' : 'Crear Objetivo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
