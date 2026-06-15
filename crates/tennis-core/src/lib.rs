pub mod personalities;
pub mod questions;
pub mod scorer;

use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

/// Return all 16 quiz questions as a JS array of objects.
///
/// Uses a JSON string because the WASM boundary is cheapest as a string
/// (the frontend already serializes form state to JSON before calling).
#[wasm_bindgen]
pub fn get_questions() -> JsValue {
    // Static data baked in at compile time; serialization is infallible.
    to_value(&questions::get_questions()).expect("serialize questions")
}

/// Calculate the weapon personality result from a JSON array of answer chars.
///
/// Accepts a JSON string because the frontend sends the whole answer array
/// as a single JSON string across the WASM boundary.
#[wasm_bindgen]
pub fn calculate_result(answers_json: &str) -> JsValue {
    // Empty or malformed input silently yields an empty Vec, which later
    // falls through to the default personality (Potato) — acceptable UX
    // because the user simply hasn't answered any questions yet.
    let answers: Vec<char> = serde_json::from_str(answers_json).unwrap_or_default();
    let result = scorer::calculate_result(&answers);
    // Result is a static string slice; serialization cannot fail.
    to_value(&result.as_str()).expect("serialize result")
}

/// Return personality info for the given key (e.g. "SHIELD").
///
/// Returns `null` in JS when the key is unknown so the frontend can show
/// a generic placeholder instead of crashing.
#[wasm_bindgen]
pub fn get_personality_info(key: &str) -> JsValue {
    let info = personalities::get_info(key);
    // Static data baked in at compile time; serialization is infallible.
    to_value(&info).expect("serialize personality info")
}
