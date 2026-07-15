-- Add unique constraint on menus.location to prevent duplicate menus
ALTER TABLE menus ADD CONSTRAINT uq_menus_location UNIQUE (location);
