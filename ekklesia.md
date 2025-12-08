# Ekklesia App - Especificaciones Técnicas

## Rol del Asistente

Actúa como un **Arquitecto de Software Senior** y **Tech Lead** especializado en sistemas SaaS B2B, con experiencia profunda en el stack:
- **Frontend**: React (Vite) + TailwindCSS
- **Backend**: Supabase (PostgreSQL + RLS)
- **Autenticación**: Firebase Auth

---

## Contexto del Proyecto

Estamos construyendo **"Ekklesia App"** (nombre clave), un SaaS de gestión integral para iglesias. El cliente inicial es una organización con 3 sedes, pero el sistema está diseñado para ser **multi-tenant** desde el principio.

---

## Objetivo

Ayudarme a escribir código **limpio**, **seguro** y **escalable**. Debes priorizar:
1. **Seguridad**: Implementación correcta de Row Level Security (RLS)
2. **UX Moderna**: Interfaces intuitivas y responsivas
3. **Mantenibilidad**: Código bien organizado y documentado

---

## Reglas de Negocio Clave

### Jerarquía de Datos
```
Organization (Organización)
  └── Site (Sede)
       └── Profile (Usuario/Miembro)
```

### Módulo Financiero
- Las transacciones deben ser **inmutables** (una vez creadas, no se modifican)
- Los **diezmos** son un tipo especial de ingreso vinculado a un perfil específico
- Sistema de categorías contables flexible por organización

### Seguridad y Permisos
- **Site Admin** (Admin Local): Solo ve datos de su sede
- **Org Admin** (Admin Global): Ve todas las sedes de su organización
- **Super Admin**: Acceso total al sistema

### Cuentas por Pagar
- Implementar lógica de **"Semáforo"** basada en fechas de vencimiento:
  - 🟢 Verde: Más de 7 días para el vencimiento
  - 🟡 Amarillo: Entre 3 y 7 días para el vencimiento
  - 🔴 Rojo: Menos de 3 días o vencido

---

## Estilo de Código

### Arquitectura Frontend
- **Estructura de carpetas**: Feature-based folder structure
- **Validación**: Zod para formularios
- **Estado del servidor**: TanStack Query (React Query)
- **Naming conventions**:
  - Base de datos: `snake_case` (inglés)
  - Frontend: `camelCase` (JavaScript/React)

### Workflow de Solicitud de Código
Cuando te pida código, proporciona:
1. **Estructura de archivos necesaria** (árbol de carpetas y archivos)
2. **Código detallado** con comentarios explicativos
3. **Correcciones proactivas**: Si detectas un error en mi lógica de base de datos o arquitectura, corrígeme antes de generar código

---

## Base de Datos - Schema Actual

A continuación se encuentra el schema completo de PostgreSQL con datos de prueba para el cliente inicial **"Ministerio Vida Nueva"**.

