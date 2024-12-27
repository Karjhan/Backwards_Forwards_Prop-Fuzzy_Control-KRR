:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).

:- ensure_loaded('fuzzy-control/main.pl').

:- debug(http_request).

% Define HTTP handlers
:- http_handler('/echo', handle_echo, []).
:- http_handler('/fuzzy-control', handle_solve_fuzzy_control, []).

% Start the server
server(Port) :-
    http_server(http_dispatch, [port(Port)]).

% Handle JSON echo request
handle_echo(Request) :-
    debug(http_request, 'Full HTTP request: ~w', [Request]),
    (   catch(http_read_json_dict(Request, Dict), Error, (reply_error(Error), fail))
    ->  debug(http_request, 'Parsed JSON: ~w', [Dict]),
        reply_json_dict(_{status: "success", echo: Dict})
    ;   debug(http_request, 'Failed to parse JSON', []),
        fail
    ).

% Handle fuzzy control logic request
handle_solve_fuzzy_control(Request) :-
    debug(http_request, 'Full HTTP request: ~w', [Request]),
    (   catch(http_read_json_dict(Request, Dict), Error, (reply_error(Error), fail))
    ->  debug(http_request, 'Parsed JSON: ~w', [Dict]),
        % Extract the file name from the request
        _{fileName: FileName} :< Dict,
        % Call main and capture its output
        (   process_fuzzy_logic(FileName, Output)
        ->  reply_json_dict(_{status: "success", result: Output})
        ;   reply_json_dict(_{status: "error", message: "Failed to process file."})
        )
    ;   reply_json_dict(_{status: "error", message: "Invalid JSON input."})
    ).

process_fuzzy_logic(FileName, Output) :-
    debug(http_request, 'Checking file existence: ~w', [FileName]),
    (   exists_file(FileName)
    ->  debug(http_request, 'File exists: ~w', [FileName]),
        % Try to run the main logic and capture output
        catch(
            with_output_to(string(Output),
                (   debug(http_request, 'Calling main/1 with file: ~w', [FileName]),
                    main(FileName)
                )
            ),
            Error,
            (   message_to_string(Error, ErrorMessage),
                format('Error processing file: ~w~n', [ErrorMessage]),
                fail
            )
        )
    ;   debug(http_request, 'File does not exist: ~w', [FileName]),
        Output = "File does not exist."
    ).



% Generic error response
reply_error(Error) :-
    message_to_string(Error, Message),
    reply_json_dict(_{status: "error", message: Message}).
