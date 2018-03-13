/**
 * Traverse backward in history
 */
function goUp(event) {
    if (event.key === 'ArrowUp') {
        event.preventDefault();

        if (commandHistoryUp.length !== 0) {
            let $input = $('input');
            let currentText = $input.val();
            let $inputSpan = $terminal.find('div').find('p').last().find('span').first();
            let command = commandHistoryUp.pop();

            commandHistoryDown.push(currentText);
            $inputSpan.html(command);
            $input.val(command);

            focus();
        } else {
            terminal.beep();
        }
    }
}

/**
 * Traverse forward in history
 */
function goDown(event) {
    if (event.key === 'ArrowDown') {
        event.preventDefault();

        if (commandHistoryDown.length !== 0) {
            let $input = $('input');
            let currentText = $input.val();
            let $inputSpan = $terminal.find('div').find('p').last().find('span').first();
            let command = commandHistoryDown.pop();

            commandHistoryUp.push(currentText);
            $inputSpan.html(command);
            $input.val(command);

            focus();
        } else {
            terminal.beep();
        }
    }
}

function autoComplete(event) {
    if (event.key === 'Tab') {
        event.preventDefault();

        let $input = $('input');
        let currentText = $input.val();
        let $inputSpan = $terminal.find('div').find('p').last().find('span').first();

        let matches = [];
        for (let i = 0; i < allowedCommands.length; i++) {
            let allowedCommand = allowedCommands[i];
            if (allowedCommand['mean'].startsWith(currentText)) {
                matches.push(allowedCommand);
            }
        }

        if (matches.length !== 1) {
            terminal.beep();
        }
        if (matches.length > 1) {
            let string = matches.map((element) => element['show']).join(separator);
            printLine(string);
        }
        if (matches.length === 1) {
            let command = matches[0]['mean'];
            $inputSpan.html(command);
            $input.val(command);

            focus();
        }
    }
}