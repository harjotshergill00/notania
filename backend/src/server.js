const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const {
  upsertUser,
  insertResume,
  insertOrder,
  updateOrder,
  insertTransaction,
  updateTransaction,
  updateOrderStatus,
  getOrderById,
  getResumeById,
  getLatestTransaction,
  getUserById,
  listOrders,
  listOrdersForUser,
  getUserByEmail,
} = require('./db');
const emailService = require('./email');
const {
  authenticateAdmin,
  createAdminToken,
  createMemberToken,
  requireAdmin,
  requireMember,
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 4000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

let stripeClient = null;
if (process.env.STRIPE_SECRET_KEY) {
  const Stripe = require('stripe');
  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MEMBERSHIP_PLANS = {
  starter: { amountCents: 19900 },
  accelerator: { amountCents: 32900 },
  executive: { amountCents: 52900 },
};

function getPlan(planKey) {
  return MEMBERSHIP_PLANS[planKey] || MEMBERSHIP_PLANS.starter;
}

function buildOnboardingResponse({ user, resume, order, transaction = null }) {
  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
    },
    resume: {
      id: resume.id,
      originalName: resume.original_name,
    },
    order: {
      id: order.id,
      membershipPlan: order.membership_plan,
      status: order.status,
    },
    transaction: transaction
      ? {
          id: transaction.id,
          amountCents: transaction.amount_cents,
          status: transaction.status,
        }
      : null,
  };
}

function formatMemberOrders(orderBundles) {
  return orderBundles.map(({ order, resume, transaction }) => ({
    id: order.id,
    membership_plan: order.membership_plan,
    membership_plan_label: order.membership_plan
      ? order.membership_plan.replace(/_/g, ' ')
      : 'Plan pending',
    status: order.status,
    created_at: order.created_at,
    desired_role: order.desired_role,
    job_attributes: order.job_attributes,
    project_notes: order.project_notes,
    resume: resume
      ? {
          id: resume.id,
          original_name: resume.original_name,
        }
      : null,
    transaction: transaction || null,
  }));
}

app.post('/api/onboarding', upload.single('resume'), (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      desiredRole,
      jobAttributes,
      projectNotes,
      sendSalesCopy,
      agreeTerms,
    } = req.body;

    if (!fullName || !email || !phone || !password || !desiredRole || !jobAttributes || !projectNotes) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (!agreeTerms) {
      return res.status(400).json({ message: 'You must agree to the membership terms.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume upload is required.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = upsertUser({ fullName, email, phone, passwordHash });
    const resume = insertResume({
      userId: user.id,
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
    const order = insertOrder({
      userId: user.id,
      resumeId: resume.id,
      membershipPlan: null,
      status: 'awaiting_plan',
      desiredRole,
      jobAttributes,
      projectNotes,
    });

    const response = buildOnboardingResponse({ user, resume, order });
    const authToken = createMemberToken(user.id);
    const orders = formatMemberOrders(listOrdersForUser(user.id));

    emailService.sendWelcome({
      fullName,
      email,
      orderId: response.order.id,
      portalUrl: `${SITE_URL}/member.html`,
    });

    if (sendSalesCopy) {
      emailService.notifySales({
        fullName,
        email,
        phone,
        membershipPlan: null,
        desiredRole,
        jobAttributes,
        projectNotes,
        orderId: response.order.id,
      });
    }

    return res.status(201).json({
      ...response,
      authToken,
      orders,
    });
  } catch (error) {
    console.error('Onboarding error', error);
    return res.status(500).json({ message: 'Unable to process onboarding request.' });
  }
});

app.post('/api/orders/:orderId/pay', (req, res) => {
  try {
    const { orderId } = req.params;
    const { method = 'card', reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: 'Payment reference is required.' });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (!order.membership_plan) {
      return res.status(400).json({ message: 'A membership plan must be selected before recording payment.' });
    }

    const latestTransaction = getLatestTransaction(orderId);
    if (!latestTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (latestTransaction.status === 'paid') {
      return res.json({ order, transaction: latestTransaction });
    }

    const transaction = updateTransaction(latestTransaction.id, {
      status: 'paid',
      processor: method,
      reference,
    });

    const updatedOrder = updateOrderStatus(orderId, 'payment_received');

    const user = getUserById(updatedOrder.user_id);
    if (user) {
      emailService.sendMemberReceipt({
        fullName: user.full_name,
        email: user.email,
        membershipPlan: updatedOrder.membership_plan || 'NotAnAI membership',
        orderId: updatedOrder.id,
      });
    }

    return res.json({ order: updatedOrder, transaction });
  } catch (error) {
    console.error('Payment error', error);
    return res.status(500).json({ message: 'Unable to process payment.' });
  }
});

app.post('/api/members/orders/:orderId/checkout', requireMember, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!stripeClient) {
      return res.status(501).json({
        message: 'Stripe is not configured. Add STRIPE_SECRET_KEY and SITE_URL environment variables to enable hosted checkout.',
        documentation:
          'https://stripe.com/docs/payments/checkout/accept-a-payment?platform=web&ui=checkout#server-create-session',
      });
    }

    const bundles = listOrdersForUser(req.member.userId);
    const bundle = bundles.find(({ order }) => order.id === Number(orderId));
    if (!bundle) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (!bundle.order.membership_plan) {
      return res.status(400).json({ message: 'Select a membership plan before starting checkout.' });
    }

    const plan = getPlan(bundle.order.membership_plan);
    const session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      customer_email: bundle.user?.email,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `NotAnAI Membership — ${bundle.order.membership_plan.replace(/_/g, ' ')}`,
            },
            unit_amount: plan.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: String(bundle.order.id),
        user_id: String(req.member.userId),
      },
      success_url: `${SITE_URL}/member.html?order=${bundle.order.id}&checkout=success`,
      cancel_url: `${SITE_URL}/member.html?order=${bundle.order.id}&checkout=cancelled`,
    });

    return res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Stripe checkout error', error);
    return res.status(500).json({ message: 'Unable to start checkout session.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const isValid = authenticateAdmin(email, password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = createAdminToken(email);
  return res.json({ token });
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = createMemberToken(user.id);
    const orders = formatMemberOrders(listOrdersForUser(user.id));

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
      },
      orders,
    });
  } catch (error) {
    console.error('Member login error', error);
    return res.status(500).json({ message: 'Unable to complete login request.' });
  }
});

