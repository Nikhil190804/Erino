import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function LeadForm(){
  const params = useParams();
  const nav = useNavigate();
  const [lead, setLead] = useState({
    first_name:'', last_name:'', email:'', phone:'', company:'', city:'', state:'', source:'website',
    status:'new', score:0, lead_value:0, is_qualified:false
  });

  useEffect(()=> {
    if(params.id){
      API.get(`/leads/${params.id}`)
        .then(res => setLead(res.data))
        .catch(()=>alert('Failed to load'));
    }
  }, [params.id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if(params.id){
        await API.put(`/leads/${params.id}`, lead);
      } else {
        await API.post('/leads', lead);
      }
      nav('/leads');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div style={{ maxWidth:800, margin:'24px auto' }}>
      <h2>{params.id ? 'Edit Lead' : 'New Lead'}</h2>
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <label>
            First name
            <input required value={lead.first_name} 
                   onChange={e=>setLead({...lead, first_name:e.target.value})}/>
          </label>
          <label>
            Last name
            <input required value={lead.last_name} 
                   onChange={e=>setLead({...lead, last_name:e.target.value})}/>
          </label>
          <label>
            Email
            <input required type="email" value={lead.email} 
                   onChange={e=>setLead({...lead, email:e.target.value})}/>
          </label>
          <label>
            Phone
            <input value={lead.phone} 
                   onChange={e=>setLead({...lead, phone:e.target.value})}/>
          </label>
          <label>
            Company
            <input value={lead.company} 
                   onChange={e=>setLead({...lead, company:e.target.value})}/>
          </label>
          <label>
            City
            <input value={lead.city} 
                   onChange={e=>setLead({...lead, city:e.target.value})}/>
          </label>
          <label>
            State
            <input value={lead.state} 
                   onChange={e=>setLead({...lead, state:e.target.value})}/>
          </label>
          <label>
            Source
            <select value={lead.source} 
                    onChange={e=>setLead({...lead, source:e.target.value})}>
              <option value="website">website</option>
              <option value="facebook_ads">facebook_ads</option>
              <option value="google_ads">google_ads</option>
              <option value="referral">referral</option>
              <option value="events">events</option>
              <option value="other">other</option>
            </select>
          </label>
          <label>
            Status
            <select value={lead.status} 
                    onChange={e=>setLead({...lead, status:e.target.value})}>
              <option value="new">new</option>
              <option value="contacted">contacted</option>
              <option value="qualified">qualified</option>
              <option value="lost">lost</option>
              <option value="won">won</option>
            </select>
          </label>
          <label>
            Lead Score
            <input type="number" value={lead.score} 
                   onChange={e=>setLead({...lead, score: Number(e.target.value)})}/>
          </label>
          <label>
            Lead Value
            <input type="number" value={lead.lead_value} 
                   onChange={e=>setLead({...lead, lead_value: Number(e.target.value)})}/>
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <input type="checkbox" 
                   checked={lead.is_qualified} 
                   onChange={e=>setLead({...lead, is_qualified:e.target.checked})}/> 
            Is Qualified
          </label>
        </div>

        <div style={{ marginTop:12 }}>
          <button type="submit">Save</button>
          <button type="button" onClick={()=>nav('/leads')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
