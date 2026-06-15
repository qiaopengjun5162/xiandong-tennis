use xiandong_tennis_core::scorer::{calculate_result, Answer, Personality};

#[test]
fn test_single_winner_a() {
    let answers = vec!['A'; 16];
    assert_eq!(calculate_result(&answers), Personality::Shield);
}

#[test]
fn test_single_winner_b() {
    let answers = vec!['B'; 16];
    assert_eq!(calculate_result(&answers), Personality::Hammer);
}

#[test]
fn test_single_winner_c() {
    let answers = vec!['C'; 16];
    assert_eq!(calculate_result(&answers), Personality::Dagger);
}

#[test]
fn test_single_winner_d() {
    let answers = vec!['D'; 16];
    assert_eq!(calculate_result(&answers), Personality::Potato);
}

#[test]
fn test_tie_ab_swiss_knife() {
    let mut answers = Vec::new();
    for _ in 0..8 { answers.push('A'); }
    for _ in 0..8 { answers.push('B'); }
    assert_eq!(calculate_result(&answers), Personality::SwissKnife);
}

#[test]
fn test_tie_bc_chain_mace() {
    let mut answers = Vec::new();
    for _ in 0..8 { answers.push('B'); }
    for _ in 0..8 { answers.push('C'); }
    assert_eq!(calculate_result(&answers), Personality::ChainMace);
}

#[test]
fn test_tie_cd_lance() {
    let mut answers = Vec::new();
    for _ in 0..8 { answers.push('C'); }
    for _ in 0..8 { answers.push('D'); }
    assert_eq!(calculate_result(&answers), Personality::Lance);
}

#[test]
fn test_tie_ad_katana() {
    let mut answers = Vec::new();
    for _ in 0..8 { answers.push('A'); }
    for _ in 0..8 { answers.push('D'); }
    assert_eq!(calculate_result(&answers), Personality::Katana);
}

#[test]
fn test_clear_margin_a_wins() {
    let answers = vec!['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'D', 'D'];
    assert_eq!(calculate_result(&answers), Personality::Shield);
}
