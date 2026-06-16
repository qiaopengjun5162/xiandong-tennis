use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Debug)]
pub enum Answer {
    A,
    B,
    C,
    D,
}

impl TryFrom<char> for Answer {
    type Error = ();

    fn try_from(value: char) -> Result<Self, Self::Error> {
        match value {
            'A' | 'a' => Ok(Answer::A),
            'B' | 'b' => Ok(Answer::B),
            'C' | 'c' => Ok(Answer::C),
            'D' | 'd' => Ok(Answer::D),
            _ => Err(()),
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Debug)]
pub enum Personality {
    Shield,
    Hammer,
    Dagger,
    Potato,
    SwissKnife,
    ChainMace,
    Lance,
    Katana,
}

impl Personality {
    pub fn as_str(&self) -> &'static str {
        match self {
            Personality::Shield => "SHIELD",
            Personality::Hammer => "HAMMER",
            Personality::Dagger => "DAGGER",
            Personality::Potato => "POTATO",
            Personality::SwissKnife => "SWISS_KNIFE",
            Personality::ChainMace => "CHAIN_MACE",
            Personality::Lance => "LANCE",
            Personality::Katana => "KATANA",
        }
    }
}

/// Score answers and map to a personality.
///
/// Business rules (as defined by the product team):
/// 1. If one answer dominates by >= 2 votes, that single trait wins outright.
/// 2. Otherwise, the top two answers form a "combination" personality:
///    A+B = SwissKnife, B+C = ChainMace, C+D = Lance, A+D = Katana.
/// 3. Any uncovered tie (e.g. A+C, B+D) falls back to the last question's
///    answer as a tie-breaker, defaulting to Potato if even that is missing.
pub fn calculate_result(answers: &[char]) -> Personality {
    let mut counts: HashMap<Answer, usize> = HashMap::new();
    for &ans in answers {
        if let Ok(a) = Answer::try_from(ans) {
            *counts.entry(a).or_insert(0) += 1;
        }
    }

    let a = counts.get(&Answer::A).copied().unwrap_or(0);
    let b = counts.get(&Answer::B).copied().unwrap_or(0);
    let c = counts.get(&Answer::C).copied().unwrap_or(0);
    let d = counts.get(&Answer::D).copied().unwrap_or(0);

    let mut scores = [('A', a), ('B', b), ('C', c), ('D', d)];
    scores.sort_by_key(|x| std::cmp::Reverse(x.1));

    let first = scores[0];
    let second = scores[1];

    // >= 2 margin: a clear dominant trait, no need for combination logic.
    if first.1 - second.1 >= 2 {
        match first.0 {
            'A' => Personality::Shield,
            'B' => Personality::Hammer,
            'C' => Personality::Dagger,
            _ => Personality::Potato,
        }
    } else {
        // Tie case: sort the top two letters so the match arms are stable
        // regardless of which letter happened to be first in the sorted scores.
        let mut top_two = [first.0, second.0];
        top_two.sort();
        match (top_two[0], top_two[1]) {
            ('A', 'B') => Personality::SwissKnife,
            ('B', 'C') => Personality::ChainMace,
            ('C', 'D') => Personality::Lance,
            ('A', 'D') => Personality::Katana,
            // Uncovered ties (A+C, B+D) have no defined combination personality,
            // so we break the tie by looking at the user's final answer.
            _ => fallback_by_last_question(answers),
        }
    }
}

fn fallback_by_last_question(answers: &[char]) -> Personality {
    answers
        .last()
        .and_then(|&c| Answer::try_from(c).ok())
        .map(|a| match a {
            Answer::A => Personality::Shield,
            Answer::B => Personality::Hammer,
            Answer::C => Personality::Dagger,
            Answer::D => Personality::Potato,
        })
        .unwrap_or(Personality::Potato)
}