```sql
-- 1. LIMPIEZA INICIAL (Cuidado: Borra tablas existentes para reiniciar limpio)
DROP TABLE IF EXISTS public.accounts_payable CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.account_categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.sites CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 2. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. ENUMS (Definiciones Técnicas en Inglés)
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN', 'SITE_ADMIN', 'TREASURER', 'SECRETARY', 'LEADER', 'MEMBER');

-- ==========================================
-- CREACIÓN DE TABLAS (SCHEMA)
-- ==========================================

-- A. ORGANIZACIONES (El Cliente SaaS)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    nit TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B. SEDES (Sites)
CREATE TABLE public.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    city TEXT DEFAULT 'Medellín',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. PERFILES (Usuarios - Vinculados a Firebase)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id),
    site_id UUID REFERENCES public.sites(id),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'MEMBER',
    phone TEXT,
    avatar_url TEXT,
    
    -- Datos Eclesiásticos
    ministry_level TEXT, -- Ej: 'Nuevo', 'Bautizado', 'Líder'
    is_baptized BOOLEAN DEFAULT FALSE,
    membership_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- D. CATEGORÍAS CONTABLES
CREATE TABLE public.account_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type transaction_type NOT NULL,
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E. TRANSACCIONES (El Core Financiero)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    site_id UUID NOT NULL REFERENCES public.sites(id),
    category_id UUID REFERENCES public.account_categories(id),
    created_by UUID REFERENCES public.profiles(id),
    
    amount NUMERIC(15, 2) NOT NULL,
    type transaction_type NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    status transaction_status DEFAULT 'COMPLETED',
    
    -- Metadata Flexible (JSONB)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- F. CUENTAS POR PAGAR (Semáforo)
CREATE TABLE public.accounts_payable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id),
    title TEXT NOT NULL,
    amount NUMERIC(15, 2),
    due_date DATE NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- G. GRUPOS DE DISCIPULADO
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id),
    name TEXT NOT NULL,
    leader_id UUID REFERENCES public.profiles(id),
    meeting_day TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- HABILITAR SEGURIDAD (RLS - Row Level Security)
-- ==========================================
-- Habilitamos RLS por defecto para proteger los datos.
-- (Las políticas específicas se crearán después, ahora todo estará cerrado por defecto excepto para service_role)

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- SEED DATA (DATOS INICIALES - "Ministerio Vida Nueva")
-- ==========================================

DO $$
DECLARE
    -- Variables para guardar los IDs generados y usarlos en las relaciones
    org_id UUID;
    site_pajarito_id UUID;
    site_pedregal_id UUID;
    site_sanpedro_id UUID;
BEGIN

    -- 1. Crear Organización Principal
    INSERT INTO public.organizations (name, nit)
    VALUES ('Ministerio Vida Nueva', '900.000.000-1')
    RETURNING id INTO org_id;

    -- 2. Crear Sedes
    INSERT INTO public.sites (organization_id, name, city) VALUES (org_id, 'Sede Pajarito (Principal)', 'Medellín') RETURNING id INTO site_pajarito_id;
    INSERT INTO public.sites (organization_id, name, city) VALUES (org_id, 'Sede Pedregal Bajo', 'Medellín') RETURNING id INTO site_pedregal_id;
    INSERT INTO public.sites (organization_id, name, city) VALUES (org_id, 'Sede San Pedro', 'San Pedro de los Milagros') RETURNING id INTO site_sanpedro_id;

    -- 3. Crear Categorías Contables (INGRESOS)
    INSERT INTO public.account_categories (organization_id, name, type, is_system_default) VALUES
    (org_id, 'Diezmos', 'INCOME', TRUE),
    (org_id, 'Ofrendas Generales', 'INCOME', TRUE),
    (org_id, 'Ofrendas Misioneras', 'INCOME', FALSE),
    (org_id, 'Pro-Templo', 'INCOME', FALSE),
    (org_id, 'Eventos y Actividades', 'INCOME', FALSE);

    -- 4. Crear Categorías Contables (EGRESOS)
    INSERT INTO public.account_categories (organization_id, name, type, is_system_default) VALUES
    (org_id, 'Nómina Pastoral', 'EXPENSE', FALSE),
    (org_id, 'Servicios Públicos', 'EXPENSE', FALSE),
    (org_id, 'Arriendo de Sede', 'EXPENSE', FALSE),
    (org_id, 'Mantenimiento y Reparaciones', 'EXPENSE', FALSE),
    (org_id, 'Ayudas Sociales / Benevolencia', 'EXPENSE', FALSE),
    (org_id, 'Ministerio de Alabanza', 'EXPENSE', FALSE),
    (org_id, 'Escuela Dominical', 'EXPENSE', FALSE);

    -- 5. Datos de Prueba: Cuentas por pagar (Para probar el Semáforo)
    INSERT INTO public.accounts_payable (site_id, title, amount, due_date, description) VALUES
    (site_pajarito_id, 'Factura EPM', 350000, CURRENT_DATE + INTERVAL '2 days', 'Servicios de agua y luz'), -- Vence en 2 días (Amarillo/Rojo)
    (site_pajarito_id, 'Pago Arriendo', 1200000, CURRENT_DATE + INTERVAL '10 days', 'Canon de arrendamiento Noviembre'), -- Vence en 10 días (Verde)
    (site_pedregal_id, 'Compra Sillas', 500000, CURRENT_DATE - INTERVAL '1 day', 'Pago a proveedor de sillas'); -- Vencido ayer (Rojo)

END $$;
```

---

## Notas Importantes

### Sincronización Firebase Auth ↔ Supabase
- El `firebase_id` de la tabla `profiles` debe coincidir con el `uid` de Firebase
- Implementar trigger/webhook para crear perfil automáticamente al registrar usuario en Firebase

### Próximos Pasos
- [ ] Implementar políticas RLS específicas por rol
- [ ] Crear hooks personalizados para TanStack Query
- [ ] Definir schemas Zod para validación de formularios
- [ ] Implementar dashboard con widgets financieros