import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useWarehouse } from '../context/WarehouseContext';

export default function RiskAnalysis() {
  const { authToken } = useWarehouse();
  const [weeklyData, setWeeklyData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;

    fetch('/api/analytics', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.detail) throw new Error(data.detail);
        setWeeklyData(data.weekly);
        setDistributionData(data.distribution);
        setZoneData(data.zone_activity);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching analytics:", err);
        setLoading(false);
      });
  }, [authToken]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
        <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>Aggregating Analytics...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Executive Summary</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Risk mitigation analysis based on weekly AI detections.</p>
      </div>

      <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Weekly Trend Chart */}
        <div className="card" style={{ height: '420px', display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '2rem', color: 'var(--text-primary)' }}>Weekly Detection Trend</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: 'var(--text-secondary)' }} />
                <Bar dataKey="Snake" stackId="a" fill="var(--alert-danger)" radius={[0, 0, 4, 4]} barSize={32} />
                <Bar dataKey="Cat" stackId="a" fill="var(--alert-warning)" />
                <Bar dataKey="Gecko" stackId="a" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="card" style={{ height: '420px', display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>Risk Distribution</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={130}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Zone Activity Heatmap */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Zone Activity Heatmap</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Intensity of AI detections across physical warehouse zones.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span> Low</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }}></span> High</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {zoneData.map((zone) => (
            <div key={zone.zone} style={{ 
              padding: '1.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)',
              display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = '0 8px 20px -10px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{zone.zone}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>{zone.intensity}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${zone.intensity}%`, height: '100%', 
                  backgroundColor: zone.intensity > 70 ? 'var(--alert-danger)' : zone.intensity > 40 ? 'var(--alert-warning)' : 'var(--accent-primary)',
                  borderRadius: '4px', transition: 'width 1s ease-out'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mitigation Protocol */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Rapid Response Protocols</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ 
            padding: '1.5rem', borderLeft: '4px solid var(--alert-danger)', 
            backgroundColor: 'var(--bg-primary)', borderRadius: '12px',
            border: '1px solid var(--border-color)', borderLeftWidth: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--alert-danger-bg)', borderRadius: '8px', color: 'var(--alert-danger)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Bio-Hazard (Snakes)</h4>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Immediately halt operations in the affected zone. Notify the animal control unit. Do not attempt manual removal.
            </p>
          </div>

          <div style={{ 
            padding: '1.5rem', borderLeft: '4px solid var(--alert-warning)', 
            backgroundColor: 'var(--bg-primary)', borderRadius: '12px',
            border: '1px solid var(--border-color)', borderLeftWidth: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--alert-warning-bg)', borderRadius: '8px', color: 'var(--alert-warning)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Contamination (Cats/Geckos)</h4>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Log the entry point. Dispatch maintenance to clean the area and inspect for potential goods contamination at the end of the shift.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
