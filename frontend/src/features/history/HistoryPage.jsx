import { Download } from 'lucide-react';
import Card from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import Alert from '@/components/ui/Alert.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import { api } from '@/services/api.js';
import { useHistory } from './hooks/useHistory.js';
import HistoryFilters from './components/HistoryFilters.jsx';
import HistoryTable from './components/HistoryTable.jsx';
import Pagination from './components/Pagination.jsx';

export default function HistoryPage() { const { data, loading, error, filters, update } = useHistory(); const result=data||{rows:[],totalPages:1,page:1,total:0}; const exportFile=format=>window.open(api.exportUrl(format,filters),'_blank','noopener,noreferrer'); return <div className="space-y-5"><div><h1 className="text-2xl font-bold">History</h1><p className="mt-1 text-sm text-slate-500">Saved Top N snapshots retained according to the Settings page.</p></div><HistoryFilters filters={filters} update={update}/><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm text-slate-500">{result.total.toLocaleString('en-IN')} records</div><div className="flex gap-2"><Button onClick={()=>exportFile('csv')}><Download size={15} aria-hidden="true"/> CSV</Button><Button onClick={()=>exportFile('json')}><Download size={15} aria-hidden="true"/> JSON</Button></div></div>{error&&<Alert>{error}</Alert>}{loading?<Spinner label="Loading history…"/>:<HistoryTable rows={result.rows}/>}<Pagination page={result.page} totalPages={result.totalPages} update={update}/></div>; }
