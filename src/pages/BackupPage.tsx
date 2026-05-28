import { useRef, useState } from 'react';
import { Database, Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/store/useProjectStore';
import { downloadFile, toCSV, stamp } from '@/lib/backup';
import { toast } from 'sonner';

const ENTITIES = ['stories', 'iterations', 'team', 'groups', 'boards', 'activityLogs'] as const;
type EntityKey = (typeof ENTITIES)[number];

const ENTITY_LABEL: Record<EntityKey, string> = {
  stories: 'Historias / Actividades',
  iterations: 'Iteraciones',
  team: 'Equipo',
  groups: 'Grupos',
  boards: 'Tableros (Sprints)',
  activityLogs: 'Registro de Actividad',
};

export default function BackupPage() {
  const state = useProjectStore();
  const restoreBackup = useProjectStore((s) => s.restoreBackup);
  const fileRef = useRef<HTMLInputElement>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('xp-last-backup')
  );

  const snapshot = () => ({
    stories: state.stories,
    iterations: state.iterations,
    team: state.team,
    groups: state.groups,
    boards: state.boards,
    activityLogs: state.activityLogs,
    currentIteration: state.currentIteration,
    currentBoardId: state.currentBoardId,
    penaltyRate: state.penaltyRate,
    exportedAt: new Date().toISOString(),
    version: 'v5',
  });

  const exportJSON = () => {
    const data = snapshot();
    downloadFile(`respaldo-xp-${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json');
    const ts = new Date().toISOString();
    localStorage.setItem('xp-last-backup', ts);
    setLastBackup(ts);
    toast.success('Respaldo JSON descargado');
  };

  const exportCSV = (key: EntityKey) => {
    const rows = state[key] as unknown as Record<string, unknown>[];
    if (!rows?.length) {
      toast.warning(`No hay datos en ${ENTITY_LABEL[key]}`);
      return;
    }
    downloadFile(`${key}-${stamp()}.csv`, toCSV(rows), 'text/csv;charset=utf-8');
    toast.success(`CSV de ${ENTITY_LABEL[key]} descargado`);
  };

  const exportAllCSV = () => {
    ENTITIES.forEach((k) => {
      const rows = state[k] as unknown as Record<string, unknown>[];
      if (rows?.length) downloadFile(`${k}-${stamp()}.csv`, toCSV(rows), 'text/csv;charset=utf-8');
    });
    toast.success('Respaldo CSV completo descargado');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object') throw new Error('Formato inválido');
      const allowed: Partial<Record<EntityKey | 'currentIteration' | 'currentBoardId' | 'penaltyRate', unknown>> = {};
      [...ENTITIES, 'currentIteration', 'currentBoardId', 'penaltyRate'].forEach((k) => {
        if (k in data) (allowed as Record<string, unknown>)[k] = data[k];
      });
      if (!confirm('Esto reemplazará los datos actuales del sistema. ¿Continuar?')) return;
      restoreBackup(allowed);
      toast.success('Datos restaurados correctamente');
    } catch (err) {
      toast.error('Archivo de respaldo inválido');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <Database className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Respaldos del Sistema</h1>
          <p className="text-sm text-muted-foreground">
            Exporta o restaura toda la información del proyecto en formato JSON o CSV.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Exportar</CardTitle>
          <CardDescription>
            JSON es el formato recomendado para restaurar. CSV es útil para abrir en Excel/Sheets.
            {lastBackup && (
              <span className="block mt-1 text-xs">
                Último respaldo JSON: {new Date(lastBackup).toLocaleString('es-ES')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportJSON}>
              <FileJson className="h-4 w-4" /> Respaldo completo (JSON)
            </Button>
            <Button variant="secondary" onClick={exportAllCSV}>
              <FileSpreadsheet className="h-4 w-4" /> Respaldo completo (CSV)
            </Button>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Exportar entidad individual a CSV:</p>
            <div className="flex flex-wrap gap-2">
              {ENTITIES.map((k) => (
                <Button key={k} variant="outline" size="sm" onClick={() => exportCSV(k)}>
                  <FileSpreadsheet className="h-4 w-4" /> {ENTITY_LABEL[k]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Restaurar / Importar</CardTitle>
          <CardDescription>
            Selecciona un archivo JSON previamente exportado. Los datos actuales serán reemplazados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="default" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Seleccionar archivo JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
