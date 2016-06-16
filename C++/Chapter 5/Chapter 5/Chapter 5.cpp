// Chapter 5.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include <string>
#include <cstdlib>
#include <ctime>

//5.3
int calculate() {
	std::cout << "Please enter the first integer: ";
	int first;
	std::cin >> first;

	std::cout << "Please enter the second integer: ";
	int second;
	std::cin >> second;

	std::cout << "Please enter the operator: ";
	char operand;
	std::cin >> operand;

	switch (operand) {
		case '*':
			return first * second;
			break;
		case '%':
			return first % second;
			break;
		case '/':
			return first / second;
			break;
		case '+':
			return first + second;
			break;
		case '-':
			return first - second;
			break;
	}
}
enum class Animal {
	PIG,
	CHICKEN,
	GOAT,
	CAT,
	DOG,
	OSTRICH
};
std::string getAnimalName(Animal animal) {
	switch (animal) {
		case(Animal::PIG) :
			return "pig";
			break;
		case(Animal::CHICKEN) :
			return "chicken";
			break;
		case(Animal::GOAT) :
			return "goat";
			break;
		case(Animal::CAT) :
			return "cat";
			break;
		case(Animal::DOG) :
			return "dog";
			break;
		case(Animal::OSTRICH) :
			return "ostrich";
			break;
		default:
			return "unknown animal";
			break;
	}
}
void printNumberOfLegs(Animal animal) {
	int numLegs;

	switch (animal) {
	case(Animal::PIG) :
	case(Animal::GOAT) :
	case(Animal::CAT) :
	case(Animal::DOG) :
		numLegs = 4;
		break;
	case(Animal::CHICKEN) :
	case(Animal::OSTRICH) :
		numLegs = 2;
		break;
	default:
		numLegs = 0;
		break;
	}

	std::cout << "A " << getAnimalName(animal) << " has " << numLegs << " legs.\n";

}

//5.5
void pyramid() {
	int outer = 1;
	while (outer <= 5) {
		int inner = 5;
		while (inner >= 1) {
			if (inner <= outer) {
				std::cout << inner << " ";
			}
			else {
				std::cout << "  ";
			}
			--inner;
		}
		std::cout << "\n";
		++outer;
	}
}

//5.4
void goToTest() {
	double number;
nonNeg:
	std::cout << "Please enter a non-negative number: ";
	std::cin >> number;
	if (number < 0.0) {
		std::cout << "You entered a negative number, Bad!\n";
		goto nonNeg;
	}
}

//5.7
void forTest() {
	for (int i = 0; i <= 20; i += 2) {
		std::cout << i << " ";
	}
}
int sumTo(int value) {
	int total = 0;
	for (int count = 1; count <= value; count++) {
		total += count;
	}
	return total;
}

//5.9
int getRandomInt(int min, int max) {
	srand(static_cast<unsigned int>(time(0)));
	
	static const double fraction = 1.0 / (static_cast<double>(RAND_MAX) + 1.0);
	
	return static_cast<int>(rand() * fraction * (max-min + 1) + min);
}

int main()
{
	//std::cout << calculate() << "\n";
	//printNumberOfLegs(Animal::CAT);
	//printNumberOfLegs(Animal::CHICKEN);
	//pyramid();
	//forTest();
	//std::cout << sumTo(5) << "\n";

	return 0;
}

