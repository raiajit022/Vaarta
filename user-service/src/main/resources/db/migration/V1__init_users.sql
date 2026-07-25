CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    organization VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
