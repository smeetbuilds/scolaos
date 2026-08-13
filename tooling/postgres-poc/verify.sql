\set ON_ERROR_STOP on

INSERT INTO scolaos_m0_031.institution (id, slug, name)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'north-campus', 'North Campus'),
  ('00000000-0000-0000-0000-000000000002', 'south-campus', 'South Campus');

INSERT INTO scolaos_m0_031.student (id, institution_id, admission_no, full_name)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'A-001',
    'Ada Student'
  );

INSERT INTO scolaos_m0_031.enrollment (
  id,
  institution_id,
  student_id,
  academic_year,
  class_code,
  status
)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  2026,
  '8A',
  'active'
);

DO $$
BEGIN
  BEGIN
    INSERT INTO scolaos_m0_031.student (id, institution_id, admission_no, full_name)
    VALUES (
      '10000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000001',
      'A-001',
      'Duplicate Admission'
    );
    RAISE EXCEPTION 'expected duplicate admission number to fail';
  EXCEPTION
    WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO scolaos_m0_031.enrollment (
      id,
      institution_id,
      student_id,
      academic_year,
      class_code,
      status
    )
    VALUES (
      '20000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      2026,
      '8A',
      'active'
    );
    RAISE EXCEPTION 'expected cross-institution enrollment to fail';
  EXCEPTION
    WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO scolaos_m0_031.enrollment (
      id,
      institution_id,
      student_id,
      academic_year,
      class_code,
      status
    )
    VALUES (
      '20000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      2027,
      '9A',
      'invalid'
    );
    RAISE EXCEPTION 'expected invalid enrollment status to fail';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO scolaos_m0_031.enrollment (
      id,
      institution_id,
      student_id,
      academic_year,
      class_code,
      status
    )
    VALUES (
      '20000000-0000-0000-0000-000000000004',
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      2026,
      '8B',
      'active'
    );
    RAISE EXCEPTION 'expected duplicate yearly enrollment to fail';
  EXCEPTION
    WHEN unique_violation THEN NULL;
  END;
END $$;

BEGIN;
INSERT INTO scolaos_m0_031.student (id, institution_id, admission_no, full_name)
VALUES (
  '10000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000001',
  'ROLLBACK-001',
  'Rollback Student'
);
ROLLBACK;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM scolaos_m0_031.student
    WHERE id = '10000000-0000-0000-0000-000000000099'
  ) THEN
    RAISE EXCEPTION 'transaction rollback did not remove the test row';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'scolaos_m0_031'
      AND indexname = 'student_institution_name_idx'
  ) THEN
    RAISE EXCEPTION 'student_institution_name_idx is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'scolaos_m0_031'
      AND indexname = 'enrollment_operational_lookup_idx'
  ) THEN
    RAISE EXCEPTION 'enrollment_operational_lookup_idx is missing';
  END IF;
END $$;

SELECT 'M0-031 PostgreSQL reference semantics passed.' AS result;
