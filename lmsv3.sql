PGDMP  &    ;        	        }            lms    16.1    17.1 �                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    53273    lms    DATABASE     z   CREATE DATABASE lms WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Indonesia.1252';
    DROP DATABASE lms;
                     postgres    false            �            1259    53418    a_class    TABLE     �   CREATE TABLE public.a_class (
    id integer NOT NULL,
    homebase integer,
    grade integer,
    major integer,
    name text NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.a_class;
       public         heap r       postgres    false            �            1259    53417    a_class_id_seq    SEQUENCE     �   CREATE SEQUENCE public.a_class_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.a_class_id_seq;
       public               postgres    false    218                       0    0    a_class_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.a_class_id_seq OWNED BY public.a_class.id;
          public               postgres    false    217            �            1259    53387    a_grade    TABLE     �   CREATE TABLE public.a_grade (
    id integer NOT NULL,
    homebase integer,
    name text NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.a_grade;
       public         heap r       postgres    false            �            1259    53386    a_grade_id_seq    SEQUENCE     �   CREATE SEQUENCE public.a_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.a_grade_id_seq;
       public               postgres    false    216                       0    0    a_grade_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.a_grade_id_seq OWNED BY public.a_grade.id;
          public               postgres    false    215            �            1259    53670 
   a_homebase    TABLE     �   CREATE TABLE public.a_homebase (
    id integer NOT NULL,
    name text NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.a_homebase;
       public         heap r       postgres    false            �            1259    53669    a_homebase_id_seq    SEQUENCE     �   CREATE SEQUENCE public.a_homebase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.a_homebase_id_seq;
       public               postgres    false    230                       0    0    a_homebase_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.a_homebase_id_seq OWNED BY public.a_homebase.id;
          public               postgres    false    229            �            1259    53558    a_major    TABLE     �   CREATE TABLE public.a_major (
    id integer NOT NULL,
    homebase integer,
    name text NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.a_major;
       public         heap r       postgres    false            �            1259    53557    a_major_id_seq    SEQUENCE     �   CREATE SEQUENCE public.a_major_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.a_major_id_seq;
       public               postgres    false    224                       0    0    a_major_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.a_major_id_seq OWNED BY public.a_major.id;
          public               postgres    false    223            �            1259    53915 	   a_periode    TABLE     �   CREATE TABLE public.a_periode (
    id integer NOT NULL,
    homebase integer,
    name text NOT NULL,
    isactive boolean DEFAULT false,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.a_periode;
       public         heap r       postgres    false            �            1259    53914    a_periode_id_seq    SEQUENCE     �   CREATE SEQUENCE public.a_periode_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.a_periode_id_seq;
       public               postgres    false    236                       0    0    a_periode_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.a_periode_id_seq OWNED BY public.a_periode.id;
          public               postgres    false    235            �            1259    53643 	   a_subject    TABLE     �   CREATE TABLE public.a_subject (
    id integer NOT NULL,
    homebase integer,
    name text NOT NULL,
    cover text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.a_subject;
       public         heap r       postgres    false            �            1259    53642    a_subject_id_seq    SEQUENCE     �   CREATE SEQUENCE public.a_subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.a_subject_id_seq;
       public               postgres    false    228            	           0    0    a_subject_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.a_subject_id_seq OWNED BY public.a_subject.id;
          public               postgres    false    227            �            1259    53609    at_class    TABLE     �   CREATE TABLE public.at_class (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    class_id integer NOT NULL,
    subject_id integer NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.at_class;
       public         heap r       postgres    false            �            1259    53608    at_class_id_seq    SEQUENCE     �   CREATE SEQUENCE public.at_class_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.at_class_id_seq;
       public               postgres    false    226            
           0    0    at_class_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.at_class_id_seq OWNED BY public.at_class.id;
          public               postgres    false    225            �            1259    54021 
   at_subject    TABLE     �   CREATE TABLE public.at_subject (
    id integer NOT NULL,
    teacher integer NOT NULL,
    subject integer NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.at_subject;
       public         heap r       postgres    false            �            1259    54020    at_subject_id_seq    SEQUENCE     �   CREATE SEQUENCE public.at_subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.at_subject_id_seq;
       public               postgres    false    240                       0    0    at_subject_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.at_subject_id_seq OWNED BY public.at_subject.id;
          public               postgres    false    239            �            1259    54116    c_bank    TABLE        CREATE TABLE public.c_bank (
    id integer NOT NULL,
    homebase integer,
    teacher integer,
    subject integer,
    btype text NOT NULL,
    name character varying(255) NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.c_bank;
       public         heap r       postgres    false            �            1259    54115    c_bank_id_seq    SEQUENCE     �   CREATE SEQUENCE public.c_bank_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.c_bank_id_seq;
       public               postgres    false    242                       0    0    c_bank_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.c_bank_id_seq OWNED BY public.c_bank.id;
          public               postgres    false    241            �            1259    54239    c_class    TABLE     �   CREATE TABLE public.c_class (
    id integer NOT NULL,
    exam integer,
    classid integer,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.c_class;
       public         heap r       postgres    false            �            1259    54238    c_class_id_seq    SEQUENCE     �   CREATE SEQUENCE public.c_class_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.c_class_id_seq;
       public               postgres    false    248                       0    0    c_class_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.c_class_id_seq OWNED BY public.c_class.id;
          public               postgres    false    247            �            1259    54221    c_ebank    TABLE     �   CREATE TABLE public.c_ebank (
    id integer NOT NULL,
    exam integer,
    bank integer,
    pg integer,
    essay integer,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.c_ebank;
       public         heap r       postgres    false            �            1259    54220    c_ebank_id_seq    SEQUENCE     �   CREATE SEQUENCE public.c_ebank_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.c_ebank_id_seq;
       public               postgres    false    246                       0    0    c_ebank_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.c_ebank_id_seq OWNED BY public.c_ebank.id;
          public               postgres    false    245            �            1259    54257    c_exam    TABLE     $  CREATE TABLE public.c_exam (
    id integer NOT NULL,
    homebase integer,
    teacher integer,
    name character varying(255) NOT NULL,
    duration integer NOT NULL,
    isactive boolean DEFAULT true,
    token text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.c_exam;
       public         heap r       postgres    false            �            1259    54256    c_exam_id_seq    SEQUENCE     �   CREATE SEQUENCE public.c_exam_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.c_exam_id_seq;
       public               postgres    false    250                       0    0    c_exam_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.c_exam_id_seq OWNED BY public.c_exam.id;
          public               postgres    false    249            �            1259    54141 
   c_question    TABLE     2  CREATE TABLE public.c_question (
    id integer NOT NULL,
    bank integer,
    qtype integer NOT NULL,
    question text NOT NULL,
    a text,
    b text,
    c text,
    d text,
    e text,
    qkey text,
    poin integer DEFAULT 0,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.c_question;
       public         heap r       postgres    false            �            1259    54140    c_question_id_seq    SEQUENCE     �   CREATE SEQUENCE public.c_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.c_question_id_seq;
       public               postgres    false    244                       0    0    c_question_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.c_question_id_seq OWNED BY public.c_question.id;
          public               postgres    false    243            �            1259    53998    cl_students    TABLE     �   CREATE TABLE public.cl_students (
    id integer NOT NULL,
    periode integer,
    classid integer,
    student integer,
    student_name character varying(255) NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.cl_students;
       public         heap r       postgres    false            �            1259    53997    cl_students_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cl_students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.cl_students_id_seq;
       public               postgres    false    238                       0    0    cl_students_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.cl_students_id_seq OWNED BY public.cl_students.id;
          public               postgres    false    237            �            1259    54377    l_cclass    TABLE     �   CREATE TABLE public.l_cclass (
    id integer NOT NULL,
    chapter integer,
    classid integer,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.l_cclass;
       public         heap r       postgres    false            �            1259    54376    l_cclass_id_seq    SEQUENCE     �   CREATE SEQUENCE public.l_cclass_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.l_cclass_id_seq;
       public               postgres    false    252                       0    0    l_cclass_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.l_cclass_id_seq OWNED BY public.l_cclass.id;
          public               postgres    false    251                        1259    62471 	   l_chapter    TABLE     �   CREATE TABLE public.l_chapter (
    id integer NOT NULL,
    subject integer,
    teacher integer,
    title text NOT NULL,
    target text NOT NULL,
    order_number integer,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.l_chapter;
       public         heap r       postgres    false            �            1259    62470    l_chapter_id_seq    SEQUENCE     �   CREATE SEQUENCE public.l_chapter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.l_chapter_id_seq;
       public               postgres    false    256                       0    0    l_chapter_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.l_chapter_id_seq OWNED BY public.l_chapter.id;
          public               postgres    false    255                       1259    62491 	   l_content    TABLE     �   CREATE TABLE public.l_content (
    id integer NOT NULL,
    chapter integer,
    title text NOT NULL,
    target text NOT NULL,
    order_number integer,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.l_content;
       public         heap r       postgres    false                       1259    62490    l_content_id_seq    SEQUENCE     �   CREATE SEQUENCE public.l_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.l_content_id_seq;
       public               postgres    false    258                       0    0    l_content_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.l_content_id_seq OWNED BY public.l_content.id;
          public               postgres    false    257            �            1259    54395    l_file    TABLE     �   CREATE TABLE public.l_file (
    id integer NOT NULL,
    content integer,
    title text NOT NULL,
    file text,
    video text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.l_file;
       public         heap r       postgres    false            �            1259    54394    l_file_id_seq    SEQUENCE     �   CREATE SEQUENCE public.l_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.l_file_id_seq;
       public               postgres    false    254                       0    0    l_file_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.l_file_id_seq OWNED BY public.l_file.id;
          public               postgres    false    253                       1259    62533    t_surah    TABLE     �   CREATE TABLE public.t_surah (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    ayat integer NOT NULL,
    lines integer
);
    DROP TABLE public.t_surah;
       public         heap r       postgres    false                       1259    62536    t_alquran_id_seq    SEQUENCE     �   CREATE SEQUENCE public.t_alquran_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.t_alquran_id_seq;
       public               postgres    false    259                       0    0    t_alquran_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.t_alquran_id_seq OWNED BY public.t_surah.id;
          public               postgres    false    260            �            1259    53535    u_admin    TABLE     Y  CREATE TABLE public.u_admin (
    id integer NOT NULL,
    homebase integer,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    password text NOT NULL,
    level text DEFAULT 'admin'::text,
    activation text,
    isactive boolean DEFAULT false,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.u_admin;
       public         heap r       postgres    false            �            1259    53534    u_admin_id_seq    SEQUENCE     �   CREATE SEQUENCE public.u_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.u_admin_id_seq;
       public               postgres    false    222                       0    0    u_admin_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.u_admin_id_seq OWNED BY public.u_admin.id;
          public               postgres    false    221            �            1259    53482 	   u_parents    TABLE     �   CREATE TABLE public.u_parents (
    id integer NOT NULL,
    student integer,
    email text NOT NULL,
    username text NOT NULL,
    phone text NOT NULL,
    password text NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.u_parents;
       public         heap r       postgres    false            �            1259    53481    u_parents_id_seq    SEQUENCE     �   CREATE SEQUENCE public.u_parents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.u_parents_id_seq;
       public               postgres    false    220                       0    0    u_parents_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.u_parents_id_seq OWNED BY public.u_parents.id;
          public               postgres    false    219            �            1259    53828 
   u_students    TABLE     Q  CREATE TABLE public.u_students (
    id integer NOT NULL,
    homebase integer,
    entry integer,
    name text NOT NULL,
    nis text,
    password text,
    level text DEFAULT 'student'::text,
    gender character varying(255),
    isactive boolean DEFAULT true,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.u_students;
       public         heap r       postgres    false            �            1259    53827    u_students_id_seq    SEQUENCE     �   CREATE SEQUENCE public.u_students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.u_students_id_seq;
       public               postgres    false    232                       0    0    u_students_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.u_students_id_seq OWNED BY public.u_students.id;
          public               postgres    false    231            �            1259    53891 
   u_teachers    TABLE     �  CREATE TABLE public.u_teachers (
    id integer NOT NULL,
    username text NOT NULL,
    name text NOT NULL,
    email text,
    img text,
    homebase integer NOT NULL,
    homeroom boolean DEFAULT false,
    class integer,
    phone text,
    password text NOT NULL,
    gender character varying(10) NOT NULL,
    level text DEFAULT 'teacher'::text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.u_teachers;
       public         heap r       postgres    false            �            1259    53890    u_teachers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.u_teachers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.u_teachers_id_seq;
       public               postgres    false    234                       0    0    u_teachers_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.u_teachers_id_seq OWNED BY public.u_teachers.id;
          public               postgres    false    233            �           2604    53421 
   a_class id    DEFAULT     h   ALTER TABLE ONLY public.a_class ALTER COLUMN id SET DEFAULT nextval('public.a_class_id_seq'::regclass);
 9   ALTER TABLE public.a_class ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            �           2604    53390 
   a_grade id    DEFAULT     h   ALTER TABLE ONLY public.a_grade ALTER COLUMN id SET DEFAULT nextval('public.a_grade_id_seq'::regclass);
 9   ALTER TABLE public.a_grade ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    216    215    216            �           2604    53673    a_homebase id    DEFAULT     n   ALTER TABLE ONLY public.a_homebase ALTER COLUMN id SET DEFAULT nextval('public.a_homebase_id_seq'::regclass);
 <   ALTER TABLE public.a_homebase ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    229    230            �           2604    53561 
   a_major id    DEFAULT     h   ALTER TABLE ONLY public.a_major ALTER COLUMN id SET DEFAULT nextval('public.a_major_id_seq'::regclass);
 9   ALTER TABLE public.a_major ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    223    224            �           2604    53918    a_periode id    DEFAULT     l   ALTER TABLE ONLY public.a_periode ALTER COLUMN id SET DEFAULT nextval('public.a_periode_id_seq'::regclass);
 ;   ALTER TABLE public.a_periode ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    235    236    236            �           2604    53646    a_subject id    DEFAULT     l   ALTER TABLE ONLY public.a_subject ALTER COLUMN id SET DEFAULT nextval('public.a_subject_id_seq'::regclass);
 ;   ALTER TABLE public.a_subject ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    227    228            �           2604    53612    at_class id    DEFAULT     j   ALTER TABLE ONLY public.at_class ALTER COLUMN id SET DEFAULT nextval('public.at_class_id_seq'::regclass);
 :   ALTER TABLE public.at_class ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    225    226    226            �           2604    54024    at_subject id    DEFAULT     n   ALTER TABLE ONLY public.at_subject ALTER COLUMN id SET DEFAULT nextval('public.at_subject_id_seq'::regclass);
 <   ALTER TABLE public.at_subject ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    239    240    240            �           2604    54119 	   c_bank id    DEFAULT     f   ALTER TABLE ONLY public.c_bank ALTER COLUMN id SET DEFAULT nextval('public.c_bank_id_seq'::regclass);
 8   ALTER TABLE public.c_bank ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    242    241    242            �           2604    54242 
   c_class id    DEFAULT     h   ALTER TABLE ONLY public.c_class ALTER COLUMN id SET DEFAULT nextval('public.c_class_id_seq'::regclass);
 9   ALTER TABLE public.c_class ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    248    247    248            �           2604    54224 
   c_ebank id    DEFAULT     h   ALTER TABLE ONLY public.c_ebank ALTER COLUMN id SET DEFAULT nextval('public.c_ebank_id_seq'::regclass);
 9   ALTER TABLE public.c_ebank ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    245    246    246            �           2604    54260 	   c_exam id    DEFAULT     f   ALTER TABLE ONLY public.c_exam ALTER COLUMN id SET DEFAULT nextval('public.c_exam_id_seq'::regclass);
 8   ALTER TABLE public.c_exam ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    249    250    250            �           2604    54144    c_question id    DEFAULT     n   ALTER TABLE ONLY public.c_question ALTER COLUMN id SET DEFAULT nextval('public.c_question_id_seq'::regclass);
 <   ALTER TABLE public.c_question ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    243    244            �           2604    54001    cl_students id    DEFAULT     p   ALTER TABLE ONLY public.cl_students ALTER COLUMN id SET DEFAULT nextval('public.cl_students_id_seq'::regclass);
 =   ALTER TABLE public.cl_students ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    238    237    238            �           2604    54380    l_cclass id    DEFAULT     j   ALTER TABLE ONLY public.l_cclass ALTER COLUMN id SET DEFAULT nextval('public.l_cclass_id_seq'::regclass);
 :   ALTER TABLE public.l_cclass ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    251    252    252            �           2604    62474    l_chapter id    DEFAULT     l   ALTER TABLE ONLY public.l_chapter ALTER COLUMN id SET DEFAULT nextval('public.l_chapter_id_seq'::regclass);
 ;   ALTER TABLE public.l_chapter ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    256    255    256            �           2604    62494    l_content id    DEFAULT     l   ALTER TABLE ONLY public.l_content ALTER COLUMN id SET DEFAULT nextval('public.l_content_id_seq'::regclass);
 ;   ALTER TABLE public.l_content ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    258    257    258            �           2604    54398 	   l_file id    DEFAULT     f   ALTER TABLE ONLY public.l_file ALTER COLUMN id SET DEFAULT nextval('public.l_file_id_seq'::regclass);
 8   ALTER TABLE public.l_file ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    253    254    254            �           2604    62537 
   t_surah id    DEFAULT     j   ALTER TABLE ONLY public.t_surah ALTER COLUMN id SET DEFAULT nextval('public.t_alquran_id_seq'::regclass);
 9   ALTER TABLE public.t_surah ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    260    259            �           2604    53538 
   u_admin id    DEFAULT     h   ALTER TABLE ONLY public.u_admin ALTER COLUMN id SET DEFAULT nextval('public.u_admin_id_seq'::regclass);
 9   ALTER TABLE public.u_admin ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221    222            �           2604    53485    u_parents id    DEFAULT     l   ALTER TABLE ONLY public.u_parents ALTER COLUMN id SET DEFAULT nextval('public.u_parents_id_seq'::regclass);
 ;   ALTER TABLE public.u_parents ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            �           2604    53831    u_students id    DEFAULT     n   ALTER TABLE ONLY public.u_students ALTER COLUMN id SET DEFAULT nextval('public.u_students_id_seq'::regclass);
 <   ALTER TABLE public.u_students ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    231    232    232            �           2604    53894    u_teachers id    DEFAULT     n   ALTER TABLE ONLY public.u_teachers ALTER COLUMN id SET DEFAULT nextval('public.u_teachers_id_seq'::regclass);
 <   ALTER TABLE public.u_teachers ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    233    234    234            �          0    53418    a_class 
   TABLE DATA           N   COPY public.a_class (id, homebase, grade, major, name, createdat) FROM stdin;
    public               postgres    false    218   t�       �          0    53387    a_grade 
   TABLE DATA           @   COPY public.a_grade (id, homebase, name, createdat) FROM stdin;
    public               postgres    false    216   $�       �          0    53670 
   a_homebase 
   TABLE DATA           9   COPY public.a_homebase (id, name, createdat) FROM stdin;
    public               postgres    false    230   z�       �          0    53558    a_major 
   TABLE DATA           @   COPY public.a_major (id, homebase, name, createdat) FROM stdin;
    public               postgres    false    224   ��       �          0    53915 	   a_periode 
   TABLE DATA           L   COPY public.a_periode (id, homebase, name, isactive, createdat) FROM stdin;
    public               postgres    false    236   l�       �          0    53643 	   a_subject 
   TABLE DATA           I   COPY public.a_subject (id, homebase, name, cover, createdat) FROM stdin;
    public               postgres    false    228   ��       �          0    53609    at_class 
   TABLE DATA           S   COPY public.at_class (id, teacher_id, class_id, subject_id, createdat) FROM stdin;
    public               postgres    false    226   ��       �          0    54021 
   at_subject 
   TABLE DATA           E   COPY public.at_subject (id, teacher, subject, createdat) FROM stdin;
    public               postgres    false    240   �       �          0    54116    c_bank 
   TABLE DATA           X   COPY public.c_bank (id, homebase, teacher, subject, btype, name, createdat) FROM stdin;
    public               postgres    false    242   ��       �          0    54239    c_class 
   TABLE DATA           ?   COPY public.c_class (id, exam, classid, createdat) FROM stdin;
    public               postgres    false    248   ,�       �          0    54221    c_ebank 
   TABLE DATA           G   COPY public.c_ebank (id, exam, bank, pg, essay, createdat) FROM stdin;
    public               postgres    false    246   ��       �          0    54257    c_exam 
   TABLE DATA           c   COPY public.c_exam (id, homebase, teacher, name, duration, isactive, token, createdat) FROM stdin;
    public               postgres    false    250   0�       �          0    54141 
   c_question 
   TABLE DATA           e   COPY public.c_question (id, bank, qtype, question, a, b, c, d, e, qkey, poin, createdat) FROM stdin;
    public               postgres    false    244   ��       �          0    53998    cl_students 
   TABLE DATA           ]   COPY public.cl_students (id, periode, classid, student, student_name, createdat) FROM stdin;
    public               postgres    false    238   	      �          0    54377    l_cclass 
   TABLE DATA           C   COPY public.l_cclass (id, chapter, classid, createdat) FROM stdin;
    public               postgres    false    252   m	      �          0    62471 	   l_chapter 
   TABLE DATA           a   COPY public.l_chapter (id, subject, teacher, title, target, order_number, createdat) FROM stdin;
    public               postgres    false    256   �	      �          0    62491 	   l_content 
   TABLE DATA           X   COPY public.l_content (id, chapter, title, target, order_number, createdat) FROM stdin;
    public               postgres    false    258   v      �          0    54395    l_file 
   TABLE DATA           L   COPY public.l_file (id, content, title, file, video, createdat) FROM stdin;
    public               postgres    false    254   R      �          0    62533    t_surah 
   TABLE DATA           8   COPY public.t_surah (id, name, ayat, lines) FROM stdin;
    public               postgres    false    259   o      �          0    53535    u_admin 
   TABLE DATA           u   COPY public.u_admin (id, homebase, name, email, phone, password, level, activation, isactive, createdat) FROM stdin;
    public               postgres    false    222   �      �          0    53482 	   u_parents 
   TABLE DATA           ]   COPY public.u_parents (id, student, email, username, phone, password, createdat) FROM stdin;
    public               postgres    false    220   �      �          0    53828 
   u_students 
   TABLE DATA           r   COPY public.u_students (id, homebase, entry, name, nis, password, level, gender, isactive, createdat) FROM stdin;
    public               postgres    false    232   �      �          0    53891 
   u_teachers 
   TABLE DATA           �   COPY public.u_teachers (id, username, name, email, img, homebase, homeroom, class, phone, password, gender, level, createdat) FROM stdin;
    public               postgres    false    234   =|                 0    0    a_class_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.a_class_id_seq', 9, true);
          public               postgres    false    217                       0    0    a_grade_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.a_grade_id_seq', 8, true);
          public               postgres    false    215                       0    0    a_homebase_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.a_homebase_id_seq', 4, true);
          public               postgres    false    229                       0    0    a_major_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.a_major_id_seq', 6, true);
          public               postgres    false    223                       0    0    a_periode_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.a_periode_id_seq', 4, true);
          public               postgres    false    235                        0    0    a_subject_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.a_subject_id_seq', 13, true);
          public               postgres    false    227            !           0    0    at_class_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.at_class_id_seq', 1, false);
          public               postgres    false    225            "           0    0    at_subject_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.at_subject_id_seq', 19, true);
          public               postgres    false    239            #           0    0    c_bank_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.c_bank_id_seq', 7, true);
          public               postgres    false    241            $           0    0    c_class_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.c_class_id_seq', 22, true);
          public               postgres    false    247            %           0    0    c_ebank_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.c_ebank_id_seq', 15, true);
          public               postgres    false    245            &           0    0    c_exam_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.c_exam_id_seq', 4, true);
          public               postgres    false    249            '           0    0    c_question_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.c_question_id_seq', 160, true);
          public               postgres    false    243            (           0    0    cl_students_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.cl_students_id_seq', 93, true);
          public               postgres    false    237            )           0    0    l_cclass_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.l_cclass_id_seq', 24, true);
          public               postgres    false    251            *           0    0    l_chapter_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.l_chapter_id_seq', 2, true);
          public               postgres    false    255            +           0    0    l_content_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.l_content_id_seq', 3, true);
          public               postgres    false    257            ,           0    0    l_file_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.l_file_id_seq', 10, true);
          public               postgres    false    253            -           0    0    t_alquran_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.t_alquran_id_seq', 115, true);
          public               postgres    false    260            .           0    0    u_admin_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.u_admin_id_seq', 7, true);
          public               postgres    false    221            /           0    0    u_parents_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.u_parents_id_seq', 1, false);
          public               postgres    false    219            0           0    0    u_students_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.u_students_id_seq', 1002, true);
          public               postgres    false    231            1           0    0    u_teachers_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.u_teachers_id_seq', 313, true);
          public               postgres    false    233            �           2606    53426    a_class a_class_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.a_class
    ADD CONSTRAINT a_class_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.a_class DROP CONSTRAINT a_class_pkey;
       public                 postgres    false    218            �           2606    53395    a_grade a_grade_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.a_grade
    ADD CONSTRAINT a_grade_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.a_grade DROP CONSTRAINT a_grade_pkey;
       public                 postgres    false    216                       2606    53678    a_homebase a_homebase_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.a_homebase
    ADD CONSTRAINT a_homebase_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.a_homebase DROP CONSTRAINT a_homebase_pkey;
       public                 postgres    false    230                       2606    53566    a_major a_major_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.a_major
    ADD CONSTRAINT a_major_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.a_major DROP CONSTRAINT a_major_pkey;
       public                 postgres    false    224                       2606    53924    a_periode a_periode_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.a_periode
    ADD CONSTRAINT a_periode_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.a_periode DROP CONSTRAINT a_periode_pkey;
       public                 postgres    false    236            	           2606    53651    a_subject a_subject_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.a_subject
    ADD CONSTRAINT a_subject_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.a_subject DROP CONSTRAINT a_subject_pkey;
       public                 postgres    false    228                       2606    53615    at_class at_class_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.at_class
    ADD CONSTRAINT at_class_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.at_class DROP CONSTRAINT at_class_pkey;
       public                 postgres    false    226                       2606    54027    at_subject at_subject_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.at_subject
    ADD CONSTRAINT at_subject_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.at_subject DROP CONSTRAINT at_subject_pkey;
       public                 postgres    false    240                       2606    54124    c_bank c_bank_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.c_bank
    ADD CONSTRAINT c_bank_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.c_bank DROP CONSTRAINT c_bank_pkey;
       public                 postgres    false    242                       2606    54245    c_class c_class_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.c_class
    ADD CONSTRAINT c_class_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.c_class DROP CONSTRAINT c_class_pkey;
       public                 postgres    false    248                       2606    54227    c_ebank c_ebank_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.c_ebank
    ADD CONSTRAINT c_ebank_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.c_ebank DROP CONSTRAINT c_ebank_pkey;
       public                 postgres    false    246                       2606    54266    c_exam c_exam_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.c_exam
    ADD CONSTRAINT c_exam_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.c_exam DROP CONSTRAINT c_exam_pkey;
       public                 postgres    false    250                       2606    54150    c_question c_question_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.c_question
    ADD CONSTRAINT c_question_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.c_question DROP CONSTRAINT c_question_pkey;
       public                 postgres    false    244                       2606    54004    cl_students cl_students_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.cl_students
    ADD CONSTRAINT cl_students_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.cl_students DROP CONSTRAINT cl_students_pkey;
       public                 postgres    false    238            !           2606    54383    l_cclass l_cclass_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.l_cclass
    ADD CONSTRAINT l_cclass_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.l_cclass DROP CONSTRAINT l_cclass_pkey;
       public                 postgres    false    252            %           2606    62479    l_chapter l_chapter_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.l_chapter
    ADD CONSTRAINT l_chapter_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.l_chapter DROP CONSTRAINT l_chapter_pkey;
       public                 postgres    false    256            '           2606    62499    l_content l_content_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.l_content
    ADD CONSTRAINT l_content_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.l_content DROP CONSTRAINT l_content_pkey;
       public                 postgres    false    258            #           2606    54403    l_file l_file_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.l_file
    ADD CONSTRAINT l_file_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.l_file DROP CONSTRAINT l_file_pkey;
       public                 postgres    false    254            )           2606    62539    t_surah t_alquran_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.t_surah
    ADD CONSTRAINT t_alquran_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.t_surah DROP CONSTRAINT t_alquran_pkey;
       public                 postgres    false    259            �           2606    53545    u_admin u_admin_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.u_admin
    ADD CONSTRAINT u_admin_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.u_admin DROP CONSTRAINT u_admin_pkey;
       public                 postgres    false    222            �           2606    53492    u_parents u_parents_email_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.u_parents
    ADD CONSTRAINT u_parents_email_key UNIQUE (email);
 G   ALTER TABLE ONLY public.u_parents DROP CONSTRAINT u_parents_email_key;
       public                 postgres    false    220            �           2606    53494    u_parents u_parents_phone_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.u_parents
    ADD CONSTRAINT u_parents_phone_key UNIQUE (phone);
 G   ALTER TABLE ONLY public.u_parents DROP CONSTRAINT u_parents_phone_key;
       public                 postgres    false    220            �           2606    53490    u_parents u_parents_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.u_parents
    ADD CONSTRAINT u_parents_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.u_parents DROP CONSTRAINT u_parents_pkey;
       public                 postgres    false    220                       2606    53838    u_students u_students_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.u_students
    ADD CONSTRAINT u_students_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.u_students DROP CONSTRAINT u_students_pkey;
       public                 postgres    false    232                       2606    53901    u_teachers u_teachers_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.u_teachers
    ADD CONSTRAINT u_teachers_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.u_teachers DROP CONSTRAINT u_teachers_pkey;
       public                 postgres    false    234                       2606    53552    u_admin unique_email 
   CONSTRAINT     P   ALTER TABLE ONLY public.u_admin
    ADD CONSTRAINT unique_email UNIQUE (email);
 >   ALTER TABLE ONLY public.u_admin DROP CONSTRAINT unique_email;
       public                 postgres    false    222                       2606    53556    u_admin unique_phone 
   CONSTRAINT     P   ALTER TABLE ONLY public.u_admin
    ADD CONSTRAINT unique_phone UNIQUE (phone);
 >   ALTER TABLE ONLY public.u_admin DROP CONSTRAINT unique_phone;
       public                 postgres    false    222            *           2606    53432    a_class a_class_grade_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.a_class
    ADD CONSTRAINT a_class_grade_fkey FOREIGN KEY (grade) REFERENCES public.a_grade(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.a_class DROP CONSTRAINT a_class_grade_fkey;
       public               postgres    false    216    218    4853            /           2606    53925 !   a_periode a_periode_homebase_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.a_periode
    ADD CONSTRAINT a_periode_homebase_fkey FOREIGN KEY (homebase) REFERENCES public.a_homebase(id) ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.a_periode DROP CONSTRAINT a_periode_homebase_fkey;
       public               postgres    false    236    4875    230            +           2606    53621    at_class at_class_class_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.at_class
    ADD CONSTRAINT at_class_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.a_class(id) ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.at_class DROP CONSTRAINT at_class_class_id_fkey;
       public               postgres    false    4855    226    218            3           2606    54033 "   at_subject at_subject_subject_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.at_subject
    ADD CONSTRAINT at_subject_subject_fkey FOREIGN KEY (subject) REFERENCES public.a_subject(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.at_subject DROP CONSTRAINT at_subject_subject_fkey;
       public               postgres    false    228    4873    240            4           2606    54028 "   at_subject at_subject_teacher_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.at_subject
    ADD CONSTRAINT at_subject_teacher_fkey FOREIGN KEY (teacher) REFERENCES public.u_teachers(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.at_subject DROP CONSTRAINT at_subject_teacher_fkey;
       public               postgres    false    234    240    4879            5           2606    54125    c_bank c_bank_homebase_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.c_bank
    ADD CONSTRAINT c_bank_homebase_fkey FOREIGN KEY (homebase) REFERENCES public.a_homebase(id) ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.c_bank DROP CONSTRAINT c_bank_homebase_fkey;
       public               postgres    false    242    4875    230            6           2606    54135    c_bank c_bank_subject_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.c_bank
    ADD CONSTRAINT c_bank_subject_fkey FOREIGN KEY (subject) REFERENCES public.a_subject(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.c_bank DROP CONSTRAINT c_bank_subject_fkey;
       public               postgres    false    4873    228    242            7           2606    54130    c_bank c_bank_teacher_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.c_bank
    ADD CONSTRAINT c_bank_teacher_fkey FOREIGN KEY (teacher) REFERENCES public.u_teachers(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.c_bank DROP CONSTRAINT c_bank_teacher_fkey;
       public               postgres    false    242    234    4879            :           2606    54251    c_class c_class_classid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.c_class
    ADD CONSTRAINT c_class_classid_fkey FOREIGN KEY (classid) REFERENCES public.a_class(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.c_class DROP CONSTRAINT c_class_classid_fkey;
       public               postgres    false    4855    218    248            9           2606    54233    c_ebank c_ebank_bank_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.c_ebank
    ADD CONSTRAINT c_ebank_bank_fkey FOREIGN KEY (bank) REFERENCES public.c_bank(id) ON DELETE CASCADE;
 C   ALTER TABLE ONLY public.c_ebank DROP CONSTRAINT c_ebank_bank_fkey;
       public               postgres    false    242    4887    246            ;           2606    54267    c_exam c_exam_homebase_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.c_exam
    ADD CONSTRAINT c_exam_homebase_fkey FOREIGN KEY (homebase) REFERENCES public.a_homebase(id) ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.c_exam DROP CONSTRAINT c_exam_homebase_fkey;
       public               postgres    false    230    4875    250            <           2606    54272    c_exam c_exam_teacher_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.c_exam
    ADD CONSTRAINT c_exam_teacher_fkey FOREIGN KEY (teacher) REFERENCES public.u_teachers(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.c_exam DROP CONSTRAINT c_exam_teacher_fkey;
       public               postgres    false    234    250    4879            8           2606    54151    c_question c_question_bank_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.c_question
    ADD CONSTRAINT c_question_bank_fkey FOREIGN KEY (bank) REFERENCES public.c_bank(id) ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.c_question DROP CONSTRAINT c_question_bank_fkey;
       public               postgres    false    242    4887    244            0           2606    54010 $   cl_students cl_students_classid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cl_students
    ADD CONSTRAINT cl_students_classid_fkey FOREIGN KEY (classid) REFERENCES public.a_class(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.cl_students DROP CONSTRAINT cl_students_classid_fkey;
       public               postgres    false    4855    218    238            1           2606    54005 $   cl_students cl_students_periode_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cl_students
    ADD CONSTRAINT cl_students_periode_fkey FOREIGN KEY (periode) REFERENCES public.a_periode(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.cl_students DROP CONSTRAINT cl_students_periode_fkey;
       public               postgres    false    238    4881    236            2           2606    54015 $   cl_students cl_students_student_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cl_students
    ADD CONSTRAINT cl_students_student_fkey FOREIGN KEY (student) REFERENCES public.u_students(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.cl_students DROP CONSTRAINT cl_students_student_fkey;
       public               postgres    false    238    232    4877            =           2606    54389    l_cclass l_cclass_classid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.l_cclass
    ADD CONSTRAINT l_cclass_classid_fkey FOREIGN KEY (classid) REFERENCES public.a_class(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.l_cclass DROP CONSTRAINT l_cclass_classid_fkey;
       public               postgres    false    218    252    4855            >           2606    62480     l_chapter l_chapter_subject_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.l_chapter
    ADD CONSTRAINT l_chapter_subject_fkey FOREIGN KEY (subject) REFERENCES public.a_subject(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.l_chapter DROP CONSTRAINT l_chapter_subject_fkey;
       public               postgres    false    228    256    4873            ?           2606    62485     l_chapter l_chapter_teacher_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.l_chapter
    ADD CONSTRAINT l_chapter_teacher_fkey FOREIGN KEY (teacher) REFERENCES public.u_teachers(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.l_chapter DROP CONSTRAINT l_chapter_teacher_fkey;
       public               postgres    false    234    256    4879            @           2606    62500     l_content l_content_chapter_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.l_content
    ADD CONSTRAINT l_content_chapter_fkey FOREIGN KEY (chapter) REFERENCES public.l_chapter(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.l_content DROP CONSTRAINT l_content_chapter_fkey;
       public               postgres    false    256    4901    258            ,           2606    53839 #   u_students u_students_homebase_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.u_students
    ADD CONSTRAINT u_students_homebase_fkey FOREIGN KEY (homebase) REFERENCES public.a_homebase(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.u_students DROP CONSTRAINT u_students_homebase_fkey;
       public               postgres    false    4875    230    232            -           2606    53907     u_teachers u_teachers_class_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.u_teachers
    ADD CONSTRAINT u_teachers_class_fkey FOREIGN KEY (class) REFERENCES public.a_class(id);
 J   ALTER TABLE ONLY public.u_teachers DROP CONSTRAINT u_teachers_class_fkey;
       public               postgres    false    4855    234    218            .           2606    53902 #   u_teachers u_teachers_homebase_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.u_teachers
    ADD CONSTRAINT u_teachers_homebase_fkey FOREIGN KEY (homebase) REFERENCES public.a_homebase(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.u_teachers DROP CONSTRAINT u_teachers_homebase_fkey;
       public               postgres    false    4875    234    230            �   �   x�mϻ�@�ښ�� Q��̐ )Rf�9�s\��,@�o:#����ڊ��a��AzBL�����ơnfd�-��e��/��מM)g�`˪Z)�	u=iÏ�k���@��H�D���@��><9%��b�y�BCF8�J��\�B�      �   F   x�mʱ� �O����6 fa�9"���c�F4A���A���t,(�t���#rQw�gL_5�a������      �   W   x�m̻�0 �ڞ�b���EB
%��5P��	��5
[Q^ػh�F���Qa���(Ś��8�O�dZ���o`��­�!��/c      �   {   x�e�M� @�5s
.P2�E�`u����Rh��_w&�_�N,镞<�
��&��]�s4��M`>�%���<�u��}��t��:���3�.m����<r���3��>�W�y$W o��'�      �   a   x�e��� ��3��@�qC�,=w��>r�d��'��`ਭ�����k@��e�u�D#�m�|A;�P�%f�c���c��-1˽?�]��S�."�� �      �     x�u��N�0�s�{���8no� 1	���4Ѐ��V{~����?�?}6��f�|��34]�����q���%��[8���pN ��@�g�����#�Y����A��
�F�݀N����T��~��ܽ<�h�h���Foz��j�t�޻�Ĉ�"��c�S���z
�����iY�n���kf[��� E��(����(O"V}��x<R�z�[����y���Ǭ��l�s}`� ��g�S.6ǵR<�QD,ƴo�m�_JGv�      �      x������ � �      �   h   x�}̹�0ј��X��!����ױ�620��a�tAHE��5.����0����@	i��Anf}vދ�P�N��Q^���[b�qJ3����1V��1���4�      �   �   x�m�1
1E�S�f&�d���,AK�[ȢX��1���6�z��DS`�s��0nF�!с� �1����7�P0~�{����u��h�ZB̘�.�>�Q�tw�@j��l���TK�T�<��%�7�j:ܮ-ӵ-����i�*�3i<yD| Q5�      �   w   x�}��D!EѵV1|<�
�L�u.Ò�\B4]������%#9>���ޮBJ�Ux��� {(�8*�%��&f�^$<��K���P.�W��?a��d�BJ��&��{��C5      �   m   x�}���@�3T���ޅ"R���#�(r�9>�&'�)%�z���ъ��o�Q��ʜ�f��86����b^I��݇34��Q��-)h�솅u�Ċ�ŗ0��)c      �   �   x�]�A
�0@����@Cf2I��Z*EjUh�B�dQ���E����(�p�Mi�mZ�GZ�{$Tg]��f�d�Kґ|D����ya� �p�;�����9=�xs0a��p�h��������?x�.��,J���u����,c���s@/.J�R�)      �      x��]Ɏ�H�=;���Hw:��SO�4P�JT�1}�Sbfr�%Z���N�LK��ՀDUd$����n��1�2�?�x�.��n��&��q�m�q��WM��v�c�|��;��e�j��~e^ŏͶ�ϲ�f��,6�ò��?l�v��ߗ�z���5<��o����g���E�o��ob�T��~����n��g�_��C�c��[7�x�.�u�[�h�y���Y��]����]¿����g�����{��Ͼ�a1�$<�޾���q���0�����r��	>��~�ˆuk=��6���5b;�۾������������4����	�maN�ݾiaG͜����z45iX |l��Q`�r��E�e��7�n�~����Z��}o&��,�ݾk��ͦ>��£���c��n��Yb3��zͶ�<��C��i����
�0���j��Bv�V���m`��j���ϻ]��Vԫ��N� &����n�J}N��!q�o�[�m�s�<v���7KO��K*���8K���,f��D�E\#���n�:�]�е븁]��n73�jՄ�������W�^l�`�1L` s�}M�n�u�l��F��`�n?��>�_�a{8ۅ���6�N|�QC<���wq�N�'����5[ػN��j��� ت��vp|0>H̡��k12���k7H�x���I��7�=�[��ʤ���k� �f�]ɸ��g���ö�wJ"X�^5`[��G�5��!��T�Hh���Bo�2�ٯ�猁�R��g���j�e@�u�g�~Ғ�:������j��=��<<٩3l��4����m{m��3�z�쪝�4�E��S�d'��O!���@6� �Z"��B O�*�5���@�@n�ś-�	^���>�_����=I`��Fh2hJXFbMW�SjN�02��ރ��:ë��~��d��:^u�\�[5����k�mfsճz'��Q���m�����C�6ثx��%?l�p2����C�U
��
�	4��r=ļG`Uf [s�F��B���`m%���`J��R̀��a��z�xx�B�x){�� -�¨ǩ�sJN(��ΫHj����e�Azz��=?m\v
y ���%�o�����n0�B$>DX�dd�c�f���,���#1cZ��?�Ɯ��Nz�P ]�����4F��S,p-5v�bZh`(�n�f�m�V��г4�Ѽ��-d�W���~U3)ف�`\8oc��Ԍ���+ ����	�@�bs��@ϝ�[�l����s:�y�`f�\~-@�^�(���5�����7[e�����8�z�<:('{��?im����/^�u�͋�6.3�����2c�_gH��A����,��S�Y,�W}36��0UGJ�Q�V'��J�:��=����S��4���vݭ����+�:�ݞ���>�}�����yVU5ӵzw�V;��sέ?_�v���\�*F�鰊Y���կV��M���{+�]�^,_�i8N$�7��6nE`(p/�����#�f�z�6�yǴm"�aP��0'g��`t�eDYk��@��u�Bl������b�Q�*6rQ��5k�L����>��Emj��i���EMYfUT���Y�� �V f�4��8��[������6ʊ�%-2����1�A<;��Ta�.r��,�RaW�v'�G��R� F��eTk`�k�3���
mۿ�_q�d���5^��A��ӿ�VcA�lE��<x7�4y1���R������W�󱙉G'�W:��"7������W�u&�(KM�F@m�N���8�`�T��.�U�f\���������:�6N��u(�ny���W/ʡ6v�2[/�6<wV��= ݧٔ=c/�T��s�f��~���HMJb���-Yg�O֒�c;�R�(�4(�<���c���������M��C]tY*Ά�>ɔ��LI�fJ���� ��@�(�f�82B��ݨx�W98t-����d�$,�8v�{8N��tN�-�p�
���j�e*2e���7��E�䈁��5��� ��&�Xp�f�h��N����>��;���]k�Р�ŀ0��f�V4�z���f���N�u�¡wք�~�q}�z�En0FS�ƿ�0Τ��L���z� ����q��5߃�4�p#�ۢ�l���3��n��Ω�+���;����@�Xn��.�T�96�M����F���/'�Z�70xWJ�z�����ud�ۅ$�O�=^*//��=��@H0$$�h
���s����?l�s��LrE�� ڨ\��N)c�a�F�f삲�I*(kmR�s���`�|י�^{�~�+rt�I��8�� \_TcWo��-3M�b�^����\%fl/�I)JerȰ��ߑ3�����>S�t	
� TơZ�<��ʣ.��£)rL3*�oDc�\�O<���IY=�¬�J�	�Vd9�BS4�s\�)��"�%�$�I1���Q��;��a7�X���'�d���w������!({��.�ܝwÚgy�)0�<2�EUQf*�:���6���Y���;���ٺ���%'7/9�{3v]+�q�k� �Ɍ&��� f�}�bޠ�=l��W��t��=SŶ�9���)s!��!�]҃Md����$���\X=4����lU�`Fԇ��dY(�\����R�3:6��p*U�csq�(_`�f��-3�qP?�}?�P}Bg ���7�ܩ���UFn�fd������nX�	W�*��W0��@��C1JF��D��Y���@��|ýnw}�z�ɸWN�4��P�u�� ��g=���l�����`/�Lq,�6^Y^Wfd/�\qQ��]�������Q=�$C1�B~ gU��qu_�E�4h�tr�&�v5��U���]�-�sԚ&D������~5s�� �f\��+i��b�{V���xgZ�ʞ[���i�u��G\䠛\�E]ܽ�&*��ȝ�RȈ��������쓰�1�8&>�<�nb���abM�@��i��{��^~��%p����V����).�a�g0�^��)�T��~�t�+%N'� NF(N���#�ǳ���)}yF]ڢ̒�f%�~�&�c/�-���u��H�}�J!".&um�A��͵vQ��eve�L��\K�
��a��(�3�+�,�"������/���.CƳ
`���.Q�c���X�D��t]p�۷z�K�x��*�E\w�m��Al��Adj��K�KW�},��jV������i�2[�:y���Fw���]��b�8�M�{�N�5�sPB�B�&�Г�}���.*߰�w<�c�$�����P�D��qe�M���zN�S�fe�M�������õX����#	�%�i>p��;qs���]�.��]E�)�	�1\�2�@�^�q\!C�gpW����8,I�$�S3�</�Hsi|k��~�/�����Wu46�6���ؕ-�U�l�oO��tK�	՜�T�)}����iG��3c��]g��*{.<���wYΖ=�N�t�u]k����F!�<�Dd`��@���ih�Y�=G �.HmeeN�p�dB��I>%aw_'ꪞj1��|����+���5~�5q蛨���^�<0l�F�Q��	�Y���*�~�T=f7޷:Q���,6m�7� ���Np�T#��Q����ǯvJ�c�!v��0<7����N�HWTF.�,��!�(��s3��k�d����0�vm���t�#�[�RԠnlY���i3wd��7�ğ��3"���ԩ�+\~6)��U�Cw�7�7�4Ǯ>Z�io>O�^|�{]{�����Dyڛc�醿�3���xQFBPw�oLmC�p%F�{)q�0��"fr�&f2\�L���K�z���h�Z �(���ρ������Ty�Z�a��lZO�\]���5]�l�!��y�#��;�����<�d~�4�B����h搒x�����2�2\F����q��	!"Q�A� �W̄seAk=�o�99�����?ɥ�=�LQ�u��z��8L�'�lz�ӓq>=q�ZW���2�3�6�a�O2lq��K&gU-�   Q�5���ذC6l3E]�(3D����1Ti�Gy�1@|�ć}G>l�u&�(��D�M��D�b�:M�
��B1b#��1fE
�cy��Sbc�E��
aC�؟�C�T��Z#�H���5I�1�B�H�&^&R��E����̊:���@��D���H�Q`W"���*)6�b�qRl�U�e$Ł�&R�g��>)6���,��8%M��D���H��fiƋH�!�B�؟��F)@����b)�!����q�	M��H���-�bcX呬\k�%����#6��ZŽu�#61b#��1bc�)�"��4h�&Flb�~5Fl�y!�0�-b�&Fl�Ï,�"*x�b�&F�k�1deUE��Ե%F�O���A��yyX�&Jl�ľ�CW�r��O�؟��I-ET��̛HA%6Qb���F���Zʨ0��%6Qb�z�C�Χ�C��D�}��s���x�3�2D��D�}��P)yT�A
�(���)�1�
QfQ���o��&J�K(�9����Q�G��ĉM��pbc������
qb:Nlu~��K'6qb�7Nl�2��/���ĉM����|��&�T�����͟0%�iJ�Gei�y��T�/�J��2���T*�I�g�ʬ�����Q��9އ}u��2�̗F16c�Cb�ChK�E�YUd����W�16cbl3u�f����1�G$��0�ɼ�*�MTD�M��w$�� �kA�QD�M��D�ccB��9��b��R"�&b��cc�E�|y��cc�)S���B�1��"�ƐQ)Ҧ��� bl"�~Mb����TH����D��y��1PdEզ�@��ċ��x�1\�\�MQ�x�����bc0΋<�Ł�&Z�gf�>-6�)+ L>NH-6�b�-Zl��UT�!�B�؟��F�0�MՀh�����bcp�k�E��P-6�b�Zl�Y�`�+כz�5(b�&flÌ����9��:p������嘱Q�T��Y��D�M�دF���4�E	85�-��&nl��,� � 96�c_C��A��3��Ĥ�-�c
vlSe��]ּ��豯���ॾk�%���ď������_�W�y�h"�&����3^	 ���P����!���W��C�D�}��s���*mjDđM٧8�1堰�,K�L�dI�+�d�H��/�e��X��%��lPR��e|�nK4�D�}M6���̔9��O������Q� [� �l��~o4��+Yրly@GH<�ē��y�1�ע� zU�yD��4EZV�Y�i�!��F�P���(/C��ME����z*�̔��BU�,x��x�l�ղ�:c����)�}2e~M������XY+���D�MT�!U6� 4ĕ����1��VV1�  �l"˾#Y6������ �e[6�el٘��i�/��]6�eߑ.���j) ��$��̗��&�\�
qC�ٟ�0�F���Qkhc61f�&c6Һ��(����2�sQf#��3���T�4�H��i6��\�Jߙ��fk�g��p\U~��no�3�t�7CL%T׀�ǹi"�&��E���W�i��rȴs�gc�ư��`�T�:���?u6��<���T+�;����w6�B*�kV��fQgu����0U��TՁ3H��ĝM��/ǝ��f�,O�n��&��W��FpZ�u)���E��ĝ�qgc �U�@< qgw�5���r�(&r1�{K�ٟ�;ÔT_���yX�&�l�ξ�;�W)k�N��n?qg6�l'uƕr��7��&�l��>ɝ�����u�ܔa(yH��D��*�Ri	�bo�u6Qgߦ�u6�7YH�7S""�l��>E�����xe21D�M�ٯH�� �J3���2��D�M�ٗPgsP\�%��s61g_���AJ���q��#�ư!+��-my����:��QgcȮ � d�vB��&���O�}�<�R�&-U��-Pg�'\�v�<*�/�<�pg��T��a*=�ːg�sE�<�Z��ٳ�I�.��H�$�C���[}�ԿgQ�?�62"      �   T  x���MS���֯�nVCْ�av	�t��M5]5u7J"b�E�6}ï��tׄ��b���<�C�`�����3��m
V2�g��d���i]�V�D�e�I=����Y;�����n�����)W'Zs�3R7Ư�==���� ň�Q\�nO?vO�� MY	�f@g�=>��4�a8�4�l�3��K_���
����7��f��.��7�:����\���&U9#Mq��V�zo~f~�y�HU� �Ÿ�v,�w�O��Q�)ˊפJ������F�m3L�YE*�V|��H�ػ��S��K�z6z�~
v���I)��/V6�^:�P�e(]KR�����;�:�X�'��ʊ	R���;�֛�ޘ���fVI0I �w�Q0ti���.Vq����󰳝�za6�M%8c�%�^�G��8�d���T���L y1nmg�}n�a�|�H�{��h�������V�rK��5�-����zT�*s;ƅ��깚ߍ+����6<>���O�Ӕ�&L$�F�7݆>ı���N�L�(�}�o��0��tc�0�Yܙ}�"��f�m�Ӊ�#z:a�83����e4���oF58�I�.���wh�Q@��oJ!/����C���u�v�����Ќ�j� �;�b�����ua\�S��	O=8�3�������*y��x�X�}hF]z�~�}&����� m�����1�X��0�$��	��;�ஷfh�R�h'<9���-�&�/Q(A$% .�{2����t������ַ�,)Q��y��rt�o��9�쐡c�����&��.����9ZU�����(�y�3��RkM�4KA.�j����w��Ҝ����LEj�V܇��1��P�o��� u�^|s�G >�;t�~���pR4� ��i;�/�:R�o��"�Sd��(�?�=���,�7����!��h�!D�͚u{8TQUW�Z'j�ɧ������g�Erč�M�t�͠-.]�,��ke���J����#u��H�N*���p���?�fc�j���J]����n�Y�i�>����4 z�ڕ�7�c�	�*	(� �-cj�g�[��bZI"�`1���Vz��1���K=�d {��/��C���P���$���C�f�����d��T��a+�%�������@2@O�U$�]��!l��?s�V"�LJ �֑�u�֌��fJ�z����X�C?�m��9�r��� z�v;�w3ͤL�(�~e��^рwHSFr-9�LB�}��޷�
!�\���9������}���AM�q�d�[��P}����������%� ϐ�մ
c����\/�郒��l���;�����o�0%�I�� ~��:uFz	+�[N���Nt-]U&���zt���iph�;��a��yk�[�
Dqt�CYߙ�#~�%���q�s�R��Y?M��D)$8�84���d|��Јw�`D�	A��+,��u��	�S����Lup��E��Úxg���dbDq���S�-.����/j�H?Z<�>��wL*t~��
荳���"��r���/#���.Ǹ͝%K��t ���k�eѯ�>,��C0�NB�E�CKq�'�K�#�]'@b�������g\���.�d {��)���<}�^����z��v�ۺ_}(�w{�&:� ���Sj��MS#� |Q�g�Eg�&�Dٗ�4x����iG�{t�h���㐪*ؠ�`���	s�?㩔�� 6}�l }���������5��I2���7�19UK�CM2�CX���Ñ흙;P�T �4q�u���ִ�����M�_�{��QI����	!�!�G~      �   S   x�}��� ��]E ����3�i۔&�V0
�/��^�p�H1�������p!*�Sٳ���z^�bWU}4]%      �   �  x��VMo#7=;���y�8�n�� A��mE��=#�\hF}��}�d��sz�C�ĢD��G�7������~��������f$�Cip�y
�G;��LML�x�YB/ӎ�����=���Q��%?1�������&�r�%1��G
��'pľO1�<d�r[��={=O�,�xD��.��]��kV^�l�$!��F�f(z	Q#�jsK���m�:
<��h2=md�h��T�F�!�ً��:zIZ�\�đL(m�B����O8��h�%��w����܋� �LQ�>�.�O���8:�e6�+êo�nB����=惆�Cv�9q��м��q.���
.����db����h4�f�)�
��Z;V�����f�^�?^�>\��hu{�q}��[�n?��>]�4�휗8���٧+4p�+@/��7���C�y��r��/�*ɥ�)�U3H�5��[�� �Z����ߏ�Vޓ��D:�)�ܔI����3Tu����\���~md���g���� h�/ �НXX�a�U��E��z�r����'�1�L�L�AF��F �JRBU�lM �&�wF~%�����F�������=�}S�en�/Y0`tr�jW�̀����
D��U@;c�J�(S/C����>pj��׽2�|P[h�$�&(V4KA�d�_#Gh5�"#�YK��JF:8�⬬����h`���LY%� ˍe`ߝ�_QRY��q�����E,&Ղ���k�r;�ZpI�&�iC���6
�m�$C�4����[݂.�Y��c�xrQe��a85���ּ���)dN^��pt���?6~�N�P����`,���3�=*���������C�[�^I��.�j��jA�R���BDx�d��!�9E�[�0gC8�\P�U�2�G�θb�=�Q����=:Hƭ������xf����)!켕�*U��BQ���Y��K�r)��jN�u��� ��G�2��_�N��2�溓Ϟ�^S�*���k�Q��OB��Wwm��ES���w�قj�0��(����3��
�u[)r�p�U60��r2��ϒ�-�7��ia�!�h�A��=x8P��y�T�K'�0�<:O�R2T@ZG�g¥�YQE|������_QW�?�.?}�]߭/�]^\\���      �   �  x�eT�n�0=�_1��c��oA���(�S/c��'�H�����#�(Nz�a���mZ/֋㞌�Ȏ�l烤��|0=�sO�[(J"�MjHy�J&�@�e���ud����G|HI����Lg9+9�8�?gF+-�S�$�C��b��E�X]·��dZz�3��o��d�˖Qf�9cP�VO2Fk�h��$�r�l�ҏl�<��ȃG�(:��~�*�1Pg��h�ͱ��,q�^W�Z<��j,��Wlݙ@8�h�2p<�[���J�D��
�*�����A	�98N�`~UZKo��k|����c:�tU-�tF8l�w�肢hJ�!۳8Ʋ�!�/,7�FN�N9M$�Y��-,�YmvW����3�n���~�j��7����f�y��'>pX�It6�bV�3�HrA]Q��ړ,H��جK�Y�'.����`-Fx8{��7���70�e�/�zy�rz�L+�^�R}����[/d�l�fk"!5���E��]v����]�P������w�;�0Ni�������z��mv�k�|��L��8�`|�)PP/���\= %l��S1�[6G�[��QC��]%~�Q\1%B���[��1��������[+JR�%>u)܁JI���g_b�����6%moW���%�E��0@ �$Kak|A�x`b��\L!��M��| &?�ۯn���T/�����j��      �      x������ � �      �   C  x�EU]��F|����Zi?����]�pu�"E���|� KZ���,�$����Ù!O�a���6�����/�)��D�ΕX����˴ę��.!C���2����[޽ơ�3�p�+��'�Ζ���/�:ɸđ<g蚾�9����ߚ�s��-5�u�҈�o [��bOF~7�r�a"�p�Q=ׅ��s�;�5;�0��u�?�2�?c*}x�5.w�M��y��Wܪa���J^�Zf$OÜgdIPx�9���)/7P�E @\SuLP�H��i���6�-�q�NJ��y#��5�'r<H��s�M��r�����E�VR�!=�<�j}��q���o4zT��).�j��?R�u��)��0ƍ,72͏�0��2��˼��v�׀���� ZQ�"ʃGG-B�By[���F�r��	`�Zy/�/kd"��2�� M�S�����S����}�3YǙ���G��aDnêf,F�?�5}ɉ?��,�).Õ0b�d1�2��d�b��`\�q��cd+�Z�}������ap��0�V}�i��5W��oX6c��H�|ś�`��+�����T��kN�;�v�@��tC�֒s�0g�
9�b6(��	�ċ�_����ץ5�X��N�E@�W\���j�� ��3_�������i�
�1��gh���=�Hߪ�4"�Q����{��B�� $�k#4M񁾡t�e%V�����g�8G�`P�T�jr���<m%dU�݉���"��Ž3Gt���b�Kp:�)q��
���D�`vW߇�+�������޸�s5u* �z��0>��-Ek�1BEhT�\ϖ�c��tt*��Ri�:�]שN|�
��AD��K�b!��~a�a*���Wl�m������!�ΗaKXw4AL��;��uM���pl4�/�Ώ����Vgwh�$V$(�a.�/�Q�4/�ہ�8:7>� M9��<eМ��s�,'�����ูx[���kZCV+�I�5�8������=�c�,K�w���`㕵�_/�;��gP߈a�I�����<���)�nŵŰ���=��?�������[�G      �   �  x�u�MS�@���Wx�:c�;���(�(�
�e23�ABL@���Zpkw˪���ߧ���1��"/���M7���q��{�E�tȬ
 H %�����$��?N�8zj^���_�hZ�?B�x����v;뽭Zw��[�n�[����ӿ2@|¡O!�G��\��"!�`�#��Q������.���iV�|��Xӌ_��c7~���kƷó]�v���s�K^렲4�7�i��U�,�p*X�|Hy !p
�K$N(���`�����C&%B�v`�D@/��y�#]U�m~��ݙ�E�o��frS��f�F��p_ɍ��싧���+�Y�d�sr8�3��cFM����_A�i��*�0�X��N.C?�
IN���S���;��6��K��g}K��]����1qf΢���2��W�W�eɫ(�h���L>��<h����,q����u������ sŕ��j��g�WGX�8�@A��{F��}��d      �      x������ � �      �      x���Ms�H�-:7�G���yg�-�e[���.��Y�L�h��$���[+�t�y�#�ꮎ(�Cۉ̽��Xk�JUm���wq_���v֕N{o�j��%���m�������u������{�������{��E�������?�eӿ������9�����߫����þ�V�+��_��/�֍���������^�d��>���}����{�TN��i'Da#\Ӷv����_m���i�B{�=�(m�l�Y��[��X��q��U��0F8�^Ƅ�gMP���Lx�w㴆�n�����4ʸ�����/l2�&L/���r�v�P��:W�|�X�d��!��>ԟ����J��i��e)m�r�-|2�����]^+�X�T�.��QB.�f>��r��}���k��J��6�mU� p�aF�?ǐ�b�S7<�7h���{�^J�hE2�������q�Z��8k��j�ݢ��͸^�i_�_i���Z�F��f���E;���e��c}ӅՈ��Uڶ��
�Q�H�.��Y���¦��,���9��lݥn�y�а`�����cv�m��|�����b�K9�s�R�K8|��W~�b��*���B�pi������W,Z��b��1��a=�������'ҋ6�����_�iq��m4���U�!�Y��a^���y���Rʵ�8��w��V酘��}\ON�0���'��m��ٔ�-|!f��-�-����n	PO���B`�?e!f�����P�f|x�:0�(~7�
`�ʗ3�aX���a�?V��R�1���J����܏�u���㡯�pYgU�n�Vi���i~����=����TΨ@���:�<�B̞�m�����B��CHW��N�"���B̞�.��P�s�L� �"+���
�\�|�ئ�[m��3#�����8o�Av�������0UC7��}W!Bq��҆ ]Ð�}�S�q>t�_W��V��΁����������Cj^_�a�w顴����[)��ek��2���=�o��9 �'�m��*��9��CJ8�b�o�V!165�}��^��ԹB0=� �";ҳ8&-.���^
��ť��盾{
�q�Bb�J��B���`o��H��1�[h����4��69��m^�i귈 �־B �U�t�D!9{λ0�M�f��c�t�`�n|i��,�]��i�CW#���6�V^^
�7�a�fwy5.���ۦ���ڕ�\�:�7Ax�jv�w��w�6�����2[C|i���>��&�t�W��a��x��Xٶ1ޚ�����u*d�Y$�k�n�q�[��q�a��_R>z�9� QE����P���mp�5{ɛ)>��T�aE�Y�CT�w���0'���]������D�a���g��V�4fW�% ���u�cV�X��KՋ�[�"6-��&{�y;n�>��C�c��RQ��J�й���I���^�iy�DO�q݅��y;?ۅ����q�ݮ��{�܉�@�ti���=���-�2���C��l�Ry�YO�-�g:'怴�߆au`�A|�U�*��nq�3���YЬ��q:"�3k��J핒={ͻc�w�8�W#��|'R�l�6����j̾��8M�8D�̧�D��B�FU��l��B��������k�j��ocRs�r��:����f��+�Lk�-�� |��w��{��[8�;:��3K�[���o���~����'�`ږn+�C#fv���q䖵��b�O��d�U �fv���a��?�n�,v rr���O�J�y3;���{��6H��X��o�t A�k�1~��n[`��/��� )/�-o�0:W�_:`���6���D��[� 8,L��O-����q��͉�nF�/bm�f���4u�q���&��"�%�Fi�e��¸�QVOL�xϩ[�\#��4��� ��+���C��܄�AL���LcJ�b��vv����c���>��ZK��dq#Z�څmO���+�b�g\Pƴ
�a��T^z��8�纰u��Х��q�U^iI��^�,���,2�ˈ�V��K\J8��Ǡ�U'�1 �}� yq`nڶ�	Wx�B98h�����q!�����a�]�i�/�D�����}��f���l�}dK�	�^U}��K<��w"��4"bjDD�s�W�Z#K(�Q<a\N�����w}u�q��>Ph?o���3#�8�0��O}�e7H×��]�s����Z�p��y z��S`.��*���(��x4�p��r�:�~��#c�T.5�s�� T-�ȷ"�����gxb�qL��R#q�̀W�w�q�D�n	��� jm��/���=珮��zsXwL�+ ޔ���U7��q���t�]�Ke$�M�W�(t#�g~��v;�dSX�ZT�mO�U�jj��W������n����=wC8V-���IQه�e�_���o;��[��X)�
pt����Kx\N��V���Qy��\aܭ�=��1���!l?�s��ӱ����88���͠0-�����1l��3Z	�Wx�A#�K����=N��=�w�!�O �!#k�LaSZ<T�����=ǉ	�3+z��VH ��& \˅Wypu@2��bź	���F��@O�����4R��6Yv�^�9����������nXN����@�T���	�8{�}?Vv����\`��F�&���T�F ݱ��L?*�+�/uk�ǧ������OqW	�y���������s�z<t\�M�.{�sX�` a;��^p 4�ˮ�:q��B�V����p�]�I�A#,����zLUnd`@���:h�;f?�uB*9����ƅPB���Z V����wQ�p���9$x@m�9W�x9sU3>w���L���څ{�0�K��.o��)��a9u��H��G�ң��m�r�M��2�.���%P&~�Y���_�s�ÝB�:��]�ǂ�`9�ȿJ�����"�ͩ{��>���1Ȍ�)=�����{�fF�Ǹ�ux ���w�P�c ���Rԏ�f�'�A�>Կ��8�*�0i���߈�B�w���vR'y5��$�Di����#�XK}`�6L�g�]t�n����Ό���u����o���r�an��V�F�N�ʹ� i�&N4<UF�t)\ᆔ��ϋ�=���kpӇ�n9N�keZ�4 �� }�ͬ�O���0N�5�0�6�GBL6i�G�j�0$3)����w���J�e���OC���ef�{Nq��a5.wXa�Q��%����䠷q��GD�#�s���p�t�$B��Ԡ��*Կ����sy������3!��&�rv��G��]�-����Ϯr�
7�R�.�?�FĄ��|��Cr��
XAtQ���DlP�ۺ�"9��������3��v ��ܠ�q��]��~\'Lh��Z�Da��1uz���>���aJU,�fHu���j35�c�� �?�Gze�m$�i��`ɀ�Ýq���i�h��bu�̌W8���	H��7�6�r �����4��O�=�6�u�R�����m�K���V�Oy�#����k�|��Y�'#D}�j��H��ߦN!P�iq���f� 3���Gv+��"�c�(MF��a��̠��8v�����n+���*ը�_� �W�0g��zwd+Zz]|�W�Szmf�Ɓ}�/����0	��V(��R����7��a"�ސ�u)wq�^hA�����ӱO�2��k����7��"9�S�=���I�4V�#���A��&p��f����f�[b��;n�7,�&dhRB(�뜈cC�H�:r���� ��R��)�iSD��K7ԟC_"�� /]̱d��_����w���a�x(F����i���$�z懡�:�i ���S9 H�52m(e�] ������Z�*ٔ��d0��S�b¦�?}���B/H���j*�O�$��L�힞bH٫�Adm��};kI�j3y�~\�����J�W�S������!w��;�Bt�7�HOjӃmK�]#�?3�a    ��w]\��,�)�,��Rp&s��B~�P�gE&��jY��8a-�� �x����l�ȯ|�u�Gi3�e�)DW!�R{=>�~WIcg�J`5u"SN"j����G���@�U�����y�����-��D�:� 9��~#o���2��w���N]��x�p퀺2o�KLU���vG8�AfR�ux�i�;�P����}�����p�g��2ܦ���ÊOǇ������K齜�^��2s���6���T��?�V]��P]��M#/-9�>���?��q���eI^]��y�|	f�y�����G24����4���2����1��a�(�1]ϖ�q,{f���>�S����{Bp�$�gCvh�����8���n ӴԠ�-�L��^�7w������v��8}��)Z��i������0�T�)$�/ı��P�:}����4�r�WOJ�� �㳕�B��k&}	��ߙ���ԙJ���,��@�U6J2��c���E�
���v��Ѿ������TH������B����YJ[��ȓ��ǃ��J�QT�*�18d��/�w��Os98"�Sk����X3w�z��2bȮ��-��iZ<O$A��D1�u�o��~����P��X�2�m��%L�S��+֤'__]�������C�Bׇ������7�OU���*�d�?FJ����a$��ܻ��/$��'3Y跤����i�NH[�A���Md��m�&8��[d�T���+=[械��D� �o�0M�jLo���F��1u����63�� -?�o�'��@�//X��\�$�ڍ����0N:����bn&g��2A���~u�VJ"^%K#m#fP��B�'��@��J+V�p3g�S����������5[وj�*�A6�v���S�Ky�p���u�G�������.N ���� �b�k`�0�4���um�
�=�#p�2�;BJy[��h�iY�l�wq�M�2��� ӝq��qTؖ8;�����7��G���+�^�iy�8�`iG�g��`����4>��j/&�zފ��3Y�S��~���Ԃ�� �)\b6��"�Y��#jwaX�綦t�ȶ��/��4c���4�t}6x�cȕL8
��]}�mWc��gC���j&�g�Зq�,�~ӭ����Xi�miC,I;~"%�4���6�8a �N\JF���hx�7�� X�;d�O�U2=}i�-I�Y�L�8�(��!�>H&.-Y`�u�J����?)��T��p��oi.���q�MX�t}�`�F��%U�
ʁ�y���z~��逻ٶ���(=�a!�7Ef��}�>�
����H�
_��j�O4}d!�\�R��PR�8y��&�S�`���~r:���8W�G�Kz!�:ұ��4\��m�����#O�~^�v\{�p��t1Sن��$!7av�M膹�������Zv�~V˅�졫8=�VP҃XO֙���8;9ս�:�UY��i|�L���t"���hCv�}��o�r�:���r4�Cz�2���0�ܳP���V�KUn�� ��}P�!Y�)������X�>J� 5tq�u�X�l�8=n���!��3-=fc4y �"�n���W�ݰ�Z$�Y���}��°P 2k�����_d�TE�l���T�w#�T|!�4���سr�Rȸ�	Ԟ��3I���}' �۪E�HQ�d�i��6���X�. w�i/��?{�mm�ڛa�Dm��K��Z-���F��_�J����9����#���Cq���[�����20"/� ��B��𸩔�"^_��z�
%�Q�S�t����ue�, gi)Rc��V�L���g}ZN�6NK8��C&�f�f�Џn�Ү������A�^c�I/m�5�����ǎ�����L|�$����d���y+W:�v{�?w�L��Q�U�^]z�)�I�1�N��m��Īu.�W� �ǚiC|����d��$.�o��.5jr��|E���i� ���8��c��(��Z��Z����,ֶ��QXa�K��#Ԩ�
,d�x)�:��ٴ!U��Ef�PC��s��(�y�=O�{.��U����*ߩ��t��%��iW��Uem�p�)~�3�"󇾌ˍ���ph�U����uUq�O��{=k�-ٷЪx� ���eN=���W��V)Y�[8J����u�Oaٞ�o�m���5��Q$s���1uP�8L��R:C�Uq#4�hf�Lq�i��:�N���SZ��8�Lno���z��&LT8�-�~J+�S+��J����㿐��$����TkYk*m��#����q^M��~O � Q�yji��ͅ��,tˢw}������X���-=qo<U�`E^3t�XP4xbi����n��c>Ѽch3w��g�s��
;���+�+(��{1{����,PH<u,g��2�G��Dro(�}wH��*�=�[Hp�4��"�����Xw�Ha��5�<)}���YB����	�j+)�Ehӗ�B�?'%�L���<DdB���1���q� Yr{O����,�C{���qW9�	�'Tz���aG����Mw)8.��=oB�-�UfqSE�a���m`�EkE�9w��jA&%�4��~����*�t:KW}m#S@�Z��1��3� ��Rq���т�دC!Ij7��Wp"1]~��1���.��uo��i�������-���,_�9M$-�Oq�}���PX��׈ObN�粒�4��$�W��e$�x�&n�	݄c�v�������������Y#�ƴ<��y��s9�6"?���RC��Mh5�i��;b��~{��\JVY�.�=|�� F88�L����v�\x4�OB�֔��5*V�̯�:{�?��b�u_����|`�ٜ�=����r��E�,�n����Ȳr��|}MI��JXM�ætń_��4��Rk��aHմJZ$���~��FXE�IB, 1��n��|������&P\�L��v���Ǵ��"-d��4s�0\�Bd���4�O�,�p*���~�ՊƳ���B�B�9o�|�� ���k��-�Ӟ�gX������1'�ڗ�ZB��mO���������һ�1�,����he�Л�V�;�'�9�Miu=+t���t!��~��8��S|������������Lə�H��&!%�����i�}�f��B�_�������H� c��L�&�5t�K��0=�#W��f���_��Ȝ�������b�~�Ǚq�Z�?
��"'�?�j�1��a�Q��i���!��1��yk�*p�z&�z琨nr.F�㜆#)y�����9�@��;>��j�s0V���*�VJR��YC�@៴��4 b�ȥ�?|�f&�'MkF���wWy�]�'�8���4\�i��4��,��1쏜���Rk\�[A� +���ۥ��?�� �:�ŏ�i�˙iCw��������K^H�����9o���4�����qu�m"����*��(<A�n�sd��v�.�/c%5�\�_jq�y;ZOl�IC����a9+HB�¯�K�D!�vg��G����:N���Z\��b��V�Њ_ԡݦ�CH���<u����7���0Ü������ၛ���Ք^(o[?��C��a�o��?+�����҃�V�ӆ<��6ɿ�8�=p�B ou�Ej�7�������f��+g�?�4�V�앙5t��⑵��<%��kYZ@�j�.df� �T�~�5��(��Or��z�(t�M�i�����È�A"�Gj8�^�
	�	+N=�}�3�C&Ȳ�M�w����O���'Q�ZA�C���Mpu�}�!9x+����5t�y0o~��1g#$���x[�ۍh��7��%緈���|e�.֤:NX~��
}b%�	��xN8�����T;r��g����nW!S���4��|��tN��3a��\%A($L�G�`�Vd��u��$N
��)��G�2?���qp������k��K4��$�Bf�@�K�qMWa�����V�]�0�4�>I���8���S�Ha��[�F)M;N�3I�    8PG�yrb�Q^�tW���	D��}����gi�ȭ+m0!��$�P_��& � t�MN�2���>\�M-"��ٰ�R���!��	.��X߮n��Ϯ9���n�³Y(O��.��8��s@�j��7T��N�DD1q�E�]Z�yVo�w��N\NX�%��8qb\��7ל<L�ÔH3R�P(�\ڃZ��H"N�3����X�+��B:U�4o�"z�(Dq��4���\�%3��R�Г�S����@jW�� ��x	��}(m�Y���ȵ.�������(n�ŉ��/���THV�}�ټ��'~�Xf�%�M�ܱ�|EA'�^|�z�Xs���l�Ú|�!�Aj]�H�J[� �ZX�W�υ[���I�a����\7���H�	�i�!Ά��u��\�]���$<�h��G|�C8P�� q.C�"��/x��Tϥ.�͠�(M��NK�גYD7}X��6���	��7$��( ��*�Gt�J5�?�1F
X��g�:����Qd%�g��G�nS��źK%H�O�	�g��C�{r�����1p[���	|�̙�ň��Ct?!ƿ�8��VJ��F=�y����Xߎ�V�����m*.e�����=���9����ٽT����By���D$�t�;��@m3�C|.狃.G#N	<�{cMB}j'��K��9^I?3��l�U���NǊ�<ב?�h3~1��^�����elqY�:6Vef��"��
q}��6m@�벥��r(%3��-�ᶋ/�!V��D�(J2Z��Nӝ��b����~�lw'E�ҁ�`�L)z��'��^����d�1�ui�k�VӖ��se.�i'T�E���[�]��H�uJ��Y��<���8�9�W�0�?�7�HT��w[�P���b�M�!���+d����Ч/q)��eX�"'>F�	 ��1 M;�~>ʖ���Bi�(�ǚ�E"IT�	��6��cx<���*Au�����K��Kc��?��O�x:*���a�NF��S����m4�jv
'��~�&�d�_kj��8�rd
�K�B�o%BZb��j����]}c�O��V_��s�4���aX�w��q�Q �R����h[��M"����}��+%m]��6�GS\+l� bf�y��	��O�*IM$h��*�@c�1Lv�)����Rd+a(FA�SiKػ�%����s|S;�֥g���,�́$M�v��@�����k)�T��X��#t�:�k�,]Or���X&;��ۇ�T���\m*����s���m���:%A����DX�4���C�
��̮�3,&�ٟ�i�V
Yb�{!(o��(�����LBl�j'�
���9����axBH'����JQe���Pk!��6��aW'�3��`=\���w,)��ag�ɢRZ��k��i��
�0�Ђ���n�v\#		���遳H�k\��p9�+J�agD���7I����*��:J��o��u��ڇ�l���i�C�*��j��@:�Hbg�i��/�{+��6������"Q�a���C�w�o��b7U-� �@
�{a�g	����Ͱ���<���/%�v���3f�y���"��~V�")9L�J�t�\��]�u�P�!�V}L�o�kI�f�D�I"��ه~8P7��m�s��<�Ս�T����94��gq�1����ri�����1��I;�7%n&NS�_xA�SZr�����@G�����ا�'9����_�B�0#��〔$Էc�H��0�,ܯq���q���>�Uę7��O��mq����`j�f���v���5$�5Dh�,=���f�G�q=n���q_y/('Ӕ^#��h8&�\.�L��{w[��ʷ,ϗ��8%�+:;�G<��#W�!gv�]12��J����M�H�g<��vO��;Xt�U�iPڕ���ġ��8��Y�U*m��w+�=�1�0�3�Ǵ��u���0�h%� ���s�N�x�W�Y}���g��t`QH]y�'�:�M}�{yo�J��s�#�XH?��y�պ~�D�ZW�6O�x����>@�>L��s78��QX�\��}ފ�r��g'��u�R�C��幆E��WS�q?{�kI�����<�:�S�:�Z@��`� wF�
��f��_J+��)P�x���{^OH��o�Z�" �S���6R�j����܍����Pڶ���9���F�����MX.þÕ�^��U�ڒTG��k���?��܀��9'ş�W�TU3;��;����&��Y�O-tiV�3lr�fv��Ǜi�}�������ޘWr��i7i��1���$*Sz��q&m��ʸ�zD����)���+o��H��1f7�u���~؆G"�R֬ɖ��u���Q~�X_���Oce5uФ�Tm��IX���v��oS��o!c[�n@�KK�;�{Ä�S�(҃��gj�S��_L���1ئi0��(ӵ���*��}����./�g9{!�gq�'6��t-�miq_G&"���+�9�������h�WK�J�4���m+������b,�/�Y���0'�߱���o�"�)m�5B��ҥO�H?���z���]ݳ�v��[�(���
����)�c�)��nGA�KS�Of9ܪ���8�H~�'�0j�b�)��_N@	��USL���~JuZU�c:�`C{��ͼޭB���B|s�w�:0�0*f��uͱ���^+�Og�.-- R�2�)��*'�^�D�mKGQvc௄��'` 	�#�x�@>^�m�� +2��|ҏ�����|S:��$����=�
��|��!ý����Wbv���ui�8l*�Cr٥�ݜ�����N�ۇaG)��~��Z������]��ĉ�����Di���"g�>��~� ��TU���@K#+������|^9~l�~^� �ua
�o�����1�7�$Ĳ�����޲��4��`?�� )��B���)FS�p*��z�aCƚ��@�n}{��	�Z��Ȗ���X������D9|��u�u7�0�9I灁Mi?���G��գ�إ幀�
`����V���cI�����K6��K�p�-r�x�������J��LN(m�S��)G�Ⲿ~��#��nYz��{�7��|�����V�)���������sv���	��=�<8����z��5��d����M�<��m�R�����홫S
Ę���|#,�����?��⮾���Tq}�ӥ��F:�tD�\^��V���v,npI�fp��]UJ��v��|��#�5�B��ς��̉��%�N}���TqI����`��<��m^oC�=<�C����@�)�SFLv�R���m�v�]���i���R���=�U��Ϭ\��oo�^BҪ�h��i ��F���w�%|ꆁt�_ja��[Dl�懺�g��>��ce�?��R�� �G@�$����Zk��҂��K�@��$-Tf}'�������>r�Wq�iKwJa�w 7�>�1l�s��y�l��,M��N�L �%�>�u�u"�QCI�^��[��f
ћ�2N���9l�viK�e��5��ݤ���-��=���4,�a�)Dq�$=��p��3�����Ϯj���jE��17�ė�C,:�RJ|w�<v�๖~���,�e��;8�#G���葚Y���G!X]����=?s��M�0�HS���g��U��ؤ��<_ٯcʬ/�N��Y���k�	Dw�p���!� U3�r˜�I`��7�&�лզ�"�k�4����^��2�����Q7i޸b��p>��Y$�$��C�%����a�(=B��(���',M�}����J�¨�= /���s�Y�n"��*!褜*���4Ef�MR�qxHL�V��(��J\||�L�>����x�yP��y]>�'wpؙ3��R�L��F��q�4���K�������0���͖�V������?�X��L�=�/q_	��.�Ŷ�?6�`A��q�/֬7�詹��U�u�����L��r��B#J����V    ��F��2S��d7Do�]ʍ�㠇ӗ�H:k�jG�2_�e�i����m��o�/�U�9���Bo��۰��i;R{E:%���e�<��X�-��{�jR��/�s�/P�AP�Fe���C�Q�m��Is:�B᥁�B�M#��q��mXd8)���"Ж�ޜj���\�w�e�޴�2"ݦk�KVQ?��"�8c���q�uLel�rxg�~zf	}���>��c�(�ŉ��t� 4w�%����)�I���Ap���#6�D������]<N�q���#m�j�>���,uX��g 5�Jˠ#X����A_{�)��6��Z�����_�{�*��l��C4'����7�?�8}�yA�SxA��RJ�ZO�tmJ�ay�\52�`b�D���/�'�V�VX��x�g6�U��a�m�A8z��Ö^��5�fT�}��1#��c�\dr� 
^j�y3R�OZH�"~����%�֗&UzӶ�U��B��c��hU�W��<Аy@wa ��Z��Z�����Z���EC����T�w7��w��Mc�"Q��,�� �0�偗����vɾ-G�7,Jx�V�K���i~} ��u7��
@\�m[�>`8��Йtu�8s�a:��ڭ~V\?d�<,�z BЎ�/�3�z�Ө��T��Y ~+N��/�o�%Ǵ�@z.%p�nX�:ؑ�z�1����B��Vz�7�Lp�0�ͻ�.dQ~�ҏ|�_��z����}z�~<P�a�����egH�-�E䭕�Gf	�7�C"� 7%�k]æU[���O+aHn���0��xH:����S�+jT`�ɝ��q����Mx��X!`������IDWX����������*F
��������%�t��BW2�a�aZ�w~�I��F�W#f�!v��m�My��PVi<�4t&}�Ð�!����u�uc��a���7>���C��=_w�j�!#A-M�^H�|���vۮ��+̚�=�
^��ś1T؁/oOR�S*#]��sv�$Ϊ��N��/�$jf�m8٭d����*-���n-��i>�'���wO�k#��C��H	Ff���S��|81�Y��ݥ`���A�/,ɹ�8 wQ�=R~�U�D^��--A	'	K:��~�"Oħ�ޭ�!�J���V�Њ/c�2�z��c	��,�ŧ�)�5�y��{�4��0C�8��}X'-J`/�ʲ�8iC+�`3�=���3��=�\.�d���TЙ@t�q�.�ni���/+D#�L�C�O�A�ԇ�6�y
��=+Z���+��]t�p�2���-�E�m �6d�:�9w��3G��4�ң�p��w���T���~Õ�� z��]��	�-m�����G�v3���ʧ�\RUV|�6 w�Nd�mX��o5i�	E	v�i
_
*�Ј�����U�pCj������� ���,��q0m��{'2���H9m�6�h�R�-)�B;0$1f��@��zo���1��=��n�|�nÚs��|��+lRd��E��S�e�jM���ZV��&h��L�:��XS�;xr����)+NJ+�v|&�����M�ǝ�-RJ6��- �p"a�L�^��K���Ѕq�)���!NK���y�3�6	m�=w��-�L�dc/u �}R���#��Նck�~;'pR��={� A5s��,�-�W�HY|�o][��H+����V�
蚋
~t�j��Kn�Q����f�4�7:S����y�QuqɃ��0�Z剷2��[W�jx2��F)��+�|�g�}���Yy���ZY�vH�2�a����Ț�_���ݐHD��"�(�CEҺЙE�q�> ���X�+@?��EY&������1[��*���ߔ� �W:3��^�yH)m��2ٲCJ0Br��B�V�S���H%5$$$2�K�L�=	߸ЙA�9�o�UW��#��\:c�±p��C�8����<.f�A����Tͅ2�D���h��n� �%��RM��G8�pz�¼�n����-�DS<-�z6A�gW�=G+���'HF�r�h����ԡox�T�C��2ˡ��,�Y�C���Co^b�]��*�)h���V��𲁻<��`Į���2"v {k˜���RT��'��֟�v]���rylk|�����,�9����57W����VV��V���+zZ@�]&$f'��Y��b+'�ېnE����s�guo�;"�~�Ɨ��%�aDF�1�޼���a��4 H�UY�mZ�-`�ʘ�c��yWyn0�b�|�- ��Y�L����]r�1Et"<_v����;�<�w�\-��b{/�_N�������w��Lx�,,:?F+\��d*E���[���an�'�З"��&�Z0:��譎���{��w˩[?�
�o��������dVћ�S�� ;}�8FEa@��(�[�!mjkf^�m�C}5n���0�p�d�ς?%�B���3��^91�9�|�I�!��-�̢�F܍��&���X����p/��k�´�ñ~?��L��7�i�wj ���좛�d��a8��
�V�����0"�,�q�=�����/(�(�Z��Lt�H����HDt�xo��/՝x㱾���֌S�Y��)��2��iV>}�o��[�w��x�`au�3������*�Fc����lY��gZ���)k?��Q�F�Y� d#��3�8-�v]���HƩb=�Q��t�f�n�=3��C�^�i��&m�@�g�K�񌢾���܈�)�о&N�k\_��Ҏ���$��>����:L�d��B�� �ۀ
��|���+D1�gl�
X���Z��_�;�Q�w1�w5pSB�aSU˝r�4�[�u���G�e�0�m������L0���6(H�	�O����d��f���6���Y�z~NK]��Q��P�0,�����!619�?��ݾR��;6Jg%�SO�����6m�H�@��5�c:Ճ�2��>e$�b\R\�8!$����4(�	Fi���j����!��CX�ʊ!�
����1�N�ȷiY�f+���z>��<	s�Od��0=�)jA7���a-B�?�2Ð����V	+J�dԳ[�L1zdU���[=с��}�GV_z
�"�D0���aN�ގ� �7J���R����|����/]��v�Y	���m
3��Z�4q��e����1 ��֐X�1L�!l����%N���B7�"e��i�l��2�����������k��H�JC<��+�F�����-[������:�9���e�q��q�~��f�.�m@+�g�iE�c7l�~�W���-���^�ݹC3,B6̰��W���e�^�2_+m���9E��o��N�*CZ�We%`����!��@R���kpD�b��m����dBчq9uӭ#<�T~�x���03��;�F��y�82e��(}�.x��R�'�5L���ZD��[Q$esqZ>4��^#+MGA ��{+��~�E�A�X�E�uH�YF+n�54S�ޏT��?E����8����(�Ú�p�l9�#����qo��T└6�=,L{R���C}{\M��������~�����dB	M�>�k��?$�X6�����tގ֤���Я�,Nk�ɯ�,e�g�R2��MZ�FA����H���u�����n#����������aG�	�U�.-�%��k��h�;=܌�-kI��/�OH�������h��T��$x`m˥���/S�<Ӊ޼���/1$9_c��R��u���ODJU�oQ7������܊��Gᴤ&Ǔݦ�r��S7k?88O �d)|�(��s����)T������8-I���'A8��� ��*]�;�Ơ�>3��S�m�s�>?EV,�.���F��6�Ot�����r>�Y��L�.�v���Vo��D�mݟfџ�@"��z)�y�,��Ȋ�aH��<�E]�^lm�����=s�ns]���q���F	9�P�9�"�+ތ,�HFƼ����\<�ma�3�A�?�qک1p䁭��9URt��NY��N;���rdJ��?n�5�K��M    ���4���ζDe��)\в�@a�@`�K�rJI��~G�J8�&�Ք��E&f�y�Ħo���[m"�{����na,��f��wH���Y7�䫔6�ۧ`B�V�X�;ĉEgA/!E��X4B�`�/��ܭ�v{J>���ZU���ru9�2J�.���U���B�+�!'^g����)l�~V���\n�j+�˥7&�>� ���'���di!d���}���d�[��S|��s����υ�T���/$�M�u��5g��j��+���%g�a�_;4�W��Gr��`Dq��8SMG�OPw����o�Eh.kYMx Z��x�qar��[�@��4��)��v���d��MXv���K�(R�pSZ�$L� �T'�BGj߷>����yg�H/B�f�МVq��Z^�ȑA��YE	��1��5��/?M�ݞ�]����ظ
AԙK���� \�'��DSx�u�"�����p>o��C�����)�7���j��t廥�:�Չ<��%o��n�*8Q�#җ��}#�ц_#�LV��;�㴣�;Sm�(
+��5�=�7ǁ̺�7¹�4��U�x��֡�
Z�q�a�GJ��]^J���I��Ҋ�P&���0Q 	��G���n��'¦.l�wa�}"�����)m�ǉ6ԭ�rVe�4Z\��u�R؆��L��z���ʚr�/�yP�o4��n��nޡ�NZ$��_�xz�{�c��"��q�}EʸE�/��$��[�m�Kb�;^�4g�bEjR*o�3,|L:i��%��.�4��>m�^��4��-5h�9ml[S��\�&Ui�N��@��C�\/9��2�+M[�)�����d���T3�n+n���!�_*5��R3]����?6ݞC�;' ��.�����&���x�p<�؅��1]-�i�>`Cn�#a��6�n��q�!���]L��i��5�\�w�R'��0��xT���C(3��*D�>Idw�K��0��䤺X�������-���x��\ຮ}x��@�.�)�h�q'v�2_�:���귗�	��9�.|-K�D�O§8P ^jA�ҋɀ�7Aj��d��'D�0Ppp��8잺ʋ��yl�9�֨�5Nd!���	����k�8���3hhƯu��	�3%�� 8�0�f�20��g�s�q\�S��?�¹p��@�� 8o���z��z.���n���l$pxit������B���
(�����c���keeti�U`ĉh����V�X��!.�E>{+lӴna2a�k�7�����8_eY� �L�2�Gz��$��~��m�=󴂗V���Z�]��ć0�b{qϛ ����\��f��~�z����ř��1Cz&
}�v����Mx%S�K�*]���<��.�Ǿ{x�F�S\[Vv�
���'!s��1�#�䗔�S"
~�4γ���+���HN���B�d*Gt�m��4k-a�)[��$W{<QtAԷ��{y��Xz�d�7S����$DsN�+q����[N`ïmDi;?G�yo�D�~�Y+��Y1�\�oa�!����VF!)��r�pm��<�w�~E��0,'���.��6�Ū��L�߻��cJ�f�rga�n����"�+O{
���q�����f�U�=EIqZ"r{����-;"�JH�6C)L�|�34"	��A��kW�*��7��d�:=��g�}\?�d�R��������p�A�)�5��{���C�?V\�#H�*J�KGa�o���["_	2�Kq�!,)�5)9nYHV�!	f݌��8�n#ZS���d�6��d�9�S�TD��6�q�h��}����R��i732¬ҥ)S��R��Br�{���զ�8d`ŕnZn���B��m�;V��"1~�+E��%���`�lb
� �p\��Q�G�͐�<Z�mi���#��C�z���n���ID+.����Y�Jf\�9�P���I���o��a��3?���7Ǥ�� Ʌ/�ɛFX��L[���+���㎢B�FʋQ0�ۀG�a~_� �E�Jk��U������͜��ո\��q���a<<n*s�kJ�)��2f�y�)���0�	�7�.U����Э�����Q'�G�	� �bkLΟ���T����F�׏}�mP�� K�1�Ja�HEv��?�Qշ+Ē�tS�4H���T�<��q��°�v�@��}z($�8dd�q���މ�]���w�?�ȋ^;V�6�Da�!�V���G�����\���S�/}V�Ua~}���>G��WV9%�}K�s���6���b�X�D�Z� yK��E�=Ί�}�V�"�gL�t��0�D�J�h�0V̮�)�/��i�o�柾X#�IN��&����=��0��2�'!����������ޑqz����:a.%�~�/Èك~� ���cR!�F!)�Q-"*�����w�+bM�s�(&К�b���0;,9;��ا����ǿ\Ջ�T7H��5���'w��`o��~޻��Yx�$��Z�k��u��:tO�f�w\~D�`Y��͝l��dv��o�~��î~�\����_�fJK#��B�'g7z��Tg�]ǴT�6�R�������f�oo3*G�"X��T%��!��<�ɓ���.���%��@��K^� +�wU���֜9�H�P�ږC�gOwC��c϶6�G҃���ݴ��GA,�i��_Ҍ�f��� ���ݚ���Λ�@
Ǯ�)­�^�61���a�_����J;����p�"��+���p�)���n�1��JXq1TLC�G����A���y�ٟ��2i�p|�D��(��_څQ� F�£ p��B�輐�RA��H�1;�+��b}��K{���;*}+����:�@}������XM��Ғ[R�$��3�\���S\s�۸K�?^���B��C��!l�#9��W.5�v���}^S
��<<��<�r����P�m�{��;��p�����r]��.����X=�ͻn�;r� p���q���y���>N^s�WW�/��ʶJ^��q�;@:0�ˏ�m�:@b�Rܲ�`��zv�7������sj�.��(��m�=��\Ϲ>�� ˘���>o>��eϙ���w�nJ�J����i�"ܔi,2q�n�<�w�-����2����n���Y&<0��ͥ�g�nS��d��v�sfڎ�2�J��X���Fp��]%�%U�w����*����N鶕ЀpUF�z�!ian�;eqo�u�����n����&t�)���~�Қ0�X!�m�ҴGi����'�i�Ѽ���Q���%Ǒ�5raMn��_��m����hH-]�^x�U��g8���Bu;N\^֜���
��6���v�}};���G$g��-W[{��Ú_cܿ��~s�X�a%��Fma �ά8=�>rE��=<T@���֔��#�H�Z�+����K׊�Ս���
O�iU.��I�7٠��q��_��r�
*<��s�z#��[�q.��I�K�|�}�ƴ<��{ޅ�j�N�j���OMb�Z{B�C|A(;�����z��^� 3<���e3VO��Wp�Xi���,N�����N{��r�b�/9�����4��M�b��� .����)���ID{15���
NJ��o~�ݞE��6�qW� �-￭��u�߼ߌ�J��\��H��_�*��<މ�9;��>����#;WN���/,r;3��˓J}�$��a��3V����8䳔���^;W��3diM�n�Ff$K�����v����Y5���2�p�G�pρ6{�=�np��3����0�3���w&��n�i�vV��֙�?��i$�.{α�m"I핕��
��^Jf�m�&�l�cF�i:l�[�Tm��$9��Ϟ���0,����8��� 9��5��3��b�y��Wp>���5�Cv���g����(F���M����Gaݶ���g.�]m�~VW��B���7A�y���9z|��N�S����wY��p�ӝq��8�2-��R�c��K��7�5̏}�q��c�3��i��H�����>3-��|�>?� �
��ba    ���R��fP7��v��d�4�/�.�yE�$��.�[X��4R��[�6]�GJrB�^6�����=�*YP��#�F�(W�����è����ff���aW�Mpߣ,^�����TufK����F[V��-=.� Z�p�:���=0�p� sa����(�7���-f�y=��ǁ$"j5񕶗Rq>w#$�s���C�t�Ӿc��Ix�_��Z}�$dCem�0{L.��?��}���[�\!����F�����µ��뼭�/�,}-� �t�D�$����s?/�F��*ݍ��[�L"b��O@~�8��n��4ZR%�p��'H�,��D� ���I<� �`#�0��J&�W���>�����Y�(�a ��~������q8Rl��i`V��C Fx�1�����c�i���><U|�.���?�͋�� ��ą�Sx+�Z�����z�C��
N�t`�c��_r���M[\?K��+����c��㞂��e��pZ�p���e��ڬH�~�d������
S�/�N�K�%���ıt0k�50$3�n��&���&΋�v�5�$����HtCh�9�E*��8JO�x�9w��Պq�=}OrR 齷~������6��o���.W##+����3��D�$�*ۏ]G�@��^L����Z�_f
їn�����d�"���x����@
�k1;��qyDԿ�!!d�y)]���J�$��E0�Z�K�4��rUi�)��]�}��6Oc�� �iJ�l"�����9Dې��3�϶�aiL�<F�S�~ a��&LO����J�gKW�ا����@�=.��S��߻%�7hK�<#_�?E5z�w�iD�T-�y�s�r�W���)�Z�H�,�H���mX�p{4�nIf��<���P-�Y�}�\º�8����T�y�e��ID�iU��a���BZ/%7P��m� ��s�EƁ����(�kyC�p����v�Ct�Nr����N�j��	��ʸ���L���#��z��1H���݅�t�6���F4��Mb��
�Kޛ�]BɁvD�]��S�^I<T^�^������"lhOœ0Է�j�q���k���S��aD���obϙ�/@���0<rpQ�ե�Ĥ2���C�?����:Za�T9*����INt#�f����q��z�(��I������ޟ� �3�%���qI���iN��5�E�eJ��><Zi� �g�U?��P��!��(F�\z�Tj�|� �&�OJ���a�O��J�FP���ԔL�>'"��z�7��4U��-���E�`D�	}ꞟ��=�MR�jw1����/p)2K�[� $b9u(�w�OJg!�d=�pj���]��}إ�wC�K-)8Y�)���6>?�E�.ƞ�&�Di�%��l�����ߖ�q�J8\��)�Q�
 k8o���ܸ��߸E��ևh�)��IVp�2[�K���n_�4��9�*KoJ��1�z�1�f=N� ��n]y$(F��sC�t��L��&�}}7(r1P�������ۑ�1]&�'�5�ؑ���+})���o�x�p�:t�w��|�>s��hY�(�p�bP��!
s��1�e��y�Ѱ҉�A��, ��S��n�|}n�i2_-��a�3q��n�E���gHB�AזN`�^�Q�@o���X�J�fo�K�ȭs�7DB��?���F��Q�s�ZΜF�� ����Dʶ���/��5�2b��o��M�?�=��R��%!�Ҷ D�Pr�h�x"����z�h9��k�W^-9�0�缈�8�����E�U�+�V�ð�D�Rqm}�*O�!/�A����@]�B��VL����ZI��F�|q#M�e��uZz?�㞼d�-nmima�s�"Ӈ>�}G�|�q5n�k]i�e��.3�� G��Q~<�Z�x�J >B���k���S�AE�w�����oX��8ǉC�~���k�|��EVIbFLO�4n�o���NP��e��]��g�Na�q�Y�)�KvHQ�+3i�s7��~�P�pj+�΋ҏ�)�~���,�Yq�c�s^��Q�~�>m�2u����۸�C*�4���a�|a�	t&���׸�"9�T�(5QZ���j��0�꛱_o��Zz�@*-�� �$f�_4�8u�#%��I*�Y��؎��w�3ӆ��7�Bݲ�k��ڮ�7j%��;�»ٍ\v}.C�A���H��8ݦ]ı#ww2ͯ�s���������D@\����9Ǒ�YZ���q7�/�!\���I�����������>���:����U��	�#�Z�2M>���Ai�æ������N��(��7����W���	a��'r��UJ\ٜp��� Ց\Q�d���̭2Q�H�5���'����-�k�䡴���l�m\͌��3CdPM�\_�$G�s�cg���C�=���C�pT8-w�=�S&�2a�|��.;|Y_��}�9�b��L�.UU���f���6#%�Mm��-�tI�0�`�}HH��85dW.K�*'�;�(��D�s>�����RU�Q��ST1u@Ι�C3���qݤ�J��̮���r�!C�>������J�^�4O�l�\���>�8��$?���O��a��P9������sD�����%X����Es2l(Q�ȡ�-���JI�i��
fdN���\f�k������W-��`#f�1�OǾx7�4qڬ*N�M�S�j�/����p&Ƒ)��X�`a�]���&?�pV�^\
C�4�t%�D�Cq{�6��$|m�;8n���!+�C�������E�܈�J�\je}:��i���o�D�3%]��	���74�& ���$7�+|��u�N|3T�/=��LG�{���~-�2"LX C���A�]����ƝksҎJ���!��:3]@;K��Z��V��M�b<����4�}?��(kù:�����0��Bר���nǾ%ڒ86H/8Pƒ�"���::m��[��4��=f���"���7\c���D׳�:� ���	��R�,2�5i����_$z��ʋ �"�BF]'x�穡�jU*�*�J��Q�EȀ�����<>�Y>�R�&���'0�/D�u$�ø�A2ʄ�k"|5�^|�7��.vŏ��a�V��('��f�4�Ud��u���;���!ו�h�W�qWR�"�O���$L���:������c�x���mG��#�ݑ��-L� ����\9����֠"��QS���,�����Uw���_
�B��J�~�7�@�w�;��P3�p�r���/B�
]5�>ᦨ/�
8"��I戢%�g�
��l~��x��2���\چ��8�����<~�UO=���v�Z.�{�p%t==E��o�Y3�E�N�>S)$�$t۴��gV����ߗ��Q�Җ H �_pB͑���߆.�$lE�W;^�L��q$��H�S[o+��[�Z���z���c"��n��u7���X�{RϦ���ţn �g�w��%��Ő.�We/BF
]81n���`S����UZ^��1q�Lm����c�fA�Y:
La��w�Kgs�^	�JF�Xʋ?US+���������v��F�ډ/���JE&Dj���;������V�6����NqCu��'�\��7)�[�nf��M�m��D	Sg���Қ���%Ғف��<�o�ɵu� ��f����}3b���_��p�$��A�g#�:mq1;����p�q�f�J{
�I��5��2t�ʤ�Ks�+�u��y���	o8K�h_�������i�4)�Q�g�P���ˊÑ�!���J#)��82`�3�!6��cڏCr�[�#7��R�mNxӧ�Q��rؐ�~�֐7d��]��R|j�GB4<�w�x#��Q�e�����mA"�7��>[�~�l`s3#�>�H��nlPU��I�/Ǹ���;#�~�a�M�squ���m�W�FK��j��W���:�������}\)|gl��-Ј�#h���dX��0�*��H������O�iކC�fشS�֍
jWq�d��m� =  ��`�Ă�d��D�Q1^z��4��]T3�f(.�u��~1�C�.�t�E1��:�ʨ�x���s;����55N�w�w\`�R�&�2���,�Bi�p.F��7աf�:c�;��>�}�:(�.�P<7�l�7���*����h��;NDZ$L#��G�}j_����S�G�T������}i���e�>�w.1�fq.�P�V�WZ�$��5���bJ�ɽ��t�A�i#��MȰ!�i�6Uj5LďŁe�#���̰�w��˾MڼH��GN$�פ�V�3\����t$�8�5���&���vX�*��?ġ��&�����s�N��jv2�ΰ#��H&0����J;d�ʉoRz�
���A<��S�=F
�ﴩ�t.�q3�ܛ�$�	_G8�.ڮ�L�ʉ�$t(yF�g#U���~VY��5�:mE�86�8�˧&�h����>Ck������[�ݨ��f3�m�_)8q�}B�7K(��ɓ�ڶ�k��
��D�R�^�4E����<4}q��\CV��:�(��Q�T�����޶f������	FF��w���8Ūyq�P��K�2�Y� ���gDݬ_�V8�P8��t��[̾�o��)nr�[61!�j�+!�暶�2��c;��]q3��W�
Ewe��F���tce�m��B�U��<EbȻ��8͛)��;�x|.>�]z$�6�+-|=)�T�mf��ʬ����Q��'�Ġn��73�N����yލ�.�i9��n��21M���{�F��7�ʗL��� o.̨���f���x[���CS��c}��YܷMbBtp�+������s�ʞ������r1��.ҌR��,���Dk�X�����D����EZR2��?v��t��|�.�*UQ���K��5٬BF��5G��%� �uQ}��t-�nP��g<�;��Ñ[�-��N��E�C�����ߜ8�	vCXEm�S%�=,��B�����H]��:B�j+NLc�,0Mȍ�q�7�C[�5�O=��Mo�=WL;}�"�!�~\&�?��?W�)����2҈e����ϋ���jKR�      �      x��]�rI�=�"m֧�}��l�,�Ivizl.A d3��I dA_?�4�e�E�$QU`�����{��(��^)}g���}nnoyܷ����V����R�O���v���_��N��o�[8�v��������;��������B��~}!�ž�妌BK��I�Һ��_�����+�Z()L�1���y˾y��q[�[���_�Ji���.�):'��V���_u��ܶ�������Ҹ�_(-�)Ym���M����q�YU��k*�g��Rk�]ׇ2���<��<��J�Ne���zi\�H�]�����u�	Qǅr"*k���Dq>���s闯eWW����B�4�����y�\�����l*咂U��c�~��{|_�{_c`7i�:�*��ǽڷ����.|]������1�'x�o�26��_yW����h%�I::�qѕ�-���\�ð}ƹ����O�-�Q����m��c]9�wz��0�)���yux-�y>tu]`H�c��Z��x��-}�����0�5�xHN�@h����J���M�u�rS���V��u�HR����06��~S��[Ϝ~\�Ba|
V+�x�����׶�k��uud�:
�b�J�h�e�m]���m9�O�|�r����PI*�Z<�����a_��Ġq��
H!�@K����ܮ���Ԫ����0J �����v�%������v�����^��R��\����}[���O�g�����TcRI��pj�-�ẏ~?�Ψ')����E'TD�.ø.P���� @u�L٥�qB�࢖&*qU�U��~�0vX�J]����qa����2$%��5SE_�|q���V='�*
B�������6�GD�qx�m��'� � ��
`�]�wC�|�>w��a{D��I"����9� n|� ̞Dω��V
V탶�ӷ��5__K�U�&9� ��Z%�h	.O=Eջ���e�`�bT�H��-⸤�ą�����ս`A���F� ᥵K����.痚�qRւ�N+Y-��B���ֳ�u�р���<��N\�y�F����<�q]��,��z DxE�L�l��v��{���ځ���������p��UnG⍪y'�h��<#@���VmWC�������ו���!��I�9�f%.��6�s����e@���I�uԀ�f�T�n��hl�U)�S& �C%
��'���z�]s��.ou����p��F�\��S�-���۞�t�d�_�S�d����.V�<��GX���Z�R�&��d@|��ɛ3|Oe��`���);�.�$<�e�0��{|[�0�F�R��ZZ	��)����q{�Ɯ,��ǅ�yo������-�|�a��|�^ۺ"i���E��K2i�U�eI����ʆ���q	�F��MLV\����?��?Rc��K桒�N<��
�k=�j[�^y�R�����Ks3|�u��\�� ��R�%w��f<���Ǫ�9G ���`| �P����x�U�M���ǅ� ;|@�t�y��G��<����=���_x'\r�[E�����=����=u�yF$�� ,k#��AI���綹;������(p̓ЈPӅwe��}s�Ǳeְ��>
��I>��{�c�<VF���+� ��_��K��}y{�:uL�;/kq���k�	����a8">4�á[��I�rQ�w�J0�*!<�PFd�,�П���I�T�
�w$ŧ���\�X�w
���"a��JIGt��m��ЗS�f��b%��"Xh�O����]w:�s�䩳JY�NXfv|�҈۲o���K�])�me۱Zh��������<tX�ۡ���@̠��A�����Ɋ���m�@j�:�Q�ـ���S����ޯON��DB���������1��驪����/m����p�Q
륋�z�A���m�׎6H��Y�`�!V��~��/mUU��|�����h!���$>u��c���6oW�.ɚ(9����B;�����۴���߫�W��,�!*�O� ��mW��g����xbx8��0	��P��.�՘��/�c�m]�q*�F/ 䭇8R�/c�����~8�ǺEtp�/�v`G���9��;8��ы��3����`�y����n��s΃u�n'>�h�r��c׵��-�>�9q��HRD� qN�������+�s�������r`�d���׆��6Du,�Y$-X�
L������C�̶\��,�^)��u ^_HCK��v'%��ܐ�C5�ࠢ�A|)���Ox��0�P5����װz�]sU��x,����Id��{���ϵOc���+�]�;�A���0eU$d	|�߷��S?��)ǁB,ಏ@]&&�{�:}/����p���<�'��
:��ĮxT�y�\u����ꅒ@����8�-��>�}}�d�uI����X�N��\�c�{��+���2�;ʨ��xڔ�y8��e��*���8��E�>�z+��ƶk.��+3�Ɖj�#���e��U�5�>�Q���� ��3F�O��Tܔ��onq�K�#�<������&w,�Z�.#�S`��0t�	�+HXvp�O��q^����='Xb�J��[閛�S�q�KD��=�$�֓"O�78�]sƂԶ�RHpC)%��S"��:�+8�m>yp����)��6"���a���lꂞ�YB��㦝C�@��g�������e��P��";� <����0�����%�7%׍��6�!���`"غÎ5����ڞ��aN$��x���8FC ��a���ϵs=��m@� ��6%g��/��K����e]W#{U)��+�gd�����n̊��$\w�
�#��&�?�_Y�4UѰ��%�`�[������9��I7[k�L��>�q�|.߿W�t�����>"N �+qG786�˱r���u����0�]+Y���p�q���r���k��Td�N��B�d�Q���Â��9	��&�6��|�|���PlU�,l�K{L� �����$|-�Cf�le�A����W�[�=��t��n��jg\!4.:;��f)�:�ʟ�֮C��<1vv�~%��ٖ]��_�w�ʩ�����)�N�'br�sf��CYqfE�bPu�������ć��v��8�^^����Y�Z'/U�R����U�4la�U�u� q��1��>Z�,[�ӷ�]S^>#��X2k��o[�Ӂ�u�^�A�8�X�o��9��)-�y7얛S3�919��i����O��L�ݟzRĜ�p�x^A8?��a��#�o�Տ�� Mp��HΧ9�ͷ�]o��jI��3�EO!KJ����X���˼�O���'`f���b(�8q;�UT�}�u�Xᴠ�����q\@dy[ش�<'>3���h�Tpn���q�H? ��]�� f���aE��@���/?��YVӕʇf&�c�H��:��[��O����Ukp��\Y9-�� ���Jp�PP[�@��K�I>8��s��*���u_�ȇ�9QC.�:���5Q5G�te��Da,��a�I|})4�ۼݖ����s�	�g���]���<#`a���g��I�]�,�vo�[_���U٘�w@ΐ�LGK��O!c���-���r����4�*�i�tk]�ȗ��}�i*B�b�5�;D2���:2x�3�	�c�[�=yhN H���N���J-ɟo;�������ek����D�
nш��˱y�'(6gD�%Q��xIz���g���_���[]�8�;�s�D|W)���n��O^>'��Z���F��B�P�4 �rض}��n����@�J�bp8�o��G���]�zpH�8 �
�q�Fy��>7e���͓^�`ᦽ:Z|�	��ų�e�we�����<��0L|%{� Ѫ���<��ۦn�� n jxì8[.�=.���z�=�MizCp� �P�D��ƈχ��k�9���.�(� ��D0V3���&�p��ж��
��4k/�� !  �f!�d���6��_��.i���LA褍��� ~d@�w�Թ�9q�)���C�!)���O�X7	�K|(��� �|V������9�%(�BЀAɢ	zD�x��(4�Y�䔉6�t�М��5R��aǇ���n��l��Zx�����%_v��v|-}�:���6��@��L���i��1������qU`%�-K�@?&Z��ͪ�z��̑Y {��Eá�AO���o���C�����g��grJ���1/cs�֭K�0��"�L�`��6�^�]���\�{�[�X�"n�����q�d�5��X���[/����4�qJ&�!�9�ϧ/@�ӎ|�c���Fɮ�#��8u1��nXa�@��I)�70&Z�n�u{�<��*;�#� ����X�vj���B�h�1��ډ��Gc������r-�����Z쟯N��߆�U�r�����ft��7� ��_@x�d"��n�Z��9n��5[�@0��8���<�����r��an!N��,~w�d��l�a6hܝ���Id��-ӯ&���M�������y8�u���["��%���ʈ��k-�ǡnv�!�"�%�h����/��mf#�M��uŽ��5&���hO �F�}sy�[�i�Ƶw��g�(�]��9�P%+`�:�7�4Nާy [U�����-k�[�hg&n����K-���
Q<�?"�K���a�k�{[�T��x4 'uQs�>qv0�~��\�iBD�HQpH�a7���������ĮgN(�	ʈ�d���������y]�u�-�sql������,K��4$vT���9X��cڀг�>�������CJ�E$��Â���]L��>v�?t1|�O��4'N� ����²m����<�V���q	Z�Qa�M@�ƶyܔ7֖T��Iy��P6��|�Aܵ;�f?���	� u��x��m$�lr��{�
8���S׺�ܮ�lH��m�!�	>M��=7���!��U������pnK��#:U�sqCWwИ�O&	�"͝U�U�m��� ?����l�K>:�im���I�}s�v�1�}�oVJ8֎J�^�/-;��a��ӧ���m����@��8G|h��oy|>���``��V �^& V/㱹����v���D��Y+'�L^¨�OD@g�s޵��u����"&I�Ek:�ץ���t��E���DlaV�|�����?�֕��7��Uԍ��4���4/]�]Q�T�OЀ���/�<$@��ø��~�,�@��)˺�y��~}^��v��2B�V,�c[�vZL�M3\����W]k1�o��XM����ˮ}y��� ����,[cg�����8�fٞ|�ל<��z����V���瀛�XZ��$�li�fCp���ب��>�����"I=U����J�m��M����x�MZ3F����b\XǙ�j.�Z���e����I��HG����)钷�!��i�z��e�}Ѧ�42Er�F�9_��m�Ϋd��v�d� k�ɈO,�9�m嶢d}�3�#\`8w ��@�������4�����#��)���`��qY���$�c8��'r�Eqѻ�*W��h%��Թ��������*����\��/%�j������y�9��}~�\��>D��c�a�1�G���yձ?��g�Z�H�	80���I1��(���f� 5�5��q7�!��c��M����ei�T���������|�8}��@�$+l�/��tӼ-�Cs=|����e���`J�F���&,?����o�׺O��*P(-�bD�	q9t/�g��i�aey"3��w�l��YK����q?�m��4������{/d���[�
�?��R�-. �Z'�$j�(��v`��������7�(�C
o᧓	�����a\�Cs>֛�K7|Tv� �P�K븼�z W���lf[�F2e��ʙ�W�&�A�����\Bu;R,�t`irD֥�x8<à?ھ����S�,���H��={����l!�[Uy��.C{��u9���Ӻ�
n�sZx�}R���.���K�2qv~)���IX��e��=�x�om�l> �ǂ���s�7<��~�_��h-�7��䢓��b|�%/���P�b��u�1{jgF&#@k����~?�z��<<p�9�켈�q|�7 �u���m��-��� �X5�@4����7e<���9۱.�0:DibR\�g>�@�n[�$��UE{)��T�ʀ��w�(�~]w�t�~��l���-j�gK���6=Vn��LS�@�r�A����41՛<��<)5wf�y�HDȈ�i�x�9�8/�r��9����Fs (r;Ѿm�������o���-��c���e���}C,�*��1PALEӦ���ՁsK�7�w�����ި�d����L(�T�p�Z�9Q1 �|�gQ�� 7e�5���\��: v1���Nؑ@5ʴи2 3�N8� �j5G��.�l\��?���9yX�y���p�Ӊ#'~�t��v�\��$��#�� �s��f�\�/����0V>�$��
w�E)����?��r�>W6g8D�26��Z�2�Vo8hH4u{�/�r�6z&+%�^��/�7����N>�e���;����X�a5ǉ����'���|�F��@\���O$)�aK��m�n+��HIӮ�`GF
\�$����X!Wm/
�x���9?אB#v!���._O?�iN96�T**�d/p�7�L"�_P_2'��*�"'�;"����TͶzk~����<��>Ac:��[�PN�>7��"�P��Đct�F��[��vW7������\����A\��̸>���R���).�Ր"$�5.�e	�|\�N�mN 1�y\p��Iq��C�|=6W��G"Θ�3�N����"3�i�����S�9���'�DOh�R���2N�7Cwꉚs��5mi�w w��P�X ����P�V��xD����S421�������~x{��/(��O�hX�XDƭdD����_��؞zXۜ<���,���@�)�j�K���_���z�ar")9��+ӴZ�D{��ܽ��&po��F�݈O�e�F�}>�ו�4�RGA��-�����z�&t'�D��Hs���� Px�ItР��ms��o�Ǫr��ܢ	��S3��so�9�a_{�:�9q�Oi�E���D�9�����6`yN쯬���$5��T��q�q��~��9i���FHʜ,���6O�jU�H�ss/�1�
�^�]<��9�9�`]wW#a��<V"/S҈b���?�ce�y'�m����#�ϡ�f�d7��� �������kw��?s)�$b�0�!�΍k��t���]�k�H 2�`u�Q�{�HL�g��ڏ���~X��� *��x���`��*�5A`�VBG�Y?��Wc��rs��R{���J��ӰP�e��N�8�����h����2���b%��O�3Z��~B����������\-��K(�����!�_� ����
a�S��WI���i�g�8�7i�O9k; ��T�@ cA/�����;)�     