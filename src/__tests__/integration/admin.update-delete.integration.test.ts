import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

describe('Admin update and delete integration', () => {
  let adminToken: string;

  beforeEach(async () => {
    // create admin user directly
    const hashed = await bcrypt.hash('adminpass', 10);
    const admin: any = await UserModel.create({ email: 'adm2@example.com', username: 'adm2', password: hashed, role: 'admin' } as any);
    const payload = { id: admin._id.toString(), email: admin.email, username: admin.username };
    adminToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  });

  it('allows admin to update a user', async () => {
    const hashed = await bcrypt.hash('u1', 10);
    const user: any = await UserModel.create({ email: 'upd@example.com', username: 'toUpdate', password: hashed } as any);

    const res = await request(app)
      .put(`/api/admin/users/${user._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'updatedName', email: 'updated@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.username).toBe('updatedName');
  });

  it('allows admin to delete a user', async () => {
    const hashed = await bcrypt.hash('u2', 10);
    const user: any = await UserModel.create({ email: 'del@example.com', username: 'toDelete', password: hashed } as any);

    const res = await request(app)
      .delete(`/api/admin/users/${user._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const found = await UserModel.findById(user._id);
    expect(found).toBeNull();
  });
});
