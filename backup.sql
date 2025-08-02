--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: budget_category; Type: TYPE; Schema: public; Owner: archiapp
--

CREATE TYPE public.budget_category AS ENUM (
    'MATERIALS',
    'LABOR',
    'EQUIPMENT',
    'PERMITS',
    'OVERHEAD',
    'OTHER'
);


ALTER TYPE public.budget_category OWNER TO archiapp;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: archiapp
--

CREATE TYPE public.notification_type AS ENUM (
    'COMMENT_CREATED',
    'TASK_ASSIGNED',
    'PHASE_COMPLETED',
    'PROJECT_UPDATED'
);


ALTER TYPE public.notification_type OWNER TO archiapp;

--
-- Name: phase_status; Type: TYPE; Schema: public; Owner: archiapp
--

CREATE TYPE public.phase_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.phase_status OWNER TO archiapp;

--
-- Name: priority; Type: TYPE; Schema: public; Owner: archiapp
--

CREATE TYPE public.priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public.priority OWNER TO archiapp;

--
-- Name: project_status; Type: TYPE; Schema: public; Owner: archiapp
--

CREATE TYPE public.project_status AS ENUM (
    'PLANNING',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.project_status OWNER TO archiapp;

--
-- Name: task_status; Type: TYPE; Schema: public; Owner: archiapp
--

CREATE TYPE public.task_status AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED'
);


ALTER TYPE public.task_status OWNER TO archiapp;

--
-- Name: user_roles; Type: TYPE; Schema: public; Owner: archiapp
--

CREATE TYPE public.user_roles AS ENUM (
    'CLIENT',
    'STAFF',
    'ADMIN'
);


ALTER TYPE public.user_roles OWNER TO archiapp;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO archiapp;

--
-- Name: auth_tokens; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.auth_tokens (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.auth_tokens OWNER TO archiapp;

--
-- Name: budget_lines; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.budget_lines (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    "amountCents" integer NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    "phaseId" text NOT NULL,
    category public.budget_category DEFAULT 'OTHER'::public.budget_category NOT NULL,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.budget_lines OWNER TO archiapp;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.comments (
    id text NOT NULL,
    body text NOT NULL,
    "projectId" text NOT NULL,
    "authorId" text NOT NULL,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.comments OWNER TO archiapp;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.documents (
    id text NOT NULL,
    key text NOT NULL,
    filename text NOT NULL,
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    "projectId" text NOT NULL,
    "uploadedBy" text NOT NULL,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO archiapp;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public.notification_type NOT NULL,
    payload jsonb NOT NULL,
    "readAt" timestamp(3) without time zone,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO archiapp;

--
-- Name: phases; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.phases (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    status public.phase_status DEFAULT 'PENDING'::public.phase_status NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "projectId" text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.phases OWNER TO archiapp;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.projects (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    status public.project_status DEFAULT 'PLANNING'::public.project_status NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    budget integer,
    "clientId" text NOT NULL,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.projects OWNER TO archiapp;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status public.task_status DEFAULT 'TODO'::public.task_status NOT NULL,
    priority public.priority DEFAULT 'MEDIUM'::public.priority NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "phaseId" text NOT NULL,
    "assigneeId" text,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tasks OWNER TO archiapp;

--
-- Name: users; Type: TABLE; Schema: public; Owner: archiapp
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    role public.user_roles DEFAULT 'CLIENT'::public.user_roles NOT NULL,
    "created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO archiapp;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bd9ddbe2-7703-4a35-9723-45d9a4e364c7	fb99239f016e4e096bad2278c5b6923a6301e4f53f7f10eac6594360e0d5a4ba	2025-07-03 22:03:06.66881+02	20250703200306_setup_database	\N	\N	2025-07-03 22:03:06.639579+02	1
\.


--
-- Data for Name: auth_tokens; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.auth_tokens (id, token, "userId", "expiresAt", "usedAt", "created_at") FROM stdin;
\.


--
-- Data for Name: budget_lines; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.budget_lines (id, label, description, "amountCents", currency, "phaseId", category, "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.comments (id, body, "projectId", "authorId", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.documents (id, key, filename, "mimeType", size, "projectId", "uploadedBy", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.notifications (id, "userId", type, payload, "readAt", "created_at") FROM stdin;
\.


--
-- Data for Name: phases; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.phases (id, name, description, status, "startDate", "endDate", "projectId", "order", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.projects (id, name, description, status, "startDate", "endDate", budget, "clientId", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.tasks (id, title, description, status, priority, "dueDate", "phaseId", "assigneeId", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: archiapp
--

COPY public.users (id, email, role, "created_at", "updated_at") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: auth_tokens auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (id);


--
-- Name: budget_lines budget_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: phases phases_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT phases_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: auth_tokens_token_key; Type: INDEX; Schema: public; Owner: archiapp
--

CREATE UNIQUE INDEX auth_tokens_token_key ON public.auth_tokens USING btree (token);


--
-- Name: documents_key_key; Type: INDEX; Schema: public; Owner: archiapp
--

CREATE UNIQUE INDEX documents_key_key ON public.documents USING btree (key);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: archiapp
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: auth_tokens auth_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT "auth_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: budget_lines budget_lines_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT "budget_lines_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public.phases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: phases phases_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "phases_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: archiapp
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public.phases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

