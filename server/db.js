const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbPath = path.join(__dirname, 'data.db');

let db;
let SQL;

function initDb() {
  return initSqlJs().then(function(sqlJS) {
    SQL = sqlJS;
    if (fs.existsSync(dbPath)) {
      var filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
      console.log('数据库已从文件加载');
    } else {
      db = new SQL.Database();
      console.log('新数据库已创建');
    }

    // 会员表（增加 username/password）
    db.run(`
      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        name TEXT NOT NULL,
        phone TEXT,
        status TEXT DEFAULT '正常'
      );
    `);

    // 专家表
    db.run(`
      CREATE TABLE IF NOT EXISTS experts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        name TEXT NOT NULL,
        phone TEXT,
        work_years TEXT,
        institution TEXT,
        position TEXT,
        city TEXT,
        specialty TEXT,
        intro TEXT,
        status TEXT DEFAULT '正常'
      );
    `);

    // 主题表
    db.run(`
      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        expert TEXT,
        status TEXT DEFAULT '草稿'
      );
    `);

    // 订单表
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no TEXT UNIQUE,
        user TEXT,
        topic TEXT,
        money TEXT,
        status TEXT DEFAULT '待完成'
      );
    `);

    // 消息表（咨询/收件箱）
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_type TEXT,
        from_id INTEGER,
        from_name TEXT,
        to_type TEXT,
        to_id INTEGER,
        to_name TEXT,
        title TEXT,
        content TEXT,
        is_read INTEGER DEFAULT 0,
        create_time TEXT
      );
    `);

    // 预置数据
    var mResult = db.exec("SELECT COUNT(*) as c FROM members");
    var mCount = (mResult[0] && mResult[0].values[0][0]) || 0;
    if (mCount === 0) {
      db.run("INSERT INTO members (username, password, name, phone, status) VALUES (?, ?, ?, ?, ?)",
        ['member001', '123456', '张三', '13800138001', '正常']);
      db.run("INSERT INTO members (username, password, name, phone, status) VALUES (?, ?, ?, ?, ?)",
        ['member002', '123456', '王五', '13800138002', '正常']);
      console.log('预置会员数据已插入');
    }

    var eResult = db.exec("SELECT COUNT(*) as c FROM experts");
    var eCount = (eResult[0] && eResult[0].values[0][0]) || 0;
    if (eCount === 0) {
      db.run("INSERT INTO experts (username, password, name, phone, work_years, institution, position, city, specialty, intro, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['expert001', '123456', '李教授', '13900139001', '15年', '农业大学', '教授', '北京', '农业技术、土壤改良', '长期从事农业技术推广与研究工作，擅长作物栽培与病虫害防治。', '正常']);
      db.run("INSERT INTO experts (username, password, name, phone, work_years, institution, position, city, specialty, intro, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['expert002', '123456', '陈工', '13900139002', '10年', '建筑设计院', '高级工程师', '上海', '工程设计、结构优化', '专注于工业与民用建筑设计，具有丰富的项目实践经验。', '正常']);
      console.log('预置专家数据已插入');
    }

    var oResult = db.exec("SELECT COUNT(*) as c FROM orders");
    var oCount = (oResult[0] && oResult[0].values[0][0]) || 0;
    if (oCount === 0) {
      db.run("INSERT INTO orders (no, user, topic, money, status) VALUES (?, ?, ?, ?, ?)",
        ['DD20260422001', '张三', '农业技术咨询', '100', '待完成']);
      db.run("INSERT INTO orders (no, user, topic, money, status) VALUES (?, ?, ?, ?, ?)",
        ['DD20260422002', '李四', '工程设计指导', '200', '已完成']);
      console.log('预置订单数据已插入');
    }

    saveDb();
    return db;
  });
}

function saveDb() {
  if (db) {
    var data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

function query(sql, params) {
  params = params || [];
  var stmt = db.prepare(sql);
  stmt.bind(params);
  var result = [];
  while (stmt.step()) {
    result.push(stmt.getAsObject());
  }
  stmt.free();
  return result;
}

function run(sql, params) {
  params = params || [];
  db.run(sql, params);
}

function getLastId() {
  var result = db.exec("SELECT last_insert_rowid() as id");
  return result[0].values[0][0];
}

module.exports = {
  initDb: initDb,
  saveDb: saveDb,
  query: query,
  run: run,
  getLastId: getLastId
};