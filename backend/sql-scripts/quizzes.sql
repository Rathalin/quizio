select q.title "Quiz", q.description "Description", qe.title "Question", a.title "Answer", a.is_correct "Correct"
from quizzes q
join questions qe
  on qe.quiz_id = q.id
join answers a
  on a.question_id = qe.id;