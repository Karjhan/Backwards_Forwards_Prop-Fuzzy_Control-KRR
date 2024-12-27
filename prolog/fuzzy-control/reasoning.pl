% Evaluate the antecedents of a rule
evaluate_antecedent([mood/Predicate], Mood, _Gift, Degree) :-
    call(Predicate, Mood, Degree).
evaluate_antecedent([gift/Predicate], _Mood, Gift, Degree) :-
    call(Predicate, Gift, Degree).
evaluate_antecedent([or, [Cond1, Cond2]], Mood, Gift, Degree) :-
    evaluate_antecedent([Cond1], Mood, Gift, Degree1),
    evaluate_antecedent([Cond2], Mood, Gift, Degree2),
    Degree is max(Degree1, Degree2).
evaluate_antecedent([and, [Cond1, Cond2]], Mood, Gift, Degree) :-
    evaluate_antecedent([Cond1], Mood, Gift, Degree1),
    evaluate_antecedent([Cond2], Mood, Gift, Degree2),
    Degree is min(Degree1, Degree2).

% Evaluate the consequents of a rule
evaluate_consequent([reward/Predicate], Degree, Reward, OutputDegree) :-
    call(Predicate, Reward, PredicateDegree),
    OutputDegree is min(Degree, PredicateDegree).

% Aggregate the degree curves for the reward
aggregate_consequents(_, _, 20, AggregatedCurve, AggregatedCurve) :- !.
aggregate_consequents(Mood, Gift, Reward, CurrentCurve, AggregatedCurve) :-
    findall(Degree,
        (rule([Connective, Conditions, [reward/Predicate]]),
         evaluate_antecedent([Connective, Conditions], Mood, Gift, AntecedentDegree),
         evaluate_consequent([reward/Predicate], AntecedentDegree, Reward, Degree)),
        Degrees),
    max_list(Degrees, MaxDegree),
    NewCurve = [(Reward, MaxDegree) | CurrentCurve],
    NextReward is Reward + 1,
    aggregate_consequents(Mood, Gift, NextReward, NewCurve, AggregatedCurve).

% Defuzzification (center of area)
defuzzify(Curve, Reward) :-
    write('Defuzzifying curve: '), write(Curve), nl,
    findall(N, (member((X, Degree), Curve), N is X * Degree), NumeratorList),
    findall(D, member((_, D), Curve), DenominatorList),
    sumlist(NumeratorList, Numerator),
    sumlist(DenominatorList, Denominator),
    write('Numerator = '), write(Numerator), write(', Denominator = '), write(Denominator), nl,
    (Denominator =:= 0 -> Reward is 0; Reward is Numerator / Denominator),
    write('Defuzzified Reward = '), write(Reward), nl.
