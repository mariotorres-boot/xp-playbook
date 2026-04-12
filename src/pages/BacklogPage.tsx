import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { StoryDialog } from '@/components/StoryDialog';
import { useProjectStore } from '@/store/useProjectStore';
import type { UserStory } from '@/types/xp';

const priorityColors: Record<string, string> = {
  critical: 'bg-[hsl(var(--priority-critical))] text-destructive-foreground',
  high: 'bg-[hsl(var(--priority-high))] text-accent-foreground',
  medium: 'bg-[hsl(var(--priority-medium))] text-warning-foreground',
  low: 'bg-[hsl(var(--priority-low))] text-success-foreground',
};

export default function BacklogPage() {
  const { stories, deleteStory } = useProjectStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStory, setEditStory] = useState<UserStory | null>(null);

  const backlog = stories.filter((s) => s.status === 'backlog');
  const totalPoints = backlog.reduce((sum, s) => sum + s.storyPoints, 0);

  const handleEdit = (story: UserStory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditStory(story);
    setDialogOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteStory(id);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Backlog del Producto</h1>
          <p className="text-sm text-muted-foreground">{backlog.length} actividades · {totalPoints} puntos de historia</p>
        </div>
        <Button onClick={() => { setEditStory(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Agregar Actividad
        </Button>
      </div>

      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="backlog">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {backlog.map((story, idx) => (
                <Draggable key={story.id} draggableId={story.id} index={idx}>
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps}>
                      <Card className="p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow">
                        <div {...prov.dragHandleProps} className="text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityColors[story.priority]}`}>
                          {{ critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja' }[story.priority] || story.priority}
                        </Badge>
                        <span className="text-sm font-medium flex-1">{story.title}</span>
                        <Badge variant="secondary" className="text-xs">{story.storyPoints} SP</Badge>
                        <Badge variant="outline" className="text-xs">{{ 'user-story': 'Historia', 'task': 'Tarea', 'bug': 'Bug', 'tdd-task': 'TDD' }[story.type] || story.type}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleEdit(story, e)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => handleDelete(story.id, e)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <StoryDialog open={dialogOpen} onOpenChange={setDialogOpen} story={editStory} />
    </div>
  );
}
