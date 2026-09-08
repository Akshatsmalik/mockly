import unittest

from app.services.questions import format_question


class QuestionFormattingTests(unittest.TestCase):
    def test_preserves_question_metadata_and_test_cases(self):
        question = format_question({
            "id": "42", "title": "Example", "topic": "Arrays", "difficulty": "Easy",
            "question": "Solve it", "examples": ["Input: x = 1", "Output: 1"],
            "constraints": ["x >= 1"], "parsed_test_cases": [{"input": "x = 1", "output": "1"}],
        })
        self.assertEqual(question["id"], 42)
        self.assertEqual(question["topic"], "Arrays")
        self.assertEqual(question["test_cases"][0]["output"], "1")


if __name__ == "__main__":
    unittest.main()
