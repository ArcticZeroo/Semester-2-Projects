// ConsoleApplication2.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>

int readNumber();
int writeAnswer(int input){};

int main()
{
	int num1 = readNumber();
	int num2 = readNumber();

	int solution = num1 + num2;
	
	writeAnswer(solution);
	
	return 0;
}

