import { Droppable } from '@hello-pangea/dnd';
import { StoryCard } from './StoryCard';
import type { UserStory, Status } from '@/types/xp';

const columnMeta: Record<Status, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-muted-foreground' },
  todo: { label: 'To Do', color: 'bg-info' },
  'in-progress': { label: 'In Progress', color: 'bg-accent' },
  done: { label: 'Done', color: 'bg-success' },
};

interface KanbanColumnProps {
  status: Status;
  stories: UserStory[];
  onCardClick?: (story: UserStory) => void;
}

export function KanbanColumn({ status, stories, onCardClick }: KanbanColumnProps) {
  const meta = columnMeta[status];
  const totalPoints = stories.reduce((sum, s) => sum + s.storyPoints, 0);

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between px-3 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
          <h3 className="text-sm font-semibold">{meta.label}</h3>
          <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
            {stories.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{totalPoints} SP</span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {stories.map((story, idx) => (
              <StoryCard key={story.id} story={story} index={idx} onClick={() => onCardClick?.(story)} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
