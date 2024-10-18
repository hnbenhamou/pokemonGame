const axios = require('axios');
const inquirer = require('inquirer');

const API_BASE_URL = 'https://pokeapi.co/api/v2';

async function getPokemonList(limit = 10) {
    const response = await axios.get(`${API_BASE_URL}/pokemon?limit=${limit}`);
    return response.data.results;
}

async function getPokemonDetails(name) {
    const response = await axios.get(`${API_BASE_URL}/pokemon/${name}`);
    return response.data;
}


async function selectPokemon() {
    const pokemonList = await getPokemonList(10);
    const { chosenPokemon } = await inquirer.prompt({
        type: 'list',
        name: 'chosenPokemon',
        message: 'Choose your Pokémon:',
        choices: pokemonList.map(p => p.name)
    });
    
    return getPokemonDetails(chosenPokemon);
}


class Player {
    constructor(pokemon) {
        this.pokemon = pokemon;
        this.hp = 300;
        this.moves = pokemon.moves.slice(0, 5);  // Limit to 5 moves
    }

    chooseMove() {
        return inquirer.prompt({
            type: 'list',
            name: 'move',
            message: `Choose a move for ${this.pokemon.name}:`,
            choices: this.moves.map(move => move.move.name)
        });
    }
}

class Bot {
    constructor(pokemon) {
        this.pokemon = pokemon;
        this.hp = 300;
        this.moves = pokemon.moves.slice(0, 5);
    }

    chooseMove() {
        const randomMoveIndex = Math.floor(Math.random() * this.moves.length);
        return this.moves[randomMoveIndex].move.name;
    }
}


async function battle(player, bot) {
    let playerTurn = true;
    
    while (player.hp > 0 && bot.hp > 0) {
        if (playerTurn) {
            // Player's turn
            const { move } = await player.chooseMove();
            const selectedMove = player.pokemon.moves.find(m => m.move.name === move);
            const moveDetails = await axios.get(selectedMove.move.url);
            const power = moveDetails.data.power || 10;  // Default power if not available
            const accuracy = moveDetails.data.accuracy || 100;

            // Random accuracy check
            if (Math.random() * 100 <= accuracy) {
                console.log(`${player.pokemon.name} used ${move} and dealt ${power} damage!`);
                bot.hp -= power;
            } else {
                console.log(`${player.pokemon.name}'s move missed!`);
            }

        } else {
            // Bot's turn
            const move = bot.chooseMove();
            const selectedMove = bot.pokemon.moves.find(m => m.move.name === move);
            const moveDetails = await axios.get(selectedMove.move.url);
            const power = moveDetails.data.power || 10;
            const accuracy = moveDetails.data.accuracy || 100;

            if (Math.random() * 100 <= accuracy) {
                console.log(`Bot's ${bot.pokemon.name} used ${move} and dealt ${power} damage!`);
                player.hp -= power;
            } else {
                console.log(`Bot's ${bot.pokemon.name}'s move missed!`);
            }
        }
        
        console.log(`Player HP: ${player.hp}, Bot HP: ${bot.hp}`);
        playerTurn = !playerTurn;
    }
    
    if (player.hp <= 0) {
        console.log('You lost!');
    } else {
        console.log('You won!');
    }
}


async function runGame() {
    const playerPokemon = await selectPokemon();
    const botPokemon = await getPokemonDetails('pikachu'); // Random bot Pokémon

    const player = new Player(playerPokemon);
    const bot = new Bot(botPokemon);

    console.log('Starting battle...');
    await battle(player, bot);
}

runGame();
