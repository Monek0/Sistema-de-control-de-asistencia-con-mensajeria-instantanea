import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, InputLabel,
  FormControl, CircularProgress, Alert, Snackbar, Card, CardContent, 
  CardHeader
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import { jwtDecode } from 'jwt-decode';
import { getEstudiantes, createEstudiante, updateEstudiante } from '../services/estudiantesService';
import { getCursos } from '../services/cursosService';

const initialForm = {
  rut: '',
  nombre: '',
  cod_curso: '',
  telefono: '',
  apoderado: '',
  correo: ''
};

const AlertSnackbar = React.forwardRef(function AlertSnackbar(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, severity: 'success', message: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [searchRut, setSearchRut] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCurso, setSearchCurso] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role || decoded.cod_rol);
    } catch {
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    Promise.all([getEstudiantes(), getCursos()])
      .then(([estRes, cursosRes]) => {
        setEstudiantes(estRes);
        setFiltered(estRes);
        setCursos(cursosRes);
      })
      .catch(() => {
        showAlert('error', 'Error al obtener datos.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filtro = estudiantes
      .filter(e => e && typeof e === 'object')
      .filter(e =>
        (e.rut_alumno || '').toLowerCase().includes(searchRut.toLowerCase()) &&
        (e.nombre_alumno || '').toLowerCase().includes(searchNombre.toLowerCase()) &&
        (getCursoNombre(e.cod_curso) || '').toLowerCase().includes(searchCurso.toLowerCase())
      );
    setFiltered(filtro);
  }, [searchRut, searchNombre, searchCurso, estudiantes]);

  const showAlert = (severity, message) => {
    setAlert({ show: true, severity, message });
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getCursoNombre = (cod) => {
    const curso = cursos.find(c => c.cod_curso === cod);
    return curso ? curso.nombre_curso : 'No asignado';
  };

  const handleShowModal = (index = null) => {
    setEditingIndex(index);
    setForm(index !== null ? {
      rut: estudiantes[index].rut_alumno,
      nombre: estudiantes[index].nombre_alumno,
      cod_curso: estudiantes[index].cod_curso,
      telefono: estudiantes[index].n_celular_apoderado,
      correo: estudiantes[index].correo_alumno || '',
      apoderado: estudiantes[index].apoderado
    } : initialForm);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setForm(initialForm);
    setFormErrors({});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (editingIndex === null) {
      if (!form.rut || form.rut.length < 8) errors.rut = 'RUT inválido.';
      if (!form.nombre) errors.nombre = 'Nombre requerido.';
      if (!form.cod_curso) errors.cod_curso = 'Seleccione un curso.';
      if (!form.telefono || !/^\d{8,15}$/.test(form.telefono)) errors.telefono = 'Teléfono inválido.';
      if (!form.apoderado) errors.apoderado = 'Apoderado requerido.';
    } else {
      if (form.telefono && !/^\d{8,15}$/.test(form.telefono)) errors.telefono = 'Teléfono inválido.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingIndex !== null) {
        const rut = estudiantes[editingIndex].rut_alumno;
        await updateEstudiante(rut, form);

        const updated = [...estudiantes];
        updated[editingIndex] = {
          ...updated[editingIndex],
          nombre_alumno: form.nombre,
          cod_curso: form.cod_curso,
          n_celular_apoderado: form.telefono,
          correo_alumno: form.correo,
          apoderado: form.apoderado
        };
        setEstudiantes(updated);
        showAlert('success', 'Datos actualizados correctamente.');
      } else {
        const res = await createEstudiante(form);
        const updated = [...estudiantes, res];
        setEstudiantes(updated);
        showAlert('success', 'Estudiante agregado con éxito.');
      }
      handleCloseModal();
    } catch {
      showAlert('error', 'Error al guardar datos.');
    } finally {
      setSaving(false);
    }
  };

  if (userRole !== 1) {
    return <Alert severity="error">Acceso denegado. Solo administradores.</Alert>;
  }

  return (
    
    <Box sx={{ maxWidth: '1200px', mx: 'auto', mt: 4, p: 2 }}>
      <Card sx={{ p: 2, boxShadow: 4, borderRadius: 3 }}>
        <CardHeader
          title="Gestión de Estudiantes"
          titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
          sx={{ textAlign: 'center', pb: 0 }}
        />

        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Buscar por RUT"
              value={searchRut}
              onChange={(e) => setSearchRut(e.target.value)}
              size="small"
            />
            <TextField
              label="Buscar por Nombre"
              value={searchNombre}
              onChange={(e) => setSearchNombre(e.target.value)}
              size="small"
            />
            <TextField
              label="Buscar por Curso"
              value={searchCurso}
              onChange={(e) => setSearchCurso(e.target.value)}
              size="small"
            />
            <Box flexGrow={1} />
            <Button
              variant="contained"
              onClick={() => handleShowModal()}
              sx={{ alignSelf: 'center', whiteSpace: 'nowrap' }}
            >
              + Nuevo Estudiante
            </Button>
          </Box>

          {loading ? (
            <Box textAlign="center"><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Typography color="text.secondary">No hay estudiantes registrados.</Typography>
          ) : (
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr">
                  {['RUT', 'Nombre', 'Curso', 'Teléfono', 'Correo', 'Apoderado', 'Acciones'].map(h => (
                    <Box component="th" key={h} sx={{ bgcolor: 'primary.main', color: 'white', py: 1, px: 2 }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {filtered.map((est, idx) => (
                  <Box component="tr" key={est.id || idx}>
                    <Box component="td" sx={{ p: 1 }}>{est.rut_alumno}</Box>
                    <Box component="td" sx={{ p: 1 }}>{est.nombre_alumno}</Box>
                    <Box component="td" sx={{ p: 1 }}>{getCursoNombre(est.cod_curso)}</Box>
                    <Box component="td" sx={{ p: 1 }}>{est.n_celular_apoderado}</Box>
                    <Box component="td" sx={{ p: 1 }}>{est.correo_alumno}</Box>
                    <Box component="td" sx={{ p: 1 }}>{est.apoderado}</Box>
                    <Box component="td" sx={{ p: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => handleShowModal(idx)}>Editar</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>


      <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingIndex !== null ? '✏️ Editar Estudiante' : '➕ Agregar Estudiante'}
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="RUT"
              name="rut"
              value={form.rut}
              onChange={handleChange}
              error={!!formErrors.rut}
              helperText={formErrors.rut}
              disabled={editingIndex !== null}
            />
            <TextField
              label="Nombre completo"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
            />
            <FormControl>
              <InputLabel>Curso</InputLabel>
              <Select
                name="cod_curso"
                value={form.cod_curso}
                onChange={handleChange}
                error={!!formErrors.cod_curso}
              >
                <MenuItem value=""><em>Seleccione un curso</em></MenuItem>
                {cursos.map(c => (
                  <MenuItem key={c.cod_curso} value={c.cod_curso}>{c.nombre_curso}</MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="error">{formErrors.cod_curso}</Typography>
            </FormControl>
            <TextField
              label="Teléfono apoderado"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              error={!!formErrors.telefono}
              helperText={formErrors.telefono}
            />
            <TextField
              fullWidth
              label="Correo"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              margin="normal"
              type="email"
            />
            <TextField
              label="Nombre apoderado"
              name="apoderado"
              value={form.apoderado}
              onChange={handleChange}
              error={!!formErrors.apoderado}
              helperText={formErrors.apoderado}
            />
          </DialogContent>

          <DialogActions sx={{ pr: 3, pb: 2 }}>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
