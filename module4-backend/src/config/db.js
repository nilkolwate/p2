const oracledb = require('oracledb');
const env = require('./env');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;
oracledb.fetchAsString = [oracledb.CLOB];

let pool;

const camel = (s) => s.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

async function init() {
  pool = await oracledb.createPool({
    user: env.db.user,
    password: env.db.password,
    connectString: env.db.connectString,
    poolMin: 1,
    poolMax: 10,
    poolIncrement: 1,
  });
  return pool;
}

async function close() {
  if (pool) await pool.close(5);
}

async function execute(sql, binds = {}, options = {}) {
  const conn = await pool.getConnection();
  try {
    return await conn.execute(sql, binds, options);
  } finally {
    await conn.close();
  }
}

/** Run a SELECT and return rows with camelCase keys. */
async function query(sql, binds = {}) {
  const result = await execute(sql, binds);
  return (result.rows || []).map((row) =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [camel(k), v]))
  );
}

async function queryOne(sql, binds = {}) {
  const rows = await query(sql, binds);
  return rows[0] || null;
}

module.exports = { init, close, execute, query, queryOne };
