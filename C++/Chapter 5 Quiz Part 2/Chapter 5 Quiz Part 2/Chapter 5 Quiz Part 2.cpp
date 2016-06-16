// Chapter 5 Quiz Part 2.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include <cstdlib>
#include <ctime>

int getRandomInt(int min, int max) {

	static const double fraction = 1.0 / (static_cast<double>(RAND_MAX) + 1.0);

	return static_cast<int>(rand() * fraction * (max - min + 1) + min);
}

int main()
{
	srand(static_cast<unsigned int>(time(0)));
	rand();

	game:

		int computerNumber = getRandomInt(1, 100);

		std::cout << "Let's play a game. I'm thinking of a number between 1 and 100. You have 7 tries to guess what it is.\n";

		for (int guess = 1; guess <= 7; guess++) {
			std::cout << "Guess #" << guess << ": ";
		
			int userGuess;
		
			std::cin >> userGuess;

			if (userGuess == computerNumber) {
				std::cout << "Your guess was correct! You win!\n";
				break;
			}else if(userGuess > computerNumber){
				std::cout << "Your guess was too high. Try again.\n";
			}else if (userGuess < computerNumber) {
				std::cout << "Your guess was too low. Try again\n";
			}else {
				std::cout << "I'm not sure what that means. Try again\n";
			}
		}

	playAgain:
		std::cout << "Would you like to play again? (y/n) ";
		char answer;
		std::cin >> answer;
		if (answer != 'y' && answer != 'n') {
			std::cout << "You entered an incorrect input.\n";
			goto playAgain;
		}
		else if (answer == 'y') {
			goto game;
		}
		else if (answer == 'n') {
			std::cout << "Thanks for playing!";
		}

    return 0;
}

