use crate::scorer::Answer;
use serde::Serialize;

#[derive(Clone, Serialize, Debug, PartialEq)]
pub struct Question {
    pub id: usize,
    pub text: &'static str,
    pub options: [(&'static str, Answer); 4],
}

pub fn get_questions() -> Vec<Question> {
    vec![
        Question {
            id: 1,
            text: "当你看到对手站在网前，你第一反应是？",
            options: [
                ("打他脚下！让他难受", Answer::A),
                ("直接暴抽，看他敢不敢挡", Answer::B),
                ("挑高球过顶，羞辱他", Answer::C),
                ("完了，我要被截死了", Answer::D),
            ],
        },
        Question {
            id: 2,
            text: "你的发球风格更接近？",
            options: [
                ("弓箭 —— 精准落点，软绵绵", Answer::A),
                ("加农炮 —— 轰就完了，进不进看命", Answer::B),
                ("回旋镖 —— 带奇怪旋转", Answer::C),
                ("玩具水枪 —— 纯属走过场", Answer::D),
            ],
        },
        Question {
            id: 3,
            text: "打出制胜分后，你的反应像？",
            options: [
                ("消音器 —— 面无表情", Answer::A),
                ("战鼓 —— 大喊 come on", Answer::B),
                ("狙击镜 —— 冷冷瞄一眼对手", Answer::C),
                ("自拍杆 —— 确认观众看见没", Answer::D),
            ],
        },
        Question {
            id: 4,
            text: "你最烦哪种对手？",
            options: [
                ("乌龟壳 —— 月亮球磨教", Answer::A),
                ("链锤 —— 网前截击怪", Answer::B),
                ("判官笔 —— 总喊 out 的较真狂", Answer::C),
                ("教书先生 —— 打完还分析你", Answer::D),
            ],
        },
        Question {
            id: 5,
            text: "约球时你的首选？",
            options: [
                ("固定剑鞘 —— 老搭档，越熟越好", Answer::A),
                ("试刀石 —— 越强越爽", Answer::B),
                ("磨刀石 —— 越菜越爽，我要虐", Answer::C),
                ("随缘口袋 —— 有局就行", Answer::D),
            ],
        },
        Question {
            id: 6,
            text: "失误下网后第一反应？",
            options: [
                ("检讨自己操之过急", Answer::A),
                ("网太高了/球压不够", Answer::B),
                ("球没气了", Answer::C),
                ("对面用暗器", Answer::D),
            ],
        },
        Question {
            id: 7,
            text: "你最爽的得分方式？",
            options: [
                ("磨到对手自爆", Answer::A),
                ("正手直线 一锤定音", Answer::B),
                ("放小球+挑高球 耍猴", Answer::C),
                ("对手双误 白捡", Answer::D),
            ],
        },
        Question {
            id: 8,
            text: "网球穿搭理念？",
            options: [
                ("纯白军刀 —— 传统即正义", Answer::A),
                ("荧光铠甲 —— 全场焦点", Answer::B),
                ("睡衣软甲 —— 舒服就行", Answer::C),
                ("全副武装 —— 发带护腕不能少", Answer::D),
            ],
        },
        Question {
            id: 9,
            text: "你的秘密武器（最爱用）？",
            options: [
                ("匕首 —— 削球，让对手弯腰", Answer::A),
                ("攻城锤 —— 平击暴抽", Answer::B),
                ("流星锤 —— 月亮球高到仰头", Answer::C),
                ("空手道 —— 等对方失误", Answer::D),
            ],
        },
        Question {
            id: 10,
            text: "关键分 40:30，你更想？",
            options: [
                ("让对手先出招", Answer::A),
                ("自己发球掌握主动", Answer::B),
                ("用切削变节奏", Answer::C),
                ("求求别让我跑对角线", Answer::D),
            ],
        },
        Question {
            id: 11,
            text: "双打队友双误送掉破发点，你？",
            options: [
                ("拍肩说没事", Answer::A),
                ("叹气但沉默", Answer::B),
                ("\"你累了换我守底线？\"", Answer::C),
                ("内心拉黑，永世不搭", Answer::D),
            ],
        },
        Question {
            id: 12,
            text: "热身拉球的态度？",
            options: [
                ("认真校准武器", Answer::A),
                ("随便晃晃，反正正式也丢", Answer::B),
                ("主要是在秀动作", Answer::C),
                ("热什么身，直接干", Answer::D),
            ],
        },
        Question {
            id: 13,
            text: "你的球路动物（本命兵种）？",
            options: [
                ("蛇刃 —— 刁钻阴柔", Answer::A),
                ("野马战锤 —— 冲起来拦不住", Answer::B),
                ("铁龟盾 —— 稳但慢", Answer::C),
                ("灵猴双钩 —— 跳来跳去不消停", Answer::D),
            ],
        },
        Question {
            id: 14,
            text: "双打对你来说更像？",
            options: [
                ("双剑合璧 —— 容易吵架", Answer::A),
                ("加厚盾牌 —— 有人补位摸鱼", Answer::B),
                ("蹲坑弩 —— 网前可怕，蹲底线", Answer::C),
                ("军棋推演 —— 真正的战术艺术", Answer::D),
            ],
        },
        Question {
            id: 15,
            text: "打完球最常做的事？",
            options: [
                ("立刻复盘 哪个零件坏了", Answer::A),
                ("拍照晒兵器", Answer::B),
                ("找水喝", Answer::C),
                ("默默收刀走人", Answer::D),
            ],
        },
        Question {
            id: 16,
            text: "被人夸进步了，你？",
            options: [
                ("还差得远", Answer::A),
                ("那当然，练了很久", Answer::B),
                ("你是不是对进步有误解", Answer::C),
                ("请喝饮料，求多夸几句", Answer::D),
            ],
        },
    ]
}
