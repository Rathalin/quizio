SELECT 
  q.title, 
  q.description_text, 
  qn.title, 
  qn.description_text, 
  a.title, 
  a.is_correct
FROM quiz q
JOIN question qn
  ON q.id = qn.quiz_id
JOIN answer a
  ON qn.id = a.question_id
WHERE q.uuid = '4e5492e4-136e-42bc-9d16-075e3819efe8';