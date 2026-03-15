import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Layers, Plus, Briefcase, User, Heart } from 'lucide-react';

export default function WorkspaceSelector() {
  const { workspaces, activeWorkspaceId, setActiveWorkspace, addWorkspace } = useAppStore();

  const handleCreateDefault = () => {
    const hasPersonal = workspaces.some(w => w.name === 'Personal');
    const hasNegocios = workspaces.some(w => w.name === 'Negocios');
    
    if (!hasPersonal) {
      addWorkspace({ name: 'Personal', color: '#4F46E5', description: 'Metas personales y espirituales' });
    }
    if (!hasNegocios) {
      addWorkspace({ name: 'Negocios', color: '#0ea5e9', description: 'Holding Creersoluciones' });
    }
  };

  React.useEffect(() => {
    if (workspaces.length === 0) {
      handleCreateDefault();
    }
  }, [workspaces.length]);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div style={{ width: '100%', padding: '0 8px', position: 'relative' }}>
      <div 
        className="glass-card premium-border"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transition: 'all 0.2s ease',
          border: isOpen ? '1px solid rgba(79,70,229,0.4)' : undefined
        }}
      >
        <div 
          style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 10, 
            background: activeWorkspace?.color || '#4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: `0 0 15px ${(activeWorkspace?.color || '#4F46E5')}44`
          }}
        >
          <Layers size={16} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeWorkspace?.name || 'Seleccionar...'}
          </div>
          <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>
            Área de Enfoque
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="glass-card premium-border animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 8,
            right: 8,
            borderRadius: 16,
            background: '#0f172a',
            padding: 8,
            zIndex: 100,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          {workspaces.map(w => (
            <div 
              key={w.id}
              onClick={() => {
                setActiveWorkspace(w.id);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: activeWorkspaceId === w.id ? 'rgba(79,70,229,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: w.color }} />
              <span style={{ fontSize: 13, color: activeWorkspaceId === w.id ? 'white' : '#94a3b8' }}>{w.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
