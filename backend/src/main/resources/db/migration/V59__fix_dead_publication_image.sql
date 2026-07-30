-- V59: Fix dead Unsplash image URL in publications seed data.
--      photo-1542601906897-ecd311b5bf3b was deleted from Unsplash and returns 404.
--      Replaced with photo-1500382017468-9049fed747ef (dry farmland / soil — same theme).
UPDATE publications
SET    cover_image_url = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop',
       updated_at      = CURRENT_TIMESTAMP
WHERE  cover_image_url = 'https://images.unsplash.com/photo-1542601906897-ecd311b5bf3b?q=80&w=400&auto=format&fit=crop';
