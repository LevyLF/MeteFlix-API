const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao Mongo'))
  .catch(err => console.error(err));

// Modelo de Usuário
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' } // 'user' ou 'admin'
});
const User = mongoose.model('User', UserSchema);

// Modelo de Item
const ItemSchema = new mongoose.Schema({
  titulo: String,
  tipo: { type: String, enum: ['filme', 'serie'] },
  ano: Number,
  genero: String,
  descricao: String,
  capa: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Item = mongoose.model('Item', ItemSchema);

// Função para criar super usuário
async function createSuperUser() {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      email: 'admin@MeteFlix.com',
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('Super usuario: admin@MeteFlix.com / admin123');
  }
}
createSuperUser();

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acesso negado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar admin
const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Acesso negado: apenas admins' });
  next();
};

// Rotas de Autenticação
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  res.json({ message: 'Usuário registrado' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey');
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

// Rotas de Itens
app.get('/api/itens', async (req, res) => {
  const { titulo, genero, ano } = req.query;
  let filtro = {};
  if (titulo) filtro.titulo = { $regex: titulo, $options: 'i' };
  if (genero) filtro.genero = { $regex: genero, $options: 'i' };
  if (ano) filtro.ano = ano;
  const itens = await Item.find(filtro).populate('userId', 'username');
  res.json(itens);
});

app.post('/api/itens', verifyToken, upload.single('capa'), async (req, res) => {
  const novoItem = {
    titulo: req.body.titulo,
    tipo: req.body.tipo,
    ano: parseInt(req.body.ano),
    genero: req.body.genero,
    descricao: req.body.descricao,
    capa: req.file ? `/uploads/${req.file.filename}` : null,
    userId: req.userId
  };
  const item = new Item(novoItem);
  await item.save();
  res.json(item);
});

app.put('/api/itens/:id', verifyToken, upload.single('capa'), async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (item.userId.toString() !== req.userId) return res.status(403).json({ message: 'Não autorizado' });
  const updateData = { ...req.body };
  if (req.file) updateData.capa = `/uploads/${req.file.filename}`;
  const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json(updatedItem);
});

app.delete('/api/itens/:id', verifyToken, verifyAdmin, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: 'Item deletado' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ON! porta:  ${PORT}`));