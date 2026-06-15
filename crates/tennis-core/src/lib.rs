pub mod personalities;
pub mod questions;
pub mod scorer;

use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

/// Return all 16 quiz questions as a JS array of objects.
#[wasm_bindgen]
pub fn get_questions() -> JsValue {
    to_value(&questions::get_questions()).expect("serialize questions")
}

/// Calculate the weapon personality result from a JSON array of answer chars.
#[wasm_bindgen]
pub fn calculate_result(answers_json: &str) -> JsValue {
    let answers: Vec<char> = serde_json::from_str(answers_json).unwrap_or_default();
    let result = scorer::calculate_result(&answers);
    to_value(&result.as_str()).expect("serialize result")
}

/// Return personality info for the given key (e.g. "SHIELD").
#[wasm_bindgen]
pub fn get_personality_info(key: &str) -> JsValue {
    let info = personalities::get_info(key);
    to_value(&info).expect("serialize personality info")
}
