import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_node_secret_key_change_me_in_prod';

app.use(cors());
app.use(express.json());

// In-Memory Real-time State (Ready for PostgreSQL/MySQL connection via ORM/Pool)
interface Operator {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'supervisor' | 'agent';
  status: 'online' | 'busy' | 'offline';
  departments: number[];
}

interface Message {
  id: number;
  conversationId: number;
  senderType: 'visitor' | 'operator' | 'system';
  senderName: string;
  text: string;
  isInternalNote: boolean;
  createdAt: string;
}

// Initial Real Admin State (Clean)
const operatorsDb: Operator[] = [
  {
    id: 1,
    name: 'مدیر کل سیستم',
    email: 'admin@company.com',
    passwordHash: bcrypt.hashSync('admin123456', 10),
    role: 'admin',
    status: 'online',
    departments: [1]
  }
];

const messagesDb: Message[] = [];
let msgIdCounter = 1;

// WebSocket Client Hub
interface ClientConn {
  ws: WebSocket;
  type: 'operator' | 'visitor';
  id: string;
  conversationId?: number;
}
const clients = new Map<WebSocket, ClientConn>();

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (rawData: string) => {
    try {
      const data = JSON.parse(rawData.toString());
      if (data.action === 'register') {
        clients.set(ws, {
          ws,
          type: data.type,
          id: data.id,
          conversationId: data.conversationId
        });
      } else if (data.action === 'chat_message') {
        const newMsg: Message = {
          id: msgIdCounter++,
          conversationId: data.conversationId,
          senderType: data.senderType,
          senderName: data.senderName,
          text: data.text,
          isInternalNote: false,
          createdAt: new Date().toISOString()
        };
        messagesDb.push(newMsg);

        // Broadcast to relevant room/operators
        const payload = JSON.stringify({ event: 'new_message', message: newMsg });
        clients.forEach((c) => {
          if (c.type === 'operator' || c.conversationId === data.conversationId) {
            if (c.ws.readyState === WebSocket.OPEN) {
              c.ws.send(payload);
            }
          }
        });
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// REST: Login
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const op = operatorsDb.find((o) => o.email === email);
  if (!op || !bcrypt.compareSync(password, op.passwordHash)) {
    return res.status(401).json({ status: 'error', message: 'اطلاعات ورود اشتباه است.' });
  }

  const token = jwt.sign({ id: op.id, email: op.email, role: op.role, name: op.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    status: 'success',
    token,
    operator: { id: op.id, name: op.name, email: op.email, role: op.role, status: op.status }
  });
});

// REST: Update Profile (Email, Password, Name)
app.post('/api/update_profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ status: 'error', message: 'توکن نامعتبر است.' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const op = operatorsDb.find((o) => o.id === decoded.id);
    if (!op) return res.status(404).json({ status: 'error', message: 'کاربر یافت نشد.' });

    const { name, email, new_password, current_password } = req.body;
    if (new_password) {
      if (!current_password || !bcrypt.compareSync(current_password, op.passwordHash)) {
        return res.status(400).json({ status: 'error', message: 'رمز عبور فعلی صحیح نیست.' });
      }
      op.passwordHash = bcrypt.hashSync(new_password, 10);
    }
    if (name) op.name = name;
    if (email) op.email = email;

    res.json({ status: 'success', message: 'اطلاعات با موفقیت ذخیره شد.' });
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'نشست شما منقضی شده است.' });
  }
});

// REST: Create Operator
app.post('/api/create_operator', (req: Request, res: Response) => {
  const { name, email, password, role, departments } = req.body;
  if (!name || !email) return res.status(400).json({ status: 'error', message: 'فیلدهای نام و ایمیل الزامی هستند.' });

  if (operatorsDb.some((o) => o.email === email)) {
    return res.status(400).json({ status: 'error', message: 'این ایمیل قبلاً ثبت شده است.' });
  }

  const newOp: Operator = {
    id: operatorsDb.length + 1,
    name,
    email,
    passwordHash: bcrypt.hashSync(password || '12345678', 10),
    role: role || 'agent',
    status: 'offline',
    departments: departments || [1]
  };
  operatorsDb.push(newOp);

  res.json({ status: 'success', message: 'اپراتور جدید با موفقیت ایجاد شد.', operator_id: newOp.id });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    engine: 'OmniChat Enterprise Node.js / TypeScript Server',
    connected_sockets: clients.size,
    operators_count: operatorsDb.length
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Enterprise Node Backend running on port ${PORT}`);
});
