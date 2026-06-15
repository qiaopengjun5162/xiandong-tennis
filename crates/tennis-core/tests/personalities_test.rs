use xiandong_tennis_core::personalities::get_info;

#[test]
fn test_all_personalities_exist() {
    let keys = ["SHIELD", "HAMMER", "DAGGER", "POTATO", "SWISS_KNIFE", "CHAIN_MACE", "LANCE", "KATANA"];
    for key in keys {
        assert!(get_info(key).is_some(), "missing personality: {}", key);
    }
}

#[test]
fn test_unknown_personality_returns_none() {
    assert!(get_info("UNKNOWN").is_none());
}
