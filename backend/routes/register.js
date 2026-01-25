import bcrypt from 'bcrypt';
import express from 'express';
import { User } from '../models/user.js';
const router = express.Router();
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate password strength
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!regex.test(password)) {
      return res.status(400).json({
        error:
          'Password must contain uppercase, lowercase, number and special character',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ error: `Internal server error ${error} ` });
  }
});

export default router;
