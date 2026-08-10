-- Personal meeting rooms.
--
-- A "Personal Meeting ID" is modelled as an ordinary meeting whose join code is
-- permanent, rather than as a new column on the user in another service. That
-- means the existing /api/meetings/join/{joinCode} flow resolves it with no
-- special case and no cross-service lookup.
--
-- The flag exists so the room can be found for its owner and kept out of their
-- normal meeting list, where a permanent row would otherwise look like clutter.

ALTER TABLE meetings ADD COLUMN is_personal BOOLEAN NOT NULL DEFAULT false;

-- One personal room per host.
CREATE UNIQUE INDEX uq_meetings_personal_host
    ON meetings (host_id) WHERE is_personal;