app.post('/api/members/orders/:orderId/plan', requireMember, (req, res) => {
  try {
    const { orderId } = req.params;
    const { membershipPlan } = req.body || {};

    if (!membershipPlan || !MEMBERSHIP_PLANS[membershipPlan]) {
      return res.status(400).json({ message: 'Select a valid membership plan before continuing.' });
    }

    const bundles = listOrdersForUser(req.member.userId);
    const bundle = bundles.find(({ order }) => order.id === Number(orderId));
    if (!bundle) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const plan = getPlan(membershipPlan);
    const updatedOrder = updateOrder(orderId, {
      membership_plan: membershipPlan,
      status: 'awaiting_payment',
    });

    let transaction = getLatestTransaction(orderId);
    if (transaction && transaction.status !== 'paid') {
      transaction = updateTransaction(transaction.id, {
        amount_cents: plan.amountCents,
        status: 'pending',
        processor: 'stripe',
        reference: transaction.reference || `STRIPE-${orderId}-${Date.now()}`,
      });
    }

    if (!transaction) {
      transaction = insertTransaction({
        orderId: updatedOrder.id,
        amountCents: plan.amountCents,
        status: 'pending',
        processor: 'stripe',
        reference: `STRIPE-${orderId}-${Date.now()}`,
      });
    }

    const orders = formatMemberOrders(listOrdersForUser(req.member.userId));
    const current = orders.find((item) => item.id === Number(orderId));

    return res.json({ order: current, orders });
  } catch (error) {
    console.error('Member plan selection error', error);
    return res.status(500).json({ message: 'Unable to save membership plan.' });
  }
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  try {
    const payload = listOrders().map(({ order, user, resume, transaction }) => ({
      id: order.id,
      membership_plan: order.membership_plan,
      status: order.status,
      created_at: order.created_at,
      intake: {
        desired_role: order.desired_role,
        job_attributes: order.job_attributes,
        project_notes: order.project_notes,
      },
      user: {
        id: user?.id,
        full_name: user?.full_name,
        email: user?.email,
        phone: user?.phone,
      },
      resume: resume
        ? {
            id: resume.id,
            original_name: resume.original_name,
            file_path: resume.file_path,
          }
        : null,
      transaction: transaction || null,
    }));

    return res.json({ orders: payload });
  } catch (error) {
    console.error('Fetch orders error', error);
    return res.status(500).json({ message: 'Unable to load orders.' });
  }
});

app.get('/api/members/orders', requireMember, (req, res) => {
  try {
    const orders = formatMemberOrders(listOrdersForUser(req.member.userId));

    return res.json({ orders });
  } catch (error) {
    console.error('Member orders error', error);
    return res.status(500).json({ message: 'Unable to load orders.' });
  }
});

app.get('/api/members/orders/:orderId/resume', requireMember, (req, res) => {
  try {
    const { orderId } = req.params;
    const orders = listOrdersForUser(req.member.userId);
    const match = orders.find(({ order }) => order.id === Number(orderId));
    if (!match || !match.resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    return res.sendFile(path.resolve(match.resume.file_path));
  } catch (error) {
    console.error('Member resume error', error);
    return res.status(500).json({ message: 'Unable to retrieve resume.' });
  }
});

const ALLOWED_STATUSES = new Set([
  'awaiting_plan',
  'awaiting_payment',
  'intake',
  'payment_received',
  'in_progress',
  'ready_for_review',
  'completed',
]);

app.post('/api/admin/orders/:orderId/status', requireAdmin, (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const updatedOrder = updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json({ order: updatedOrder });
  } catch (error) {
    console.error('Update status error', error);
    return res.status(500).json({ message: 'Unable to update status.' });
  }
});

app.get('/api/admin/resumes/:resumeId', requireAdmin, (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = getResumeById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    return res.sendFile(path.resolve(resume.file_path));
  } catch (error) {
    console.error('Resume download error', error);
    return res.status(500).json({ message: 'Unable to retrieve resume.' });
  }
});

app.use(express.static(path.join(__dirname, '..', '..')));

app.use((req, res) => {
  if (req.method === 'GET') {
    return res.sendFile(path.join(__dirname, '..', '..', 'index.html'));
  }
  return res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`NotAnAI backend running on http://localhost:${PORT}`);
});
