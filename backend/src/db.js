const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'database.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadState() {
  if (!fs.existsSync(dbPath)) {
    return {
      counters: {
        users: 1,
        resumes: 1,
        orders: 1,
        transactions: 1,
      },
      users: [],
      resumes: [],
      orders: [],
      transactions: [],
    };
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(raw);
    const counters = Object.assign(
      {
        users: 1,
        resumes: 1,
        orders: 1,
        transactions: 1,
      },
      parsed.counters || {}
    );

    if (parsed.users?.length) {
      counters.users = Math.max(counters.users, Math.max(...parsed.users.map((item) => item.id)) + 1);
    }
    if (parsed.resumes?.length) {
      counters.resumes = Math.max(counters.resumes, Math.max(...parsed.resumes.map((item) => item.id)) + 1);
    }
    if (parsed.orders?.length) {
      counters.orders = Math.max(counters.orders, Math.max(...parsed.orders.map((item) => item.id)) + 1);
    }
    if (parsed.transactions?.length) {
      counters.transactions = Math.max(
        counters.transactions,
        Math.max(...parsed.transactions.map((item) => item.id)) + 1
      );
    }

    return {
      counters,
      users: parsed.users || [],
      resumes: parsed.resumes || [],
      orders: parsed.orders || [],
      transactions: parsed.transactions || [],
    };
  } catch (error) {
    console.error('Failed to load database; starting fresh', error);
    return {
      counters: {
        users: 1,
        resumes: 1,
        orders: 1,
        transactions: 1,
      },
      users: [],
      resumes: [],
      orders: [],
      transactions: [],
    };
  }
}

const state = loadState();

function persist() {
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
}

function nextId(key) {
  const value = state.counters[key];
  state.counters[key] += 1;
  return value;
}

function getUserByEmail(email) {
  return state.users.find((user) => user.email === email);
}

function getUserById(id) {
  return state.users.find((user) => user.id === id);
}

function upsertUser({ fullName, email, phone, passwordHash }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = getUserByEmail(normalizedEmail);
  const now = new Date().toISOString();

  if (existing) {
    existing.full_name = fullName;
    existing.phone = phone;
    existing.password_hash = passwordHash;
    existing.updated_at = now;
    persist();
    return existing;
  }

  const user = {
    id: nextId('users'),
    full_name: fullName,
    email: normalizedEmail,
    phone,
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  };
  state.users.push(user);
  persist();
  return user;
}

function insertResume({ userId, filePath, originalName, mimeType, sizeBytes }) {
  const resume = {
    id: nextId('resumes'),
    user_id: userId,
    file_path: filePath,
    original_name: originalName,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    created_at: new Date().toISOString(),
  };
  state.resumes.push(resume);
  persist();
  return resume;
}

function insertOrder({ userId, resumeId, membershipPlan, status, desiredRole, jobAttributes, projectNotes }) {
  const timestamp = new Date().toISOString();
  const order = {
    id: nextId('orders'),
    user_id: userId,
    resume_id: resumeId,
    membership_plan: membershipPlan,
    status: status || 'intake',
    desired_role: desiredRole || '',
    job_attributes: jobAttributes || '',
    project_notes: projectNotes || '',
    created_at: timestamp,
    updated_at: timestamp,
  };
  state.orders.push(order);
  persist();
  return order;
}

function insertTransaction({ orderId, amountCents, status, processor, reference }) {
  const timestamp = new Date().toISOString();
  const transaction = {
    id: nextId('transactions'),
    order_id: orderId,
    amount_cents: amountCents,
    status: status || 'pending',
    processor,
    reference,
    created_at: timestamp,
    updated_at: timestamp,
  };
  state.transactions.push(transaction);
  persist();
  return transaction;
}

function updateTransaction(id, updates) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return null;
  Object.assign(transaction, updates, { updated_at: new Date().toISOString() });
  persist();
  return transaction;
}

function updateOrderStatus(id, status) {
  const order = state.orders.find((item) => item.id === Number(id));
  if (!order) return null;
  order.status = status;
  order.updated_at = new Date().toISOString();
  persist();
  return order;
}

function getOrderById(id) {
  return state.orders.find((order) => order.id === Number(id));
}

function getResumeById(id) {
  return state.resumes.find((resume) => resume.id === Number(id));
}

function getLatestTransaction(orderId) {
  const transactions = state.transactions
    .filter((transaction) => transaction.order_id === Number(orderId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return transactions[0] || null;
}

function listOrders() {
  return state.orders
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((order) => ({
      order,
      user: getUserById(order.user_id),
      resume: getResumeById(order.resume_id),
      transaction: getLatestTransaction(order.id),
    }));
}

module.exports = {
  upsertUser,
  insertResume,
  insertOrder,
  insertTransaction,
  updateTransaction,
  updateOrderStatus,
  getOrderById,
  getResumeById,
  getLatestTransaction,
  listOrders,
};
