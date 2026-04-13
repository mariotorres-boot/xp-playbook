import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Columns3 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

export default function BoardsOverviewPage() {
  const navigate = useNavigate();
  const { stories, boards, iterations, currentIteration, addBoard, setCurrentBoard } = useProjectStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [boardName, setBoardName] = useState('');

  const handleCreate = () => {
    if (!boardName.trim()) return;
    const id = `b${Date.now()}`;
    addBoard({ id, name: boardName.trim() });
    setCurrentBoard(id);
    setBoardName('');
    setDialogOpen(false);
    navigate('/board');
  };

  const handleClickBoard = (boardId: string) => {
    setCurrentBoard(boardId);
    navigate('/board');
  };

  const currentIter = iterations.find((i) => i.id === currentIteration);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableros</h1>
          <p className="text-sm text-muted-foreground">Selecciona o crea un tablero para trabajar</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Tablero
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => {
          const bStories = stories.filter((s) => s.boardId === board.id || (!s.boardId && board.id === 'b1'));
          const doneCount = bStories.filter((s) => s.status === 'done').length;
          const totalCount = bStories.length;
          const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

          return (
            <Card
              key={board.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
              onClick={() => handleClickBoard(board.id)}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Columns3 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate">{board.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentIter?.name || `Iteración ${currentIteration}`}
                    </p>
                  </div>
                </div>

                <Progress value={pct} className="h-2" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{doneCount}/{totalCount} tareas completadas</span>
                  <span className="font-medium text-foreground">{pct}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo Tablero</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del tablero</Label>
              <Input
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Ej: Sprint 2"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
