import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { db } from './src/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings LIMIT 1').get();
    res.json(settings || { tracking_mode: 'minutes', target_value: null });
  });

  app.post('/api/settings', (req, res) => {
    const { tracking_mode, target_value, activity_name } = req.body;
    const existing = db.prepare('SELECT * FROM settings LIMIT 1').get();
    if (existing) {
      db.prepare('UPDATE settings SET tracking_mode = ?, target_value = ?, activity_name = ?').run(tracking_mode, target_value, activity_name || 'Reading Tracker');
    } else {
      db.prepare('INSERT INTO settings (tracking_mode, target_value, activity_name) VALUES (?, ?, ?)').run(tracking_mode, target_value, activity_name || 'Reading Tracker');
    }
    res.json({ success: true });
  });

  app.get('/api/members', (req, res) => {
    const members = db.prepare('SELECT * FROM members ORDER BY name ASC').all();
    res.json(members);
  });

  app.post('/api/members', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = db.prepare('INSERT INTO members (name) VALUES (?)').run(name);
    res.json({ id: result.lastInsertRowid, name });
  });

  app.delete('/api/members/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    db.prepare('DELETE FROM reading_logs WHERE member_id = ?').run(id);
    res.json({ success: true });
  });

  app.get('/api/logs', (req, res) => {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT l.*, m.name as member_name 
      FROM reading_logs l 
      JOIN members m ON l.member_id = m.id 
    `;
    const params: any[] = [];
    
    if (startDate && endDate) {
      query += ' WHERE l.date >= ? AND l.date <= ? ';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY l.date DESC';
    
    const logs = db.prepare(query).all(...params);
    res.json(logs);
  });

  app.post('/api/logs', (req, res) => {
    const { member_id, date, value, notes } = req.body;
    if (!member_id || !date || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if log already exists for this member on this date
    const existing = db.prepare('SELECT id FROM reading_logs WHERE member_id = ? AND date = ?').get(member_id, date);
    
    if (existing) {
      db.prepare('UPDATE reading_logs SET value = ?, notes = ? WHERE id = ?').run(value, notes || '', (existing as any).id);
    } else {
      db.prepare('INSERT INTO reading_logs (member_id, date, value, notes) VALUES (?, ?, ?, ?)').run(member_id, date, value, notes || '');
    }
    
    res.json({ success: true });
  });

  app.put('/api/logs/:id', (req, res) => {
    const { id } = req.params;
    const { member_id, date, value, notes } = req.body;
    
    if (!member_id || !date || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if another log exists for this member and date
    const existing = db.prepare('SELECT id FROM reading_logs WHERE member_id = ? AND date = ? AND id != ?').get(member_id, date, id);
    if (existing) {
      return res.status(400).json({ error: 'Catatan sudah ada untuk anggota ini pada tanggal tersebut' });
    }

    db.prepare('UPDATE reading_logs SET member_id = ?, date = ?, value = ?, notes = ? WHERE id = ?').run(member_id, date, value, notes || '', id);
    res.json({ success: true });
  });

  app.delete('/api/logs/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM reading_logs WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
