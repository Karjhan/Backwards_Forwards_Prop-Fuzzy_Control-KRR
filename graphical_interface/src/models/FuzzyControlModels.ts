export interface PredicateResponse{
    predicateName: string,
    functionRange: Array<number>
    curves: Array<DegreeCurve>
}

export interface DegreeCurve{
    baseFunctionName: string,
    rules: Array<DegreeCurveRule>
}

export interface DegreeCurveRule{
    range: string,
    degree: string
}

export interface Rule{
    operator: string,
    conditions: Array<RuleTerm>,
    result: RuleTerm
}

export interface RuleTerm{
    term: string,
    value: string
}

export interface ResolutionPayload{
    answers: Array<Answer>
}

export interface Answer{
    question: string,
    answer: string
}

export interface FuzzyControlResponse{
    defuzzifyingCurve: Array<Array<number>>,
    numerator: number,
    denominator: number,
    rewardScore: number,
    status: string
}