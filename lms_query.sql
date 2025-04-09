CREATE TABLE u_admin(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    level TEXT DEFAULT 'admin',
    activation TEXT,
    isactive BOOLEAN DEFAULT false,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE u_admin ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE u_admin ADD CONSTRAINT unique_phone UNIQUE (phone);

CREATE TABLE u_students(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase (id) ON DELETE CASCADE,
    periode INTEGER REFERENCES a_periode(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nis TEXT,
    password TEXT,
    level TEXT DEFAULT 'student',
    gender VARCHAR(255),
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE u_teachers(
    id SERIAL PRIMARY KEY,
    nip TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    img TEXT,
    homebase INTEGER NOT NULL REFERENCES a_homebase (id) ON DELETE CASCADE,
    homeroom BOOLEAN DEFAULT false,
    class INTEGER REFERENCES a_class(id),
    phone TEXT,
    password TEXT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    level TEXT DEFAULT 'teacher',
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE u_parents(
    id SERIAL PRIMARY KEY,
    student INTEGER REFERENCES u_students(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE a_homebase(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE a_periode(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    isactive BOOLEAN DEFAULT FALSE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE a_major(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE a_grade(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE a_class(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase(id) ON DELETE CASCADE,
    grade INT REFERENCES a_grade(id) ON DELETE CASCADE,
    major INT REFERENCES a_major(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE a_subject(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cover TEXT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE at_subject (
    id SERIAL PRIMARY KEY,
    teacher INTEGER NOT NULL REFERENCES u_teachers(id) ON DELETE CASCADE,
    subject INTEGER NOT NULL REFERENCES a_subject(id) ON DELETE CASCADE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE at_class(
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES u_teachers(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES a_class(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES a_subject(id) ON DELETE CASCADE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE cl_students(
    id SERIAL PRIMARY KEY,
    periode INT REFERENCES a_periode(id) ON DELETE CASCADE,
    classid INT REFERENCES a_class(id) ON DELETE CASCADE,
    student INT REFERENCES u_students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE c_bank(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase (id) ON DELETE CASCADE,
    teacher INT REFERENCES u_teachers (id) ON DELETE CASCADE,
    subject INT REFERENCES a_subject (id) ON DELETE CASCADE,
    btype TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE c_question(
    id SERIAL PRIMARY KEY,
    bank INT REFERENCES c_bank (id) ON DELETE CASCADE,
    qtype INT NOT NULL,
    question TEXT NOT NULL,
    a text,
    b text,
    c text,
    d text,
    e text,
    qkey text,
    poin INT DEFAULT 0,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE c_exam(
    id SERIAL PRIMARY KEY,
    homebase INT REFERENCES a_homebase (id) ON DELETE CASCADE,
    teacher INT REFERENCES u_teachers (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    isactive BOOLEAN DEFAULT true,
    token TEXT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE c_ebank(
    id SERIAL PRIMARY KEY,
    exam INT REFERENCES c_exam (id) ON DELETE CASCADE,
    bank INT REFERENCES c_bank (id) ON DELETE CASCADE,
    pg INT,
    essay INT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE c_class(
    id SERIAL PRIMARY KEY,
    exam INT REFERENCES c_exam (id) ON DELETE CASCADE,
    classid INT REFERENCES a_class (id) ON DELETE CASCADE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


CREATE TABLE l_chapter(
    id SERIAL PRIMARY KEY,
    subject INT REFERENCES a_subject (id) ON DELETE CASCADE,
    teacher INT REFERENCES u_teachers (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target TEXT NOT NULL,
    order_number INT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE l_cclass(
    id SERIAL PRIMARY KEY,
    chapter INT REFERENCES l_chapter (id) ON DELETE CASCADE,
    classid INT REFERENCES a_class (id) ON DELETE CASCADE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE l_content(
    id SERIAL PRIMARY KEY,
    chapter INT REFERENCES l_chapter (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target TEXT NOT NULL,
    order_number INT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE l_file(
    id SERIAL PRIMARY KEY,
    content INT REFERENCES l_content (id) ON DELETE CASCADE,
    title TEXT,
    file TEXT NOT NULL,
    video TEXT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE t_surah(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ayat INT NOT NULL,
    lines INT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


CREATE TABLE t_juz(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)



-- Penjelasan:
-- 1. at_subject: Menghubungkan guru dengan mata pelajaran yang diajarkan
-- 2. at_class: Menghubungkan guru dan mata pelajaran dengan kelas yang diajar
-- 3. a_subject: Menampung nama mata pelajaran
-- 4. a_class: Menampung nama kelas
-- 5. a_grade: Menampung tingkat kelas
-- 6. a_major: Menampung jurusan kelas
-- 7. a_homebase: Manampung data sekolah
-- 8. u_admin: Manampung data admin
-- 9. u_students: Manampung data siswa
-- 10. u_teachers: Manampung data guru
-- 11. u_parents: Manampung data orang tua
-- 12. cl_students: Menampung siswa di dalam kelas
-- 13. c_bank: Menampung bank soal
-- 14. c_question: Menampung soal
-- 15. c_exam: Menampung data ujian
-- 16. c_class: Menampung data kelas ujian
-- 17. c_ebank: Menampung data bank soal ujian
-- 18. l_chapter: Menampung data bab
-- 19. l_cclass: Menampung data bab di dalam kelas
-- 20. l_content: Menampung data materi
-- 21. l_file: Menampung file materi


