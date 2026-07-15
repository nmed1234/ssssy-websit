CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(550) NOT NULL UNIQUE,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(500),
    location_url VARCHAR(1000),
    event_type VARCHAR(50),
    organizer VARCHAR(500),
    featured_image VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_published ON events(is_published);
CREATE INDEX idx_events_type ON events(event_type);

CREATE TABLE job_vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    slug VARCHAR(550) NOT NULL UNIQUE,
    description TEXT,
    requirements TEXT,
    location VARCHAR(500),
    job_type VARCHAR(50),
    department VARCHAR(200),
    deadline DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_vacancies_published ON job_vacancies(is_published);
CREATE INDEX idx_job_vacancies_deadline ON job_vacancies(deadline);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_vacancy_id UUID NOT NULL REFERENCES job_vacancies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone VARCHAR(50),
    cover_letter TEXT,
    cv_file_path VARCHAR(500),
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_applications_vacancy ON job_applications(job_vacancy_id);
CREATE INDEX idx_job_applications_email ON job_applications(email);

CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(320) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_submissions_read ON contact_submissions(is_read);
