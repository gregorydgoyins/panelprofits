import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutPanelTop, Plus, Edit2, Trash2 } from 'lucide-react';
import { useWritingStore } from '../../store/useWritingStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortablePlotPoint({ point }: { point: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: point.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-white border rounded-lg hover:border-indigo-300 transition-colors cursor-move"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{point.title}</h4>
          <p className="text-sm text-gray-500">{point.description}</p>
          <span className="text-xs text-indigo-600">Act {point.act}</span>
        </div>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-400 hover:text-indigo-600">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlotStructure() {
  const { plotPoints, addPlotPoint, reorderPlotPoints } = useWritingStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newPoint, setNewPoint] = useState({
    title: '',
    description: '',
    act: 1,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = plotPoints.findIndex((p) => p.id === active.id);
      const newIndex = plotPoints.findIndex((p) => p.id === over.id);

      reorderPlotPoints(arrayMove(plotPoints, oldIndex, newIndex));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlotPoint({
      id: Date.now().toString(),
      ...newPoint,
      order: plotPoints.length,
    });
    setIsAdding(false);
    setNewPoint({ title: '', description: '', act: 1 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <LayoutPanelTop className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Plot Structure</h3>
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
            placeholder="Plot Point Title"
            value={newPoint.title}
            onChange={(e) => setNewPoint({ ...newPoint, title: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={newPoint.description}
            onChange={(e) => setNewPoint({ ...newPoint, description: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <select
            value={newPoint.act}
            onChange={(e) => setNewPoint({ ...newPoint, act: Number(e.target.value) })}
            className="w-full p-2 border rounded-lg"
          >
            <option value={1}>Act 1</option>
            <option value={2}>Act 2</option>
            <option value={3}>Act 3</option>
          </select>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Plot Point
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={plotPoints.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {plotPoints.map((point) => (
              <SortablePlotPoint key={point.id} point={point} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </motion.div>
  );
}