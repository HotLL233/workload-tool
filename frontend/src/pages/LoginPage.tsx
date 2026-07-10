import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress, Snackbar, Alert,
  Checkbox, FormControlLabel,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { userLogin } from '../api/client';
import { useUser } from '../UserContext';

const R = '2px';

const LoginPage: React.FC = () => {
  const n = useNavigate();
  const { login } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'error' as 'success' | 'error' });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setSnack({ open: true, msg: '请输入用户名和密码', sev: 'error' });
      return;
    }
    setLoading(true);
    try {
      const r = await userLogin({ username: username.trim(), password });
      if (r.code === 0 && r.data) {
        login(r.data.user, r.data.token, remember);
        setSnack({ open: true, msg: '登录成功', sev: 'success' });
        setTimeout(() => n('/'), 500);
      } else {
        setSnack({ open: true, msg: r.message || '登录失败', sev: 'error' });
      }
    } catch (e: any) {
      setSnack({ open: true, msg: e.message || '登录失败', sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Paper elevation={0} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: R, border: '1px solid rgba(0,0,0,0.08)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#e3f2fd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <LockOutlinedIcon sx={{ color: '#1976d2' }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>用户登录</Typography>
          <Typography variant="body2" color="text.secondary">登录以使用完整功能</Typography>
        </Box>

        <TextField
          label="用户名"
          fullWidth
          size="small"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: R } }}
        />
        <TextField
          label="密码"
          type="password"
          fullWidth
          size="small"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: R } }}
        />

        <FormControlLabel
          control={<Checkbox size="small" checked={remember} onChange={e => setRemember(e.target.checked)} />}
          label={<Typography variant="body2">记住密码</Typography>}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
          sx={{ borderRadius: R, py: 1, mb: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '登录'}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          还没有账号？{' '}
          <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>立即注册</Link>
        </Typography>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} sx={{ borderRadius: R }} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
