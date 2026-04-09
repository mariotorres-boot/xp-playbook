import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarRange } from 'lucide-react';

const releases = [
  { id: '1', name: 'v1.0 - MVP', targetDate: '2026-05-15', iterations: [1, 2], status: 'In Progress' },
  { id: '2', name: 'v1.1 - Enhancements', targetDate: '2026-06-15', iterations: [3], status: 'Planned' },
];

export default function ReleasesPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Release Planning</h1>
      <div className="space-y-4">
        {releases.map((rel) => (
          <Card key={rel.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-primary" /> {rel.name}
                </CardTitle>
                <Badge variant={rel.status === 'In Progress' ? 'default' : 'secondary'}>{rel.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Target: {rel.targetDate}</p>
              <div className="flex gap-2">
                {rel.iterations.map((it) => (
                  <Badge key={it} variant="outline">Iteration {it}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
