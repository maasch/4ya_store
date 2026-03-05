import bcrypt from 'bcrypt';
import express from 'express';
import { CartItem } from '../models/CartItem.js';
import { User } from '../models/user.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    const anonymousSessionId = req.sessionID;
    const user = await User.findOne({ where: { email } });
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        // Save user data in session
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        // Merge anonymous cart items into user's cart
        const anonymousItems = await CartItem.findAll({ where: { sessionId: anonymousSessionId } });
        for (const anonItem of anonymousItems) {
          const existing = await CartItem.findOne({
            where: { productId: anonItem.productId, userId: user.id }
          });
          if (existing) {
            existing.quantity += anonItem.quantity;
            await existing.save();
            await anonItem.destroy();
          } else {
            anonItem.userId = user.id;
            anonItem.sessionId = null;
            await anonItem.save();
          }
        }

        return res.json({
          message: `Welcome back, ${user.name}! `,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      }
      return res.status(401).json({
        error: 'Incorrect email or password. Please try again.',
      });
    } else {
      return res.status(404).json({
        error:
          'No account found with this email. Please create a new account or check your email.',
      });
    }
  } catch (err) {
    res.status(500).json({
      error: 'Something went wrong. Please try again later.',
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Check if user is authenticated
router.get('/check', (req, res) => {
  if (req.session.userId) {
    return res.json({
      isAuthenticated: true,
      user: {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail,
      },
    });
  }
  res.json({ isAuthenticated: false });
});

export default router;
