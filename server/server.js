const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function success(data) { return { code: 0, data: data }; }
function fail(msg) { return { code: 1, msg: msg }; }

function now() {
  var d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0') + ' ' +
    String(d.getHours()).padStart(2,'0') + ':' +
    String(d.getMinutes()).padStart(2,'0') + ':' +
    String(d.getSeconds()).padStart(2,'0');
}

db.initDb().then(function() {
  console.log('数据库初始化完成');

  /* ========== 统一登录 ========== */
  app.post('/api/login', function(req, res) {
    try {
      var username = req.body.username;
      var password = req.body.password;
      if (!username || !password) {
        return res.status(400).json(fail('账号和密码不能为空'));
      }
      // 管理员
      if (username === 'admin' && password === '123456') {
        return res.json(success({ role: 'admin', username: 'admin', name: '管理员' }));
      }
      // 会员
      var members = db.query('SELECT * FROM members WHERE username=? AND password=?', [username, password]);
      if (members.length > 0) {
        var m = members[0];
        if (m.status === '禁用') return res.status(403).json(fail('账户已被禁用'));
        return res.json(success({ role: 'member', id: m.id, username: m.username, name: m.name }));
      }
      // 专家
      var experts = db.query('SELECT * FROM experts WHERE username=? AND password=?', [username, password]);
      if (experts.length > 0) {
        var e = experts[0];
        if (e.status === '禁用') return res.status(403).json(fail('账户已被禁用'));
        return res.json(success({ role: 'expert', id: e.id, username: e.username, name: e.name }));
      }
      res.status(401).json(fail('账号或密码错误'));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  /* ========== 会员接口 ========== */
  app.get('/api/members', function(req, res) {
    try {
      var name = req.query.name;
      var status = req.query.status;
      var sql = 'SELECT * FROM members WHERE 1=1';
      var params = [];
      if (name) { sql += ' AND name LIKE ?'; params.push('%' + name + '%'); }
      if (status) { sql += ' AND status = ?'; params.push(status); }
      sql += ' ORDER BY id DESC';
      res.json(success(db.query(sql, params)));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.post('/api/members', function(req, res) {
    try {
      var username = req.body.username;
      var password = req.body.password || '123456';
      var name = req.body.name;
      var phone = req.body.phone || '';
      var status = req.body.status || '正常';
      if (!username || !name) return res.status(400).json(fail('账号和名称不能为空'));
      db.run('INSERT INTO members (username, password, name, phone, status) VALUES (?, ?, ?, ?, ?)', [username, password, name, phone, status]);
      db.saveDb();
      res.json(success({ id: db.getLastId() }));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.put('/api/members/:id', function(req, res) {
    try {
      var username = req.body.username;
      var password = req.body.password;
      var name = req.body.name;
      var phone = req.body.phone;
      var status = req.body.status;
      db.run('UPDATE members SET username=?, password=?, name=?, phone=?, status=? WHERE id=?', [username, password, name, phone, status, req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.delete('/api/members/:id', function(req, res) {
    try {
      db.run('DELETE FROM members WHERE id=?', [req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  /* ========== 专家接口 ========== */
  app.get('/api/experts', function(req, res) {
    try {
      var name = req.query.name;
      var status = req.query.status;
      var sql = 'SELECT * FROM experts WHERE 1=1';
      var params = [];
      if (name) { sql += ' AND name LIKE ?'; params.push('%' + name + '%'); }
      if (status) { sql += ' AND status = ?'; params.push(status); }
      sql += ' ORDER BY id DESC';
      res.json(success(db.query(sql, params)));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.post('/api/experts', function(req, res) {
    try {
      var username = req.body.username;
      var password = req.body.password || '123456';
      var name = req.body.name;
      var phone = req.body.phone || '';
      var work_years = req.body.work_years || '';
      var institution = req.body.institution || '';
      var position = req.body.position || '';
      var city = req.body.city || '';
      var specialty = req.body.specialty || '';
      var intro = req.body.intro || '';
      var status = req.body.status || '正常';
      if (!username || !name) return res.status(400).json(fail('账号和名称不能为空'));
      db.run('INSERT INTO experts (username, password, name, phone, work_years, institution, position, city, specialty, intro, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [username, password, name, phone, work_years, institution, position, city, specialty, intro, status]);
      db.saveDb();
      res.json(success({ id: db.getLastId() }));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.put('/api/experts/:id', function(req, res) {
    try {
      var username = req.body.username;
      var password = req.body.password;
      var name = req.body.name;
      var phone = req.body.phone;
      var work_years = req.body.work_years;
      var institution = req.body.institution;
      var position = req.body.position;
      var city = req.body.city;
      var specialty = req.body.specialty;
      var intro = req.body.intro;
      var status = req.body.status;
      db.run('UPDATE experts SET username=?, password=?, name=?, phone=?, work_years=?, institution=?, position=?, city=?, specialty=?, intro=?, status=? WHERE id=?',
        [username, password, name, phone, work_years, institution, position, city, specialty, intro, status, req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.delete('/api/experts/:id', function(req, res) {
    try {
      db.run('DELETE FROM experts WHERE id=?', [req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  /* ========== 主题接口 ========== */
  app.get('/api/topics', function(req, res) {
    try {
      var title = req.query.title;
      var sql = 'SELECT * FROM topics WHERE 1=1';
      var params = [];
      if (title) { sql += ' AND title LIKE ?'; params.push('%' + title + '%'); }
      sql += ' ORDER BY id DESC';
      res.json(success(db.query(sql, params)));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.post('/api/topics', function(req, res) {
    try {
      var title = req.body.title;
      var expert = req.body.expert || '';
      var status = req.body.status || '草稿';
      if (!title) return res.status(400).json(fail('主题标题不能为空'));
      db.run('INSERT INTO topics (title, expert, status) VALUES (?, ?, ?)', [title, expert, status]);
      db.saveDb();
      res.json(success({ id: db.getLastId() }));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.put('/api/topics/:id', function(req, res) {
    try {
      var title = req.body.title;
      var expert = req.body.expert;
      var status = req.body.status;
      db.run('UPDATE topics SET title=?, expert=?, status=? WHERE id=?', [title, expert, status, req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.delete('/api/topics/:id', function(req, res) {
    try {
      db.run('DELETE FROM topics WHERE id=?', [req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  /* ========== 订单接口 ========== */
  app.get('/api/orders', function(req, res) {
    try {
      var no = req.query.no;
      var user = req.query.user;
      var sql = 'SELECT * FROM orders WHERE 1=1';
      var params = [];
      if (no) { sql += ' AND no LIKE ?'; params.push('%' + no + '%'); }
      if (user) { sql += ' AND user LIKE ?'; params.push('%' + user + '%'); }
      sql += ' ORDER BY id DESC';
      res.json(success(db.query(sql, params)));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.post('/api/orders', function(req, res) {
    try {
      var user = req.body.user;
      var topic = req.body.topic;
      var money = req.body.money;
      if (!user || !topic || !money) {
        return res.status(400).json(fail('会员、主题、金额不能为空'));
      }
      var date = new Date();
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var day = String(date.getDate()).padStart(2, '0');
      var dateStr = year + month + day;
      var prefix = 'DD' + dateStr;
      var rows = db.query("SELECT no FROM orders WHERE no LIKE ? ORDER BY no DESC LIMIT 1", [prefix + '%']);
      var seq = 1;
      if (rows.length > 0) {
        var lastNo = rows[0].no;
        var lastSeq = parseInt(lastNo.substring(prefix.length));
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
      }
      var no = prefix + String(seq).padStart(3, '0');
      db.run('INSERT INTO orders (no, user, topic, money, status) VALUES (?, ?, ?, ?, ?)', [no, user, topic, money, '待完成']);
      db.saveDb();
      res.json(success({ id: db.getLastId(), no: no }));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.put('/api/orders/:id', function(req, res) {
    try {
      var status = req.body.status;
      db.run('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.delete('/api/orders/:id', function(req, res) {
    try {
      db.run('DELETE FROM orders WHERE id=?', [req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  /* ========== 消息接口 ========== */
  app.get('/api/messages', function(req, res) {
    try {
      var to_type = req.query.to_type;
      var to_id = req.query.to_id;
      var is_read = req.query.is_read;
      var sql = 'SELECT * FROM messages WHERE 1=1';
      var params = [];
      if (to_type) { sql += ' AND to_type=?'; params.push(to_type); }
      if (to_id) { sql += ' AND to_id=?'; params.push(to_id); }
      if (is_read !== undefined && is_read !== '') { sql += ' AND is_read=?'; params.push(is_read); }
      sql += ' ORDER BY id DESC';
      res.json(success(db.query(sql, params)));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.post('/api/messages', function(req, res) {
    try {
      var from_type = req.body.from_type;
      var from_id = req.body.from_id;
      var from_name = req.body.from_name;
      var to_type = req.body.to_type;
      var to_id = req.body.to_id;
      var to_name = req.body.to_name;
      var title = req.body.title || '';
      var content = req.body.content || '';
      if (!from_type || !to_type || !content) return res.status(400).json(fail('发送方、接收方、内容不能为空'));
      db.run('INSERT INTO messages (from_type, from_id, from_name, to_type, to_id, to_name, title, content, is_read, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [from_type, from_id, from_name, to_type, to_id, to_name, title, content, 0, now()]);
      db.saveDb();
      res.json(success({ id: db.getLastId() }));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.put('/api/messages/:id/read', function(req, res) {
    try {
      db.run('UPDATE messages SET is_read=1 WHERE id=?', [req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  app.delete('/api/messages/:id', function(req, res) {
    try {
      db.run('DELETE FROM messages WHERE id=?', [req.params.id]);
      db.saveDb();
      res.json(success(null));
    } catch (e) {
      res.status(500).json(fail(e.message));
    }
  });

  /* ========== 启动服务 ========== */
  app.listen(PORT, function() {
    console.log('后端服务已启动：http://localhost:' + PORT);
  });

}).catch(function(err) {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});