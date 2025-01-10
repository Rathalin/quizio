BEGIN;

-- Delete existing data
DELETE FROM alert;
DELETE FROM play_protocol_entry;
DELETE FROM answer;
DELETE FROM question;
DELETE FROM quiz;
DELETE FROM user_account;

-- Insert into user_account
INSERT INTO user_account(id, username, password_hash, password_salt, is_confirmed, is_blocked)
VALUES 
    (1, 'Rathalin', 'example_hash1', 'example_salt1', TRUE, FALSE),
    (2, 'petro_zwackel', 'example_hash2', 'example_salt2', TRUE, TRUE),
    (3, 'quiz_master', 'example_hash3', 'example_salt3', TRUE, FALSE);

-- Insert into quiz
INSERT INTO quiz(id, uuid, title, description_text, is_published, image_url, user_account_id)
VALUES 
    (1, 'c1508211-6aab-4090-8727-94de0d40c808', 'Science Quiz', 'Test your science knowledge.', TRUE, NULL, 1),
    (2, 'ba25a87d-da9f-4a8c-93f3-faeabd1f58c7', 'History Quiz', 'How well do you know history?', FALSE, NULL, 2),
    (3, 'aa996a5c-df86-4fbe-bbb2-64d86930920d', 'General Knowledge', 'A quiz for everyone!', TRUE, NULL, 1);

-- Insert into question
INSERT INTO question(id, title, description_text, image_url, explanation, explanation_image_url, quiz_id)
VALUES 
    (1, 'What is the chemical symbol for water?', 'A basic science question.', NULL, 'H2O is the chemical formula for water.', NULL, 1),
    (2, 'Who was the first president of the USA?', 'History question.', NULL, 'George Washington was the first president.', NULL, 2),
    (3, 'What is the capital of France?', 'General knowledge.', NULL, 'Paris is the capital city of France.', NULL, 3);

-- Insert into answer
INSERT INTO answer(id, title, description_text, image_url, is_correct, question_id)
VALUES 
    (1, 'H2O', 'The chemical formula for water.', NULL, TRUE, 1),
    (2, 'O2', 'The chemical formula for oxygen.', NULL, FALSE, 1),
    (3, 'George Washington', 'First president of the USA.', NULL, TRUE, 2),
    (4, 'Abraham Lincoln', '16th president of the USA.', NULL, FALSE, 2),
    (5, 'Paris', 'Capital city of France.', NULL, TRUE, 3),
    (6, 'Berlin', 'Capital city of Germany.', NULL, FALSE, 3);

-- Insert into play_protocol_entry
INSERT INTO play_protocol_entry(quiz_id, user_account_id)
VALUES 
    (1, 1),
    (2, 2),
    (3, NULL); -- Anonymous play

-- Insert into alert
INSERT INTO alert(markdown_content, severity, image_url, image_size, is_active)
VALUES 
    ('**System Maintenance**: Scheduled maintenance at 10 PM.', 'INFO', NULL, 'medium', TRUE),
    ('**High Load Warning**: Some services may be slow.', 'WARNING', NULL, NULL, TRUE);

COMMIT;
