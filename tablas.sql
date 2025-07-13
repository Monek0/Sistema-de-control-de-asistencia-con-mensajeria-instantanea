-- Creación de la tabla ROL en el schema public
CREATE TABLE public.rol (
    cod_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(255)
);

-- Creación de la tabla USUARIOS
CREATE TABLE public.usuarios (
    cod_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(255),
    cod_rol INT,
    contrasena VARCHAR(255),
    rut_username VARCHAR(255),
    FOREIGN KEY (cod_rol) REFERENCES public.rol(cod_rol)
);

-- Creación de la tabla CURSOS
CREATE TABLE public.cursos (
    cod_curso SERIAL PRIMARY KEY,
    nombre_curso VARCHAR(255)
);

-- Creación de la tabla ALUMNOS
CREATE TABLE public.alumnos (
    rut_alumno VARCHAR(255) PRIMARY KEY,
    cod_curso INT,
    nombre_alumno VARCHAR(255),
    segundo_nombre_alumno VARCHAR(255),
    apellido_paterno_alumno VARCHAR(255),
    apellido_materno_alumno VARCHAR(255),
    n_celular_apoderado VARCHAR(255),
    correo_alumno VARCHAR(255),
    apoderado VARCHAR(255),
    huella_alumno BYTEA,
    justificativo_residencia BOOLEAN DEFAULT false,
    justificativo_deportivo BOOLEAN DEFAULT false,
    justificativo_medico BOOLEAN DEFAULT false,
    FOREIGN KEY (cod_curso) REFERENCES public.cursos(cod_curso)
);

-- Creación de la tabla ATRASOS
CREATE TABLE public.atrasos (
    cod_atrasos SERIAL PRIMARY KEY,
    rut_alumno VARCHAR(255),
    fecha_atrasos DATE,
    justificativo BOOLEAN,
    pdf_path VARCHAR(255),
    tipo_justificativo VARCHAR(255),
    FOREIGN KEY (rut_alumno) REFERENCES public.alumnos(rut_alumno)
);