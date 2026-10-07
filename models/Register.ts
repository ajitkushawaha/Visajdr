import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/db';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password ,role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'All fields are required' });

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(409).json({ error: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPassword, role});
  console.log(newUser)
  await newUser.save();

  res.status(201).json({ message: 'User registered successfully' });
}
