import React, { useState, useEffect, useRef } from 'react';
import { useContributors, useTitheMutations } from '../../tithes/hooks/useTitheBatch';
import { Search, Plus, User, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ContributorSelect({ value, onChange, className, siteId, organizationId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Form State
  const [newDocumentId, setNewDocumentId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  const wrapperRef = useRef(null);

  // Queries
  const { data: contributors = [], isLoading } = useContributors(searchTerm, organizationId);
  const { createContributor } = useTitheMutations();
  const { mutateAsync: createContributorAsync, isPending: isCreating } = createContributor;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Fix: Definition of handleSelect was missing in previous view or scope, ensuring it exists here.
  const handleSelect = (contributor) => {
    setSelectedContributor(contributor);
    onChange(contributor);
    setSearchTerm(`${contributor.first_name || ''} ${contributor.last_name || ''}`.trim());
    setIsOpen(false);
    setShowCreateModal(false);
    
    // Reset Form
    setNewDocumentId('');
    setNewEmail('');
    setNewPhone('');
  };

  const initiateCreate = () => {
      setShowCreateModal(true);
      setIsOpen(false); 
  }

  const handleConfirmCreate = async () => {
    if (!searchTerm || !organizationId || !siteId || !newDocumentId) return;
    
    // Logic: Split name from search term
    const parts = searchTerm.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '';

    try {
      const newContributor = await createContributorAsync({
        first_name: firstName,
        last_name: lastName,
        organization_id: organizationId,
        site_id: siteId,
        document_id: newDocumentId,
        email: newEmail || null,
        phone: newPhone || null
      });
      handleSelect(newContributor);
    } catch (error) {
      console.error("Failed to create contributor", error);
      toast.error("Error al crear contribuyente: " + (error.message || 'Error desconocido'));
    }
  };

  return (
    <>
      <div className={cn("relative", className)} ref={wrapperRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="contributor-search"
            id="contributor-search"
            autoComplete="off"
            className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              if (!e.target.value) {
                  onChange(null); 
                  setSelectedContributor(null);
              }
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {isOpen && searchTerm && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="p-2 text-sm text-gray-500">Cargando...</div>
            ) : contributors.length > 0 ? (
              <ul>
                {contributors.map((c) => (
                  <li
                    key={c.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    onClick={() => handleSelect(c)}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">
                          {c.full_name ? c.full_name : `${c.first_name || ''} ${c.last_name || ''}`}
                      </div>
                      {c.document_id && <div className="text-xs text-gray-500">CC: {c.document_id}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div 
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-600 flex items-center gap-2"
                onClick={initiateCreate}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Crear "{searchTerm}"</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Creating Contributor with Document ID, Email, Phone */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Nuevo Contribuyente</h3>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        Creando a: <span className="font-semibold">{searchTerm}</span>
                    </p>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Cédula / Documento <span className="text-red-500">*</span>
                        </label>
                        <input 
                            autoFocus
                            type="text"
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            placeholder="Ej: 12345678"
                            value={newDocumentId}
                            onChange={(e) => setNewDocumentId(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Correo Electrónico <span className="text-gray-400 text-xs">(Opcional)</span>
                        </label>
                        <input 
                            type="email"
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            placeholder="ejemplo@email.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Teléfono <span className="text-gray-400 text-xs">(Opcional)</span>
                        </label>
                        <input 
                            type="tel"
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            placeholder="Ej: 300 123 4567"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            onKeyDown={(e) => {
                               if(e.key === 'Enter') handleConfirmCreate();
                            }}
                        />
                    </div>
                </div>

                <button 
                  onClick={handleConfirmCreate}
                  disabled={!newDocumentId || isCreating}
                  className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 flex items-center justify-center gap-2 mt-4"
                >
                    {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar y Seleccionar
                </button>
            </div>
        </div>
      )}
    </>
  );
}
