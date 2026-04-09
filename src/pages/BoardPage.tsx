import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from '@/components/KanbanColumn';
import { StoryDialog } from '@/components/StoryDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { UserStory, Status } from '@/types/xp';

const COLUMNS: Status[] = ['todo', 'in-progress', 'done'];

export default function BoardPage() {
  const { stories, moveStory, reorderStories, currentIteration } = useProjectStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStory, setEditStory] = useState<UserStory | null>(null);

  const iterStories = stories.filter((s) => s.iteration === currentIteration);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId !== destination.droppableId) {
      moveStory(draggableId, destination.droppableId as Status);
    } else {
      reorderStories(source.droppableId as Status, source.index, destination.index);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Tablero Kanban</h1>
          <p className="text-sm text-muted-foreground">Iteración {currentIteration}</p>
        </div>
        <Button onClick={() => { setEditStory(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Historia
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              stories={iterStories.filter((s) => s.status === status)}
              onCardClick={(s) => { setEditStory(s); setDialogOpen(true); }}
            />
          ))}
        </div>
      </DragDropContext>

      <StoryDialog open={dialogOpen} onOpenChange={setDialogOpen} story={editStory} />
    </div>
  );
}