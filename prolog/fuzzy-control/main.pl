:- consult('rules.pl').
:- consult('degree_curves.pl').
:- consult('reasoning.pl').

main(FileName) :-
    open(FileName, read, Stream),
    process_input(Stream),
    close(Stream).

process_input(Stream) :-
    read_line_to_string(Stream, Question),
    (Question == end_of_file ->
        !;
        read_line_to_string(Stream, MoodAnswerString),
        (MoodAnswerString == end_of_file ->
            !;
            atom_number(MoodAnswerString, MoodInput),
            read_line_to_string(Stream, GiftQuestion),
            read_line_to_string(Stream, GiftAnswerString),
            (GiftAnswerString == end_of_file ->
                !;
                atom_number(GiftAnswerString, GiftInput),
                validate_and_process(MoodInput, GiftInput),
                process_input(Stream)
            )
        )
    ).


validate_and_process(MoodInput, GiftInput) :-
    MoodInput >= 0, MoodInput =< 10, 
    GiftInput >= 0, GiftInput =< 10,
    aggregate_consequents(MoodInput, GiftInput, 0, [], AggregatedCurve),
    defuzzify(AggregatedCurve, RecommendedReward),
    format('Recommended Reward: ~2f points~n', [RecommendedReward]), nl.

