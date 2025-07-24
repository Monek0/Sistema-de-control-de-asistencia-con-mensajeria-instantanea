import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, InputLabel,
  FormControl, CircularProgress, Alert, Card, CardContent,
  CardHeader, Table, TableHead, TableRow, TableCell, TableBody,
  Paper
} from '@mui/material';
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

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [searchRut, setSearchRut] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCurso, setSearchCurso] = useState(''); // now used for dropdown value

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(2000);

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
  }, []);

  useEffect(() => {
    Promise.all([getEstudiantes(), getCursos()])
      .then(([estRes, cursosRes]) => {
        setEstudiantes(estRes);
        setFiltered(estRes);
        setCursos(cursosRes);
      })
      .finally(() => setLoading(false));
  }, []);

  const getCursoNombre = useCallback(cod => {
    const c = cursos.find(x => x.cod_curso === cod);
    return c ? c.nombre_curso : '';
  }, [cursos]);

  useEffect(() => {
    const f = estudiantes.filter(e =>
      e.rut_alumno.toLowerCase().includes(searchRut.toLowerCase()) &&
      e.nombre_alumno.toLowerCase().includes(searchNombre.toLowerCase()) &&
      (searchCurso === '' || e.cod_curso === searchCurso)
    );
    setFiltered(f);
    setPage(1);
  }, [searchRut, searchNombre, searchCurso, estudiantes]);

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleShowModal = student => {
    setEditingStudent(student);
    setForm(student ? {
      rut: student.rut_alumno,
      nombre: student.nombre_alumno,
      cod_curso: student.cod_curso,
      telefono: student.n_celular_apoderado,
      correo: student.correo_alumno || '',
      apoderado: student.apoderado
    } : initialForm);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
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
    if (!form.cod_curso) errs.cod_curso = 'Curso requerido';
    if (!form.telefono || !/^\d{8,15}$/.test(form.telefono)) errs.telefono = 'Teléfono inválido';
    if (!form.apoderado) errs.apoderado = 'Apoderado requerido';
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingStudent) {
        await updateEstudiante(editingStudent.rut_alumno, {
          nuevo_rut: form.rut,
          nombre_alumno: form.nombre,
          cod_curso: form.cod_curso,
          n_celular_apoderado: form.telefono,
          correo_alumno: form.correo,
          apoderado: form.apoderado
        });
        setEstudiantes(estudiantes.map(est =>
          est.rut_alumno === editingStudent.rut_alumno
            ? { ...est, ...form }
            : est
        ));
      } else {
        const nuevo = await createEstudiante(form);
        setEstudiantes([ ...estudiantes, nuevo ]);
      }
      handleCloseModal();
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
          sx={{ textAlign: 'center' }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <TextField
              label="RUT"
              size="small"
              value={searchRut}
              onChange={e => setSearchRut(e.target.value)}
            />
            <TextField
              label="Nombre"
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
            <Button variant="contained" onClick={() => handleShowModal(null)}>
              + Nuevo Estudiante
            </Button>
          </Box>

          {loading ? (
            <Box textAlign="center"><CircularProgress /></Box>
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
                  {paginated.map(est => (
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
                          onClick={() => handleShowModal(est)}
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

      <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingStudent ? '✏️ Editar Estudiante' : '➕ Agregar Estudiante'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Ahora RUT es editable en edición */}
            <TextField
              label="RUT"
              name="rut"
              value={form.rut}
              onChange={handleChange}
              error={!!formErrors.rut}
              helperText={formErrors.rut}
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
                label="Curso"
                onChange={handleChange}
                error={!!formErrors.cod_curso}
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
            />
            <TextField
              label="Correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
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
          <DialogActions>
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
