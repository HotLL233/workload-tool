import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress, Snackbar, Alert,
  Checkbox, FormControlLabel,
} from '@mui/material';
import { userLogin } from '../api/client';
import { useUser } from '../UserContext';

const R = '14px';

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
    <Box sx={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      m: -3, p: 0,  // 抵消 Layout 的 padding
    }}>
      <Paper elevation={4} sx={{
        p: 5, maxWidth: 400, width: '100%', borderRadius: R,
        background: '#ffffff',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" fontWeight={800} sx={{
            background: 'linear-gradient(135deg, #2e7d32, #43a047)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
            letterSpacing: 2,
          }}>
            知微
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            工作量统计工具
          </Typography>
        </Box>

        <TextField
          label="用户名"
          fullWidth
          size="medium"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: R } }}
        />
        <TextField
          label="密码"
          type="password"
          fullWidth
          size="medium"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: R } }}
        />

        <FormControlLabel
          control={<Checkbox size="small" checked={remember} onChange={e => setRemember(e.target.checked)} sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }} />}
          label={<Typography variant="body2" color="text.secondary">记住密码</Typography>}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
          sx={{
            borderRadius: R, py: 1.2, mb: 1, textTransform: 'none', fontWeight: 600, fontSize: '1rem',
            bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' },
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : '登录'}
        </Button>

        {/* 不显示注册链接 — v0.4.28: 移除用户注册功能 */}
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} sx={{ borderRadius: R }} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
