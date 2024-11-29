import React from 'react';
import { motion } from 'framer-motion';
import { Network, Plus, X } from 'lucide-react';
import { useWritingStore } from '../../store/useWritingStore';

const relationshipTypes = [
  'Family',
  'Friend',
  'Enemy',
  'Mentor',
  'Student',
  'Lover',
  'Rival',
  'Colleague',
];

export default function CharacterRelationships() {
  const { characters, addRelationship } = useWritingStore();
  const [selectedCharacter, setSelectedCharacter] = React.useState<string | null>(null);
  const [newRelationship, setNewRelationship] = React.useState({
    characterId: '',
    type: relationshipTypes[0],
    description: '',
  });

  const handleAddRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCharacter && newRelationship.characterId) {
      addRelationship(selectedCharacter, newRelationship);
      setNewRelationship({
        characterId: '',
        type: relationshipTypes[0],
        description: '',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <Network className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Character Relationships</h3>
      </div>

      <div className="space-y-4">
        <select
          value={selectedCharacter || ''}
          onChange={(e) => setSelectedCharacter(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Select a character</option>
          {characters.map((char) => (
            <option key={char.id} value={char.id}>
              {char.name}
            </option>
          ))}
        </select>

        {selectedCharacter && (
          <form onSubmit={handleAddRelationship} className="space-y-4">
            <select
              value={newRelationship.characterId}
              onChange={(e) =>
                setNewRelationship({ ...newRelationship, characterId: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select related character</option>
              {characters
                .filter((char) => char.id !== selectedCharacter)
                .map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name}
                  </option>
                ))}
            </select>

            <select
              value={newRelationship.type}
              onChange={(e) =>
                setNewRelationship({ ...newRelationship, type: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            >
              {relationshipTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Describe the relationship..."
              value={newRelationship.description}
              onChange={(e) =>
                setNewRelationship({ ...newRelationship, description: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            />

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Relationship
            </button>
          </form>
        )}

        {selectedCharacter && (
          <div className="mt-6">
            <h4 className="font-medium mb-4">Existing Relationships</h4>
            <div className="space-y-3">
              {characters
                .find((c) => c.id === selectedCharacter)
                ?.relationships.map((rel, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {characters.find((c) => c.id === rel.characterId)?.name}
                        </span>
                        <span className="text-sm text-indigo-600">({rel.type})</span>
                      </div>
                      <p className="text-sm text-gray-600">{rel.description}</p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}