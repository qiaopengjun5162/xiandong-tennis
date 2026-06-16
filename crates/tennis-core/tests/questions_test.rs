use xiandong_tennis_core::questions::get_questions;
use xiandong_tennis_core::scorer::Answer;

#[test]
fn test_question_count() {
    let questions = get_questions();
    assert_eq!(questions.len(), 16);
}

#[test]
fn test_each_question_has_four_options() {
    for q in get_questions() {
        assert_eq!(
            q.options.len(),
            4,
            "question {} should have 4 options",
            q.id
        );
    }
}

#[test]
fn test_question_ids_are_sequential() {
    let questions = get_questions();
    for (i, q) in questions.iter().enumerate() {
        assert_eq!(
            q.id,
            i + 1,
            "question id should be sequential starting from 1"
        );
    }
}

#[test]
fn test_all_questions_have_non_empty_text() {
    for q in get_questions() {
        assert!(
            !q.text.is_empty(),
            "question {} should have non-empty text",
            q.id
        );
    }
}

#[test]
fn test_all_options_have_non_empty_text() {
    for q in get_questions() {
        for (text, _) in &q.options {
            assert!(
                !text.is_empty(),
                "question {} should have non-empty option text",
                q.id
            );
        }
    }
}

#[test]
fn test_option_answers_are_a_b_c_d() {
    let expected = [Answer::A, Answer::B, Answer::C, Answer::D];
    for q in get_questions() {
        for (i, (_, answer)) in q.options.iter().enumerate() {
            assert_eq!(
                *answer, expected[i],
                "question {} option {} should map to {:?}",
                q.id, i, expected[i]
            );
        }
    }
}
