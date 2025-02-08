load_kb(File, KB) :-
    writeln(['Opening file:', File]),
    open(File, read, Stream),
    read_kb(Stream, KB),
    close(Stream).

read_kb(Stream, []) :-
    at_end_of_stream(Stream).
read_kb(Stream, [Clause | KB]) :-
    read(Stream, Clause),
    read_kb(Stream, KB).

negation(n(Goal), Goal) :- !.
negation(Goal, n(Goal)).

ask_questions(File, KB, UpdatedKB) :-
    open(File, read, Stream),
    read_answers(Stream, KB, UpdatedKB),
    close(Stream).

read_answers(Stream, KB, UpdatedKB) :-
    read_line_to_string(Stream, Position),
    read_line_to_string(Stream, DonationsStr),
    number_string(Donations, DonationsStr), 
    read_line_to_string(Stream, BillsStr),
    number_string(Bills, BillsStr),
    read_line_to_string(Stream, Family),
    read_line_to_string(Stream, ActiveYearsStr),
    number_string(ActiveYears, ActiveYearsStr), 
    determine_facts(Position, Donations, Bills, Family, ActiveYears, KB, UpdatedKB).

determine_facts(Position, Donations, Bills, Family, ActiveYears, KB, UpdatedKB) :-
    downcase_atom(Position, PositionLower),
    (   member(PositionLower, ['senator', 'governor', 'mayor'])
    ->  UpdatedKB1 = [[high_rank] | KB]
    ;   UpdatedKB1 = [[n(high_rank)] | KB]
    ),

    (   Donations > 1000000
    ->  UpdatedKB2 = [[donations_more_than_one_million] | UpdatedKB1]
    ;   UpdatedKB2 = [[n(donations_more_than_one_million)] | UpdatedKB1]
    ),

    (   Bills > 3
    ->  UpdatedKB3 = [[authored_bills_more_than_three] | UpdatedKB2]
    ;   UpdatedKB3 = [[n(authored_bills_more_than_three)] | UpdatedKB2]
    ),

    downcase_atom(Family, FamilyLower),
    (   FamilyLower == 'yes'
    ->  UpdatedKB4 = [[old_family] | UpdatedKB3]
    ;   UpdatedKB4 = [[n(old_family)] | UpdatedKB3]
    ),

    (   ActiveYears > 10
    ->  UpdatedKB = [[active_years_more_than_10] | UpdatedKB4]
    ;   UpdatedKB = [[n(active_years_more_than_10)] | UpdatedKB4]
    ).

solve(KB, Goal, GoalList) :-
    negation(NegatedGoal, Goal),
    (   member([NegatedGoal], KB)
    ->  
        fail
    ;   
        member([Goal], KB)
    ->  
        true
    ;   
        member([Goal | Body], KB)
    ->  
        solve_all(KB, Body, [Goal | GoalList])
    ;   
        fail
    ).

solve_all(_, [], _) :-
    true.

solve_all(KB, [SubGoal | Rest], GoalList) :-
    (   negation(SubGoal, NegatedGoal)
    ->  solve(KB, NegatedGoal, [SubGoal | GoalList])  
    ;   
        solve(KB, SubGoal, GoalList)
    ),
    solve_all(KB, Rest, GoalList).

forward_chain(KB, Goal) :-
    forward_chain(KB, Goal, [], [], SolvedFacts),
    (   member(Goal, SolvedFacts)
    ->  writeln('The politician is an establishment figure.')
    ;   writeln('The politician is not an establishment figure.')).

forward_chain(KB, Goal, Solved, LastAttempted, Result) :-
    (   select(Rule, KB, KBRest),
        check_rule(Rule, Solved, SolvedFact),
        \+ member(SolvedFact, Solved),
        cleanup_kb(SolvedFact, KBRest, CleanedKB),
        forward_chain(CleanedKB, Goal, [SolvedFact | Solved], [SolvedFact | LastAttempted], Result)
    ;   LastAttempted == Solved, 
        Result = Solved).

check_rule([Fact], Solved, Fact) :-
    \+ member(n(Fact), Solved).
check_rule([Fact | Conditions], Solved, Fact) :-
    \+ member(n(Fact), Solved),
    all_conditions_satisfied(Conditions, Solved).

cleanup_kb(SolvedFact, KB, CleanedKB) :-
    exclude(rule_contains(SolvedFact), KB, CleanedKB1),
    maplist(remove_negation(SolvedFact), CleanedKB1, CleanedKB).

rule_contains(Fact, Rule) :-
    member(Fact, Rule).

remove_negation(SolvedFact, Rule, CleanedRule) :-
    exclude(==(n(SolvedFact)), Rule, CleanedRule).

all_conditions_satisfied([], _).
all_conditions_satisfied([n(Condition) | Rest], Solved) :-
    member(Condition, Solved),
    all_conditions_satisfied(Rest, Solved).
all_conditions_satisfied([Condition | Rest], Solved) :-
    member(Condition, Solved),
    all_conditions_satisfied(Rest, Solved).

run_backward(InputFilePath, RulesFilePath) :-
    load_kb(RulesFilePath, KB),
    ask_questions(InputFilePath, KB, UpdatedKB),
    (   solve(UpdatedKB, establishment_figure, [])
    ->  writeln('The politician is an establishment figure.')
    ;   writeln('The politician is not an establishment figure.')).

run_forward(InputFilePath, RulesFilePath) :-
    load_kb(RulesFilePath, KB),
    ask_questions(InputFilePath, KB, UpdatedKB),
    forward_chain(UpdatedKB, establishment_figure),
    writeln('Type "stop" to exit or press Enter to continue.'),
    writeln('Forward chaining completed.').

start_process(InputFilePath, RulesFilePath, Method) :-
    downcase_atom(Method, MethodLower),
    (   MethodLower == backward
    ->  run_backward(InputFilePath, RulesFilePath)
    ;   MethodLower == forward
    ->  run_forward(InputFilePath, RulesFilePath)
    ;   writeln('Invalid method. Use "backward" or "forward".')).
