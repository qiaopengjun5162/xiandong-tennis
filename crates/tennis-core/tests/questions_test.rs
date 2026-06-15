use xiandong_tennis_core::questions::get_questions;

#[test]
fn test_question_count() {
    let questions = get_questions();
    assert_eq!(questions.len(), 16);
}

#[test]
fn test_each_question_has_four_options() {
    for q in get_questions() {
        assert_eq!(q.options.len(), 4);
    }
}
