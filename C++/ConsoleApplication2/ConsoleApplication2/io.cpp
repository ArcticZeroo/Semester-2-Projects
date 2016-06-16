#include "stdafx.h"
#include <iostream>

int readNumber() {
	std::cout << "Please enter a number" << std::endl;
	int response;
	std::cin >> response;
	return response;
}

void writeAnswer(int input) {
	std::cout << "The answer is " << input << std::endl;
}

