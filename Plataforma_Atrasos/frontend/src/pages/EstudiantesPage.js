import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, InputLabel,
  FormControl, CircularProgress, Alert, Card, CardContent,
  CardHeader
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
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [searchRut, setSearchRut] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCurso, setSearchCurso] = useState('');

  // NUEVO: Estados para paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || decoded.cod_rol);
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
      .catch(() => console.error('Error al obtener datos.'))
      .finally(() => setLoading(false));
  }, []);

  const getCursoNombre = useCallback((cod) => {
    const curso = cursos.find(c => c.cod_curso === cod);
    return curso ? curso.nombre_curso : 'No asignado';
  }, [cursos]);

  useEffect(() => {
    const filtro = estudiantes
      .filter(e => e && typeof e === 'object')
      .filter(e =>
        (e.rut_alumno || '').toLowerCase().includes(searchRut.toLowerCase()) &&
        (e.nombre_alumno || '').toLowerCase().includes(searchNombre.toLowerCase()) &&
        (getCursoNombre(e.cod_curso) || '').toLowerCase().includes(searchCurso.toLowerCase())
      );
    setFiltered(filtro);
    setPage(1); // NUEVO: volver a página 1 al cambiar filtros
  }, [searchRut, searchNombre, searchCurso, estudiantes, getCursoNombre]);

  // NUEVO: Datos paginados
  const paginatedEstudiantes = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

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
      } else {
        const res = await createEstudiante(form);
        setEstudiantes([...estudiantes, res]);
      }
      handleCloseModal();
    } catch {
      console.error('Error al guardar datos.');
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
            <>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr">
                    {['RUT', 'Nombre', 'Curso', 'Teléfono', 'Correo', 'Apoderado', 'Acciones'].map(h => (
                      <Box component="th" key={h} sx={{ bgcolor: 'primary.main', color: 'white', py: 1, px: 2 }}>{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {paginatedEstudiantes.map((est, idx) => (
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

              {/* NUEVO: Controles de paginación */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>
                  Página {page} de {Math.ceil(filtered.length / rowsPerPage)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl size="small">
                    <InputLabel>Filas</InputLabel>
                    <Select
                      value={rowsPerPage}
                      label="Filas"
                      onChange={(e) => { setRowsPerPage(e.target.value); setPage(1); }}
                    >
                      {[10, 20, 50, 100].map(num => (
                        <MenuItem key={num} value={num}>{num}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button variant="outlined" size="small" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Anterior</Button>
                  <Button variant="outlined" size="small" onClick={() => setPage(p => Math.min(p + 1, Math.ceil(filtered.length / rowsPerPage)))} disabled={page >= Math.ceil(filtered.length / rowsPerPage)}>Siguiente</Button>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal estudiante */}
      <Dialog open={showModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingIndex !== null ? '✏️ Editar Estudiante' : '➕ Agregar Estudiante'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="RUT" name="rut" value={form.rut} onChange={handleChange} error={!!formErrors.rut} helperText={formErrors.rut} disabled={editingIndex !== null} />
            <TextField label="Nombre completo" name="nombre" value={form.nombre} onChange={handleChange} error={!!formErrors.nombre} helperText={formErrors.nombre} />
            <FormControl>
              <InputLabel>Curso</InputLabel>
              <Select name="cod_curso" value={form.cod_curso} onChange={handleChange} error={!!formErrors.cod_curso}>
                <MenuItem value=""><em>Seleccione un curso</em></MenuItem>
                {cursos.map(c => (
                  <MenuItem key={c.cod_curso} value={c.cod_curso}>{c.nombre_curso}</MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="error">{formErrors.cod_curso}</Typography>
            </FormControl>
            <TextField label="Teléfono apoderado" name="telefono" value={form.telefono} onChange={handleChange} error={!!formErrors.telefono} helperText={formErrors.telefono} />
            <TextField label="Correo" name="correo" value={form.correo} onChange={handleChange} type="email" />
            <TextField label="Nombre apoderado" name="apoderado" value={form.apoderado} onChange={handleChange} error={!!formErrors.apoderado} helperText={formErrors.apoderado} />
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
