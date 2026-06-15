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

    let mut scores = vec![('A', a), ('B', b), ('C', c), ('D', d)];
    scores.sort_by(|x, y| y.1.cmp(&x.1));

    let first = scores[0];
    let second = scores[1];

    if first.1 - second.1 >= 2 {
        match first.0 {
            'A' => Personality::Shield,
            'B' => Personality::Hammer,
            'C' => Personality::Dagger,
            _ => Personality::Potato,
        }
    } else {
        let mut top_two = vec![first.0, second.0];
        top_two.sort();
        match (top_two[0], top_two[1]) {
            ('A', 'B') => Personality::SwissKnife,
            ('B', 'C') => Personality::ChainMace,
            ('C', 'D') => Personality::Lance,
            ('A', 'D') => Personality::Katana,
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
