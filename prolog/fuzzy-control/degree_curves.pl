% "SANTA_MOOD" - Degree curves for "Santa_mood" predicate with values between (0,10)
grumpy(X, Degree) :- X >= 0, X =< 4, Degree is 1 - X / 4.
grumpy(X, 0) :- X > 4.

cheerful(X, Degree) :- X > 3, X =< 7, Degree is (X - 3) / 4.
cheerful(X, 0) :- X =< 3; X > 7.

jolly(X, Degree) :- X > 6, X =< 10, Degree is (X - 6) / 4.
jolly(X, 0) :- X =< 6.

% "GIFT_QUALITY" - Degree curves for "gift_quality" predicate with values between (0,10)
shabby(X, Degree) :- X >= 0, X =< 3, Degree is 1 - X / 3.
shabby(X, 0) :- X > 3.

decent(X, Degree) :- X >= 3, X < 5, Degree is (X - 3) / 2.
decent(X, Degree) :- X >= 5, X =< 7, Degree is (7 - X) / 2.
decent(X, 0) :- X < 3.
decent(X, 0) :- X > 7.

amazing(X, Degree) :- X > 7, X =< 10, Degree is (X - 7) / 3.
amazing(X, 0) :- X =< 7.

% "REWARD" - Degree curves for "reward" predicate with values between (0,20)
coal(X, Degree) :- X >= 0, X =< 8, Degree is 1 - X / 8.
coal(X, 0) :- X > 8.

moderate(X, Degree) :- X > 6, X =< 16, Degree is (X - 6) / 10.
moderate(X, 0) :- X =< 6; X > 16.

generous(X, Degree) :- X > 12, X =< 20, Degree is (X - 12) / 8.
generous(X, 0) :- X =< 12.
