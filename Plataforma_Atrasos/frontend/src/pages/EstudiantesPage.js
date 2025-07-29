import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, InputLabel,
  FormControl, CircularProgress, Alert, Card, CardContent,
  CardHeader, Table, TableHead, TableRow, TableCell, TableBody,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { jwtDecode } from 'jwt-decode';
import {
  getEstudiantes,
  createEstudiante,
  updateEstudiante
} from '../services/estudiantesService';
import { getCursos } from '../services/cursosService';

const initialForm = {
  rut: '',
  nombre: '',
  cod_curso: '',
  telefono: '',
  apoderado: '',
  correo: ''
};

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [searchRut, setSearchRut] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCurso, setSearchCurso] = useState('');

  // Paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(2000);

  // 1) Función para cargar TODOS los datos desde el backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [estRes, cursosRes] = await Promise.all([
        getEstudiantes(),
        getCursos()
      ]);
      setEstudiantes(estRes);
      setFiltered(estRes);
      setCursos(cursosRes);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // On mount, y al cambiar rol
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role ?? decoded.cod_rol);
      } catch {
        setUserRole(null);
      }
    }
    loadData();
  }, []);

  // Para mostrar el nombre del curso
  const getCursoNombre = useCallback(cod => {
    const c = cursos.find(x => x.cod_curso === cod);
    return c ? c.nombre_curso : '';
  }, [cursos]);

  // Filtrado local
  useEffect(() => {
    const f = estudiantes.filter(e =>
      (e.rut_alumno || '').toLowerCase().includes(searchRut.toLowerCase()) &&
      (e.nombre_alumno || '').toLowerCase().includes(searchNombre.toLowerCase()) &&
      (searchCurso === '' || e.cod_curso === searchCurso)
    );
    setFiltered(f);
    setPage(1);
  }, [searchRut, searchNombre, searchCurso, estudiantes]);

  // Paginado
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Abrir modal (nuevo o editar)
  const handleShowModal = index => {
    setEditingIndex(index);
    if (index !== null) {
      const e = estudiantes[index];
      setForm({
        rut: e.rut_alumno,
        nombre: e.nombre_alumno,
        cod_curso: e.cod_curso,
        telefono: e.n_celular_apoderado,
        correo: e.correo_alumno || '',
        apoderado: e.apoderado
      });
    } else {
      setForm(initialForm);
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setForm(initialForm);
    setFormErrors({});
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.rut || form.rut.length < 8) errs.rut = 'RUT inválido';
    if (!form.nombre) errs.nombre = 'Nombre requerido';
    if (!form.cod_curso) errs.cod_curso = 'Seleccione un curso';
    if (!form.telefono || !/^\d{8,15}$/.test(form.telefono)) errs.telefono = 'Teléfono inválido';
    if (!form.apoderado) errs.apoderado = 'Apoderado requerido';
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  // 2) Al guardar (crear o editar), llamamos a loadData() para recargar todo
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingIndex !== null) {
        const originalRut = estudiantes[editingIndex].rut_alumno;
        await updateEstudiante(originalRut, form);
      } else {
        await createEstudiante(form);
      }
      await loadData();           // <-- recarga desde el servidor
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar datos.', err);
    } finally {
      setSaving(false);
    }
  };

  if (userRole !== 1) {
    return <Alert severity="error">Acceso denegado. Solo administradores.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardHeader
          title="Gestión de Estudiantes"
          titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
          sx={{ textAlign: 'center', pb: 0 }}
        />
        <CardContent>
          {/* filtros y botón +Nuevo */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Buscar por RUT"
              size="small"
              value={searchRut}
              onChange={e => setSearchRut(e.target.value)}
            />
            <TextField
              label="Buscar por Nombre"
              size="small"
              value={searchNombre}
              onChange={e => setSearchNombre(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Curso</InputLabel>
              <Select
                value={searchCurso}
                label="Curso"
                onChange={e => setSearchCurso(e.target.value)}
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                {cursos.map(c => (
                  <MenuItem key={c.cod_curso} value={c.cod_curso}>
                    {c.nombre_curso}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box flexGrow={1} />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleShowModal(null)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nuevo Estudiante
            </Button>
          </Box>

          {/* tabla */}
          {loading ? (
            <Box textAlign="center"><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Typography color="text.secondary">No hay estudiantes registrados.</Typography>
          ) : (
            <Paper elevation={2}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    {['RUT','Nombre','Curso','Teléfono','Correo','Apoderado','Acciones'].map(h => (
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((est, idx) => (
                    <TableRow key={est.rut_alumno} hover>
                      <TableCell>{est.rut_alumno}</TableCell>
                      <TableCell>{est.nombre_alumno}</TableCell>
                      <TableCell>{getCursoNombre(est.cod_curso)}</TableCell>
                      <TableCell>{est.n_celular_apoderado}</TableCell>
                      <TableCell>{est.correo_alumno}</TableCell>
                      <TableCell>{est.apoderado}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => handleShowModal(estudiantes.indexOf(est))}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* modal */}
      <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingIndex !== null ? '✏️ Editar Estudiante' : '➕ Agregar Estudiante'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2 }}>
            <TextField
              label="RUT"
              name="rut"
              value={form.rut}
              onChange={handleChange}
              error={!!formErrors.rut}
              helperText={formErrors.rut}
              disabled={editingIndex !== null}
              fullWidth
            />
            <TextField
              label="Nombre completo"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Curso</InputLabel>
              <Select
                name="cod_curso"
                value={form.cod_curso}
                label="Curso"
                onChange={handleChange}
                error={!!formErrors.cod_curso}
                sx={{ mb: 1 }}
              >
                {cursos.map(c => (
                  <MenuItem key={c.cod_curso} value={c.cod_curso}>
                    {c.nombre_curso}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="error">
                {formErrors.cod_curso}
              </Typography>
            </FormControl>
            <TextField
              label="Teléfono apoderado"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              error={!!formErrors.telefono}
              helperText={formErrors.telefono}
              fullWidth
            />
            <TextField
              label="Correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Nombre apoderado"
              name="apoderado"
              value={form.apoderado}
              onChange={handleChange}
              error={!!formErrors.apoderado}
              helperText={formErrors.apoderado}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ pr:3, pb:2 }}>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
