import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcrypt from 'bcryptjs';

describe('Auth integration', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test1@example.com',
      username: 'test1',
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test1@example.com');
  });

  it('prevents duplicate email registration', async () => {
    await UserModel.create({
      email: 'dup@example.com',
      username: 'dup1',
      password: await bcrypt.hash('password', 10),
    });
    const res = await request(app).post('/api/auth/register').send({
      email: 'dup@example.com',
      username: 'dup2',
      password: 'password2',
      confirmPassword: 'password2',
    });
    expect(res.status).toBe(409);
  });

  it('prevents duplicate username registration', async () => {
    await UserModel.create({
      email: 'uniq@example.com',
      username: 'uniqueuser',
      password: await bcrypt.hash('password', 10),
    });
    const res = await request(app).post('/api/auth/register').send({
      email: 'uniq2@example.com',
      username: 'uniqueuser',
      password: 'password2',
      confirmPassword: 'password2',
    });
    expect(res.status).toBe(400);
  });

  it('fails registration when passwords do not match', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'nomatch@example.com',
      username: 'nomatch',
      password: 'password1',
      confirmPassword: 'password2',
    });
    expect(res.status).toBe(400);
  });

  it('logs in successfully with correct credentials', async () => {
    const password = await bcrypt.hash('mypassword', 10);
    const user = await UserModel.create({ email: 'login@example.com', username: 'loginuser', password });
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'mypassword',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.data.email).toBe('login@example.com');
  });

  it('fails login with wrong password', async () => {
    const password = await bcrypt.hash('otherpass', 10);
    await UserModel.create({ email: 'wrongpass@example.com', username: 'wp', password });
    const res = await request(app).post('/api/auth/login').send({ email: 'wrongpass@example.com', password: 'badpass' });
    expect(res.status).toBe(401);
  });

  it('forgot password returns success for unknown email (no reveal)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'unknown@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('forgot password sets token for existing user', async () => {
    const password = await bcrypt.hash('resetme', 10);
    const user = await UserModel.create({ email: 'reset@example.com', username: 'resetme', password });
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'reset@example.com' });
    expect(res.status).toBe(200);
    const updated = await UserModel.findById(user._id);
    expect(updated?.resetPasswordToken).toBeTruthy();
  });

  it('reset password fails with invalid token', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ token: 'invalid', password: 'newpass' });
    expect(res.status).toBe(400);
  });

  it('reset password succeeds with valid token', async () => {
    const password = await bcrypt.hash('oldpass', 10);
    const user = await UserModel.create({ email: 'reset2@example.com', username: 'reset2', password });
    // set token and expiry
    user.resetPasswordToken = 'resettoken123';
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60);
    await user.save();

    const res = await request(app).post('/api/auth/reset-password').send({ token: 'resettoken123', password: 'brandnew' });
    expect(res.status).toBe(200);
    // can login with new password
    const login = await request(app).post('/api/auth/login').send({ email: 'reset2@example.com', password: 'brandnew' });
    expect(login.status).toBe(200);
  });
});
