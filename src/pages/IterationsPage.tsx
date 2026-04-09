import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProjectStore } from '@/store/useProjectStore';
import { CalendarDays } from 'lucide-react';

export default function IterationsPage() {
  const { iterations, stories, currentIteration } = useProjectStore();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Iteraciones</h1>
      <div className="space-y-4">
        {iterations.map((iter) => {
          const iterStories = stories.filter((s) => s.iteration === iter.id);
          const done = iterStories.filter((s) => s.status === 'done');
          const totalPoints = iterStories.reduce((sum, s) => sum + s.storyPoints, 0);
          const donePoints = done.reduce((sum, s) => sum + s.storyPoints, 0);
          const progress = totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0;
          const isCurrent = iter.id === currentIteration;

          return (
            <Card key={iter.id} className={isCurrent ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {iter.name}
                    {isCurrent && <Badge className="bg-primary text-primary-foreground text-[10px]">Actual</Badge>}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {iter.startDate} → {iter.endDate}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="flex gap-4 text-sm">
                  <span><strong>{iterStories.length}</strong> historias</span>
                  <span><strong>{donePoints}/{totalPoints}</strong> SP completados</span>
                  <span>Velocidad: <strong>{iter.velocity || '—'}</strong></span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {iterStories.map((s) => (
                    <Badge key={s.id} variant={s.status === 'done' ? 'default' : 'outline'} className="text-xs">
                      {s.title.slice(0, 25)}{s.title.length > 25 ? '…' : ''}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}