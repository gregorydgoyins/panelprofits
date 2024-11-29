import React from 'react';
import { motion } from 'framer-motion';
import { Film, Plus, Edit2, Trash2 } from 'lucide-react';
import { useWritingStore } from '../../store/useWritingStore';

export default function SceneManager() {
  const { scenes, characters, plotPoints, addScene, updateScene, deleteScene } = useWritingStore();
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingScene, setEditingScene] = React.useState<string | null>(null);
  const [newScene, setNewScene] = React.useState({
    title: '',
    description: '',
    characters: [] as string[],
    location: '',
    timeOfDay: '',
    mood: '',
    plotPointId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScene) {
      updateScene(editingScene, newScene);
      setEditingScene(null);
    } else {
      addScene({
        id: Date.now().toString(),
        ...newScene,
      });
    }
    setIsAdding(false);
    setNewScene({
      title: '',
      description: '',
      characters: [],
      location: '',
      timeOfDay: '',
      mood: '',
      plotPointId: '',
    });
  };

  const handleEdit = (scene: any) => {
    setEditingScene(scene.id);
    setNewScene(scene);
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
          <Film className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Scene Manager</h3>
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
            placeholder="Scene Title"
            value={newScene.title}
            onChange={(e) => setNewScene({ ...newScene, title: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <textarea
            placeholder="Scene Description"
            value={newScene.description}
            onChange={(e) => setNewScene({ ...newScene, description: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <select
            multiple
            value={newScene.characters}
            onChange={(e) =>
              setNewScene({
                ...newScene,
                characters: Array.from(e.target.selectedOptions, (option) => option.value),
              })
            }
            className="w-full p-2 border rounded-lg"
          >
            {characters.map((char) => (
              <option key={char.id} value={char.id}>
                {char.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Location"
            value={newScene.location}
            onChange={(e) => setNewScene({ ...newScene, location: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <select
            value={newScene.timeOfDay}
            onChange={(e) => setNewScene({ ...newScene, timeOfDay: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select Time of Day</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
          <input
            type="text"
            placeholder="Mood"
            value={newScene.mood}
            onChange={(e) => setNewScene({ ...newScene, mood: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <select
            value={newScene.plotPointId || ''}
            onChange={(e) => setNewScene({ ...newScene, plotPointId: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Link to Plot Point (Optional)</option>
            {plotPoints.map((point) => (
              <option key={point.id} value={point.id}>
                {point.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {editingScene ? 'Update Scene' : 'Add Scene'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="p-4 border rounded-lg hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{scene.title}</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(scene)}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteScene(scene.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{scene.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scene.characters.map((charId) => (
                <span
                  key={charId}
                  className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full"
                >
                  {characters.find((c) => c.id === charId)?.name}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span>{scene.location}</span> • <span>{scene.timeOfDay}</span> •{' '}
              <span>{scene.mood}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}