CREATE TABLE IF NOT EXISTS venues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  outdoor_courts INTEGER NOT NULL DEFAULT 0 CHECK (outdoor_courts >= 0),
  indoor_courts INTEGER NOT NULL DEFAULT 0 CHECK (indoor_courts >= 0),
  covered_courts INTEGER NOT NULL DEFAULT 0 CHECK (covered_courts >= 0),
  total_courts INTEGER NOT NULL CHECK (
    total_courts = outdoor_courts + indoor_courts + covered_courts
  ),
  booking_note TEXT,
  source_label TEXT NOT NULL,
  source_updated_on DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (name, address)
);

CREATE INDEX IF NOT EXISTS idx_venues_area ON venues (area);
CREATE INDEX IF NOT EXISTS idx_venues_name ON venues (name);
