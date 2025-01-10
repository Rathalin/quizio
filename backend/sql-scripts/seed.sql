BEGIN;

DELETE FROM user_account;
INSERT INTO user_account(username, password_hash, password_salt, is_confirmed, is_blocked)
VALUES('Rathalin', 'example_hash', 'example_salt', TRUE, FALSE);
INSERT INTO user_account(username, password_hash, password_salt, is_confirmed, is_blocked)
VALUES('petro_zwackel', 'example_hash', 'example_salt', TRUE, TRUE);


COMMIT;