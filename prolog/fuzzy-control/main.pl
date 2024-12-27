% Load the necessary files
:- consult('rules.pl').
:- consult('degree_curves.pl').
:- consult('reasoning.pl').

% Main program logic
main(FileName) :-
    % Open the input file
    open(FileName, read, Stream),
    process_input(Stream),
    close(Stream).

% Base case: end of file
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


% Validate the input and calculate the reward
validate_and_process(MoodInput, GiftInput) :-
    MoodInput >= 0, MoodInput =< 10, % Ensure valid range for mood
    GiftInput >= 0, GiftInput =< 10, % Ensure valid range for gift
    aggregate_consequents(MoodInput, GiftInput, 0, [], AggregatedCurve),
    defuzzify(AggregatedCurve, RecommendedReward),
    format('Recommended Reward: ~2f points~n', [RecommendedReward]), nl.

