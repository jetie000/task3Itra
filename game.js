const { log } = require('console');
const crypto = require('crypto');
const { createHmac } = require('node:crypto');
const prompt = require('prompt-sync')();


class Help {
    static rules;
    static helpTable = '';
    static setRules(args) {
        this.rules = args.map(arg => {
            let rule = {};
            args.forEach((element, index) => {
                let indexEl = index;
                if (indexEl < args.indexOf(arg))
                    indexEl += args.length;
                if (index == args.indexOf(arg))
                    rule[element] = 'Draw';
                else
                    if (indexEl < args.indexOf(arg) + args.length / 2)
                        rule[element] = 'Win';
                    else
                        rule[element] = 'Lose';
            });
            return { [arg]: rule };
        })
    }
    static setHelpTable() {
        let helpTable = '';
        let lineRow = '+-------------+';
        let headRow = '| v User\\PC > |'
        for (let rule of this.rules) {
            for (let ruleArg in rule) {
                for (let matchUp in rule[ruleArg]) {
                    if (matchUp.length >= 4){
                        headRow += ' ' + matchUp + ' |';
                        lineRow += '-'.repeat(matchUp.length + 2) + '+';
                    }
                    else{
                        headRow += ' ' + matchUp + ' '.repeat(5 - ruleArg.length) + '|';
                        lineRow += '-'.repeat(6) + '+';
                    }
                }
                break;
            }
            break;
        }
        lineRow += '\n';
        headRow += '\n';
        helpTable += lineRow + headRow + lineRow;
        for (let rule of this.rules) {
            for (let ruleArg in rule) {
                helpTable += '| ' + ruleArg + ' '.repeat(12 - ruleArg.length) + '|';
                for (let matchUp in rule[ruleArg]) {
                    if (matchUp.length >= 4)
                        helpTable += ' ' + rule[ruleArg][matchUp] + ' '.repeat(matchUp.length - rule[ruleArg][matchUp].length) + ' |';
                    else
                        helpTable += ' ' + rule[ruleArg][matchUp] +' '.repeat(4-rule[ruleArg][matchUp].length)+ ' |';
                }
                helpTable+='\n';
            }
            helpTable += lineRow;
        }
        this.helpTable = helpTable;
    }
}

class MyCypher {
    static sourceKeys = [];
    static HMACs = [];
    static makeSourceKey(botArg) {
        const myArray = new Uint8Array(64);
        crypto.getRandomValues(myArray);
        let sourceKey = "";
        for(let element of myArray){
            sourceKey = sourceKey.concat(element.toString(16)[0]);
        }
        // const sourceKey = crypto.generateKeySync('hmac', { length: 256 }).export().toString('hex');
        this.sourceKeys.push(sourceKey);
        this.makeHMAC(sourceKey, botArg);
    }

    static makeHMAC(sourceKey, botArg) {
        const HMAC = createHmac('sha256', sourceKey).update(botArg).digest('hex');
        this.HMACs.push(HMAC);
    }
}

class Bot {
    static moves = [];
    static currentTurn = 0;
    static makeMove(args) {
        this.currentTurn += 1;
        let botChoose = Math.floor(Math.random() * args.length);
        MyCypher.makeSourceKey(args[botChoose]);
        this.moves.push(botChoose);
    }
}

const game = (args) => {
    Help.setRules(args);
    while (true) {
        Bot.makeMove(args);
        Help.setHelpTable();
        console.log('HMAC: ' + MyCypher.HMACs[Bot.currentTurn - 1]);
        console.log('Available moves:');
        for (let arg of args) {
            console.log((args.indexOf(arg) + 1) + ' - ' + arg);
        }
        console.log('0 - exit\n? - help');
        let yourMove;
        while (true) {
            yourMove = prompt('Enter your move: ');
            if (yourMove == '?') {
                console.log(Help.helpTable);
                continue;
            }
            if ((Number.isInteger(Number(yourMove)) && parseInt(yourMove) >= 0 && parseInt(yourMove) <= args.length) || yourMove == '?')
                break;
            console.log('Enter is not valid.');
        }
        if (yourMove == '0')
            return;
        else {
            let yourMovearg = args[parseInt(yourMove) - 1];
            let botMoveArg = args[Bot.moves[Bot.currentTurn - 1]];
            console.log("Your move: " + yourMovearg);
            console.log("Computer move: " + botMoveArg);
            if (Help.rules[parseInt(yourMove) - 1][yourMovearg][botMoveArg] == 'Win') {
                console.log('You win!');
            }
            else if (Help.rules[parseInt(yourMove) - 1][yourMovearg][botMoveArg] == 'Lose') {
                console.log('You lose(');
            }
            else {
                console.log('It\'s draw.');
            }
            console.log('Source key: ' + MyCypher.sourceKeys[Bot.currentTurn - 1]);
            console.log('-------------------------------------------');
        }
    }

}

if (process.argv.length <= 4) {
    console.log('Error: not enough arguments');
}
else {
    if (process.argv.length % 2 == 0)
        console.log('Error: enter an odd number of arguments');
    else {
        const duplicates = process.argv.slice(2).filter((number, index, numbers) => {
            return numbers.indexOf(number) == index;
        });
        if (duplicates.length == process.argv.slice(2).length)
            game(process.argv.slice(2));
        else
            console.log('Error: enter non-repeating arguments');
    }
}