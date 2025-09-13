import React, { useState, useEffect, useRef } from 'react';
import API from '../api/api';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useNavigate } from 'react-router-dom';

export default function Leads(){
  const [rowData, setRowData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const gridRef = useRef();
  const nav = useNavigate();

  const columnDefs = [
    { field: 'first_name', headerName: 'First' },
    { field: 'last_name', headerName: 'Last' },
    { field: 'email', headerName: 'Email' },
    { field: 'company', headerName: 'Company' },
    { field: 'city', headerName: 'City' },
    { field: 'status', headerName: 'Status' },
    { field: 'source', headerName: 'Source' },
    { field: 'score', headerName: 'Score' },
    { field: 'lead_value', headerName: 'Value' },
    { field: 'is_qualified', headerName: 'Qualified' },
    { field: 'created_at', headerName: 'Created At', valueFormatter: params => new Date(params.value).toLocaleString() },
    { headerName: 'Actions', cellRenderer: params => {
      return (
        <div>
          <button onClick={()=>nav(`/leads/${params.data._id}/edit`)}>Edit</button>
          <button onClick={async ()=> {
            if(!confirm('Delete lead?')) return;
            await API.delete(`/leads/${params.data._id}`);
            fetchData();
          }}>Delete</button>
        </div>
      );
    }}
  ];

  async function fetchData(p=page, l=limit, f=filters) {
    const params = { page: p, limit: l, ...f };
    const res = await API.get('/leads', { params });
    setRowData(res.data.data);
    setPage(res.data.page);
    setLimit(res.data.limit);
    setTotalPages(res.data.totalPages);
    setTotal(res.data.total);
  }

  useEffect(()=>{ fetchData(); }, []);

  const applyFilters = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newFilters = {};
    if(fd.get('email_contains')) newFilters.email_contains = fd.get('email_contains');
    if(fd.get('company_contains')) newFilters.company_contains = fd.get('company_contains');
    if(fd.get('status')) newFilters.status = fd.get('status');
    setFilters(newFilters);
    await fetchData(1, limit, newFilters);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
        <h2>Leads</h2>
        <div>
          <button onClick={()=>nav('/leads/new')}>New Lead</button>
        </div>
      </div>

      <form onSubmit={applyFilters} style={{ marginBottom:12 }}>
        <input name="email_contains" placeholder="email contains" />
        <input name="company_contains" placeholder="company contains" />
        <select name="status">
          <option value="">status (any)</option>
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="qualified">qualified</option>
          <option value="lost">lost</option>
          <option value="won">won</option>
        </select>
        <button>Apply</button>
      </form>

      <div className="ag-theme-alpine" style={{ height: 500 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          rowSelection="single"
          pagination={false}
        />
      </div>

      <div style={{ marginTop:12 }}>
        <button disabled={page<=1} onClick={()=>fetchData(page-1, limit)}>Prev</button>
        <span style={{ margin:'0 8px' }}>Page {page} / {totalPages} — total {total}</span>
        <button disabled={page>=totalPages} onClick={()=>fetchData(page+1, limit)}>Next</button>
        <select value={limit} onChange={e=>{const l=Number(e.target.value); setLimit(l); fetchData(1,l);}}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
