import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Users, TestTube2, Bug, BookOpen, Wrench } from 'lucide-react';
import type { UserStory } from '@/types/xp';
import { useProjectStore } from '@/store/useProjectStore';

const priorityColors: Record<string, string> = {
  critical: 'bg-[hsl(var(--priority-critical))] text-destructive-foreground',
  high: 'bg-[hsl(var(--priority-high))] text-accent-foreground',
  medium: 'bg-[hsl(var(--priority-medium))] text-warning-foreground',
  low: 'bg-[hsl(var(--priority-low))] text-success-foreground',
};

const typeIcons: Record<string, React.ReactNode> = {
  'user-story': <BookOpen className="h-3.5 w-3.5" />,
  'task': <Wrench className="h-3.5 w-3.5" />,
  'bug': <Bug className="h-3.5 w-3.5" />,
  'tdd-task': <TestTube2 className="h-3.5 w-3.5" />,
};

interface StoryCardProps {
  story: UserStory;
  index: number;
  onClick?: () => void;
}

export function StoryCard({ story, index, onClick }: StoryCardProps) {
  const team = useProjectStore((s) => s.team);
  const assignee = team.find((m) => m.id === story.assignee);

  return (
    <Draggable draggableId={story.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2"
        >
          <Card
            onClick={onClick}
            className={`p-3 cursor-pointer border transition-all hover:shadow-md animate-fade-in ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/30 rotate-1' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-muted-foreground">{typeIcons[story.type]}</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[story.priority]}`}>
                {story.priority}
              </Badge>
              {story.type === 'tdd-task' && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-info text-info-foreground">TDD</Badge>
              )}
            </div>
            <h4 className="text-sm font-medium leading-snug mb-2">{story.title}</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {assignee && (
                  <span className="text-xs text-muted-foreground">{assignee.name.split(' ')[0]}</span>
                )}
                {story.pair && (
                  <span className="flex items-center gap-0.5 text-xs text-primary">
                    <Users className="h-3 w-3" /> Pair
                  </span>
                )}
              </div>
              <Badge variant="secondary" className="text-xs font-semibold">
                {story.storyPoints} SP
              </Badge>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
