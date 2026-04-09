import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical } from 'lucide-react';
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
  const { stories } = useProjectStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStory, setEditStory] = useState<UserStory | null>(null);

  const backlog = stories.filter((s) => s.status === 'backlog');
  const totalPoints = backlog.reduce((sum, s) => sum + s.storyPoints, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Backlog</h1>
          <p className="text-sm text-muted-foreground">{backlog.length} stories · {totalPoints} story points</p>
        </div>
        <Button onClick={() => { setEditStory(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Story
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
                      <Card
                        className="p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow"
                        onClick={() => { setEditStory(story); setDialogOpen(true); }}
                      >
                        <div {...prov.dragHandleProps} className="text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityColors[story.priority]}`}>
                          {story.priority}
                        </Badge>
                        <span className="text-sm font-medium flex-1">{story.title}</span>
                        <Badge variant="secondary" className="text-xs">{story.storyPoints} SP</Badge>
                        <Badge variant="outline" className="text-xs">{story.type}</Badge>
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
