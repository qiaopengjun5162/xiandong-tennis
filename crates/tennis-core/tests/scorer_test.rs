use xiandong_tennis_core::scorer::{calculate_result, Personality};

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
    let answers = [vec!['A'; 8], vec!['B'; 8]].concat();
    assert_eq!(calculate_result(&answers), Personality::SwissKnife);
}

#[test]
fn test_tie_bc_chain_mace() {
    let answers = [vec!['B'; 8], vec!['C'; 8]].concat();
    assert_eq!(calculate_result(&answers), Personality::ChainMace);
}

#[test]
fn test_tie_cd_lance() {
    let answers = [vec!['C'; 8], vec!['D'; 8]].concat();
    assert_eq!(calculate_result(&answers), Personality::Lance);
}

#[test]
fn test_tie_ad_katana() {
    let answers = [vec!['A'; 8], vec!['D'; 8]].concat();
    assert_eq!(calculate_result(&answers), Personality::Katana);
}

#[test]
fn test_clear_margin_a_wins() {
    let answers = vec![
        'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'D', 'D',
    ];
    assert_eq!(calculate_result(&answers), Personality::Shield);
}
