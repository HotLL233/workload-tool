import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, CircularProgress, Snackbar, Alert,
  Checkbox, FormControlLabel,
} from '@mui/material';
import { userLogin } from '../api/client';
import { useUser } from '../UserContext';

const R = '12px';

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
      background: 'linear-gradient(135deg, #0f0c29, #1a1a3e, #24243e)',
      m: -3, p: 0,
    }}>
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center',
        gap: { xs: 3, md: 8 },
      }}>
        {/* 左侧品牌区 */}
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flexShrink: 0 }}>
          <Typography variant="h2" fontWeight={800} sx={{
            color: '#ffffff', fontSize: '36px', letterSpacing: 2, mb: 1,
          }}>
            知微
          </Typography>
          <Box sx={{
            width: 40, height: 2, bgcolor: '#f4511e', mb: 1.5,
            mx: { xs: 'auto', md: 0 },
          }} />
          <Typography variant="body1" sx={{
            color: 'rgba(255,255,255,0.55)', fontWeight: 400, mb: 1,
          }}>
            样品管理系统
          </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(255,255,255,0.35)', fontWeight: 300, letterSpacing: 1,
          }}>
            精准 / 高效 / 可追溯
          </Typography>
        </Box>

        {/* 右侧磨砂玻璃卡片 */}
        <Box sx={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.10)',
          maxWidth: 320, width: '100%', p: 4,
        }}>
          <TextField
            label="用户名"
            fullWidth
            size="medium"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: R,
                background: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                '&.Mui-focused fieldset': { borderColor: '#f4511e' },
                '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(244,81,30,0.2)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#f4511e' },
              '& .MuiOutlinedInput-input': { color: '#ffffff' },
            }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <TextField
            label="密码"
            type="password"
            fullWidth
            size="medium"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: R,
                background: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                '&.Mui-focused fieldset': { borderColor: '#f4511e' },
                '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(244,81,30,0.2)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#f4511e' },
              '& .MuiOutlinedInput-input': { color: '#ffffff' },
            }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
          />

          <FormControlLabel
            control={<Checkbox size="small" checked={remember} onChange={e => setRemember(e.target.checked)} sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f4511e' } }} />}
            label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>记住密码</Typography>}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            sx={{
              borderRadius: R, py: 1.2, mb: 1, textTransform: 'none', fontWeight: 600, fontSize: '1rem',
              bgcolor: '#f4511e', '&:hover': { bgcolor: '#e64a19', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(244,81,30,0.35)' },
              transition: 'all 0.2s',
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : '登录'}
          </Button>

          {/* 不显示注册链接 */}
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} sx={{ borderRadius: R }} onClose={() => setSnack(p => ({ ...p, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
