import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from '@/components/KanbanColumn';
import { StoryDialog } from '@/components/StoryDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, LayoutGrid, Pencil, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { UserStory, Status } from '@/types/xp';

const COLUMNS: Status[] = ['todo', 'in-progress', 'in-review', 'done'];

export default function BoardPage() {
  const { stories, moveStory, reorderStories, currentIteration, boards, currentBoardId, setCurrentBoard, addBoard, updateBoard, deleteBoard } = useProjectStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStory, setEditStory] = useState<UserStory | null>(null);
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [editBoardId, setEditBoardId] = useState<string | null>(null);

  const iterStories = stories.filter((s) => s.iteration === currentIteration && (s.boardId === currentBoardId || (!s.boardId && currentBoardId === 'b1')));

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

  const openNewBoard = () => { setEditBoardId(null); setBoardName(''); setBoardDialogOpen(true); };
  const openEditBoard = () => { setEditBoardId(currentBoardId); setBoardName(boards.find(b => b.id === currentBoardId)?.name || ''); setBoardDialogOpen(true); };

  const handleSaveBoard = () => {
    if (!boardName.trim()) return;
    if (editBoardId) {
      updateBoard(editBoardId, { name: boardName });
    } else {
      const id = `b${Date.now()}`;
      addBoard({ id, name: boardName });
      setCurrentBoard(id);
    }
    setBoardDialogOpen(false);
  };

  const handleDeleteBoard = () => {
    if (boards.length <= 1) return;
    deleteBoard(currentBoardId);
    setBoardDialogOpen(false);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Tablero</h1>
            <p className="text-sm text-muted-foreground">Iteración {currentIteration}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={currentBoardId} onValueChange={setCurrentBoard}>
            <SelectTrigger className="w-[200px]">
              <LayoutGrid className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {boards.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={openEditBoard} title="Editar tablero">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={openNewBoard} title="Nuevo tablero">
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setEditStory(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Nueva Actividad
          </Button>
        </div>
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

      <StoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        story={editStory}
        defaultStatus="todo"
        defaultIteration={currentIteration}
      />

      <Dialog open={boardDialogOpen} onOpenChange={setBoardDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editBoardId ? 'Editar Tablero' : 'Nuevo Tablero'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del tablero</Label>
              <Input value={boardName} onChange={(e) => setBoardName(e.target.value)} placeholder="Ej: Sprint 2" />
            </div>
            <div className="flex items-center justify-between">
              {editBoardId && boards.length > 1 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteBoard}>
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => setBoardDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveBoard}>{editBoardId ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
