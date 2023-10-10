const { log } = require('console');
const crypto = require('crypto');
const { createHmac } = require('node:crypto');
const prompt = require('prompt-sync')();


class Help {
    static rules;
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
    static getHelpTable() {
        console.log('-------------------------ПРАВИЛА-------------------------');
        for (let rule of this.rules) {
            console.table(rule);
        }
    }
}

class MyCypher {
    static sourceKeys = [];
    static HMACs = [];
    static makeSourceKey() {
        const hash = crypto.createHash("SHA3-256");
        const sourceKey = hash.update(String(Math.random()) + String(Math.random())).digest("hex"); 
        this.sourceKeys.push(sourceKey);
        this.makeHMAC(sourceKey);
    }

    static makeHMAC(sourceKey) {
        const HMAC = createHmac('sha256', sourceKey).digest('hex');
        this.HMACs.push(HMAC);
    }
}

class Bot {
    static moves = [];
    static currentTurn = 0;
    static makeMove(args) {
        this.currentTurn+=1;
        let botChoose = Math.floor(Math.random() * args.length);
        MyCypher.makeSourceKey();
        this.moves.push(botChoose);
    }
}

const game = (args) => {
    Help.setRules(args);
    while (true) {
        Bot.makeMove(args);
        console.log('HMAC: ' + MyCypher.HMACs[Bot.currentTurn - 1]);
        console.log('Available moves:');
        for (let arg of args) {
            console.log((args.indexOf(arg) + 1) + ' - ' + arg);
        }
        console.log('0 - exit\n? - help');
        let yourMove;
        while (true) {
            yourMove = prompt('Enter your move: ');
            if (yourMove == '?'){
                Help.getHelpTable();
                continue;
            }
            if ( (Number.isInteger(Number(yourMove)) && parseInt(yourMove) >= 0 && parseInt(yourMove) <= args.length) || yourMove == '?')
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
            if (Help.rules[parseInt(yourMove) - 1][yourMovearg][botMoveArg] == 'Win'){
                console.log('You win!');
            }
            else if(Help.rules[parseInt(yourMove) - 1][yourMovearg][botMoveArg] == 'Lose'){
                console.log('You lose(');
            }
            else{
                console.log('It\'s draw.');
                console.log(Help.rules[parseInt(yourMove) - 1][yourMovearg][botMoveArg]);
            }
            console.log('Source key: ' + MyCypher.sourceKeys[Bot.currentTurn - 1]);
            console.log('-------------------------------------------');
        }
    }

}

if (process.argv.length <= 4) {
    console.log('Недостаточно аргументов');
}
else {
    if (process.argv.length % 2 == 0)
        console.log('Введите нечетное количество аргументов');
    else {
        const duplicates = process.argv.slice(2).filter((number, index, numbers) => {
            return numbers.indexOf(number) == index;
        });
        if (duplicates.length == process.argv.slice(2).length)
            game(process.argv.slice(2));
        else
            console.log('Введите неповторяющиеся аргументы');
    }
}