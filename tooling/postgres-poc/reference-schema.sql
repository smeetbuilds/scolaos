\set ON_ERROR_STOP on

-- M0-031 acceptance reference only.
-- Run only against a disposable PostgreSQL database.
DROP SCHEMA IF EXISTS scolaos_m0_031 CASCADE;
CREATE SCHEMA scolaos_m0_031;

CREATE TABLE scolaos_m0_031.institution (
  id uuid PRIMARY KEY,
  slug text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT institution_slug_unique UNIQUE (slug),
  CONSTRAINT institution_slug_nonempty CHECK (length(btrim(slug)) > 0),
  CONSTRAINT institution_name_nonempty CHECK (length(btrim(name)) > 0)
);

CREATE TABLE scolaos_m0_031.student (
  id uuid PRIMARY KEY,
  institution_id uuid NOT NULL,
  admission_no text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_institution_fk
    FOREIGN KEY (institution_id)
    REFERENCES scolaos_m0_031.institution (id)
    ON DELETE RESTRICT,
  CONSTRAINT student_admission_no_nonempty CHECK (length(btrim(admission_no)) > 0),
  CONSTRAINT student_full_name_nonempty CHECK (length(btrim(full_name)) > 0),
  CONSTRAINT student_institution_admission_unique UNIQUE (institution_id, admission_no),
  CONSTRAINT student_institution_id_unique UNIQUE (institution_id, id)
);

CREATE INDEX student_institution_name_idx
  ON scolaos_m0_031.student (institution_id, full_name);

CREATE TABLE scolaos_m0_031.enrollment (
  id uuid PRIMARY KEY,
  institution_id uuid NOT NULL,
  student_id uuid NOT NULL,
  academic_year integer NOT NULL,
  class_code text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT enrollment_institution_fk
    FOREIGN KEY (institution_id)
    REFERENCES scolaos_m0_031.institution (id)
    ON DELETE RESTRICT,
  CONSTRAINT enrollment_student_scope_fk
    FOREIGN KEY (institution_id, student_id)
    REFERENCES scolaos_m0_031.student (institution_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT enrollment_academic_year_range CHECK (academic_year BETWEEN 2000 AND 2200),
  CONSTRAINT enrollment_class_code_nonempty CHECK (length(btrim(class_code)) > 0),
  CONSTRAINT enrollment_status_allowed CHECK (status IN ('active', 'withdrawn', 'completed')),
  CONSTRAINT enrollment_student_year_unique UNIQUE (institution_id, student_id, academic_year)
);

CREATE INDEX enrollment_operational_lookup_idx
  ON scolaos_m0_031.enrollment (institution_id, academic_year, status);
