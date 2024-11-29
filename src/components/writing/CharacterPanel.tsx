import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserSquare2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useWritingStore } from '../../store/useWritingStore';

export default function CharacterPanel() {
  const { characters, addCharacter, updateCharacter } = useWritingStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    role: '',
    description: '',
    traits: [] as string[],
    relationships: [] as any[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCharacter(editingId, newCharacter);
      setEditingId(null);
    } else {
      addCharacter({
        id: Date.now().toString(),
        ...newCharacter
      });
    }
    setIsAdding(false);
    setNewCharacter({ name: '', role: '', description: '', traits: [], relationships: [] });
  };

  const handleEdit = (character: any) => {
    setNewCharacter(character);
    setEditingId(character.id);
    setIsAdding(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <UserSquare2 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Characters</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Character Name"
            value={newCharacter.name}
            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Role"
            value={newCharacter.role}
            onChange={(e) => setNewCharacter({ ...newCharacter, role: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={newCharacter.description}
            onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {editingId ? 'Update Character' : 'Add Character'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setNewCharacter({ name: '', role: '', description: '', traits: [], relationships: [] });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {characters.map((character) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 border rounded-lg hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{character.name}</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(character)}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{character.role}</p>
            <p className="text-sm text-gray-500 mt-2">{character.description}</p>
            {character.traits.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {character.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}